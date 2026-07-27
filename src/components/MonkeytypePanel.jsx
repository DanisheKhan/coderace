import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  fetchMonkeytypeData, 
  syncTypingProfileToSupabase, 
  getTypingProfile 
} from '../lib/monkeytypeService';
import { 
  Keyboard, RefreshCw, ExternalLink, Zap, Award, Target, 
  CheckCircle2, AlertCircle, ShieldAlert, Settings, Sparkles, Activity, Clock, TrendingUp
} from 'lucide-react';

export default function MonkeytypePanel({ onOpenEditProfile }) {
  const { profile } = useAuth();
  const [typingData, setTypingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const username = profile?.monkeytype_username;
  const apeKey = profile?.monkeytype_ape_key;
  const isConfigured = Boolean(username || apeKey);

  const loadCachedStats = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const cached = await getTypingProfile(profile.id);
      if (cached) setTypingData(cached);
    } catch (err) {
      console.error('Error loading cached typing stats:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { loadCachedStats(); }, [loadCachedStats]);

  const handleSync = async () => {
    if (!apeKey) {
      setError('ApeKey is missing. Please edit your profile to set your Monkeytype ApeKey.');
      return;
    }
    if (apeKey.trim().startsWith('http://') || apeKey.trim().startsWith('https://')) {
      setError('Your configured ApeKey appears to be a URL. Click "Config" to set a valid ApeKey.');
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

  const topWPM = Math.max(
    typingData?.wpm_15 || 0,
    typingData?.wpm_30 || 0,
    typingData?.wpm_60 || 0,
    typingData?.wpm_120 || 0
  );

  const completionRate = typingData?.tests_started > 0
    ? Math.round((typingData.tests_completed / typingData.tests_started) * 100)
    : 0;

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const modes = [
    { label: '15s', wpm: typingData?.wpm_15, acc: typingData?.acc_15, consistency: typingData?.consistency_15 },
    { label: '30s', wpm: typingData?.wpm_30, acc: typingData?.acc_30, consistency: typingData?.consistency_30 },
    { label: '60s', wpm: typingData?.wpm_60, acc: typingData?.acc_60, consistency: typingData?.consistency_60 },
    { label: '120s', wpm: typingData?.wpm_120, acc: typingData?.acc_120, consistency: typingData?.consistency_120 },
  ];

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-zinc-800/80 p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Keyboard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-100 uppercase font-mono tracking-wider truncate">Monkeytype Profile</h3>
              {username && (
                <a
                  href={`https://monkeytype.com/profile/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 hover:underline shrink-0"
                >
                  @{username} <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 truncate">Speed benchmarks & accuracy metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isConfigured && (
            <button
              onClick={handleSync}
              disabled={syncing || !apeKey}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[10px] font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              title="Sync latest stats"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing…' : 'Sync'}</span>
            </button>
          )}
          <button
            onClick={onOpenEditProfile}
            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
            title="Configure settings"
          >
            <Settings className="w-3 h-3" />
            <span>Config</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Not Configured */}
      {!isConfigured && !loading && (
        <div className="py-8 px-4 rounded-xl border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center space-y-2">
          <Keyboard className="w-8 h-8 text-amber-400/40" />
          <h4 className="text-xs font-bold text-zinc-200">Connect Monkeytype Account</h4>
          <p className="text-[10px] text-zinc-500 max-w-xs leading-relaxed">
            Link your Monkeytype username and ApeKey to display live typing stats.
          </p>
          <button
            onClick={onOpenEditProfile}
            className="mt-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Link Profile</span>
          </button>
        </div>
      )}

      {/* Configured but no stats */}
      {isConfigured && !typingData && !loading && (
        <div className="py-8 px-4 rounded-xl border border-zinc-800 text-center flex flex-col items-center justify-center space-y-2">
          <Keyboard className="w-6 h-6 text-zinc-600" />
          <p className="text-xs font-semibold text-zinc-300">No cached stats found</p>
          <p className="text-[10px] text-zinc-500">Click Sync to fetch your personal bests.</p>
          <button
            onClick={handleSync}
            disabled={syncing || !apeKey}
            className="mt-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Fetch Stats</span>
          </button>
        </div>
      )}

      {/* Stats Content */}
      {typingData && (
        <div className="space-y-3.5">
          {/* Peak WPM Hero */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block mb-1">Peak WPM · All Modes</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">{topWPM > 0 ? topWPM : '--'}</span>
                <span className="text-[10px] font-bold text-amber-500 uppercase">WPM</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block mb-1">Tests Completed</span>
              <span className="text-xl font-bold text-zinc-200 font-mono">{typingData.tests_completed?.toLocaleString() || 0}</span>
            </div>
          </div>

          {/* Mode Cards Grid */}
          <div className="grid grid-cols-2 gap-2">
            {modes.map((item) => {
              const isBest = item.wpm && item.wpm === topWPM && topWPM > 0;
              return (
                <div
                  key={item.label}
                  className={`p-3 rounded-xl border transition-all ${
                    isBest 
                      ? 'bg-amber-500/[0.06] border-amber-500/25' 
                      : 'bg-zinc-900/40 border-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold">{item.label}</span>
                    {isBest && <span className="text-[8px] font-bold font-mono text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20">BEST</span>}
                  </div>
                  <div className="text-lg font-bold font-mono text-zinc-100">
                    {item.wpm != null ? `${item.wpm} WPM` : '—'}
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t border-zinc-800/50 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                    <span>Acc: {item.acc != null ? `${item.acc}%` : '—'}</span>
                    <span>Cons: {item.consistency != null ? `${item.consistency}%` : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom stats footer */}
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <div className="flex items-center gap-3">
              <span>Completion: <strong className="text-emerald-400">{completionRate}%</strong></span>
              {typingData.time_typing > 0 && (
                <span>Time: <strong className="text-violet-400">{formatTime(typingData.time_typing)}</strong></span>
              )}
            </div>
            {typingData.last_synced && (
              <span className="text-zinc-500 text-[9px]">
                Synced {new Date(typingData.last_synced).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
