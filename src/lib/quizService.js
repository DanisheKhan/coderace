import { supabase } from './supabase';

/**
 * Categorize a question based on its text/category attributes.
 */
export const deriveQuestionCategory = (q) => {
  if (q.category && typeof q.category === 'string' && q.category.trim() !== '') {
    return q.category.trim();
  }

  const text = `${q.question_text || q.question || ''} ${q.explanation || ''}`.toLowerCase();

  if (/thread|runnable|synchroniz|volatile|lock|concurren|executor|deadlock|countdownlatch|cyclicbarrier|semaphore|phaser|virtual thread/.test(text)) {
    return 'Multithreading & Concurrency';
  }
  if (/list|map|set|hashmap|arraylist|collection|queue|deque|iterator|treemap|hashset|concurrenthashmap|copyonwrite|priorityqueue/.test(text)) {
    return 'Collections Framework';
  }
  if (/class|interface|inherit|polymorph|abstract|encapsulat|super|override|overload|object|sealed|record|functionalinterface/.test(text)) {
    return 'OOP Concepts';
  }
  if (/exception|throw|catch|finally|garbage|gc|heap|stack|nullpointer|memory|metaspace|escape analysis|autocloseable/.test(text)) {
    return 'Exceptions & Memory';
  }

  return 'Core Java & Syntax';
};

/**
 * Fetch all quiz questions directly from Supabase database `java_quiz_questions` table.
 */
export const fetchQuizQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('java_quiz_questions')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Database error fetching quiz questions:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(q => {
      const qText = q.question_text || q.question || 'Java Question';
      const cOpt = q.correct_option !== undefined && q.correct_option !== null 
        ? q.correct_option 
        : (q.correct_answer !== undefined ? q.correct_answer : 0);
      let opts = [];
      try {
        opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
      } catch (e) {
        opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
      }

      return {
        ...q,
        id: q.id,
        question_text: qText,
        correct_option: Number(cOpt),
        options: opts.length > 0 ? opts : ["Option A", "Option B", "Option C", "Option D"],
        explanation: q.explanation || "No explanation provided.",
        category: deriveQuestionCategory({ question_text: qText, explanation: q.explanation, category: q.category }),
        difficulty: q.difficulty || 'Medium',
      };
    });
  } catch (err) {
    console.error('Failed to fetch quiz questions from DB:', err);
    return [];
  }
};

export const saveQuizAttempt = async (userId, score, total) => {
  try {
    const { data, error } = await supabase
      .from('java_quiz_attempts')
      .insert([
        {
          user_id: userId,
          score,
          total_questions: total,
          percentage: total > 0 ? Math.round((score / total) * 100) : 0,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Error saving quiz attempt:', err);
    return { data: null, error: err };
  }
};

export const fetchUserAttempts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('java_quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    return { data: [], error: err };
  }
};

export const fetchUserQuizBest = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('java_quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('score', { ascending: false })
      .order('percentage', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    return null;
  }
};

export const fetchGlobalQuizLeaderboard = async () => {
  try {
    const { data: attempts, error: attemptsError } = await supabase
      .from('java_quiz_attempts')
      .select('user_id, score, total_questions, percentage, created_at');

    if (attemptsError) throw attemptsError;
    if (!attempts || attempts.length === 0) return [];

    const userBestMap = {};
    attempts.forEach(item => {
      const existing = userBestMap[item.user_id];
      if (!existing || item.score > existing.score || (item.score === existing.score && item.percentage > existing.percentage)) {
        userBestMap[item.user_id] = item;
      }
    });

    const userIds = Object.keys(userBestMap);
    if (userIds.length === 0) return [];

    const { data: userProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_color, avatar_url')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    const profilesMap = {};
    (userProfiles || []).forEach(p => {
      profilesMap[p.id] = p;
    });

    const leaderboard = userIds.map(uid => {
      const best = userBestMap[uid];
      const userProfile = profilesMap[uid] || { display_name: 'Unknown Racer', username: 'unknown' };
      return {
        user_id: uid,
        display_name: userProfile.display_name,
        username: userProfile.username,
        avatar_color: userProfile.avatar_color,
        avatar_url: userProfile.avatar_url,
        score: best.score,
        total_questions: best.total_questions,
        percentage: best.percentage,
        created_at: best.created_at
      };
    });

    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return new Date(a.created_at) - new Date(b.created_at);
    });

    return leaderboard;
  } catch (err) {
    console.error('Error fetching global quiz leaderboard:', err);
    return [];
  }
};

export const fetchAllUsersQuizBest = async () => {
  try {
    const { data: attempts, error } = await supabase
      .from('java_quiz_attempts')
      .select('user_id, score, total_questions, percentage, created_at');

    if (error || !attempts) return {};

    const userBestMap = {};
    attempts.forEach(item => {
      const existing = userBestMap[item.user_id];
      if (!existing || item.score > existing.score || (item.score === existing.score && item.percentage > existing.percentage)) {
        userBestMap[item.user_id] = item;
      }
    });

    return userBestMap;
  } catch (err) {
    console.error('Error in fetchAllUsersQuizBest:', err);
    return {};
  }
};

export const fetchRecentQuizAttempts = async () => {
  try {
    const { data: attempts, error } = await supabase
      .from('java_quiz_attempts')
      .select('id, user_id, score, total_questions, percentage, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    if (!attempts || attempts.length === 0) return [];

    const userIds = Array.from(new Set(attempts.map(a => a.user_id)));
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_color, avatar_url')
      .in('id', userIds);

    const profilesMap = {};
    (profilesData || []).forEach(p => { profilesMap[p.id] = p; });

    return attempts.map(item => {
      const p = profilesMap[item.user_id] || { display_name: 'Unknown', username: 'unknown' };
      return {
        id: `quiz-${item.id}`,
        user_id: item.user_id,
        user_name: p.display_name,
        username: p.username,
        avatar_color: p.avatar_color,
        avatar_url: p.avatar_url,
        type: 'quiz',
        details: `Scored ${item.score}/${item.total_questions} (${item.percentage}%) in Java Quiz`,
        timestamp: item.created_at
      };
    });
  } catch (err) {
    console.error('Error fetching recent quiz attempts:', err);
    return [];
  }
};
