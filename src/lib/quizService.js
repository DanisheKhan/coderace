import { supabase } from './supabase';

export const fetchQuizQuestions = async () => {
  const { data, error } = await supabase
    .from('java_quiz_questions')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching quiz questions:', error);
    throw error;
  }

  return data.map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
  }));
};

export const saveQuizAttempt = async (userId, score, total) => {
  const { data, error } = await supabase
    .from('java_quiz_attempts')
    .insert([
      { user_id: userId, score, total }
    ])
    .select();

  if (error) {
    console.error('Error saving quiz attempt:', error);
    throw error;
  }

  return data[0];
};

export const fetchUserAttempts = async (userId) => {
  const { data, error } = await supabase
    .from('java_quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching user attempts:', error);
    throw error;
  }

  return data;
};

export const fetchAllUsersQuizBest = async () => {
  const { data, error } = await supabase
    .from('java_quiz_attempts')
    .select('user_id, score, total, percentage, completed_at')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching all quiz attempts:', error);
    throw error;
  }

  const bestAttempts = {};
  data.forEach(attempt => {
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
};

export const fetchRecentQuizAttempts = async () => {
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

  if (error) {
    console.error('Error fetching recent quiz attempts:', error);
    return [];
  }

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
};
