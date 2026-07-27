import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { calculateUserAchievements, calculateStreak } from '../lib/achievements';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Award, Flame, Trophy, ExternalLink, Sparkles, BookOpen, Crown, ChevronDown, Swords, UserPlus, Plus, Check, Eye } from 'lucide-react';
import UserProfileModal from '../components/UserProfileModal';
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
  const [userIdInput, setUserIdInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addError, setAddError] = useState('');
  const [customProfiles, setCustomProfiles] = useState([]);
  const [selectedModalUser, setSelectedModalUser] = useState(null);
  const searchContainerRef = useRef(null);

  // Approved profiles
  const approvedProfiles = useMemo(() => {
    return profiles.filter(p => p.approved || p.is_admin);
  }, [profiles]);

  // Combine approved profiles with any custom fetched profiles by User ID
  const allAvailableProfiles = useMemo(() => {
    const combined = [...approvedProfiles];
    customProfiles.forEach(cp => {
      if (!combined.some(p => p.id === cp.id)) {
        combined.push(cp);
      }
    });
    return combined;
  }, [approvedProfiles, customProfiles]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Suggestions filtered based on user input
  const userSuggestions = useMemo(() => {
    const query = userIdInput.trim().toLowerCase();
    if (!query) return [];
    const qClean = query.replace(/^@/, '');
    return allAvailableProfiles.filter(p => {
      const uId = (p.id || '').toLowerCase();
      const uName = (p.display_name || '').toLowerCase();
      const uHandle = (p.username || '').toLowerCase();
      return uId.includes(query) || uName.includes(qClean) || uHandle.includes(qClean);
    }).slice(0, 6);
  }, [userIdInput, allAvailableProfiles]);

  const uniqueTopics = useMemo(() => [...new Set(questions.map(q => q.topic))], [questions]);
  const [activeCompareTopic, setActiveCompareTopic] = useState(uniqueTopics[0] || '');

  // ── Group Arena ──────────────────────────────────────────────────────────────
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);
  useEffect(() => {
    if (approvedProfiles.length > 0 && selectedProfileIds.length === 0) {
      setSelectedProfileIds(approvedProfiles.map(p => p.id));
    }
  }, [approvedProfiles, selectedProfileIds]);

  const activeProfiles = useMemo(() => allAvailableProfiles.filter(p => selectedProfileIds.includes(p.id)), [allAvailableProfiles, selectedProfileIds]);

  const handleAddUserById = async (e) => {
    e?.preventDefault();
    setAddError('');
    setShowSuggestions(false);
    const query = userIdInput.trim();
    if (!query) return;

    const qLower = query.toLowerCase();
    const qClean = qLower.replace(/^@/, '');

    // 1. Check in local profiles
    let found = allAvailableProfiles.find(p => 
      p.id.toLowerCase() === qLower ||
      (p.username && p.username.toLowerCase() === qClean) ||
      p.display_name.toLowerCase() === qClean
    );

    // 2. If not found locally, query Supabase directly
    if (!found) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${query},username.eq.${qClean},display_name.ilike.%${qClean}%`)
          .maybeSingle();

        if (data) {
          found = data;
          setCustomProfiles(prev => [...prev, data]);
        }
      } catch (err) {
        console.error('Error searching profile by User ID:', err);
      }
    }

    if (found) {
      if (!selectedProfileIds.includes(found.id)) {
        setSelectedProfileIds(prev => [...prev, found.id]);
      }
      setUserIdInput('');
    } else {
      setAddError(`No racer found for "${query}". Please check User ID or @username.`);
    }
  };

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
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10);
  }, [activeProfiles, progress, questions]);

  // ── 1v1 Duel ────────────────────────────────────────────────────────────────
  const duelCompetitors = useMemo(() => allAvailableProfiles.filter(p => p.id !== currentProfile?.id), [allAvailableProfiles, currentProfile]);
  const [duelCompetitorId, setDuelCompetitorId] = useState('');

  useEffect(() => {
    if (duelCompetitors.length > 0 && !duelCompetitorId) {
      setDuelCompetitorId(duelCompetitors[0].id);
    }
  }, [duelCompetitors, duelCompetitorId]);

  const competitorProfile = useMemo(() => allAvailableProfiles.find(p => p.id === duelCompetitorId), [allAvailableProfiles, duelCompetitorId]);
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
      className="space-y-6 pb-12 font-sans"
    >

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-800/80">
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

          {/* Racer Selector & Add User ID Input */}
          <div className="rounded-2xl border border-white/[0.05] p-4 sm:p-5" style={panelStyle}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-widest">
                  Compare Racers
                  <span className="ml-2 text-zinc-400 font-mono">({selectedProfileIds.length} selected)</span>
                </p>
                <p className="text-zinc-500 text-xs mt-0.5">Toggle racers below or enter any User ID / @username to add.</p>
              </div>

              {/* Add Racer by User ID Form with Live Suggestions */}
              <div className="relative" ref={searchContainerRef}>
                <form onSubmit={handleAddUserById} className="flex items-center gap-1.5 shrink-0">
                  <div className="relative">
                    <UserPlus className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    <input
                      type="text"
                      value={userIdInput}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => { 
                        setUserIdInput(e.target.value); 
                        setAddError(''); 
                        setShowSuggestions(true);
                      }}
                      placeholder="User ID or @username..."
                      className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 w-48 xs:w-56 sm:w-64 transition-colors font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Floating Live Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && userIdInput.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-zinc-800 bg-[#0d0d11]/95 backdrop-blur-md shadow-2xl p-1.5 z-50 max-h-56 overflow-y-auto font-sans"
                    >
                      {userSuggestions.length === 0 ? (
                        <div className="px-3 py-2 text-center text-[11px] text-zinc-500 font-mono">
                          No local match. Click <span className="text-violet-400 font-semibold">Add</span> to search database.
                        </div>
                      ) : (
                        userSuggestions.map(u => {
                          const isAlreadyAdded = selectedProfileIds.includes(u.id);
                          return (
                            <div
                              key={u.id}
                              onClick={() => {
                                if (!isAlreadyAdded) {
                                  setSelectedProfileIds(prev => [...prev, u.id]);
                                } else {
                                  setSelectedProfileIds(prev => prev.filter(id => id !== u.id));
                                }
                                setUserIdInput('');
                                setShowSuggestions(false);
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                isAlreadyAdded
                                  ? 'bg-violet-500/[0.08] text-violet-300'
                                  : 'hover:bg-zinc-800/80 text-zinc-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar user={u} size="sm" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate">{u.display_name}</p>
                                  <p className="text-[9px] font-mono text-zinc-500 truncate">
                                    {u.username ? `@${u.username}` : `ID: ${u.id.slice(0, 8)}...`}
                                  </p>
                                </div>
                              </div>
                              {isAlreadyAdded ? (
                                <span className="text-[10px] font-mono text-violet-400 font-bold px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 shrink-0">
                                  Selected ✓
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 shrink-0 flex items-center gap-0.5">
                                  <Plus className="w-2.5 h-2.5" /> Select
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {addError && (
              <p className="text-[11px] text-red-400 font-mono mb-2 px-1">{addError}</p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {allAvailableProfiles.map(p => {
                const isSelected = selectedProfileIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all select-none ${
                      isSelected
                        ? 'bg-violet-500/[0.08] text-violet-300 border-violet-500/25 shadow-sm'
                        : 'text-zinc-500 border-white/[0.05] hover:text-zinc-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        setSelectedProfileIds(prev =>
                          prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                        );
                      }}
                    >
                      <Avatar user={p} size="sm" />
                      <span className="truncate">{p.display_name}</span>
                      {isSelected && <span className="text-[10px] text-violet-400">✓</span>}
                    </div>

                    {/* View Profile Icon Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModalUser(p);
                      }}
                      className="p-1 rounded-md bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="View Racer Profile"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Completion Rankings */}
          {userCompletionRankings.length > 0 && (
            <div className="rounded-2xl border border-white/[0.05] p-4 sm:p-5" style={panelStyle}>
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold tracking-widest">
                  Overall Completion <span className="text-zinc-600 font-normal">(Top 10 Racers)</span>
                </p>
                <span className="text-[10px] font-mono text-zinc-600">
                  Top 10 Max
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {userCompletionRankings.map((user, idx) => (
                  <div
                    key={user.id} 
                    onClick={() => setSelectedModalUser(user)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer group relative"
                  >
                    <Avatar user={user} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-zinc-300 group-hover:text-amber-400 transition-colors truncate">{user.display_name}</p>
                        <Eye className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" title="View Profile" />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {idx === 0 && <Crown className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                        <p className="text-[11px] font-bold text-violet-400 font-mono">{user.pct}%</p>
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
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest font-mono">Topic Completion (%)</p>
            </div>
            {activeProfiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-600 font-mono">
                Select or add racers above to compare.
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
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest font-mono">Subtopic Completion (%)</p>
              </div>
              <select
                value={activeCompareTopic}
                onChange={e => setActiveCompareTopic(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl glass-input text-zinc-300 focus:outline-none cursor-pointer bg-zinc-900 border border-zinc-800"
              >
                {uniqueTopics.map(t => (
                  <option key={t} value={t} className="bg-zinc-900 text-zinc-300">{t}</option>
                ))}
              </select>
            </div>
            {activeProfiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-600 font-mono">
                Select or add racers above to compare subtopics.
              </div>
            ) : (
              <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
                <div style={{ minWidth: Math.max(600, subtopicComparisonData.length * 120) }}>
                  <ResponsiveContainer width="100%" height={320}>
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
          TAB: 1v1 DUEL
      ════════════════════════════════════════════════════ */}
      {activeTab === 'duel' && (
        <div className="space-y-6 animate-fadeIn">

          {/* Opponent Selector Banner */}
          <div className="rounded-2xl border border-white/[0.05] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={panelStyle}>
            <div className="flex items-center gap-3">
              <Avatar user={currentProfile || { display_name: 'You' }} size="md" />
              <span className="text-zinc-500 font-bold text-sm">VS</span>
              {competitorProfile && <Avatar user={competitorProfile} size="md" />}
              <div>
                <p className="text-xs font-bold text-white">1v1 Head-to-Head Duel</p>
                <p className="text-[11px] text-zinc-500">Comparing your stats against {competitorProfile?.display_name || 'Rival'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Select Rival:</span>
              <CompetitorSelect
                value={duelCompetitorId}
                onChange={setDuelCompetitorId}
                options={duelCompetitors}
              />
            </div>
          </div>

          {/* Key Stat Cards (3 grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatDuelCard
              label="Total Problems Solved"
              icon={Trophy}
              myValue={mySolved}
              compValue={compSolved}
              myLabel={currentProfile?.display_name || 'You'}
              compLabel={competitorProfile?.display_name || 'Rival'}
              myColor="text-violet-400"
              compColor="text-emerald-400"
              unit={` / ${questions.length}`}
              verdict={{
                win: `${mySolved - compSolved} problems ahead!`,
                lose: `${compSolved - mySolved} problems behind`,
                tie: 'Perfectly tied!',
              }}
            />

            <StatDuelCard
              label="Active Daily Streak"
              icon={Flame}
              myValue={myStreak}
              compValue={compStreak}
              myLabel={currentProfile?.display_name || 'You'}
              compLabel={competitorProfile?.display_name || 'Rival'}
              myColor="text-orange-400"
              compColor="text-amber-400"
              unit="d"
              verdict={{
                win: `${myStreak - compStreak} days longer streak!`,
                lose: `${compStreak - myStreak} days shorter streak`,
                tie: 'Equal streak!',
              }}
            />

            <StatDuelCard
              label="Achievements Unlocked"
              icon={Award}
              myValue={myAchievements.unlockedCount}
              compValue={compAchievements.unlockedCount}
              myLabel={currentProfile?.display_name || 'You'}
              compLabel={competitorProfile?.display_name || 'Rival'}
              myColor="text-cyan-400"
              compColor="text-indigo-400"
              unit=" badges"
              verdict={{
                win: `${myAchievements.unlockedCount - compAchievements.unlockedCount} more badges!`,
                lose: `${compAchievements.unlockedCount - myAchievements.unlockedCount} fewer badges`,
                tie: 'Same badge count!',
              }}
            />
          </div>

          {/* Catch Up Problems to Solve */}
          {catchUpProblems.length > 0 && (
            <div className="rounded-2xl border border-white/[0.05] p-5" style={panelStyle}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white">Catch-Up Target Problems</h3>
                <span className="text-[10px] text-zinc-500 font-mono">({competitorProfile?.display_name} solved these, but you haven't yet)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {catchUpProblems.map(q => (
                  <a
                    key={q.id}
                    href={q.leetcode_link || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[10px] font-mono text-zinc-500 truncate">{q.topic}</p>
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">{q.problem_name}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Topic-by-Topic Breakdown Chart */}
          <div className="rounded-2xl border border-white/[0.05] p-5 flex flex-col min-h-[380px]" style={panelStyle}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-violet-400" />
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest font-mono">1v1 Topic Breakdown (%)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-violet-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500" /> {currentProfile?.display_name || 'You'}
                </span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> {competitorProfile?.display_name || 'Rival'}
                </span>
              </div>
            </div>

            <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
              <div style={{ minWidth: Math.max(900, duelTopicComparison.length * 90) }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={duelTopicComparison} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#27272a" tick={{ fill: '#52525b', fontSize: 9 }} height={35} interval={0} />
                    <YAxis domain={[0, 100]} stroke="#27272a" tick={{ fill: '#3f3f46', fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                    <Bar dataKey="myPct" name={currentProfile?.display_name || 'You'} fill="#8b5cf6" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="compPct" name={competitorProfile?.display_name || 'Rival'} fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal when clicking view profile icon */}
      {selectedModalUser && (
        <UserProfileModal
          user={selectedModalUser}
          progress={progress}
          questions={questions}
          onClose={() => setSelectedModalUser(null)}
        />
      )}
    </motion.div>
  );
};

export default ComparePage;
