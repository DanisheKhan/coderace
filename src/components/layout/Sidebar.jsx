import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  TableProperties, 
  Trophy, 
  BarChart3, 
  LogOut,
  Code2
} from 'lucide-react';

const Sidebar = () => {
  const { profile, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Sheet', path: '/sheet', icon: TableProperties },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Compare', path: '/compare', icon: BarChart3 }
  ];

  return (
    <aside className="w-[240px] bg-[#121214] border-r border-zinc-800 flex flex-col h-screen sticky top-0 md:flex z-20 max-md:hidden">
      {/* Brand Logo */}
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/10">
          <Code2 className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
          CodeRace
        </span>
      </div>

      {/* Nav Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group cursor-pointer
              ${isActive 
                ? 'bg-violet-600/15 text-violet-400 border-l-2 border-violet-500 shadow-sm shadow-violet-500/5' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }
            `}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile Details */}
      {profile && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/10">
          <div className="flex items-center gap-3 px-2 py-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white uppercase shadow-md"
              style={{ backgroundColor: profile.avatar_color || '#6366f1' }}
            >
              {profile.display_name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">{profile.display_name}</p>
              <p className="text-xs text-zinc-500 truncate">Racer Profile</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 text-xs font-semibold cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
