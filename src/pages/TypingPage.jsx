import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import { getAllTypingProfiles, getTypingProfile } from '../lib/monkeytypeService';
import MonkeytypePanel from '../components/MonkeytypePanel';
import LinkMonkeytypeModal from '../components/LinkMonkeytypeModal';
import { 
  Keyboard, Trophy, Flame, Zap, Award, Target, Activity, 
  ExternalLink, Search, Sparkles, Star, ShieldAlert
} from 'lucide-react';

const panelCls = 'rounded-2xl border border-white/[0.05] p-5 transition-all duration-300';
const panelBg  = { background: 'rgba(11,11,14,0.8)', backdropFilter: 'blur(12px)' };

export default function TypingPage() {
  const { profile } = useAuth();
  const { profiles, fetchProfiles } = useProgressStore();
  const [typingStats, setTypingStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all profiles and typing profiles
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

  useEffect(() => {
    loadTypingLeaderboard();
  }, []);

  // Merge profile details with typing statistics
  const leaderboardData = useMemo(() => {
    return profiles
      .map(p => {
        const stats = typingStats.find(s => s.user_id === p.id);
        if (!stats) return null;
        
        // Find highest WPM across all time categories
        const highestWPM = Math.max(
          stats.wpm_15 || 0,
          stats.wpm_30 || 0,
          stats.wpm_60 || 0,
          stats.wpm_120 || 0
        );

        return {
          ...p,
          stats,
          highestWPM,
        };
      })
      .filter(Boolean)
      .filter(item => item.monkeytype_public === true || item.id === profile?.id)
      .sort((a, b) => b.highestWPM - a.highestWPM);
  }, [profiles, typingStats, profile?.id]);

  // Filter leaderboard based on search query
  const filteredLeaderboard = useMemo(() => {
    if (!searchTerm.trim()) return leaderboardData;
    const query = searchTerm.toLowerCase();
    return leaderboardData.filter(item => 
      item.display_name.toLowerCase().includes(query) ||
      (item.monkeytype_username || '').toLowerCase().includes(query)
    );
  }, [leaderboardData, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.05] p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, rgba(16,16,20,0.9), rgba(10,10,12,0.85))' }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Speed Typing Arena</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight">CodeRace Typing Leaderboard</h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Track your typing benchmarks, compare speeds with other developers, and keep your hands ready for high-speed coding.
            </p>
          </div>

          <button
            onClick={() => setIsLinkModalOpen(true)}
            className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Keyboard className="w-4 h-4" />
            <span>Link Monkeytype Profile</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Leaderboard Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`${panelCls}`} style={panelBg}>
            <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-zinc-100">Speed Rankings</h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search racers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-zinc-200 placeholder:text-zinc-600 focus:outline-none text-xs border border-white/5 bg-black/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
                </div>
                <p className="mt-3 text-xs text-zinc-500 animate-pulse">Loading typing rankings...</p>
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="py-12 text-center text-zinc-500">
                <Keyboard className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm font-semibold">No speed data found</p>
                <p className="text-xs text-zinc-600 mt-0.5">Link your Monkeytype profile to appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.04] text-[10px] text-zinc-500 uppercase font-black tracking-wider">
                      <th className="py-3 pl-2">Rank</th>
                      <th className="py-3">Racer</th>
                      <th className="py-3 text-center">Peak Speed</th>
                      <th className="py-3 text-center">60s Speed</th>
                      <th className="py-3 text-right pr-2">Tests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {filteredLeaderboard.map((item, idx) => {
                      const isSelf = item.id === profile?.id;
                      const isTop3 = idx < 3;
                      const medalColors = ['text-yellow-400', 'text-zinc-300', 'text-amber-600'];

                      return (
                        <tr 
                          key={item.id} 
                          className={`group transition-colors ${isSelf ? 'bg-amber-500/[0.03] text-amber-300' : 'hover:bg-white/[0.01]'}`}
                        >
                          <td className="py-3.5 pl-2 font-bold font-mono text-sm w-12">
                            {isTop3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/5 ${medalColors[idx]}`}>
                                <Star className="w-3.5 h-3.5 fill-current" />
                              </span>
                            ) : (
                              <span className="text-zinc-500 pl-2">#{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white uppercase text-xs shrink-0 overflow-hidden border border-white/10"
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
                                  <span className="text-xs font-bold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
                                    {item.display_name}
                                  </span>
                                  {isSelf && (
                                    <span className="text-[8px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase">You</span>
                                  )}
                                </div>
                                {item.monkeytype_username && (
                                  <a 
                                    href={`https://monkeytype.com/profile/${item.monkeytype_username}`}
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] text-zinc-500 hover:text-amber-400 inline-flex items-center gap-0.5 mt-0.5"
                                  >
                                    @{item.monkeytype_username} <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 text-center font-bold font-mono text-sm text-amber-400">
                            {item.highestWPM} <span className="text-[9px] font-normal text-zinc-500 uppercase">WPM</span>
                          </td>
                          <td className="py-3.5 text-center font-mono text-xs text-zinc-300">
                            {item.stats.wpm_60 ? (
                              <span>
                                {item.stats.wpm_60} <span className="text-[8px] text-zinc-600">({item.stats.acc_60}%)</span>
                              </span>
                            ) : '--'}
                          </td>
                          <td className="py-3.5 text-right pr-2 font-mono text-xs text-zinc-500">
                            {item.stats.tests_completed?.toLocaleString() || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: User's Own Detail Stats Panel */}
        <div className="lg:col-span-5 space-y-6">
          <MonkeytypePanel onOpenEditProfile={() => setIsLinkModalOpen(true)} />
        </div>

      </div>

      <LinkMonkeytypeModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          loadTypingLeaderboard();
        }}
      />
    </div>
  );
}
