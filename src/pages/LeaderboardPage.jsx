import React, { useState, useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Flame, Calendar, Activity, Crown, Award, X, Zap, Sparkles, BookOpen, Workflow, BookmarkCheck, Layers, Network, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { calculateUserAchievements } from '../lib/achievements';

const IconMap = {
  Award, Zap, Flame, Trophy, Calendar, Activity,
  Layers, Sparkles, BookOpen, Workflow,
  BookmarkCheck, Network
};

// ── User Profile Modal ────────────────────────────────────────────────────────
const UserProfileModal = ({ user, progress, questions, onClose }) => {
  const userProgress = useMemo(() => progress.filter(p => p.user_id === user.id), [progress, user.id]);

  const [showAllSolved, setShowAllSolved] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
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
      .slice(0, 5)
      .map(p => {
        const q = questions.find(qi => qi.id === p.question_id);
        return q ? { ...q, solvedAt: p.updated_at } : null;
      })
      .filter(Boolean);
  }, [userProgress, questions]);

  const allSolvedGrouped = useMemo(() => {
    const solvedProgress = userProgress.filter(p => p.status === 'done');
    const solvedQuestions = solvedProgress
      .map(p => {
        const q = questions.find(qi => qi.id === p.question_id);
        return q ? { ...q, solvedAt: p.updated_at } : null;
      })
      .filter(Boolean)
      .filter(q => {
        if (!modalSearch.trim()) return true;
        return q.problem_name.toLowerCase().includes(modalSearch.toLowerCase()) ||
               q.topic.toLowerCase().includes(modalSearch.toLowerCase()) ||
               (q.subtopic || '').toLowerCase().includes(modalSearch.toLowerCase());
      });

    const groups = {};
    solvedQuestions.forEach(q => {
      if (!groups[q.topic]) groups[q.topic] = [];
      groups[q.topic].push(q);
    });
    return groups;
  }, [userProgress, questions, modalSearch]);

  const totalQ = questions.length || 502;
  const pct = Math.round((stats.solved / totalQ) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-5xl bg-[#0f0f11] border border-[#252528] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col h-[90vh] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f23] shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-lg uppercase shrink-0 overflow-hidden"
              style={{ backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1') }}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
              ) : (
                user.display_name?.charAt(0) || '?'
              )}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-base leading-tight">{user.display_name}</h3>
              <p className="text-xxs text-zinc-500 mt-1 uppercase font-mono tracking-wider">Racer Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 cursor-pointer p-1 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Left Column: Stats & Progress */}
            <div className="space-y-5">
              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-zinc-900/40 border border-[#1f1f23] p-2.5 rounded-xl text-center">
                  <span className="text-xxs text-zinc-500 uppercase block font-semibold">Solved</span>
                  <span className="text-sm font-bold text-zinc-200 mt-1 block">{stats.solved} / {totalQ}</span>
                  <span className="text-[10px] text-violet-400 font-bold block">{pct}%</span>
                </div>
                <div className="bg-zinc-900/40 border border-[#1f1f23] p-2.5 rounded-xl text-center flex flex-col justify-center items-center">
                  <span className="text-xxs text-zinc-500 uppercase block font-semibold">Streak</span>
                  <span className="text-sm font-bold text-zinc-200 mt-1 flex items-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    {user.streak}d
                  </span>
                </div>
                <div className="bg-zinc-900/40 border border-[#1f1f23] p-2.5 rounded-xl text-center flex flex-col justify-center items-center">
                  <span className="text-xxs text-zinc-500 uppercase block font-semibold">This Week</span>
                  <span className="text-sm font-bold text-zinc-200 mt-1 flex items-center gap-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    +{user.solvedThisWeek}
                  </span>
                </div>
                <div className="bg-zinc-900/40 border border-violet-500/20 p-2.5 rounded-xl text-center flex flex-col justify-center items-center bg-violet-500/5">
                  <span className="text-xxs text-violet-400 uppercase block font-semibold font-bold">Badges</span>
                  <span className="text-sm font-bold text-zinc-100 mt-1 block">{unlockedCount} Unlocked</span>
                </div>
              </div>

              {/* Topic Progress chart */}
              <div className="bg-zinc-950/40 border border-zinc-800/40 p-4 rounded-xl">
                <p className="section-label mb-3">Topic Completion</p>
                <div className="h-48 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                  {topicData.map(t => (
                    <div key={t.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xxs">
                        <span className="text-zinc-300 font-medium truncate max-w-[160px]">{t.name}</span>
                        <span className="text-zinc-400 font-mono">{t.solved}/{t.total} ({t.completed}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            t.completed === 100 ? 'bg-emerald-500' : t.solved > 0 ? 'bg-violet-500' : 'bg-zinc-800'
                          }`}
                          style={{ width: `${Math.max(t.solved > 0 ? 3 : 0, t.completed)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solved Questions Explorer */}
              <div className="border-t border-[#1f1f23] pt-4 space-y-4">
                <button
                  onClick={() => setShowAllSolved(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900/30 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer select-none"
                >
                  <span>View All Solved Questions ({stats.solved})</span>
                  <span className="text-zinc-500">{showAllSolved ? '▲' : '▼'}</span>
                </button>

                {showAllSolved && (
                  <div className="space-y-3 animate-fadeIn">
                    {/* Search query box */}
                    {stats.solved > 0 && (
                      <div className="relative">
                        <input
                          type="text"
                          value={modalSearch}
                          onChange={e => setModalSearch(e.target.value)}
                          placeholder="Search solved problems..."
                          className="w-full pl-3 pr-3 py-2 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-650 focus:outline-none"
                        />
                      </div>
                    )}

                    {Object.keys(allSolvedGrouped).length === 0 ? (
                      <p className="text-xs text-zinc-600 text-center py-4">No completed problems match your search.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                        {Object.entries(allSolvedGrouped).map(([topic, topicQs]) => {
                          const isExpanded = !!expandedModalTopics[topic];
                          return (
                            <div key={topic} className="border border-[#1f1f23] rounded-xl overflow-hidden bg-zinc-950/20">
                              {/* Topic sub-header */}
                              <button
                                onClick={() => setExpandedModalTopics(prev => ({ ...prev, [topic]: !isExpanded }))}
                                className="w-full flex items-center justify-between px-3.5 py-2 text-left cursor-pointer hover:bg-zinc-900/40 transition-colors group select-none"
                              >
                                <span className="text-xxs font-bold uppercase tracking-wider text-zinc-400">{topic} ({topicQs.length})</span>
                                <span className="text-zinc-600 group-hover:text-zinc-400 text-xxs">{isExpanded ? '▲' : '▼'}</span>
                              </button>

                              {/* Problem list inside topic */}
                              {isExpanded && (
                                <div className="divide-y divide-[#1f1f23] border-t border-[#1f1f23] bg-zinc-900/10">
                                  {topicQs.map(q => (
                                    <div key={q.id} className="flex items-center justify-between gap-3 px-3.5 py-2 hover:bg-zinc-900/30 transition-colors">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xxs font-mono text-zinc-600">#{q.sr_no}</span>
                                          <span className="text-xs text-zinc-300 font-medium truncate leading-tight">{q.problem_name}</span>
                                        </div>
                                        <p className="text-[9px] text-zinc-550 mt-0.5 ml-6">{q.subtopic}</p>
                                      </div>
                                      <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[9px] text-zinc-600">
                                          {formatRelativeTime(q.solvedAt)}
                                        </span>
                                        {q.link && (
                                          <a
                                            href={q.link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300 transition-colors"
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
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          {/* Right Column: Badges & Feed */}
          <div className="space-y-5">
            {/* Unlocked Badges */}
            <div className="space-y-3">
              <p className="section-label">Unlocked Badges ({unlockedCount} / {achievementsList.length})</p>
              {unlockedCount === 0 ? (
                <p className="text-xs text-zinc-655 py-2 text-center bg-zinc-900/20 rounded-xl border border-zinc-800/30">No badges unlocked yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {achievementsList.filter(ach => ach.unlocked).map(ach => {
                    const Icon = IconMap[ach.icon] || Award;
                    return (
                      <div
                        key={ach.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border bg-gradient-to-br ${ach.color} text-zinc-100`}
                        title={ach.description}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xxs font-bold truncate leading-tight">{ach.title}</p>
                          <p className="text-[8px] text-zinc-350 truncate mt-0.5 uppercase">{ach.category}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recently solved feed */}
            <div className="space-y-3">
              <p className="section-label">Recently Solved</p>
              {recentlySolved.length === 0 ? (
                <p className="text-xs text-zinc-600 py-2">No solved questions yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentlySolved.map(q => (
                    <div key={q.id} className="flex items-center justify-between gap-3 bg-zinc-900/30 border border-[#1f1f23]/60 px-3.5 py-2.5 rounded-xl">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-zinc-200 truncate">{q.problem_name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{q.topic} · {q.subtopic}</p>
                      </div>
                      <span className="text-[10px] text-zinc-600 shrink-0">
                        {formatRelativeTime(q.solvedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end px-6 py-4 border-t border-[#1f1f23] shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
        >
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
        <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: i <= d ? color : '#27272a' }} />
      ))}
    </div>
  );
};

const RANK_STYLES = {
  1: {
    cardBg: 'bg-gradient-to-r from-amber-500/12 via-yellow-500/5 to-transparent border-amber-500/35 shadow-lg shadow-amber-500/5',
    badgeBg: 'bg-gradient-to-br from-amber-400 to-yellow-500 text-zinc-950 font-extrabold shadow-sm border border-amber-300/60',
    barColor: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
    icon: Crown,
    iconClass: 'text-zinc-950 fill-zinc-950',
    titleBadge: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
    titleText: '#1 Champion',
  },
  2: {
    cardBg: 'bg-gradient-to-r from-zinc-300/12 via-zinc-400/5 to-transparent border-zinc-300/35 shadow-lg shadow-zinc-400/5',
    badgeBg: 'bg-gradient-to-br from-zinc-200 to-zinc-400 text-zinc-950 font-extrabold shadow-sm border border-zinc-100/60',
    barColor: 'bg-gradient-to-r from-zinc-200 via-zinc-300 to-zinc-400',
    icon: Award,
    iconClass: 'text-zinc-950 fill-zinc-950',
    titleBadge: 'bg-zinc-300/20 text-zinc-200 border border-zinc-300/30',
    titleText: '#2 Runner Up',
  },
  3: {
    cardBg: 'bg-gradient-to-r from-amber-700/15 via-amber-800/5 to-transparent border-amber-700/35 shadow-lg shadow-amber-700/5',
    badgeBg: 'bg-gradient-to-br from-amber-600 to-amber-800 text-white font-extrabold shadow-sm border border-amber-500/60',
    barColor: 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800',
    icon: Award,
    iconClass: 'text-white fill-white',
    titleBadge: 'bg-amber-700/20 text-amber-400 border border-amber-600/30',
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

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-6">
      {/* Header & Quick Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-zinc-800/40">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            Leaderboard
            <span className="text-xxs px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono font-medium">
              Live Rankings
            </span>
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">Real-time DSA problem-solving leaderboard across all registered racers.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-semibold">Racers</p>
              <p className="text-xs font-bold text-zinc-100">{leaderboard.length}</p>
            </div>
          </div>
          <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-[9px] text-zinc-500 uppercase font-semibold">Top Streak</p>
              <p className="text-xs font-bold text-zinc-100">{Math.max(...leaderboard.map(u => u.streak || 0), 0)}d</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Rankings List */}
        <div className="lg:col-span-2 space-y-2.5">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl">
              <p className="text-zinc-500 text-sm">No members registered yet.</p>
            </div>
          ) : (
            leaderboard.map((user, idx) => {
              const isCurrent = user.id === currentProfile?.id;
              const rank = idx + 1;
              const totalQ = questions.length || 502;
              const pct = Math.round((user.solved / totalQ) * 100);
              const rankStyle = RANK_STYLES[rank] || null;

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`glass-panel p-4 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer hover:bg-zinc-800/40 active:scale-[0.99] border ${
                    rankStyle
                      ? rankStyle.cardBg
                      : isCurrent
                      ? 'bg-violet-500/8 border-violet-500/40 shadow-xl shadow-violet-500/10 ring-1 ring-violet-500/20'
                      : 'border-zinc-800/60'
                  }`}
                >
                  {/* Rank badge */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    rankStyle ? rankStyle.badgeBg : 'bg-zinc-800/80 border border-zinc-700/40 text-zinc-400'
                  }`}>
                    {rankStyle ? <rankStyle.icon className={`w-4 h-4 ${rankStyle.iconClass}`} /> : `#${rank}`}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm uppercase shrink-0 overflow-hidden shadow-sm border border-white/10"
                    style={{ backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1') }}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                    ) : (
                      user.display_name?.charAt(0) || '?'
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-zinc-100 truncate">{user.display_name}</span>
                        {rankStyle && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rankStyle.titleBadge}`}>
                            {rankStyle.titleText}
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xxs font-extrabold uppercase tracking-wider shrink-0 shadow-sm shadow-violet-500/30">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold font-mono text-zinc-100 shrink-0 ml-2">
                        {user.solved} <span className="text-zinc-500 font-normal text-xs">/ {totalQ}</span>
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden p-0.5 border border-zinc-800/60">
                      <div
                        className={`h-full transition-all duration-700 rounded-full ${
                          rankStyle ? rankStyle.barColor : 'bg-gradient-to-r from-violet-600 to-indigo-500'
                        }`}
                        style={{ width: `${Math.max(user.solved > 0 ? 2 : 0, pct)}%` }}
                      />
                    </div>

                    {/* Stats summary pills */}
                    <div className="flex items-center gap-3 pt-0.5">
                      <div className="flex items-center gap-1 text-xxs text-zinc-400">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>{user.streak}d streak</span>
                      </div>
                      <div className="flex items-center gap-1 text-xxs text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>+{user.solvedThisWeek} this week</span>
                      </div>
                      <div className="flex items-center gap-1 text-xxs text-violet-300 font-semibold bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20 font-mono">
                        <span>{user.unlockedCount} Badges</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Activity Feed */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl h-fit">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-400" />
              <h3 className="section-label text-zinc-200 font-semibold">Recent Activity</h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live stream" />
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-zinc-600 py-6 text-center">No recent activity.</p>
          ) : (
            <div className="space-y-2.5">
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
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/40 hover:bg-zinc-800/40 hover:border-zinc-700/60 transition-all cursor-pointer group"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs uppercase shrink-0 overflow-hidden shadow-sm"
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
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-violet-300 transition-colors truncate">
                        {act.userName}
                      </p>
                      <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                        {formatRelativeTime(act.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xxs text-zinc-400 mt-0.5 truncate">
                      Solved <span className="text-zinc-200 font-medium">{act.problemName}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
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

      {/* User profile details modal */}
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
