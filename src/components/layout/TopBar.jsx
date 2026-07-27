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
  Eye,
  Settings,
  LogOut,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import EditProfileModal from '../EditProfileModal';
import UserProfileModal from '../UserProfileModal';

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

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Close dropdown & mobile search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowResults(false);
        setIsMobileSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
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
    setIsMobileSearchOpen(false);
  };

  const openMobileSearch = () => {
    setIsMobileSearchOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 50);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
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
    <>
      <header className="h-[56px] sm:h-[60px] border-b border-[#1f1f23] bg-[#111113]/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-5 sticky top-0 z-30 w-full">
        
        {/* Expanded Mobile Search Overlay */}
        {isMobileSearchOpen ? (
          <div className="absolute inset-0 bg-[#0d0d0f]/95 backdrop-blur-xl z-40 px-3 flex items-center gap-2 animate-fadeIn border-b border-violet-500/20" ref={dropdownRef}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search problem to quick solve…"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-zinc-100 placeholder:text-zinc-500 focus:outline-none border-violet-500/30"
              />
            </div>
            <button
              onClick={closeMobileSearch}
              className="w-8 h-8 rounded-xl bg-zinc-800/60 border border-white/[0.08] text-zinc-400 hover:text-zinc-100 transition-colors flex items-center justify-center shrink-0 touch-target"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Mobile Search Dropdown Results */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-3 right-3 mt-1.5 rounded-xl border border-white/[0.08] bg-[#0d0d0f] shadow-2xl shadow-black/90 p-1.5 z-50">
                {searchResults.map((q) => {
                  const done = isQuestionDone(q.id);
                  return (
                    <div
                      key={q.id}
                      className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] rounded-lg transition-colors"
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
                          className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500 text-violet-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0 border border-violet-500/20"
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
        ) : (
          <>
            {/* Left: Mobile hamburger + page title */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors touch-target flex items-center justify-center"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {/* Desktop: dynamic page name */}
              <span className="font-semibold text-sm text-zinc-300 max-md:hidden">{pageTitle}</span>
              {/* Mobile: brand name */}
              <span className="font-bold text-base bg-gradient-to-r from-violet-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent md:hidden tracking-tight">
                CodeRace
              </span>
            </div>

            {/* Desktop Center: Quick Solve Search */}
            <div className="hidden sm:block flex-1 max-w-[360px] mx-5 relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Quick log: Today I solved…"
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-500 focus:outline-none truncate"
                />
              </div>

              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-[#1f1f23] bg-[#111113] shadow-2xl shadow-black/80 p-1.5 z-50 animate-fadeIn">
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
                            className="p-1.5 rounded-md bg-violet-500/10 hover:bg-violet-500 text-violet-400 hover:text-white transition-all cursor-pointer touch-target flex items-center justify-center"
                            title="Mark Solved"
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

            {/* Right: Search Icon (Mobile) + Streak + Avatar */}
            {profile && (
              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile Search Button */}
                <button
                  onClick={openMobileSearch}
                  className="sm:hidden w-8 h-8 rounded-xl bg-[#18181b]/80 border border-white/[0.08] hover:border-violet-500/30 text-zinc-400 hover:text-violet-300 hover:bg-violet-500/10 transition-all flex items-center justify-center cursor-pointer touch-target shrink-0"
                  aria-label="Search"
                  title="Quick log solved problem"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>

                {/* Streak */}
                <div className="h-8 px-2.5 rounded-xl bg-[#18181b]/80 border border-white/[0.08] text-zinc-300 text-xs font-medium flex items-center gap-1.5 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{streak}d</span>
                </div>

                {/* Avatar with Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <div
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white uppercase text-xs sm:text-sm shadow-sm select-none overflow-hidden cursor-pointer hover:ring-2 hover:ring-violet-500/50 transition-all border border-white/10 shrink-0"
                    style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#6366f1') }}
                    title="User Menu"
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                    ) : (
                      profile.display_name?.charAt(0) || '?'
                    )}
                  </div>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/[0.08] bg-[#0d0d0f]/95 backdrop-blur-xl shadow-2xl shadow-black/90 p-1.5 z-50 animate-fadeIn">
                      <div className="px-2.5 py-1.5 border-b border-white/[0.04] mb-1">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">{profile.display_name}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsProfileOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-violet-400" />
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsEditProfileOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-zinc-500" />
                        Edit Profile
                      </button>
                      <div className="h-px bg-white/[0.05] my-1" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/[0.05] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </header>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {isProfileOpen && profile && (
        <UserProfileModal
          user={profile}
          progress={progress}
          questions={questions}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
};

export default TopBar;
