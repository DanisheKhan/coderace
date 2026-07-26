import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, RefreshCw, UserCheck } from 'lucide-react';

const PendingApprovalPage = () => {
  const { profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage('');
    try {
      await refreshProfile();
      // AuthProvider triggers profile reload. 
      // If approved, App.jsx routing will redirect automatically.
      // But let's check profile again after a short delay
      setTimeout(() => {
        setChecking(false);
        setMessage('Your account is still awaiting approval.');
      }, 800);
    } catch (err) {
      setChecking(false);
      setMessage('Failed to check status. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10 shadow-2xl shadow-black/50 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 text-amber-400">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 mb-2">Approval Pending</h1>
        
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Hi <span className="font-semibold text-violet-400">{profile?.display_name || 'Racer'}</span>, your profile has been successfully set up! 
          However, to prevent unauthorized access, an administrator must approve your account before you can enter the race.
        </p>

        {/* User Card */}
        {profile && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900/40 border border-white/[0.04] flex items-center gap-3.5 text-left max-w-sm mx-auto">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white uppercase text-base shrink-0 overflow-hidden border border-white/10"
              style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#6366f1') }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                profile.display_name?.charAt(0) || '?'
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-300 truncate">{profile.display_name}</p>
              <p className="text-[10px] text-zinc-500 truncate mt-0.5">{profile.email || 'No email associated'}</p>
            </div>
            <span className="ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/15">
              Pending
            </span>
          </div>
        )}

        {message && (
          <div className="mb-5 p-3 rounded-xl bg-zinc-900/80 border border-white/[0.04] text-zinc-400 text-xs">
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-semibold transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {checking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Check Approval Status</span>
              </>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/[0.04]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <p className="text-[10px] text-zinc-600 mt-6 leading-normal">
          Please contact <span className="text-zinc-500 font-medium">Danish Khan</span> to activate your account.
        </p>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
