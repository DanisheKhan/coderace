import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, User, Check, Camera, AtSign, ShieldCheck, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp } from '../lib/animations';

const COLORS = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Cyan', value: '#06b6d4' }
];

const OnboardingPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, msg: '' });

  const [selectedColor, setSelectedColor] = useState(() => {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randomIndex].value;
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [takenColors, setTakenColors] = useState([]);

  // Auto populate names from metadata or email
  useEffect(() => {
    if (user) {
      const metaName = user.user_metadata?.display_name || user.user_metadata?.full_name;
      if (metaName && metaName.trim()) {
        setDisplayName(metaName.trim());
        const cleanHandle = metaName.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(cleanHandle);
      } else if (user.email) {
        const emailHandle = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        setDisplayName(user.email.split('@')[0]);
        setUsername(emailHandle);
      }
    }
  }, [user]);

  // Check username availability when user types
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus({ checking: false, available: null, msg: '' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    if (cleanUsername.length < 3) {
      setUsernameStatus({ checking: false, available: false, msg: 'Username must be at least 3 characters' });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null, msg: '' });
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (data && data.id !== user?.id) {
          setUsernameStatus({ checking: false, available: false, msg: 'Username taken. Try another.' });
        } else {
          setUsernameStatus({ checking: false, available: true, msg: 'Username available!' });
        }
      } catch (err) {
        setUsernameStatus({ checking: false, available: true, msg: '' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, user?.id]);

  // Fetch taken colors to suggest unique ones
  useEffect(() => {
    const fetchTakenColors = async () => {
      try {
        const { data } = await supabase.from('profiles').select('avatar_color');
        if (data) {
          const colors = data.map(p => p.avatar_color ? p.avatar_color.toLowerCase() : '');
          setTakenColors(colors);
        }
      } catch (err) {
        console.error('Error fetching taken colors:', err);
      }
    };
    fetchTakenColors();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter your full Display Name.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Please choose a valid unique @username (at least 3 characters).');
      return;
    }

    if (usernameStatus.available === false) {
      setError('Selected @username is already taken. Please choose a different handle.');
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = '';
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `user_avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = data.publicUrl;
      }

      // Upsert user profile in Supabase
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName.trim(),
          username: cleanUsername,
          avatar_color: selectedColor,
          avatar_url: avatarUrl,
          email: user.email,
          approved: true, // Auto-approve onboarding profiles
        }, { onConflict: 'id' });

      if (upsertErr) throw upsertErr;

      // Refresh local context
      await refreshProfile();

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none"
    >
      {/* Background glow highlights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0d0d11]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl shadow-black/80 space-y-6">
        
        {/* Header Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Welcome to CodeRace</h1>
            <p className="text-zinc-400 text-xs mt-1">Set up your racer identity to join the global DSA tracker.</p>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Avatar Upload Frame */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Profile Photo</span>
            
            <div 
              onClick={triggerFileInput}
              className="relative cursor-pointer group"
              title="Click to upload profile photo"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-white/20 group-hover:border-violet-500 transition-all duration-300 shadow-xl"
                style={{ backgroundColor: avatarPreview ? 'transparent' : selectedColor }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white uppercase">
                    {displayName?.charAt(0) || '?'}
                  </span>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold uppercase tracking-wider gap-1 rounded-full">
                  <Camera className="w-5 h-5 text-zinc-200" />
                  <span>Upload</span>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-violet-600 border-2 border-[#0d0d11] flex items-center justify-center text-white shadow-md">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={loading}
            />
          </div>

          {/* Display Name Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Display Name *</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Danish Khan"
                maxLength={30}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 text-xs font-semibold transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          {/* Username Input (@handle) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Unique Username (@handle) *</label>
              {usernameStatus.msg && (
                <span className={`text-[10px] font-mono font-semibold ${
                  usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {usernameStatus.msg}
                </span>
              )}
            </div>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="danishkhan"
                maxLength={20}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-amber-300 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 text-xs font-mono font-bold transition-colors"
                disabled={loading}
              />
              {usernameStatus.available === true && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              )}
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">Avatar Accent Color</label>
            <div className="grid grid-cols-4 gap-2.5">
              {COLORS.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className="h-10 rounded-xl relative flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                    style={{ backgroundColor: color.value }}
                    disabled={loading}
                    title={color.name}
                  >
                    {isSelected && (
                      <span className="bg-black/40 w-5 h-5 rounded-full flex items-center justify-center text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            <button
              type="button"
              onClick={() => {
                const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                setSelectedColor(randomHex);
              }}
              disabled={loading}
              className="w-full py-1.5 px-3 border border-dashed border-zinc-800 hover:border-violet-500/50 rounded-xl text-[10px] font-mono font-semibold text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-zinc-900/40 hover:bg-violet-500/10"
            >
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Generate Random Theme Color</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <>
                <span>Save & Enter Race</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default OnboardingPage;
