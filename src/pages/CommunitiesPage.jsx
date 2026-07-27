import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { supabase } from '../lib/supabase';
import { 
  fetchCommunities, 
  createCommunity, 
  requestToJoinCommunity, 
  sendCommunityInvite, 
  acceptCommunityInvite, 
  declineOrLeaveCommunity, 
  approveMemberRequest, 
  rejectMemberRequest 
} from '../lib/communityService';
import UserProfileModal from '../components/UserProfileModal';
import { 
  Users, Plus, Search, Shield, Lock, Unlock, Crown, Award, Flame, Trophy, Bell,
  CheckCircle2, XCircle, UserPlus, Check, X, Eye, ExternalLink, Sparkles, AlertCircle, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../lib/animations';

const Avatar = ({ user, size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6 text-[9px] rounded-md',
    md: 'w-9 h-9 text-sm rounded-xl',
    lg: 'w-12 h-12 text-lg rounded-2xl',
  };
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center font-bold text-white uppercase shrink-0 overflow-hidden border border-white/10`}
      style={{ backgroundColor: user?.avatar_url ? 'transparent' : (user?.avatar_color || '#8b5cf6') }}
    >
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
      ) : (
        user?.display_name?.charAt(0) || '?'
      )}
    </div>
  );
};

export default function CommunitiesPage() {
  const { profile: currentProfile } = useAuth();
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();

  const [communities, setCommunities] = useState([]);
  const [selectedCommId, setSelectedCommId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals & Panels
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedModalUser, setSelectedModalUser] = useState(null);

  // Create Form State
  const [newCommName, setNewCommName] = useState('');
  const [newCommId, setNewCommId] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommColor, setNewCommColor] = useState('#8b5cf6');
  const [newCommIsPrivate, setNewCommIsPrivate] = useState(true);
  const [createError, setCreateError] = useState('');

  // Admin Invite State
  const [inviteUserInput, setInviteUserInput] = useState('');
  const [showInviteSuggestions, setShowInviteSuggestions] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const searchInviteRef = useRef(null);

  // Load Communities Data
  const loadData = async () => {
    if (!currentProfile?.id) return;
    setLoading(true);
    try {
      const data = await fetchCommunities(currentProfile.id);
      setCommunities(data);
      if (data.length > 0 && !selectedCommId) {
        setSelectedCommId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentProfile?.id]);

  // Selected Community Object
  const activeComm = useMemo(() => {
    return communities.find(c => c.id === selectedCommId) || communities[0];
  }, [communities, selectedCommId]);

  // Filtered Communities by search query
  const filteredCommunities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.community_id.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  }, [communities, searchQuery]);

  // User Pending Invitations
  const pendingInvites = useMemo(() => {
    return communities.filter(c => c.userStatus === 'invited');
  }, [communities]);

  // Admin Pending Join Notifications across all managed communities
  const adminPendingNotifications = useMemo(() => {
    const list = [];
    communities.forEach(comm => {
      if (comm.isUserAdmin) {
        const pendingMembers = (comm.members || []).filter(m => m.status === 'pending');
        pendingMembers.forEach(m => {
          const u = profiles.find(p => p.id === m.user_id) || { id: m.user_id, display_name: 'Racer' };
          list.push({
            commId: comm.id,
            commName: comm.name,
            userId: m.user_id,
            user: u,
          });
        });
      }
    });
    return list;
  }, [communities, profiles]);

  // Active Community Leaderboard (Computed with Privacy Access Check)
  const activeLeaderboard = useMemo(() => {
    if (!activeComm) return { allowed: false, members: [] };

    const isMember = activeComm.userStatus === 'approved';
    const isPublic = !activeComm.is_private || activeComm.is_official;
    const isAdmin = activeComm.isUserAdmin;

    if (!isPublic && !isMember && !isAdmin) {
      return { allowed: false, members: [] };
    }

    const approvedRows = (activeComm.members || []).filter(m => m.status === 'approved');
    const totalQ = questions.length || 1;

    const ranked = approvedRows.map(mem => {
      const userProf = profiles.find(p => p.id === mem.user_id) || {
        id: mem.user_id,
        display_name: 'Unknown Racer',
        avatar_color: '#8b5cf6',
      };
      const solved = progress.filter(pr => pr.user_id === mem.user_id && pr.status === 'done').length;
      const pct = Math.round((solved / totalQ) * 100);

      return {
        ...userProf,
        role: mem.role,
        solved,
        pct,
      };
    }).sort((a, b) => b.solved - a.solved);

    return { allowed: true, members: ranked };
  }, [activeComm, questions, profiles, progress]);

  // Admin Pending Join Requests Queue
  const pendingJoinRequests = useMemo(() => {
    if (!activeComm || !activeComm.isUserAdmin) return [];
    const pendingRows = (activeComm.members || []).filter(m => m.status === 'pending');
    return pendingRows.map(m => {
      const p = profiles.find(pr => pr.id === m.user_id) || { id: m.user_id, display_name: 'Unknown User' };
      return { ...p, member_id: m.id };
    });
  }, [activeComm, profiles]);

  // Invite Autocomplete Suggestions
  const inviteUserSuggestions = useMemo(() => {
    const query = inviteUserInput.trim().toLowerCase();
    if (!query) return [];
    const qClean = query.replace(/^@/, '');

    const existingMemberIds = (activeComm?.members || []).map(m => m.user_id);

    return profiles.filter(p => {
      if (existingMemberIds.includes(p.id)) return false;
      const uId = (p.id || '').toLowerCase();
      const uName = (p.display_name || '').toLowerCase();
      const uHandle = (p.username || '').toLowerCase();
      return uId.includes(query) || uName.includes(qClean) || uHandle.includes(qClean);
    }).slice(0, 5);
  }, [inviteUserInput, profiles, activeComm]);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newCommName.trim()) {
      setCreateError('Community name is required.');
      return;
    }

    setActionLoading(true);
    try {
      await createCommunity({
        name: newCommName,
        communityId: newCommId,
        description: newCommDesc,
        avatarColor: newCommColor,
        isPrivate: newCommIsPrivate,
      }, currentProfile.id);

      setIsCreateModalOpen(false);
      setNewCommName('');
      setNewCommId('');
      setNewCommDesc('');
      await loadData();
    } catch (err) {
      setCreateError(err.message || 'Failed to create community. Check if Community ID is taken.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinOrRequest = async (comm) => {
    if (!currentProfile?.id) return;
    setActionLoading(true);
    try {
      const autoApprove = !comm.is_private || comm.is_official;
      await requestToJoinCommunity(comm.id, currentProfile.id, autoApprove);
      await loadData();
    } catch (err) {
      console.error('Failed to request join:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptInvite = async (commId) => {
    setActionLoading(true);
    try {
      await acceptCommunityInvite(commId, currentProfile.id);
      await loadData();
    } catch (err) {
      console.error('Failed to accept invite:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOrLeave = async (commId) => {
    setActionLoading(true);
    try {
      await declineOrLeaveCommunity(commId, currentProfile.id);
      await loadData();
    } catch (err) {
      console.error('Failed to leave:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInvite = async (targetUserId) => {
    setInviteMsg('');
    setActionLoading(true);
    try {
      await sendCommunityInvite(activeComm.id, targetUserId);
      setInviteUserInput('');
      setShowInviteSuggestions(false);
      setInviteMsg('Invitation sent successfully!');
      setTimeout(() => setInviteMsg(''), 3000);
      await loadData();
    } catch (err) {
      setInviteMsg('Error sending invitation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async (targetUserId) => {
    setActionLoading(true);
    try {
      await approveMemberRequest(activeComm.id, targetUserId);
      await loadData();
    } catch (err) {
      console.error('Failed to approve request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (targetUserId) => {
    setActionLoading(true);
    try {
      await rejectMemberRequest(activeComm.id, targetUserId);
      await loadData();
    } catch (err) {
      console.error('Failed to reject request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const panelStyle = { background: 'rgba(11,11,14,0.7)' };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="space-y-6 pb-12 font-sans"
    >

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            <h1 className="text-lg font-bold tracking-tight text-white">Communities & Squads</h1>
          </div>
          <p className="text-zinc-500 text-xs mt-0.5">
            Join official squads or build private coding communities to track progress together.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-violet-600/20 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </button>
      </div>

      {/* ── PENDING INVITATIONS ALERTS BANNER ── */}
      {pendingInvites.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-amber-300">Pending Community Invitations ({pendingInvites.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {pendingInvites.map(comm => (
              <div key={comm.id} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{comm.name}</p>
                  <p className="text-[10px] font-mono text-zinc-500 truncate">ID: {comm.community_id}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAcceptInvite(comm.id)}
                    disabled={actionLoading}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button
                    onClick={() => handleDeclineOrLeave(comm.id)}
                    disabled={actionLoading}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADMIN JOIN REQUESTS NOTIFICATION BANNER ── */}
      {adminPendingNotifications.length > 0 && (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 space-y-3 shadow-lg shadow-violet-500/5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-400 animate-bounce" />
            <h3 className="text-xs font-bold text-violet-200">
              Admin Notifications: New Join Requests ({adminPendingNotifications.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {adminPendingNotifications.map(req => (
              <div key={`${req.commId}-${req.userId}`} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar user={req.user} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{req.user.display_name}</p>
                    <p className="text-[10px] font-mono text-zinc-500 truncate">Requesting to join <span className="text-violet-300 font-semibold">{req.commName}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={async () => {
                      await approveMemberRequest(req.commId, req.userId);
                      await loadData();
                    }}
                    disabled={actionLoading}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={async () => {
                      await rejectMemberRequest(req.commId, req.userId);
                      await loadData();
                    }}
                    disabled={actionLoading}
                    className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT: COMMUNITIES BROWSER + DASHBOARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Communities Cards Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search community name or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 font-mono"
            />
          </div>

          {/* Communities List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="text-center py-12 text-xs font-mono text-zinc-500">Loading communities...</div>
            ) : filteredCommunities.length === 0 ? (
              <div className="text-center py-12 border border-zinc-800 rounded-2xl bg-zinc-950/40 p-4">
                <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 font-mono">No communities found.</p>
              </div>
            ) : (
              filteredCommunities.map(comm => {
                const isSelected = comm.id === activeComm?.id;
                return (
                  <div
                    key={comm.id}
                    onClick={() => setSelectedCommId(comm.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-violet-500/[0.08] border-violet-500/30 shadow-lg shadow-violet-500/5'
                        : 'border-white/[0.05] hover:border-zinc-700 bg-[#0d0d11]/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm uppercase shrink-0 border border-white/10 shadow-sm"
                          style={{ backgroundColor: comm.avatar_color || '#8b5cf6' }}
                        >
                          {comm.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-white truncate">{comm.name}</h4>
                            {comm.is_official && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                OFFICIAL
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">
                            ID: <span className="text-zinc-300">{comm.community_id}</span>
                          </p>
                        </div>
                      </div>

                      {/* Privacy Icon */}
                      <span className="text-zinc-500 text-[10px] shrink-0 font-mono flex items-center gap-0.5">
                        {comm.is_private ? <Lock className="w-3 h-3 text-zinc-500" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                      {comm.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/60 text-[10px] font-mono">
                      <span className="text-zinc-500">
                        👥 {comm.member_count} {comm.member_count === 1 ? 'racer' : 'racers'}
                      </span>

                      {/* Status Button */}
                      {comm.userStatus === 'approved' ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Member
                        </span>
                      ) : comm.userStatus === 'pending' ? (
                        <span className="text-amber-400 font-bold">
                          Pending ⏳
                        </span>
                      ) : comm.userStatus === 'invited' ? (
                        <span className="text-violet-400 font-bold">
                          Invited ✉️
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinOrRequest(comm);
                          }}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-violet-600 text-zinc-200 hover:text-white transition-all font-semibold"
                        >
                          {comm.is_private ? 'Request Join' : 'Join Squad'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Community Squad Leaderboard & Admin Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {activeComm ? (
            <div className="space-y-5 animate-fadeIn">

              {/* Community Banner */}
              <div className="rounded-2xl border border-white/[0.05] p-5 sm:p-6" style={panelStyle}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl uppercase shrink-0 border border-white/10 shadow-xl"
                      style={{ backgroundColor: activeComm.avatar_color || '#8b5cf6' }}
                    >
                      {activeComm.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-white truncate">{activeComm.name}</h2>
                        {activeComm.is_official && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            OFFICIAL SQUAD
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                          {activeComm.is_private ? '🔒 Private' : '🌐 Public'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{activeComm.description || 'Community squad for tracking DSA progress.'}</p>
                      <p className="text-[10px] font-mono text-zinc-500 mt-1">
                        Unique Community ID: <span className="text-violet-400 font-semibold">{activeComm.community_id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {activeComm.userStatus === 'approved' && !activeComm.is_official && (
                      <button
                        onClick={() => handleDeclineOrLeave(activeComm.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-rose-500/20 border border-zinc-800 text-zinc-400 hover:text-rose-300 text-xs transition-colors cursor-pointer"
                      >
                        Leave Squad
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── ADMIN MANAGEMENT PANEL (If User is Community Admin) ── */}
              {activeComm.isUserAdmin && (
                <div className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.04] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-violet-500/20">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-violet-400" />
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Community Admin Control Panel</h3>
                    </div>
                    {pendingJoinRequests.length > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {pendingJoinRequests.length} Pending Approval
                      </span>
                    )}
                  </div>

                  {/* Admin Action 1: Invite Fellow Racer */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-mono text-zinc-400">Invite Fellow Racer by User ID or @username:</p>
                    <div className="relative" ref={searchInviteRef}>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={inviteUserInput}
                          onFocus={() => setShowInviteSuggestions(true)}
                          onChange={e => { setInviteUserInput(e.target.value); setShowInviteSuggestions(true); }}
                          placeholder="Enter User ID or @username..."
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50 font-mono"
                        />
                      </div>

                      {/* Suggestions Dropdown */}
                      <AnimatePresence>
                        {showInviteSuggestions && inviteUserInput.trim() && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4 }}
                            className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-zinc-800 bg-[#0d0d11]/95 backdrop-blur-md shadow-2xl p-1.5 z-50 max-h-48 overflow-y-auto"
                          >
                            {inviteUserSuggestions.length === 0 ? (
                              <div className="px-3 py-2 text-center text-[11px] text-zinc-500 font-mono">No matching racers found.</div>
                            ) : (
                              inviteUserSuggestions.map(u => (
                                <div
                                  key={u.id}
                                  onClick={() => handleSendInvite(u.id)}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <Avatar user={u} size="sm" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-zinc-200 truncate">{u.display_name}</p>
                                      <p className="text-[9px] font-mono text-zinc-500 truncate">{u.username ? `@${u.username}` : `ID: ${u.id.slice(0, 8)}...`}</p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono text-violet-400 font-bold px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                                    + Send Invite
                                  </span>
                                </div>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    {inviteMsg && <p className="text-[11px] font-mono text-emerald-400">{inviteMsg}</p>}
                  </div>

                  {/* Admin Action 2: Pending Requests Approval Queue */}
                  {pendingJoinRequests.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                      <p className="text-[11px] font-mono text-zinc-400">Join Requests Awaiting Approval:</p>
                      <div className="space-y-1.5">
                        {pendingJoinRequests.map(u => (
                          <div key={u.id} className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar user={u} size="sm" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-zinc-200 truncate">{u.display_name}</p>
                                <p className="text-[9px] font-mono text-zinc-500 truncate">ID: {u.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleApproveRequest(u.id)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(u.id)}
                                disabled={actionLoading}
                                className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[11px] transition-colors cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── SQUAD LEADERBOARD OR PRIVATE LOCK SHIELD ── */}
              {activeLeaderboard.allowed ? (
                <div className="rounded-2xl border border-white/[0.05] p-5 space-y-4" style={panelStyle}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                        Squad Leaderboard ({activeLeaderboard.members.length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">Sorted by Solved Problems</span>
                  </div>

                  {activeLeaderboard.members.length === 0 ? (
                    <div className="text-center py-12 border border-zinc-800 rounded-xl bg-zinc-950/40">
                      <Users className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-xs text-zinc-500 font-mono">No approved members in this community yet.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950/40">
                      {activeLeaderboard.members.map((mem, idx) => (
                        <div
                          key={mem.id}
                          className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors gap-3 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-mono text-zinc-600 w-5 shrink-0 text-right">
                              #{idx + 1}
                            </span>
                            <Avatar user={mem} size="md" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-zinc-200 group-hover:text-amber-400 transition-colors truncate">
                                  {mem.display_name}
                                </p>
                                {mem.role === 'admin' && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-zinc-500 mt-0.5 truncate">
                                {mem.username ? `@${mem.username}` : `ID: ${mem.id.slice(0, 8)}...`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right font-mono">
                              <p className="text-xs font-bold text-violet-400">{mem.solved} solved</p>
                              <p className="text-[9px] text-zinc-500">{mem.pct}% completion</p>
                            </div>

                            {/* Public Profile Eye Icon */}
                            <button
                              onClick={() => setSelectedModalUser(mem)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title="View Public Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* 🔒 PRIVATE COMMUNITY LOCK SHIELD */
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-sm font-bold text-white">Private Community Squad</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Only approved squad members can view this community's internal member rankings, solve stats, and leaderboards.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleJoinOrRequest(activeComm)}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-violet-600/20"
                    >
                      Request to Join Squad
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-20 border border-zinc-800 rounded-2xl bg-zinc-950/40 p-4">
              <Users className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-500 font-mono">Select a community from the left sidebar to view.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE COMMUNITY MODAL ── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer font-sans" onClick={() => setIsCreateModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg overflow-hidden bg-[#09090b] rounded-2xl border border-zinc-800 shadow-2xl p-6 relative cursor-default space-y-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-bold text-white">Create New Community Squad</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-zinc-400 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-4">
                {createError && <p className="text-xs text-red-400 font-mono">{createError}</p>}

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Community Name *</label>
                  <input
                    type="text"
                    required
                    value={newCommName}
                    onChange={e => {
                      const nameVal = e.target.value;
                      setNewCommName(nameVal);
                      const base = nameVal.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                      const randSuffix = Math.floor(100 + Math.random() * 900);
                      setNewCommId(base ? `${base}-${randSuffix}` : '');
                    }}
                    placeholder="e.g. LeetCode Warriors"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-zinc-400 block">Auto-Generated Community ID *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const base = (newCommName || 'squad').toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                        const randSuffix = Math.floor(1000 + Math.random() * 9000);
                        setNewCommId(base ? `${base}-${randSuffix}` : `squad-${randSuffix}`);
                      }}
                      className="text-[10px] font-mono text-violet-400 hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Re-roll ID
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newCommId}
                      onChange={e => setNewCommId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="e.g. leetcode-warriors-482"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-violet-300 font-mono font-bold focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Auto-generated unique handle for search & invites.</span>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newCommDesc}
                    onChange={e => setNewCommDesc(e.target.value)}
                    placeholder="What is your squad about?"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="privacyCheck"
                      checked={newCommIsPrivate}
                      onChange={e => setNewCommIsPrivate(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-violet-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="privacyCheck" className="text-xs text-zinc-300 cursor-pointer">
                      Require Admin Approval to Join (Private)
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-violet-600/20"
                  >
                    Create Squad
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PUBLIC USER PROFILE MODAL ── */}
      {selectedModalUser && (
        <UserProfileModal
          user={selectedModalUser}
          progress={progress}
          questions={questions}
          onClose={() => setSelectedModalUser(null)}
        />
      )}
    </motion.div>
  );
}
