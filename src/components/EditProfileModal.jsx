import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, User, AtSign, Camera, Check, Sparkles, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants } from '../lib/animations';

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

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, msg: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Sync state whenever modal is opened or profile data updates
  useEffect(() => {
    if (isOpen && profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setSelectedColor(profile.avatar_color || COLORS[0].value);
      setAvatarPreview(profile.avatar_url || '');
      setAvatarFile(null);
      setError('');
    }
  }, [isOpen, profile]);

  // Live Username Availability Check
  useEffect(() => {
    if (!isOpen || !username.trim() || !profile) {
      setUsernameStatus({ checking: false, available: null, msg: '' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    if (cleanUsername === profile.username?.toLowerCase()) {
      setUsernameStatus({ checking: false, available: true, msg: 'Current handle' });
      return;
    }

    if (cleanUsername.length < 3) {
      setUsernameStatus({ checking: false, available: false, msg: 'Min 3 chars' });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null, msg: 'Checking...' });
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', cleanUsername)
          .neq('id', profile.id)
          .maybeSingle();

        if (data) {
          setUsernameStatus({ checking: false, available: false, msg: 'Taken' });
        } else {
          setUsernameStatus({ checking: false, available: true, msg: 'Available!' });
        }
      } catch (err) {
        setUsernameStatus({ checking: false, available: true, msg: '' });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [username, isOpen, profile?.id, profile?.username]);

  if (!profile) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter a Full Name.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    setLoading(true);

    try {
      // Check username uniqueness if changed
      if (cleanUsername !== profile.username?.toLowerCase()) {
        const { data: takenUser } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', cleanUsername)
          .neq('id', profile.id)
          .maybeSingle();

        if (takenUser) {
          setError(`Username '@${cleanUsername}' is already taken by another racer.`);
          setLoading(false);
          return;
        }
      }

      let avatarUrl = profile.avatar_url || '';

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

      const { error: updateErr } = await updateProfile({
        display_name: displayName.trim(),
        username: cleanUsername,
        avatar_color: selectedColor,
        avatar_url: avatarUrl,
      });

      if (updateErr) throw updateErr;

      await refreshProfile();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
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
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md cursor-pointer font-sans"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            className="w-full max-w-md bg-[#0d0d10] border border-zinc-800 rounded-xl p-5 sm:p-6 relative z-10 shadow-2xl overflow-hidden font-sans text-zinc-100 cursor-default"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                  Edit Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Avatar Upload */}
              <div>
                <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                  Profile Avatar
                </label>
                <div className="flex items-center gap-3 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80">
                  <div 
                    onClick={triggerFileInput}
                    className="group relative w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border border-zinc-700/80 cursor-pointer shrink-0 transition-all hover:border-zinc-500 shadow-sm"
                    style={{ backgroundColor: avatarPreview ? 'transparent' : selectedColor }}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white/90" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {avatarPreview ? 'Photo Uploaded' : 'Upload Photo'}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                      {avatarFile ? avatarFile.name : 'PNG, JPG or WEBP'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded-md text-[10px] font-mono transition-colors shrink-0 cursor-pointer"
                  >
                    {avatarPreview ? 'Change' : 'Browse'}
                  </button>

                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name / Racer Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    maxLength={30}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs transition-colors font-sans"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Username (@handle) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                    Handle (@username)
                  </label>
                  {usernameStatus.msg && (
                    <span className={`text-[9px] font-mono font-semibold ${
                      usernameStatus.available ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {usernameStatus.msg}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="danishkhan"
                    maxLength={20}
                    className="w-full pl-9 pr-7 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs font-mono font-bold transition-colors"
                    disabled={loading}
                  />
                  {usernameStatus.available === true && (
                    <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">Accent Color</label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                      setSelectedColor(randomHex);
                    }}
                    disabled={loading}
                    className="text-[9px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Random</span>
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {COLORS.map((color) => {
                    const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className="h-6 rounded relative flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/10"
                        style={{ backgroundColor: color.value }}
                        disabled={loading}
                        title={color.name}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-white drop-shadow" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg text-xs font-mono font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 px-4 rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-zinc-900 animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
