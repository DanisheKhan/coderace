import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchMonkeytypeData, 
  syncTypingProfileToSupabase, 
  getTypingProfile 
} from '../lib/monkeytypeService';
import { 
  Keyboard, RefreshCw, ExternalLink, Zap, Award, Target, 
  CheckCircle2, AlertCircle, ShieldAlert, Settings, Sparkles, Activity
} from 'lucide-react';

const panelCls = 'rounded-2xl border border-white/[0.05] p-5 sm:p-6 transition-all duration-300';
const panelBg  = { background: 'rgba(11,11,14,0.85)', backdropFilter: 'blur(16px)' };

export default function MonkeytypePanel({ onOpenEditProfile }) {
  const { profile } = useAuth();
  const [typingData, setTypingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const username = profile?.monkeytype_username;
  const apeKey = profile?.monkeytype_ape_key;
  const isConfigured = Boolean(username || apeKey);

  // Load cached profile from Supabase initially
  const loadCachedStats = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const cached = await getTypingProfile(profile.id);
      if (cached) {
        setTypingData(cached);
      }
    } catch (err) {
      console.error('Error loading cached typing stats:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadCachedStats();
  }, [loadCachedStats]);

  // Fetch live stats from Monkeytype and sync to Supabase
  const handleSync = async () => {
    if (!apeKey) {
      setError('ApeKey is missing. Please edit your profile to set your Monkeytype ApeKey.');
      return;
    }

    if (apeKey.trim().startsWith('http://') || apeKey.trim().startsWith('https://')) {
      setError('Your configured ApeKey appears to be a URL instead of an actual API token. Click "Config" to set a valid ApeKey.');
      return;
    }

    setSyncing(true);
    setError('');

    try {
      const liveStats = await fetchMonkeytypeData(apeKey);
      const updatedProfile = await syncTypingProfileToSupabase(profile.id, liveStats);
      setTypingData(updatedProfile);
    } catch (err) {
      setError(err.message || 'Failed to sync with Monkeytype.');
    } finally {
      setSyncing(false);
    }
  };

  // Calculate highest WPM across all time modes
  const topWPM = Math.max(
    typingData?.wpm_15 || 0,
    typingData?.wpm_30 || 0,
    typingData?.wpm_60 || 0,
    typingData?.wpm_120 || 0
  );

  const completionRate = typingData?.tests_started > 0 
    ? Math.round((typingData.tests_completed / typingData.tests_started) * 100) 
    : 0;

  return (
    <div className={`${panelCls}`} style={panelBg}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-100 tracking-tight">Monkeytype Speed Profile</h3>
              {username && (
                <a
                  href={`https://monkeytype.com/profile/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-colors"
                >
                  @{username}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Live speed stats, personal best WPM and accuracy metrics
            </p>
          </div>
        </div>

        {/* Sync / Settings actions */}
        <div className="flex items-center gap-2">
          {isConfigured && (
            <button
              onClick={handleSync}
              disabled={syncing || !apeKey}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/20 text-amber-300 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              title="Sync latest stats from Monkeytype"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Stats'}</span>
            </button>
          )}

          <button
            onClick={onOpenEditProfile}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 text-xs font-medium transition-colors border border-white/5 cursor-pointer"
            title="Configure Monkeytype settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Config</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Sync Failed</span>
            {error}
          </div>
        </div>
      )}

      {/* Not Configured State */}
      {!isConfigured && !loading && (
        <div className="py-8 px-4 rounded-xl bg-zinc-900/40 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="text-sm font-bold text-zinc-200">Connect your Monkeytype Account</h4>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            Show off your typing speed! Add your Monkeytype username and ApeKey in profile settings to sync your personal bests.
          </p>
          <button
            onClick={onOpenEditProfile}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Link Monkeytype Profile</span>
          </button>
        </div>
      )}

      {/* Configured but no stats fetched yet */}
      {isConfigured && !typingData && !loading && (
        <div className="py-6 px-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col items-center justify-center text-center">
          <Keyboard className="w-8 h-8 text-amber-400/60 mb-2" />
          <p className="text-xs font-semibold text-zinc-300">No stats cached yet</p>
          <p className="text-xxs text-zinc-500 mt-0.5 mb-3">Click 'Sync Stats' above to fetch your personal bests from Monkeytype.</p>
          <button
            onClick={handleSync}
            disabled={syncing || !apeKey}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs transition-all cursor-pointer hover:bg-amber-500/20 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Fetch Stats Now</span>
          </button>
        </div>
      )}

      {/* Stats Display Grid */}
      {typingData && (
        <div className="space-y-5">
          {/* Main 4 WPM Mode Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { mode: '15s', wpm: typingData.wpm_15, acc: typingData.acc_15 },
              { mode: '30s', wpm: typingData.wpm_30, acc: typingData.acc_30 },
              { mode: '60s', wpm: typingData.wpm_60, acc: typingData.acc_60 },
              { mode: '120s', wpm: typingData.wpm_120, acc: typingData.acc_120 },
            ].map((item) => {
              const isBest = item.wpm && item.wpm === topWPM && topWPM > 0;
              const barPercent = topWPM > 0 && item.wpm ? Math.min(100, Math.round((item.wpm / 150) * 100)) : 0;

              return (
                <div
                  key={item.mode}
                  className={`p-3.5 rounded-xl border relative overflow-hidden transition-all ${
                    isBest 
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/5' 
                      : 'bg-zinc-900/60 border-white/[0.04]'
                  }`}
                >
                  {isBest && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-black uppercase text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-md">
                      <Zap className="w-2.5 h-2.5 fill-amber-400" />
                      Best
                    </div>
                  )}

                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    {item.mode} Time Test
                  </p>

                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-zinc-100 tracking-tight font-mono">
                      {item.wpm !== null && item.wpm !== undefined ? item.wpm : '--'}
                    </span>
                    <span className="text-xxs font-medium text-zinc-500 uppercase">WPM</span>
                  </div>

                  {/* Accuracy Badge */}
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-zinc-500">Accuracy:</span>
                    <span className={`font-semibold font-mono ${
                      item.acc >= 98 ? 'text-emerald-400' : item.acc >= 95 ? 'text-amber-400' : 'text-zinc-400'
                    }`}>
                      {item.acc !== null && item.acc !== undefined ? `${item.acc}%` : '--'}
                    </span>
                  </div>

                  {/* Visual Speed Bar */}
                  <div className="w-full bg-zinc-800/80 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isBest ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-violet-500'
                      }`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Summary Bar: Tests & Completion */}
          <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/[0.04] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-400">Tests Completed:</span>
                <span className="font-bold text-zinc-200 font-mono">
                  {typingData.tests_completed ? typingData.tests_completed.toLocaleString() : 0}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-400">Completion Rate:</span>
                <span className="font-bold text-zinc-200 font-mono">
                  {completionRate}%
                </span>
              </div>
            </div>

            {typingData.last_synced && (
              <p className="text-[10px] text-zinc-500">
                Last synced: {new Date(typingData.last_synced).toLocaleDateString()} {new Date(typingData.last_synced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
