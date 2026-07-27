import React, { useState, useMemo, useEffect } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, Flame, Calendar, Activity, Crown, Award, X, Zap, 
  Sparkles, BookOpen, Workflow, BookmarkCheck, Layers, Network, 
  ExternalLink, CheckCircle2, Copy, Lightbulb, Eye, Search, RotateCcw, Circle, Filter, Medal, Star, Keyboard, TrendingUp,
  Brain
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateUserAchievements } from '../lib/achievements';
import UserProfileModal, { SolveTags, DiffDot, formatRelativeTime } from '../components/UserProfileModal';
import { fetchAllUsersQuizBest, fetchRecentQuizAttempts } from '../lib/quizService';

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
        {user.quiz && (
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-zinc-400 font-extrabold z-10" title={`Best Quiz Score: ${user.quiz.score}/${user.quiz.total} (${user.quiz.attempts_count} attempts)`}>
            <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-400 shrink-0" />
            <span>{Math.round(user.quiz.percentage)}%</span>
          </div>
        )}
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

  // Only show approved users
  const approvedProfiles = useMemo(() => {
    return profiles.filter(p => p.approved || p.is_admin);
  }, [profiles]);

  const leaderboard = useMemo(() => {
    const sevenAgo = Date.now() - 7 * 86400000;
    return approvedProfiles.map(p => {
      const up = progress.filter(pr => pr.user_id === p.id);
      const solved = up.filter(pr => pr.status === 'done').length;
      const solvedThisWeek = up.filter(pr => pr.status === 'done' && new Date(pr.updated_at).getTime() >= sevenAgo).length;
      const streak = calculateUserStreak(p.id, progress);
      const { unlockedCount } = calculateUserAchievements(p.id, progress, questions);
      const quiz = quizBests[p.id] || null;
      return { ...p, solved, solvedThisWeek, streak, unlockedCount, quiz };
    }).sort((a, b) => b.solved !== a.solved ? b.solved - a.solved : b.streak - a.streak);
  }, [approvedProfiles, progress, questions, quizBests]);

  const recentActivities = useMemo(() => {
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
        if (!u) continue; // Skip activities of unapproved users
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

    // Combine with quiz attempts
    const combined = [...dsaList, ...recentQuizAttempts];
    combined.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return combined.slice(0, 10);
  }, [progress, approvedProfiles, questions, recentQuizAttempts]);

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
                        {user.quiz && (
                          <div 
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-violet-600/10 border border-violet-500/15 text-[10px] text-violet-400 font-bold font-mono"
                            title={`Best quiz score: ${user.quiz.score}/${user.quiz.total} (${user.quiz.attempts_count} attempts)`}
                          >
                            <Brain className="w-3 h-3 text-violet-400" />
                            <span>{Math.round(user.quiz.percentage)}%</span>
                          </div>
                        )}
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-zinc-200">{user.solved}</span>
                          <span className="text-[10px] text-zinc-700 font-mono"> /{totalQ}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-violet-600/25 border border-white/[0.04] hover:border-violet-500/30 text-zinc-400 hover:text-violet-400 transition-all flex items-center justify-center cursor-pointer shrink-0 touch-target"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
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
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] text-zinc-700 shrink-0 font-mono">
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
                          className="p-1 rounded-md bg-white/[0.02] hover:bg-violet-600/20 border border-white/[0.04] hover:border-violet-500/20 text-zinc-500 hover:text-violet-400 transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {act.type === 'quiz' ? (
                      <>
                        <p className="text-[10px] text-zinc-600 mt-0.5 truncate">
                          Scored <span className="text-emerald-400 font-bold font-mono">{act.score}/{act.total}</span> ({act.percentage}%) on Java Quiz
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-600/10 text-violet-400 border border-violet-500/15 font-semibold flex items-center gap-1">
                            <Brain className="w-2.5 h-2.5" />
                            Java Quiz
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] text-zinc-600 mt-0.5 truncate">
                          Solved <span className="text-zinc-400 font-medium">{act.problemName}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-600 border border-white/[0.04] font-medium">
                            {act.topic}
                          </span>
                          <DiffDot d={act.difficulty} />
                        </div>
                      </>
                    )}
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
