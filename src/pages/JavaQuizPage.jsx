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
  
  // Quiz parameters
  const [quizLength, setQuizLength] = useState(25); // 10, 25, 50, 90

  // History states
  const [userAttempts, setUserAttempts] = useState([]);
  const [personalBest, setPersonalBest] = useState(null);

  // Fetch questions & user history on mount
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const qData = await fetchQuizQuestions();
        setQuestions(qData);
        
        if (profile?.id) {
          const attempts = await fetchUserAttempts(profile.id);
          setUserAttempts(attempts);
          
          if (attempts.length > 0) {
            const best = [...attempts].sort((a, b) => b.percentage - a.percentage)[0];
            setPersonalBest(best);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load quiz data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [profile?.id]);

  // Start the quiz with user options
  const handleStartQuiz = () => {
    // Pick questions based on selected length
    let shuffled = [...questions].sort(() => 0.5 - Math.random());
    
    // Slice based on choice, max available is questions.length
    const length = Math.min(quizLength, shuffled.length);
    setCurrentQuestionsList(shuffled.slice(0, length));
    
    // Reset play states
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setGameState('playing');
  };

  // Select an option
  const handleOptionSelect = (optionIdx) => {
    if (isAnswered) return;
    
    setSelectedOption(optionIdx);
    setIsAnswered(true);
    
    const currentQ = currentQuestionsList[currentIndex];
    if (optionIdx === currentQ.correct_answer) {
      setScore(prev => prev + 1);
    }
  };

  // Next Question or complete quiz
  const handleNextQuestion = async () => {
    if (currentIndex + 1 < currentQuestionsList.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished!
      setGameState('result');
      if (profile?.id) {
        try {
          const finalScore = score;
          const totalQuestions = currentQuestionsList.length;
          const savedAttempt = await saveQuizAttempt(profile.id, finalScore, totalQuestions);
          
          // Refresh attempts and personal best
          const attempts = await fetchUserAttempts(profile.id);
          setUserAttempts(attempts);
          const best = [...attempts].sort((a, b) => b.percentage - a.percentage)[0];
          setPersonalBest(best);
        } catch (err) {
          console.error("Failed to save attempt results:", err);
        }
      }
    }
  };

  // Formats text to highlight code snippets wrapped in quotes or backticks, and renders newlines
  const renderQuestionText = (text) => {
    if (!text) return null;
    const parts = text.split('\n');
    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          // If the line looks like code, render in monospaced format
          const isCode = part.includes('System.out') || part.includes('String ') || part.includes('int ') || part.includes('List<') || part.includes('==') || part.includes('equals(');
          if (isCode) {
            return (
              <pre key={index} className="bg-black/40 border border-white/5 rounded-lg p-3 text-xs sm:text-sm font-mono text-violet-300 overflow-x-auto whitespace-pre">
                {part}
              </pre>
            );
          }
          return (
            <p key={index} className="text-sm sm:text-base text-zinc-200 font-medium">
              {part}
            </p>
          );
        })}
      </div>
    );
  };

  // Format explanation text
  const renderExplanation = (text) => {
    if (!text) return null;
    return (
      <div className="mt-4 p-4 rounded-xl border border-violet-500/15 bg-violet-500/5 animate-fadeIn">
        <div className="flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider">Explanation</h4>
            <p className="text-xs sm:text-sm text-zinc-400 whitespace-pre-line leading-relaxed">
              {text}
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-zinc-500 text-xs font-medium animate-pulse">Loading Java Quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 mb-4">
          <XCircle className="w-6 h-6" />
        </div>
        <h3 className="text-zinc-200 font-semibold mb-1">Error Loading Quiz</h3>
        <p className="text-zinc-500 text-xs max-w-sm mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Java Interview Quiz</h1>
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
            className="px-3 py-1.5 rounded-lg border border-white/[0.06] hover:bg-red-500/10 hover:text-red-400 text-zinc-400 text-xs font-semibold transition-all cursor-pointer"
          >
            Exit Quiz
          </button>
        )}
      </div>

      {/* ── SCREEN 1: START SCREEN ── */}
      {gameState === 'start' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Main Card */}
          <div className="md:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="space-y-2">
              <h2 className="text-base font-bold text-zinc-200 uppercase tracking-wider text-xxs text-violet-400">Challenge Mode</h2>
              <h3 className="text-lg font-semibold text-zinc-100">Prepare for Java Interviews</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Answer high-frequency Java interview questions. This quiz covers critical topics like:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xxs sm:text-xs text-zinc-500 mt-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span>String Pool & Immutability</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span>OOPs & Polymorphism</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span>Collections Framework</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                  <span>Exception Handling & JVM</span>
                </div>
              </div>
            </div>

            {/* Quiz Settings */}
            <div className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] space-y-4">
              <label className="section-label block mb-1">Select Quiz Length</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 90].map((length) => (
                  <button
                    key={length}
                    onClick={() => setQuizLength(length)}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      quizLength === length
                        ? 'bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/20'
                        : 'border-white/[0.06] bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {length} Qs
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500">
                {quizLength === 90 
                  ? '🔋 Complete Marathon: Testing you on all 90 curated interview questions.' 
                  : `🎲 Quick Test: 50% random shuffle of ${quizLength} questions.`}
              </p>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all shadow-md shadow-violet-600/25 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Quiz Session</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Sidebar Stats Panel */}
          <div className="space-y-4">
            {/* Personal Best */}
            <div className="glass-panel rounded-2xl p-5 border border-white/[0.05] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-label">Personal Best</h3>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              {personalBest ? (
                <div className="space-y-1">
                  <p className="text-2xl font-black font-mono text-zinc-100">
                    {personalBest.percentage}%
                  </p>
                  <p className="text-xxs text-zinc-500 leading-none">
                    Score: {personalBest.score}/{personalBest.total} questions
                  </p>
                  <p className="text-xxs text-zinc-600 pt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(personalBest.completed_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-zinc-500 text-xs py-2">
                  No attempts recorded yet. Take your first quiz!
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="glass-panel rounded-2xl p-5 border border-white/[0.05] space-y-3">
              <h3 className="section-label mb-2">Quiz Stats</h3>
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                <span className="text-xxs text-zinc-500 uppercase">Attempts</span>
                <span className="text-xs font-bold text-zinc-300 font-mono">{userAttempts.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
                <span className="text-xxs text-zinc-500 uppercase">Pool Size</span>
                <span className="text-xs font-bold text-zinc-300 font-mono">{questions.length} Qs</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xxs text-zinc-500 uppercase">Avg Score</span>
                <span className="text-xs font-bold text-zinc-300 font-mono">
                  {userAttempts.length > 0 
                    ? `${Math.round(userAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / userAttempts.length)}%` 
                    : '--'}
                </span>
              </div>
            </div>

            {/* Recent attempts */}
            {userAttempts.length > 0 && (
              <div className="glass-panel rounded-2xl p-5 border border-white/[0.05]">
                <h3 className="section-label mb-3">Recent Attempts</h3>
                <div className="space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                  {userAttempts.slice(0, 5).map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between text-xxs text-zinc-400 py-1.5 border-b border-white/[0.02] last:border-b-0">
                      <span className="font-mono text-zinc-500">{new Date(attempt.completed_at).toLocaleDateString()}</span>
                      <span className="font-mono text-zinc-500">{attempt.score}/{attempt.total}</span>
                      <span className={`font-bold font-mono ${
                        attempt.percentage >= 80 ? 'text-emerald-400' :
                        attempt.percentage >= 60 ? 'text-amber-400' : 'text-zinc-500'
                      }`}>
                        {attempt.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── SCREEN 2: PLAYING SCREEN ── */}
      {gameState === 'playing' && currentQuestionsList.length > 0 && (
        <div className="space-y-6">
          {/* Progress Bar & Header */}
          <div className="glass-panel rounded-2xl p-4 border border-white/[0.05] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-400">
                Question <span className="text-violet-400 font-bold font-mono">{currentIndex + 1}</span> of <span className="text-zinc-200 font-bold font-mono">{currentQuestionsList.length}</span>
              </span>
              <span className="text-zinc-400">
                Score: <span className="text-emerald-400 font-bold font-mono">{score}</span>
              </span>
            </div>
            
            {/* Real Progress Bar */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / currentQuestionsList.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/[0.05] space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xxs px-2 py-0.5 rounded bg-violet-600/10 text-violet-400 border border-violet-500/15 font-semibold">
                Topic: Java Core
              </span>
            </div>

            {/* Question Text with Code Styling */}
            <div className="py-2">
              {renderQuestionText(currentQuestionsList[currentIndex].question)}
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQuestionsList[currentIndex].options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestionsList[currentIndex].correct_answer;
                
                // Styling computed dynamically after answer is chosen
                let btnStyles = "border-white/[0.06] bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700";
                
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyles = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
                  } else if (isSelected) {
                    btnStyles = "border-red-500/50 bg-red-500/10 text-red-400";
                  } else {
                    btnStyles = "border-white/[0.03] bg-zinc-950/30 text-zinc-600 opacity-60";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={isAnswered}
                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center justify-between ${btnStyles}`}
                  >
                    <span>{option}</span>
                    
                    {/* Status Icons */}
                    {isAnswered && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Action Panel */}
            {isAnswered && (
              <div className="space-y-4 pt-4 border-t border-white/[0.03] animate-fadeIn">
                {/* Explanation Card */}
                {renderExplanation(currentQuestionsList[currentIndex].explanation)}
                
                {/* Next button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="py-2.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {currentIndex + 1 === currentQuestionsList.length ? 'Finish & Save Score' : 'Next Question'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SCREEN 3: RESULT SCREEN ── */}
      {gameState === 'result' && (
        <div className="max-w-xl mx-auto glass-panel rounded-2xl p-8 border border-white/[0.05] text-center relative overflow-hidden space-y-6">
          <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-violet-600/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto">
              <Award className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-100">Quiz Completed!</h2>
              <p className="text-zinc-500 text-xs">Great work, your attempts have been successfully saved.</p>
            </div>

            {/* Gauge visual */}
            <div className="py-4">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* Score Ring Background */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-zinc-800" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="50" cy="50" r="42" 
                    className="stroke-violet-500" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * (1 - (score / currentQuestionsList.length))}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center score */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black font-mono text-zinc-100">
                    {Math.round((score / currentQuestionsList.length) * 100)}%
                  </span>
                  <span className="text-xxs text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    {score} / {currentQuestionsList.length} Correct
                  </span>
                </div>
              </div>
            </div>

            {/* Evaluation Label */}
            <div className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-semibold animate-pulse">
              {Math.round((score / currentQuestionsList.length) * 100) >= 90 ? '🏆 Perfect Donkey!' :
               Math.round((score / currentQuestionsList.length) * 100) >= 75 ? '🎯 Expert Level!' :
               Math.round((score / currentQuestionsList.length) * 100) >= 50 ? '📚 Keep Practicing!' :
               '💪 Don\'t give up, try again!'}
            </div>

            {/* Stats block */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] text-center">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Accuracy</p>
                <p className="text-lg font-black font-mono text-zinc-200">
                  {Math.round((score / currentQuestionsList.length) * 100)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Attempts</p>
                <p className="text-lg font-black font-mono text-zinc-200">
                  {userAttempts.length}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleStartQuiz}
                className="flex-1 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Quiz</span>
              </button>
              
              <button
                onClick={() => setGameState('start')}
                className="flex-1 py-3 px-4 rounded-xl border border-white/[0.06] hover:bg-white/[0.03] text-zinc-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Quiz Lobby</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default JavaQuizPage;
