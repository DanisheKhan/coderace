import React, { useState, useMemo, useEffect } from 'react';
import { 
  Trophy, Flame, Calendar, Activity, Crown, Award, X, Zap, 
  Sparkles, BookOpen, Workflow, BookmarkCheck, Layers, Network, 
  ExternalLink, CheckCircle2, Copy, Lightbulb, Eye, Search, Keyboard, TrendingUp, RefreshCw 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateUserAchievements } from '../lib/achievements';
import { getTypingProfile, fetchMonkeytypeData, syncTypingProfileToSupabase } from '../lib/monkeytypeService';

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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#0d0d0f] border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col h-[90vh] max-h-[820px] mx-auto" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px -16px rgba(0,0,0,0.9)' }}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.05] shrink-0 gap-3" style={{ background: 'linear-gradient(to bottom, rgba(18,18,22,0.95), rgba(13,13,15,0.9))' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-white text-base sm:text-lg uppercase shrink-0 overflow-hidden border border-white/10"
              style={{ 
                backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1'),
                boxShadow: `0 0 20px ${user.avatar_color || '#6366f1'}33`
              }}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
              ) : (
                user.display_name?.charAt(0) || '?'
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-zinc-100 text-sm sm:text-base leading-tight tracking-tight truncate">{user.display_name}</h3>
                <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/15 font-mono">
                  Racer Profile
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-600 mt-0.5 truncate">Stats, achievements & solved questions</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <div className="flex bg-[#111115] p-1 rounded-xl border border-white/[0.05] overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveModalTab('overview')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap ${
                  activeModalTab === 'overview'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveModalTab('solved')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap ${
                  activeModalTab === 'solved'
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/30'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solved ({stats.solved})</span>
              </button>
              <button
                onClick={() => setActiveModalTab('speed')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap ${
                  activeModalTab === 'speed'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm shadow-amber-500/30'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Speed {typingProfile?.wpm_60 ? `(${typingProfile.wpm_60} WPM)` : ''}</span>
              </button>
            </div>
            {isCurrentUser && currentProfile?.monkeytype_ape_key && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500 border border-amber-500/25 hover:border-amber-500 text-amber-400 hover:text-zinc-950 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                title="Sync latest stats from Monkeytype"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync Stats'}</span>
              </button>
            )}
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 cursor-pointer p-2 rounded-lg transition-colors hover:bg-white/5 touch-target flex items-center justify-center shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="px-6 pt-4 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: 'Solved', value: `${stats.solved}`, sub: `${pct}% Complete`, subColor: 'text-violet-400', icon: Trophy, iconColor: 'text-violet-400', accent: 'border-violet-500/15 bg-violet-500/[0.04]' },
              { label: 'Streak', value: `${user.streak != null ? user.streak : 0}d`, sub: 'Active Streak', subColor: 'text-orange-400', icon: Flame, iconColor: 'text-orange-400', accent: 'border-orange-500/15 bg-orange-500/[0.04]' },
              { label: 'This Week', value: `+${user.solvedThisWeek != null ? user.solvedThisWeek : 0}`, sub: 'Last 7 Days', subColor: 'text-emerald-400', icon: Calendar, iconColor: 'text-emerald-400', accent: 'border-emerald-500/15 bg-emerald-500/[0.04]' },
              { label: 'Badges', value: `${unlockedCount}`, sub: 'Milestones', subColor: 'text-amber-400', icon: Award, iconColor: 'text-amber-400', accent: 'border-amber-500/15 bg-amber-500/[0.04]' },
            ].map(({ label, value, sub, subColor, icon: Icon, iconColor, accent }) => (
              <div key={label} className={`p-3 rounded-xl border ${accent} flex items-center justify-between`} style={{ background: 'rgba(14,14,17,0.6)' }}>
                <div>
                  <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest block">{label}</span>
                  <span className="text-sm font-extrabold text-zinc-100 mt-0.5 block leading-none">{value}</span>
                  <span className={`text-[10px] ${subColor} font-semibold mt-0.5 block`}>{sub}</span>
                </div>
                <div className={`w-8 h-8 rounded-lg bg-white/[0.04] ${iconColor} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {activeModalTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start animate-fadeIn">
              {/* Left: Topic Completion */}
              <div className="rounded-2xl flex flex-col h-[400px] border border-white/[0.05]" style={{ background: 'rgba(14,14,17,0.8)' }}>
                <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-white/[0.04]">
                  <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Topic Completion</h4>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 custom-scrollbar">
                  {topicData.map(t => (
                    <div key={t.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-medium truncate max-w-[180px]">{t.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          <strong className="text-zinc-300">{t.solved}</strong> / {t.total}
                          <span className="text-zinc-600 ml-1">({t.completed}%)</span>
                        </span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            t.completed === 100 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                              : t.solved > 0 
                              ? 'bg-gradient-to-r from-violet-600 to-indigo-500' 
                              : 'bg-zinc-800'
                          }`}
                          style={{ width: `${Math.max(t.solved > 0 ? 3 : 0, t.completed)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Badges & Recently Solved */}
              <div className="space-y-4 h-[400px] flex flex-col">
                {/* Badges */}
                <div className="rounded-2xl shrink-0 border border-white/[0.05]" style={{ background: 'rgba(14,14,17,0.8)' }}>
                  <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Badges</h4>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600">{unlockedCount} / {achievementsList.length}</span>
                  </div>
                  <div className="p-3">
                    {unlockedCount === 0 ? (
                      <p className="text-xs text-zinc-700 py-4 text-center">No badges unlocked yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
                        {achievementsList.filter(ach => ach.unlocked).map(ach => {
                          const Icon = IconMap[ach.icon] || Award;
                          return (
                            <div
                              key={ach.id}
                              className={`flex items-center gap-2 p-2 rounded-xl border bg-gradient-to-br ${ach.color} text-zinc-100 shadow-sm`}
                            >
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
                <div className="rounded-2xl flex-1 flex flex-col min-h-0 border border-white/[0.05]" style={{ background: 'rgba(14,14,17,0.8)' }}>
                  <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-violet-400" />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Recently Solved</h4>
                    </div>
                    {recentlySolved.length > 0 && (
                      <button 
                        onClick={() => setActiveModalTab('solved')} 
                        className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer transition-colors"
                      >
                        View all →
                      </button>
                    )}
                  </div>
                  {recentlySolved.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-zinc-700">No solved questions yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 flex-1 overflow-y-auto px-3 py-2.5 custom-scrollbar">
                      {recentlySolved.map(q => (
                        <div key={q.id} className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-1.5 group hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-violet-300 transition-colors">
                                {q.problem_name}
                              </p>
                              <p className="text-[10px] text-zinc-600 truncate mt-0.5">
                                {q.topic} {q.subtopic ? `· ${q.subtopic}` : ''}
                              </p>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-mono shrink-0">
                              {formatRelativeTime(q.solvedAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
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
          ) : activeModalTab === 'speed' ? (
            <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
              {syncError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {syncError}
                </div>
              )}
              {!typingProfile ? (
                <div className="py-14 flex flex-col items-center justify-center text-center border border-dashed border-zinc-800/80 rounded-2xl bg-white/[0.01] p-6">
                  <Keyboard className="w-10 h-10 text-amber-500/40 mb-3" />
                  <h4 className="text-sm font-bold text-zinc-200">No Typing Profile Available</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mt-1.5 leading-relaxed">
                    This user has not linked or synced their Monkeytype typing speed profile yet.
                  </p>
                </div>
              ) : (() => {
                const stats = typingProfile;
                const topWPM = Math.max(
                  stats.wpm_15 || 0, stats.wpm_30 || 0,
                  stats.wpm_60 || 0, stats.wpm_120 || 0
                );
                const completionRate = stats.tests_started > 0
                  ? Math.round((stats.tests_completed / stats.tests_started) * 100)
                  : 0;

                const formatTime = (s) => {
                  if (!s) return '0m';
                  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
                  return h > 0 ? `${h}h ${m}m` : `${m}m`;
                };

                const chartData = [
                  { name: '15s', WPM: stats.wpm_15 || 0 },
                  { name: '30s', WPM: stats.wpm_30 || 0 },
                  { name: '60s', WPM: stats.wpm_60 || 0 },
                  { name: '120s', WPM: stats.wpm_120 || 0 },
                ].filter(d => d.WPM > 0);

                const modes = [
                  { label: '15s', wpm: stats.wpm_15, acc: stats.acc_15, consistency: stats.consistency_15 },
                  { label: '30s', wpm: stats.wpm_30, acc: stats.acc_30, consistency: stats.consistency_30 },
                  { label: '60s', wpm: stats.wpm_60, acc: stats.acc_60, consistency: stats.consistency_60 },
                  { label: '120s', wpm: stats.wpm_120, acc: stats.acc_120, consistency: stats.consistency_120 },
                ];

                const tooltipStyle = {
                  backgroundColor: '#0a0a0c',
                  borderColor: 'rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: '#e4e4e7',
                  fontSize: '11px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                };

                return (
                  <div className="space-y-4">
                    {/* Peak WPM hero */}
                    <div
                      className="rounded-xl p-3 flex items-center justify-between relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.03))',
                        borderLeft: '3px solid rgba(245,158,11,0.5)',
                        border: '1px solid rgba(245,158,11,0.15)',
                        borderLeftWidth: '3px',
                      }}
                    >
                      <div className="absolute right-4 opacity-[0.04]">
                        <TrendingUp className="w-16 h-16 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-[8px] uppercase font-black text-amber-500/70 tracking-widest block mb-0.5">Peak WPM · All Modes</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">{topWPM > 0 ? topWPM : '--'}</span>
                          <span className="text-[10px] font-bold text-amber-600 uppercase">WPM</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest block mb-0.5">Tests Done</span>
                        <span className="text-xl font-black text-zinc-200 font-mono">{stats.tests_completed?.toLocaleString() || 0}</span>
                      </div>
                    </div>

                    {/* Stats + Chart */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Activity stats */}
                      <div className="rounded-xl p-3 space-y-2.5"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-amber-400" /> Monkeytype Activity
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { label: 'Started', value: stats.tests_started?.toLocaleString() || 0, color: '#e4e4e7' },
                            { label: 'Completed', value: stats.tests_completed?.toLocaleString() || 0, color: '#e4e4e7' },
                            { label: 'Completion', value: `${completionRate}%`, color: '#34d399' },
                            { label: 'Time Spent', value: formatTime(stats.time_typing), color: '#a78bfa' },
                          ].map(s => (
                            <div key={s.label} className="p-1.5 rounded-lg text-center"
                              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                              <span className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-0.5">{s.label}</span>
                              <span className="text-xs font-black font-mono" style={{ color: s.color }}>{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bar chart */}
                      <div className="rounded-xl p-3 flex flex-col min-h-[130px]"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5 mb-1.5">
                          <Zap className="w-3 h-3 text-amber-400" /> Speed Curve (WPM)
                        </span>
                        <div className="flex-1 min-h-[85px]">
                          {chartData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-700 text-xs">No data yet</div>
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.2} />
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#3f3f46" fontSize={8} tickLine={false} axisLine={false} />
                                <YAxis stroke="#3f3f46" fontSize={8} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="WPM" fill="url(#barGrad)" radius={[3, 3, 0, 0]} barSize={22} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mode Breakdown */}
                    <div>
                      <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5 mb-2">
                        <Award className="w-3 h-3 text-amber-400" /> Category Benchmark Breakdown
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {modes.map(item => {
                          const isBest = item.wpm && item.wpm === topWPM && topWPM > 0;
                          const barPct = topWPM > 0 && item.wpm ? Math.min(100, Math.round((item.wpm / 150) * 100)) : 0;
                          const accColor = item.acc >= 98 ? '#34d399' : item.acc >= 95 ? '#fbbf24' : '#71717a';

                          return (
                            <div
                              key={item.label}
                              className="rounded-xl p-2.5 relative overflow-hidden transition-all"
                              style={{
                                background: isBest
                                  ? 'linear-gradient(145deg, rgba(245,158,11,0.08), rgba(217,119,6,0.03))'
                                  : 'rgba(255,255,255,0.02)',
                                border: isBest ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.05)',
                                boxShadow: isBest ? '0 4px 20px rgba(245,158,11,0.07)' : 'none',
                              }}
                            >
                              {isBest && (
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                              )}
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest">{item.label}</span>
                                {isBest && (
                                  <div className="flex items-center gap-0.5 px-1 py-0.5 rounded"
                                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                                    <Zap className="w-1.5 h-1.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[7px] font-black text-amber-400 uppercase">Best</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black font-mono tracking-tight"
                                  style={{ color: isBest ? '#fbbf24' : '#e4e4e7' }}>
                                  {item.wpm ?? '--'}
                                </span>
                                <span className="text-[8px] text-zinc-600 font-semibold uppercase">wpm</span>
                              </div>
                              <div className="mt-1.5 space-y-0.5 pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-zinc-600">Accuracy</span>
                                  <span className="font-bold font-mono" style={{ color: accColor }}>
                                    {item.acc != null ? `${item.acc}%` : '--'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[9px]">
                                  <span className="text-zinc-600">Consistency</span>
                                  <span className="font-bold font-mono text-amber-400/80">
                                    {item.consistency != null ? `${item.consistency}%` : '--'}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full rounded-full mt-1.5 overflow-hidden" style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${barPct}%`,
                                    background: isBest
                                      ? 'linear-gradient(90deg, #f59e0b, #fde68a)'
                                      : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer timestamp */}
                    {stats.last_synced && (
                      <div className="text-center text-[9px] font-mono text-zinc-700 pt-1.5"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        Last synced from Monkeytype · {new Date(stats.last_synced).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            /* TAB 2: SOLVED QUESTIONS EXPLORER */
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    placeholder="Search by name, topic or subtopic..."
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl glass-input text-zinc-200 placeholder:text-zinc-700 focus:outline-none"
                  />
                  {modalSearch && (
                    <button onClick={() => setModalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 text-xs">×</button>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-[#111115] p-1 rounded-xl border border-white/[0.05] shrink-0 overflow-x-auto max-w-full custom-scrollbar">
                  {[
                    { key: 'all', label: 'All', icon: null, color: '' },
                    { key: 'gpt', label: 'AI', icon: Sparkles, color: 'text-violet-400' },
                    { key: 'copy', label: 'Copy', icon: Copy, color: 'text-rose-400' },
                    { key: 'hint', label: 'Hint', icon: Lightbulb, color: 'text-amber-400' },
                    { key: 'solution', label: 'Seen', icon: Eye, color: 'text-sky-400' },
                    { key: 'optimal', label: 'Optimal', icon: null, color: 'text-emerald-400' },
                    { key: 'revisit', label: 'Revisit', icon: null, color: 'text-rose-400' },
                  ].map(({ key, label, icon: Icon, color }) => (
                    <button
                      key={key}
                      onClick={() => setMethodFilter(key)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                        methodFilter === key 
                          ? 'bg-violet-600 text-white shadow-sm' 
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
                <div className="text-center py-16 rounded-2xl border border-white/[0.05]" style={{ background: 'rgba(14,14,17,0.8)' }}>
                  <p className="text-xs text-zinc-600">No solved questions match your filter criteria.</p>
                  {(modalSearch || methodFilter !== 'all') && (
                    <button onClick={() => { setModalSearch(''); setMethodFilter('all'); }}
                      className="mt-3 text-xs text-violet-400 hover:underline font-semibold cursor-pointer">
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {Object.entries(allSolvedGrouped).map(([topic, topicQs]) => {
                    const isExpanded = expandedModalTopics[topic] !== false;
                    return (
                      <div key={topic} className="rounded-2xl overflow-hidden border border-white/[0.05]">
                        <button
                          onClick={() => setExpandedModalTopics(prev => ({ ...prev, [topic]: !isExpanded }))}
                          className="w-full flex items-center justify-between px-4 py-2.5 transition-colors cursor-pointer select-none"
                          style={{ background: isExpanded ? 'rgba(18,18,22,0.95)' : 'rgba(14,14,17,0.8)' }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-300">{topic}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/15">
                              {topicQs.length} solved
                            </span>
                          </div>
                          <span className="text-zinc-600 text-[10px]">{isExpanded ? '▲' : '▼'}</span>
                        </button>
                        {isExpanded && (
                          <div className="divide-y divide-white/[0.04]" style={{ background: 'rgba(11,11,14,0.6)' }}>
                            {topicQs.map(q => (
                              <div key={q.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
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
                                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-600 hover:text-zinc-200 transition-colors shrink-0">
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

          {/* Speed / Monkeytype Tab */}
          {activeModalTab === 'speed' && (
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              {!user.monkeytype_public ? (
                <div className="py-12 px-4 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
                  <Keyboard className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-zinc-300">Monkeytype Profile Private</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                    {user.display_name} has not enabled public display of their Monkeytype speed stats.
                  </p>
                </div>
              ) : !typingProfile ? (
                <div className="py-12 px-4 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
                  <Keyboard className="w-8 h-8 text-amber-400/60 mx-auto mb-2 animate-bounce" />
                  <h4 className="text-sm font-bold text-zinc-300">No Stats Synced</h4>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                    {user.display_name} has enabled public stats, but hasn't synced their Monkeytype profile yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        <Keyboard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-100">{user.display_name}'s Speed Profile</h4>
                        {user.monkeytype_username && (
                          <a
                            href={`https://monkeytype.com/profile/${user.monkeytype_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            @{user.monkeytype_username} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    {typingProfile.last_synced && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Synced {formatRelativeTime(typingProfile.last_synced)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { mode: '15s', wpm: typingProfile.wpm_15, acc: typingProfile.acc_15 },
                      { mode: '30s', wpm: typingProfile.wpm_30, acc: typingProfile.acc_30 },
                      { mode: '60s', wpm: typingProfile.wpm_60, acc: typingProfile.acc_60 },
                      { mode: '120s', wpm: typingProfile.wpm_120, acc: typingProfile.acc_120 },
                    ].map(item => (
                      <div key={item.mode} className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.05]">
                        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">{item.mode} Test</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl font-black text-zinc-100 font-mono">{item.wpm ?? '--'}</span>
                          <span className="text-xxs text-zinc-500">WPM</span>
                        </div>
                        <div className="mt-1 text-[10px] text-zinc-400 flex justify-between">
                          <span>Acc:</span>
                          <span className="font-semibold text-amber-400 font-mono">{item.acc ? `${item.acc}%` : '--'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/[0.04] flex items-center justify-between text-xs text-zinc-400">
                    <div>
                      <span>Tests Completed: </span>
                      <strong className="text-zinc-200 font-mono">{typingProfile.tests_completed?.toLocaleString() || 0}</strong>
                    </div>
                    <div>
                      <span>Tests Started: </span>
                      <strong className="text-zinc-200 font-mono">{typingProfile.tests_started?.toLocaleString() || 0}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-3 border-t border-white/[0.05] shrink-0" style={{ background: 'rgba(11,11,14,0.9)' }}>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-zinc-600 font-mono">Realtime Sync Active</span>
          </div>
          <button onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 hover:text-zinc-100 border border-white/[0.07] transition-all cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
