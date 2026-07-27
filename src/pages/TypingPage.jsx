import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import { getAllTypingProfiles, getTypingProfile } from '../lib/monkeytypeService';
import MonkeytypePanel from '../components/MonkeytypePanel';
import LinkMonkeytypeModal from '../components/LinkMonkeytypeModal';
import {
  Keyboard, Trophy, Zap, Award, Activity,
  ExternalLink, Search, Star, X, Clock, TrendingUp, Users
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp, backdropVariants, modalVariants } from '../lib/animations';


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
      .map(p => {
        const stats = typingStats.find(s => s.user_id === p.id);
        if (!stats) return null;
        const highestWPM = Math.max(
          stats.wpm_15 || 0, stats.wpm_30 || 0,
          stats.wpm_60 || 0, stats.wpm_120 || 0
        );
        return { ...p, stats, highestWPM };
      })
      .filter(Boolean)
      .filter(item => item.monkeytype_public === true || item.id === profile?.id)
      .sort((a, b) => b.highestWPM - a.highestWPM);
  }, [profiles, typingStats, profile?.id]);

  const filteredLeaderboard = useMemo(() => {
    if (!searchTerm.trim()) return leaderboardData;
    const q = searchTerm.toLowerCase();
    return leaderboardData.filter(item =>
      item.display_name.toLowerCase().includes(q) ||
      (item.monkeytype_username || '').toLowerCase().includes(q)
    );
  }, [leaderboardData, searchTerm]);

  const medalMeta = [
    { color: '#facc15', shadow: 'rgba(250,204,21,0.3)', label: '1st' },
    { color: '#a1a1aa', shadow: 'rgba(161,161,170,0.3)', label: '2nd' },
    { color: '#cd7c2f', shadow: 'rgba(205,124,47,0.3)', label: '3rd' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6"
    >

      {/* ── Hero Banner ─────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(12,12,14,0.97) 0%, rgba(16,14,8,0.95) 100%)',
          border: '1px solid rgba(245,158,11,0.12)',
          boxShadow: '0 0 60px rgba(245,158,11,0.04) inset',
        }}
      >
        {/* Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-16 w-40 h-40 bg-violet-500/[0.04] rounded-full blur-[60px] pointer-events-none" />
        {/* Edge gradient top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
              <Keyboard className="w-3 h-3" />
              Speed Typing Arena
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">
              CodeRace Typing Leaderboard
            </h1>
            <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">
              Track your typing benchmarks, compare speeds with other developers, and keep your hands ready for high-speed coding.
            </p>
          </div>

          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-zinc-950 cursor-pointer transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              boxShadow: '0 4px 20px rgba(245,158,11,0.35)',
            }}
          >
            <Keyboard className="w-4 h-4" />
            Link Monkeytype Profile
          </button>
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Rankings */}
        <div className="lg:col-span-7">
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(9,9,11,0.90)', border: '1px solid rgba(255,255,255,0.055)', backdropFilter: 'blur(20px)' }}
          >
            {/* Card header */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-4 flex-wrap border-b border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-100">Speed Rankings</h2>
                  <p className="text-[10px] text-zinc-500">{leaderboardData.length} racers · click a row for full profile</p>
                </div>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search racers…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs text-zinc-300 placeholder:text-zinc-650 focus:outline-none glass-input"
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 animate-spin" />
                </div>
                <p className="text-xs text-zinc-600 animate-pulse">Loading typing rankings…</p>
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-2">
                <Users className="w-8 h-8 text-zinc-700" />
                <p className="text-sm font-semibold text-zinc-500">No speed data found</p>
                <p className="text-xs text-zinc-700">Link your Monkeytype profile to appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" style={{ minWidth: 580 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
                      <th className="py-3 pl-5 w-12">#</th>
                      <th className="py-3">Racer</th>
                      <th className="py-3 text-center">Peak</th>
                      <th className="py-3 text-center">15s</th>
                      <th className="py-3 text-center">30s</th>
                      <th className="py-3 text-center">60s</th>
                      <th className="py-3 text-center">120s</th>
                      <th className="py-3 text-right pr-5">Tests</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {filteredLeaderboard.map((item, idx) => {
                      const isSelf = item.id === profile?.id;
                      const medal = medalMeta[idx];

                      const wpmCell = (wpm, acc) => wpm
                        ? <span className="font-mono text-xs text-zinc-300">{wpm} <span className="text-[8px] text-zinc-600">({acc}%)</span></span>
                        : <span className="text-zinc-700 text-xs">—</span>;

                      return (
                        <motion.tr
                          key={item.id}
                          variants={fadeUp}
                          whileHover={{ x: 2, transition: { duration: 0.1 } }}
                          onClick={() => setSelectedUser(item)}
                          className="cursor-pointer transition-all"
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                            background: isSelf
                              ? 'linear-gradient(90deg, rgba(245,158,11,0.04), transparent)'
                              : 'transparent',
                          }}
                        >
                          {/* Rank */}
                          <td className="py-3.5 pl-5">
                            {medal ? (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${medal.color}20, ${medal.color}05)`,
                                  border: `1px solid ${medal.color}30`,
                                  boxShadow: `0 0 10px ${medal.shadow}`,
                                }}
                              >
                                <span className="text-[9px] font-black" style={{ color: medal.color }}>
                                  {medal.label}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold font-mono text-zinc-600 pl-1.5">
                                #{idx + 1}
                              </span>
                            )}
                          </td>

                          {/* Racer */}
                          <td className="py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white uppercase text-[10px] shrink-0 overflow-hidden"
                                style={{ backgroundColor: item.avatar_url ? 'transparent' : (item.avatar_color || '#6366f1'), border: '1px solid rgba(255,255,255,0.1)' }}
                              >
                                {item.avatar_url
                                  ? <img src={item.avatar_url} alt={item.display_name} className="w-full h-full object-cover" />
                                  : item.display_name?.charAt(0) || '?'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-zinc-200 truncate" style={{ transition: 'color 0.2s' }}>
                                    {item.display_name}
                                  </span>
                                  {isSelf && (
                                    <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded"
                                      style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', color: '#fbbf24' }}>
                                      You
                                    </span>
                                  )}
                                </div>
                                {item.monkeytype_username && (
                                  <a
                                    href={`https://monkeytype.com/profile/${item.monkeytype_username}`}
                                    target="_blank" rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-[9px] text-zinc-600 hover:text-amber-400 inline-flex items-center gap-0.5 transition-colors mt-0.5"
                                  >
                                    @{item.monkeytype_username} <ExternalLink className="w-2 h-2" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Peak WPM */}
                          <td className="py-3.5 text-center">
                            <span className="text-sm font-black font-mono" style={{ color: '#fbbf24' }}>
                              {item.highestWPM}
                            </span>
                          </td>

                          {/* Category PBs */}
                          <td className="py-3.5 text-center">{wpmCell(item.stats.wpm_15, item.stats.acc_15)}</td>
                          <td className="py-3.5 text-center">{wpmCell(item.stats.wpm_30, item.stats.acc_30)}</td>
                          <td className="py-3.5 text-center">{wpmCell(item.stats.wpm_60, item.stats.acc_60)}</td>
                          <td className="py-3.5 text-center">{wpmCell(item.stats.wpm_120, item.stats.acc_120)}</td>

                          {/* Tests */}
                          <td className="py-3.5 text-right pr-5 font-mono text-[10px] text-zinc-600">
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

// ────────────────────────────────────────────────────────────────────
// User Detailed Typing Profile Modal
// ────────────────────────────────────────────────────────────────────
function UserTypingProfileModal({ user, onClose }) {
  if (!user || !user.stats) return null;

  const stats = user.stats;
  const topWPM = user.highestWPM;

  const completionRate = stats.tests_started > 0
    ? Math.round((stats.tests_completed / stats.tests_started) * 100)
    : 0;

  const formatTime = (s) => {
    if (!s) return '0m';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const chartData = [
    { name: '15s', WPM: stats.wpm_15 || 0 },
    { name: '30s', WPM: stats.wpm_30 || 0 },
    { name: '60s', WPM: stats.wpm_60 || 0 },
    { name: '120s', WPM: stats.wpm_120 || 0 },
  ].filter(d => d.WPM > 0);

  const modes = [
    { label: '15s', wpm: stats.wpm_15, acc: stats.acc_15, consistency: stats.consistency_15 },
    { label: '30s', wpm: stats.wpm_30, acc: stats.acc_30, consistency: stats.consistency_30 },
    { label: '60s', wpm: stats.wpm_60, acc: stats.acc_60, consistency: stats.consistency_60 },
    { label: '120s', wpm: stats.wpm_120, acc: stats.acc_120, consistency: stats.consistency_120 },
  ];

  const tooltipStyle = {
    backgroundColor: '#0a0a0c',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#e4e4e7',
    fontSize: '11px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={backdropVariants}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        className="w-full max-w-2xl relative overflow-hidden rounded-2xl max-h-[92vh] overflow-y-auto custom-scrollbar"
        style={{
          background: 'rgba(9,9,11,0.97)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/[0.05] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="relative z-10 p-4 sm:p-5 space-y-3.5">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base uppercase shrink-0 overflow-hidden"
                style={{
                  backgroundColor: user.avatar_url ? 'transparent' : (user.avatar_color || '#6366f1'),
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: `0 0 20px ${user.avatar_color || '#6366f1'}30`,
                }}
              >
                {user.avatar_url
                  ? <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                  : user.display_name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-black text-zinc-100">{user.display_name}</h2>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded font-mono"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                    Typing Profile
                  </span>
                </div>
                {user.monkeytype_username && (
                  <a
                    href={`https://monkeytype.com/profile/${user.monkeytype_username}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                    onClick={e => e.stopPropagation()}
                  >
                    @{user.monkeytype_username} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              style={{ color: '#71717a' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e4e4e7'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a'; }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Peak WPM hero */}
          <div
            className="rounded-xl p-3 flex items-center justify-between relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.03))',
              borderLeft: '3px solid rgba(245,158,11,0.5)',
              border: '1px solid rgba(245,158,11,0.15)',
              borderLeftWidth: '3px',
            }}
          >
            <div className="absolute right-4 opacity-[0.04]">
              <TrendingUp className="w-16 h-16 text-amber-400" />
            </div>
            <div>
              <span className="text-[8px] uppercase font-black text-amber-500/70 tracking-widest block mb-0.5">Peak WPM · All Modes</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">{topWPM > 0 ? topWPM : '--'}</span>
                <span className="text-[10px] font-bold text-amber-600 uppercase">WPM</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest block mb-0.5">Tests Done</span>
              <span className="text-xl font-black text-zinc-200 font-mono">{stats.tests_completed?.toLocaleString() || 0}</span>
            </div>
          </div>

          {/* Stats + Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Activity stats */}
            <div className="rounded-xl p-3 space-y-2.5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-amber-400" /> Monkeytype Activity
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Started', value: stats.tests_started?.toLocaleString() || 0, color: '#e4e4e7' },
                  { label: 'Completed', value: stats.tests_completed?.toLocaleString() || 0, color: '#e4e4e7' },
                  { label: 'Completion', value: `${completionRate}%`, color: '#34d399' },
                  { label: 'Time Spent', value: formatTime(stats.time_typing), color: '#a78bfa' },
                ].map(s => (
                  <div key={s.label} className="p-1.5 rounded-lg text-center"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-0.5">{s.label}</span>
                    <span className="text-xs font-black font-mono" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="rounded-xl p-3 flex flex-col min-h-[130px]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5 mb-1.5">
                <Zap className="w-3 h-3 text-amber-400" /> Speed Curve (WPM)
              </span>
              <div className="flex-1 min-h-[85px]">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-700 text-xs">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#3f3f46" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#3f3f46" fontSize={8} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                      <Bar dataKey="WPM" fill="url(#barGrad)" radius={[3, 3, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Mode Breakdown */}
          <div>
            <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1.5 mb-2">
              <Award className="w-3 h-3 text-amber-400" /> Category Benchmark Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2">
              {modes.map(item => {
                const isBest = item.wpm && item.wpm === topWPM && topWPM > 0;
                const barPct = topWPM > 0 && item.wpm ? Math.min(100, Math.round((item.wpm / 150) * 100)) : 0;
                const accColor = item.acc >= 98 ? '#34d399' : item.acc >= 95 ? '#fbbf24' : '#71717a';

                return (
                  <div
                    key={item.label}
                    className="rounded-xl p-2.5 relative overflow-hidden transition-all"
                    style={{
                      background: isBest
                        ? 'linear-gradient(145deg, rgba(245,158,11,0.08), rgba(217,119,6,0.03))'
                        : 'rgba(255,255,255,0.02)',
                      border: isBest ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: isBest ? '0 4px 20px rgba(245,158,11,0.07)' : 'none',
                    }}
                  >
                    {isBest && (
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] uppercase font-black text-zinc-500 tracking-widest">{item.label}</span>
                      {isBest && (
                        <div className="flex items-center gap-0.5 px-1 py-0.5 rounded"
                          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                          <Zap className="w-1.5 h-1.5 text-amber-400 fill-amber-400" />
                          <span className="text-[7px] font-black text-amber-400 uppercase">Best</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black font-mono tracking-tight"
                        style={{ color: isBest ? '#fbbf24' : '#e4e4e7' }}>
                        {item.wpm ?? '--'}
                      </span>
                      <span className="text-[8px] text-zinc-600 font-semibold uppercase">wpm</span>
                    </div>
                    <div className="mt-1.5 space-y-0.5 pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-zinc-600">Accuracy</span>
                        <span className="font-bold font-mono" style={{ color: accColor }}>
                          {item.acc != null ? `${item.acc}%` : '--'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-zinc-600">Consistency</span>
                        <span className="font-bold font-mono text-amber-400/80">
                          {item.consistency != null ? `${item.consistency}%` : '--'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full rounded-full mt-1.5 overflow-hidden" style={{ height: '2px', background: 'rgba(255,255,255,0.05)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${barPct}%`,
                          background: isBest
                            ? 'linear-gradient(90deg, #f59e0b, #fde68a)'
                            : 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer timestamp */}
          {stats.last_synced && (
            <div className="text-center text-[9px] font-mono text-zinc-700 pt-1.5"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              Last synced from Monkeytype · {new Date(stats.last_synced).toLocaleString()}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
