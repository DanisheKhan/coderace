// Achievements definitions and calculator for CodeRace

export const calculateStreak = (userProgress) => {
  const doneDates = userProgress
    .filter(p => p.status === 'done')
    .map(p => {
      const d = new Date(p.updated_at);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    });
  if (doneDates.length === 0) return 0;
  const unique = [...new Set(doneDates)].sort((a, b) => b - a);
  const today = new Date();
  const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayMs = todayMs - 86400000;
  if (unique[0] !== todayMs && unique[0] !== yesterdayMs) return 0;
  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    if (unique[i] - unique[i + 1] === 86400000) streak++;
    else if (unique[i] === unique[i + 1]) continue;
    else break;
  }
  return streak;
};

export const ACHIEVEMENTS = [
  {
    id: 'first_solve',
    title: 'First Blood',
    description: 'Log your first completed problem',
    points: 50,
    category: 'solved',
    maxProgress: 1,
    icon: 'Zap',
    color: 'from-amber-500/20 to-orange-500/20 border-orange-500/30 text-orange-400',
    progressFn: (up) => up.filter(p => p.status === 'done').length
  },
  {
    id: 'solve_10',
    title: 'Speed Racer',
    description: 'Solve 10 problems',
    points: 100,
    category: 'solved',
    maxProgress: 10,
    icon: 'Flame',
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400',
    progressFn: (up) => up.filter(p => p.status === 'done').length
  },
  {
    id: 'solve_50',
    title: 'Grand Prix Winner',
    description: 'Solve 50 problems',
    points: 250,
    category: 'solved',
    maxProgress: 50,
    icon: 'Trophy',
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400 animate-pulse',
    progressFn: (up) => up.filter(p => p.status === 'done').length
  },
  {
    id: 'streak_3',
    title: 'Daily Driver',
    description: 'Achieve a 3-day coding streak',
    points: 100,
    category: 'streak',
    maxProgress: 3,
    icon: 'Calendar',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    progressFn: (up, qs, streak) => streak
  },
  {
    id: 'streak_7',
    title: 'Championship Streak',
    description: 'Achieve a 7-day coding streak',
    points: 200,
    category: 'streak',
    maxProgress: 7,
    icon: 'Activity',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    progressFn: (up, qs, streak) => streak
  },
  {
    id: 'topic_arrays',
    title: 'Array Assassin',
    description: 'Solve 5 Array problems',
    points: 100,
    category: 'topic',
    maxProgress: 5,
    icon: 'Code2',
    color: 'from-violet-500/20 to-indigo-500/20 border-violet-500/30 text-violet-400',
    progressFn: (up, qs) => {
      const qIds = qs.filter(q => q.topic.toLowerCase().includes('array')).map(q => q.id);
      return up.filter(p => p.status === 'done' && qIds.includes(p.question_id)).length;
    }
  },
  {
    id: 'topic_recursion',
    title: 'Recursion Wizard',
    description: 'Solve 3 Recursion problems',
    points: 100,
    category: 'topic',
    maxProgress: 3,
    icon: 'Layers',
    color: 'from-pink-500/20 to-fuchsia-500/20 border-pink-500/30 text-pink-400',
    progressFn: (up, qs) => {
      const qIds = qs.filter(q => q.topic.toLowerCase().includes('recursion')).map(q => q.id);
      return up.filter(p => p.status === 'done' && qIds.includes(p.question_id)).length;
    }
  },
  {
    id: 'topic_trees',
    title: 'Tree Whisperer',
    description: 'Solve 5 Tree problems',
    points: 150,
    category: 'topic',
    maxProgress: 5,
    icon: 'Layers',
    color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400',
    progressFn: (up, qs) => {
      const qIds = qs.filter(q => q.topic.toLowerCase().includes('tree')).map(q => q.id);
      return up.filter(p => p.status === 'done' && qIds.includes(p.question_id)).length;
    }
  },
  {
    id: 'topic_graphs',
    title: 'Graph Path Finder',
    description: 'Solve 3 Graph problems',
    points: 150,
    category: 'topic',
    maxProgress: 3,
    icon: 'Network',
    color: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400',
    progressFn: (up, qs) => {
      const qIds = qs.filter(q => q.topic.toLowerCase().includes('graph')).map(q => q.id);
      return up.filter(p => p.status === 'done' && qIds.includes(p.question_id)).length;
    }
  },
  {
    id: 'topic_dp',
    title: 'DP Sorcerer',
    description: 'Solve 5 DP problems',
    points: 200,
    category: 'topic',
    maxProgress: 5,
    icon: 'Sparkles',
    color: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400',
    progressFn: (up, qs) => {
      const qIds = qs.filter(q => q.topic.toLowerCase() === 'dp' || q.topic.toLowerCase().includes('dynamic')).map(q => q.id);
      return up.filter(p => p.status === 'done' && qIds.includes(p.question_id)).length;
    }
  },
  {
    id: 'no_ai_10',
    title: 'Self-Reliant Coder',
    description: 'Solve 10 problems without AI/GPT or Copy-Paste',
    points: 150,
    category: 'quality',
    maxProgress: 10,
    icon: 'BookOpen',
    color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400',
    progressFn: (up) => up.filter(p => p.status === 'done' && p.solve_method !== 'gpt' && p.solve_method !== 'copy').length
  },
  {
    id: 'both_approaches',
    title: 'Double Trouble',
    description: 'Solve 5 problems with both Brute Force & Optimal approaches logged',
    points: 150,
    category: 'quality',
    maxProgress: 5,
    icon: 'Workflow',
    color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-400',
    progressFn: (up) => up.filter(p => p.status === 'done' && p.brute_force && p.optimized).length
  },
  {
    id: 'revisit_5',
    title: 'Diligent Scholar',
    description: 'Mark 5 problems as revisited',
    points: 100,
    category: 'revisit',
    maxProgress: 5,
    icon: 'BookmarkCheck',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
    progressFn: (up) => up.filter(p => p.revisit || (p.revisit_count && p.revisit_count > 0)).length
  }
];

export const calculateUserAchievements = (userId, progress, questions) => {
  const userProgress = progress.filter(p => p.user_id === userId);
  const streak = calculateStreak(userProgress);

  let totalXP = 0;
  let unlockedCount = 0;

  const achievementsList = ACHIEVEMENTS.map(ach => {
    const rawVal = ach.progressFn(userProgress, questions, streak);
    const val = Math.min(ach.maxProgress, rawVal);
    const unlocked = val >= ach.maxProgress;

    let unlockedAt = null;
    if (unlocked) {
      unlockedCount++;
      totalXP += ach.points;

      // Find when it was unlocked (use the max updated_at from completed questions in this category)
      // Since it's client-side, we approximate it by finding the last date of qualifying solves
      const doneSub = userProgress.filter(p => p.status === 'done');
      if (doneSub.length > 0) {
        const sortedDone = [...doneSub].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        unlockedAt = sortedDone[0]?.updated_at;
      } else {
        unlockedAt = new Date().toISOString();
      }
    }

    return {
      ...ach,
      currentProgress: val,
      unlocked,
      unlockedAt
    };
  });

  return {
    achievementsList,
    totalXP,
    unlockedCount,
    totalCount: ACHIEVEMENTS.length
  };
};
