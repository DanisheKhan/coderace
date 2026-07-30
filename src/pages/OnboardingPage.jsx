import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, User, Check, Camera, AtSign, AlertCircle, ArrowRight, Code2, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../lib/animations';

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

    if (!avatarFile && !avatarPreview) {
      setError('Please upload your profile photo to continue.');
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
          approved: true, // Immediate access
        }, { onConflict: 'id' });

      if (upsertErr) throw upsertErr;

      // Refresh local context
      await refreshProfile();

      // Redirect directly to dashboard
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
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-3 text-zinc-100">
            <Code2 className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Code<span className="text-violet-400">Race</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1 text-center">
            Set up your racer identity to join the sheet and leaderboard
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Profile Photo Upload */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                PROFILE PHOTO <span className="text-rose-400 font-bold">*</span>
              </label>
              {avatarPreview && (
                <span className="text-[9px] font-mono text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Uploaded
                </span>
              )}
            </div>
            
            <div 
              onClick={triggerFileInput}
              className={`group relative w-full p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                avatarPreview 
                  ? 'border-violet-500/40 bg-zinc-950/90' 
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/80'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-700/80 shrink-0 relative"
                style={{ backgroundColor: avatarPreview ? 'transparent' : selectedColor }}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-white/80" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate group-hover:text-violet-300 transition-colors">
                  {avatarPreview ? 'Change Photo' : 'Upload Profile Photo'}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                  {avatarFile ? avatarFile.name : 'PNG, JPG, or WEBP'}
                </p>
              </div>

              <div className="w-7 h-7 rounded-md bg-zinc-900 group-hover:bg-zinc-800 text-zinc-400 group-hover:text-white flex items-center justify-center transition-all shrink-0 border border-zinc-800">
                <Upload className="w-3.5 h-3.5" />
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

          {/* Full Name Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">FULL NAME / RACER NAME *</label>
            </div>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Danish Khan"
                maxLength={30}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs transition-colors font-sans"
                disabled={loading}
              />
            </div>
          </div>

          {/* Username Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">UNIQUE USERNAME (@HANDLE) *</label>
              {usernameStatus.msg && (
                <span className={`text-[9px] font-mono font-semibold ${
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
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="e.g. danishkhan"
                maxLength={20}
                className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-zinc-600 text-amber-300 placeholder:text-zinc-600 focus:outline-none text-xs font-mono font-bold transition-colors"
                disabled={loading}
              />
              {usernameStatus.available === true && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              )}
            </div>
          </div>

          {/* Avatar Accent Color */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">AVATAR ACCENT COLOR</label>
              <button
                type="button"
                onClick={() => {
                  const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                  setSelectedColor(randomHex);
                }}
                disabled={loading}
                className="text-[9px] font-mono text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-violet-400" />
                <span>Randomize</span>
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {COLORS.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className="h-7 rounded-md relative flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/10"
                    style={{ backgroundColor: color.value }}
                    disabled={loading}
                    title={color.name}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button (matching LoginPage button style) */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-2 rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-zinc-900 animate-spin" />
            ) : (
              <>
                <span>Save & Submit Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default OnboardingPage;
