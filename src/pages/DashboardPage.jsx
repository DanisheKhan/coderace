import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import { useProgressStore } from '../store/progressStore';
import { SolveTags, UserProfileModal, getDifficultyLabel } from '../components/UserProfileModal';
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
import GitHubStreakTracker from '../components/GitHubStreakTracker';
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
const panelCls = 'rounded-xl border border-zinc-800 bg-zinc-900/40';
const panelBg  = { background: 'rgba(13, 13, 17, 0.4)' };

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, unit, sub, subColor = 'text-zinc-500', icon: Icon, accentBorder, accentBg, accentIcon }) => (
  <motion.div 
    variants={fadeUp}
    whileHover={{ y: -2, transition: { duration: 0.15 } }}
    className={`${panelCls} p-4 flex items-center justify-between gap-3 ${accentBorder || ''}`}
  >
    <div className="space-y-1 min-w-0">
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate">{label}</p>
      <div className="flex items-baseline gap-1 leading-none">
        <span className="text-xl font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-zinc-500 text-xs font-normal">{unit}</span>}
      </div>
      <p className={`text-[10px] font-medium flex items-center gap-1 truncate ${subColor}`}>{sub}</p>
    </div>
    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${accentBg || 'bg-zinc-900 border-zinc-800'} ${accentIcon || 'text-zinc-300'}`}>
      <Icon className="w-4 h-4" />
    </div>
  </motion.div>
);

// ── Panel Section Header ──────────────────────────────────────────────────────
const PanelHeader = ({ label, icon: Icon, extra }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-zinc-400" />
      </div>
      <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">{label}</h3>
    </div>
    {extra}
  </div>
);

// ── Topic Completion Panel ─────────────────────────────────────────────────────
const TopicCompletionPanel = ({ topicData }) => {
  const [filter, setFilter] = useState('all');

  const filteredTopics = useMemo(() => {
    if (filter === 'active') return topicData.filter(t => t.solved > 0 && t.completed < 100);
    if (filter === 'done')   return topicData.filter(t => t.completed === 100);
    return topicData;
  }, [topicData, filter]);

  const activeCount = useMemo(() => topicData.filter(t => t.solved > 0 && t.completed < 100).length, [topicData]);
  const doneCount   = useMemo(() => topicData.filter(t => t.completed === 100).length, [topicData]);
  const startedCount= useMemo(() => topicData.filter(t => t.solved > 0).length, [topicData]);

  return (
    <div className={`${panelCls} flex flex-col h-full min-h-[482px] lg:col-span-2`} style={panelBg}>
      <div className="px-4 py-3.5 border-b border-zinc-800/80 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Topic Completion</h3>
            <span className="text-[10px] font-mono text-zinc-500">
              {startedCount}/{topicData.length} started
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5 ml-8">Problem solving progress per topic</p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          {[
            { id: 'all',    label: `All (${topicData.length})` },
            { id: 'active', label: `Active (${activeCount})` },
            { id: 'done',   label: `Done (${doneCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3 max-h-[416px]">
        {filteredTopics.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No topics match the selected filter.
          </div>
        ) : (
          filteredTopics.map(t => (
            <div key={t.name} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-200 font-medium truncate max-w-[240px] sm:max-w-[320px]">{t.name}</span>
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                  <strong className="text-white">{t.solved}</strong>/{t.total}
                  <span className="text-zinc-500 ml-1">({t.completed}%)</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(t.solved > 0 ? 3 : 0, t.completed)}%`,
                    backgroundColor: t.completed === 100
                      ? '#10b981'
                      : t.solved > 0
                      ? '#8b5cf6'
                      : '#27272a',
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { profile } = useAuth();
  const { questions } = useQuestions();
  const { progress } = useProgressStore();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem('coderace-daily-goal');
    if (saved && saved !== '5') {
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    localStorage.setItem('coderace-daily-goal', '3');
    return 3;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);

  const userProgress = useMemo(() => {
    if (!profile) return [];
    return progress.filter(p => p.user_id === profile.id);
  }, [profile, progress]);

  const achievementsList = useMemo(() => {
    if (!profile) return [];
    const { achievementsList: list } = calculateUserAchievements(profile.id, progress, questions);
    return list;
  }, [profile, progress, questions]);

  const unlockedCount = useMemo(() => {
    return achievementsList.filter(ach => ach.unlocked).length;
  }, [achievementsList]);

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
    const now = new Date();
    const sundayStart = new Date(now);
    sundayStart.setHours(0, 0, 0, 0);
    sundayStart.setDate(now.getDate() - now.getDay());
    const sundayEnd = new Date(sundayStart);
    sundayEnd.setDate(sundayStart.getDate() + 7);

    const solvedThisWeek = done.filter(p => {
      const t = new Date(p.updated_at).getTime();
      return t >= sundayStart.getTime() && t < sundayEnd.getTime();
    }).length;
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
        const q = questions.find(qi => String(qi.id) === String(p.question_id));
        if (q && topics[q.topic]) topics[q.topic].solved++;
      }
    });
    return Object.keys(topics).map(name => {
      const d = topics[name];
      const completed = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
      return { name, completed, solved: d.solved, total: d.total };
    });
  }, [questions, userProgress]);

  const difficultyData = useMemo(() => {
    const map = { Easy: 0, Medium: 0, Hard: 0 };
    userProgress.forEach(p => {
      if (p.status === 'done') {
        const q = questions.find(qi => String(qi.id) === String(p.question_id));
        if (q && q.difficulty !== undefined && q.difficulty !== null) {
          const label = getDifficultyLabel(q.difficulty);
          if (map[label] !== undefined) map[label]++;
        }
      }
    });
    return [
      { name: 'Easy',   value: map.Easy,   color: '#10b981' },
      { name: 'Medium', value: map.Medium, color: '#f59e0b' },
      { name: 'Hard',   value: map.Hard,   color: '#ef4444' },
    ];
  }, [questions, userProgress]);

  const recentSolved = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'done')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5)
      .map(p => {
        const q = questions.find(qi => qi.id === p.question_id);
        return q ? { ...q, solvedAt: p.updated_at, prog: p } : null;
      })
      .filter(Boolean);
  }, [userProgress, questions]);

  const weeklyActivity = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = days.map(day => ({ day, solved: 0 }));
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    userProgress.forEach(p => {
      if (p.status === 'done') {
        const d = new Date(p.updated_at);
        if (d >= startOfWeek) {
          result[d.getDay()].solved++;
        }
      }
    });
    return result;
  }, [userProgress]);

  const { strongestTopic, weakestTopic } = useMemo(() => {
    const started = topicData.filter(t => t.solved > 0);
    if (!started.length) return { strongestTopic: null, weakestTopic: null };
    const sorted = [...started].sort((a, b) => b.completed - a.completed);
    return {
      strongestTopic: sorted[0],
      weakestTopic: sorted[sorted.length - 1],
    };
  }, [topicData]);

  const goalPct = Math.min(100, Math.round((stats.solvedToday / dailyGoal) * 100));
  const totalGoalCircumference = 2 * Math.PI * 48;

  const saveGoal = (val) => {
    const num = Math.max(1, Math.min(50, Number(val) || 5));
    setDailyGoal(num);
    localStorage.setItem('coderace-daily-goal', num);
    setEditingGoal(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="space-y-6 pb-12 font-sans transform-gpu"
    >
      {/* ── Header ── */}
      <div className="pb-4 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Welcome back, <span className="text-zinc-300 font-semibold">{profile?.display_name}</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5 font-normal">Your DSA progress & race analytics snapshot.</p>
        </div>
        
        <button
          onClick={() => setIsProfileOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* ── GitHub Style Contribution Heatmap ── */}
      <motion.div variants={fadeUp}>
        <GitHubStreakTracker
          progress={progress}
          userId={profile?.id}
          title="DSA Contribution Heatmap"
        />
      </motion.div>

      {/* ── Row 2: Topic Completion + Right Column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopicCompletionPanel topicData={topicData} />

        <div className="flex flex-col gap-4 min-h-[482px]">

          {/* Daily Goal Ring */}
          <div className={`${panelCls} p-4 flex flex-col flex-1 items-center text-center justify-between`} style={panelBg}>
            <PanelHeader label="Daily Goal" icon={Zap} extra={
              <button
                onClick={() => {
                  setTempGoal(dailyGoal);
                  setEditingGoal(!editingGoal);
                }}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono transition-colors cursor-pointer"
                title="Edit daily goal target"
              >
                {editingGoal ? 'cancel' : 'edit'}
              </button>
            } />

            {editingGoal ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2">
                <p className="text-xs text-zinc-400 font-medium">Set Daily Target</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-center text-sm text-white font-mono focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => saveGoal(tempGoal)}
                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative w-20 h-20 flex items-center justify-center cursor-pointer" onClick={() => { setTempGoal(dailyGoal); setEditingGoal(true); }}>
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
                  {goalPct === 100 ? '🎉 Daily goal reached!' : `${Math.max(0, dailyGoal - stats.solvedToday)} more to reach target`}
                </p>
              </>
            )}
          </div>

          {/* Difficulty Breakdown */}
          <div className={`${panelCls} p-4 flex flex-col flex-1`} style={panelBg}>
            <PanelHeader label="Solved By Difficulty" icon={Activity} />
            {stats.solved === 0 ? (
              <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs italic">
                No problems solved yet
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-3">
                <div className="w-24 h-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={difficultyData.filter(d => d.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={40}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {difficultyData.filter(d => d.value > 0).map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  {difficultyData.map(d => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-zinc-400 font-medium">{d.name}</span>
                      </div>
                      <span className="font-bold text-white font-mono">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next Badge Progress Card */}
          <div className={`${panelCls} p-4 flex flex-col flex-1`} style={panelBg}>
            <PanelHeader label="Next Badge" icon={Award} />
            {nextBadge ? (
              <div className="flex-1 flex flex-col justify-between space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                    {React.createElement(IconMap[nextBadge.icon] || Award, { className: 'w-4.5 h-4.5' })}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-100 truncate">{nextBadge.title}</h4>
                    <p className="text-[10px] text-zinc-500 truncate">{nextBadge.description}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span>Progress</span>
                    <span>{nextBadge.currentProgress} / {nextBadge.maxProgress}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (nextBadge.currentProgress / nextBadge.maxProgress) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 italic">
                All milestone badges unlocked!
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Row 3: Weekly Activity, Topic Insights, Recently Solved ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Weekly Bar Chart */}
        <div className={`${panelCls} p-4 flex flex-col h-64`} style={panelBg}>
          <PanelHeader label="This Week's Activity" icon={Activity} />
          <div className="flex-1 min-h-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <XAxis dataKey="day" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="solved" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strongest / Needs Work Insights */}
        <div className={`${panelCls} p-4 flex flex-col justify-between h-64`} style={panelBg}>
          <PanelHeader label="Topic Insights" icon={Sparkles} />
          
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider font-bold">💪 Strongest Topic</span>
              <p className="text-xs font-bold text-zinc-100 truncate">
                {strongestTopic ? `${strongestTopic.name} (${strongestTopic.completed}%)` : 'No topic data yet'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider font-bold">⚠️ Needs Focus</span>
              <p className="text-xs font-bold text-zinc-100 truncate">
                {weakestTopic ? `${weakestTopic.name} (${weakestTopic.completed}%)` : 'No topic data yet'}
              </p>
            </div>
          </div>
        </div>

        {/* Recently Solved */}
        <div className={`${panelCls} p-4 flex flex-col h-64`} style={panelBg}>
          <PanelHeader label="Recently Solved" icon={Clock} />
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
            {recentSolved.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-zinc-600 italic">
                No recent activity.
              </div>
            ) : (
              recentSolved.map(q => (
                <div
                  key={q.id}
                  onClick={() => navigate(`/sheet?search=${encodeURIComponent(q.problem_name)}`)}
                  className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-2 text-xs group cursor-pointer transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">{q.problem_name}</p>
                    <p className="text-[9px] text-zinc-500 truncate">{q.topic}</p>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold shrink-0 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
                    Sheet ↗
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

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
