import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import { useProgressStore } from '../store/progressStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  ListTodo, 
  ExternalLink, 
  CheckCircle2,
  Bookmark,
  TrendingUp,
  Percent
} from 'lucide-react';

const DashboardPage = () => {
  const { profile } = useAuth();
  const { questions } = useQuestions();
  const { progress, upsertProgress } = useProgressStore();

  // Filter progress for active user
  const userProgress = useMemo(() => {
    return progress.filter(p => p.user_id === profile?.id);
  }, [progress, profile]);

  // Solved statistics
  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    const doneQuestions = userProgress.filter(p => p.status === 'done');
    const attemptedQuestions = userProgress.filter(p => p.status === 'attempted');
    
    const solvedCount = doneQuestions.length;
    const attemptedCount = attemptedQuestions.length;
    
    const pct = totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;
    const remaining = totalQuestions - solvedCount;

    // Solved this week (last 7 days)
    const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    const solvedThisWeek = doneQuestions.filter(p => {
      return new Date(p.updated_at).getTime() >= sevenDaysAgo;
    }).length;

    // Solved today (since midnight)
    const today = new Date();
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const solvedToday = doneQuestions.filter(p => {
      return new Date(p.updated_at).getTime() >= midnight;
    }).length;

    return {
      total: totalQuestions,
      solved: solvedCount,
      attempted: attemptedCount,
      pct,
      remaining,
      solvedThisWeek,
      solvedToday
    };
  }, [questions, userProgress]);

  // Streak Calculation
  const streak = useMemo(() => {
    if (!profile) return 0;
    
    const doneDates = userProgress
      .filter(p => p.status === 'done')
      .map(p => {
        const d = new Date(p.updated_at);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });

    if (doneDates.length === 0) return 0;

    // Unique sorted descending
    const uniqueDates = [...new Set(doneDates)].sort((a, b) => b - a);

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayMidnight = todayMidnight - 86400000;

    // Check if the most recent done date was today or yesterday
    if (uniqueDates[0] !== todayMidnight && uniqueDates[0] !== yesterdayMidnight) {
      return 0;
    }

    let currentStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      if (uniqueDates[i] - uniqueDates[i+1] === 86400000) {
        currentStreak++;
      } else if (uniqueDates[i] === uniqueDates[i+1]) {
        continue;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [userProgress, profile]);

  // Phase Completion Chart data
  const phaseData = useMemo(() => {
    // Group questions by phase
    const phases = {};
    questions.forEach(q => {
      if (!phases[q.phase]) {
        phases[q.phase] = { total: 0, solved: 0 };
      }
      phases[q.phase].total++;
    });

    // Populate solved counts
    userProgress.forEach(p => {
      if (p.status === 'done') {
        const q = questions.find(question => question.id === p.question_id);
        if (q && phases[q.phase]) {
          phases[q.phase].solved++;
        }
      }
    });

    return Object.keys(phases).map(phaseName => {
      const data = phases[phaseName];
      const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
      
      // Simplify Phase names (e.g. "PHASE 1 : FUNDAMENTALS..." -> "Phase 1")
      let displayName = phaseName.split(':')[0].trim();
      displayName = displayName.charAt(0) + displayName.slice(1).toLowerCase();

      return {
        name: displayName,
        completed: pct,
        solved: data.solved,
        total: data.total
      };
    });
  }, [questions, userProgress]);

  // Difficulty Breakdown Chart data
  const difficultyData = useMemo(() => {
    const diffs = {
      1: { name: 'Easy', count: 0, color: '#10b981' },
      2: { name: 'Easy', count: 0, color: '#10b981' }, // combined 1 & 2 as Easy
      3: { name: 'Medium', count: 0, color: '#f59e0b' }, // 3 as Medium
      4: { name: 'Hard', count: 0, color: '#ef4444' },
      5: { name: 'Hard', count: 0, color: '#ef4444' } // combined 4 & 5 as Hard
    };

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    userProgress.forEach(p => {
      if (p.status === 'done') {
        const q = questions.find(question => question.id === p.question_id);
        if (q) {
          if (q.difficulty <= 2) easyCount++;
          else if (q.difficulty === 3) mediumCount++;
          else hardCount++;
        }
      }
    });

    return [
      { name: 'Easy (★1-2)', value: easyCount, color: '#10b981' },
      { name: 'Medium (★3)', value: mediumCount, color: '#f59e0b' },
      { name: 'Hard (★4-5)', value: hardCount, color: '#ef4444' }
    ].filter(d => d.value > 0); // Only return categories with solved items
  }, [questions, userProgress]);

  // Revisit list
  const revisitQuestions = useMemo(() => {
    return questions.filter(q => {
      const prog = userProgress.find(p => p.question_id === q.id);
      return prog?.revisit === true;
    }).slice(0, 5); // limit to top 5
  }, [questions, userProgress]);

  // Daily goal progress calculation
  const dailyGoal = 5;
  const goalPct = Math.min(100, Math.round((stats.solvedToday / dailyGoal) * 100));

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Welcome back, {profile?.display_name}!</h2>
        <p className="text-zinc-500 text-sm mt-1">Here is a snapshot of your personal progress through the DSA sheet.</p>
      </div>

      {/* Hero Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solved */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Solved</p>
            <h3 className="text-3xl font-extrabold text-zinc-100">
              {stats.solved} <span className="text-zinc-600 text-lg font-medium">/ {stats.total}</span>
            </h3>
            <p className="text-xs text-violet-400 font-semibold flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" />
              <span>{stats.pct}% complete</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Current Streak */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Current Streak</p>
            <h3 className="text-3xl font-extrabold text-zinc-100">
              {streak} <span className="text-zinc-600 text-lg font-medium">day{streak !== 1 ? 's' : ''}</span>
            </h3>
            <p className="text-xs text-orange-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active solve streak</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Solved This Week */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Solved This Week</p>
            <h3 className="text-3xl font-extrabold text-zinc-100">
              {stats.solvedThisWeek} <span className="text-zinc-600 text-lg font-medium">solved</span>
            </h3>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Within the last 7 days</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Remaining Questions */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Remaining</p>
            <h3 className="text-3xl font-extrabold text-zinc-100">
              {stats.remaining} <span className="text-zinc-600 text-lg font-medium">questions</span>
            </h3>
            <p className="text-xs text-zinc-400">
              {stats.attempted} currently attempted
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
            <ListTodo className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Side Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Completion Horizontal Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 shadow-sm flex flex-col min-h-[350px]">
          <h3 className="text-base font-bold text-zinc-200 mb-6">Phase Completion (%)</h3>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%" minHeight={280}>
              <BarChart
                data={phaseData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, 100]} stroke="#71717a" />
                <YAxis dataKey="name" type="category" width={60} stroke="#71717a" />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{
                    backgroundColor: '#121214',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fafafa'
                  }}
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.solved}/${props.payload.total} solved)`,
                    'Completed'
                  ]}
                />
                <Bar dataKey="completed" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right side widgets: Daily Goal & Difficulty breakdown */}
        <div className="space-y-6">
          {/* Daily Goal widget */}
          <div className="glass-panel p-5 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Daily Goal Progress</h3>
            
            {/* SVG Progress Ring */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-zinc-800 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-violet-500 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - goalPct / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-zinc-100">{stats.solvedToday}</span>
                <span className="text-xxs text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">/ {dailyGoal} Solved</span>
              </div>
            </div>
            
            <p className="mt-4 text-xs font-medium text-zinc-400">
              {goalPct === 100 
                ? "🎉 Daily goal achieved! Excellent work!" 
                : `${dailyGoal - stats.solvedToday} more questions to hit your daily target.`}
            </p>
          </div>

          {/* Difficulty breakdown Donut Chart */}
          <div className="glass-panel p-5 rounded-2xl shadow-sm flex flex-col min-h-[220px]">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Solved Difficulty</h3>
            {difficultyData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">
                Mark problems done to see breakdown.
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="w-full h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={45}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {difficultyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#121214',
                          borderColor: '#27272a',
                          borderRadius: '12px',
                          color: '#fafafa'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xxs font-medium">
                  {difficultyData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span className="text-zinc-400">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revisit Later Section */}
      <div className="glass-panel p-5 rounded-2xl shadow-sm">
        <h3 className="text-base font-bold text-zinc-200 mb-4 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-rose-400" />
          <span>Flagged to Revisit Later</span>
        </h3>
        
        {revisitQuestions.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">No questions currently marked for review. Use the bookmark icon in the sheet to flag questions.</p>
        ) : (
          <div className="divide-y divide-zinc-900">
            {revisitQuestions.map((q) => (
              <div key={q.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group">
                <div className="min-w-0 flex-1 pr-3">
                  <h4 className="text-sm font-semibold text-zinc-200 truncate group-hover:text-violet-400 transition-colors">
                    {q.problem_name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{q.topic} {q.subtopic ? `• ${q.subtopic}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  {q.link && (
                    <a
                      href={q.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => upsertProgress(profile.id, q.id, { status: 'done', revisit: false })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
