import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import { useProgressStore } from '../store/progressStore';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { 
  Trophy, Flame, Calendar, ListTodo,
  ExternalLink, CheckCircle2, Bookmark, TrendingUp, Percent
} from 'lucide-react';

// ── Shared chart tooltip style ──
const tooltipStyle = {
  backgroundColor: '#111113',
  borderColor: '#1f1f23',
  borderRadius: '10px',
  color: '#f4f4f5',
  fontSize: '12px',
};

// ── Stat card ──
const StatCard = ({ label, value, unit, sub, subColor = 'text-zinc-500', icon: Icon, iconBg }) => (
  <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
    <div className="space-y-1.5">
      <p className="section-label">{label}</p>
      <h3 className="text-3xl font-bold text-zinc-100 tracking-tight leading-none">
        {value}
        {unit && <span className="text-zinc-500 text-base font-normal ml-1.5">{unit}</span>}
      </h3>
      <p className={`text-xs font-medium flex items-center gap-1 ${subColor}`}>{sub}</p>
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

// ── Panel header ──
const PanelHeader = ({ label }) => (
  <p className="section-label mb-5">{label}</p>
);

const DashboardPage = () => {
  const { profile } = useAuth();
  const { questions } = useQuestions();
  const { progress, upsertProgress } = useProgressStore();

  const userProgress = useMemo(
    () => progress.filter(p => p.user_id === profile?.id),
    [progress, profile]
  );

  // Stats
  const stats = useMemo(() => {
    const total = questions.length;
    const done = userProgress.filter(p => p.status === 'done');
    const attempted = userProgress.filter(p => p.status === 'attempted');
    const solved = done.length;
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    const remaining = total - solved;

    const sevenAgo = Date.now() - 7 * 86400000;
    const solvedThisWeek = done.filter(p => new Date(p.updated_at).getTime() >= sevenAgo).length;

    const today = new Date();
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const solvedToday = done.filter(p => new Date(p.updated_at).getTime() >= midnight).length;

    return { total, solved, attempted: attempted.length, pct, remaining, solvedThisWeek, solvedToday };
  }, [questions, userProgress]);

  // Streak
  const streak = useMemo(() => {
    if (!profile) return 0;
    const doneDates = userProgress
      .filter(p => p.status === 'done')
      .map(p => {
        const d = new Date(p.updated_at);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });
    if (!doneDates.length) return 0;
    const unique = [...new Set(doneDates)].sort((a, b) => b - a);
    const today = new Date();
    const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayMs = todayMs - 86400000;
    if (unique[0] !== todayMs && unique[0] !== yesterdayMs) return 0;
    let s = 1;
    for (let i = 0; i < unique.length - 1; i++) {
      if (unique[i] - unique[i + 1] === 86400000) s++;
      else if (unique[i] === unique[i + 1]) continue;
      else break;
    }
    return s;
  }, [userProgress, profile]);

  // Topic chart data
  const topicData = useMemo(() => {
    const topics = {};
    questions.forEach(q => {
      if (!topics[q.topic]) topics[q.topic] = { total: 0, solved: 0 };
      topics[q.topic].total++;
    });
    userProgress.forEach(p => {
      if (p.status === 'done') {
        const q = questions.find(q => q.id === p.question_id);
        if (q && topics[q.topic]) topics[q.topic].solved++;
      }
    });
    return Object.keys(topics).map(name => {
      const d = topics[name];
      const pct = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
      return { name, completed: pct, solved: d.solved, total: d.total };
    });
  }, [questions, userProgress]);

  // Difficulty chart data
  const difficultyData = useMemo(() => {
    let easy = 0, medium = 0, hard = 0;
    userProgress.forEach(p => {
      if (p.status === 'done') {
        const q = questions.find(q => q.id === p.question_id);
        if (q) {
          if (q.difficulty <= 2) easy++;
          else if (q.difficulty === 3) medium++;
          else hard++;
        }
      }
    });
    return [
      { name: 'Easy (★1-2)',  value: easy,   color: '#10b981' },
      { name: 'Medium (★3)', value: medium, color: '#f59e0b' },
      { name: 'Hard (★4-5)', value: hard,   color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [questions, userProgress]);

  // Revisit list
  const revisitQuestions = useMemo(() => {
    return questions.filter(q => userProgress.find(p => p.question_id === q.id)?.revisit === true).slice(0, 5);
  }, [questions, userProgress]);

  const dailyGoal = 5;
  const goalPct = Math.min(100, Math.round((stats.solvedToday / dailyGoal) * 100));
  const circumference = 2 * Math.PI * 50;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">
          Welcome back, {profile?.display_name}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Your DSA progress snapshot.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Solved"
          value={stats.solved}
          unit={`/ ${stats.total}`}
          sub={<><Percent className="w-3 h-3" /> {stats.pct}% complete</>}
          subColor="text-violet-400"
          icon={Trophy}
          iconBg="bg-violet-500/8 border border-violet-500/15 text-violet-400"
        />
        <StatCard
          label="Current Streak"
          value={streak}
          unit={`day${streak !== 1 ? 's' : ''}`}
          sub={<><TrendingUp className="w-3 h-3" /> Active streak</>}
          subColor="text-orange-400"
          icon={Flame}
          iconBg="bg-orange-500/8 border border-orange-500/15 text-orange-400"
        />
        <StatCard
          label="Solved This Week"
          value={stats.solvedThisWeek}
          unit="solved"
          sub={<><Calendar className="w-3 h-3" /> Last 7 days</>}
          subColor="text-emerald-400"
          icon={Calendar}
          iconBg="bg-emerald-500/8 border border-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="Remaining"
          value={stats.remaining}
          unit="questions"
          sub={`${stats.attempted} attempted`}
          icon={ListTodo}
          iconBg="bg-zinc-800 border border-zinc-700/40 text-zinc-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Topic bar chart */}
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 flex flex-col min-h-[380px]">
          <PanelHeader label="Topic Completion" />
          <div className="flex-1 w-full overflow-y-auto max-h-[300px] mt-3 pr-1 custom-scrollbar">
            <ResponsiveContainer width="100%" height={640}>
              <BarChart data={topicData} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} interval={0} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.015)' }}
                  contentStyle={tooltipStyle}
                  formatter={(value, _, props) => [
                    `${value}% (${props.payload.solved}/${props.payload.total})`,
                    'Completed'
                  ]}
                />
                <Bar dataKey="completed" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Daily goal + Difficulty */}
        <div className="space-y-4">
          {/* Daily goal ring */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col items-center text-center">
            <PanelHeader label="Daily Goal" />
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
                <circle cx="54" cy="54" r="50" strokeWidth="7" className="stroke-zinc-800 fill-none" />
                <circle
                  cx="54" cy="54" r="50" strokeWidth="7"
                  className="stroke-violet-500 fill-none transition-all duration-700"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - goalPct / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-zinc-100">{stats.solvedToday}</span>
                <span className="section-label mt-0.5">/ {dailyGoal}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              {goalPct === 100
                ? '🎉 Daily goal reached!'
                : `${dailyGoal - stats.solvedToday} more to reach daily target`}
            </p>
          </div>

          {/* Difficulty donut */}
          <div className="glass-panel p-5 rounded-2xl flex flex-col min-h-[180px]">
            <PanelHeader label="Solved by Difficulty" />
            {difficultyData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">
                Mark problems done to see breakdown.
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={28} outerRadius={40} paddingAngle={3} dataKey="value">
                        {difficultyData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
                  {difficultyData.map((e, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="text-xxs text-zinc-400">{e.name}: {e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revisit later */}
      <div className="glass-panel p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-4 h-4 text-rose-400" />
          <p className="section-label">Flagged to Revisit</p>
        </div>

        {revisitQuestions.length === 0 ? (
          <p className="text-xs text-zinc-600 py-3">
            No questions flagged. Use the bookmark icon in My Sheet to flag questions for review.
          </p>
        ) : (
          <div className="divide-y divide-[#1f1f23]">
            {revisitQuestions.map((q) => (
              <div key={q.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group">
                <div className="min-w-0 flex-1 pr-4">
                  <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-violet-400 transition-colors">
                    {q.problem_name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">
                    {q.topic}{q.subtopic ? ` · ${q.subtopic}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {q.link && (
                    <a
                      href={q.link} target="_blank" rel="noreferrer"
                      className="p-1.5 rounded-lg border border-[#1f1f23] hover:border-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => upsertProgress(profile.id, q.id, { status: 'done', revisit: false })}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-emerald-400 text-xs font-medium hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all cursor-pointer"
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
