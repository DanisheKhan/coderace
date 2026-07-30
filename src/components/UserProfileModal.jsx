import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Flame, Calendar, Activity, Crown, Award, X, Zap, 
  Sparkles, BookOpen, Workflow, BookmarkCheck, Layers, Network, 
  ExternalLink, CheckCircle2, Copy, Lightbulb, Eye, Search, Keyboard, TrendingUp, RefreshCw,
  Brain, Target, Star, ChevronRight, BarChart2, Clock, Circle, ChevronDown, ChevronUp,
  Lock, UserPlus, UserCheck, UserX, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { calculateUserAchievements } from '../lib/achievements';
import { getTypingProfile, fetchMonkeytypeData, syncTypingProfileToSupabase } from '../lib/monkeytypeService';
import { fetchUserAttempts } from '../lib/quizService';
import { getFollowStatus, sendFollowRequest, cancelFollowRequest, getFollowCounts } from '../lib/followService';
import FollowersModal from './FollowersModal';
import GitHubStreakTracker from './GitHubStreakTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants } from '../lib/animations';

const IconMap = {
  Award, Zap, Flame, Trophy, Calendar, Activity,
  Layers, Sparkles, BookOpen, Workflow,
  BookmarkCheck, Network
};

const tooltipStyle = {
  backgroundColor: '#0d0d0f',
  borderColor: 'rgba(255,255,255,0.07)',
  borderRadius: '10px',
  color: '#e4e4e7',
  fontSize: '11px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
};

// ── Solve Method & Approach Tags Component ─────────────────────────────────────
export const SolveTags = ({ prog }) => {
  if (!prog) return null;
  const { solve_method, brute_force, approach, optimized, revisit_count } = prog;

  const methodMap = {
    gpt:      { label: 'AI / GPT',    icon: Sparkles,  color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/25' },
    copy:     { label: 'Copy-Paste', icon: Copy,      color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/25' },
    hint:     { label: 'Hint Used',  icon: Lightbulb, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/25' },
    solution: { label: 'Ans Seen',   icon: Eye,       color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/25' },
  };

  const method = methodMap[solve_method];

  const isOpt = optimized || approach;
  const isBrute = brute_force;
  let approachBadge = null;
  if (isBrute && isOpt) {
    approachBadge = { label: 'Both', color: 'text-violet-300', bg: 'bg-violet-500/10 border-violet-500/25' };
  } else if (isOpt) {
    approachBadge = { label: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' };
  } else if (isBrute) {
    approachBadge = { label: 'Brute', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' };
  }

  if (!method && !approachBadge && (!revisit_count || revisit_count <= 0)) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {method && (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${method.bg} ${method.color}`}>
          <method.icon className="w-2.5 h-2.5" />
          <span>{method.label}</span>
        </span>
      )}
      {approachBadge && (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${approachBadge.bg} ${approachBadge.color}`}>
          {approachBadge.label}
        </span>
      )}
      {revisit_count > 0 && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <span>🔄</span>
          <span>{revisit_count}x</span>
        </span>
      )}
    </div>
  );
};

export const getDifficultyLabel = (difficulty) => {
  if (typeof difficulty === 'string') {
    const lower = difficulty.toLowerCase();
    if (lower === 'easy') return 'Easy';
    if (lower === 'medium') return 'Medium';
    if (lower === 'hard') return 'Hard';
  }
  const num = parseInt(difficulty, 10);
  if (isNaN(num)) return 'Easy';
  if (num <= 2) return 'Easy';
  if (num === 3) return 'Medium';
  if (num >= 4) return 'Hard';
  return 'Easy';
};

export const DiffDot = ({ difficulty }) => {
  const colors = {
    Easy: 'bg-emerald-400',
    Medium: 'bg-amber-400',
    Hard: 'bg-red-400',
  };
  const label = getDifficultyLabel(difficulty);
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[label] || 'bg-zinc-500'}`} />;
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function UserProfileModal({ user, progress, questions, onClose }) {
  // 1. Overview is default active tab
  const [activeModalTab, setActiveModalTab] = useState('overview');
  const [solvedSearch, setSolvedSearch] = useState('');
  const [solvedDiffFilter, setSolvedDiffFilter] = useState('all');
  
  // DSA Sheet Tab States
  const [sheetSearch, setSheetSearch] = useState('');
  const [sheetStatusFilter, setSheetStatusFilter] = useState('all'); // 'all' | 'done' | 'attempted' | 'not_started'
  const [sheetDiffFilter, setSheetDiffFilter] = useState('all'); // 'all' | 'Easy' | 'Medium' | 'Hard'
  const [sheetTopicFilter, setSheetTopicFilter] = useState('all');
  
  // Topics are collapsed/closed by default
  const [expandedTopics, setExpandedTopics] = useState({});

  const [typingProfile, setTypingProfile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const { user: authUser } = useAuth();
  const currentUserId = authUser?.id;
  const isOwnProfile = currentUserId === user?.id;
  const navigate = useNavigate();

  const [followStatus, setFollowStatus] = useState(isOwnProfile ? 'self' : 'loading');
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState('followers');

  useEffect(() => {
    if (user?.id) {
      getFollowCounts(user.id).then(counts => {
        setFollowersCount(counts.followersCount);
        setFollowingCount(counts.followingCount);
      });

      if (!isOwnProfile && currentUserId) {
        setFollowLoading(true);
        getFollowStatus(currentUserId, user.id).then(status => {
          setFollowStatus(status);
          setFollowLoading(false);
        });
      } else if (isOwnProfile) {
        setFollowStatus('self');
      }
    }
  }, [user?.id, currentUserId, isOwnProfile]);

  const handleFollowClick = async () => {
    if (!currentUserId || !user?.id || followLoading) return;
    setFollowLoading(true);

    if (followStatus === 'none') {
      const { error } = await sendFollowRequest(currentUserId, user.id);
      if (!error) setFollowStatus('pending');
    } else if (followStatus === 'pending' || followStatus === 'accepted') {
      const { error } = await cancelFollowRequest(currentUserId, user.id);
      if (!error) {
        setFollowStatus('none');
        if (followStatus === 'accepted') {
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
      }
    }
    setFollowLoading(false);
  };

  const handleQuestionClick = (problemName) => {
    if (onClose) onClose();
    navigate(`/sheet?search=${encodeURIComponent(problemName)}`);
  };

  const handleCopyId = (e) => {
    e.stopPropagation();
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const toggleTopicExpand = (topicName) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicName]: !prev[topicName]
    }));
  };

  const userProgress = useMemo(() => {
    return progress.filter(p => p.user_id === user?.id);
  }, [progress, user?.id]);

  const accentColor = user?.avatar_color || '#6366f1';

  const handleSync = async () => {
    if (!user?.id) return;
    setSyncing(true);
    setSyncError('');
    try {
      if (user.monkeytype_ape_key) {
        const liveStats = await fetchMonkeytypeData(user.monkeytype_ape_key);
        const updated = await syncTypingProfileToSupabase(user.id, liveStats);
        setTypingProfile(updated);
      } else {
        const updated = await getTypingProfile(user.id);
        if (updated) setTypingProfile(updated);
      }
    } catch (err) {
      setSyncError(err.message || 'Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getTypingProfile(user.id).then(setTypingProfile);
    }
  }, [user?.id]);

  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoadingAttempts(true);
      fetchUserAttempts(user.id)
        .then(res => setQuizAttempts(res?.data || (Array.isArray(res) ? res : [])))
        .catch(() => setQuizAttempts([]))
        .finally(() => setLoadingAttempts(false));
    }
  }, [user?.id]);

  const stats = useMemo(() => {
    const totalQ = questions.length;
    const solved = userProgress.filter(p => p.status === 'done').length;

    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const solvedThisWeek = userProgress.filter(
      p => p.status === 'done' && new Date(p.updated_at).getTime() >= sevenDaysAgo
    ).length;

    const doneDates = userProgress
      .filter(p => p.status === 'done')
      .map(p => {
        const d = new Date(p.updated_at);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });

    let streak = 0;
    if (doneDates.length) {
      const unique = [...new Set(doneDates)].sort((a, b) => b - a);
      const today = new Date();
      const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const yesterdayMs = todayMs - 86400000;
      if (unique[0] === todayMs || unique[0] === yesterdayMs) {
        streak = 1;
        for (let i = 0; i < unique.length - 1; i++) {
          if (unique[i] - unique[i + 1] === 86400000) streak++;
          else if (unique[i] === unique[i + 1]) continue;
          else break;
        }
      }
    }

    const { unlockedCount, achievementsList } = calculateUserAchievements(user?.id, progress, questions);
    const achievements = achievementsList || [];

    return { totalQ, solved, solvedThisWeek, streak, unlockedCount, achievements };
  }, [userProgress, questions, user?.id, progress]);

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
      const completed = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
      return { name, completed, solved: d.solved, total: d.total };
    });
  }, [questions, userProgress]);

  const allTopicsList = useMemo(() => {
    const set = new Set(questions.map(q => q.topic).filter(Boolean));
    return Array.from(set);
  }, [questions]);

  // Grouped DSA Sheet Data for Sheet Tab
  const groupedSheetData = useMemo(() => {
    const map = {};
    questions.forEach(q => {
      const topicName = q.topic || 'General';
      if (!map[topicName]) {
        map[topicName] = { topic: topicName, total: 0, solved: 0, attempted: 0, questions: [] };
      }
      const prog = userProgress.find(p => p.question_id === q.id);
      const status = prog?.status || 'not_started';
      if (status === 'done') map[topicName].solved++;
      if (status === 'attempted') map[topicName].attempted++;
      map[topicName].total++;
      map[topicName].questions.push({ ...q, prog, status });
    });

    return Object.values(map).map(group => {
      const filtered = group.questions.filter(item => {
        const matchesSearch = !sheetSearch.trim() ||
          item.problem_name.toLowerCase().includes(sheetSearch.toLowerCase()) ||
          (item.subtopic || '').toLowerCase().includes(sheetSearch.toLowerCase());

        const matchesStatus = sheetStatusFilter === 'all' || item.status === sheetStatusFilter;
        const matchesDiff = sheetDiffFilter === 'all' || getDifficultyLabel(item.difficulty) === sheetDiffFilter;

        return matchesSearch && matchesStatus && matchesDiff;
      });

      return {
        ...group,
        filteredQuestions: filtered
      };
    }).filter(group => {
      const matchesTopic = sheetTopicFilter === 'all' || group.topic === sheetTopicFilter;
      return matchesTopic && (group.filteredQuestions.length > 0 || !sheetSearch);
    });
  }, [questions, userProgress, sheetSearch, sheetStatusFilter, sheetDiffFilter, sheetTopicFilter]);

  const recentlySolved = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'done')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 6)
      .map(p => {
        const q = questions.find(qi => qi.id === p.question_id);
        return q ? { ...q, solvedAt: p.updated_at, prog: p } : null;
      })
      .filter(Boolean);
  }, [userProgress, questions]);

  const allSolvedList = useMemo(() => {
    return userProgress
      .filter(p => p.status === 'done')
      .map(p => {
        const q = questions.find(qi => qi.id === p.question_id);
        return q ? { ...q, solvedAt: p.updated_at, prog: p } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt));
  }, [userProgress, questions]);

  const filteredSolvedList = useMemo(() => {
    return allSolvedList.filter(item => {
      const matchesSearch = !solvedSearch.trim() ||
        item.problem_name.toLowerCase().includes(solvedSearch.toLowerCase()) ||
        item.topic.toLowerCase().includes(solvedSearch.toLowerCase()) ||
        (item.subtopic || '').toLowerCase().includes(solvedSearch.toLowerCase());

      const matchesDiff = solvedDiffFilter === 'all' || getDifficultyLabel(item.difficulty) === solvedDiffFilter;

      return matchesSearch && matchesDiff;
    });
  }, [allSolvedList, solvedSearch, solvedDiffFilter]);

  const pct = questions.length > 0 ? Math.round((stats.solved / questions.length) * 100) : 0;

  // ── Monkeytype Speed Helpers ──
  const topWPM = Math.max(
    typingProfile?.wpm_15 || 0,
    typingProfile?.wpm_30 || 0,
    typingProfile?.wpm_60 || 0,
    typingProfile?.wpm_120 || 0
  );

  const completionRate = typingProfile?.tests_started > 0
    ? Math.round((typingProfile.tests_completed / typingProfile.tests_started) * 100)
    : 0;

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const speedModes = [
    { label: '15s', wpm: typingProfile?.wpm_15, acc: typingProfile?.acc_15, consistency: typingProfile?.consistency_15 },
    { label: '30s', wpm: typingProfile?.wpm_30, acc: typingProfile?.acc_30, consistency: typingProfile?.consistency_30 },
    { label: '60s', wpm: typingProfile?.wpm_60, acc: typingProfile?.acc_60, consistency: typingProfile?.consistency_60 },
    { label: '120s', wpm: typingProfile?.wpm_120, acc: typingProfile?.acc_120, consistency: typingProfile?.consistency_120 },
  ];

  // Tab order requested: Overview -> Solved -> DSA Sheet -> Speed -> Quiz
  const TABS = [
    { id: 'overview', label: 'Overview',                                           icon: BarChart2 },
    { id: 'solved',   label: `Solved (${allSolvedList.length})`,                   icon: CheckCircle2 },
    { id: 'sheet',    label: `DSA Sheet (${stats.solved}/${questions.length})`,     icon: BookOpen },
    { id: 'speed',    label: `Speed${topWPM > 0 ? ` · ${topWPM}` : ''}`,            icon: Keyboard },
    { id: 'quiz',     label: `Quiz${quizAttempts.length > 0 ? ` (${quizAttempts.length})` : ''}`, icon: Brain },
  ];

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
        className="w-full max-w-4xl overflow-hidden flex flex-col h-[92vh] max-h-[840px] mx-auto relative cursor-default bg-[#09090b] rounded-xl border border-zinc-800 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 px-4 sm:px-6 pt-4 pb-3.5 shrink-0 border-b border-zinc-800/80">
          {/* Top Row: Avatar + Name + User ID + Fixed Close Button */}
          <div className="flex items-start justify-between gap-2 w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm uppercase overflow-hidden border border-zinc-700"
                  style={{
                    backgroundColor: user?.avatar_url ? 'transparent' : accentColor,
                  }}
                >
                  {user?.avatar_url
                    ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                    : user?.display_name?.charAt(0) || '?'
                  }
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#09090b]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="font-bold text-white text-sm sm:text-base leading-tight tracking-tight truncate">
                    {user?.display_name}
                  </h3>
                  {user?.username && (
                    <span className="text-xs font-mono text-amber-400 font-semibold truncate">
                      @{user.username}
                    </span>
                  )}
                  <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 shrink-0">
                    {user?.is_admin ? 'ADMIN' : 'RACER'}
                  </span>
                </div>
                
                {/* User ID Pill & Follower Counts */}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <button
                    onClick={handleCopyId}
                    className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-900/90 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1.5 cursor-pointer transition-colors max-w-full group"
                    title="Click to copy User ID"
                  >
                    <span className="text-zinc-500 font-bold shrink-0">ID:</span>
                    <span className="text-zinc-300 font-semibold truncate max-w-[130px] xs:max-w-[190px] sm:max-w-none">{user?.id}</span>
                    {copiedId ? (
                      <span className="text-emerald-400 font-bold text-[9px] flex items-center gap-0.5 shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Copied!
                      </span>
                    ) : (
                      <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                    )}
                  </button>

                  {/* Followers / Following Counts */}
                  <div className="flex items-center gap-2.5 text-[11px] font-mono">
                    <button
                      onClick={() => {
                        setFollowersModalTab('followers');
                        setIsFollowersModalOpen(true);
                      }}
                      className="hover:text-indigo-400 text-zinc-400 transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-white">{followersCount}</span> followers
                    </button>
                    <span className="text-zinc-700">•</span>
                    <button
                      onClick={() => {
                        setFollowersModalTab('following');
                        setIsFollowersModalOpen(true);
                      }}
                      className="hover:text-indigo-400 text-zinc-400 transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-white">{followingCount}</span> following
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Right Action Buttons (Follow + Sync + Close) */}
            <div className="flex items-center gap-2 shrink-0">
              {!isOwnProfile && followStatus !== 'self' && (
                <button
                  onClick={handleFollowClick}
                  disabled={followLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50 ${
                    followStatus === 'accepted'
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      : followStatus === 'pending'
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {followStatus === 'accepted' ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Following
                    </>
                  ) : followStatus === 'pending' ? (
                    <>
                      <Clock className="w-3.5 h-3.5" /> Requested
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" /> Follow
                    </>
                  )}
                </button>
              )}
              {isOwnProfile && (
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1 text-xs cursor-pointer disabled:opacity-50"
                  title="Sync Monkeytype stats"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-violet-400' : ''}`} />
                  <span className="hidden sm:inline">Sync</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Second Row: Navigation Tabs (Only shown if own profile or accepted follower) */}
          {(isOwnProfile || followStatus === 'accepted') && (
            <div className="w-full overflow-x-auto custom-scrollbar">
              <div className="grid grid-cols-5 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full min-w-[500px] sm:min-w-0">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const active = activeModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModalTab(tab.id)}
                      className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors cursor-pointer select-none truncate ${
                        active
                          ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── MODAL BODY CONTENT / PRIVACY LOCK SCREEN ──────────────────────── */}
        {(!isOwnProfile && followStatus !== 'accepted') ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1.5">This Profile is Private</h4>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-6">
              Send a follow request to @{user?.username || user?.display_name} to view their problem solving stats, DSA progress sheet, typing speed, and achievements.
            </p>

            {followStatus === 'none' && (
              <button
                onClick={handleFollowClick}
                disabled={followLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Send Follow Request
              </button>
            )}
            {followStatus === 'pending' && (
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" /> Request Sent (Pending Approval)
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

          {/* TAB 1: OVERVIEW */}
          {activeModalTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Solved</p>
                    <p className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{stats.solved}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{pct}% done</p>
                  </div>
                  <Trophy className="w-5 h-5 text-amber-400 opacity-80" />
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Streak</p>
                    <p className="text-lg sm:text-xl font-bold text-orange-400 font-mono mt-0.5">{stats.streak}d</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{stats.solvedThisWeek} this wk</p>
                  </div>
                  <Flame className="w-5 h-5 text-orange-400 opacity-80" />
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Badges</p>
                    <p className="text-lg sm:text-xl font-bold text-violet-400 font-mono mt-0.5">{stats.unlockedCount}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">unlocked</p>
                  </div>
                  <Crown className="w-5 h-5 text-violet-400 opacity-80" />
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Typing WPM</p>
                    <p className="text-lg sm:text-xl font-bold text-emerald-400 font-mono mt-0.5">{topWPM || '—'}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">peak speed</p>
                  </div>
                  <Keyboard className="w-5 h-5 text-emerald-400 opacity-80" />
                </div>
              </div>

              {/* GitHub Streak Heatmap */}
              <GitHubStreakTracker user={user} userId={user?.id} progress={progress} />

              {/* Topic Breakdown Progress Bars */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Topic Proficiency</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topicData.map(topic => (
                    <div key={topic.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-300 truncate">{topic.name}</span>
                        <span className="text-zinc-500">{topic.solved}/{topic.total} ({topic.completed}%)</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/80">
                        <div
                          className="bg-violet-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${topic.completed}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              {recentlySolved.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Recently Solved</h4>
                  <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/40">
                    {recentlySolved.map(item => (
                      <div key={item.id} className="p-3 flex items-center justify-between hover:bg-zinc-900/40 transition-colors gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <button
                              type="button"
                              onClick={() => handleQuestionClick(item.problem_name)}
                              className="text-xs font-semibold text-zinc-200 hover:text-amber-400 transition-colors truncate text-left cursor-pointer"
                            >
                              {item.problem_name}
                            </button>
                            <DiffDot difficulty={item.difficulty} />
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono truncate">
                            {item.topic} · {item.subtopic || 'General'}
                          </p>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                          {formatRelativeTime(item.solvedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SOLVED PROBLEMS */}
          {activeModalTab === 'solved' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={solvedSearch}
                    onChange={e => setSolvedSearch(e.target.value)}
                    placeholder="Filter solved problems…"
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  {['all', 'Easy', 'Medium', 'Hard'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSolvedDiffFilter(diff)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono capitalize transition-colors cursor-pointer ${
                        solvedDiffFilter === diff
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {filteredSolvedList.length === 0 ? (
                <div className="text-center py-12 border border-zinc-800 rounded-xl bg-zinc-950/40">
                  <CheckCircle2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 font-mono">No solved problems match criteria.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
                  {filteredSolvedList.map((item, idx) => (
                    <div key={item.id} className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-zinc-600 w-6 shrink-0 text-right">#{idx + 1}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <button
                              type="button"
                              onClick={() => handleQuestionClick(item.problem_name)}
                              className="text-xs font-semibold text-zinc-100 hover:text-amber-400 transition-colors truncate text-left cursor-pointer"
                            >
                              {item.problem_name}
                            </button>
                            <DiffDot difficulty={item.difficulty} />
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-zinc-500">{item.topic}</span>
                            <SolveTags prog={item.prog} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {formatRelativeTime(item.solvedAt)}
                        </span>
                        {(item.link || item.leetcode_link) && (
                          <a
                            href={item.link || item.leetcode_link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            title="Open question"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DSA SHEET */}
          {activeModalTab === 'sheet' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Minimal Summary Progress Header */}
              <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                      DSA Master Sheet Progress
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      {user?.display_name}'s problem solving progress across all DSA categories.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold font-mono text-white">{stats.solved}</span>
                    <span className="text-xs font-mono text-zinc-500">/ {questions.length} Solved ({pct}%)</span>
                  </div>
                </div>

                {/* Minimal Overall Progress Bar */}
                <div className="w-full bg-[#121215] h-1.5 rounded-full overflow-hidden border border-zinc-800/80">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Minimal Filter Controls Bar */}
              <div className="bg-[#0e0e11] border border-zinc-800/80 rounded-xl p-3 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3 shadow-sm">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={sheetSearch}
                    onChange={e => setSheetSearch(e.target.value)}
                    placeholder="Search problem or subtopic in sheet..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[#121215] border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>

                {/* Topic Select */}
                <div className="relative sm:w-48 shrink-0">
                  <select
                    value={sheetTopicFilter}
                    onChange={e => setSheetTopicFilter(e.target.value)}
                    className="w-full appearance-none px-3 py-1.5 bg-[#121215] border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 focus:outline-none cursor-pointer pr-8 focus:border-zinc-700 transition-colors"
                  >
                    <option value="all">All Topics ({allTopicsList.length})</option>
                    {allTopicsList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>

                {/* Status & Diff Filters */}
                <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar shrink-0">
                  {['all', 'done', 'attempted', 'not_started'].map(st => {
                    const isActive = sheetStatusFilter === st;
                    return (
                      <button
                        key={st}
                        onClick={() => setSheetStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                          isActive
                            ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                            : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-zinc-200'
                        }`}
                      >
                        {st === 'not_started' ? 'Todo' : st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grouped Topics List */}
              {groupedSheetData.length === 0 ? (
                <div className="text-center py-12 border border-zinc-800/80 rounded-xl bg-[#0e0e11]">
                  <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 font-mono">No problems in DSA Sheet match filter criteria.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedSheetData.map(group => {
                    // Closed/collapsed by default, click header to expand
                    const isExpanded = expandedTopics[group.topic] === true;
                    const topicPct = group.total > 0 ? Math.round((group.solved / group.total) * 100) : 0;
                    return (
                      <div key={group.topic} className="border border-zinc-800/80 rounded-xl overflow-hidden bg-[#0e0e11] shadow-sm">
                        {/* Minimal Topic Header Accordion */}
                        <div
                          onClick={() => toggleTopicExpand(group.topic)}
                          className="px-4 py-3 bg-[#121216] flex items-center justify-between cursor-pointer hover:bg-zinc-900/60 transition-colors select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <h5 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">
                              {group.topic}
                            </h5>
                            <span className="text-[10px] font-mono text-zinc-400 bg-[#09090b] px-2 py-0.5 rounded border border-zinc-800/80">
                              {group.solved} / {group.total} ({topicPct}%)
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="w-20 sm:w-28 bg-[#09090b] h-1.5 rounded-full overflow-hidden hidden sm:block border border-zinc-800/60">
                              <div
                                className="bg-emerald-400 h-full rounded-full transition-all"
                                style={{ width: `${topicPct}%` }}
                              />
                            </div>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                          </div>
                        </div>

                        {/* Questions List (only shown when expanded) */}
                        {isExpanded && (
                          <div className="divide-y divide-zinc-800/50 border-t border-zinc-800/60 bg-[#0a0a0c]">
                            {group.filteredQuestions.map((item, qIdx) => (
                              <div key={item.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Minimal Status Icon */}
                                  <div className="shrink-0">
                                    {item.status === 'done' ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : item.status === 'attempted' ? (
                                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5 text-zinc-700" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <button
                                        type="button"
                                        onClick={() => handleQuestionClick(item.problem_name)}
                                        className="text-xs font-medium text-zinc-200 hover:text-white transition-colors truncate text-left cursor-pointer"
                                      >
                                        {item.problem_name}
                                      </button>
                                      <DiffDot difficulty={item.difficulty} />
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {item.subtopic && (
                                        <span className="text-[10px] font-mono text-zinc-400 bg-[#121216] px-1.5 py-0.5 rounded border border-zinc-800/80">
                                          {item.subtopic}
                                        </span>
                                      )}
                                      <SolveTags prog={item.prog} />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {item.prog?.updated_at && item.status === 'done' && (
                                    <span className="text-[10px] font-mono text-zinc-500 hidden xs:inline">
                                      {formatRelativeTime(item.prog.updated_at)}
                                    </span>
                                  )}
                                  {(item.link || item.leetcode_link) && (
                                    <a
                                      href={item.link || item.leetcode_link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1 rounded bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                      title="Open question"
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

          {/* TAB 4: SPEED (MONKEYTYPE) */}
          {activeModalTab === 'speed' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Top Banner */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-violet-400" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Monkeytype Speed</h4>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {user?.monkeytype_username ? (
                      <>Linked account: <a href={`https://monkeytype.com/profile/${user.monkeytype_username}`} target="_blank" rel="noreferrer" className="text-violet-400 underline hover:text-violet-300 font-mono">@{user.monkeytype_username}</a></>
                    ) : (
                      'No Monkeytype handle configured in settings.'
                    )}
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-2xl font-bold text-violet-400">{topWPM}</span>
                  <span className="text-xs text-zinc-500 block">Peak WPM</span>
                </div>
              </div>

              {/* Modes Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {speedModes.map(mode => (
                  <div key={mode.label} className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{mode.label} Mode</span>
                    <p className="text-xl font-bold text-white font-mono">{mode.wpm ?? '—'} <span className="text-xs text-zinc-500 font-normal">wpm</span></p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60">
                      <span>Acc: {mode.acc ? `${mode.acc}%` : '—'}</span>
                      <span>Consist: {mode.consistency ? `${mode.consistency}%` : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Completion Rate</span>
                  <span className="text-lg font-bold text-emerald-400">{completionRate}%</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Total Typing Time</span>
                  <span className="text-lg font-bold text-amber-400">{formatTime(typingProfile?.time_typing)}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center font-mono">
                  <span className="text-[10px] text-zinc-500 uppercase block">Tests Completed</span>
                  <span className="text-lg font-bold text-zinc-200">{typingProfile?.tests_completed || 0}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: JAVA QUIZ */}
          {activeModalTab === 'quiz' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Java Concept Quizzes</h4>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {(Array.isArray(quizAttempts) ? quizAttempts : quizAttempts?.data || []).length} attempts
                </span>
              </div>

              {(() => {
                const attemptsList = Array.isArray(quizAttempts) ? quizAttempts : quizAttempts?.data || [];
                if (loadingAttempts) {
                  return <div className="py-12 text-center text-xs font-mono text-zinc-500">Loading quiz history…</div>;
                }
                if (attemptsList.length === 0) {
                  return (
                    <div className="text-center py-12 border border-zinc-800 rounded-xl bg-zinc-950/40">
                      <Brain className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500 font-mono">No quiz attempts recorded yet.</p>
                    </div>
                  );
                }
                return (
                  <div className="divide-y divide-zinc-800/60 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
                    {attemptsList.map((attempt, idx) => {
                      const totalQs = attempt.total_questions || attempt.total || 0;
                      const scorePct = attempt.percentage !== undefined && attempt.percentage !== null 
                        ? Number(attempt.percentage)
                        : (totalQs > 0 ? Math.round((attempt.score / totalQs) * 100) : 0);
                      const timeStr = attempt.created_at || attempt.completed_at;

                      return (
                        <div key={attempt.id || idx} className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-zinc-200">{attempt.quiz_title || 'Java Quiz'}</p>
                            {timeStr && (
                              <p className="text-[10px] text-zinc-500 font-mono">
                                {formatRelativeTime(timeStr)}
                              </p>
                            )}
                          </div>
                          <div className="text-right font-mono">
                            <span className={`text-sm font-bold ${scorePct >= 80 ? 'text-emerald-400' : scorePct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {attempt.score} / {totalQs} ({scorePct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
        )}
      </motion.div>

      {/* Followers & Following List Modal */}
      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        userId={user?.id}
        initialTab={followersModalTab}
      />
    </motion.div>
  );
}

export default UserProfileModal;
