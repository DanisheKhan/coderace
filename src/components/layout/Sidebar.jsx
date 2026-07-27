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
  Keyboard
} from 'lucide-react';
import EditProfileModal from '../EditProfileModal';
import { useProgressStore } from '../../store/progressStore';

const Sidebar = () => {
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
      <aside className="w-[232px] bg-[#111113] border-r border-[#1f1f23] flex flex-col h-screen sticky top-0 md:flex z-20 max-md:hidden">
        {/* Brand */}
        <div className="px-5 h-[60px] flex items-center gap-2.5 border-b border-[#1f1f23]">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-500/20 shrink-0">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
            CodeRace
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="section-label px-3 mb-3">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                ${isActive
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200'
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

        {/* Profile Footer */}
        {profile && (
          <div className="p-3 border-t border-[#1f1f23]">
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
