import React, { useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Flame, Calendar, Activity, Crown, Award } from 'lucide-react';

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

const RANK_STYLES = [
  { bg: 'bg-amber-500/8 border-amber-500/20 text-amber-400', icon: Crown, iconClass: 'text-amber-400 fill-amber-400' },
  { bg: 'bg-zinc-300/8 border-zinc-400/20 text-zinc-300',   icon: Award, iconClass: 'text-zinc-300 fill-zinc-300' },
  { bg: 'bg-amber-700/8 border-amber-700/20 text-amber-600', icon: Award, iconClass: 'text-amber-600 fill-amber-600' },
];

const LeaderboardPage = () => {
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();
  const { profile: currentProfile } = useAuth();

  const leaderboard = useMemo(() => {
    const sevenAgo = Date.now() - 7 * 86400000;
    return profiles.map(p => {
      const up = progress.filter(pr => pr.user_id === p.id);
      const solved = up.filter(pr => pr.status === 'done').length;
      const solvedThisWeek = up.filter(pr => pr.status === 'done' && new Date(pr.updated_at).getTime() >= sevenAgo).length;
      const streak = calculateUserStreak(p.id, progress);
      return { ...p, solved, solvedThisWeek, streak };
    }).sort((a, b) => b.solved !== a.solved ? b.solved - a.solved : b.streak - a.streak);
  }, [profiles, progress]);

  const recentActivities = useMemo(() => {
    return progress
      .filter(p => p.status === 'done')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 8)
      .map(p => {
        const u = profiles.find(pr => pr.id === p.user_id);
        const q = questions.find(qn => qn.id === p.question_id);
        return {
          id: p.id,
          userName: u?.display_name || 'Racer',
          avatarColor: u?.avatar_color || '#6366f1',
          problemName: q?.problem_name || 'a problem',
          topic: q?.topic || '',
          updatedAt: p.updated_at,
        };
      });
  }, [progress, profiles, questions]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Leaderboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Live rankings — updates pushed automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rankings */}
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
              const rankStyle = RANK_STYLES[idx] || null;

              return (
                <div
                  key={user.id}
                  className={`glass-panel p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    isCurrent ? 'border-violet-500/25 ring-1 ring-violet-500/10' : ''
                  }`}
                >
                  {/* Rank badge */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${
                    rankStyle ? rankStyle.bg : 'bg-zinc-800/60 border-zinc-700/40 text-zinc-500'
                  }`}>
                    {rankStyle ? <rankStyle.icon className={`w-4 h-4 ${rankStyle.iconClass}`} /> : rank}
                  </div>

                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm uppercase shrink-0"
                    style={{ backgroundColor: user.avatar_color || '#6366f1' }}
                  >
                    {user.display_name?.charAt(0) || '?'}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-zinc-100 truncate">{user.display_name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xxs font-bold uppercase tracking-wider shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-zinc-100 shrink-0 ml-2">
                        {user.solved} <span className="text-zinc-600 font-normal text-xs">/ {totalQ}</span>
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden">
                      <div className="bg-violet-500 h-full transition-all duration-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xxs text-zinc-500">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>{user.streak}d streak</span>
                      </div>
                      <div className="flex items-center gap-1 text-xxs text-zinc-500">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span>+{user.solvedThisWeek} this week</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Activity Feed */}
        <div className="glass-panel p-5 rounded-2xl h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-violet-400" />
            <p className="section-label">Recent Activity</p>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-zinc-600 py-4 text-center">No recent activity.</p>
          ) : (
            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs uppercase shrink-0"
                    style={{ backgroundColor: act.avatarColor }}
                  >
                    {act.userName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-300 truncate">{act.userName}</p>
                    <p className="text-xxs text-zinc-500 mt-0.5 truncate">
                      Solved <span className="text-violet-400">{act.problemName}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xxs text-zinc-600">
                      <span>{act.topic}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(act.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
