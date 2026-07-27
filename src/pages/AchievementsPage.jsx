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
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp, cardHover } from '../lib/animations';

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

  const { achievementsList, unlockedCount, totalCount } = useMemo(() => {
    if (!profile) {
      return { achievementsList: [], unlockedCount: 0, totalCount: 0 };
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
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="space-y-6 pb-12 font-sans transform-gpu"
    >
      {/* Page Header */}
      <div className="pb-4 border-b border-zinc-800/80">
        <h1 className="text-lg font-bold tracking-tight text-white">Achievements & Badges</h1>
        <p className="text-zinc-500 text-xs mt-0.5">Track your problem-solving milestones and badges.</p>
      </div>

      {/* Overview Dashboard Cards */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Total Milestones */}
        <motion.div variants={fadeUp} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Total Milestones</p>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {totalCount}
              <span className="text-zinc-500 text-xs font-normal">Badges</span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium">Available to unlock</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Badges Progress */}
        <motion.div variants={fadeUp} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="space-y-1 flex-1 pr-3">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Badges Unlocked</p>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {unlockedCount} <span className="text-zinc-500 text-xs font-normal">/ {totalCount}</span>
            </h3>
            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2 border border-zinc-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500 font-medium mt-1">
              {completionPct}% of all achievements completed
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Next Badge Goal */}
        <motion.div variants={fadeUp} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between sm:col-span-2 md:col-span-1">
          {nextClosestAchievement ? (
            <div className="space-y-1 flex-1 pr-3 min-w-0">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Next Up</p>
              <h4 className="text-xs font-semibold text-zinc-200 truncate leading-snug">
                {nextClosestAchievement.title}
              </h4>
              <p className="text-[10px] text-zinc-500 truncate leading-none">
                {nextClosestAchievement.description}
              </p>
              <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-2 border border-zinc-800">
                <div
                  className="bg-violet-500 h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${(nextClosestAchievement.currentProgress / nextClosestAchievement.maxProgress) * 100}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">
                Progress: {nextClosestAchievement.currentProgress} / {nextClosestAchievement.maxProgress}
              </p>
            </div>
          ) : (
            <div className="text-xs text-zinc-500">All achievements unlocked!</div>
          )}
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-violet-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
        </motion.div>
      </motion.div>

      {/* Category Tabs with Animated Pill */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 relative">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap select-none ${
                isActive
                  ? 'text-zinc-900 font-semibold'
                  : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="categoryActivePill"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute inset-0 bg-white rounded-lg -z-0"
                />
              )}
              <span className="relative z-10">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {filteredAchievements.map(ach => {
          const Icon = IconMap[ach.icon] || Award;
          const pct = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100));

          return (
            <motion.div
              key={ach.id}
              variants={fadeUp}
              whileHover={cardHover}
              whileTap={{ scale: 0.98 }}
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
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    ach.unlocked
                      ? 'bg-white/10 text-zinc-200'
                      : 'bg-zinc-800/80 text-zinc-500'
                  }`}>
                    {ach.category}
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
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default AchievementsPage;
