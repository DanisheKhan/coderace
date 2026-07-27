import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import { getAllTypingProfiles, getTypingProfile } from '../lib/monkeytypeService';
import MonkeytypePanel from '../components/MonkeytypePanel';
import LinkMonkeytypeModal from '../components/LinkMonkeytypeModal';
import {
  Keyboard, Trophy, Zap, Award, Activity,
  ExternalLink, Search, Star, X, Clock, TrendingUp, Users, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp, cardHover, modalVariants, backdropVariants } from '../lib/animations';

const UserTypingProfileModal = ({ user, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      getTypingProfile(user.id)
        .then(setStats)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      variants={backdropVariants}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer font-sans"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        className="w-full max-w-lg bg-[#0d0d0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden cursor-default"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs uppercase overflow-hidden border border-zinc-700"
              style={{ backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1') }}
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
              ) : (
                user.display_name?.charAt(0) || '?'
              )}
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-sm leading-tight">{user.display_name}</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Monkeytype Speed Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              <p className="text-xs text-zinc-500">Fetching speed stats…</p>
            </div>
          ) : !stats ? (
            <div className="py-8 text-center text-xs text-zinc-500 italic">No detailed Monkeytype stats synced yet.</div>
          ) : (
            <div className="space-y-4">
              {/* Peak summary */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-mono text-amber-500/70 font-bold block mb-1">Peak Speed</span>
                  <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">{user.highestWPM || 0}</span>
                  <span className="text-xs font-bold text-amber-600 ml-1">WPM</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono text-zinc-500 font-bold block mb-1">Tests Done</span>
                  <span className="text-xl font-bold text-zinc-200 font-mono">{stats.tests_completed?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Modes */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: '15s', wpm: stats.wpm_15, acc: stats.acc_15 },
                  { label: '30s', wpm: stats.wpm_30, acc: stats.acc_30 },
                  { label: '60s', wpm: stats.wpm_60, acc: stats.acc_60 },
                  { label: '120s', wpm: stats.wpm_120, acc: stats.acc_120 },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold">{m.label} Mode</span>
                    <div className="text-lg font-bold text-zinc-100 font-mono">
                      {m.wpm ? `${m.wpm} WPM` : '—'}
                    </div>
                    {m.acc && <span className="text-[10px] text-zinc-500 block font-mono">Acc: {m.acc}%</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function TypingPage() {
  const { profile } = useAuth();
  const { profiles, fetchProfiles } = useProgressStore();
  const [typingStats, setTypingStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const loadTypingLeaderboard = async () => {
    setLoading(true);
    try {
      await fetchProfiles();
      const stats = await getAllTypingProfiles();
      setTypingStats(stats || []);
    } catch (err) {
      console.error('Failed to load typing profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTypingLeaderboard(); }, []);

  const leaderboardData = useMemo(() => {
    return profiles
      .filter(p => p.approved || p.is_admin)
      .map(p => {
        const stats = typingStats.find(s => s.user_id === p.id) || {};
        const highestWPM = Math.max(
          stats.wpm_15 || 0,
          stats.wpm_30 || 0,
          stats.wpm_60 || 0,
          stats.wpm_120 || 0
        );
        return { ...p, stats, highestWPM };
      })
      .sort((a, b) => b.highestWPM - a.highestWPM);
  }, [profiles, typingStats]);

  const filteredLeaderboard = useMemo(() => {
    if (!searchTerm.trim()) return leaderboardData;
    const q = searchTerm.toLowerCase();
    return leaderboardData.filter(item =>
      item.display_name.toLowerCase().includes(q) ||
      (item.monkeytype_username || '').toLowerCase().includes(q)
    );
  }, [leaderboardData, searchTerm]);

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="space-y-6 pb-12 font-sans transform-gpu"
    >
      {/* ── Minimal Header ─────────────────────────── */}
      <div className="pb-4 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold tracking-tight text-white">Typing Arena</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 font-bold tracking-wider uppercase">
              Monkeytype Live Sync
            </span>
          </div>
          <p className="text-zinc-500 text-xs mt-0.5">Track your typing benchmarks and compare speed with peers.</p>
        </div>

        <button
          onClick={() => setIsLinkModalOpen(true)}
          className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Keyboard className="w-3.5 h-3.5 text-amber-400" />
          <span>Link Monkeytype Profile</span>
        </button>
      </div>

      {/* ── Main Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Rankings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-xl overflow-hidden border border-zinc-800/80">
            {/* Card Header */}
            <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold text-zinc-200 uppercase font-mono tracking-wider">Speed Rankings</h2>
                <span className="text-[10px] font-mono text-zinc-500">({leaderboardData.length})</span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search racers…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-2 text-center">
                <div className="w-6 h-6 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                <p className="text-xs text-zinc-500 font-mono">Loading rankings…</p>
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-1.5 text-center">
                <Users className="w-6 h-6 text-zinc-700" />
                <p className="text-xs font-semibold text-zinc-400">No speed data found</p>
                <p className="text-[10px] text-zinc-600">Link your Monkeytype profile to appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse" style={{ minWidth: 540 }}>
                  <thead>
                    <tr className="border-b border-zinc-800/80 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      <th className="py-2.5 pl-4 w-10">#</th>
                      <th className="py-2.5">Racer</th>
                      <th className="py-2.5 text-center">Peak WPM</th>
                      <th className="py-2.5 text-center">15s</th>
                      <th className="py-2.5 text-center">30s</th>
                      <th className="py-2.5 text-center">60s</th>
                      <th className="py-2.5 text-center">120s</th>
                      <th className="py-2.5 text-right pr-4">Tests</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={staggerContainer}>
                    {filteredLeaderboard.map((item, idx) => {
                      const isSelf = item.id === profile?.id;
                      const rank = idx + 1;

                      const wpmCell = (wpm, acc) => wpm
                        ? <span className="font-mono text-xs text-zinc-300">{wpm} <span className="text-[9px] text-zinc-600">({acc}%)</span></span>
                        : <span className="text-zinc-700 text-xs font-mono">—</span>;

                      return (
                        <motion.tr
                          key={item.id}
                          variants={fadeUp}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.025)' }}
                          onClick={() => setSelectedUser(item)}
                          className={`cursor-pointer transition-colors border-b border-zinc-800/40 ${isSelf ? 'bg-amber-500/[0.03]' : ''}`}
                        >
                          {/* Rank badge */}
                          <td className="py-3 pl-4">
                            {rank === 1 ? (
                              <span className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center justify-center">1</span>
                            ) : rank === 2 ? (
                              <span className="w-6 h-6 rounded-md bg-zinc-700/20 border border-zinc-700/30 text-zinc-300 font-mono text-xs font-bold flex items-center justify-center">2</span>
                            ) : rank === 3 ? (
                              <span className="w-6 h-6 rounded-md bg-orange-950/30 border border-orange-800/30 text-orange-400 font-mono text-xs font-bold flex items-center justify-center">3</span>
                            ) : (
                              <span className="text-xs font-mono font-medium text-zinc-500 pl-1">#{rank}</span>
                            )}
                          </td>

                          {/* Racer Avatar & Info */}
                          <td className="py-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white uppercase text-[10px] shrink-0 overflow-hidden border border-zinc-700"
                                style={{ backgroundColor: item.avatar_url ? 'transparent' : (item.avatar_color || '#6366f1') }}
                              >
                                {item.avatar_url ? (
                                  <img src={item.avatar_url} alt={item.display_name} className="w-full h-full object-cover" />
                                ) : (
                                  item.display_name?.charAt(0) || '?'
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-zinc-200 truncate">{item.display_name}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">You</span>
                                  )}
                                </div>
                                {item.monkeytype_username && (
                                  <span className="text-[10px] font-mono text-zinc-500 truncate block">@{item.monkeytype_username}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Peak WPM */}
                          <td className="py-3 text-center">
                            <span className="text-xs font-bold font-mono text-amber-400">
                              {item.highestWPM > 0 ? item.highestWPM : '—'}
                            </span>
                          </td>

                          {/* Category PBs */}
                          <td className="py-3 text-center">{wpmCell(item.stats.wpm_15, item.stats.acc_15)}</td>
                          <td className="py-3 text-center">{wpmCell(item.stats.wpm_30, item.stats.acc_30)}</td>
                          <td className="py-3 text-center">{wpmCell(item.stats.wpm_60, item.stats.acc_60)}</td>
                          <td className="py-3 text-center">{wpmCell(item.stats.wpm_120, item.stats.acc_120)}</td>

                          {/* Tests */}
                          <td className="py-3 text-right pr-4 font-mono text-xs text-zinc-500">
                            {item.stats.tests_completed?.toLocaleString() || 0}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </motion.tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: MonkeytypePanel */}
        <div className="lg:col-span-5">
          <MonkeytypePanel onOpenEditProfile={() => setIsLinkModalOpen(true)} />
        </div>
      </div>

      {/* ── Modals ──────────────────────────────── */}
      <LinkMonkeytypeModal
        isOpen={isLinkModalOpen}
        onClose={() => { setIsLinkModalOpen(false); loadTypingLeaderboard(); }}
      />

      <AnimatePresence>
        {selectedUser && (
          <UserTypingProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
