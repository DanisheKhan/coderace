import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, RefreshCw, Code2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../lib/animations';

const PendingApprovalPage = () => {
  const { profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Auto check approval status when component mounts or profile changes
  useEffect(() => {
    if (profile?.approved || profile?.is_admin) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  const handleCheckStatus = async () => {
    setLoading(true);
    setMessage('');
    try {
      const updatedProfile = await refreshProfile();
      if (updatedProfile?.approved || updatedProfile?.is_admin) {
        navigate('/dashboard', { replace: true });
      } else {
        setMessage('Your account is currently under review by an admin.');
      }
    } catch (err) {
      console.error('Error refreshing approval status:', err);
      setMessage(err.message || 'Failed to check status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative font-sans text-zinc-100 selection:bg-zinc-800 selection:text-white"
    >
      {/* Subtle Grid Background matching LoginPage */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '24px 24px' 
        }} 
      />

      <div className="w-full max-w-sm border border-zinc-800 bg-zinc-900/40 rounded-xl p-6 sm:p-8 relative z-10 shadow-xl">
        
        {/* Brand Header matching LoginPage */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-3 text-zinc-100">
            <Code2 className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Code<span className="text-violet-400">Race</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">
            Pending Administrator Approval
          </p>
        </div>

        {/* User Info Card */}
        {profile && (
          <div className="mb-4 p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center gap-3 text-left">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white uppercase text-sm shrink-0 overflow-hidden border border-zinc-700 shadow-sm"
              style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#8b5cf6') }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                profile.display_name?.charAt(0) || '?'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">{profile.display_name}</p>
              <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5 font-medium">
                {profile.username ? `@${profile.username}` : profile.email}
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending
            </span>
          </div>
        )}

        {/* Info Text Box */}
        <div className="mb-4 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-left space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">APPROVAL REQUIRED</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            An administrator will review and activate your profile. Once approved, you will get full access to the DSA sheet, leaderboard, typing tests, and Java quizzes.
          </p>
        </div>

        {/* Message Alert */}
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-mono overflow-hidden"
            >
              <span>{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons matching LoginPage button style */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-zinc-900 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Approval Status</span>
              </>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-2 px-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
};

export default PendingApprovalPage;
