import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateUserAchievements, calculateStreak } from '../lib/achievements';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Award, Flame, Trophy, ExternalLink, Sparkles, BookOpen, Crown, ChevronDown, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp } from '../lib/animations';

// ── Tooltip Style ──────────────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: '#0d0d0f',
  borderColor: 'rgba(255,255,255,0.07)',
  borderRadius: '10px',
  color: '#e4e4e7',
  fontSize: '11px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
};

// ── Avatar helper ──────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6 text-[9px] rounded-md',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-16 h-16 text-2xl rounded-2xl',
  };
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center font-bold text-white uppercase shrink-0 overflow-hidden border border-white/10`}
      style={{ backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1') }}
    >
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
      ) : (
        user.display_name?.charAt(0) || '?'
      )}
    </div>
  );
};

// ── Portal Dropdown ──────────────────────────────────────────────────────────
const PortalDropdown = ({ anchor, open, children, onClose, align = 'auto' }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const portalRef = useRef(null);

  useEffect(() => {
    if (!open || !anchor) return;
    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      let left = rect.left;
      const menuWidth = portalRef.current ? portalRef.current.offsetWidth : 200;

      if (align === 'right' || left + menuWidth > viewportWidth - 12) {
        left = Math.max(12, rect.right - menuWidth);
      }
      left = Math.max(12, Math.min(left, viewportWidth - menuWidth - 12));

      setPos({ top: rect.bottom + 4, left, width: rect.width });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [open, anchor, align]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (anchor && anchor.contains(e.target)) return;
      if (portalRef.current && portalRef.current.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchor]);

  if (!open) return null;
  return createPortal(
    <div
      ref={portalRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
      className="animate-fadeIn"
    >
      {children}
    </div>,
    document.body
  );
};

// ── Competitor Dropdown ────────────────────────────────────────────────────────
const CompetitorSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const cur = options.find(o => o.id === value);

  return (
    <div ref={anchorRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl glass-input text-zinc-300 cursor-pointer transition-all select-none w-44"
      >
        <span className="truncate flex-1 text-left">{cur?.display_name || 'Select Rival'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <PortalDropdown anchor={anchorRef.current} open={open} onClose={() => setOpen(false)} align="right">
        <div className="border border-white/[0.06] rounded-xl shadow-2xl shadow-black/90 py-1 overflow-y-auto max-h-60 custom-scrollbar animate-fadeIn w-full"
          style={{ background: '#0d0d0f' }}>
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs cursor-pointer transition-colors text-left ${
                opt.id === value
                  ? 'text-violet-400 bg-violet-500/[0.08] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`}
            >
              <Avatar user={opt} size="sm" />
              <span className="truncate">{opt.display_name}</span>
              {opt.id === value && <span className="ml-auto text-violet-400 text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      </PortalDropdown>
    </div>
  );
};

// ── Stat Comparison Card ───────────────────────────────────────────────────────
const StatDuelCard = ({ label, icon: Icon, myValue, compValue, myLabel, compLabel, myColor, compColor, unit = '', verdict }) => {
  const myWin = myValue > compValue;
  const tied = myValue === compValue;
  return (
    <div className="rounded-2xl border border-white/[0.05] p-5 flex flex-col gap-4" style={{ background: 'rgba(11,11,14,0.8)' }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{label}</span>
        <Icon className="w-4 h-4 text-zinc-700" />
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center min-w-0">
          <p className="text-[10px] text-zinc-600 mb-1 truncate" title={myLabel}>{myLabel}</p>
          <p className={`text-3xl font-black font-mono ${myColor}`}>{myValue}{unit}</p>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <div className="w-px h-8 bg-white/[0.06]" />
          <span className="text-[10px] text-zinc-700 font-bold my-1">VS</span>
          <div className="w-px h-8 bg-white/[0.06]" />
        </div>
        <div className="flex-1 text-center min-w-0">
          <p className="text-[10px] text-zinc-600 mb-1 truncate" title={compLabel}>{compLabel}</p>
          <p className={`text-3xl font-black font-mono ${compColor}`}>{compValue}{unit}</p>
        </div>
      </div>

      {/* Bar race */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-zinc-600 w-6 shrink-0 text-right font-mono">{myValue}</span>
          <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${myWin || tied ? 'bg-violet-500' : 'bg-zinc-700'}`}
              style={{ width: `${myValue + compValue > 0 ? Math.round((myValue / (myValue + compValue)) * 100) : 50}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-zinc-600 w-6 shrink-0 text-right font-mono">{compValue}</span>
          <div className="flex-1 h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${!myWin && !tied ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              style={{ width: `${myValue + compValue > 0 ? Math.round((compValue / (myValue + compValue)) * 100) : 50}%` }} />
          </div>
        </div>
      </div>

      {/* Verdict */}
      <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1.5">
        {myWin ? <><Crown className="w-3 h-3 text-amber-400 fill-amber-400" />{verdict?.win}</> :
         !tied ? <><span className="text-zinc-600">⚠</span>{verdict?.lose}</> :
         <span>{verdict?.tie}</span>}
      </p>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const ComparePage = () => {
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();
  const { profile: currentProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('group');

  // Only show approved profiles
  const approvedProfiles = useMemo(() => {
    return profiles.filter(p => p.approved || p.is_admin);
  }, [profiles]);

  const uniqueTopics = useMemo(() => [...new Set(questions.map(q => q.topic))], [questions]);
  const [activeCompareTopic, setActiveCompareTopic] = useState(uniqueTopics[0] || '');

  // ── Group Arena ──────────────────────────────────────────────────────────────
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  useEffect(() => {
    if (approvedProfiles.length > 0 && selectedProfileIds.length === 0) {
      setSelectedProfileIds(approvedProfiles.map(p => p.id));
    }
  }, [approvedProfiles, selectedProfileIds]);

  const activeProfiles = useMemo(() => approvedProfiles.filter(p => selectedProfileIds.includes(p.id)), [approvedProfiles, selectedProfileIds]);

  const topicComparisonData = useMemo(() => {
    if (!activeProfiles.length || !questions.length) return [];
    const topicGroups = {};
    questions.forEach(q => {
      if (!topicGroups[q.topic]) topicGroups[q.topic] = [];
      topicGroups[q.topic].push(q.id);
    });
    return Object.keys(topicGroups).map(topicName => {
      const qIds = topicGroups[topicName];
      const row = { name: topicName };
      activeProfiles.forEach(p => {
        const up = progress.filter(pr => pr.user_id === p.id);
        const solved = up.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
        row[p.display_name] = qIds.length > 0 ? Math.round((solved / qIds.length) * 100) : 0;
      });
      return row;
    });
  }, [activeProfiles, progress, questions]);

  const subtopicComparisonData = useMemo(() => {
    if (!activeCompareTopic || !activeProfiles.length || !questions.length) return [];
    const topicQs = questions.filter(q => q.topic === activeCompareTopic);
    const subtopicGroups = {};
    topicQs.forEach(q => {
      const k = q.subtopic || 'General';
      if (!subtopicGroups[k]) subtopicGroups[k] = [];
      subtopicGroups[k].push(q.id);
    });
    return Object.keys(subtopicGroups).map(subtopicName => {
      const qIds = subtopicGroups[subtopicName];
      const row = { name: subtopicName };
      activeProfiles.forEach(p => {
        const up = progress.filter(pr => pr.user_id === p.id);
        const solved = up.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
        row[p.display_name] = qIds.length > 0 ? Math.round((solved / qIds.length) * 100) : 0;
      });
      return row;
    });
  }, [activeProfiles, progress, questions, activeCompareTopic]);

  const userCompletionRankings = useMemo(() => {
    const totalQ = questions.length || 1;
    return activeProfiles.map(p => {
      const solved = progress.filter(pr => pr.user_id === p.id && pr.status === 'done').length;
      return { ...p, solved, pct: Math.round((solved / totalQ) * 100) };
    }).sort((a, b) => b.pct - a.pct);
  }, [activeProfiles, progress, questions]);

  // ── 1v1 Duel ────────────────────────────────────────────────────────────────
  const duelCompetitors = useMemo(() => approvedProfiles.filter(p => p.id !== currentProfile?.id), [approvedProfiles, currentProfile]);
  const [duelCompetitorId, setDuelCompetitorId] = useState('');

  useEffect(() => {
    if (duelCompetitors.length > 0 && !duelCompetitorId) {
      setDuelCompetitorId(duelCompetitors[0].id);
    }
  }, [duelCompetitors, duelCompetitorId]);

  const competitorProfile = useMemo(() => approvedProfiles.find(p => p.id === duelCompetitorId), [approvedProfiles, duelCompetitorId]);
  const myProgress = useMemo(() => progress.filter(p => p.user_id === currentProfile?.id), [progress, currentProfile]);
  const compProgress = useMemo(() => progress.filter(p => p.user_id === duelCompetitorId), [progress, duelCompetitorId]);
  const myAchievements = useMemo(() => currentProfile ? calculateUserAchievements(currentProfile.id, progress, questions) : { unlockedCount: 0 }, [currentProfile, progress, questions]);
  const compAchievements = useMemo(() => duelCompetitorId ? calculateUserAchievements(duelCompetitorId, progress, questions) : { unlockedCount: 0 }, [duelCompetitorId, progress, questions]);
  const myStreak = useMemo(() => calculateStreak(myProgress), [myProgress]);
  const compStreak = useMemo(() => calculateStreak(compProgress), [compProgress]);
  const mySolved = useMemo(() => myProgress.filter(p => p.status === 'done').length, [myProgress]);
  const compSolved = useMemo(() => compProgress.filter(p => p.status === 'done').length, [compProgress]);

  const duelTopicComparison = useMemo(() => {
    if (!currentProfile || !competitorProfile || !questions.length) return [];
    const topicGroups = {};
    questions.forEach(q => {
      if (!topicGroups[q.topic]) topicGroups[q.topic] = [];
      topicGroups[q.topic].push(q.id);
    });
    return Object.keys(topicGroups).map(topicName => {
      const qIds = topicGroups[topicName];
      const myS = myProgress.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
      const compS = compProgress.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
      return {
        name: topicName,
        myPct: qIds.length > 0 ? Math.round((myS / qIds.length) * 100) : 0,
        compPct: qIds.length > 0 ? Math.round((compS / qIds.length) * 100) : 0,
        total: qIds.length, mySolved: myS, compSolved: compS,
      };
    });
  }, [myProgress, compProgress, questions, currentProfile, competitorProfile]);

  const catchUpProblems = useMemo(() => {
    if (!duelCompetitorId || !currentProfile) return [];
    const compDoneIds = compProgress.filter(p => p.status === 'done').map(p => p.question_id);
    const myDoneIds = myProgress.filter(p => p.status === 'done').map(p => p.question_id);
    return questions.filter(q => compDoneIds.includes(q.id) && !myDoneIds.includes(q.id)).slice(0, 6);
  }, [compProgress, myProgress, questions, duelCompetitorId, currentProfile]);

  // ── Shared Chart panel style ───────────────────────────────────────────────
  const panelStyle = { background: 'rgba(11,11,14,0.7)' };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="space-y-6 pb-12"
    >

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80 font-sans">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white mb-1">Compare Progress</h1>
          <p className="text-zinc-500 text-xs">Side-by-side progression across topics and subtopics.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
          {[
            { key: 'group', label: 'Group Arena', icon: Users },
            { key: 'duel',  label: '1v1 Duel',    icon: Swords },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer select-none ${
                activeTab === key
                  ? 'bg-white text-zinc-900 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          TAB: GROUP ARENA
      ════════════════════════════════════════════════════ */}
      {activeTab === 'group' && (
        <div className="space-y-5 animate-fadeIn">

          {/* Racer Selector */}
          <div className="rounded-2xl border border-white/[0.05] p-4" style={panelStyle}>
            <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest mb-3">
              Compare Racers
              <span className="ml-2 text-zinc-700 font-mono">({selectedProfileIds.length} selected)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {approvedProfiles.map(p => {
                const isSelected = selectedProfileIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProfileIds(prev =>
                        prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                      );
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-violet-500/[0.08] text-violet-300 border-violet-500/25'
                        : 'text-zinc-500 border-white/[0.05] hover:text-zinc-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    <Avatar user={p} size="sm" />
                    <span>{p.display_name}</span>
                    {isSelected && <span className="text-[10px] text-violet-400 ml-0.5">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overall Completion Rankings */}
          {userCompletionRankings.length > 0 && (
            <div className="rounded-2xl border border-white/[0.05] p-4" style={panelStyle}>
              <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest mb-3">Overall Completion</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {userCompletionRankings.map((user, idx) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02]">
                    <Avatar user={user} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-300 truncate">{user.display_name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {idx === 0 && <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                        <p className="text-[11px] font-bold text-violet-400">{user.pct}%</p>
                      </div>
                      {/* Mini bar */}
                      <div className="w-full h-0.5 bg-zinc-900 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${user.pct}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic Chart */}
          <div className="rounded-2xl border border-white/[0.05] p-5 flex flex-col min-h-[380px]" style={panelStyle}>
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-3.5 h-3.5 text-violet-400" />
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Topic Completion (%)</p>
            </div>
            {activeProfiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-700">
                Select racers above to compare.
              </div>
            ) : (
              <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
                <div style={{ minWidth: Math.max(900, uniqueTopics.length * 100) }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={topicComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#27272a" tick={{ fill: '#52525b', fontSize: 9 }} height={35} interval={0} />
                      <YAxis domain={[0, 100]} stroke="#27272a" tick={{ fill: '#3f3f46', fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#52525b' }} />
                      {activeProfiles.map(p => (
                        <Bar key={p.id} dataKey={p.display_name} fill={p.avatar_color || '#6366f1'} radius={[3, 3, 0, 0]} maxBarSize={24} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Subtopic Chart */}
          <div className="rounded-2xl border border-white/[0.05] p-5 flex flex-col min-h-[380px]" style={panelStyle}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-violet-400" />
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Subtopic Completion (%)</p>
              </div>
              <select
                value={activeCompareTopic}
                onChange={e => setActiveCompareTopic(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl glass-input text-zinc-300 focus:outline-none cursor-pointer w-full sm:w-52"
              >
                {uniqueTopics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {activeProfiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-700">
                Select racers above to compare.
              </div>
            ) : (
              <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
                <div style={{ minWidth: Math.max(700, subtopicComparisonData.length * 160) }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subtopicComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#27272a" tick={{ fill: '#52525b', fontSize: 9 }} height={35} interval={0} />
                      <YAxis domain={[0, 100]} stroke="#27272a" tick={{ fill: '#3f3f46', fontSize: 10 }} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#52525b' }} />
                      {activeProfiles.map(p => (
                        <Bar key={p.id} dataKey={p.display_name} fill={p.avatar_color || '#6366f1'} radius={[3, 3, 0, 0]} maxBarSize={24} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          TAB: 1V1 DUEL
      ════════════════════════════════════════════════════ */}
      {activeTab === 'duel' && (
        <div className="space-y-5 animate-fadeIn">

          {/* VS Hero Card */}
          <div className="rounded-2xl border border-white/[0.05] overflow-hidden relative" style={{ background: 'rgba(11,11,14,0.9)' }}>
            {/* Ambient glow strip */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 relative">
              {/* You */}
              {currentProfile && (
                <div className="flex items-center gap-3.5 sm:gap-4 flex-1 w-full">
                  <div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-white text-xl sm:text-2xl uppercase overflow-hidden border border-violet-500/20 shrink-0"
                    style={{
                      backgroundColor: currentProfile.avatar_url ? 'transparent' : (currentProfile.avatar_color || '#6366f1'),
                      boxShadow: `0 0 32px ${currentProfile.avatar_color || '#6366f1'}33`,
                    }}
                  >
                    {currentProfile.avatar_url
                      ? <img src={currentProfile.avatar_url} alt={currentProfile.display_name} className="w-full h-full object-cover" />
                      : currentProfile.display_name.charAt(0)
                    }
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <span className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 text-[9px] font-bold uppercase tracking-widest border border-violet-500/15">YOU</span>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-100 leading-tight truncate">{currentProfile.display_name}</h3>
                    <p className="text-[10px] text-zinc-600 truncate">{myAchievements.unlockedCount} Badges · {myStreak}d streak</p>
                  </div>
                </div>
              )}

              {/* VS */}
              <div className="flex flex-col items-center shrink-0 gap-1 my-1 md:my-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-violet-500/20 bg-violet-500/[0.06] flex items-center justify-center">
                  <Swords className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-[9px] font-black text-violet-500 tracking-widest">VS</span>
              </div>

              {/* Opponent */}
              <div className="flex items-center gap-3.5 sm:gap-4 flex-1 w-full justify-start md:justify-end text-left md:text-right">
                {competitorProfile ? (
                  <>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-white text-xl sm:text-2xl uppercase overflow-hidden border border-white/10 shrink-0 order-1 md:order-2"
                      style={{
                        backgroundColor: competitorProfile.avatar_url ? 'transparent' : (competitorProfile.avatar_color || '#10b981'),
                        boxShadow: `0 0 32px ${competitorProfile.avatar_color || '#10b981'}33`,
                      }}
                    >
                      {competitorProfile.avatar_url
                        ? <img src={competitorProfile.avatar_url} alt={competitorProfile.display_name} className="w-full h-full object-cover" />
                        : competitorProfile.display_name.charAt(0)
                      }
                    </div>
                    <div className="space-y-1 flex flex-col items-start md:items-end min-w-0 order-2 md:order-1">
                      <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Opponent</span>
                      <CompetitorSelect value={duelCompetitorId} onChange={setDuelCompetitorId} options={duelCompetitors} />
                      <p className="text-[10px] text-zinc-600 truncate">{compAchievements.unlockedCount} Badges · {compStreak}d streak</p>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-zinc-700">No other competitors yet.</div>
                )}
              </div>
            </div>
          </div>

          {/* Stat Metric Cards */}
          {competitorProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatDuelCard
                label="Questions Solved"
                icon={Trophy}
                myValue={mySolved}
                compValue={compSolved}
                myLabel="You"
                compLabel={competitorProfile.display_name}
                myColor="text-violet-400"
                compColor="text-zinc-300"
                verdict={{
                  win: `You lead by ${mySolved - compSolved} solve${mySolved - compSolved !== 1 ? 's' : ''}`,
                  lose: `Rival leads by ${compSolved - mySolved} solve${compSolved - mySolved !== 1 ? 's' : ''}`,
                  tie: 'Perfectly tied!',
                }}
              />
              <StatDuelCard
                label="Active Streak"
                icon={Flame}
                myValue={myStreak}
                compValue={compStreak}
                myLabel="You"
                compLabel={competitorProfile.display_name}
                myColor="text-orange-400"
                compColor="text-zinc-300"
                unit="d"
                verdict={{
                  win: 'You have the hotter streak 🔥',
                  lose: "Rival's streak is stronger",
                  tie: 'Streaks are identical!',
                }}
              />
              <StatDuelCard
                label="Badges Unlocked"
                icon={Award}
                myValue={myAchievements.unlockedCount}
                compValue={compAchievements.unlockedCount}
                myLabel="You"
                compLabel={competitorProfile.display_name}
                myColor="text-amber-400"
                compColor="text-zinc-300"
                verdict={{
                  win: 'More badges unlocked',
                  lose: 'Rival has more achievements',
                  tie: 'Badges are tied!',
                }}
              />
            </div>
          )}

          {/* Topic Duel List + Catch-Up */}
          {competitorProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Topic Duel List */}
              <div className="rounded-2xl border border-white/[0.05] flex flex-col" style={panelStyle}>
                <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-white/[0.04]">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Topic Duel (%)</p>
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto px-4 py-3 custom-scrollbar">
                  {duelTopicComparison.map(t => {
                    const myWins = t.myPct >= t.compPct;
                    return (
                      <div key={t.name} className="py-2.5 border-b border-white/[0.03] last:border-0">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-semibold text-zinc-300">{t.name}</span>
                          <span className="text-[10px] text-zinc-600 font-mono">
                            {t.mySolved} vs {t.compSolved}
                            <span className="text-zinc-700"> / {t.total}</span>
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[9px] font-bold leading-none">
                              <span className={myWins ? 'text-violet-400' : 'text-zinc-600'}>You</span>
                              <span className={myWins ? 'text-violet-400' : 'text-zinc-600'}>{t.myPct}%</span>
                            </div>
                            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${myWins ? 'bg-violet-500' : 'bg-zinc-700'}`}
                                style={{ width: `${t.myPct}%` }} />
                            </div>
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[9px] leading-none">
                              <span className={!myWins ? 'text-emerald-400' : 'text-zinc-600'}>{competitorProfile.display_name}</span>
                              <span className={!myWins ? 'text-emerald-400' : 'text-zinc-600'}>{t.compPct}%</span>
                            </div>
                            <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${!myWins ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                style={{ width: `${t.compPct}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Catch-Up Plan */}
              <div className="rounded-2xl border border-white/[0.05] flex flex-col" style={panelStyle}>
                <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-white/[0.04]">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Catch-Up Plan</p>
                </div>

                <div className="px-5 pt-3 pb-1">
                  <p className="text-[11px] text-zinc-600 leading-relaxed">
                    Problems <span className="text-zinc-400 font-medium">{competitorProfile.display_name}</span> solved but you haven't yet — close the gap!
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 custom-scrollbar">
                  {catchUpProblems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-400">No lead detected!</p>
                        <p className="text-[10px] text-zinc-700 mt-0.5">You've solved everything they've solved or more.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {catchUpProblems.map(q => (
                        <div key={q.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/15 transition-all group">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-zinc-200 truncate group-hover:text-violet-300 transition-colors">
                              {q.problem_name}
                            </h4>
                            <p className="text-[9px] text-zinc-600 mt-0.5">{q.topic} · {q.subtopic || 'General'}</p>
                          </div>
                          {q.link && (
                            <a href={q.link} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-violet-400 bg-violet-500/[0.08] hover:bg-violet-500/[0.18] rounded-lg border border-violet-500/15 transition-all cursor-pointer shrink-0">
                              <span>Solve</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                      <p className="text-[9px] text-zinc-700 text-right italic mt-1">
                        * Top recommendations to close the gap
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ComparePage;
