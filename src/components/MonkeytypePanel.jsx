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
    <div
      className="rounded-2xl border border-white/[0.06] overflow-hidden relative"
      style={{ background: 'rgba(9,9,11,0.92)', backdropFilter: 'blur(24px)' }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.04] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/[0.04] rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-6">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-3 pb-5 mb-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/25" />
              <Keyboard className="relative w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-zinc-100 tracking-tight">Monkeytype Speed Profile</h3>
                {username && (
                  <a
                    href={`https://monkeytype.com/profile/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[10px] font-medium transition-colors"
                  >
                    @{username} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Live speed stats, personal best WPM and accuracy metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConfigured && (
              <button
                onClick={handleSync}
                disabled={syncing || !apeKey}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer border"
                style={{
                  background: syncing
                    ? 'rgba(245,158,11,0.07)'
                    : 'rgba(245,158,11,0.1)',
                  borderColor: 'rgba(245,158,11,0.25)',
                  color: '#fcd34d',
                }}
                title="Sync latest stats from Monkeytype"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing…' : 'Sync Stats'}</span>
              </button>
            )}
            <button
              onClick={onOpenEditProfile}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800/70 hover:bg-zinc-700/70 text-zinc-300 text-xs font-medium transition-colors border border-white/[0.05] cursor-pointer"
              title="Configure Monkeytype settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Config</span>
            </button>
          </div>
        </div>

        {/* ── Error ─────────────────────────────── */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs"
            style={{ background: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.2)' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1 text-red-400">
              <span className="font-semibold block mb-0.5">Sync Failed</span>
              {error}
            </div>
          </div>
        )}

        {/* ── Not Configured ─────────────────────── */}
        {!isConfigured && !loading && (
          <div className="py-10 px-6 rounded-2xl flex flex-col items-center justify-center text-center border border-dashed border-zinc-800/80"
            style={{ background: 'rgba(245,158,11,0.02)' }}>
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-zinc-200">Connect your Monkeytype Account</h4>
            <p className="text-xs text-zinc-500 max-w-xs mt-1.5 mb-5 leading-relaxed">
              Show off your typing speed! Add your Monkeytype username and ApeKey to sync your personal bests.
            </p>
            <button
              onClick={onOpenEditProfile}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Link Monkeytype Profile</span>
            </button>
          </div>
        )}

        {/* ── Configured but no stats ────────────── */}
        {isConfigured && !typingData && !loading && (
          <div className="py-8 px-4 rounded-2xl border border-zinc-800/70 flex flex-col items-center justify-center text-center"
            style={{ background: 'rgba(255,255,255,0.01)' }}>
            <Keyboard className="w-8 h-8 text-amber-400/40 mb-3" />
            <p className="text-sm font-semibold text-zinc-300">No stats cached yet</p>
            <p className="text-[10px] text-zinc-600 mt-1 mb-4">Click 'Sync Stats' to fetch your personal bests from Monkeytype.</p>
            <button
              onClick={handleSync}
              disabled={syncing || !apeKey}
              className="px-4 py-1.5 rounded-xl border text-amber-400 font-semibold text-xs transition-all cursor-pointer hover:bg-amber-500/10 flex items-center gap-1.5"
              style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>Fetch Stats Now</span>
            </button>
          </div>
        )}

        {/* ── Stats Grid ─────────────────────────── */}
        {typingData && (
          <div className="space-y-4">

            {/* Top WPM Hero Banner */}
            <div
              className="relative rounded-2xl p-4 flex items-center justify-between overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.04) 100%)', borderLeft: '3px solid rgba(245,158,11,0.5)' }}
            >
              <div className="absolute right-4 top-0 bottom-0 w-20 flex items-center justify-end opacity-5">
                <TrendingUp className="w-20 h-20 text-amber-400" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-amber-500/70 tracking-widest block mb-1">Peak WPM · All Modes</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">{topWPM > 0 ? topWPM : '--'}</span>
                  <span className="text-xs font-bold text-amber-600 uppercase">WPM</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block mb-1">Tests Done</span>
                <span className="text-2xl font-black text-zinc-200 font-mono">
                  {typingData.tests_completed?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {modes.map((item) => {
                const isBest = item.wpm && item.wpm === topWPM && topWPM > 0;
                const barPercent = topWPM > 0 && item.wpm ? Math.min(100, Math.round((item.wpm / 150) * 100)) : 0;
                const accColor = item.acc >= 98 ? '#34d399' : item.acc >= 95 ? '#fbbf24' : '#71717a';

                return (
                  <div
                    key={item.label}
                    className="relative rounded-xl overflow-hidden transition-all duration-300 group"
                    style={{
                      background: isBest
                        ? 'linear-gradient(145deg, rgba(245,158,11,0.10), rgba(217,119,6,0.04))'
                        : 'rgba(255,255,255,0.02)',
                      border: isBest ? '1px solid rgba(245,158,11,0.30)' : '1px solid rgba(255,255,255,0.045)',
                      boxShadow: isBest ? '0 4px 24px rgba(245,158,11,0.08)' : 'none',
                    }}
                  >
                    {/* Glow accent on best card */}
                    {isBest && (
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
                    )}

                    <div className="p-3.5">
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">
                          {item.label}
                        </span>
                        {isBest && (
                          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/25">
                            <Zap className="w-2 h-2 text-amber-400 fill-amber-400" />
                            <span className="text-[8px] font-black text-amber-400 uppercase tracking-wider">Best</span>
                          </div>
                        )}
                      </div>

                      {/* WPM number */}
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-2xl font-black tracking-tight font-mono leading-none"
                          style={{ color: isBest ? '#fbbf24' : '#e4e4e7' }}
                        >
                          {item.wpm != null ? item.wpm : '--'}
                        </span>
                        <span className="text-[9px] font-semibold text-zinc-600 uppercase">wpm</span>
                      </div>

                      {/* Stats */}
                      <div className="mt-2.5 space-y-1 pt-2.5 border-t border-white/[0.04]">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-zinc-600">Accuracy</span>
                          <span className="text-[10px] font-bold font-mono" style={{ color: accColor }}>
                            {item.acc != null ? `${item.acc}%` : '--'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-zinc-600">Consistency</span>
                          <span className="text-[10px] font-bold font-mono text-amber-400/80">
                            {item.consistency != null ? `${item.consistency}%` : '--'}
                          </span>
                        </div>
                      </div>

                      {/* Speed bar */}
                      <div className="w-full rounded-full overflow-hidden mt-2.5" style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${barPercent}%`,
                            background: isBest
                              ? 'linear-gradient(90deg, #f59e0b, #fde68a)'
                              : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom stats strip */}
            <div
              className="rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center gap-4 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-zinc-500">Completion</span>
                  <span className="font-bold font-mono text-emerald-400">{completionRate}%</span>
                </div>

                {typingData.time_typing > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-violet-400" />
                    <span className="text-zinc-500">Time</span>
                    <span className="font-bold font-mono text-violet-300">{formatTime(typingData.time_typing)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-amber-400" />
                  <span className="text-zinc-500">Started</span>
                  <span className="font-bold font-mono text-zinc-300">{typingData.tests_started?.toLocaleString() || 0}</span>
                </div>
              </div>

              {typingData.last_synced && (
                <p className="text-[9px] text-zinc-600 font-mono">
                  Synced {new Date(typingData.last_synced).toLocaleDateString()} {new Date(typingData.last_synced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
