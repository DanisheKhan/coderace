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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleMobileMenu}
        >
          <div
            className="w-60 h-full bg-[#111113] border-r border-[#1f1f23] flex flex-col animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 h-[60px] border-b border-[#1f1f23]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
                  CodeRace
                </span>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-5 space-y-0.5">
              <p className="section-label px-3 mb-3">Menu</p>
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={toggleMobileMenu}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                    ${isActive
                      ? 'bg-violet-500/10 text-violet-400'
                      : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'
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
              <div className="p-3 border-t border-[#1f1f23]">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white uppercase text-sm shrink-0 overflow-hidden"
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
                    <p className="text-xxs text-zinc-500 mt-0.5">Racer</p>
                  </div>
                </div>
                <button
                  onClick={() => { toggleMobileMenu(); signOut(); }}
                  className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 text-xs font-medium cursor-pointer transition-colors"
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
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopBar toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
        <main className="flex-1 p-6 max-md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
