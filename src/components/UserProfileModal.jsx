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
import GitHubStreakTracker from './GitHubStreakTracker';
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
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${method.bg} ${method.color}`}>
          <method.icon className="w-2.5 h-2.5" />
          <span>{method.label}</span>
        </span>
      )}
      {approachBadge && (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${approachBadge.bg} ${approachBadge.color}`}>
          {approachBadge.label}
        </span>
      )}
      {revisit_count > 0 && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <span>🔄</span>
          <span>{revisit_count}x</span>
        </span>
      )}
    </div>
  );
};

export const DiffDot = ({ difficulty }) => {
  const colors = {
    Easy: 'bg-emerald-400',
    Medium: 'bg-amber-400',
    Hard: 'bg-red-400',
  };
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[difficulty] || 'bg-zinc-500'}`} />;
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function UserProfileModal({ user, progress, questions, onClose }) {
  const [activeModalTab, setActiveModalTab] = useState('overview'); // 'overview' | 'solved' | 'speed' | 'quiz'
  const [solvedSearch, setSolvedSearch] = useState('');
  const [solvedDiffFilter, setSolvedDiffFilter] = useState('all');
  const [typingProfile, setTypingProfile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const { currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user?.id;

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const userProgress = useMemo(() => {
    return progress.filter(p => p.user_id === user?.id);
  }, [progress, user?.id]);

  const accentColor = user?.avatar_color || '#6366f1';

  const handleSync = async () => {
    if (!user?.id) return;
    setSyncing(true);
    setSyncError('');
    try {
      if (user.monkeytype_ape_key) {
        const liveStats = await fetchMonkeytypeData(user.monkeytype_ape_key);
        const updated = await syncTypingProfileToSupabase(user.id, liveStats);
        setTypingProfile(updated);
      } else {
        const updated = await getTypingProfile(user.id);
        if (updated) setTypingProfile(updated);
      }
    } catch (err) {
      setSyncError(err.message || 'Sync failed.');
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
        .finally(() => setLoadingAttempts(false));
    }
  }, [user?.id]);

  const stats = useMemo(() => {
    const totalQ = questions.length;
    const solved = userProgress.filter(p => p.status === 'done').length;

    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const solvedThisWeek = userProgress.filter(
      p => p.status === 'done' && new Date(p.updated_at).getTime() >= sevenDaysAgo
    ).length;

    const doneDates = userProgress
      .filter(p => p.status === 'done')
      .map(p => {
        const d = new Date(p.updated_at);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });

    let streak = 0;
    if (doneDates.length) {
      const unique = [...new Set(doneDates)].sort((a, b) => b - a);
      const today = new Date();
      const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const yesterdayMs = todayMs - 86400000;
      if (unique[0] === todayMs || unique[0] === yesterdayMs) {
        streak = 1;
        for (let i = 0; i < unique.length - 1; i++) {
          if (unique[i] - unique[i + 1] === 86400000) streak++;
          else if (unique[i] === unique[i + 1]) continue;
          else break;
        }
      }
    }

    const { unlockedCount, achievementsList } = calculateUserAchievements(user?.id, progress, questions);
    const achievements = achievementsList || [];

    return { totalQ, solved, solvedThisWeek, streak, unlockedCount, achievements };
  }, [userProgress, questions, user?.id, progress]);

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
      const completed = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
      return { name, completed, solved: d.solved, total: d.total };
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

  const allSolvedList = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'done')
      .map(p => {
        const q = questions.find(qi => qi.id === p.question_id);
        return q ? { ...q, solvedAt: p.updated_at, prog: p } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
  }, [userProgress, questions]);

  const filteredSolvedList = useMemo(() => {
    return allSolvedList.filter(item => {
      const matchesSearch = !solvedSearch.trim() ||
        item.problem_name.toLowerCase().includes(solvedSearch.toLowerCase()) ||
        item.topic.toLowerCase().includes(solvedSearch.toLowerCase()) ||
        (item.subtopic || '').toLowerCase().includes(solvedSearch.toLowerCase());

      const matchesDiff = solvedDiffFilter === 'all' || item.difficulty === solvedDiffFilter;

      return matchesSearch && matchesDiff;
    });
  }, [allSolvedList, solvedSearch, solvedDiffFilter]);

  const pct = questions.length > 0 ? Math.round((stats.solved / questions.length) * 100) : 0;

  // ── Monkeytype Speed Helpers ──
  const topWPM = Math.max(
    typingProfile?.wpm_15 || 0,
    typingProfile?.wpm_30 || 0,
    typingProfile?.wpm_60 || 0,
    typingProfile?.wpm_120 || 0
  );

  const completionRate = typingProfile?.tests_started > 0
    ? Math.round((typingProfile.tests_completed / typingProfile.tests_started) * 100)
    : 0;

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const speedModes = [
    { label: '15s', wpm: typingProfile?.wpm_15, acc: typingProfile?.acc_15, consistency: typingProfile?.consistency_15 },
    { label: '30s', wpm: typingProfile?.wpm_30, acc: typingProfile?.acc_30, consistency: typingProfile?.consistency_30 },
    { label: '60s', wpm: typingProfile?.wpm_60, acc: typingProfile?.acc_60, consistency: typingProfile?.consistency_60 },
    { label: '120s', wpm: typingProfile?.wpm_120, acc: typingProfile?.acc_120, consistency: typingProfile?.consistency_120 },
  ];

  const TABS = [
    { id: 'overview', label: 'Overview',                                         icon: BarChart2 },
    { id: 'solved',   label: `Solved (${allSolvedList.length})`,                 icon: CheckCircle2 },
    { id: 'speed',    label: `Speed${topWPM > 0 ? ` · ${topWPM}` : ''}`,          icon: Keyboard },
    { id: 'quiz',     label: `Quiz${quizAttempts.length > 0 ? ` (${quizAttempts.length})` : ''}`,  icon: Brain },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={backdropVariants}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md cursor-pointer font-sans"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        className="w-full max-w-4xl overflow-hidden flex flex-col h-[90vh] max-h-[840px] mx-auto relative cursor-default bg-[#09090b] rounded-xl border border-zinc-800 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 sm:px-6 pt-4 pb-3.5 shrink-0 gap-3 border-b border-zinc-800/80">
          {/* Avatar + Name + User ID */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm uppercase overflow-hidden border border-zinc-700"
                style={{
                  backgroundColor: user?.avatar_url ? 'transparent' : accentColor,
                }}
              >
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  : user?.display_name?.charAt(0) || '?'
                }
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#09090b]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight truncate">
                  {user?.display_name}
                </h3>
                {user?.username && (
                  <span className="text-xs font-mono text-amber-400 font-semibold">
                    @{user.username}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                  {user?.is_admin ? 'ADMIN' : 'RACER'}
                </span>
              </div>
              
              {/* User ID & Copy Button */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <button
                  onClick={handleCopyId}
                  className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1.5 cursor-pointer transition-colors group"
                  title="Click to copy exact User ID"
                >
                  <span className="text-zinc-500 font-bold">ID:</span>
                  <span className="text-zinc-300 font-semibold truncate max-w-[210px] xs:max-w-none">{user?.id}</span>
                  {copiedId ? (
                    <span className="text-emerald-400 font-bold text-[9px] flex items-center gap-0.5 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end flex-wrap">
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveModalTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer select-none ${
                      active
                        ? 'bg-white text-zinc-900 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sync Button */}
            {isOwnProfile && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1 text-xs cursor-pointer disabled:opacity-50"
                title="Sync Monkeytype stats"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-violet-400' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── MODAL BODY CONTENT ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">

          {/* TAB 1: OVERVIEW */}
          {activeModalTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Solved</p>
                    <p className="text-xl font-bold text-white font-mono mt-0.5">{stats.solved}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{pct}% done</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Streak</p>
                    <p className="text-xl font-bold text-white font-mono mt-0.5">{stats.streak}d</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Active streak</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Flame className="w-4 h-4 text-orange-400" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold">This Week</p>
                    <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">+{stats.solvedThisWeek}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Last 7 days</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Badges</p>
                    <p className="text-xl font-bold text-white font-mono mt-0.5">{stats.unlockedCount}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">/ 13 total</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Award className="w-4 h-4 text-violet-400" />
                  </div>
                </div>
              </div>

              {/* GitHub Style Activity Streak Matrix */}
              <div className="space-y-2">
                <GitHubStreakTracker userId={user?.id} progress={progress} userName={user?.display_name} />
              </div>

              {/* Topic Completion + Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Topic Breakdown */}
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-violet-400" />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Topic Completion</h4>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {topicData.filter(t => t.solved > 0).length}/{topicData.length} started
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {topicData.map(t => (
                      <div key={t.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-300 truncate">{t.name}</span>
                          <span className="text-zinc-500 font-mono text-[11px]">{t.solved}/{t.total} ({t.completed}%)</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            className="h-full bg-violet-500 rounded-full transition-all duration-500"
                            style={{ width: `${t.completed}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements Showcase */}
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Achievements</h4>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{stats.unlockedCount}/13</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {(stats.achievements || []).map(ach => {
                      const IconComponent = IconMap[ach.icon] || Award;
                      return (
                        <div
                          key={ach.id}
                          className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                            ach.unlocked
                              ? 'bg-violet-500/10 border-violet-500/25 text-zinc-100'
                              : 'bg-zinc-950/60 border-zinc-800/60 text-zinc-600 opacity-50'
                          }`}
                          title={ach.description}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${ach.unlocked ? 'bg-violet-500/20 text-violet-300' : 'bg-zinc-900 text-zinc-600'}`}>
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[10px] font-semibold leading-tight line-clamp-1">{ach.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {recentlySolved.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Recent Activity</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recentlySolved.map(item => (
                      <a
                        key={item.id}
                        href={item.leetcode_link || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-amber-400 transition-colors">
                            {item.problem_name}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                            {item.topic} · {item.subtopic || 'General'}
                          </p>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                          {formatRelativeTime(item.solvedAt)}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SOLVED PROBLEMS */}
          {activeModalTab === 'solved' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={solvedSearch}
                    onChange={e => setSolvedSearch(e.target.value)}
                    placeholder="Filter solved problems…"
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {['all', 'Easy', 'Medium', 'Hard'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSolvedDiffFilter(diff)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-colors cursor-pointer ${
                        solvedDiffFilter === diff
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {filteredSolvedList.length === 0 ? (
                <div className="text-center py-12 border border-zinc-800 rounded-xl bg-zinc-950/40">
                  <CheckCircle2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 font-mono">No solved problems match criteria.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
                  {filteredSolvedList.map((item, idx) => (
                    <div key={item.id} className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-zinc-600 w-6 shrink-0 text-right">#{idx + 1}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <a
                              href={item.leetcode_link || '#'}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-zinc-100 hover:text-amber-400 transition-colors truncate"
                            >
                              {item.problem_name}
                            </a>
                            <DiffDot difficulty={item.difficulty} />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-zinc-500">{item.topic}</span>
                            <SolveTags prog={item.prog} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {formatRelativeTime(item.solvedAt)}
                        </span>
                        {item.leetcode_link && (
                          <a
                            href={item.leetcode_link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
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
          )}

          {/* TAB 3: SPEED (MONKEYTYPE) */}
          {activeModalTab === 'speed' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Top Banner */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-violet-400" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Monkeytype Speed</h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {user?.monkeytype_username ? (
                      <>Linked account: <a href={`https://monkeytype.com/profile/${user.monkeytype_username}`} target="_blank" rel="noreferrer" className="text-violet-400 underline hover:text-violet-300 font-mono">@{user.monkeytype_username}</a></>
                    ) : (
                      'No Monkeytype handle configured in settings.'
                    )}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-2xl font-bold text-violet-400">{topWPM}</span>
                  <span className="text-xs text-zinc-500 block">Peak WPM</span>
                </div>
              </div>

              {/* Modes Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {speedModes.map(mode => (
                  <div key={mode.label} className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{mode.label} Mode</span>
                    <p className="text-xl font-bold text-white font-mono">{mode.wpm ?? '—'} <span className="text-xs text-zinc-500 font-normal">wpm</span></p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60">
                      <span>Acc: {mode.acc ? `${mode.acc}%` : '—'}</span>
                      <span>Consist: {mode.consistency ? `${mode.consistency}%` : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Completion Rate</span>
                  <span className="text-lg font-bold text-emerald-400">{completionRate}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Total Typing Time</span>
                  <span className="text-lg font-bold text-amber-400">{formatTime(typingProfile?.time_typing)}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Tests Completed</span>
                  <span className="text-lg font-bold text-zinc-200">{typingProfile?.tests_completed || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JAVA QUIZ */}
          {activeModalTab === 'quiz' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Java Concept Quizzes</h4>
                </div>
                <span className="text-xs font-mono text-zinc-400">{quizAttempts.length} attempts</span>
              </div>

              {loadingAttempts ? (
                <div className="py-12 text-center text-xs font-mono text-zinc-500">Loading quiz history…</div>
              ) : quizAttempts.length === 0 ? (
                <div className="text-center py-12 border border-zinc-800 rounded-xl bg-zinc-950/40">
                  <Brain className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 font-mono">No quiz attempts logged yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
                  {quizAttempts.map((attempt, idx) => {
                    const scorePct = Math.round((attempt.score / attempt.total_questions) * 100);
                    return (
                      <div key={attempt.id || idx} className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors gap-3">
                        <div>
                          <p className="text-xs font-semibold text-zinc-200">Attempt #{quizAttempts.length - idx}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {formatRelativeTime(attempt.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-xs text-zinc-300 font-bold">{attempt.score}/{attempt.total_questions}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            scorePct >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            scorePct >= 50 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {scorePct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
}

export { UserProfileModal };
