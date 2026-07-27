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
  ChevronRight
} from 'lucide-react';
import EditProfileModal from '../EditProfileModal';
import { useProgressStore } from '../../store/progressStore';

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
      <aside className={`${isCollapsed ? 'w-[72px]' : 'w-[232px]'} bg-[#111113] border-r border-[#1f1f23] flex flex-col h-screen sticky top-0 md:flex z-40 max-md:hidden transition-all duration-300 relative`}>
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[18px] w-6 h-6 rounded-full bg-[#111113] border border-[#1f1f23] flex items-center justify-center text-zinc-400 hover:text-zinc-100 shadow-md transition-all z-50 hover:scale-110 cursor-pointer"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Brand */}
        <div className={`h-[60px] flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-5'} border-b border-[#1f1f23] transition-all`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-500/20 shrink-0">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent animate-fadeIn">
                CodeRace
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {isCollapsed ? (
            <div className="border-t border-[#1f1f23] my-4 mx-1.5 transition-all" />
          ) : (
            <p className="section-label px-3 mb-3 animate-fadeIn">Menu</p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) => `
                flex items-center transition-all cursor-pointer select-none
                ${isCollapsed 
                  ? 'justify-center w-10 h-10 mx-auto rounded-xl' 
                  : 'gap-3 px-3 py-2.5 rounded-xl w-full'
                }
                ${isActive
                  ? 'bg-violet-500/10 text-violet-400 font-semibold'
                  : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'
                }
              `}
            >
              <div className="relative flex items-center justify-center">
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                {item.badge && isCollapsed && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-1 text-[8px] font-black rounded-full bg-violet-600 text-zinc-100 flex items-center justify-center scale-90">
                    {item.badge}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate animate-fadeIn">{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-violet-600 text-zinc-100 leading-none">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile Footer */}
        {profile && (
          <div className="p-3 border-t border-[#1f1f23] transition-all">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white uppercase text-sm shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-violet-500/50 transition-all border border-white/10"
                  style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#6366f1') }}
                  title={`${profile.display_name} - Edit profile`}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                  ) : (
                    profile.display_name?.charAt(0) || '?'
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-zinc-800/50 cursor-pointer group transition-colors select-none"
                  title="Edit profile"
                >
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
                    <p className="text-sm font-semibold text-zinc-100 truncate leading-tight group-hover:text-violet-400 transition-colors">{profile.display_name}</p>
                    <p className="text-xxs text-zinc-500 truncate mt-0.5">Edit profile ✎</p>
                  </div>
                  <Settings className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 text-xs font-medium cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </>
            )}
          </div>
        )}
      </aside>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </>
  );
};

export default Sidebar;
