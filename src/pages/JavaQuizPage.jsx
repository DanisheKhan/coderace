import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchQuizQuestions, 
  saveQuizAttempt, 
  fetchUserAttempts, 
  fetchGlobalQuizLeaderboard 
} from '../lib/quizService';
import { 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Home, 
  Award, 
  Calendar, 
  Zap, 
  TrendingUp, 
  Play,
  FileQuestion,
  ChevronRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Trophy,
  Layers,
  Clock,
  Sparkles,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp } from '../lib/animations';

const TOPICS_CONFIG = [
  { id: 'all', name: 'All Topics', icon: Brain, color: '#8b5cf6', desc: 'Random mix of all Java concepts' },
  { id: 'OOP Concepts', name: 'OOP Concepts', icon: Layers, color: '#ec4899', desc: 'Inheritance, Polymorphism, Abstraction' },
  { id: 'Collections Framework', name: 'Collections', icon: Target, color: '#10b981', desc: 'Lists, Sets, HashMaps, Queues' },
  { id: 'Multithreading & Concurrency', name: 'Concurrency', icon: Zap, color: '#f59e0b', desc: 'Threads, Locks, Synchronization' },
  { id: 'Exceptions & Memory', name: 'Exceptions & Memory', icon: Flame, color: '#ef4444', desc: 'Try-Catch, GC, Heap vs Stack' },
  { id: 'Core Java & Syntax', name: 'Core Syntax', icon: BookOpen, color: '#3b82f6', desc: 'Generics, Modifiers, String Pool' },
];

const DIFFICULTY_CONFIG = [
  { id: 'all', label: 'All Levels' },
  { id: 'Easy', label: 'Easy' },
  { id: 'Medium', label: 'Medium' },
  { id: 'Hard', label: 'Hard' },
];

const SPEED_BLITZ_SECONDS = 15; // 15 seconds per question in Speed Blitz mode

export default function JavaQuizPage() {
  const { profile } = useAuth();
  
  // App views: 'hub', 'leaderboard', 'bookmarks'
  const [activeView, setActiveView] = useState('hub');

  // Game states: 'start', 'playing', 'result'
  const [gameState, setGameState] = useState('start');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Quiz Configuration
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedMode, setSelectedMode] = useState('standard'); // 'standard' | 'speed'

  // Playing states
  const [currentQuestionsList, setCurrentQuestionsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // null or 0-3
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswersHistory, setUserAnswersHistory] = useState([]); // Array of { question, selected, isCorrect }

  // Speed Blitz Timer State
  const [timeLeft, setTimeLeft] = useState(SPEED_BLITZ_SECONDS);
  const timerRef = useRef(null);

  // Stats & Leaderboard Data
  const [userHistory, setUserHistory] = useState([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Bookmarking System
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('coderace_bookmarked_quiz_questions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Post-Quiz Review Accordion
  const [expandedReviewIdx, setExpandedReviewIdx] = useState(null);

  // Save Bookmarks to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('coderace_bookmarked_quiz_questions', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedIds]);

  const toggleBookmark = (questionId) => {
    setBookmarkedIds(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId) 
        : [...prev, questionId]
    );
  };

  // Load questions
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchQuizQuestions();
      if (!data || data.length === 0) {
        setError('No quiz questions found in database.');
      } else {
        setQuestions(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  // Load user attempts & global leaderboard
  const loadHistoryAndLeaderboard = async () => {
    if (profile?.id) {
      try {
        const attempts = await fetchUserAttempts(profile.id);
        setUserHistory(attempts || []);
      } catch (err) {
        console.error(err);
      }
    }

    setLeaderboardLoading(true);
    try {
      const lead = await fetchGlobalQuizLeaderboard();
      setGlobalLeaderboard(lead || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadHistoryAndLeaderboard();
  }, [profile?.id]);

  // Topic Questions Breakdown Count
  const topicCounts = useMemo(() => {
    const counts = { all: questions.length };
    TOPICS_CONFIG.forEach(t => {
      if (t.id !== 'all') {
        counts[t.id] = questions.filter(q => q.category === t.id).length;
      }
    });
    return counts;
  }, [questions]);

  // Filter questions by selected topic & difficulty
  const availableQuestionsForTopic = useMemo(() => {
    return questions.filter(q => {
      const matchTopic = selectedTopic === 'all' || q.category === selectedTopic;
      const matchDiff = selectedDifficulty === 'all' || (q.difficulty && q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
      return matchTopic && matchDiff;
    });
  }, [questions, selectedTopic, selectedDifficulty]);

  // Speed Blitz Timer Interval Handler
  useEffect(() => {
    if (gameState === 'playing' && selectedMode === 'speed' && !isAnswered) {
      setTimeLeft(SPEED_BLITZ_SECONDS);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto handle timeout as unanswered/wrong
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState, currentIndex, isAnswered, selectedMode]);

  const handleTimeout = () => {
    if (isAnswered) return;
    setSelectedOption(-1); // -1 indicates timeout
    setIsAnswered(true);

    const currentQ = currentQuestionsList[currentIndex];
    setUserAnswersHistory(prev => [
      ...prev,
      { question: currentQ, selected: -1, isCorrect: false, timedOut: true }
    ]);
  };

  // Start Quiz Challenge
  const startQuiz = () => {
    const list = availableQuestionsForTopic;
    if (list.length === 0) {
      alert(`No questions available for selected topic "${selectedTopic}".`);
      return;
    }

    // Pick up to 10 random questions
    const countToTake = Math.min(10, list.length);
    const shuffled = [...list].sort(() => 0.5 - Math.random()).slice(0, countToTake);

    setCurrentQuestionsList(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setUserAnswersHistory([]);
    setExpandedReviewIdx(null);
    setGameState('playing');
  };

  // Handle choosing an option
  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    clearInterval(timerRef.current);
    setSelectedOption(idx);
    setIsAnswered(true);

    const currentQ = currentQuestionsList[currentIndex];
    const isCorrect = idx === currentQ.correct_option;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setUserAnswersHistory(prev => [
      ...prev,
      { question: currentQ, selected: idx, isCorrect, timedOut: false }
    ]);
  };

  // Next question or finish
  const handleNextQuestion = async () => {
    if (currentIndex + 1 < currentQuestionsList.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished!
      setGameState('result');
      if (profile?.id) {
        const calculatedScore = userAnswersHistory.reduce((acc, curr) => acc + (curr.isCorrect ? 1 : 0), 0);
        const finalScore = Math.max(score, calculatedScore);
        await saveQuizAttempt(profile.id, finalScore, currentQuestionsList.length);
        loadHistoryAndLeaderboard();
      }
    }
  };

  // Bookmarked questions array
  const bookmarkedQuestionsList = useMemo(() => {
    return questions.filter(q => bookmarkedIds.includes(q.id));
  }, [questions, bookmarkedIds]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-zinc-500 text-xs font-mono">Loading Java Quiz Engine…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 text-center">
        <p className="text-red-400 text-sm font-semibold">{error}</p>
        <button 
          onClick={loadData}
          className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="max-w-4xl mx-auto space-y-6 pb-12 font-sans transform-gpu"
    >
      {/* HEADER & VIEW TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/25 flex items-center justify-center text-violet-400 shrink-0">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Java Interview Quiz Arena</h1>
            <p className="text-zinc-500 text-xs">Topic-wise quizzes, speed runs, and core Java concept reviews.</p>
          </div>
        </div>

        {gameState === 'start' && (
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 font-mono text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveView('hub')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'hub' ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Quiz Hub</span>
            </button>

            <button
              onClick={() => setActiveView('leaderboard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'leaderboard' ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setActiveView('bookmarks')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'bookmarks' ? 'bg-violet-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({bookmarkedIds.length})</span>
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to exit the quiz? Current score will not be saved.")) {
                setGameState('start');
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-zinc-400 text-xs font-semibold transition-all cursor-pointer"
          >
            Exit Quiz
          </button>
        )}
      </div>

      {/* ── VIEW 1: QUIZ HUB SCREEN (Start State) ── */}
      {gameState === 'start' && activeView === 'hub' && (
        <motion.div variants={staggerContainer} className="space-y-6">
          
          {/* TOPIC SELECTION GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-400" />
                <span>Select Quiz Topic</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Pick a specific Java concept or test all</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TOPICS_CONFIG.map(t => {
                const IconComp = t.icon;
                const isSelected = selectedTopic === t.id;
                const count = topicCounts[t.id] || 0;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTopic(t.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-violet-600/15 border-violet-500/50 shadow-lg shadow-violet-600/10 ring-1 ring-violet-500/50'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                        style={{ backgroundColor: t.color }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {count} Qs
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                      <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DIFFICULTY SELECTION GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Select Difficulty Level</span>
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">Filter questions by target difficulty</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DIFFICULTY_CONFIG.map(d => {
                const isSelected = selectedDifficulty === d.id;
                const count = questions.filter(q => {
                  const matchTopic = selectedTopic === 'all' || q.category === selectedTopic;
                  const matchDiff = d.id === 'all' || (q.difficulty && q.difficulty.toLowerCase() === d.id.toLowerCase());
                  return matchTopic && matchDiff;
                }).length;

                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(d.id)}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-700 text-white font-bold shadow-md ring-1 ring-zinc-700' 
                        : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        d.id === 'Easy' ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' :
                        d.id === 'Medium' ? 'bg-amber-400 shadow-sm shadow-amber-500/50' :
                        d.id === 'Hard' ? 'bg-rose-400 shadow-sm shadow-rose-500/50' : 'bg-violet-400'
                      }`} />
                      <span>{d.label}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {count} Qs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MODE SELECTION & CTA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            <div className="md:col-span-2 glass-panel rounded-2xl p-6 space-y-6 relative overflow-hidden">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20 inline-block">
                  CHALLENGE MODE
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">Choose Your Battle Pace</h2>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Topic: <span className="text-violet-300 font-bold">{TOPICS_CONFIG.find(t => t.id === selectedTopic)?.name}</span> • Difficulty: <span className="text-amber-300 font-bold">{DIFFICULTY_CONFIG.find(d => d.id === selectedDifficulty)?.label}</span> ({availableQuestionsForTopic.length} Available Questions)
                </p>
              </div>

              {/* Mode Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Standard Mode */}
                <div
                  onClick={() => setSelectedMode('standard')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedMode === 'standard'
                      ? 'bg-violet-500/15 border-violet-500/50 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-bold text-white">Standard Practice</span>
                    </div>
                    {selectedMode === 'standard' && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    10 random questions at your own speed with instant answer explanations.
                  </p>
                </div>

                {/* Speed Blitz Mode */}
                <div
                  onClick={() => setSelectedMode('speed')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedMode === 'speed'
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300">Speed Blitz (15s)</span>
                    </div>
                    {selectedMode === 'speed' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    15 seconds per question timer! Tests quick recall under time pressure.
                  </p>
                </div>
              </div>

              {/* Start Quiz CTA Button */}
              <div>
                <button
                  onClick={startQuiz}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start {selectedTopic === 'all' ? 'Full' : selectedTopic} Quiz Challenge</span>
                </button>
              </div>
            </div>

            {/* Sidebar Personal Records */}
            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2 font-bold">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Your Performance Stats</span>
                </h3>

                {userHistory.length > 0 ? (
                  <div className="space-y-3 font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">BEST ACCURACY</span>
                      <span className="text-2xl font-bold text-emerald-400">
                        {Math.max(...userHistory.map(h => Math.round((h.score / h.total_questions) * 100)))}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">TOTAL QUIZZES COMPLETED</span>
                      <span className="text-lg font-bold text-white">{userHistory.length}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic leading-relaxed">
                    No quiz attempts yet. Pick a topic above and take your first test!
                  </p>
                )}
              </div>
            </div>

          </div>

        </motion.div>
      )}

      {/* ── VIEW 2: GLOBAL QUIZ LEADERBOARD ── */}
      {gameState === 'start' && activeView === 'leaderboard' && (
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                Global Quiz Leaderboard
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Ranked by Highest Accuracy %</span>
          </div>

          {leaderboardLoading ? (
            <div className="text-center py-12 text-xs font-mono text-zinc-500">Loading quiz leaderboard...</div>
          ) : globalLeaderboard.length === 0 ? (
            <div className="text-center py-12 border border-zinc-800 rounded-xl bg-zinc-950/40">
              <Trophy className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-mono">No quiz records found yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950/40 font-mono">
              {globalLeaderboard.map((item, idx) => {
                const displayName = item.profile?.display_name || item.display_name || 'Racer';
                const username = item.profile?.username || item.username;
                const avatarUrl = item.profile?.avatar_url || item.avatar_url;
                const avatarColor = item.profile?.avatar_color || item.avatar_color || '#8b5cf6';
                const uid = item.userId || item.user_id || '';
                const bestPct = item.bestPct ?? item.percentage ?? 0;
                const bestScore = item.bestScore ?? item.score ?? 0;
                const total = item.total ?? item.total_questions ?? 0;
                const attemptsCount = item.attemptsCount ?? 1;

                return (
                  <div key={uid || idx} className="p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-zinc-600 w-5 shrink-0 text-right">#{idx + 1}</span>
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm uppercase shrink-0 border border-white/10 overflow-hidden"
                        style={{ backgroundColor: avatarUrl ? 'transparent' : avatarColor }}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-100 truncate">{displayName}</p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          {username ? `@${username}` : `ID: ${uid.slice(0, 8)}...`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-emerald-400">{bestPct}% Accuracy</p>
                      <p className="text-[10px] text-zinc-500">
                        Best: {bestScore}/{total} • {attemptsCount} {attemptsCount === 1 ? 'attempt' : 'attempts'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── VIEW 3: BOOKMARKED QUESTIONS ── */}
      {gameState === 'start' && activeView === 'bookmarks' && (
        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                Bookmarked Questions ({bookmarkedQuestionsList.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Saved for Quick Revision</span>
          </div>

          {bookmarkedQuestionsList.length === 0 ? (
            <div className="text-center py-12 border border-zinc-800 rounded-xl bg-zinc-950/40">
              <Bookmark className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-mono">No bookmarked questions yet. Click the bookmark icon during a quiz to save tricky questions!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarkedQuestionsList.map(q => (
                <div key={q.id} className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {q.category || 'Java Concept'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-white leading-relaxed">{q.question_text}</h4>
                    </div>
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className="p-1 text-violet-400 hover:text-rose-400 transition-colors shrink-0"
                      title="Remove Bookmark"
                    >
                      <BookmarkCheck className="w-4 h-4 fill-violet-400" />
                    </button>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border text-[11px] flex items-center gap-2 ${
                          idx === q.correct_option
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] bg-zinc-800 text-zinc-400">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-300 bg-violet-950/20 p-2.5 rounded-lg border border-violet-500/20 leading-relaxed">
                    <strong className="text-violet-300 font-mono">Explanation:</strong> {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PLAYING SCREEN ── */}
      {gameState === 'playing' && currentQuestionsList.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Speed Blitz Countdown Bar */}
            {selectedMode === 'speed' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Time Remaining
                  </span>
                  <span className="text-amber-300 font-extrabold">{timeLeft}s</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-amber-500/20">
                  <motion.div 
                    className="bg-amber-500 h-full rounded-full" 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / SPEED_BLITZ_SECONDS) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Standard Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Question {currentIndex + 1} of {currentQuestionsList.length}</span>
                <span className="text-violet-400 font-bold">Score: {score}</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                <motion.div 
                  className="bg-violet-500 h-full rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / currentQuestionsList.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="glass-panel rounded-2xl p-6 space-y-6 shadow-2xl relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {currentQuestionsList[currentIndex].category || 'Java Concept'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    currentQuestionsList[currentIndex].difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    currentQuestionsList[currentIndex].difficulty?.toLowerCase() === 'hard' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {currentQuestionsList[currentIndex].difficulty || 'Medium'}
                  </span>
                </div>

                {/* Bookmark Toggle */}
                <button
                  onClick={() => toggleBookmark(currentQuestionsList[currentIndex].id)}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Bookmark Question"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarkedIds.includes(currentQuestionsList[currentIndex].id) ? 'fill-violet-400 text-violet-400' : ''}`} />
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-base sm:text-lg font-semibold text-white leading-snug">
                {currentQuestionsList[currentIndex].question_text}
              </h2>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestionsList[currentIndex].options.map((opt, idx) => {
                  const currentQ = currentQuestionsList[currentIndex];
                  const isCorrect = idx === currentQ.correct_option;
                  const isSelected = selectedOption === idx;
                  
                  let btnClass = "w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all duration-200 flex items-start gap-3 cursor-pointer select-none ";
                  
                  if (!isAnswered) {
                    btnClass += "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80 active:scale-[0.99]";
                  } else {
                    if (isCorrect) {
                      btnClass += "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold";
                    } else if (isSelected && !isCorrect) {
                      btnClass += "border-red-500/40 bg-red-500/10 text-red-300 font-bold";
                    } else {
                      btnClass += "border-zinc-800/40 bg-zinc-900/20 text-zinc-600 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={btnClass}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                        isAnswered && isCorrect 
                          ? 'bg-emerald-500 text-white' 
                          : isAnswered && isSelected && !isCorrect 
                          ? 'bg-red-500 text-white' 
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation (Shown after answering) */}
              {isAnswered && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 space-y-1"
                >
                  <p className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Explanation:
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {currentQuestionsList[currentIndex].explanation}
                  </p>
                </motion.div>
              )}

              {/* Next Button */}
              {isAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-xs flex items-center gap-2 hover:bg-zinc-200 transition-colors cursor-pointer shadow-md"
                  >
                    <span>{currentIndex + 1 === currentQuestionsList.length ? 'See Results & Review' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── RESULT & FULL QUESTION REVIEW SCREEN ── */}
      {gameState === 'result' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Result Card */}
          <div className="glass-panel rounded-2xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Quiz Completed!</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Topic: <span className="text-violet-300 font-bold">{TOPICS_CONFIG.find(t => t.id === selectedTopic)?.name}</span></p>
            </div>

            {/* Score pill */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1 font-mono inline-block px-8">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">FINAL ACCURACY</span>
              <div className="text-3xl font-extrabold text-white">
                {score} <span className="text-zinc-500 text-sm font-normal">/ {currentQuestionsList.length}</span>
              </div>
              <p className="text-xs font-bold text-emerald-400 mt-1">
                {Math.round((score / currentQuestionsList.length) * 100)}% Correct
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={startQuiz}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => setGameState('start')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Quiz Hub</span>
              </button>
            </div>
          </div>

          {/* 📋 POST-QUIZ QUESTION REVIEW ACCORDION */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                  Full Question Review ({userAnswersHistory.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Click question to inspect breakdown</span>
            </div>

            <div className="space-y-2.5">
              {userAnswersHistory.map((item, idx) => {
                const isExpanded = expandedReviewIdx === idx;

                return (
                  <div key={idx} className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden transition-all">
                    {/* Item Header */}
                    <div
                      onClick={() => setExpandedReviewIdx(isExpanded ? null : idx)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-white truncate">
                          Q{idx + 1}: {item.question.question_text}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          item.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {item.isCorrect ? 'Correct' : item.timedOut ? 'Timed Out' : 'Incorrect'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                      </div>
                    </div>

                    {/* Accordion Content Body */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-zinc-800/60 space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono pt-3">
                          {item.question.options.map((opt, optIdx) => {
                            const isCorrectOpt = optIdx === item.question.correct_option;
                            const isUserChosen = optIdx === item.selected;

                            let colorClass = "bg-zinc-900 border-zinc-800 text-zinc-400";
                            if (isCorrectOpt) colorClass = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold";
                            else if (isUserChosen && !isCorrectOpt) colorClass = "bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold";

                            return (
                              <div key={optIdx} className={`p-2.5 rounded-lg border text-[11px] flex items-center gap-2 ${colorClass}`}>
                                <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] bg-zinc-800 text-zinc-300">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-3 rounded-lg bg-violet-950/20 border border-violet-500/20 text-zinc-300 space-y-1">
                          <p className="font-bold text-violet-300 font-mono text-[11px]">Explanation:</p>
                          <p className="leading-relaxed">{item.question.explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}
