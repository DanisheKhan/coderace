import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, Flame, Calendar, Activity, Crown, Award, X, Zap, 
  Sparkles, BookOpen, Workflow, BookmarkCheck, Layers, Network, 
  ExternalLink, CheckCircle2, Copy, Lightbulb, Eye, Search, Keyboard, TrendingUp, RefreshCw,
  Brain, Target, Star, ChevronRight, BarChart2, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { calculateUserAchievements } from '../lib/achievements';
import { getTypingProfile, fetchMonkeytypeData, syncTypingProfileToSupabase } from '../lib/monkeytypeService';
import { fetchUserAttempts } from '../lib/quizService';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants } from '../lib/animations';

const IconMap = {
  Award, Zap, Flame, Trophy, Calendar, Activity,
  Layers, Sparkles, BookOpen, Workflow,
  BookmarkCheck, Network
};

const tooltipStyle = {
  backgroundColor: '#0d0d0f',
  borderColor: 'rgba(255,255,255,0.07)',
  borderRadius: '10px',
  color: '#e4e4e7',
  fontSize: '11px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
};

// ── Solve Method & Approach Tags Component ─────────────────────────────────────
export const SolveTags = ({ prog }) => {
  if (!prog) return null;
  const { solve_method, brute_force, approach, optimized, revisit_count } = prog;

  const methodMap = {
    gpt:      { label: 'AI / GPT',    icon: Sparkles,  color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25' },
    copy:     { label: 'Copy-Paste', icon: Copy,      color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/25' },
    hint:     { label: 'Hint Used',  icon: Lightbulb, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/25' },
    solution: { label: 'Ans Seen',   icon: Eye,       color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/25' },
  };

  const method = methodMap[solve_method];

  const isOpt = optimized || approach;
  const isBrute = brute_force;
  let approachBadge = null;
  if (isBrute && isOpt) {
    approachBadge = { label: 'Both', color: 'text-violet-300', bg: 'bg-violet-500/10 border-violet-500/25' };
  } else if (isOpt) {
    approachBadge = { label: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' };
  } else if (isBrute) {
    approachBadge = { label: 'Brute', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' };
  }

  if (!method && !approachBadge && (!revisit_count || revisit_count <= 0)) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {method && (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold leading-none ${method.bg} ${method.color}`}>
          <method.icon className="w-2.5 h-2.5 shrink-0" />
          <span>{method.label}</span>
        </span>
      )}
      {approachBadge && (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold leading-none ${approachBadge.bg} ${approachBadge.color}`}>
          <span>{approachBadge.label}</span>
        </span>
      )}
      {revisit_count > 0 && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-rose-500/25 bg-rose-500/10 text-rose-400 text-[10px] font-mono font-bold leading-none">
          ↺ {revisit_count}×
        </span>
      )}
    </div>
  );
};

export const DiffDot = ({ d }) => {
  const color = d <= 2 ? '#10b981' : d === 3 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex gap-0.5 items-center">
      {[1,2,3,4,5].map(i => (
        <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: i <= d ? color : '#1f1f23' }} />
      ))}
    </div>
  );
};

export const formatRelativeTime = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d === 1) return 'yesterday';
  return `${d}d ago`;
};

// ── Circular Progress Component ─────────────────────────────────────────────────
const CircularProgress = ({ value, size = 56, strokeWidth = 5, color = '#7c3aed' }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
};

export const UserProfileModal = ({ user, progress, questions, onClose }) => {
  const { profile: currentProfile } = useAuth();
  const isCurrentUser = currentProfile && currentProfile.id === user.id;
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const userProgress = useMemo(() => progress.filter(p => p.user_id === user.id), [progress, user.id]);
  const [activeModalTab, setActiveModalTab] = useState('overview');
  const [modalSearch, setModalSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [expandedModalTopics, setExpandedModalTopics] = useState({});
  const [typingProfile, setTypingProfile] = useState(null);

  const handleSync = async () => {
    if (!isCurrentUser || !currentProfile?.monkeytype_ape_key) return;
    setSyncing(true);
    setSyncError('');
    try {
      const liveStats = await fetchMonkeytypeData(currentProfile.monkeytype_ape_key);
      const updatedProfile = await syncTypingProfileToSupabase(user.id, liveStats);
      setTypingProfile(updatedProfile);
    } catch (err) {
      setSyncError(err.message || 'Failed to sync with Monkeytype.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getTypingProfile(user.id).then(setTypingProfile);
    }
  }, [user?.id]);

  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoadingAttempts(true);
      fetchUserAttempts(user.id)
        .then(setQuizAttempts)
        .catch(err => console.error('Error fetching quiz attempts:', err))
        .finally(() => setLoadingAttempts(false));
    }
  }, [user?.id]);

  const quizStats = useMemo(() => {
    if (!quizAttempts || quizAttempts.length === 0) {
      return { best: null, total: 0, average: 0, recent: null };
    }
    const total = quizAttempts.length;
    const percentages = quizAttempts.map(a => Number(a.percentage));
    const best = [...quizAttempts].sort((a, b) => Number(b.percentage) - Number(a.percentage))[0];
    const average = Math.round(percentages.reduce((sum, val) => sum + val, 0) / total);
    const recent = quizAttempts[0];
    return { best, total, average, recent };
  }, [quizAttempts]);

  const { achievementsList, unlockedCount } = useMemo(() => {
    return calculateUserAchievements(user.id, progress, questions);
  }, [user.id, progress, questions]);

  const stats = useMemo(() => {
    const solved = userProgress.filter(p => p.status === 'done').length;
    const attempted = userProgress.filter(p => p.status === 'attempted').length;
    return { solved, attempted };
  }, [userProgress]);

  const topicData = useMemo(() => {
    const topics = {};
    questions.forEach(q => {
      if (!topics[q.topic]) topics[q.topic] = { total: 0, solved: 0 };
      topics[q.topic].total++;
    });
    userProgress.forEach(p => {
      if (p.status === 'done') {
        const q = questions.find(qi => qi.id === p.question_id);
        if (q && topics[q.topic]) topics[q.topic].solved++;
      }
    });
    return Object.keys(topics).map(name => {
      const d = topics[name];
      const pct = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
      return { name, completed: pct, solved: d.solved, total: d.total };
    });
  }, [questions, userProgress]);

  const recentlySolved = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'done')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 6)
      .map(p => {
        const q = questions.find(qi => qi.id === p.question_id);
        return q ? { ...q, solvedAt: p.updated_at, prog: p } : null;
      })
      .filter(Boolean);
  }, [userProgress, questions]);

  const allSolvedQuestions = useMemo(() => {
    const solvedProgress = userProgress.filter(p => p.status === 'done');
    return solvedProgress
      .map(p => {
        const q = questions.find(qi => qi.id === p.question_id);
        return q ? { ...q, solvedAt: p.updated_at, prog: p } : null;
      })
      .filter(Boolean)
      .filter(q => {
        if (modalSearch.trim()) {
          const s = modalSearch.toLowerCase();
          const matches = q.problem_name.toLowerCase().includes(s) ||
                          q.topic.toLowerCase().includes(s) ||
                          (q.subtopic || '').toLowerCase().includes(s);
          if (!matches) return false;
        }
        if (methodFilter === 'all') return true;
        if (methodFilter === 'gpt') return q.prog?.solve_method === 'gpt';
        if (methodFilter === 'copy') return q.prog?.solve_method === 'copy';
        if (methodFilter === 'hint') return q.prog?.solve_method === 'hint';
        if (methodFilter === 'solution') return q.prog?.solve_method === 'solution';
        if (methodFilter === 'optimal') return q.prog?.optimized || q.prog?.approach;
        if (methodFilter === 'revisit') return q.prog?.revisit_count > 0 || q.prog?.revisit;
        return true;
      })
      .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
  }, [userProgress, questions, modalSearch, methodFilter]);

  const allSolvedGrouped = useMemo(() => {
    const groups = {};
    allSolvedQuestions.forEach(q => {
      if (!groups[q.topic]) groups[q.topic] = [];
      groups[q.topic].push(q);
    });
    return groups;
  }, [allSolvedQuestions]);

  const totalQ = questions.length || 502;
  const pct = Math.round((stats.solved / totalQ) * 100);

  const accentColor = user.avatar_color || '#7c3aed';

  const TABS = [
    { id: 'overview', label: 'Overview',  icon: Activity,     activeClass: 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' },
    { id: 'solved',   label: `Solved (${stats.solved})`, icon: CheckCircle2, activeClass: 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' },
    { id: 'speed',    label: `Speed${typingProfile?.wpm_60 ? ` · ${typingProfile.wpm_60}` : ''}`, icon: Keyboard, activeClass: 'bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/30' },
    { id: 'quiz',     label: `Quiz${quizAttempts.length > 0 ? ` (${quizAttempts.length})` : ''}`,  icon: Brain, activeClass: 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={backdropVariants}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-2xl cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        className="w-full max-w-4xl overflow-hidden flex flex-col h-[90vh] max-h-[840px] mx-auto relative cursor-default"
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#0d0d0f',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 40px 100px -20px rgba(0,0,0,0.95)',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: `${accentColor}80` }} />

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 pt-4 pb-3.5 shrink-0 gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          {/* Avatar + Name */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-black text-white text-lg uppercase overflow-hidden"
                style={{
                  backgroundColor: user.avatar_url ? 'transparent' : accentColor,
                  boxShadow: `0 0 0 2px rgba(255,255,255,0.06), 0 0 24px ${accentColor}50`,
                }}
              >
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  : user.display_name?.charAt(0) || '?'
                }
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0a0a0d] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-zinc-50 text-sm sm:text-[15px] leading-tight tracking-tight truncate">
                  {user.display_name}
                </h3>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full font-mono tracking-wider"
                  style={{
                    background: `${accentColor}18`,
                    color: accentColor,
                    border: `1px solid ${accentColor}35`,
                  }}
                >
                  RACER
                </span>
              </div>
              <p className="text-[10px] text-zinc-600 mt-0.5 truncate">Stats, achievements & solved questions</p>
            </div>
          </div>

          {/* Right: Tabs + Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-wrap">
            {/* Tab pills */}
            <div
              className="flex p-1 gap-0.5 rounded-xl overflow-x-auto custom-scrollbar"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveModalTab(tab.id)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap ${
                      isActive ? tab.activeClass : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sync button */}
            {isCurrentUser && currentProfile?.monkeytype_ape_key && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50 group"
                style={{
                  background: syncing ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.06)',
                  borderColor: 'rgba(245,158,11,0.25)',
                  color: '#f59e0b',
                }}
                title="Sync latest stats from Monkeytype"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-200 cursor-pointer p-2 rounded-xl transition-all hover:bg-white/[0.06] flex items-center justify-center shrink-0"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ── STATS BANNER ────────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-6 pt-4 pb-0 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              {
                label: 'Solved', value: stats.solved, sub: `${pct}% done`,
                icon: Trophy, gradient: 'from-violet-600/10 to-violet-500/0',
                border: 'rgba(124,58,237,0.18)', glow: 'rgba(124,58,237,0.12)',
                iconBg: 'rgba(124,58,237,0.15)', iconColor: '#a78bfa', subColor: '#a78bfa',
                extra: <CircularProgress value={pct} size={42} strokeWidth={4} color="#7c3aed" />,
              },
              {
                label: 'Streak', value: `${user.streak ?? 0}d`, sub: 'Active streak',
                icon: Flame, gradient: 'from-orange-600/10 to-orange-500/0',
                border: 'rgba(249,115,22,0.18)', glow: 'rgba(249,115,22,0.12)',
                iconBg: 'rgba(249,115,22,0.15)', iconColor: '#fb923c', subColor: '#fb923c',
                extra: null,
              },
              {
                label: 'This Week', value: `+${user.solvedThisWeek ?? 0}`, sub: 'Last 7 days',
                icon: Calendar, gradient: 'from-emerald-600/10 to-emerald-500/0',
                border: 'rgba(16,185,129,0.18)', glow: 'rgba(16,185,129,0.12)',
                iconBg: 'rgba(16,185,129,0.15)', iconColor: '#34d399', subColor: '#34d399',
                extra: null,
              },
              {
                label: 'Badges', value: unlockedCount, sub: `/ ${achievementsList.length} total`,
                icon: Award, gradient: 'from-amber-600/10 to-amber-500/0',
                border: 'rgba(245,158,11,0.18)', glow: 'rgba(245,158,11,0.12)',
                iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24', subColor: '#fbbf24',
                extra: null,
              },
            ].map(({ label, value, sub, icon: Icon, gradient, border, glow, iconBg, iconColor, subColor, extra }) => (
              <div
                key={label}
                className={`p-3 rounded-xl relative overflow-hidden flex items-center justify-between group transition-all duration-300 hover:scale-[1.02]`}
                style={{
                  backgroundColor: 'rgba(14, 14, 18, 0.6)',
                  border: `1px solid ${border}`,
                }}
              >
                <div className="z-10">
                  <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block mb-1">{label}</span>
                  <span className="text-lg font-black text-zinc-50 leading-none block">{value}</span>
                  <span className="text-[10px] font-semibold block mt-1" style={{ color: subColor }}>{sub}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 shrink-0 z-10">
                  {extra ? (
                    <div className="relative flex items-center justify-center">
                      {extra}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
                      <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">

          {/* ── OVERVIEW TAB ─────────────────── */}
          {activeModalTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start animate-fadeIn">

              {/* Topic Completion */}
              <div
                className="rounded-2xl flex flex-col"
                style={{
                  height: 400,
                  background: 'rgba(14,14,18,0.8)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <div className="flex items-center gap-2 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Topic Completion</h4>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 custom-scrollbar">
                  {topicData.map(t => (
                    <div key={t.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-semibold truncate max-w-[160px]">{t.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                          <strong className="text-zinc-200">{t.solved}</strong>/{t.total}
                          <span className="text-zinc-700 ml-1">({t.completed}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.max(t.solved > 0 ? 3 : 0, t.completed)}%`,
                            backgroundColor: t.completed === 100
                              ? '#10b981'
                              : t.solved > 0
                              ? '#7c3aed'
                              : 'rgba(255,255,255,0.07)',
                            boxShadow: t.completed === 100
                              ? '0 0 8px rgba(16,185,129,0.4)'
                              : t.solved > 0
                              ? '0 0 8px rgba(124,58,237,0.3)'
                              : 'none',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column: Badges + Recent */}
              <div className="space-y-4 flex flex-col" style={{ height: 400 }}>

                {/* Badges */}
                <div
                  className="rounded-2xl shrink-0"
                  style={{
                    background: 'rgba(14,14,18,0.8)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Badges</h4>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">{unlockedCount}/{achievementsList.length}</span>
                  </div>
                  <div className="p-3">
                    {unlockedCount === 0 ? (
                      <p className="text-xs text-zinc-700 py-4 text-center">No badges unlocked yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                        {achievementsList.filter(ach => ach.unlocked).map(ach => {
                          const Icon = IconMap[ach.icon] || Award;
                          return (
                            <div key={ach.id} className={`flex items-center gap-2 p-2 rounded-xl border bg-gradient-to-br ${ach.color} text-zinc-100 shadow-sm`}>
                              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold truncate leading-tight">{ach.title}</p>
                                <p className="text-[8px] text-zinc-400 truncate uppercase tracking-wide">{ach.category}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recently Solved */}
                <div
                  className="rounded-2xl flex-1 flex flex-col min-h-0"
                  style={{
                    background: 'rgba(14,14,18,0.8)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Recently Solved</h4>
                    </div>
                    {recentlySolved.length > 0 && (
                      <button
                        onClick={() => setActiveModalTab('solved')}
                        className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer transition-colors flex items-center gap-0.5"
                      >
                        All <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {recentlySolved.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6">
                      <CheckCircle2 className="w-8 h-8 text-zinc-800" />
                      <p className="text-xs text-zinc-700">No solved questions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-1 flex-1 overflow-y-auto px-3 py-2.5 custom-scrollbar">
                      {recentlySolved.map(q => (
                        <div key={q.id} className="px-3 py-2.5 rounded-xl flex flex-col gap-1.5 group cursor-default transition-all duration-200 hover:bg-violet-500/[0.04]" style={{ border: '1px solid rgba(255,255,255,0.03)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)'}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-violet-300 transition-colors">{q.problem_name}</p>
                              <p className="text-[10px] text-zinc-600 truncate mt-0.5">{q.topic}{q.subtopic ? ` · ${q.subtopic}` : ''}</p>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-mono shrink-0">{formatRelativeTime(q.solvedAt)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <SolveTags prog={q.prog} />
                            {q.link && (
                              <a href={q.link} target="_blank" rel="noreferrer"
                                className="p-1 rounded-md text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-colors ml-auto shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SPEED TAB ──────────────────────── */}
          {activeModalTab === 'speed' && (
            <div className="space-y-4 animate-fadeIn max-w-2xl mx-auto">
              {syncError && (
                <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  {syncError}
                </div>
              )}
              {!typingProfile ? (
                <div className="py-14 flex flex-col items-center justify-center text-center rounded-2xl p-6" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                    <Keyboard className="w-7 h-7 text-amber-500/50" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-200">No Typing Profile Available</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
                    This user has not linked or synced their Monkeytype typing speed profile yet.
                  </p>
                </div>
              ) : (() => {
                const s = typingProfile;
                const topWPM = Math.max(s.wpm_15 || 0, s.wpm_30 || 0, s.wpm_60 || 0, s.wpm_120 || 0);
                const completionRate = s.tests_started > 0 ? Math.round((s.tests_completed / s.tests_started) * 100) : 0;
                const formatTime = (sec) => {
                  if (!sec) return '0m';
                  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
                  return h > 0 ? `${h}h ${m}m` : `${m}m`;
                };
                const chartData = [
                  { name: '15s', WPM: s.wpm_15 || 0 },
                  { name: '30s', WPM: s.wpm_30 || 0 },
                  { name: '60s', WPM: s.wpm_60 || 0 },
                  { name: '120s', WPM: s.wpm_120 || 0 },
                ].filter(d => d.WPM > 0);
                const modes = [
                  { label: '15s', wpm: s.wpm_15, acc: s.acc_15, consistency: s.consistency_15 },
                  { label: '30s', wpm: s.wpm_30, acc: s.acc_30, consistency: s.consistency_30 },
                  { label: '60s', wpm: s.wpm_60, acc: s.acc_60, consistency: s.consistency_60 },
                  { label: '120s', wpm: s.wpm_120, acc: s.acc_120, consistency: s.consistency_120 },
                ];

                return (
                  <div className="space-y-4">
                    {/* Peak hero */}
                    <div className="rounded-2xl p-4 flex items-center justify-between relative overflow-hidden"
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245,158,11,0.18)',
                      }}
                    >
                      <div className="absolute right-4 opacity-[0.05]"><TrendingUp className="w-20 h-20 text-amber-400" /></div>
                      <div>
                        <span className="text-[8px] uppercase font-black text-amber-500/70 tracking-widest block mb-1">Peak WPM · All Modes</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">{topWPM > 0 ? topWPM : '--'}</span>
                          <span className="text-xs font-bold text-amber-600 uppercase">WPM</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase font-black text-zinc-600 tracking-widest block mb-1">Tests Done</span>
                        <span className="text-2xl font-black text-zinc-200 font-mono">{s.tests_completed?.toLocaleString() || 0}</span>
                      </div>
                    </div>

                    {/* Stats + Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl p-3 space-y-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-amber-400" /> Monkeytype Activity
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: 'Started', value: s.tests_started?.toLocaleString() || 0, color: '#e4e4e7' },
                            { label: 'Completed', value: s.tests_completed?.toLocaleString() || 0, color: '#e4e4e7' },
                            { label: 'Completion', value: `${completionRate}%`, color: '#34d399' },
                            { label: 'Time Spent', value: formatTime(s.time_typing), color: '#a78bfa' },
                          ].map(item => (
                            <div key={item.label} className="p-1.5 rounded-lg text-center" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.03)' }}>
                              <span className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-0.5">{item.label}</span>
                              <span className="text-xs font-black font-mono" style={{ color: item.color }}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl p-3 flex flex-col min-h-[130px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5 mb-1.5">
                          <Zap className="w-3 h-3 text-amber-400" /> Speed Curve (WPM)
                        </span>
                        <div className="flex-1 min-h-[85px]">
                          {chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-700 text-xs">No data yet</div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                <XAxis dataKey="name" stroke="#3f3f46" fontSize={8} tickLine={false} axisLine={false} />
                                <YAxis stroke="#3f3f46" fontSize={8} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="WPM" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={22} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mode breakdown */}
                    <div>
                      <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5 mb-2">
                        <Award className="w-3 h-3 text-amber-400" /> Category Benchmark Breakdown
                      </span>
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                        {modes.map(item => {
                          const isBest = item.wpm && item.wpm === topWPM && topWPM > 0;
                          const barPct = topWPM > 0 && item.wpm ? Math.min(100, Math.round((item.wpm / 150) * 100)) : 0;
                          const accColor = item.acc >= 98 ? '#34d399' : item.acc >= 95 ? '#fbbf24' : '#71717a';
                          return (
                            <div
                              key={item.label}
                              className="rounded-xl p-2.5 relative overflow-hidden transition-all duration-200 hover:scale-[1.02]"
                              style={{
                                backgroundColor: isBest ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                border: isBest ? '1px solid rgba(245,158,11,0.28)' : '1px solid rgba(255,255,255,0.05)',
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest">{item.label}</span>
                                {isBest && (
                                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                    <Star className="w-2 h-2 text-amber-400 fill-amber-400" />
                                    <span className="text-[7px] font-black text-amber-400 uppercase">Best</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black font-mono" style={{ color: isBest ? '#fbbf24' : '#e4e4e7' }}>{item.wpm ?? '--'}</span>
                                <span className="text-[8px] text-zinc-600 font-semibold uppercase">wpm</span>
                              </div>
                              <div className="mt-1.5 space-y-0.5 pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-zinc-600">Accuracy</span>
                                  <span className="font-bold font-mono" style={{ color: accColor }}>{item.acc != null ? `${item.acc}%` : '--'}</span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-zinc-600">Consistency</span>
                                  <span className="font-bold font-mono text-amber-400/80">{item.consistency != null ? `${item.consistency}%` : '--'}</span>
                                </div>
                              </div>
                              <div className="w-full rounded-full mt-2 overflow-hidden" style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                                <div className="h-full rounded-full transition-all duration-700" style={{
                                  width: `${barPct}%`,
                                  backgroundColor: isBest ? '#f59e0b' : '#7c3aed',
                                }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {s.last_synced && (
                      <div className="text-center text-[9px] font-mono text-zinc-700 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        Last synced from Monkeytype · {new Date(s.last_synced).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── SOLVED TAB ──────────────────────── */}
          {activeModalTab === 'solved' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    placeholder="Search by name, topic or subtopic…"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl text-zinc-200 placeholder:text-zinc-650 focus:outline-none transition-all glass-input"
                  />
                  {modalSearch && (
                    <button onClick={() => setModalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 text-xs">×</button>
                  )}
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full custom-scrollbar" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'gpt', label: 'AI', icon: Sparkles, color: 'text-violet-400' },
                    { key: 'copy', label: 'Copy', icon: Copy, color: 'text-rose-400' },
                    { key: 'hint', label: 'Hint', icon: Lightbulb, color: 'text-amber-400' },
                    { key: 'solution', label: 'Seen', icon: Eye, color: 'text-sky-400' },
                    { key: 'optimal', label: 'Optimal', color: 'text-emerald-400' },
                    { key: 'revisit', label: 'Revisit', color: 'text-rose-400' },
                  ].map(({ key, label, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => setMethodFilter(key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        methodFilter === key
                          ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                          : `${color || 'text-zinc-500'} hover:text-zinc-200 hover:bg-white/5`
                      }`}
                    >
                      {Icon && <Icon className="w-3 h-3" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {Object.keys(allSolvedGrouped).length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="text-xs text-zinc-600">No solved questions match your filter criteria.</p>
                  {(modalSearch || methodFilter !== 'all') && (
                    <button onClick={() => { setModalSearch(''); setMethodFilter('all'); }} className="mt-3 text-xs text-violet-400 hover:underline font-semibold cursor-pointer">
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {Object.entries(allSolvedGrouped).map(([topic, topicQs]) => {
                    const isExpanded = expandedModalTopics[topic] !== false;
                    return (
                      <div key={topic} className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                          onClick={() => setExpandedModalTopics(prev => ({ ...prev, [topic]: !isExpanded }))}
                          className="w-full flex items-center justify-between px-4 py-2.5 transition-colors cursor-pointer select-none"
                          style={{ background: isExpanded ? 'rgba(18,18,24,0.95)' : 'rgba(14,14,18,0.8)' }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-300">{topic}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                              {topicQs.length} solved
                            </span>
                          </div>
                          <span className="text-zinc-600 text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                        </button>
                        {isExpanded && (
                          <div className="divide-y" style={{ background: 'rgba(11,11,14,0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
                            {topicQs.map(q => (
                              <div key={q.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-white/[0.02] transition-colors">
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-zinc-700">#{q.sr_no}</span>
                                    <span className="text-xs font-semibold text-zinc-200 truncate">{q.problem_name}</span>
                                    <DiffDot d={q.difficulty} />
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                                    <span>{q.subtopic || 'General'}</span>
                                    <span>·</span>
                                    <span className="font-mono">{formatRelativeTime(q.solvedAt)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
                                  <SolveTags prog={q.prog} />
                                  {q.link && (
                                    <a href={q.link} target="_blank" rel="noreferrer"
                                      className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors shrink-0"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── QUIZ TAB ──────────────────────────────────── */}
          {activeModalTab === 'quiz' && (
            <div className="animate-fadeIn">
              {loadingAttempts ? (
                <div className="py-24 flex flex-col items-center justify-center text-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-violet-400 animate-pulse" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl animate-ping" style={{ background: 'rgba(124,58,237,0.1)' }} />
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Loading quiz attempts…</p>
                </div>
              ) : quizAttempts.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-4 rounded-2xl" style={{ border: '1px dashed rgba(124,58,237,0.15)', background: 'rgba(124,58,237,0.02)' }}>
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-violet-500/40" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <span className="text-[9px] text-zinc-600">0</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">No Quiz Attempts Yet</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
                      Head over to the <span className="text-violet-400 font-semibold">Java Quiz</span> section to test your knowledge and start tracking your progress!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">

                  {/* ── Stats Grid ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Personal Best — large hero */}
                    <div
                      className="sm:col-span-2 rounded-2xl p-5 relative overflow-hidden flex items-center justify-between"
                      style={{
                        backgroundColor: 'rgba(124, 58, 237, 0.05)',
                        border: '1px solid rgba(124,58,237,0.22)',
                      }}
                    >
                      {/* decorative bg icon */}
                      <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none select-none">
                        <Brain className="w-32 h-32 text-violet-400" />
                      </div>

                      <div className="z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
                            <Trophy className="w-3.5 h-3.5 text-violet-300" />
                          </div>
                          <span className="text-[9px] uppercase font-black text-violet-400/70 tracking-widest">Personal Best</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black font-mono tracking-tight" style={{ color: '#a78bfa', textShadow: '0 0 30px rgba(167,139,250,0.4)' }}>
                            {quizStats.best ? quizStats.best.score : '--'}
                          </span>
                          <span className="text-zinc-500 text-lg font-bold">/{quizStats.best?.total ?? '--'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(167,139,250,0.15)',
                              border: '1px solid rgba(167,139,250,0.3)',
                              color: '#a78bfa',
                            }}
                          >
                            {quizStats.best ? Math.round(Number(quizStats.best.percentage)) : 0}% Accuracy
                          </span>
                          {quizStats.best && (
                            <span className="text-[10px] text-zinc-600 font-mono">
                              {formatRelativeTime(quizStats.best.completed_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Circular progress */}
                      <div className="relative shrink-0 z-10 flex items-center justify-center mr-2">
                        <CircularProgress
                          value={quizStats.best ? Math.round(Number(quizStats.best.percentage)) : 0}
                          size={80}
                          strokeWidth={6}
                          color="#7c3aed"
                        />
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-base font-black text-violet-300 font-mono leading-none">
                            {quizStats.best ? Math.round(Number(quizStats.best.percentage)) : 0}
                          </span>
                          <span className="text-[8px] text-zinc-600 font-bold">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Secondary stats */}
                    <div className="flex flex-col gap-3">
                      <div
                        className="flex-1 rounded-2xl p-4 flex flex-col justify-between"
                        style={{
                          background: 'rgba(16,185,129,0.06)',
                          border: '1px solid rgba(16,185,129,0.18)',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Avg Accuracy</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black font-mono text-emerald-400">{quizStats.average}</span>
                          <span className="text-sm font-bold text-emerald-600">%</span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${quizStats.average}%`, backgroundColor: '#059669', boxShadow: '0 0 8px rgba(52,211,153,0.4)' }} />
                        </div>
                      </div>
                      <div
                        className="flex-1 rounded-2xl p-4 flex flex-col justify-between"
                        style={{
                          background: 'rgba(99,102,241,0.06)',
                          border: '1px solid rgba(99,102,241,0.18)',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <Target className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Total Attempts</span>
                        </div>
                        <span className="text-3xl font-black font-mono text-indigo-300">{quizStats.total}</span>
                        <span className="text-[10px] text-zinc-600 mt-1">quizzes taken</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Attempts History ── */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#7c3aed' }} />
                      <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Attempt History</span>
                      <span className="text-[10px] font-mono text-zinc-700 ml-auto">{quizAttempts.length} total</span>
                    </div>
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                      {quizAttempts.map((attempt, index) => {
                        const p = Math.round(Number(attempt.percentage));
                        const isBest = attempt.id === quizStats.best?.id;

                        let tier, tierColor, tierBg, tierBorder, barColor;
                        if (p === 100) {
                          tier = '✦ Perfect'; tierColor = '#fbbf24'; tierBg = 'rgba(245,158,11,0.10)'; tierBorder = 'rgba(245,158,11,0.25)'; barColor = '#f59e0b';
                        } else if (p >= 90) {
                          tier = 'Elite'; tierColor = '#34d399'; tierBg = 'rgba(16,185,129,0.08)'; tierBorder = 'rgba(16,185,129,0.2)'; barColor = '#10b981';
                        } else if (p >= 70) {
                          tier = 'Advanced'; tierColor = '#60a5fa'; tierBg = 'rgba(59,130,246,0.08)'; tierBorder = 'rgba(59,130,246,0.2)'; barColor = '#3b82f6';
                        } else if (p >= 50) {
                          tier = 'Passing'; tierColor = '#fbbf24'; tierBg = 'rgba(245,158,11,0.08)'; tierBorder = 'rgba(245,158,11,0.2)'; barColor = '#f59e0b';
                        } else {
                          tier = 'Practice'; tierColor = '#f87171'; tierBg = 'rgba(239,68,68,0.08)'; tierBorder = 'rgba(239,68,68,0.2)'; barColor = '#ef4444';
                        }

                        return (
                          <div
                            key={attempt.id || index}
                            className="group rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 hover:scale-[1.005]"
                            style={{
                              backgroundColor: isBest ? 'rgba(124, 58, 237, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                              border: isBest ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            {isBest && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: '#7c3aed' }} />}

                            {/* Left: icon + info */}
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative"
                                style={{ background: tierBg, border: `1px solid ${tierBorder}` }}
                              >
                                <Brain className="w-5 h-5" style={{ color: tierColor }} />
                                {isBest && (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#7c3aed' }}>
                                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold text-zinc-200">Java Concepts Quiz</h5>
                                  {isBest && (
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)' }}>
                                      BEST
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock className="w-3 h-3 text-zinc-700" />
                                  <span className="text-[10px] text-zinc-600">
                                    {new Date(attempt.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    <span className="mx-1 text-zinc-700">·</span>
                                    {formatRelativeTime(attempt.completed_at)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: score + bar + badge */}
                            <div className="flex items-center gap-5 sm:ml-auto">
                              {/* Score fraction */}
                              <div className="text-center">
                                <div className="flex items-baseline gap-0.5">
                                  <span className="text-xl font-black font-mono text-zinc-100">{attempt.score}</span>
                                  <span className="text-zinc-600 text-sm">/</span>
                                  <span className="text-sm font-bold text-zinc-500 font-mono">{attempt.total}</span>
                                </div>
                                <span className="text-[9px] uppercase tracking-wider text-zinc-700 font-semibold">score</span>
                              </div>

                              {/* Progress bar + pct */}
                              <div className="flex flex-col items-end gap-1.5 min-w-[80px]">
                                <span className="text-[10px] font-black" style={{ color: tierColor }}>{p}%</span>
                                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${p}%`, background: barColor, boxShadow: `0 0 6px ${barColor}80` }}
                                  />
                                </div>
                                <span
                                  className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                                  style={{ background: tierBg, color: tierColor, border: `1px solid ${tierBorder}` }}
                                >
                                  {tier}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Duplicate speed/monkeytype secondary rendering block */}
          {activeModalTab === 'speed' && (
            <div style={{ display: 'none' }} />
          )}
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <div
          className="flex justify-between items-center px-5 sm:px-6 py-3 shrink-0"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(10,10,13,0.95)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="text-[10px] text-zinc-600 font-mono">Realtime sync active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#a1a1aa',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f4f4f5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#a1a1aa'; }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfileModal;
