import React, { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import { useProgressStore } from '../store/progressStore';
import { SolveTags, UserProfileModal } from '../components/UserProfileModal';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  Trophy, Flame, Calendar, ListTodo, TrendingUp, Percent, ExternalLink, Target, Activity, Zap, Clock, Layers, Award, Sparkles, BookOpen, Workflow, BookmarkCheck, Network, Eye
} from 'lucide-react';
import { calculateUserAchievements } from '../lib/achievements';
import MonkeytypePanel from '../components/MonkeytypePanel';
import LinkMonkeytypeModal from '../components/LinkMonkeytypeModal';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp, scaleIn } from '../lib/animations';

const IconMap = {
  Award, Zap, Flame, Trophy, Calendar, Activity,
  Layers, Sparkles, BookOpen, Workflow, BookmarkCheck, Network
};

const tooltipStyle = {
  backgroundColor: '#0d0d0f',
  borderColor: 'rgba(255,255,255,0.07)',
  borderRadius: '10px',
  color: '#e4e4e7',
  fontSize: '11px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
};

// ── Shared panel style ─────────────────────────────────────────────────────────
const panelCls = 'rounded-2xl border border-white/[0.05]';
const panelBg  = { background: 'rgba(11,11,14,0.8)' };

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, unit, sub, subColor = 'text-zinc-600', icon: Icon, accentBorder, accentBg, accentIcon }) => (
  <motion.div 
    variants={fadeUp}
    whileHover={{ y: -4, transition: { duration: 0.15 } }}
    className={`${panelCls} p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3`} 
    style={panelBg}
  >
    <div className="space-y-0.5 sm:space-y-1 min-w-0">
      <p className="text-[8.5px] sm:text-[9px] text-zinc-600 uppercase font-bold tracking-widest truncate">{label}</p>
      <div className="flex items-baseline gap-1 leading-none">
        <span className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">{value}</span>
        {unit && <span className="text-zinc-600 text-xs font-normal">{unit}</span>}
      </div>
      <p className={`text-[9.5px] sm:text-[10px] font-medium flex items-center gap-1 truncate ${subColor}`}>{sub}</p>
    </div>
    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border ${accentBorder} ${accentBg} ${accentIcon}`}>
      <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
    </div>
  </motion.div>
);

// ── Panel Section Header ──────────────────────────────────────────────────────
const PanelHeader = ({ label, icon: Icon, extra }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2 min-w-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest truncate">{label}</p>
    </div>
    {extra}
  </div>
);

// ── Diff Dots ─────────────────────────────────────────────────────────────────
const DiffDot = ({ d }) => {
  const color = d <= 2 ? '#10b981' : d === 3 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(i => (
        <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: i <= d ? color : '#1f1f23' }} />
      ))}
    </div>
  );
};

// ── Topic Completion Panel ────────────────────────────────────────────────────
const TopicCompletionPanel = ({ topicData }) => {
  const [filter, setFilter] = useState('all');
  const activeCount = useMemo(() => topicData.filter(t => t.solved > 0).length, [topicData]);
  const doneCount   = useMemo(() => topicData.filter(t => t.completed === 100).length, [topicData]);

  const filteredTopics = useMemo(() => {
    let list = [...topicData];
    if (filter === 'active') list = list.filter(t => t.solved > 0 && t.completed < 100);
    else if (filter === 'done') list = list.filter(t => t.completed === 100);
    return list.sort((a, b) => b.completed - a.completed || b.solved - a.solved || a.name.localeCompare(b.name));
  }, [topicData, filter]);

  return (
    <div className={`${panelCls} flex flex-col lg:col-span-2 h-[482px]`} style={panelBg}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 sm:px-4 pt-3.5 sm:pt-4 pb-3 border-b border-white/[0.04] shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-violet-500/[0.08] border border-violet-500/15 flex items-center justify-center text-violet-400 shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-zinc-200 truncate">Topic Completion</h3>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/[0.08] text-violet-400 border border-violet-500/15 font-mono">
                {activeCount}/{topicData.length} started
              </span>
            </div>
            <p className="text-[10px] text-zinc-600 mt-0.5 truncate">Problem solving progress per topic</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#111115] p-1 rounded-xl border border-white/[0.05] shrink-0 overflow-x-auto custom-scrollbar max-w-full">
          {[
            { key: 'all',    label: `All (${topicData.length})` },
            { key: 'active', label: `Active (${activeCount - doneCount})` },
            { key: 'done',   label: `Done (${doneCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filter === key
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar min-h-0">
        {filteredTopics.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-zinc-700">No topics match selected filter.</p>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const isCompleted = topic.completed === 100;
            const hasProgress = topic.solved > 0;
            return (
              <div key={topic.name} className="group py-2 border-b border-white/[0.03] last:border-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-zinc-300 group-hover:text-violet-300 transition-colors truncate max-w-[55%]">
                    {topic.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-zinc-600">
                      <strong className="text-zinc-400">{topic.solved}</strong> / {topic.total}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                      isCompleted
                        ? 'bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/15'
                        : hasProgress
                        ? 'bg-violet-500/[0.08] text-violet-400 border border-violet-500/15'
                        : 'bg-zinc-900/50 text-zinc-600 border border-white/[0.04]'
                    }`}>
                      {topic.completed}%
                    </span>
                  </div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : hasProgress
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-500'
                        : 'bg-zinc-800'
                    }`}
                    style={{ width: `${Math.max(hasProgress ? 2 : 0, topic.completed)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const { profile } = useAuth();
  const { questions } = useQuestions();
  const { progress } = useProgressStore();
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userProgress = useMemo(() => progress.filter(p => p.user_id === profile?.id), [progress, profile]);

  const { achievementsList, unlockedCount } = useMemo(() => {
    if (!profile) return { achievementsList: [], unlockedCount: 0 };
    return calculateUserAchievements(profile.id, progress, questions);
  }, [profile, progress, questions]);

  const nextBadge = useMemo(() => {
    const locked = achievementsList.filter(ach => !ach.unlocked);
    if (!locked.length) return null;
    return locked.reduce((closest, current) => {
      const cPct = current.maxProgress > 0 ? current.currentProgress / current.maxProgress : 0;
      const lPct = closest.maxProgress > 0 ? closest.currentProgress / closest.maxProgress : 0;
      return cPct > lPct ? current : closest;
    }, locked[0]);
  }, [achievementsList]);

  const stats = useMemo(() => {
    const total = questions.length;
    const done = userProgress.filter(p => p.status === 'done');
    const attempted = userProgress.filter(p => p.status === 'attempted');
    const solved = done.length;
    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
    const remaining = total - solved;
    const sevenAgo = Date.now() - 7 * 86400000;
    const solvedThisWeek = done.filter(p => new Date(p.updated_at).getTime() >= sevenAgo).length;
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const solvedToday = done.filter(p => new Date(p.updated_at).getTime() >= midnight.getTime()).length;
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
      { name: 'Easy (1-2)', value: easy, color: '#10b981' },
      { name: 'Medium (3)', value: medium, color: '#f59e0b' },
      { name: 'Hard (4-5)', value: hard, color: '#ef4444' },
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
      .slice(0, 5)
      .map(p => { const q = questions.find(q => q.id === p.question_id); return q ? { ...q, solved_at: p.updated_at, prog: p } : null; })
      .filter(Boolean);
  }, [userProgress, questions]);

  const topTopics  = useMemo(() => [...topicData].filter(t => t.solved > 0).sort((a, b) => b.completed - a.completed).slice(0, 3), [topicData]);
  const weakTopics = useMemo(() => [...topicData].filter(t => t.completed < 100 && t.total > 0).sort((a, b) => a.completed - b.completed).slice(0, 3), [topicData]);

  const dailyGoal = 5;
  const goalPct   = Math.min(100, Math.round((stats.solvedToday / dailyGoal) * 100));
  const totalGoalCircumference = 2 * Math.PI * 48;

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="space-y-4 max-w-7xl mx-auto pb-8"
    >

      {/* ── Header ── */}
      <div className="pb-4 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            Welcome back, <span className="text-violet-400">{profile?.display_name}</span>
          </h1>
          <p className="text-zinc-600 text-xs mt-0.5">Your DSA progress & race analytics snapshot.</p>
        </div>
        
        <button
          onClick={() => setIsProfileOpen(true)}
          className="px-4 py-2 rounded-xl bg-violet-600/10 hover:bg-violet-600 border border-violet-500/25 hover:border-violet-500 text-violet-400 hover:text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Profile</span>
        </button>
      </div>

      {/* ── Top 5 Stat Cards ── */}
      <motion.div 
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <StatCard
          label="Total Solved"
          value={stats.solved}
          unit={`/ ${stats.total}`}
          sub={<><Percent className="w-3 h-3" /> {stats.pct}% complete</>}
          subColor="text-violet-400"
          icon={Trophy}
          accentBorder="border-violet-500/15"
          accentBg="bg-violet-500/[0.07]"
          accentIcon="text-violet-400"
        />
        <StatCard
          label="Badges Unlocked"
          value={unlockedCount}
          unit={`/ ${achievementsList.length}`}
          sub={<><Award className="w-3 h-3" /> Milestones</>}
          subColor="text-amber-400"
          icon={Award}
          accentBorder="border-amber-500/15"
          accentBg="bg-amber-500/[0.07]"
          accentIcon="text-amber-400"
        />
        <StatCard
          label="Current Streak"
          value={streak}
          unit={`day${streak !== 1 ? 's' : ''}`}
          sub={<><TrendingUp className="w-3 h-3" /> Active streak</>}
          subColor="text-orange-400"
          icon={Flame}
          accentBorder="border-orange-500/15"
          accentBg="bg-orange-500/[0.07]"
          accentIcon="text-orange-400"
        />
        <StatCard
          label="Solved This Week"
          value={stats.solvedThisWeek}
          unit="solved"
          sub={<><Calendar className="w-3 h-3" /> Last 7 days</>}
          subColor="text-emerald-400"
          icon={Calendar}
          accentBorder="border-emerald-500/15"
          accentBg="bg-emerald-500/[0.07]"
          accentIcon="text-emerald-400"
        />
        <StatCard
          label="Remaining"
          value={stats.remaining}
          unit="questions"
          sub={`${stats.attempted} attempted`}
          subColor="text-zinc-600"
          icon={ListTodo}
          accentBorder="border-white/[0.06]"
          accentBg="bg-white/[0.03]"
          accentIcon="text-zinc-500"
        />
      </motion.div>

      {/* ── Row 2: Topic Completion + Right Column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopicCompletionPanel topicData={topicData} />

        <div className="flex flex-col gap-4 min-h-[482px]">

          {/* Daily Goal Ring */}
          <div className={`${panelCls} p-4 flex flex-col flex-1 items-center text-center`} style={panelBg}>
            <PanelHeader label="Daily Goal" icon={Zap} />
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 108 108">
                <circle cx="54" cy="54" r="48" strokeWidth="5" className="stroke-zinc-900 fill-none" />
                <circle cx="54" cy="54" r="48" strokeWidth="5"
                  className={`fill-none transition-all duration-700 ${goalPct === 100 ? 'stroke-emerald-400' : 'stroke-violet-500'}`}
                  strokeDasharray={totalGoalCircumference}
                  strokeDashoffset={totalGoalCircumference * (1 - goalPct / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-zinc-100 leading-none">{stats.solvedToday}</span>
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest mt-0.5 font-bold">/ {dailyGoal}</span>
              </div>
            </div>
            <p className={`text-[10px] font-medium ${goalPct === 100 ? 'text-emerald-400' : 'text-zinc-600'}`}>
              {goalPct === 100 ? '🎉 Daily goal reached!' : `${dailyGoal - stats.solvedToday} more to reach target`}
            </p>
          </div>

          {/* Difficulty Breakdown */}
          <div className={`${panelCls} p-4 flex flex-col flex-1`} style={panelBg}>
            <PanelHeader label="Solved by Difficulty" icon={Activity} />
            {difficultyData.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-[10px] text-zinc-700">
                Mark problems done to see breakdown.
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={22} outerRadius={34} paddingAngle={3} dataKey="value">
                        {difficultyData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  {difficultyData.map((e, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                        <span className="text-[10px] text-zinc-500 truncate">{e.name}</span>
                      </div>
                      <span className="font-mono text-xs text-zinc-300 font-semibold">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next Badge */}
          {nextBadge && (
            <div className={`${panelCls} p-4 flex flex-col flex-1`} style={panelBg}>
              <PanelHeader label="Next Badge" icon={Award} />
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-violet-500/15 bg-violet-500/[0.07] text-violet-400 shrink-0">
                  {(() => { const Icon = IconMap[nextBadge.icon] || Award; return <Icon className="w-4 h-4" />; })()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-zinc-200 truncate">{nextBadge.title}</h4>
                  <p className="text-[10px] text-zinc-600 mt-0.5 truncate">{nextBadge.description}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Progress</span>
                  <span className="font-mono text-zinc-400">{nextBadge.currentProgress} / {nextBadge.maxProgress}</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div className="bg-violet-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(nextBadge.currentProgress / nextBadge.maxProgress) * 100}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 3: Three Bottom Panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Weekly Activity Area Chart */}
        <div className={`${panelCls} p-4 flex flex-col h-[230px]`} style={panelBg}>
          <PanelHeader label="This Week's Activity" icon={TrendingUp} />
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="solvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#1f1f23" tick={{ fill: '#3f3f46', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#1f1f23" tick={{ fill: '#3f3f46', fontSize: 10 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(139,92,246,0.1)', strokeWidth: 1 }} formatter={(v) => [`${v} solved`, 'Problems']} />
                <Area type="monotone" dataKey="solved" stroke="#8b5cf6" strokeWidth={2} fill="url(#solvedGradient)"
                  dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#a78bfa', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Insights */}
        <div className={`${panelCls} p-4 flex flex-col h-[230px]`} style={panelBg}>
          <PanelHeader label="Topic Insights" icon={Layers} />
          <div className="grid grid-cols-2 gap-5 flex-1 overflow-hidden">
            {/* Strongest */}
            <div>
              <p className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest mb-2.5">💪 Strongest</p>
              {topTopics.length === 0 ? (
                <p className="text-[10px] text-zinc-700">Keep solving to see insights.</p>
              ) : (
                <div className="space-y-2.5">
                  {topTopics.map((t, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-0.5">
                        <span className="text-[10px] text-zinc-400 truncate mr-1 leading-none">{t.name}</span>
                        <span className="text-[10px] text-emerald-400 shrink-0 font-semibold font-mono">{t.completed}%</span>
                      </div>
                      <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.completed}%`, backgroundColor: '#10b981' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Needs Work */}
            <div>
              <p className="text-[9px] font-bold text-rose-500/70 uppercase tracking-widest mb-2.5">⚠ Needs Work</p>
              {weakTopics.length === 0 ? (
                <p className="text-[10px] text-zinc-700">All topics complete! 🎉</p>
              ) : (
                <div className="space-y-2.5">
                  {weakTopics.map((t, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-0.5">
                        <span className="text-[10px] text-zinc-400 truncate mr-1 leading-none">{t.name}</span>
                        <span className="text-[10px] text-rose-400 shrink-0 font-semibold font-mono">{t.completed}%</span>
                      </div>
                      <div className="h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.completed}%`, backgroundColor: '#ef4444' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recently Solved */}
        <div className={`${panelCls} p-4 flex flex-col h-[230px]`} style={panelBg}>
          <PanelHeader label="Recently Solved" icon={Clock} />
          {recentlySolved.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-zinc-700">Solve problems to see history.</p>
            </div>
          ) : (
            <div className="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
              {recentlySolved.map((q) => (
                <div key={q.id} className="flex items-center justify-between gap-2 group py-2 border-b border-white/[0.04] last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-300 truncate group-hover:text-violet-300 transition-colors leading-snug">{q.problem_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-zinc-600 truncate">{q.topic}</span>
                      <DiffDot d={q.difficulty} />
                      <SolveTags prog={q.prog} />
                    </div>
                  </div>
                  {q.link && (
                    <a href={q.link} target="_blank" rel="noreferrer"
                      className="p-1 rounded-md hover:bg-white/[0.05] text-zinc-700 hover:text-zinc-300 transition-colors shrink-0">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monkeytype Speed Profile Section */}
      <div className="mt-6">
        <MonkeytypePanel onOpenEditProfile={() => setIsLinkModalOpen(true)} />
      </div>

      {/* Link Monkeytype Modal */}
      <LinkMonkeytypeModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
      />

      {/* User profile modal */}
      {isProfileOpen && profile && (
        <UserProfileModal
          user={profile}
          progress={progress}
          questions={questions}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </motion.div>
  );
};

export default DashboardPage;
