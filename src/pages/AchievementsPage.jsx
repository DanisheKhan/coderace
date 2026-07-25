import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuestions } from '../contexts/QuestionsContext';
import { useProgressStore } from '../store/progressStore';
import { calculateUserAchievements } from '../lib/achievements';
import {
  Award, Zap, Flame, Trophy, Calendar, Activity,
  Code2, Layers, Sparkles, BookOpen, Workflow,
  BookmarkCheck, Lock, Network, CheckCircle2, ChevronRight
} from 'lucide-react';

const IconMap = {
  Award, Zap, Flame, Trophy, Calendar, Activity,
  Code2, Layers, Sparkles, BookOpen, Workflow,
  BookmarkCheck, Network
};

const AchievementsPage = () => {
  const { profile } = useAuth();
  const { questions } = useQuestions();
  const { progress } = useProgressStore();
  const [activeCategory, setActiveCategory] = useState('all');

  const { achievementsList, totalXP, unlockedCount, totalCount } = useMemo(() => {
    if (!profile) {
      return { achievementsList: [], totalXP: 0, unlockedCount: 0, totalCount: 0 };
    }
    return calculateUserAchievements(profile.id, progress, questions);
  }, [profile, progress, questions]);

  const categories = [
    { id: 'all', label: 'All Badges' },
    { id: 'solved', label: 'Solved' },
    { id: 'streak', label: 'Streaks' },
    { id: 'topic', label: 'Topics' },
    { id: 'quality', label: 'Quality' },
    { id: 'revisit', label: 'Revisit' }
  ];

  const filteredAchievements = useMemo(() => {
    if (activeCategory === 'all') return achievementsList;
    return achievementsList.filter(ach => ach.category === activeCategory);
  }, [achievementsList, activeCategory]);

  const formatUnlockDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const nextClosestAchievement = useMemo(() => {
    const locked = achievementsList.filter(ach => !ach.unlocked);
    if (locked.length === 0) return null;
    return locked.reduce((closest, current) => {
      const currentPct = current.maxProgress > 0 ? current.currentProgress / current.maxProgress : 0;
      const closestPct = closest.maxProgress > 0 ? closest.currentProgress / closest.maxProgress : 0;
      return currentPct > closestPct ? current : closest;
    }, locked[0]);
  }, [achievementsList]);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-zinc-500 text-sm">Please log in to view achievements.</p>
      </div>
    );
  }

  const completionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Achievements & Badges</h1>
        <p className="text-zinc-500 text-sm mt-1">Gamified milestones. Keep solving to rank up your profile and earn XP.</p>
      </div>

      {/* Overview Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total XP */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1.5">
            <p className="section-label">Racer Power Score</p>
            <h3 className="text-3xl font-bold tracking-tight leading-none text-zinc-100 flex items-center gap-2">
              ⭐ {totalXP}
              <span className="text-zinc-500 text-sm font-normal uppercase tracking-wider">XP</span>
            </h3>
            <p className="text-xxs text-violet-400 font-semibold flex items-center gap-1">
              Earned from completed badges
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Badges Progress */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-1.5 flex-1 pr-4">
            <p className="section-label">Badges Unlocked</p>
            <h3 className="text-3xl font-bold tracking-tight leading-none text-zinc-100">
              {unlockedCount} <span className="text-zinc-500 text-base font-normal">/ {totalCount}</span>
            </h3>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-400 font-medium mt-1">
              {completionPct}% of all achievements completed
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Next Badge Goal */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
          {nextClosestAchievement ? (
            <div className="space-y-1.5 flex-1 pr-4">
              <p className="section-label">Next Up</p>
              <h4 className="text-sm font-semibold text-zinc-200 truncate leading-snug">
                {nextClosestAchievement.title}
              </h4>
              <p className="text-xxs text-zinc-500 truncate leading-none">
                {nextClosestAchievement.description}
              </p>
              <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-violet-500 h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${(nextClosestAchievement.currentProgress / nextClosestAchievement.maxProgress) * 100}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-zinc-400 font-medium mt-1">
                Progress: {nextClosestAchievement.currentProgress} / {nextClosestAchievement.maxProgress}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 flex-1">
              <p className="section-label">Next Up</p>
              <h4 className="text-sm font-semibold text-zinc-200">All Achievements Unlocked!</h4>
              <p className="text-xxs text-zinc-500 mt-1">You are a DSA Grandmaster.</p>
            </div>
          )}
          <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/40 text-zinc-400 flex items-center justify-center shrink-0">
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Category Navigation / Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all select-none border ${
              activeCategory === cat.id
                ? 'bg-violet-500/10 text-violet-400 border-violet-500/35'
                : 'bg-zinc-900/40 text-zinc-500 border-[#1f1f23] hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAchievements.map(ach => {
          const Icon = IconMap[ach.icon] || Award;
          const pct = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 border ${
                ach.unlocked
                  ? `bg-gradient-to-br ${ach.color} shadow-lg shadow-black/30`
                  : 'bg-zinc-900/10 border-zinc-800/40 opacity-60'
              }`}
            >
              {/* Unlocked / Locked indicators */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    ach.unlocked
                      ? 'bg-white/10 border-white/10'
                      : 'bg-zinc-900/60 border-zinc-800/60 text-zinc-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    ach.unlocked
                      ? 'bg-white/10 text-zinc-200'
                      : 'bg-zinc-800/80 text-zinc-500'
                  }`}>
                    +{ach.points} XP
                  </span>
                  {ach.unlocked && (
                    <span className="text-[9px] text-zinc-400 mt-1 font-mono uppercase">
                      Unlocked
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-100 tracking-tight leading-snug">
                  {ach.title}
                </h4>
                <p className="text-xxs text-zinc-400 leading-normal line-clamp-2">
                  {ach.description}
                </p>
              </div>

              {/* Progress Footer */}
              <div className="mt-5 pt-3 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                  <span>Progress</span>
                  <span className="font-mono tabular-nums">
                    {ach.currentProgress} / {ach.maxProgress}
                  </span>
                </div>
                <div className="w-full bg-zinc-800/60 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked ? 'bg-zinc-100' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {ach.unlocked && ach.unlockedAt && (
                  <p className="text-[8px] text-zinc-500 font-mono text-right mt-1 select-none">
                    Unveiled: {formatUnlockDate(ach.unlockedAt)}
                  </p>
                )}
              </div>

              {/* Locked overlay lock icon */}
              {!ach.unlocked && (
                <div className="absolute top-2 right-2 p-1 text-zinc-700 bg-zinc-950/20 rounded-md">
                  <Lock className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPage;
