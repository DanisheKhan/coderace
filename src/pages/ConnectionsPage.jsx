import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { 
  Users, Search, UserPlus, UserCheck, Clock, Check, X, 
  Sparkles, ShieldCheck, Flame, UserX, UserSearch, ArrowUpRight
} from 'lucide-react';
import { 
  getFollowersList, 
  getFollowingList, 
  getPendingRequests, 
  respondToFollowRequest, 
  sendFollowRequest, 
  cancelFollowRequest, 
  getFollowStatus 
} from '../lib/followService';
import UserProfileModal from '../components/UserProfileModal';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp } from '../lib/animations';

export default function ConnectionsPage() {
  const { profile } = useAuth();
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();

  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'followers' | 'following' | 'requests'
  const [searchQuery, setSearchQuery] = useState('');
  
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [followStatuses, setFollowStatuses] = useState({}); // userId -> status ('none'|'pending'|'accepted')
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  const currentUserId = profile?.id;

  const loadData = async () => {
    if (!currentUserId) return;
    
    try {
      const [followersData, followingData, pendingData, myFollowsRes] = await Promise.all([
        getFollowersList(currentUserId),
        getFollowingList(currentUserId),
        getPendingRequests(currentUserId),
        supabase
          .from('follows')
          .select('following_id, status')
          .eq('follower_id', currentUserId)
      ]);

      setFollowers(Array.isArray(followersData) ? followersData : []);
      setFollowing(Array.isArray(followingData) ? followingData : []);
      setPendingRequests(Array.isArray(pendingData) ? pendingData : (pendingData?.data || []));

      const statuses = {};
      if (myFollowsRes.data) {
        myFollowsRes.data.forEach(f => {
          statuses[f.following_id] = f.status;
        });
      }
      setFollowStatuses(statuses);
    } catch (err) {
      console.error('Error loading connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('follow-system-changed', loadData);
    return () => window.removeEventListener('follow-system-changed', loadData);
  }, [currentUserId, profiles.length]);

  const handleFollowAction = async (targetUserId, e) => {
    if (e) e.stopPropagation();
    if (!currentUserId || !targetUserId || actionLoading[targetUserId]) return;

    setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
    const currentStatus = followStatuses[targetUserId] || 'none';

    if (currentStatus === 'none') {
      const { error } = await sendFollowRequest(currentUserId, targetUserId);
      if (!error) {
        setFollowStatuses(prev => ({ ...prev, [targetUserId]: 'pending' }));
      }
    } else {
      const { error } = await cancelFollowRequest(currentUserId, targetUserId);
      if (!error) {
        setFollowStatuses(prev => ({ ...prev, [targetUserId]: 'none' }));
        if (currentStatus === 'accepted') {
          setFollowing(prev => prev.filter(u => u.id !== targetUserId));
        }
      }
    }
    setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
  };

  const handleRequestResponse = async (requestId, accept, e) => {
    if (e) e.stopPropagation();
    const { error } = await respondToFollowRequest(requestId, accept);
    if (!error) {
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      await loadData();
    }
  };

  // Filter Discover Users (All registered users except self)
  const discoverUsers = useMemo(() => {
    return profiles.filter(u => u.id !== currentUserId);
  }, [profiles, currentUserId]);

  const filteredList = useMemo(() => {
    let rawList = [];
    if (activeTab === 'discover') rawList = discoverUsers;
    else if (activeTab === 'followers') rawList = followers;
    else if (activeTab === 'following') rawList = following;
    else if (activeTab === 'requests') rawList = pendingRequests;

    const list = Array.isArray(rawList) ? rawList : [];

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(item => {
      const u = activeTab === 'requests' ? (item?.follower || {}) : (item || {});
      const name = (u.display_name || '').toLowerCase();
      const username = (u.username || '').toLowerCase();
      const id = (u.id || '').toLowerCase();
      return name.includes(q) || username.includes(q) || id.includes(q);
    });
  }, [activeTab, discoverUsers, followers, following, pendingRequests, searchQuery]);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 font-sans"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 sm:pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-violet-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight font-mono">
              RACERS & CONNECTIONS
            </h1>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Discover racers, manage follow requests, and connect with peers across CodeRace.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase truncate">Discover</p>
            <p className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{discoverUsers.length}</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">registered racers</p>
          </div>
          <UserSearch className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 opacity-80 shrink-0" />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase truncate">Followers</p>
            <p className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{followers.length}</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">following you</p>
          </div>
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 opacity-80 shrink-0" />
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase truncate">Following</p>
            <p className="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">{following.length}</p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">you follow</p>
          </div>
          <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400 opacity-80 shrink-0" />
        </div>

        <div className={`p-3 sm:p-4 rounded-xl border flex items-center justify-between gap-2 ${
          pendingRequests.length > 0
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-zinc-900/60 border-zinc-800/80'
        }`}>
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase truncate">Requests</p>
            <p className={`text-lg sm:text-xl font-bold font-mono mt-0.5 ${pendingRequests.length > 0 ? 'text-amber-400' : 'text-white'}`}>
              {pendingRequests.length}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">pending action</p>
          </div>
          <Clock className={`w-4 h-4 sm:w-5 sm:h-5 opacity-80 shrink-0 ${pendingRequests.length > 0 ? 'text-amber-400' : 'text-zinc-500'}`} />
        </div>
      </div>

      {/* Tabs & Search Navigation Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800/80 p-2 sm:p-2.5 rounded-2xl">
        {/* Responsive Grid Tabs (2x2 on mobile, 4-col on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800/90 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
              activeTab === 'discover'
                ? 'bg-white text-zinc-950 font-bold shadow-md shadow-white/5'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
            }`}
          >
            <UserSearch className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Discover</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('followers')}
            className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
              activeTab === 'followers'
                ? 'bg-white text-zinc-950 font-bold shadow-md shadow-white/5'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
            }`}
          >
            <span className="truncate">Followers</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono shrink-0 ${
              activeTab === 'followers' ? 'bg-zinc-200 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}>
              {followers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
              activeTab === 'following'
                ? 'bg-white text-zinc-950 font-bold shadow-md shadow-white/5'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
            }`}
          >
            <span className="truncate">Following</span>
            <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono shrink-0 ${
              activeTab === 'following' ? 'bg-zinc-200 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}>
              {following.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none ${
              activeTab === 'requests'
                ? 'bg-white text-zinc-950 font-bold shadow-md shadow-white/5'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
            }`}
          >
            <span className="truncate">Requests</span>
            {pendingRequests.length > 0 ? (
              <span className="px-1.5 py-0.2 text-[10px] bg-indigo-500 text-white rounded-full font-mono font-bold shrink-0">
                {pendingRequests.length}
              </span>
            ) : (
              <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono shrink-0 ${
                activeTab === 'requests' ? 'bg-zinc-200 text-zinc-950 font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}>
                0
              </span>
            )}
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'discover' ? 'all racers' : activeTab}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800/90 rounded-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Main List Grid View */}
      {loading ? (
        <div className="py-20 text-center text-zinc-500 font-mono space-y-2">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">Loading racers & connections...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="py-20 text-center border border-zinc-800/80 rounded-2xl bg-zinc-900/40 space-y-2 font-mono">
          <Users className="w-10 h-10 text-zinc-700 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-bold text-zinc-300">No racers found</p>
          <p className="text-xs text-zinc-500">
            {searchQuery ? 'Try a different search query.' : `No racers currently listed in ${activeTab}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activeTab === 'requests' ? (
            // Requests Cards
            filteredList.map(req => {
              const follower = req.follower || {};
              const displayName = follower.display_name || follower.username || 'Racer';
              const username = follower.username ? `@${follower.username}` : '';
              const avatarColor = follower.avatar_color || '#6366f1';

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedUserModal(follower)}
                  className="p-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 rounded-xl transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm uppercase overflow-hidden border border-zinc-700 shrink-0 shadow-md"
                      style={{ backgroundColor: follower.avatar_url ? 'transparent' : avatarColor }}
                    >
                      {follower.avatar_url ? (
                        <img src={follower.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        {displayName}
                      </p>
                      <p className="text-xs font-mono text-zinc-500 truncate">{username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                    <button
                      onClick={(e) => handleRequestResponse(req.id, true, e)}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={(e) => handleRequestResponse(req.id, false, e)}
                      className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1 transition-all border border-zinc-800 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            // Discover / Followers / Following Cards
            filteredList.map(u => {
              const displayName = u.display_name || u.username || 'Racer';
              const username = u.username ? `@${u.username}` : '';
              const avatarColor = u.avatar_color || '#6366f1';
              const status = followStatuses[u.id] || 'none';
              const isProcessing = actionLoading[u.id];

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUserModal(u)}
                  className="p-4 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm uppercase overflow-hidden border border-zinc-700 shrink-0 shadow-md"
                      style={{ backgroundColor: u.avatar_url ? 'transparent' : avatarColor }}
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        displayName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {displayName}
                        </p>
                        {u.is_admin && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono text-zinc-400 bg-zinc-950 rounded border border-zinc-800 shrink-0">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs font-mono text-zinc-500 truncate mt-0.5">
                        {username || `ID: ${u.id.slice(0, 8)}...`}
                      </p>
                    </div>
                  </div>

                  {/* Follow Action Button */}
                  <button
                    onClick={(e) => handleFollowAction(u.id, e)}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50 ${
                      status === 'accepted'
                        ? 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                        : status === 'pending'
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {status === 'accepted' ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden xs:inline">Following</span>
                      </>
                    ) : status === 'pending' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden xs:inline">Requested</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* User Profile Modal when clicking any card */}
      {selectedUserModal && (
        <UserProfileModal
          user={selectedUserModal}
          progress={progress}
          questions={questions}
          onClose={() => {
            setSelectedUserModal(null);
            loadData();
          }}
        />
      )}
    </motion.div>
  );
}
