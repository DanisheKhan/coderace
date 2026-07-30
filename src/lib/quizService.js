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
          score: Number(score),
          total: Number(total),
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
      .order('completed_at', { ascending: false });

    if (error) throw error;
    const normalized = (data || []).map(item => ({
      ...item,
      total_questions: item.total,
      created_at: item.completed_at,
    }));
    return { data: normalized, error: null };
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
    if (data && data.length > 0) {
      const item = data[0];
      return {
        ...item,
        total_questions: item.total,
        created_at: item.completed_at,
      };
    }
    return null;
  } catch (err) {
    return null;
  }
};

export const fetchGlobalQuizLeaderboard = async () => {
  try {
    const { data: attempts, error: attemptsError } = await supabase
      .from('java_quiz_attempts')
      .select('user_id, score, total, percentage, completed_at');

    if (attemptsError) throw attemptsError;
    if (!attempts || attempts.length === 0) return [];

    const userBestMap = {};
    const userAttemptsCountMap = {};

    attempts.forEach(item => {
      userAttemptsCountMap[item.user_id] = (userAttemptsCountMap[item.user_id] || 0) + 1;
      const existing = userBestMap[item.user_id];
      const score = Number(item.score);
      const pct = Number(item.percentage);

      if (
        !existing ||
        score > existing.score ||
        (score === existing.score && pct > existing.percentage)
      ) {
        userBestMap[item.user_id] = {
          ...item,
          score,
          percentage: pct,
        };
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
        userId: uid,
        user_id: uid,
        profile: {
          display_name: userProfile.display_name,
          username: userProfile.username,
          avatar_color: userProfile.avatar_color,
          avatar_url: userProfile.avatar_url,
        },
        display_name: userProfile.display_name,
        username: userProfile.username,
        avatar_color: userProfile.avatar_color,
        avatar_url: userProfile.avatar_url,
        bestScore: best.score,
        score: best.score,
        total: best.total,
        total_questions: best.total,
        bestPct: best.percentage,
        percentage: best.percentage,
        attemptsCount: userAttemptsCountMap[uid] || 1,
        created_at: best.completed_at,
        completed_at: best.completed_at
      };
    });

    leaderboard.sort((a, b) => {
      if (b.bestPct !== a.bestPct) return b.bestPct - a.bestPct;
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      return new Date(a.completed_at) - new Date(b.completed_at);
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
      .select('user_id, score, total, percentage, completed_at');

    if (error || !attempts) return {};

    const userBestMap = {};
    attempts.forEach(item => {
      const existing = userBestMap[item.user_id];
      const score = Number(item.score);
      const pct = Number(item.percentage);

      if (!existing || score > existing.score || (score === existing.score && pct > existing.percentage)) {
        userBestMap[item.user_id] = {
          ...item,
          score,
          percentage: pct,
          total_questions: item.total,
          created_at: item.completed_at,
        };
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
      .select('id, user_id, score, total, percentage, completed_at')
      .order('completed_at', { ascending: false })
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
      const pct = Number(item.percentage);
      return {
        id: `quiz-${item.id}`,
        userId: item.user_id,
        user_id: item.user_id,
        userName: p.display_name,
        user_name: p.display_name,
        username: p.username,
        avatarColor: p.avatar_color,
        avatar_color: p.avatar_color,
        avatarUrl: p.avatar_url,
        avatar_url: p.avatar_url,
        type: 'quiz',
        score: item.score,
        total: item.total,
        total_questions: item.total,
        percentage: pct,
        details: `Scored ${item.score}/${item.total} (${pct}%) in Java Quiz`,
        updatedAt: item.completed_at,
        timestamp: item.completed_at
      };
    });
  } catch (err) {
    console.error('Error fetching recent quiz attempts:', err);
    return [];
  }
};
