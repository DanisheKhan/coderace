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

import EditProfileModal from '../EditProfileModal';
import UserProfileModal from '../UserProfileModal';
import { motion, AnimatePresence } from 'framer-motion';

// Map routes → page titles
const PAGE_TITLES = {
  '/dashboard':   'Dashboard',
  '/sheet':       'My Sheet',
  '/leaderboard': 'Leaderboard',
  '/compare':     'Compare',
  '/achievements':'Achievements',
  '/typing':      'Typing',
  '/quiz':        'Java Quiz',
  '/admin':       'Approvals'
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
    if (!doneDates.length) return 0;
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
      <header className="h-[56px] border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 w-full font-sans">
        
        {/* Expanded Mobile Search Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-[#09090b] z-40 px-3 flex items-center gap-2 border-b border-zinc-800" 
              ref={dropdownRef}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search problem to quick solve…"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                />
              </div>
              <button
                onClick={closeMobileSearch}
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center justify-center shrink-0"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Mobile Search Dropdown Results */}
              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-3 right-3 mt-1.5 rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl p-1.5 z-50"
                  >
                    {searchResults.map((q) => {
                      const done = isQuestionDone(q.id);
                      return (
                        <div
                          key={q.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-zinc-800/60 rounded-md transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-[10px] text-zinc-500 truncate font-mono">{q.topic}{q.subtopic ? ` · ${q.subtopic}` : ''}</p>
                            <p className="text-xs text-zinc-200 font-medium truncate mt-0.5">{q.problem_name}</p>
                          </div>
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <button
                              onClick={() => handleQuickSolve(q.id)}
                              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer border border-zinc-700 shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {!isMobileSearchOpen && (
          <>
            {/* Left: Mobile hamburger + page title */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors flex items-center justify-center"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              {/* Desktop: dynamic page name */}
              <span className="font-semibold text-xs text-zinc-300 max-md:hidden uppercase tracking-wider font-mono">{pageTitle}</span>
              {/* Mobile: brand name */}
              <span className="font-bold text-base text-white md:hidden tracking-tight">
                Code<span className="text-violet-400">Race</span>
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
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-zinc-900/80 border border-zinc-800 focus:border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:outline-none truncate transition-colors"
                />
              </div>

              <AnimatePresence>
                {showResults && searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl p-1.5 z-50"
                  >
                    {searchResults.map((q) => {
                      const done = isQuestionDone(q.id);
                      return (
                        <div
                          key={q.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-zinc-800/70 rounded-md transition-colors"
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-[10px] text-zinc-500 truncate font-mono">{q.topic}{q.subtopic ? ` · ${q.subtopic}` : ''}</p>
                            <p className="text-xs text-zinc-200 font-medium truncate mt-0.5">{q.problem_name}</p>
                          </div>
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <button
                              onClick={() => handleQuickSolve(q.id)}
                              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-zinc-700"
                              title="Mark Solved"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Search Icon (Mobile) + Streak + Avatar */}
            {profile && (
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Mobile Search Button */}
                <button
                  onClick={openMobileSearch}
                  className="sm:hidden w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="Search"
                  title="Quick log solved problem"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>

                {/* Streak Pill */}
                <div className="h-7 px-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-medium flex items-center gap-1.5 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>{streak}d</span>
                </div>

                {/* Avatar with Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <div
                    onClick={() => setIsUserMenuOpen(prev => !prev)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white uppercase text-xs shadow-sm select-none overflow-hidden cursor-pointer border border-zinc-700 hover:border-zinc-500 transition-colors shrink-0"
                    style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#6366f1') }}
                    title="User Menu"
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                    ) : (
                      profile.display_name?.charAt(0) || '?'
                    )}
                  </div>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl p-1.5 z-50"
                      >
                        <div className="px-2.5 py-1.5 border-b border-zinc-800 mb-1">
                          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Signed in as</p>
                          <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">{profile.display_name}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsProfileOpen(true);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          View Profile
                        </button>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsEditProfileOpen(true);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-zinc-400" />
                          Edit Profile
                        </button>
                        <div className="h-px bg-zinc-800 my-1" />
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
