import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuestions } from '../../contexts/QuestionsContext';
import { useProgressStore } from '../../store/progressStore';
import { 
  Search, 
  Menu, 
  X, 
  Plus, 
  CheckCircle2, 
  Flame, 
  LogOut,
  LayoutDashboard,
  TableProperties,
  Trophy,
  BarChart3
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const TopBar = ({ toggleMobileMenu, isMobileMenuOpen }) => {
  const { profile, signOut } = useAuth();
  const { questions } = useQuestions();
  const { progress, upsertProgress } = useProgressStore();
  const navigate = useNavigate();

  // Search state for quick log
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle quick search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = questions
      .filter(q => q.problem_name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5); // limit to top 5 results

    setSearchResults(filtered);
    setShowResults(true);
  };

  // Mark a question done quickly
  const handleQuickSolve = async (questionId) => {
    if (!profile) return;
    await upsertProgress(profile.id, questionId, { status: 'done' });
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  // Helper to check if a question is already done
  const isQuestionDone = (qId) => {
    if (!profile) return false;
    const userProg = progress.find(p => p.user_id === profile.id && p.question_id === qId);
    return userProg?.status === 'done';
  };

  // Current Streak Calculation
  const calculateStreak = () => {
    if (!profile) return 0;
    
    const userDoneProgress = progress
      .filter(p => p.user_id === profile.id && p.status === 'done')
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

  const streak = calculateStreak();

  return (
    <header className="h-[72px] border-b border-zinc-800 bg-[#121214]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 w-full">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleMobileMenu} 
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-bold text-lg text-zinc-100 max-md:hidden">Track Progress</span>
        <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent md:hidden">
          CodeRace
        </span>
      </div>

      {/* Middle: Quick Solve Search Widget */}
      <div className="flex-1 max-w-sm mx-4 relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Today I solved..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        {/* Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-zinc-800 bg-[#121214] shadow-2xl p-2 z-50 overflow-hidden">
            {searchResults.map((q) => {
              const done = isQuestionDone(q.id);
              return (
                <div 
                  key={q.id}
                  className="flex items-center justify-between p-2 hover:bg-zinc-800/40 rounded-lg transition-colors group/item"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs text-zinc-500 truncate">{q.topic} • {q.subtopic}</p>
                    <p className="text-sm text-zinc-200 font-medium truncate">{q.problem_name}</p>
                  </div>
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <button
                      onClick={() => handleQuickSolve(q.id)}
                      className="p-1 rounded-md bg-violet-600/10 hover:bg-violet-600 text-violet-400 hover:text-white transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Streak & User Details */}
      {profile && (
        <div className="flex items-center gap-4">
          {/* Streak Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-semibold">
            <Flame className="w-4.5 h-4.5 animate-pulse" />
            <span>{streak} day{streak !== 1 ? 's' : ''}</span>
          </div>

          {/* Quick Profile Circle (Visible on all screens) */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white uppercase shadow-md select-none"
            style={{ backgroundColor: profile.avatar_color || '#6366f1' }}
          >
            {profile.display_name?.charAt(0) || '?'}
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
