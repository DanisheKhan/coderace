import React, { useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  Activity, 
  User2, 
  Award,
  Crown,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const LeaderboardPage = () => {
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();
  const { profile: currentProfile } = useAuth();

  // Helper: Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays}d ago`;
  };

  // Helper: Calculate streak for a specific user ID
  const calculateUserStreak = (userId) => {
    const userDoneProgress = progress
      .filter(p => p.user_id === userId && p.status === 'done')
      .map(p => {
        const d = new Date(p.updated_at);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });

    if (userDoneProgress.length === 0) return 0;

    const uniqueDates = [...new Set(userDoneProgress)].sort((a, b) => b - a);

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const yesterdayMidnight = todayMidnight - 86400000;

    if (uniqueDates[0] !== todayMidnight && uniqueDates[0] !== yesterdayMidnight) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      if (uniqueDates[i] - uniqueDates[i+1] === 86400000) {
        streak++;
      } else if (uniqueDates[i] === uniqueDates[i+1]) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  // Process leaderboard ranking
  const leaderboard = useMemo(() => {
    const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;

    return profiles.map(p => {
      // Find progress rows for this user
      const userProg = progress.filter(pr => pr.user_id === p.id);
      const solved = userProg.filter(pr => pr.status === 'done').length;
      
      const solvedThisWeek = userProg.filter(pr => {
        return pr.status === 'done' && new Date(pr.updated_at).getTime() >= sevenDaysAgo;
      }).length;

      const streakVal = calculateUserStreak(p.id);

      return {
        ...p,
        solved,
        solvedThisWeek,
        streak: streakVal
      };
    }).sort((a, b) => {
      // Primary: total solved, Secondary: current streak
      if (b.solved !== a.solved) return b.solved - a.solved;
      return b.streak - a.streak;
    });
  }, [profiles, progress]);

  // Recent Activity Feed
  const recentActivities = useMemo(() => {
    // Filter progress updates with status = done, sort by updated_at descending
    return progress
      .filter(p => p.status === 'done')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 8) // show top 8
      .map(p => {
        const u = profiles.find(profile => profile.id === p.user_id);
        const q = questions.find(question => question.id === p.question_id);
        return {
          id: p.id,
          userName: u?.display_name || 'Racer',
          avatarColor: u?.avatar_color || '#6366f1',
          problemName: q?.problem_name || 'a problem',
          topic: q?.topic || '',
          updatedAt: p.updated_at
        };
      });
  }, [progress, profiles, questions]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-violet-500" />
          <span>Group Leaderboard</span>
        </h2>
        <p className="text-zinc-500 text-sm mt-1">Track the leaderboard standing. Live updates are pushed automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rankings column */}
        <div className="lg:col-span-2 space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900 rounded-2xl">
              <p className="text-zinc-500">No group members registered yet.</p>
            </div>
          ) : (
            leaderboard.map((user, idx) => {
              const isCurrent = user.id === currentProfile?.id;
              const rank = idx + 1;
              const totalQ = questions.length || 502;
              const pct = Math.round((user.solved / totalQ) * 100);

              // Rank color styling
              let rankStyle = 'bg-zinc-800 border-zinc-700 text-zinc-400';
              let rankIcon = null;

              if (rank === 1) {
                rankStyle = 'bg-amber-500/10 border-amber-500/30 text-amber-500';
                rankIcon = <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />;
              } else if (rank === 2) {
                rankStyle = 'bg-zinc-300/10 border-zinc-300/30 text-zinc-300';
                rankIcon = <Award className="w-5 h-5 text-zinc-300 fill-zinc-300" />;
              } else if (rank === 3) {
                rankStyle = 'bg-amber-700/10 border-amber-700/30 text-amber-700';
                rankIcon = <Award className="w-5 h-5 text-amber-700 fill-amber-700" />;
              }

              return (
                <div 
                  key={user.id}
                  className={`glass-panel p-5 rounded-2xl flex items-center gap-4 transition-all relative ${
                    isCurrent ? 'border-violet-500/40 bg-violet-600/5 ring-1 ring-violet-500/10' : ''
                  }`}
                >
                  {/* Rank badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shrink-0 ${rankStyle}`}>
                    {rankIcon ? rankIcon : rank}
                  </div>

                  {/* Avatar */}
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg uppercase shadow-md shrink-0"
                    style={{ backgroundColor: user.avatar_color || '#6366f1' }}
                  >
                    {user.display_name?.charAt(0) || '?'}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-zinc-100 truncate flex items-center gap-2">
                        <span>{user.display_name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xxs font-bold uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </h4>
                      <span className="text-sm font-bold text-zinc-100 shrink-0">
                        {user.solved} <span className="text-zinc-600 font-medium text-xs">/ {totalQ}</span>
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-violet-500 h-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>

                    {/* Stats details footer */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>{user.streak} day streak</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>+{user.solvedThisWeek} this week</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Live Activity Feed Column */}
        <div className="glass-panel p-5 rounded-2xl shadow-sm flex flex-col h-fit">
          <h3 className="text-base font-bold text-zinc-200 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-500" />
            <span>Recent Activity</span>
          </h3>
          
          {recentActivities.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No recent solve logs found.</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 text-sm">
                  {/* Avatar Color circle */}
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs uppercase shadow-sm shrink-0"
                    style={{ backgroundColor: act.avatarColor }}
                  >
                    {act.userName.charAt(0)}
                  </div>
                  
                  {/* Text details */}
                  <div className="min-w-0 flex-1 leading-snug">
                    <p className="text-xs font-semibold text-zinc-300 truncate">{act.userName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Solved <span className="text-violet-400 font-medium">{act.problemName}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xxs font-medium text-zinc-500">
                      <span>{act.topic}</span>
                      <span>•</span>
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
