import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { requestToJoinCommunity } from '../lib/communityService';
import { Clock, LogOut, RefreshCw, UserCheck, Users, Sparkles, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PendingApprovalPage = () => {
  const { profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleJoinAndEnter = async () => {
    if (!profile?.id) return;
    setLoading(true);
    setMessage('');
    try {
      // 1. Approve user profile
      const { error: appErr } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', profile.id);

      if (appErr) throw appErr;

      // 2. Fetch official DSA Racer community ID
      const { data: comm } = await supabase
        .from('communities')
        .select('id')
        .eq('community_id', 'dsa-racer')
        .maybeSingle();

      if (comm) {
        await requestToJoinCommunity(comm.id, profile.id, true);
      }

      await refreshProfile();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Error entering race:', err);
      setMessage(err.message || 'Failed to auto-join. Try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0d0d11]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl shadow-black/80 text-center space-y-5">
        
        {/* Top Header Badge */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
          <Users className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Join the DSA Racer Community</h1>
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
            Welcome <span className="text-violet-400 font-bold">{profile?.display_name || 'Racer'}</span>! Join the official CodeRace community to solve 390+ DSA questions and compete on the leaderboard.
          </p>
        </div>

        {/* User Profile Card */}
        {profile && (
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/[0.06] flex items-center gap-3 text-left">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white uppercase text-base shrink-0 overflow-hidden border border-white/10 shadow-md"
              style={{ backgroundColor: profile.avatar_url ? 'transparent' : (profile.avatar_color || '#8b5cf6') }}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                profile.display_name?.charAt(0) || '?'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-zinc-100 truncate">{profile.display_name}</p>
                {profile.username && (
                  <span className="text-[11px] font-mono text-amber-400 font-semibold truncate">
                    @{profile.username}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-zinc-500 truncate mt-0.5">{profile.email}</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          </div>
        )}

        {/* Official Community Preview Card */}
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Official Community</h3>
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              DSA Racer
            </span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Track 390+ Striver A2Z DSA sheet questions, Monkeytype WPM speed, Java concept quizzes, and side-by-side duels with fellow racers.
          </p>
        </div>

        {message && (
          <p className="text-xs font-mono text-rose-400">{message}</p>
        )}

        {/* Primary Join & Enter Button */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleJoinAndEnter}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>Join DSA Racer & Enter CodeRace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/[0.04]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default PendingApprovalPage;
