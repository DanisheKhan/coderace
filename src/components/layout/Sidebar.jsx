import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  TableProperties, 
  Trophy, 
  BarChart3, 
  LogOut,
  Code2,
  Award,
  Settings,
  ShieldAlert,
  Keyboard,
  ChevronLeft,
  ChevronRight,
  Brain,
  BookOpen,
  Users
} from 'lucide-react';
import EditProfileModal from '../EditProfileModal';
import FollowersModal from '../FollowersModal';
import { getPendingRequests } from '../../lib/followService';
import { useProgressStore } from '../../store/progressStore';
import { motion, AnimatePresence } from 'framer-motion';
import { APPLE_EASE } from '../../lib/animations';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { profile, signOut } = useAuth();
  const { profiles } = useProgressStore();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchCount = () => {
      if (profile?.id) {
        getPendingRequests(profile.id).then(({ data }) => {
          setPendingCount(data ? data.length : 0);
        });
      }
    };
    fetchCount();
    window.addEventListener('follow-system-changed', fetchCount);
    return () => window.removeEventListener('follow-system-changed', fetchCount);
  }, [profile?.id]);

  const navItems = [
    { name: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard },
    { name: 'My Sheet',    path: '/sheet',        icon: TableProperties },
    { name: 'Leaderboard', path: '/leaderboard',  icon: Trophy },
    { name: 'Compare',     path: '/compare',      icon: BarChart3 },
    { name: 'Connections', path: '/connections',  icon: Users, badge: pendingCount > 0 ? pendingCount : null },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Typing',      path: '/typing',       icon: Keyboard },
    { name: 'Java Quiz',   path: '/quiz',         icon: Brain },
    { name: 'Java Data Structures', path: '/collections', icon: BookOpen },
  ];

  return (
    <>
      <motion.aside 
        animate={{ width: isCollapsed ? 72 : 232 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="hidden md:flex bg-[#09090b] border-r border-zinc-800/80 flex-col h-screen sticky top-0 z-40 relative font-sans transform-gpu"
      >
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-zinc-800/80 shrink-0">
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-9 h-9 mx-auto rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 transition-all cursor-pointer shadow-sm group"
              title="Expand sidebar"
            >
              <Code2 className="w-4.5 h-4.5 text-violet-400 group-hover:hidden" />
              <ChevronRight className="w-4.5 h-4.5 text-white hidden group-hover:block" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 shrink-0 shadow-sm">
                  <Code2 className="w-4 h-4 text-violet-400" />
                </div>
                <span className="font-bold text-base tracking-tight text-white whitespace-nowrap truncate font-mono">
                  Code<span className="text-violet-400">Race</span>
                </span>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0 active:scale-95"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-x-hidden relative">
          <AnimatePresence initial={false}>
            {isCollapsed ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-t border-zinc-800 my-4 mx-1.5" 
              />
            ) : (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: APPLE_EASE }}
                className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-3 mb-3 block select-none"
              >
                Menu
              </motion.p>
            )}
          </AnimatePresence>

          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) => `
                relative flex items-center transition-all cursor-pointer select-none text-xs font-medium rounded-lg
                ${isCollapsed 
                  ? 'justify-center w-10 h-10 mx-auto' 
                  : 'gap-3 px-3 py-2 w-full'
                }
                ${isActive
                  ? 'text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Apple Smooth Active Background Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-lg -z-0 shadow-sm"
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-center">
                    <item.icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'text-violet-400 scale-105' : ''}`} />
                    {item.badge && isCollapsed && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-1 text-[8px] font-bold rounded-full bg-violet-600 text-white flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2, ease: APPLE_EASE }}
                        className="relative z-10 flex-1 flex items-center justify-between min-w-0"
                      >
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-violet-600 text-white leading-none shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </motion.aside>

      <FollowersModal
        isOpen={isFollowersOpen}
        onClose={() => setIsFollowersOpen(false)}
        userId={profile?.id}
      />
    </>
  );
};

export default Sidebar;
