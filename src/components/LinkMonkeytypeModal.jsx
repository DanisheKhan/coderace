import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, User, Key, Eye, EyeOff, ExternalLink, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants } from '../lib/animations';

export default function LinkMonkeytypeModal({ isOpen, onClose, onSaved }) {
  const { profile, updateProfile, refreshProfile } = useAuth();

  const [monkeytypeUsername, setMonkeytypeUsername] = useState(profile?.monkeytype_username || '');
  const [monkeytypeApeKey, setMonkeytypeApeKey] = useState(profile?.monkeytype_ape_key || '');
  const [monkeytypePublic, setMonkeytypePublic] = useState(profile?.monkeytype_public ?? false);
  const [showApeKey, setShowApeKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setMonkeytypeUsername(profile.monkeytype_username || '');
      setMonkeytypeApeKey(profile.monkeytype_ape_key || '');
      setMonkeytypePublic(profile.monkeytype_public ?? false);
      setError('');
    }
  }, [isOpen, profile]);

  if (!profile) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const usernameClean = monkeytypeUsername.trim();
    const apeKeyClean = monkeytypeApeKey.trim();

    if (apeKeyClean && (apeKeyClean.startsWith('http://') || apeKeyClean.startsWith('https://'))) {
      setError('Please enter a valid Monkeytype ApeKey token (it should be an alphanumeric API key, NOT a URL).');
      return;
    }

    setLoading(true);
    try {
      const { error: updateErr } = await updateProfile({
        monkeytype_username: usernameClean,
        monkeytype_ape_key: apeKeyClean,
        monkeytype_public: monkeytypePublic,
      });

      if (updateErr) throw updateErr;

      await refreshProfile();
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save Monkeytype settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial="hidden"
          animate="show"
          exit="exit"
          variants={backdropVariants}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            className="w-full max-w-md glass-panel rounded-2xl p-4 sm:p-6 relative z-10 shadow-2xl shadow-black/80 border border-[#252528] max-h-[92vh] overflow-y-auto custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#1f1f23] mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-100">Monkeytype Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors touch-target flex items-center justify-center cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="section-label block mb-1">Monkeytype Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={monkeytypeUsername}
                onChange={(e) => setMonkeytypeUsername(e.target.value)}
                placeholder="e.g. danishkhan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="section-label block">Monkeytype ApeKey</label>
              <a
                href="https://monkeytype.com/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
              >
                Get key on Monkeytype <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showApeKey ? 'text' : 'password'}
                value={monkeytypeApeKey}
                onChange={(e) => setMonkeytypeApeKey(e.target.value)}
                placeholder="ApeKey from account settings"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm font-mono"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowApeKey(!showApeKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showApeKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Your ApeKey is stored securely in Supabase and only used to fetch your speed stats.
            </p>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/5">
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">Show Stats on Leaderboard</span>
              <span className="text-[10px] text-zinc-500 block">Allow other users to view your typing PBs</span>
            </div>
            <input
              type="checkbox"
              checked={monkeytypePublic}
              onChange={(e) => setMonkeytypePublic(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f1f23]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-semibold transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                'Save to Supabase'
              )}
            </button>
          </div>
        </form>
      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
