import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, Flame, Calendar, Activity, Crown, Award, X, Zap, 
  Sparkles, BookOpen, Workflow, BookmarkCheck, Layers, Network, 
  ExternalLink, CheckCircle2, Copy, Lightbulb, Eye, Search, RotateCcw, Circle, Filter, Medal, Star, Keyboard, TrendingUp,
  Brain, Users, ArrowRight, ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateUserAchievements } from '../lib/achievements';
import UserProfileModal, { SolveTags, DiffDot, formatRelativeTime } from '../components/UserProfileModal';
import { fetchAllUsersQuizBest, fetchRecentQuizAttempts } from '../lib/quizService';
import { getConnectedUserIds } from '../lib/followService';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp, slideInLeft, backdropVariants, modalVariants } from '../lib/animations';

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

// ── All Activities Modal ───────────────────────────────────────────────────────
const AllActivitiesModal = ({ activities, profiles, leaderboard, onSelectUser, onClose }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'dsa' | 'quiz'

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchesSearch = !search.trim() ||
        act.userName.toLowerCase().includes(search.toLowerCase()) ||
        (act.problemName || '').toLowerCase().includes(search.toLowerCase()) ||
        (act.topic || '').toLowerCase().includes(search.toLowerCase());

      const matchesType = filterType === 'all' || act.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [activities, search, filterType]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={backdropVariants}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md cursor-pointer font-sans"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        className="w-full max-w-2xl overflow-hidden flex flex-col h-[85vh] max-h-[750px] mx-auto relative cursor-default bg-[#09090b] rounded-xl border border-zinc-800 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 px-5 pt-4 pb-3.5 shrink-0 border-b border-zinc-800/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base leading-tight tracking-tight flex items-center gap-2">
                  All Platform Activities
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Real-time activity log across all racers.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search racer, problem, or topic..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 shrink-0">
              {[
                { id: 'all',  label: 'All' },
                { id: 'dsa',  label: 'DSA Solved' },
                { id: 'quiz', label: 'Java Quizzes' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    filterType === tab.id
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Body - Activity List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-1">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16 border border-zinc-800/80 rounded-xl bg-zinc-950/40">
              <Activity className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-mono">No activity found matching filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => {
                    const u = profiles.find(p => p.id === act.userId);
                    if (u) {
                      const leaderboardUser = leaderboard.find(lu => lu.id === u.id);
                      onSelectUser(leaderboardUser || { ...u, solved: 0, solvedThisWeek: 0, streak: 0 });
                      onClose();
                    }
                  }}
                  className="flex items-start gap-3 p-3 sm:p-3.5 hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs uppercase shrink-0 overflow-hidden border border-zinc-700 mt-0.5"
                    style={{ backgroundColor: act.avatarUrl ? 'transparent' : act.avatarColor }}
                  >
                    {act.avatarUrl ? (
                      <img src={act.avatarUrl} alt={act.userName} className="w-full h-full object-cover" />
                    ) : (
                      act.userName.charAt(0)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                        {act.userName}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {formatRelativeTime(act.updatedAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const u = profiles.find(p => p.id === act.userId);
                            if (u) {
                              const leaderboardUser = leaderboard.find(lu => lu.id === u.id);
                              onSelectUser(leaderboardUser || { ...u, solved: 0, solvedThisWeek: 0, streak: 0 });
                              onClose();
                            }
                          }}
                          className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 hover:text-white transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {act.type === 'quiz' ? (
                      <>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          Scored <span className="text-emerald-400 font-bold font-mono">{act.score}/{act.total}</span> ({act.percentage}%) on Java Quiz
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1 font-mono">
                            <Brain className="w-2.5 h-2.5" />
                            Java Quiz
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                          Solved <span className="text-zinc-100 font-medium">{act.problemName}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                            {act.topic}
                          </span>
                          <DiffDot difficulty={act.difficulty} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Podium Card (Top 3) ────────────────────────────────────────────────────────
const PodiumCard = ({ user, rank, questions, currentProfileId, onClick, timeframe = 'weekly' }) => {
  const totalQ = questions.length || 502;
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
    <motion.div 
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.15 } }}
      className={`flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer group ${c.order} flex-1 max-w-[85px] xs:max-w-[105px] sm:max-w-none`} 
      onClick={onClick}
    >
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

        <div className="text-center font-mono">
          {timeframe === 'weekly' ? (
            <>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-400">+{user.solvedThisWeek}</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-500 block leading-none">this week</span>
            </>
          ) : (
            <>
              <span className="text-xs sm:text-sm font-extrabold text-amber-400">{user.solved}</span>
              <span className="text-[9px] sm:text-[10px] text-zinc-600"> /{totalQ}</span>
            </>
          )}
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
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400" />
          <span>{user.unlockedCount}</span>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardPage = () => {
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();
  const { profile: currentProfile } = useAuth();
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'alltime'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);
  const [quizBests, setQuizBests] = useState({});
  const [recentQuizAttempts, setRecentQuizAttempts] = useState([]);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const bests = await fetchAllUsersQuizBest();
        setQuizBests(bests);
        const recents = await fetchRecentQuizAttempts();
        setRecentQuizAttempts(recents);
      } catch (err) {
        console.error("Error loading quiz data for leaderboard:", err);
      }
    };
    loadQuizData();
  }, []);

  const { profile } = useAuth();
  const [connectedIds, setConnectedIds] = useState([]);

  useEffect(() => {
    if (profile?.id) {
      getConnectedUserIds(profile.id).then(setConnectedIds);
    }
  }, [profile?.id]);

  // Only show mutual connections & self on leaderboard
  const approvedProfiles = useMemo(() => {
    if (!connectedIds.length) return profiles.filter(p => p.id === profile?.id);
    return profiles.filter(p => connectedIds.includes(p.id));
  }, [profiles, connectedIds, profile?.id]);

  const leaderboard = useMemo(() => {
    const sevenAgo = Date.now() - 7 * 86400000;
    const mapped = approvedProfiles.map(p => {
      const up = progress.filter(pr => pr.user_id === p.id);
      const solved = up.filter(pr => pr.status === 'done').length;
      const solvedThisWeek = up.filter(pr => pr.status === 'done' && new Date(pr.updated_at).getTime() >= sevenAgo).length;
      const streak = calculateUserStreak(p.id, progress);
      const { unlockedCount } = calculateUserAchievements(p.id, progress, questions);
      const quiz = quizBests[p.id] || null;
      return { ...p, solved, solvedThisWeek, streak, unlockedCount, quiz };
    });

    if (timeframe === 'weekly') {
      return mapped.sort((a, b) => b.solvedThisWeek !== a.solvedThisWeek ? b.solvedThisWeek - a.solvedThisWeek : b.solved - a.solved);
    }

    return mapped.sort((a, b) => b.solved !== a.solved ? b.solved - a.solved : b.streak - a.streak);
  }, [approvedProfiles, progress, questions, quizBests, timeframe]);

  const allActivities = useMemo(() => {
    const seen = new Set();
    const dsaList = [];
    const sorted = progress
      .filter(p => p.status === 'done')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    for (const p of sorted) {
      const key = `${p.user_id}-${p.question_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        const u = approvedProfiles.find(pr => pr.id === p.user_id);
        if (!u) continue;
        const q = questions.find(qn => qn.id === p.question_id);
        dsaList.push({
          id: p.id,
          userId: p.user_id,
          userName: u?.display_name || 'Racer',
          avatarColor: u?.avatar_color || '#6366f1',
          avatarUrl: u?.avatar_url || '',
          type: 'dsa',
          problemName: q?.problem_name || 'a problem',
          topic: q?.topic || 'DSA',
          difficulty: q?.difficulty || 1,
          updatedAt: p.updated_at,
        });
      }
    }

    const combined = [...dsaList, ...recentQuizAttempts];
    combined.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return combined;
  }, [progress, approvedProfiles, questions, recentQuizAttempts]);

  const recentActivities = useMemo(() => {
    return allActivities.slice(0, 7);
  }, [allActivities]);

  const top3 = leaderboard.slice(0, 3);
  const restList = leaderboard.slice(3);
  const totalQ = questions.length || 502;

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="space-y-6 pb-12 font-sans"
    >
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            CodeRace Leaderboard
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">Top racers ranked by DSA problem solving speed and consistency.</p>
        </div>

        {/* Timeframe Filter Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          {[
            { id: 'weekly',  label: 'This Week' },
            { id: 'alltime', label: 'All Time' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setTimeframe(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                timeframe === tab.id
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid: Leaderboard + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ── Left 2 Columns: Top 3 Podium + Leaderboard Table ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="glass-panel rounded-xl p-4 sm:p-6 border border-zinc-800/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    {timeframe === 'weekly' ? 'Weekly Champions' : 'All-Time Champions'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">Top 3 Racers</span>
              </div>

              {/* Podium row */}
              <div className="flex items-end justify-center gap-2 sm:gap-4 pt-2">
                {top3.map((u, i) => (
                  <PodiumCard
                    key={u.id}
                    user={u}
                    rank={i + 1}
                    questions={questions}
                    currentProfileId={currentProfile?.id}
                    onClick={() => setSelectedUser(u)}
                    timeframe={timeframe}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Full Leaderboard Table (Rank 4+) */}
          {restList.length > 0 && (
            <div className="glass-panel rounded-xl border border-zinc-800/80 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Racers Overview</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">{leaderboard.length} registered</span>
              </div>

              <motion.div 
                variants={staggerContainer}
                className="divide-y divide-zinc-800/60"
              >
                {restList.map((u, idx) => {
                  const rank = idx + 4;
                  const isCurrent = u.id === currentProfile?.id;
                  const pct = totalQ > 0 ? Math.round((u.solved / totalQ) * 100) : 0;

                  return (
                    <motion.div
                      key={u.id}
                      variants={fadeUp}
                      onClick={() => setSelectedUser(u)}
                      className={`flex items-center justify-between gap-3 p-3 sm:p-4 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-violet-500/[0.06] hover:bg-violet-500/[0.1] border-l-2 border-violet-500'
                          : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* Left: Rank + Avatar + Name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xs font-mono font-bold text-zinc-500 w-6 text-right shrink-0">
                          #{rank}
                        </span>

                        <div className="relative shrink-0">
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs uppercase overflow-hidden border border-zinc-700"
                            style={{ backgroundColor: u.avatar_url ? 'transparent' : (u.avatar_color || '#6366f1') }}
                          >
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" />
                            ) : (
                              u.display_name?.charAt(0) || '?'
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                              {u.display_name}
                            </span>
                            {u.username && (
                              <span className="text-[10px] font-mono text-amber-400 truncate">
                                @{u.username}
                              </span>
                            )}
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                            {u.streak > 0 && <span className="text-orange-400 font-bold mr-2">🔥 {u.streak}d streak</span>}
                            <span>{u.unlockedCount} badges</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Solved Metrics */}
                      <div className="flex items-center gap-4 shrink-0 font-mono text-right">
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-white">
                            {timeframe === 'weekly' ? (
                              <span className="text-emerald-400">+{u.solvedThisWeek}</span>
                            ) : (
                              <span>{u.solved}</span>
                            )}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            {timeframe === 'weekly' ? 'this wk' : `${pct}% done`}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>

        {/* ── Right Column: Activity Feed ── */}
        <div className="glass-panel rounded-xl border border-zinc-800/80 h-fit overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Recent Activity</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live stream" />
              {allActivities.length > 7 && (
                <button
                  onClick={() => setShowAllActivitiesModal(true)}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-zinc-600 py-8 text-center px-4 font-mono">No recent activity.</p>
          ) : (
            <>
              <div className="divide-y divide-zinc-800/40">
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
                    className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] uppercase shrink-0 overflow-hidden border border-zinc-700 mt-0.5"
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
                        <p className="text-xs font-semibold text-zinc-300 group-hover:text-amber-400 transition-colors truncate">
                          {act.userName}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] text-zinc-500 shrink-0 font-mono">
                            {formatRelativeTime(act.updatedAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const u = profiles.find(p => p.id === act.userId);
                              if (u) {
                                const leaderboardUser = leaderboard.find(lu => lu.id === u.id);
                                setSelectedUser(leaderboardUser || { ...u, solved: 0, solvedThisWeek: 0, streak: 0 });
                              }
                            }}
                            className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 hover:text-white transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {act.type === 'quiz' ? (
                        <>
                          <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                            Scored <span className="text-emerald-400 font-bold font-mono">{act.score}/{act.total}</span> ({act.percentage}%) on Java Quiz
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold flex items-center gap-1 font-mono">
                              <Brain className="w-2.5 h-2.5" />
                              Java Quiz
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                            Solved <span className="text-zinc-300 font-medium">{act.problemName}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
                              {act.topic}
                            </span>
                            <DiffDot difficulty={act.difficulty} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Show All Activities Button Footer */}
              {allActivities.length > 7 && (
                <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 text-center">
                  <button
                    onClick={() => setShowAllActivitiesModal(true)}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Activity className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Show All Activities ({allActivities.length})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </>
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

      {/* All Activities Modal */}
      {showAllActivitiesModal && (
        <AllActivitiesModal
          activities={allActivities}
          profiles={approvedProfiles}
          leaderboard={leaderboard}
          onSelectUser={(u) => setSelectedUser(u)}
          onClose={() => setShowAllActivitiesModal(false)}
        />
      )}
    </motion.div>
  );
};

export default LeaderboardPage;
