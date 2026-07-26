import React, { useState, useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, UserCheck, UserMinus, ShieldAlert, 
  Search, Mail, Calendar, Sparkles, RefreshCw, Trash2, Clock
} from 'lucide-react';

const AdminPage = () => {
  const { profiles, fetchProfiles } = useProgressStore();
  const { profile: currentAdmin } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved'

  // Refetch profiles manually if needed
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfiles();
    setRefreshing(false);
  };

  // Group and filter profiles
  const processedProfiles = useMemo(() => {
    return profiles.filter(p => {
      // Don't show the current admin in the management list
      if (p.id === currentAdmin?.id) return false;
      
      const nameMatch = p.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const emailMatch = p.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || emailMatch;
    });
  }, [profiles, searchQuery, currentAdmin]);

  const pendingUsers = useMemo(() => {
    return processedProfiles.filter(p => !p.approved && !p.is_admin);
  }, [processedProfiles]);

  const approvedUsers = useMemo(() => {
    return processedProfiles.filter(p => p.approved || p.is_admin);
  }, [processedProfiles]);

  const stats = useMemo(() => {
    const total = profiles.length;
    const pending = profiles.filter(p => !p.approved && !p.is_admin).length;
    const approved = profiles.filter(p => p.approved || p.is_admin).length;
    return { total, pending, approved };
  }, [profiles]);

  // Actions
  const handleApprove = async (userId) => {
    setActionLoading(prev => ({ ...prev, [userId]: 'approve' }));
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', userId);
      
      if (error) throw error;
      await fetchProfiles(); // Refresh store
    } catch (err) {
      console.error('Error approving user:', err.message);
      alert('Failed to approve user: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleRevoke = async (userId) => {
    if (!confirm('Are you sure you want to revoke approval for this user? they will be redirected to the pending approval screen.')) return;
    setActionLoading(prev => ({ ...prev, [userId]: 'revoke' }));
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approved: false })
        .eq('id', userId);
      
      if (error) throw error;
      await fetchProfiles(); // Refresh store
    } catch (err) {
      console.error('Error revoking user:', err.message);
      alert('Failed to revoke user: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const handleDecline = async (userId, displayName) => {
    if (!confirm(`Are you sure you want to decline and delete the profile for "${displayName}"? This action cannot be undone.`)) return;
    setActionLoading(prev => ({ ...prev, [userId]: 'decline' }));
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      await fetchProfiles(); // Refresh store
    } catch (err) {
      console.error('Error declining user:', err.message);
      alert('Failed to delete profile: ' + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: null }));
    }
  };

  const formatJoinedDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const activeUsersList = activeTab === 'pending' ? pendingUsers : approvedUsers;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Admin Approvals</h1>
            <p className="text-xs text-zinc-500 mt-1">Manage user access permissions and activation requests</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl bg-[#111113] hover:bg-zinc-800/80 border border-white/[0.06] text-zinc-300 hover:text-zinc-100 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 select-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Lists</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/[0.05] p-4 flex items-center justify-between bg-zinc-900/20">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Users Registered</p>
            <p className="text-2xl font-black font-mono text-zinc-100 mt-1.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center border border-white/[0.04] text-zinc-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.05] p-4 flex items-center justify-between bg-zinc-900/20">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Pending Approvals</p>
            <p className="text-2xl font-black font-mono text-amber-400 mt-1.5">{stats.pending}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.05] p-4 flex items-center justify-between bg-zinc-900/20">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Approved Racers</p>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1.5">{stats.approved}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-zinc-900/30 p-2 rounded-xl border border-white/[0.04]">
        {/* Tabs */}
        <div className="flex bg-[#0b0b0d] p-1 rounded-lg border border-white/[0.05] w-full sm:w-auto shrink-0 select-none">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Pending Request</span>
            {stats.pending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500 text-zinc-950 font-black leading-none animate-pulse">
                {stats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'approved'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Approved Users</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by display name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-950/80 border border-white/[0.06] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 text-xs transition-colors"
          />
        </div>
      </div>

      {/* Users List Container */}
      <div className="rounded-2xl border border-white/[0.05] bg-zinc-950/40 p-1 overflow-hidden">
        {activeUsersList.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-white/[0.04] text-zinc-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">No users found</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              {searchQuery 
                ? 'Try adjusting your search keywords.' 
                : activeTab === 'pending'
                  ? 'Great! There are no pending account activation requests at this time.'
                  : 'No active racers have registered in the database yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {activeUsersList.map((user) => {
              const loadingType = actionLoading[user.id];
              
              return (
                <div 
                  key={user.id} 
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-all"
                >
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-white uppercase text-base shrink-0 overflow-hidden border border-white/10 shadow-inner"
                      style={{ backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1') }}
                    >
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                      ) : (
                        user.display_name?.charAt(0) || '?'
                      )}
                    </div>
                    
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-zinc-200 text-sm truncate leading-tight">{user.display_name}</h4>
                        {user.is_admin && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 border border-violet-500/20 uppercase tracking-wide">
                            Admin
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xxs text-zinc-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[160px] sm:max-w-none">{user.email || 'No email synced'}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Joined: {formatJoinedDate(user.created_at)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
                    {activeTab === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={!!loadingType}
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {loadingType === 'approve' ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDecline(user.id, user.display_name)}
                          disabled={!!loadingType}
                          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-rose-500/10 hover:text-rose-400 border border-white/[0.04] hover:border-rose-500/25 text-zinc-400 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {loadingType === 'decline' ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-3.5 h-3.5 text-rose-500/70" />
                              <span>Decline</span>
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleRevoke(user.id)}
                        disabled={!!loadingType || user.is_admin}
                        className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/[0.04] text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {loadingType === 'revoke' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Revoke Access</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Help message */}
      <div className="p-4 rounded-2xl bg-zinc-900/10 border border-dashed border-zinc-800 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
        <div className="text-xxs text-zinc-500 leading-relaxed">
          <p className="font-semibold text-zinc-400 mb-0.5">Real-time Approvals Active</p>
          This dashboard listens to user registrations in real-time. When a new user completes onboarding, they appear here instantly. Approving them allows them to immediately enter the dashboard without refreshing their browser.
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
