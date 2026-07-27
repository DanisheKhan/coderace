import React, { useState } from 'react';
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
  Brain
} from 'lucide-react';
import EditProfileModal from '../EditProfileModal';
import { useProgressStore } from '../../store/progressStore';
import { motion, AnimatePresence } from 'framer-motion';
import { APPLE_EASE } from '../../lib/animations';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { profile, signOut } = useAuth();
  const { profiles } = useProgressStore();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const pendingCount = profiles.filter(p => !p.approved && !p.is_admin).length;

  const navItems = [
    { name: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard },
    { name: 'My Sheet',    path: '/sheet',        icon: TableProperties },
    { name: 'Leaderboard', path: '/leaderboard',  icon: Trophy },
    { name: 'Compare',     path: '/compare',      icon: BarChart3 },
    { name: 'Achievements', path: '/achievements', icon: Award },
    { name: 'Typing',      path: '/typing',       icon: Keyboard },
    { name: 'Java Quiz',   path: '/quiz',         icon: Brain },
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
    <>
      <motion.aside 
        animate={{ width: isCollapsed ? 72 : 232 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="bg-[#09090b] border-r border-zinc-800/80 flex flex-col h-screen sticky top-0 md:flex z-40 max-md:hidden relative font-sans transform-gpu"
      >
        {/* Brand Header */}
        <div className={`h-14 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} border-b border-zinc-800/80 shrink-0`}>
          <div className="flex items-center gap-2.5">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-100 shrink-0 shadow-sm"
            >
              <Code2 className="w-4 h-4 text-violet-400" />
            </motion.div>
            {!isCollapsed && (
              <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
                Code<span className="text-violet-400">Race</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0 active:scale-95"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
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

        {/* Profile Footer */}
        {profile && (
          <div className="p-3 border-t border-zinc-800/80">
            <AnimatePresence initial={false} mode="wait">
              {isCollapsed ? (
                <motion.div 
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.18, ease: APPLE_EASE }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditProfileOpen(true)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white uppercase text-xs shrink-0 overflow-hidden cursor-pointer border border-zinc-700 hover:border-zinc-500 transition-colors shadow-sm"
                    style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#6366f1') }}
                    title={`${profile.display_name} - Edit profile`}
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                    ) : (
                      profile.display_name?.charAt(0) || '?'
                    )}
                  </motion.div>
                  <button
                    onClick={() => signOut()}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer active:scale-95"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="expanded"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: APPLE_EASE }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditProfileOpen(true)}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-zinc-900/70 border border-transparent hover:border-zinc-800 cursor-pointer group transition-all select-none"
                    title="Edit profile"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white uppercase text-xs shrink-0 overflow-hidden border border-zinc-700 shadow-sm"
                      style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#6366f1') }}
                    >
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                      ) : (
                        profile.display_name?.charAt(0) || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-100 truncate leading-tight group-hover:text-violet-400 transition-colors">{profile.display_name}</p>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">Edit profile ✎</p>
                    </div>
                    <Settings className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </motion.div>
                  <button
                    onClick={() => signOut()}
                    className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 text-xs font-medium cursor-pointer transition-colors active:scale-98"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.aside>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </>
  );
};

export default Sidebar;
