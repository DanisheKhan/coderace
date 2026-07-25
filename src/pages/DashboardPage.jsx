import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import { useProgressStore } from '../store/progressStore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  Trophy, Flame, Calendar, ListTodo,
  TrendingUp, Percent, ExternalLink, Target, Activity, Zap, Clock, Layers,
} from 'lucide-react';

const tooltipStyle = {
  backgroundColor: '#111113',
  borderColor: '#1f1f23',
  borderRadius: '10px',
  color: '#f4f4f5',
  fontSize: '12px',
};

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

const PanelHeader = ({ label, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-5">
    {Icon && <Icon className="w-3.5 h-3.5 text-zinc-600" />}
    <p className="section-label">{label}</p>
  </div>
);

const DiffDot = ({ d }) => {
  const color = d <= 2 ? '#10b981' : d === 3 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i <= d ? color : '#27272a' }} />
      ))}
    </div>
  );
};

const DashboardPage = () => {
  const { profile } = useAuth();
  const { questions } = useQuestions();
  const { progress } = useProgressStore();

  const userProgress = useMemo(
    () => progress.filter(p => p.user_id === profile?.id),
    [progress, profile]
  );

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

  const streak = useMemo(() => {
    if (!profile) return 0;
    const doneDates = userProgress
      .filter(p => p.status === 'done')
      .map(p => { const d = new Date(p.updated_at); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); });
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
      { name: 'Easy (?1-2)', value: easy, color: '#10b981' },
      { name: 'Medium (?3)', value: medium, color: '#f59e0b' },
      { name: 'Hard (?4-5)', value: hard, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [questions, userProgress]);



  const weeklyData = useMemo(() => {
    const today = new Date();
    const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const dateMap = {};
    userProgress.forEach(p => {
      if (p.status === 'done') {
        const d = new Date(p.updated_at);
        const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        dateMap[key] = (dateMap[key] || 0) + 1;
      }
    });
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const ms = todayMs - i * 86400000;
      const date = new Date(ms);
      days.push({ day: date.toLocaleDateString('en-US', { weekday: 'short' }), solved: dateMap[ms] || 0 });
    }
    return days;
  }, [userProgress]);

  const recentlySolved = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'done')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 6)
      .map(p => { const q = questions.find(q => q.id === p.question_id); return q ? { ...q, solved_at: p.updated_at } : null; })
      .filter(Boolean);
  }, [userProgress, questions]);

  const topTopics = useMemo(() =>
    [...topicData].filter(t => t.solved > 0).sort((a, b) => b.completed - a.completed).slice(0, 4),
    [topicData]
  );
  const weakTopics = useMemo(() =>
    [...topicData].filter(t => t.completed < 100 && t.total > 0).sort((a, b) => a.completed - b.completed).slice(0, 4),
    [topicData]
  );

  const dailyGoal = 5;
  const goalPct = Math.min(100, Math.round((stats.solvedToday / dailyGoal) * 100));
  const circumference = 2 * Math.PI * 50;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Welcome back, {profile?.display_name}</h1>
        <p className="text-zinc-500 text-sm mt-1">Your DSA progress snapshot.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Solved" value={stats.solved} unit={`/ ${stats.total}`} sub={<><Percent className="w-3 h-3" /> {stats.pct}% complete</>} subColor="text-violet-400" icon={Trophy} iconBg="bg-violet-500/8 border border-violet-500/15 text-violet-400" />
        <StatCard label="Current Streak" value={streak} unit={`day${streak !== 1 ? 's' : ''}`} sub={<><TrendingUp className="w-3 h-3" /> Active streak</>} subColor="text-orange-400" icon={Flame} iconBg="bg-orange-500/8 border border-orange-500/15 text-orange-400" />
        <StatCard label="Solved This Week" value={stats.solvedThisWeek} unit="solved" sub={<><Calendar className="w-3 h-3" /> Last 7 days</>} subColor="text-emerald-400" icon={Calendar} iconBg="bg-emerald-500/8 border border-emerald-500/15 text-emerald-400" />
        <StatCard label="Remaining" value={stats.remaining} unit="questions" sub={`${stats.attempted} attempted`} icon={ListTodo} iconBg="bg-zinc-800 border border-zinc-700/40 text-zinc-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl lg:col-span-2 flex flex-col min-h-[380px]">
          <PanelHeader label="Topic Completion" icon={Target} />
          <div className="flex-1 w-full overflow-y-auto max-h-[300px] mt-3 pr-1 custom-scrollbar">
            <ResponsiveContainer width="100%" height={640}>
              <BarChart data={topicData} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} interval={0} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.015)' }} contentStyle={tooltipStyle} formatter={(value, _, props) => [`${value}% (${props.payload.solved}/${props.payload.total})`, 'Completed']} />
                <Bar dataKey="completed" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl flex flex-col items-center text-center">
            <PanelHeader label="Daily Goal" icon={Zap} />
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
                <circle cx="54" cy="54" r="50" strokeWidth="7" className="stroke-zinc-800 fill-none" />
                <circle cx="54" cy="54" r="50" strokeWidth="7" className="stroke-violet-500 fill-none transition-all duration-700" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - goalPct / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-zinc-100">{stats.solvedToday}</span>
                <span className="section-label mt-0.5">/ {dailyGoal}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400">{goalPct === 100 ? '?? Daily goal reached!' : `${dailyGoal - stats.solvedToday} more to reach daily target`}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col min-h-[180px]">
            <PanelHeader label="Solved by Difficulty" icon={Activity} />
            {difficultyData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">Mark problems done to see breakdown.</div>
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

      {/* Recently Solved */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col">
          <PanelHeader label="Recently Solved" icon={Clock} />
          {recentlySolved.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-zinc-600 text-center">Solve problems to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1">
              {recentlySolved.map((q) => (
                <div key={q.id} className="flex items-start justify-between gap-2 group py-1">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-violet-400 transition-colors leading-snug">{q.problem_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xxs text-zinc-600 truncate">{q.topic}</span>
                      <DiffDot d={q.difficulty} />
                    </div>
                  </div>
                  {q.link && (
                    <a href={q.link} target="_blank" rel="noreferrer" className="p-1 rounded-md hover:bg-zinc-800 text-zinc-700 hover:text-zinc-300 transition-colors shrink-0 mt-0.5">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Weekly activity + Topic insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <PanelHeader label="This Week's Activity" icon={TrendingUp} />
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="solvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(139,92,246,0.15)', strokeWidth: 1 }} formatter={(v) => [`${v} solved`, 'Problems']} />
                <Area type="monotone" dataKey="solved" stroke="#8b5cf6" strokeWidth={2} fill="url(#solvedGradient)" dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <PanelHeader label="Topic Insights" icon={Layers} />
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-xxs font-bold text-emerald-500/80 uppercase tracking-widest mb-3">?? Strongest</p>
              {topTopics.length === 0 ? (
                <p className="text-xxs text-zinc-600">Keep solving to see insights.</p>
              ) : (
                <div className="space-y-3">
                  {topTopics.map((t, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs text-zinc-300 truncate mr-2 leading-none">{t.name}</span>
                        <span className="text-xxs text-emerald-400 shrink-0 font-medium">{t.completed}%</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.completed}%`, backgroundColor: '#10b981' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-xxs font-bold text-rose-500/80 uppercase tracking-widest mb-3">?? Needs Work</p>
              {weakTopics.length === 0 ? (
                <p className="text-xxs text-zinc-600">All topics complete! ??</p>
              ) : (
                <div className="space-y-3">
                  {weakTopics.map((t, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-xs text-zinc-300 truncate mr-2 leading-none">{t.name}</span>
                        <span className="text-xxs text-rose-400 shrink-0 font-medium">{t.completed}%</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.completed}%`, backgroundColor: '#ef4444' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
