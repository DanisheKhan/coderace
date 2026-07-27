import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useOutlet } from 'react-router-dom';
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
  Award,
  ShieldAlert,
  UserPlus,
  Keyboard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const { profiles, fetchProfiles, fetchProgress, subscribeToRealtime } = useProgressStore();
  const { profile, signOut } = useAuth();
  const [toasts, setToasts] = useState([]);
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  const outlet = useOutlet();

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  useEffect(() => {
    fetchProfiles();
    fetchProgress();
    
    // Listen for new profiles if the user is an admin
    if (profile?.is_admin) {
      useProgressStore.setState({
        onNewProfile: (newProfile) => {
          if (!newProfile.approved) {
            addToast({
              title: 'New Access Request',
              message: `${newProfile.display_name} is waiting for account activation.`,
              profile: newProfile
            });
          }
        }
      });
    }

    const unsubscribe = subscribeToRealtime();
    return () => {
      unsubscribe();
      useProgressStore.setState({ onNewProfile: null });
    };
  }, [profile]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(v => !v);

  const pendingCount = profiles.filter(p => !p.approved && !p.is_admin).length;

  const navItems = [
    { name: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard },
    { name: 'My Sheet',    path: '/sheet',        icon: TableProperties },
    { name: 'Leaderboard', path: '/leaderboard',  icon: Trophy },
    { name: 'Compare',     path: '/compare',      icon: BarChart3 },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Typing',      path: '/typing',       icon: Keyboard },
  ];

  if (profile?.is_admin) {
    navItems.push({
      name: 'Approvals',
      path: '/admin',
      icon: ShieldAlert,
      badge: pendingCount > 0 ? pendingCount : null
    });
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex text-zinc-100 relative">
      {/* Desktop Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
            onClick={toggleMobileMenu}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-64 max-w-[82vw] h-full bg-[#111113] border-r border-[#1f1f23] flex flex-col shadow-2xl"
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
                  className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors touch-target flex items-center justify-center animate-none"
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
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-violet-600 text-zinc-100 leading-none">
                        {item.badge}
                      </span>
                    )}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        <TopBar toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
        <main ref={mainRef} className="flex-1 p-3 xs:p-4 sm:p-6 min-w-0 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {outlet && React.cloneElement(outlet, { key: pathname })}
          </AnimatePresence>
        </main>
      </div>
      
      {/* Real-time Toasts Container */}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-3 max-w-xs sm:max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="pointer-events-auto w-full p-4 rounded-xl border border-violet-500/20 bg-[#0d0d0f]/90 backdrop-blur-md shadow-2xl flex items-start gap-3.5 relative overflow-hidden"
            >
              {/* Accent glow on the left border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500" />
              
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-400">
                <UserPlus className="w-4.5 h-4.5" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-zinc-100">{toast.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{toast.message}</p>
                
                {/* Approve actions directly in Toast */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('profiles')
                          .update({ approved: true })
                          .eq('id', toast.profile.id);
                        if (error) throw error;
                        removeToast(toast.id);
                        fetchProfiles(); // Refresh local list
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold transition-all cursor-pointer shadow-sm shadow-violet-600/20"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-semibold transition-all cursor-pointer border border-white/[0.04]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              
              {/* Dismiss button top right */}
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;
