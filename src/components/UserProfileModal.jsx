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

  const { currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user?.id;

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

  const TABS = [
    { id: 'overview', label: 'Overview',                                         icon: BarChart2 },
    { id: 'solved',   label: `Solved (${allSolvedList.length})`,                 icon: CheckCircle2 },
    { id: 'speed',    label: `Speed${typingProfile?.wpm_15 ? ` · ${Math.max(typingProfile.wpm_15||0, typingProfile.wpm_30||0, typingProfile.wpm_60||0, typingProfile.wpm_120||0)}` : ''}`, icon: Keyboard },
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
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm uppercase overflow-hidden border border-zinc-700"
                style={{
                  backgroundColor: user.avatar_url ? 'transparent' : accentColor,
                }}
              >
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  : user.display_name?.charAt(0) || '?'
                }
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#09090b]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight truncate">
                  {user.display_name}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                  {user.is_admin ? 'ADMIN' : 'RACER'}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5 truncate">Stats, achievements & solved questions</p>
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                title="Sync profile"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS BANNER ────────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-6 pt-4 pb-0 shrink-0 font-sans">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: 'Solved', value: stats.solved, sub: `${pct}% done`, icon: Trophy },
              { label: 'Streak', value: `${user.streak ?? 0}d`, sub: 'Active streak', icon: Flame },
              { label: 'This Week', value: `+${user.solvedThisWeek ?? 0}`, sub: 'Last 7 days', icon: Calendar },
              { label: 'Badges', value: unlockedCount, sub: `/ ${achievementsList.length} total`, icon: Award },
            ].map(({ label, value, sub, icon: Icon }) => (
              <div
                key={label}
                className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-1">{label}</span>
                  <span className="text-lg font-bold text-white leading-none block">{value}</span>
                  <span className="text-[10px] text-zinc-400 block mt-1">{sub}</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
        <div className="px-5 sm:px-6 pt-4 pb-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col space-y-4">

          {/* ── OVERVIEW TAB ─────────────────── */}
          {activeModalTab === 'overview' && (
            <div className="space-y-4 w-full font-sans">
              {/* GitHub Contribution Heatmap */}
              <GitHubStreakTracker
                progress={progress}
                userId={user.id}
                title={`${user.display_name}'s Activity`}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                {/* Topic Completion */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 flex flex-col min-h-[300px] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                      <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Topic Completion</h4>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {topicData.filter(t => t.solved > 0).length}/{topicData.length} started
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar max-h-[260px]">
                    {topicData.map(t => (
                      <div key={t.name} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-200 font-medium truncate max-w-[180px]">{t.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                            <strong className="text-white">{t.solved}</strong>/{t.total}
                            <span className="text-zinc-500 ml-1">({t.completed}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(t.solved > 0 ? 4 : 0, t.completed)}%`,
                              backgroundColor: t.completed === 100
                                ? '#10b981'
                                : t.solved > 0
                                ? '#8b5cf6'
                                : '#27272a',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column: Badges + Recent */}
                <div className="flex flex-col gap-4">
                  {/* Badges */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col min-h-[140px]">
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <Award className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Achievements</h4>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{unlockedCount}/{achievementsList.length}</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 custom-scrollbar">
                      {achievementsList.map(ach => {
                        const Icon = IconMap[ach.icon] || Award;
                        return (
                          <div
                            key={ach.id}
                            title={`${ach.title}: ${ach.description}`}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border shrink-0 w-16 text-center select-none ${
                              ach.unlocked
                                ? 'bg-violet-500/10 border-violet-500/20 text-violet-300'
                                : 'bg-zinc-900/40 border-zinc-800/50 text-zinc-600 opacity-40'
                            }`}
                          >
                            <Icon className="w-4 h-4 mb-1" />
                            <span className="text-[8px] font-semibold truncate w-full">{ach.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recently Solved */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex-1 flex flex-col min-h-[140px]">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        </div>
                        <h4 className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Recent Activity</h4>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2.5 flex-1 overflow-y-auto custom-scrollbar max-h-[150px]">
                      {recentlySolved.map(q => (
                        <div key={q.id} className="p-2.5 rounded-lg border border-zinc-800/70 bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors flex flex-col gap-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-zinc-200 truncate">{q.problem_name}</p>
                              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{q.topic}{q.subtopic ? ` · ${q.subtopic}` : ''}</p>
                            </div>
                            <span className="text-[9px] text-zinc-500 font-mono shrink-0">{formatRelativeTime(q.solvedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SOLVED TAB ── */}
          {activeModalTab === 'solved' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search solved problems…"
                    value={solvedSearch}
                    onChange={e => setSolvedSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
                  {['all', 'Easy', 'Medium', 'Hard'].map(d => (
                    <button
                      key={d}
                      onClick={() => setSolvedDiffFilter(d)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                        solvedDiffFilter === d ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
                {filteredSolvedList.map(q => (
                  <div key={q.id} className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <DiffDot difficulty={q.difficulty} />
                        <h4 className="text-xs font-semibold text-zinc-200 truncate">{q.problem_name}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{q.topic}{q.subtopic ? ` · ${q.subtopic}` : ''}</p>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 shrink-0">{formatRelativeTime(q.solvedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SPEED TAB ── */}
          {activeModalTab === 'speed' && (
            <div className="space-y-4 animate-fadeIn">
              {typingProfile ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-amber-500/70 font-bold block mb-1">Peak Speed</span>
                      <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                        {Math.max(typingProfile.wpm_15 || 0, typingProfile.wpm_30 || 0, typingProfile.wpm_60 || 0, typingProfile.wpm_120 || 0)}
                      </span>
                      <span className="text-xs font-bold text-amber-600 ml-1">WPM</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500 italic">No speed data available for this racer.</div>
              )}
            </div>
          )}

          {/* ── QUIZ TAB ── */}
          {activeModalTab === 'quiz' && (
            <div className="space-y-4 animate-fadeIn">
              {quizAttempts.length > 0 ? (
                <div className="space-y-2 max-h-[480px] overflow-y-auto custom-scrollbar">
                  {quizAttempts.map(att => (
                    <div key={att.id} className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-200 font-mono">Score: {att.score} / {att.total_questions}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block">{new Date(att.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400">{att.percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500 italic">No quiz attempts recorded yet.</div>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
}

export { UserProfileModal };
