import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchQuizQuestions, 
  saveQuizAttempt, 
  fetchUserAttempts 
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
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp, cardHover, modalVariants } from '../lib/animations';

const JavaQuizPage = () => {
  const { profile } = useAuth();
  
  // Game states: 'start', 'playing', 'result'
  const [gameState, setGameState] = useState('start');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Playing states
  const [currentQuestionsList, setCurrentQuestionsList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // null or 0-3
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  // Stats
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

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

  // Load user attempts
  const loadHistory = async () => {
    if (!profile?.id) return;
    setHistoryLoading(true);
    try {
      const attempts = await fetchUserAttempts(profile.id);
      setHistory(attempts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadHistory();
  }, [profile?.id]);

  // Start a new quiz session (picks 10 random questions)
  const startQuiz = () => {
    if (questions.length < 10) {
      alert(`Need at least 10 questions to start. Found ${questions.length}.`);
      return;
    }
    // Shuffle array and take first 10
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    
    setCurrentQuestionsList(selected);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setGameState('playing');
  };

  // Handle choosing an option
  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    
    const currentQ = currentQuestionsList[currentIndex];
    if (idx === currentQ.correct_option) {
      setScore(prev => prev + 1);
    }
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
      // Save result to Supabase
      if (profile?.id) {
        await saveQuizAttempt(profile.id, score, currentQuestionsList.length);
        loadHistory(); // refresh history
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-zinc-500 text-xs font-mono">Loading Quiz Questions…</p>
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
      className="max-w-4xl mx-auto space-y-6 pb-8 font-sans transform-gpu"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
            <Brain className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Java Interview Quiz</h1>
            <p className="text-zinc-500 text-xs">Test your core Java knowledge: concepts, memory management, exceptions, and collections.</p>
          </div>
        </div>
        {gameState === 'playing' && (
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to exit the quiz? Progress will not be saved.")) {
                setGameState('start');
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 text-xs font-semibold transition-all cursor-pointer active:scale-95"
          >
            Exit Quiz
          </button>
        )}
      </div>

      {/* ── SCREEN 1: START SCREEN ── */}
      {gameState === 'start' && (
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Main Card */}
          <motion.div variants={fadeUp} className="md:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-violet-400 font-bold bg-violet-500/10 px-2.5 py-1 rounded-md border border-violet-500/20 inline-block">
                Skill Test
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Ready for 10 Quick Questions?</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Answer 10 random Java concept questions curated for technical interviews. Track your best accuracy and climb the leaderboard!
              </p>
            </div>

            {/* Features bullet list */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2.5">
                <FileQuestion className="w-4 h-4 text-violet-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-white block">10 Questions</span>
                  <span className="text-[10px] text-zinc-500">Multiple choice</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Instant Feedback</span>
                  <span className="text-[10px] text-zinc-500">Detailed explanations</span>
                </div>
              </div>
            </div>

            {/* Start CTA */}
            <div className="pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={startQuiz}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 cursor-pointer transition-colors"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Quiz Challenge</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Sidebar Stats */}
          <motion.div variants={fadeUp} className="space-y-4">
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2 font-bold">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Your Quiz Record</span>
              </h3>

              {history.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">BEST ACCURACY</span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {Math.max(...history.map(h => Math.round((h.score / h.total_questions) * 100)))}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">TESTS TAKEN</span>
                    <span className="text-lg font-bold text-white">{history.length}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No quiz attempts yet. Complete your first test above!</p>
              )}
            </div>

            {/* Recent Attempts list */}
            {history.length > 0 && (
              <div className="glass-panel rounded-2xl p-4 space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Recent History</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {history.slice(0, 5).map((att) => {
                    const pct = Math.round((att.score / att.total_questions) * 100);
                    return (
                      <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 text-xs">
                        <span className="text-zinc-400 text-[11px] font-mono">
                          {new Date(att.created_at).toLocaleDateString()}
                        </span>
                        <span className={`font-bold font-mono ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                          {att.score}/{att.total_questions} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

        </motion.div>
      )}

      {/* ── SCREEN 2: PLAYING SCREEN ── */}
      {gameState === 'playing' && currentQuestionsList.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Progress bar */}
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-xs flex items-center gap-2 hover:bg-zinc-200 transition-colors cursor-pointer shadow-md"
                  >
                    <span>{currentIndex + 1 === currentQuestionsList.length ? 'See Results' : 'Next Question'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── SCREEN 3: RESULT SCREEN ── */}
      {gameState === 'result' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="max-w-md mx-auto glass-panel rounded-2xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Quiz Completed!</h2>
            <p className="text-xs text-zinc-400">Great effort testing your Java skills.</p>
          </div>

          {/* Score display */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">YOUR SCORE</span>
            <div className="text-3xl font-extrabold text-white">
              {score} <span className="text-zinc-500 text-sm font-normal">/ {currentQuestionsList.length}</span>
            </div>
            <p className="text-xs font-bold text-violet-400 mt-1">
              {Math.round((score / currentQuestionsList.length) * 100)}% Accuracy
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={startQuiz}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setGameState('start')}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Quiz Home</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default JavaQuizPage;
