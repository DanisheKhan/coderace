import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useProgressStore } from '../../store/progressStore';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  TableProperties, 
  Trophy, 
  BarChart3, 
  LogOut,
  X,
  Code2,
  Award
} from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { fetchProfiles, fetchProgress, subscribeToRealtime } = useProgressStore();
  const { profile, signOut } = useAuth();

  useEffect(() => {
    fetchProfiles();
    fetchProgress();
    const unsubscribe = subscribeToRealtime();
    return () => unsubscribe();
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(v => !v);

  const navItems = [
    { name: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard },
    { name: 'My Sheet',    path: '/sheet',        icon: TableProperties },
    { name: 'Leaderboard', path: '/leaderboard',  icon: Trophy },
    { name: 'Compare',     path: '/compare',      icon: BarChart3 },
    { name: 'Achievements', path: '/achievements', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] flex text-zinc-100 relative">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={toggleMobileMenu}
        >
          <div
            className="w-64 max-w-[82vw] h-full bg-[#111113] border-r border-[#1f1f23] flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 h-[56px] sm:h-[60px] border-b border-[#1f1f23] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-500/20">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
                  CodeRace
                </span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors touch-target flex items-center justify-center"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
              <p className="section-label px-3 mb-2.5">Menu</p>
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={toggleMobileMenu}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer select-none active:scale-[0.98]
                    ${isActive
                      ? 'bg-violet-500/15 text-violet-400 font-semibold'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Profile footer */}
            {profile && (
              <div className="p-3 border-t border-[#1f1f23] shrink-0 bg-[#0d0d0f]">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white uppercase text-sm shrink-0 overflow-hidden border border-white/10"
                    style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#6366f1') }}
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                    ) : (
                      profile.display_name?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate leading-tight">{profile.display_name}</p>
                    <p className="text-xxs text-zinc-500 mt-0.5">DSA Racer</p>
                  </div>
                </div>
                <button
                  onClick={() => { toggleMobileMenu(); signOut(); }}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer transition-colors border border-rose-500/20 active:scale-[0.98]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        <TopBar toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
        <main className="flex-1 p-3 xs:p-4 sm:p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
