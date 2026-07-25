import React, { useState, useMemo, useEffect } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { calculateUserAchievements, calculateStreak } from '../lib/achievements';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Award, Flame, Trophy, ExternalLink, Sparkles, BookOpen, Crown, ChevronRight, RefreshCw } from 'lucide-react';

const tooltipStyle = {
  backgroundColor: '#111113',
  borderColor: '#1f1f23',
  borderRadius: '10px',
  color: '#f4f4f5',
  fontSize: '12px',
};

const CompetitorSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const cur = options.find(o => o.id === value);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg glass-input text-zinc-300 cursor-pointer transition-all select-none w-44 active:scale-98"
      >
        <span className="truncate flex-1 text-left">{cur?.display_name || 'Select Rival'}</span>
        <span className="text-zinc-500 shrink-0 text-[10px] ml-1">▼</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1.5 w-48 bg-[#111113] border border-[#2a2a2e] rounded-xl shadow-2xl shadow-black/85 py-1 z-50 overflow-y-auto max-h-60 custom-scrollbar">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs cursor-pointer transition-colors text-left ${
                opt.id === value ? 'text-violet-400 bg-violet-500/8 font-bold' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-white text-[9px] uppercase shrink-0 overflow-hidden"
                style={{ backgroundColor: opt.avatar_url ? 'transparent' : (opt.avatar_color || '#6366f1') }}
              >
                {opt.avatar_url ? (
                  <img src={opt.avatar_url} alt={opt.display_name} className="w-full h-full object-cover" />
                ) : (
                  opt.display_name?.charAt(0) || '?'
                )}
              </div>
              <span className="truncate">{opt.display_name}</span>
              {opt.id === value && <span className="ml-auto text-violet-400 text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ComparePage = () => {
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();
  const { profile: currentProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('group'); // 'group' or 'duel'

  // Topic list helper
  const uniqueTopics = useMemo(() => [...new Set(questions.map(q => q.topic))], [questions]);
  const [activeCompareTopic, setActiveCompareTopic] = useState(uniqueTopics[0] || '');

  // ──────────────────────────────────────────────────────────────────────────
  // GROUP ARENA STATE & DATA
  // ──────────────────────────────────────────────────────────────────────────
  const [selectedProfileIds, setSelectedProfileIds] = useState([]);

  useEffect(() => {
    if (profiles.length > 0 && selectedProfileIds.length === 0) {
      setSelectedProfileIds(profiles.map(p => p.id));
    }
  }, [profiles, selectedProfileIds]);

  const activeProfiles = useMemo(() => {
    return profiles.filter(p => selectedProfileIds.includes(p.id));
  }, [profiles, selectedProfileIds]);

  // Topic completion comparisons
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

  // Subtopic completion comparisons
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

  // General rankings of selected profiles
  const userCompletionRankings = useMemo(() => {
    const totalQ = questions.length || 1;
    return activeProfiles.map(p => {
      const solved = progress.filter(pr => pr.user_id === p.id && pr.status === 'done').length;
      return { ...p, solved, pct: Math.round((solved / totalQ) * 100) };
    }).sort((a, b) => b.pct - a.pct);
  }, [activeProfiles, progress, questions]);


  // ──────────────────────────────────────────────────────────────────────────
  // 1V1 DUEL STATE & DATA
  // ──────────────────────────────────────────────────────────────────────────
  const duelCompetitors = useMemo(() => {
    return profiles.filter(p => p.id !== currentProfile?.id);
  }, [profiles, currentProfile]);

  const [duelCompetitorId, setDuelCompetitorId] = useState('');

  useEffect(() => {
    if (duelCompetitors.length > 0 && !duelCompetitorId) {
      setDuelCompetitorId(duelCompetitors[0].id);
    }
  }, [duelCompetitors, duelCompetitorId]);

  const competitorProfile = useMemo(() => {
    return profiles.find(p => p.id === duelCompetitorId);
  }, [profiles, duelCompetitorId]);

  const myProgress = useMemo(() => progress.filter(p => p.user_id === currentProfile?.id), [progress, currentProfile]);
  const compProgress = useMemo(() => progress.filter(p => p.user_id === duelCompetitorId), [progress, duelCompetitorId]);

  const myAchievements = useMemo(() => {
    if (!currentProfile) return { totalXP: 0, unlockedCount: 0 };
    return calculateUserAchievements(currentProfile.id, progress, questions);
  }, [currentProfile, progress, questions]);

  const compAchievements = useMemo(() => {
    if (!duelCompetitorId) return { totalXP: 0, unlockedCount: 0 };
    return calculateUserAchievements(duelCompetitorId, progress, questions);
  }, [duelCompetitorId, progress, questions]);

  const myStreak = useMemo(() => calculateStreak(myProgress), [myProgress]);
  const compStreak = useMemo(() => calculateStreak(compProgress), [compProgress]);

  const mySolved = useMemo(() => myProgress.filter(p => p.status === 'done').length, [myProgress]);
  const compSolved = useMemo(() => compProgress.filter(p => p.status === 'done').length, [compProgress]);

  // Topic list comparisons for 1v1 grid
  const duelTopicComparison = useMemo(() => {
    if (!currentProfile || !competitorProfile || !questions.length) return [];
    
    // Group questions by topic
    const topicGroups = {};
    questions.forEach(q => {
      if (!topicGroups[q.topic]) topicGroups[q.topic] = [];
      topicGroups[q.topic].push(q.id);
    });

    return Object.keys(topicGroups).map(topicName => {
      const qIds = topicGroups[topicName];
      const mySolved = myProgress.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
      const compSolved = compProgress.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;

      const myPct = qIds.length > 0 ? Math.round((mySolved / qIds.length) * 100) : 0;
      const compPct = qIds.length > 0 ? Math.round((compSolved / qIds.length) * 100) : 0;

      return {
        name: topicName,
        myPct,
        compPct,
        total: qIds.length,
        mySolved,
        compSolved
      };
    });
  }, [myProgress, compProgress, questions, currentProfile, competitorProfile]);

  // Catch-Up recommendations (Competitor completed but user has not)
  const catchUpProblems = useMemo(() => {
    if (!duelCompetitorId || !currentProfile) return [];
    const compDoneIds = compProgress.filter(p => p.status === 'done').map(p => p.question_id);
    const myDoneIds = myProgress.filter(p => p.status === 'done').map(p => p.question_id);
    
    const catchUpIds = compDoneIds.filter(id => !myDoneIds.includes(id));
    return questions.filter(q => catchUpIds.includes(q.id)).slice(0, 6);
  }, [compProgress, myProgress, questions, duelCompetitorId, currentProfile]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Compare Progress</h1>
          <p className="text-zinc-500 text-sm mt-1">Side-by-side progression across topics and subtopics.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/60 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('group')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none ${
              activeTab === 'group'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Group Arena
          </button>
          <button
            onClick={() => setActiveTab('duel')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none ${
              activeTab === 'duel'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            1v1 Duel
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
         TAB: GROUP ARENA
      ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'group' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Racer Selector */}
          <div className="glass-panel p-4 rounded-2xl">
            <p className="section-label mb-3">Compare Racers ({selectedProfileIds.length} selected)</p>
            <div className="flex flex-wrap gap-2.5">
              {profiles.map(p => {
                const isSelected = selectedProfileIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProfileIds(prev =>
                        prev.includes(p.id)
                          ? prev.filter(id => id !== p.id)
                          : [...prev, p.id]
                      );
                    }}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-violet-500/10 text-violet-400 border-violet-500/35'
                        : 'bg-zinc-900/40 text-zinc-500 border-[#1f1f23] hover:text-zinc-200 hover:bg-zinc-800/30'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-white text-[10px] uppercase shrink-0 overflow-hidden"
                      style={{ backgroundColor: p.avatar_url ? 'transparent' : (p.avatar_color || '#6366f1') }}
                    >
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.display_name} className="w-full h-full object-cover" />
                      ) : (
                        p.display_name?.charAt(0) || '?'
                      )}
                    </div>
                    <span>{p.display_name}</span>
                    {isSelected && <span className="text-[10px] text-violet-400">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overview rankings */}
          {userCompletionRankings.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl">
              <p className="section-label mb-3">Overall Completion</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {userCompletionRankings.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 bg-zinc-900/40 border border-[#1f1f23] p-3 rounded-xl">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm uppercase shrink-0 overflow-hidden"
                      style={{ backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1') }}
                    >
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                      ) : (
                        user.display_name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-300 truncate">{user.display_name}</p>
                      <p className="text-xxs font-bold text-violet-400 mt-0.5">{user.pct}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic comparison chart */}
          <div className="glass-panel p-5 rounded-2xl min-h-[360px] flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <Users className="w-4 h-4 text-zinc-500" />
              <p className="section-label">Topic Completion (%)</p>
            </div>
            {activeProfiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-655">
                Select racers to compare above.
              </div>
            ) : (
              <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
                <div style={{ minWidth: Math.max(900, uniqueTopics.length * 100) }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={topicComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} height={35} interval={0} />
                      <YAxis domain={[0, 100]} stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
                      {activeProfiles.map(p => (
                        <Bar key={p.id} dataKey={p.display_name} fill={p.avatar_color || '#6366f1'} radius={[3, 3, 0, 0]} maxBarSize={28} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Subtopic comparison chart */}
          <div className="glass-panel p-5 rounded-2xl min-h-[360px] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-zinc-500" />
                <p className="section-label">Subtopic Completion (%)</p>
              </div>
              <select
                value={activeCompareTopic}
                onChange={e => setActiveCompareTopic(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg glass-input text-zinc-300 focus:outline-none cursor-pointer w-full sm:w-56"
              >
                {uniqueTopics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {activeProfiles.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">
                Select racers to compare above.
              </div>
            ) : (
              <div className="flex-1 w-full overflow-x-auto custom-scrollbar">
                <div style={{ minWidth: Math.max(750, subtopicComparisonData.length * 160) }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subtopicComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#3f3f46" tick={{ fill: '#71717a', fontSize: 10 }} height={35} interval={0} />
                      <YAxis domain={[0, 100]} stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
                      {activeProfiles.map(p => (
                        <Bar key={p.id} dataKey={p.display_name} fill={p.avatar_color || '#6366f1'} radius={[3, 3, 0, 0]} maxBarSize={28} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
         TAB: 1V1 DUEL
      ───────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'duel' && (
        <div className="space-y-6 animate-fadeIn">
          {/*VS Card Board */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative z-20 bg-gradient-to-r from-[#111113] via-purple-950/5 to-[#111113]">
            {/* Left: You */}
            {currentProfile && (
              <div className="flex items-center gap-4 flex-1 w-full justify-start">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl uppercase border-2 border-violet-500/25 shrink-0 overflow-hidden"
                  style={{ backgroundColor: currentProfile.avatar_url ? 'transparent' : (currentProfile.avatar_color || '#6366f1') }}
                >
                  {currentProfile.avatar_url ? (
                    <img src={currentProfile.avatar_url} alt={currentProfile.display_name} className="w-full h-full object-cover" />
                  ) : (
                    currentProfile.display_name.charAt(0)
                  )}
                </div>
                <div className="space-y-1">
                  <span className="px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[9px] font-bold uppercase tracking-wider">YOU</span>
                  <h3 className="text-lg font-bold text-zinc-100">{currentProfile.display_name}</h3>
                  <p className="text-xxs text-zinc-500">⭐ {myAchievements.totalXP} XP Score</p>
                </div>
              </div>
            )}

            {/* Center: VS Circle */}
            <div className="w-12 h-12 rounded-full bg-violet-600/10 border-2 border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm select-none shadow-md shrink-0">
              VS
            </div>

            {/* Right: Competitor Selector */}
            <div className="flex items-center gap-4 flex-1 w-full justify-end text-right">
              {competitorProfile ? (
                <>
                  <div className="space-y-1.5 flex flex-col items-end">
                    <span className="section-label">OPPONENT</span>
                    <CompetitorSelect
                      value={duelCompetitorId}
                      onChange={setDuelCompetitorId}
                      options={duelCompetitors}
                    />
                    <p className="text-xxs text-zinc-500">⭐ {compAchievements.totalXP} XP Score</p>
                  </div>
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl uppercase border-2 border-zinc-800 shrink-0 overflow-hidden"
                    style={{ backgroundColor: competitorProfile.avatar_url ? 'transparent' : (competitorProfile.avatar_color || '#10b981') }}
                  >
                    {competitorProfile.avatar_url ? (
                      <img src={competitorProfile.avatar_url} alt={competitorProfile.display_name} className="w-full h-full object-cover" />
                    ) : (
                      competitorProfile.display_name.charAt(0)
                    )}
                  </div>
                </>
              ) : (
                <div className="text-xs text-zinc-600">No other competitors yet.</div>
              )}
            </div>
          </div>

          {/* Stat Comparison Metric Cards */}
          {competitorProfile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Solved comparison */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="section-label">Questions Solved</span>
                  <Trophy className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="flex justify-between items-baseline mt-4">
                  <div className="text-center flex-1">
                    <p className="text-xxs text-zinc-500">You</p>
                    <p className="text-2xl font-bold text-violet-400 mt-1">{mySolved}</p>
                  </div>
                  <div className="px-3 text-zinc-700 font-bold">:</div>
                  <div className="text-center flex-1">
                    <p className="text-xxs text-zinc-500">{competitorProfile.display_name}</p>
                    <p className="text-2xl font-bold text-zinc-300 mt-1">{compSolved}</p>
                  </div>
                </div>
                <div className="text-center mt-3 text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1">
                  {mySolved > compSolved ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span>You are leading by {mySolved - compSolved} solves</span>
                    </>
                  ) : mySolved < compSolved ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-zinc-650" />
                      <span>Rival is leading by {compSolved - mySolved} solves</span>
                    </>
                  ) : (
                    <span>Perfectly tied!</span>
                  )}
                </div>
              </div>

              {/* Streak comparison */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="section-label">Active Streak</span>
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex justify-between items-baseline mt-4">
                  <div className="text-center flex-1">
                    <p className="text-xxs text-zinc-500">You</p>
                    <p className="text-2xl font-bold text-orange-400 mt-1">{myStreak}d</p>
                  </div>
                  <div className="px-3 text-zinc-700 font-bold">:</div>
                  <div className="text-center flex-1">
                    <p className="text-xxs text-zinc-500">{competitorProfile.display_name}</p>
                    <p className="text-2xl font-bold text-zinc-300 mt-1">{compStreak}d</p>
                  </div>
                </div>
                <div className="text-center mt-3 text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1">
                  {myStreak > compStreak ? (
                    <span>🔥 You have the hotter streak!</span>
                  ) : myStreak < compStreak ? (
                    <span>Rival streak is stronger!</span>
                  ) : (
                    <span>Streaks are identical!</span>
                  )}
                </div>
              </div>

              {/* Achievement XP comparison */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="section-label">Badges & XP</span>
                  <Award className="w-4 h-4 text-violet-400" />
                </div>
                <div className="flex justify-between items-baseline mt-4">
                  <div className="text-center flex-1">
                    <p className="text-xxs text-zinc-500">You</p>
                    <p className="text-2xl font-bold text-violet-400 mt-1">{myAchievements.unlockedCount} <span className="text-[10px] font-normal text-zinc-500">({myAchievements.totalXP} XP)</span></p>
                  </div>
                  <div className="px-3 text-zinc-700 font-bold">:</div>
                  <div className="text-center flex-1">
                    <p className="text-xxs text-zinc-500">{competitorProfile.display_name}</p>
                    <p className="text-2xl font-bold text-zinc-300 mt-1">{compAchievements.unlockedCount} <span className="text-[10px] font-normal text-zinc-500">({compAchievements.totalXP} XP)</span></p>
                  </div>
                </div>
                <div className="text-center mt-3 text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1">
                  {myAchievements.totalXP > compAchievements.totalXP ? (
                    <span>⭐ Higher Power Score</span>
                  ) : myAchievements.totalXP < compAchievements.totalXP ? (
                    <span>Rival has more achievements</span>
                  ) : (
                    <span>Badges are tied!</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lower Grid: Topics vs Catch-Up Plan */}
          {competitorProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Topic Progress side-by-side list */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <p className="section-label">Topic Duel (%)</p>
                </div>
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {duelTopicComparison.map(t => (
                    <div key={t.name} className="space-y-1.5 py-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-zinc-200">{t.name}</span>
                        <span className="text-xxs text-zinc-500 font-mono">
                          {t.mySolved} vs {t.compSolved} / {t.total}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3.5">
                        {/* You Progress */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[9px] text-violet-400 font-bold leading-none">
                            <span>You</span>
                            <span>{t.myPct}%</span>
                          </div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${t.myPct}%` }} />
                          </div>
                        </div>
                        {/* Opponent Progress */}
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[9px] text-zinc-450 leading-none">
                            <span>{competitorProfile.display_name}</span>
                            <span>{t.compPct}%</span>
                          </div>
                          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-zinc-400 rounded-full transition-all duration-300" style={{ width: `${t.compPct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catch-Up Plan (Opponent completed but you have not) */}
              <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <p className="section-label">Catch-Up Target Plan</p>
                  </div>
                  <p className="text-[10px] text-zinc-500 mb-4 leading-normal">
                    Problems that {competitorProfile.display_name} has solved but you haven't. Attack these to close the gap!
                  </p>
                  {catchUpProblems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-zinc-650 bg-zinc-900/10 border border-zinc-800/30 rounded-2xl">
                      <BookOpen className="w-8 h-8 text-zinc-700 mb-2" />
                      <p className="font-semibold text-zinc-550">Rival has no lead on you!</p>
                      <p className="text-[10px] mt-0.5">You've solved everything they've solved or more. Great job!</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {catchUpProblems.map(q => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between gap-3 bg-zinc-900/30 border border-zinc-800/40 p-3 rounded-xl hover:bg-zinc-900/50 transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-zinc-200 truncate leading-snug group-hover:text-violet-400 transition-colors">
                              {q.problem_name}
                            </h4>
                            <p className="text-[9px] text-zinc-500 mt-0.5">{q.topic} · {q.subtopic}</p>
                          </div>
                          {q.link && (
                            <a
                              href={q.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-violet-400 bg-violet-500/8 hover:bg-violet-500/20 rounded-lg border border-violet-500/25 transition-all select-none cursor-pointer shrink-0"
                            >
                              <span>Solve</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {catchUpProblems.length > 0 && (
                  <p className="text-[8px] text-zinc-600 italic text-right mt-3 select-none leading-none">
                    * Showing top recommendations to close the distance.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComparePage;
