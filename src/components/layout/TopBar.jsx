import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuestions } from '../../contexts/QuestionsContext';
import { useProgressStore } from '../../store/progressStore';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  X, 
  Plus, 
  CheckCircle2, 
  Flame,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

// Map routes → page titles
const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/sheet':       'My Sheet',
  '/leaderboard': 'Leaderboard',
  '/compare':     'Compare',
};

const TopBar = ({ toggleMobileMenu, isMobileMenuOpen }) => {
  const { profile, signOut } = useAuth();
  const { questions } = useQuestions();
  const { progress, upsertProgress } = useProgressStore();
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'CodeRace';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    const filtered = questions
      .filter(q => q.problem_name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleQuickSolve = async (questionId) => {
    if (!profile) return;
    await upsertProgress(profile.id, questionId, { status: 'done' });
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const isQuestionDone = (qId) => {
    if (!profile) return false;
    const p = progress.find(p => p.user_id === profile.id && p.question_id === qId);
    return p?.status === 'done';
  };

  // Streak calculation
  const calculateStreak = () => {
    if (!profile) return 0;
    const doneDates = progress
      .filter(p => p.user_id === profile.id && p.status === 'done')
      .map(p => {
        const d = new Date(p.updated_at);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      });
    if (doneDates.length === 0) return 0;
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

  const streak = calculateStreak();

  return (
    <header className="h-[60px] border-b border-[#1f1f23] bg-[#111113]/90 backdrop-blur-md flex items-center justify-between px-5 sticky top-0 z-30 w-full">
      {/* Left: Mobile hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {/* Desktop: dynamic page name */}
        <span className="font-semibold text-sm text-zinc-300 max-md:hidden">{pageTitle}</span>
        {/* Mobile: brand name */}
        <span className="font-bold text-base bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent md:hidden">
          CodeRace
        </span>
      </div>

      {/* Center: Quick Solve Search */}
      <div className="flex-1 max-w-[360px] mx-5 relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Quick log: Today I solved…"
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-[#1f1f23] bg-[#111113] shadow-2xl shadow-black/40 p-1.5 z-50">
            {searchResults.map((q) => {
              const done = isQuestionDone(q.id);
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-zinc-800/50 rounded-lg transition-colors group/item"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xxs text-zinc-500 truncate">{q.topic}{q.subtopic ? ` · ${q.subtopic}` : ''}</p>
                    <p className="text-xs text-zinc-200 font-medium truncate mt-0.5">{q.problem_name}</p>
                  </div>
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <button
                      onClick={() => handleQuickSolve(q.id)}
                      className="p-1 rounded-md bg-violet-500/10 hover:bg-violet-500 text-violet-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Streak + Avatar */}
      {profile && (
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{streak}d</span>
          </div>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white uppercase text-sm shadow-sm select-none overflow-hidden"
            style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#6366f1') }}
          >
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
            ) : (
              profile.display_name?.charAt(0) || '?'
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
