import React, { useState, useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, Flame, Calendar, Activity, Crown, Award, X, Zap, 
  Sparkles, BookOpen, Workflow, BookmarkCheck, Layers, Network, 
  ExternalLink, CheckCircle2, Copy, Lightbulb, Eye, Search, RotateCcw, Circle, Filter, Medal, Star
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { calculateUserAchievements } from '../lib/achievements';

const IconMap = {
  Award, Zap, Flame, Trophy, Calendar, Activity,
  Layers, Sparkles, BookOpen, Workflow,
  BookmarkCheck, Network
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

// ── User Profile Modal ────────────────────────────────────────────────────────
const UserProfileModal = ({ user, progress, questions, onClose }) => {
  const userProgress = useMemo(() => progress.filter(p => p.user_id === user.id), [progress, user.id]);
  const [activeModalTab, setActiveModalTab] = useState('overview');
  const [modalSearch, setModalSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [expandedModalTopics, setExpandedModalTopics] = useState({});

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
            </div>
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
              { label: 'Streak', value: `${user.streak}d`, sub: 'Active Streak', subColor: 'text-orange-400', icon: Flame, iconColor: 'text-orange-400', accent: 'border-orange-500/15 bg-orange-500/[0.04]' },
              { label: 'This Week', value: `+${user.solvedThisWeek}`, sub: 'Last 7 Days', subColor: 'text-emerald-400', icon: Calendar, iconColor: 'text-emerald-400', accent: 'border-emerald-500/15 bg-emerald-500/[0.04]' },
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

const formatRelativeTime = (dateString) => {
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

const calculateUserStreak = (userId, progress) => {
  const doneDates = progress
    .filter(p => p.user_id === userId && p.status === 'done')
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
  let streak = 1;
  for (let i = 0; i < unique.length - 1; i++) {
    if (unique[i] - unique[i + 1] === 86400000) streak++;
    else if (unique[i] === unique[i + 1]) continue;
    else break;
  }
  return streak;
};

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

// ── Podium Card (Top 3) ────────────────────────────────────────────────────────
// ── Podium Card (Top 3) ────────────────────────────────────────────────────────
const PodiumCard = ({ user, rank, questions, currentProfileId, onClick }) => {
  const totalQ = questions.length || 502;
  const pct = Math.round((user.solved / totalQ) * 100);
  const isCurrent = user.id === currentProfileId;

  const configs = {
    1: {
      order: 'order-2',
      height: 'h-36 sm:h-44',
      glow: 'rgba(251,191,36,0.15)',
      border: 'border-amber-400/25',
      bg: 'from-amber-500/8 to-transparent',
      badge: 'from-amber-400 to-yellow-500',
      badgeShadow: 'shadow-amber-400/30',
      label: 'Champion',
      labelColor: 'text-amber-300',
      icon: Crown,
      iconColor: '#fbbf24',
      rankText: '1st',
    },
    2: {
      order: 'order-1',
      height: 'h-28 sm:h-36',
      glow: 'rgba(161,161,170,0.1)',
      border: 'border-zinc-400/20',
      bg: 'from-zinc-300/5 to-transparent',
      badge: 'from-zinc-200 to-zinc-400',
      badgeShadow: 'shadow-zinc-400/20',
      label: 'Runner Up',
      labelColor: 'text-zinc-300',
      icon: Medal,
      iconColor: '#a1a1aa',
      rankText: '2nd',
    },
    3: {
      order: 'order-3',
      height: 'h-24 sm:h-32',
      glow: 'rgba(180,120,60,0.1)',
      border: 'border-amber-700/25',
      bg: 'from-amber-700/6 to-transparent',
      badge: 'from-amber-600 to-amber-800',
      badgeShadow: 'shadow-amber-600/20',
      label: 'Bronze',
      labelColor: 'text-amber-500',
      icon: Medal,
      iconColor: '#b45309',
      rankText: '3rd',
    },
  };

  const c = configs[rank];
  if (!c) return null;
  const Icon = c.icon;

  return (
    <div className={`flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer group ${c.order} flex-1 max-w-[100px] xs:max-w-[110px] sm:max-w-none`} onClick={onClick}>
      {/* Avatar & Info above podium */}
      <div className="flex flex-col items-center gap-1 mb-0.5">
        <div className="relative">
          <div
            className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-white text-base sm:text-xl uppercase shrink-0 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform"
            style={{ 
              backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1'),
              boxShadow: `0 0 20px ${c.glow}, 0 4px 12px rgba(0,0,0,0.5)`,
            }}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
            ) : (
              user.display_name?.charAt(0) || '?'
            )}
          </div>
          {/* Rank Icon Badge */}
          <div className={`absolute -bottom-1.5 -right-1.5 w-4.5 h-4.5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br ${c.badge} flex items-center justify-center shadow-lg ${c.badgeShadow} border border-white/20`}>
            <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-950" />
          </div>
        </div>

        <div className="text-center w-full min-w-0">
          <p className="text-[11px] sm:text-xs font-bold text-zinc-100 leading-tight truncate max-w-[90px] xs:max-w-[100px] sm:max-w-none mx-auto">
            {user.display_name}
          </p>
          <p className={`text-[9px] sm:text-[10px] font-semibold ${c.labelColor} truncate`}>{c.label}</p>
        </div>

        <div className="text-center">
          <span className="text-xs sm:text-sm font-extrabold font-mono text-zinc-100">{user.solved}</span>
          <span className="text-[9px] sm:text-[10px] text-zinc-600 font-mono"> /{totalQ}</span>
        </div>
      </div>

      {/* Podium block */}
      <div
        className={`w-full sm:w-28 ${c.height} rounded-t-xl bg-gradient-to-t ${c.bg} border-t border-l border-r ${c.border} flex flex-col items-center justify-start pt-2 sm:pt-3 gap-1 relative overflow-hidden`}
        style={{ boxShadow: `0 -4px 24px ${c.glow}` }}
      >
        <span className="text-xl sm:text-2xl font-black font-mono" style={{ color: c.iconColor, opacity: 0.15, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
          {c.rankText}
        </span>
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-zinc-500 z-10">
          <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
          <span>{user.streak}d</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-zinc-500 z-10">
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400" />
          <span>{user.unlockedCount}</span>
        </div>
      </div>
    </div>
  );
};

// ── Rank Styles for 4+ ─────────────────────────────────────────────────────────
const RANK_STYLES = {
  1: {
    cardBg: 'bg-gradient-to-r from-amber-500/8 via-yellow-500/3 to-transparent border-amber-500/25',
    badgeBg: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-zinc-950 font-extrabold shadow-sm',
    barColor: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
    icon: Crown,
    iconClass: 'text-zinc-950 fill-zinc-950',
    titleBadge: 'bg-amber-500/15 text-amber-300 border border-amber-400/25',
    titleText: '#1 Champion',
  },
  2: {
    cardBg: 'bg-gradient-to-r from-zinc-300/8 via-zinc-400/3 to-transparent border-zinc-300/25',
    badgeBg: 'bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-950 font-extrabold shadow-sm',
    barColor: 'bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-400',
    icon: Medal,
    iconClass: 'text-zinc-950 fill-zinc-950',
    titleBadge: 'bg-zinc-300/15 text-zinc-300 border border-zinc-300/25',
    titleText: '#2 Runner Up',
  },
  3: {
    cardBg: 'bg-gradient-to-r from-amber-700/10 via-amber-800/3 to-transparent border-amber-700/25',
    badgeBg: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white font-extrabold shadow-sm',
    barColor: 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800',
    icon: Medal,
    iconClass: 'text-white fill-white',
    titleBadge: 'bg-amber-700/15 text-amber-400 border border-amber-600/25',
    titleText: '#3 Bronze',
  },
};

const LeaderboardPage = () => {
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();
  const { profile: currentProfile } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  const leaderboard = useMemo(() => {
    const sevenAgo = Date.now() - 7 * 86400000;
    return profiles.map(p => {
      const up = progress.filter(pr => pr.user_id === p.id);
      const solved = up.filter(pr => pr.status === 'done').length;
      const solvedThisWeek = up.filter(pr => pr.status === 'done' && new Date(pr.updated_at).getTime() >= sevenAgo).length;
      const streak = calculateUserStreak(p.id, progress);
      const { unlockedCount } = calculateUserAchievements(p.id, progress, questions);
      return { ...p, solved, solvedThisWeek, streak, unlockedCount };
    }).sort((a, b) => b.solved !== a.solved ? b.solved - a.solved : b.streak - a.streak);
  }, [profiles, progress, questions]);

  const recentActivities = useMemo(() => {
    const seen = new Set();
    const list = [];
    const sorted = progress
      .filter(p => p.status === 'done')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    for (const p of sorted) {
      const key = `${p.user_id}-${p.question_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        const u = profiles.find(pr => pr.id === p.user_id);
        const q = questions.find(qn => qn.id === p.question_id);
        list.push({
          id: p.id,
          userId: p.user_id,
          userName: u?.display_name || 'Racer',
          avatarColor: u?.avatar_color || '#6366f1',
          avatarUrl: u?.avatar_url || '',
          problemName: q?.problem_name || 'a problem',
          topic: q?.topic || 'DSA',
          difficulty: q?.difficulty || 1,
          updatedAt: p.updated_at,
        });
        if (list.length >= 8) break;
      }
    }
    return list;
  }, [progress, profiles, questions]);

  const top3 = leaderboard.slice(0, 3);
  const restList = leaderboard.slice(3);
  const totalQ = questions.length || 502;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-white/[0.05]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Leaderboard</h1>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/15 font-mono font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" />
              Live Rankings
            </span>
          </div>
          <p className="text-zinc-600 text-xs">Real-time DSA problem-solving leaderboard across all registered racers.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl border border-white/[0.06] flex items-center gap-2" style={{ background: 'rgba(14,14,17,0.8)' }}>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Racers</p>
              <p className="text-sm font-bold text-zinc-100 leading-none">{leaderboard.length}</p>
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl border border-white/[0.06] flex items-center gap-2" style={{ background: 'rgba(14,14,17,0.8)' }}>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <div>
              <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Top Streak</p>
              <p className="text-sm font-bold text-zinc-100 leading-none">{Math.max(...leaderboard.map(u => u.streak || 0), 0)}d</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* ── Left: Rankings ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Podium (Top 3) */}
          {top3.length >= 2 && (
            <div className="rounded-2xl border border-white/[0.05] overflow-hidden" style={{ background: 'rgba(11,11,14,0.7)' }}>
              <div className="px-5 pt-4 pb-1 border-b border-white/[0.04]">
                <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Top Performers</p>
              </div>
              <div className="flex items-end justify-center gap-4 px-6 pt-6 pb-0">
                {top3.map((user, idx) => (
                  <PodiumCard
                    key={user.id}
                    user={user}
                    rank={idx + 1}
                    questions={questions}
                    currentProfileId={currentProfile?.id}
                    onClick={() => setSelectedUser(user)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard List (4+) */}
          {restList.length > 0 && (
            <div className="rounded-2xl border border-white/[0.05] overflow-hidden" style={{ background: 'rgba(11,11,14,0.7)' }}>
              <div className="px-5 py-3 border-b border-white/[0.04]">
                <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Rankings</p>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {restList.map((user, idx) => {
                  const rank = idx + 4;
                  const isCurrent = user.id === currentProfile?.id;
                  const pct = Math.round((user.solved / totalQ) * 100);

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`flex items-center gap-4 px-5 py-3.5 transition-all cursor-pointer group ${
                        isCurrent
                          ? 'bg-violet-500/[0.06] hover:bg-violet-500/[0.09]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 text-center shrink-0">
                        <span className="text-xs font-bold font-mono text-zinc-600">#{rank}</span>
                      </div>

                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm uppercase shrink-0 overflow-hidden border border-white/10 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1') }}
                      >
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                        ) : (
                          user.display_name?.charAt(0) || '?'
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-zinc-200 truncate group-hover:text-zinc-100 transition-colors">
                            {user.display_name}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-[9px] font-extrabold uppercase tracking-wider border border-violet-500/20 shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-700"
                            style={{ width: `${Math.max(user.solved > 0 ? 2 : 0, pct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-600 hidden sm:flex">
                          <Flame className="w-3 h-3 text-orange-400" />
                          <span>{user.streak}d</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-600 hidden sm:flex">
                          <Calendar className="w-3 h-3 text-emerald-400" />
                          <span>+{user.solvedThisWeek}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-zinc-200">{user.solved}</span>
                          <span className="text-[10px] text-zinc-700 font-mono"> /{totalQ}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {leaderboard.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-white/[0.05]" style={{ background: 'rgba(14,14,17,0.8)' }}>
              <Trophy className="w-10 h-10 text-zinc-800 mx-auto mb-3" />
              <p className="text-zinc-600 text-sm">No members registered yet.</p>
            </div>
          )}
        </div>

        {/* ── Activity Feed ── */}
        <div className="rounded-2xl border border-white/[0.05] h-fit" style={{ background: 'rgba(11,11,14,0.7)' }}>
          <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-violet-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Recent Activity</h3>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live stream" />
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-zinc-700 py-8 text-center px-4">No recent activity.</p>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => {
                    const u = profiles.find(p => p.id === act.userId);
                    if (u) {
                      const leaderboardUser = leaderboard.find(lu => lu.id === u.id);
                      setSelectedUser(leaderboardUser || { ...u, solved: 0, solvedThisWeek: 0, streak: 0 });
                    }
                  }}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] uppercase shrink-0 overflow-hidden border border-white/10 mt-0.5"
                    style={{ backgroundColor: act.avatarUrl ? 'transparent' : act.avatarColor }}
                  >
                    {act.avatarUrl ? (
                      <img src={act.avatarUrl} alt={act.userName} className="w-full h-full object-cover" />
                    ) : (
                      act.userName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-zinc-300 group-hover:text-violet-300 transition-colors truncate">
                        {act.userName}
                      </p>
                      <span className="text-[9px] text-zinc-700 shrink-0 font-mono">
                        {formatRelativeTime(act.updatedAt)}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-0.5 truncate">
                      Solved <span className="text-zinc-400 font-medium">{act.problemName}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-600 border border-white/[0.04] font-medium">
                        {act.topic}
                      </span>
                      <DiffDot d={act.difficulty} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User profile modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          progress={progress}
          questions={questions}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default LeaderboardPage;
