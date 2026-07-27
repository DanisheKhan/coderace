import { supabase } from './supabase';
import { FULL_QUIZ_QUESTIONS } from './quizQuestionsData';

/**
 * Categorize a question based on its text/category attributes.
 */
export const deriveQuestionCategory = (q) => {
  if (q.category && typeof q.category === 'string' && q.category.trim() !== '') {
    return q.category.trim();
  }

  const text = `${q.question_text || q.question || ''} ${q.explanation || ''}`.toLowerCase();

  if (/thread|runnable|synchroniz|volatile|lock|concurren|executor|deadlock/.test(text)) {
    return 'Multithreading & Concurrency';
  }
  if (/list|map|set|hashmap|arraylist|collection|queue|deque|iterator|treemap|hashset/.test(text)) {
    return 'Collections Framework';
  }
  if (/class|interface|inherit|polymorph|abstract|encapsulat|super|override|overload|object/.test(text)) {
    return 'OOP Concepts';
  }
  if (/exception|throw|catch|finally|garbage|gc|heap|stack|nullpointer|memory/.test(text)) {
    return 'Exceptions & Memory';
  }

  return 'Core Java & Syntax';
};

// Map FULL_QUIZ_QUESTIONS to standard object shape
const PREPARED_FULL_QUESTIONS = FULL_QUIZ_QUESTIONS.map((q, idx) => {
  const qText = q.question_text || q.question || 'Java Question';
  const cOpt = q.correct_option !== undefined && q.correct_option !== null 
    ? q.correct_option 
    : (q.correctAnswer !== undefined ? q.correctAnswer : 0);
  let opts = [];
  try {
    opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
  } catch (e) {
    opts = [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean);
  }

  return {
    id: q.id || 2000 + idx,
    question_text: qText,
    correct_option: Number(cOpt),
    options: opts.length > 0 ? opts : ["Option A", "Option B", "Option C", "Option D"],
    explanation: q.explanation || "No explanation provided.",
    category: deriveQuestionCategory({ question_text: qText, explanation: q.explanation, category: q.category }),
  };
});

export const fetchQuizQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('java_quiz_questions')
      .select('*')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return PREPARED_FULL_QUESTIONS;
    }

    const dbParsed = data.map(q => {
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
        question_text: qText,
        correct_option: Number(cOpt),
        options: opts.length > 0 ? opts : ["Option A", "Option B", "Option C", "Option D"],
        explanation: q.explanation || "No explanation provided.",
        category: deriveQuestionCategory({ question_text: qText, explanation: q.explanation, category: q.category }),
      };
    });

    // Merge database questions with prepared full questions (deduping by question text)
    const existingTexts = new Set(dbParsed.map(q => q.question_text.trim().toLowerCase()));
    const remainingFull = PREPARED_FULL_QUESTIONS.filter(
      q => !existingTexts.has(q.question_text.trim().toLowerCase())
    );

    return [...dbParsed, ...remainingFull];
  } catch (err) {
    console.error('Error fetching quiz questions, returning full question dataset:', err);
    return PREPARED_FULL_QUESTIONS;
  }
};

export const saveQuizAttempt = async (userId, score, total) => {
  try {
    const { data, error } = await supabase
      .from('java_quiz_attempts')
      .insert([
        { user_id: userId, score, total }
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error('Error saving quiz attempt:', err);
    return null;
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
    return data;
  } catch (err) {
    console.error('Error fetching user attempts:', err);
    return [];
  }
};

export const fetchAllUsersQuizBest = async () => {
  try {
    const { data, error } = await supabase
      .from('java_quiz_attempts')
      .select('user_id, score, total, percentage, completed_at')
      .order('completed_at', { ascending: false });

    if (error) throw error;

    const bestAttempts = {};
    (data || []).forEach(attempt => {
      const existing = bestAttempts[attempt.user_id];
      if (!existing) {
        bestAttempts[attempt.user_id] = {
          score: attempt.score,
          total: attempt.total,
          percentage: Number(attempt.percentage),
          completed_at: attempt.completed_at,
          attempts_count: 1
        };
      } else {
        bestAttempts[attempt.user_id].attempts_count += 1;
        if (Number(attempt.percentage) > existing.percentage) {
          bestAttempts[attempt.user_id].score = attempt.score;
          bestAttempts[attempt.user_id].total = attempt.total;
          bestAttempts[attempt.user_id].percentage = Number(attempt.percentage);
          bestAttempts[attempt.user_id].completed_at = attempt.completed_at;
        }
      }
    });

    return bestAttempts;
  } catch (err) {
    console.error('Error fetching best attempts:', err);
    return {};
  }
};

/**
 * Fetch global quiz leaderboard with user profile details.
 */
export const fetchGlobalQuizLeaderboard = async () => {
  try {
    const { data: attempts, error } = await supabase
      .from('java_quiz_attempts')
      .select(`
        id,
        user_id,
        score,
        total,
        percentage,
        completed_at,
        profiles (
          id,
          display_name,
          username,
          avatar_url,
          avatar_color
        )
      `)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    if (!attempts || attempts.length === 0) return [];

    const userBestMap = new Map();

    attempts.forEach(att => {
      const uId = att.user_id;
      const pct = Number(att.percentage || 0);
      const existing = userBestMap.get(uId);

      if (!existing) {
        userBestMap.set(uId, {
          userId: uId,
          profile: att.profiles || { display_name: 'Unknown Racer' },
          bestScore: att.score,
          total: att.total,
          bestPct: pct,
          attemptsCount: 1,
          lastAttempted: att.completed_at,
        });
      } else {
        existing.attemptsCount += 1;
        if (pct > existing.bestPct || (pct === existing.bestPct && att.score > existing.bestScore)) {
          existing.bestScore = att.score;
          existing.total = att.total;
          existing.bestPct = pct;
          existing.lastAttempted = att.completed_at;
        }
      }
    });

    return Array.from(userBestMap.values()).sort((a, b) => b.bestPct - a.bestPct || b.bestScore - a.bestScore);
  } catch (err) {
    console.error('Error fetching global quiz leaderboard:', err);
    return [];
  }
};

export const fetchRecentQuizAttempts = async () => {
  try {
    const { data, error } = await supabase
      .from('java_quiz_attempts')
      .select(`
        id,
        user_id,
        score,
        total,
        percentage,
        completed_at,
        profiles (
          display_name,
          avatar_url,
          avatar_color
        )
      `)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    if (!data) return [];

    return data.map(item => ({
      id: `quiz-${item.id}`,
      userId: item.user_id,
      userName: item.profiles?.display_name || 'Racer',
      avatarUrl: item.profiles?.avatar_url || '',
      avatarColor: item.profiles?.avatar_color || '#6366f1',
      type: 'quiz',
      score: item.score,
      total: item.total,
      percentage: Number(item.percentage),
      updatedAt: item.completed_at
    }));
  } catch (err) {
    console.error('Error fetching recent quiz attempts:', err);
    return [];
  }
};
