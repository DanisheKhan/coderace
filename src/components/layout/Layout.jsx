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
  Code2
} from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { fetchProfiles, fetchProgress, subscribeToRealtime } = useProgressStore();
  const { profile, signOut } = useAuth();

  useEffect(() => {
    // Initial data fetch
    fetchProfiles();
    fetchProgress();

    // Subscribe to realtime database changes
    const unsubscribe = subscribeToRealtime();

    return () => {
      unsubscribe();
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Sheet', path: '/sheet', icon: TableProperties },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Compare', path: '/compare', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] flex text-zinc-100 relative">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Mobile Sidebar/Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={toggleMobileMenu}>
          <div 
            className="w-64 h-full bg-[#121214] border-r border-zinc-800 flex flex-col p-6 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-md">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  CodeRace
                </span>
              </div>
              <button 
                onClick={toggleMobileMenu} 
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 py-6 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={toggleMobileMenu}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-violet-600/15 text-violet-400 border-l-2 border-violet-500' 
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Profile summary */}
            {profile && (
              <div className="pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-3 py-2">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white uppercase shadow-md"
                    style={{ backgroundColor: profile.avatar_color || '#6366f1' }}
                  >
                    {profile.display_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{profile.display_name}</p>
                    <p className="text-xs text-zinc-500 truncate">Racer</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toggleMobileMenu();
                    signOut();
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
        <main className="flex-1 p-6 max-md:p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
