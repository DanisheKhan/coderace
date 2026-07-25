import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  TableProperties, 
  Trophy, 
  BarChart3, 
  LogOut,
  Code2,
  Award
} from 'lucide-react';

const Sidebar = () => {
  const { profile, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard },
    { name: 'My Sheet',    path: '/sheet',        icon: TableProperties },
    { name: 'Leaderboard', path: '/leaderboard',  icon: Trophy },
    { name: 'Compare',     path: '/compare',      icon: BarChart3 },
    { name: 'Achievements', path: '/achievements', icon: Award },
  ];

  return (
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
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile */}
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
              <p className="text-xxs text-zinc-500 truncate mt-0.5">Racer</p>
            </div>
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
  );
};

export default Sidebar;
