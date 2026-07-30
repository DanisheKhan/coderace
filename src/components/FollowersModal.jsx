import React, { useState, useEffect } from 'react';
import { Users, X, Search, UserCheck } from 'lucide-react';
import { getFollowersList, getFollowingList } from '../lib/followService';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants } from '../lib/animations';

export default function FollowersModal({ isOpen, onClose, userId, initialTab = 'followers' }) {
  const [tab, setTab] = useState(initialTab); // 'followers' | 'following'
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      Promise.all([
        getFollowersList(userId),
        getFollowingList(userId)
      ]).then(([followersData, followingData]) => {
        setFollowers(followersData || []);
        setFollowing(followingData || []);
        setLoading(false);
      });
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const currentList = tab === 'followers' ? followers : following;
  const filteredList = currentList.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.display_name && u.display_name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q))
    );
  });

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="show"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md cursor-pointer font-sans"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] cursor-default"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex flex-col gap-3 p-4 border-b border-zinc-800/80 bg-[#09090b]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                  Connections
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setTab('followers')}
                className={`py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer select-none truncate flex items-center justify-center gap-1.5 ${
                  tab === 'followers'
                    ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Followers</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-zinc-800/50 text-zinc-300 font-mono">
                  {followers.length}
                </span>
              </button>

              <button
                onClick={() => setTab('following')}
                className={`py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer select-none truncate flex items-center justify-center gap-1.5 ${
                  tab === 'following'
                    ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Following</span>
                <span className="px-1.5 py-0.2 text-[10px] rounded bg-zinc-800/50 text-zinc-300 font-mono">
                  {following.length}
                </span>
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${tab}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>

          {/* User List Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-[220px]">
            {loading ? (
              <div className="py-12 text-center text-zinc-500 space-y-2 font-mono">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Loading connections...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-1 font-mono">
                <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-zinc-300 text-xs">No {tab} found</p>
                <p className="text-[10px] text-zinc-500">
                  {search ? 'Try a different search query.' : `User has no ${tab} yet.`}
                </p>
              </div>
            ) : (
              filteredList.map(u => {
                const displayName = u.display_name || u.username || 'Racer';
                const username = u.username ? `@${u.username}` : '';
                const avatarColor = u.avatar_color || '#6366f1';

                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-2.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all group"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs uppercase overflow-hidden border border-zinc-700 shrink-0 shadow-sm"
                      style={{ backgroundColor: u.avatar_url ? 'transparent' : avatarColor }}
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        displayName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                        {displayName}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 truncate">
                        {username || `ID: ${u.id.slice(0, 8)}...`}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
