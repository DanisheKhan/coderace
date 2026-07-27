import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, User, AtSign, Camera, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants } from '../lib/animations';

const COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Slate', value: '#64748b' }
];

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [selectedColor, setSelectedColor] = useState(profile?.avatar_color || COLORS[0].value);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [takenColors, setTakenColors] = useState([]);

  // Sync state whenever modal is opened or profile data updates
  useEffect(() => {
    if (isOpen && profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setSelectedColor(profile.avatar_color || COLORS[0].value);
      setAvatarPreview(profile.avatar_url || '');
      setAvatarFile(null);
      setError('');
      
      const fetchTakenColors = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('avatar_color')
            .neq('id', profile.id);
          if (data) {
            setTakenColors(data.map(p => p.avatar_color.toLowerCase()));
          }
        } catch (err) {
          console.error('Error fetching taken colors:', err);
        }
      };
      fetchTakenColors();
    }
  }, [isOpen, profile]);

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
    if (!displayName.trim()) {
      setError('Please enter a display name.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername) {
      setError('Please enter a unique username.');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (!avatarFile && !avatarPreview) {
      setError('Please upload your profile photo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check username uniqueness (excluding self)
      const { data: takenUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .neq('id', profile.id)
        .maybeSingle();

      if (takenUser) {
        setError(`Username '@${cleanUsername}' is already taken by another racer.`);
        setLoading(false);
        return;
      }

      // Check color uniqueness
      const { data: takenCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('avatar_color', selectedColor)
        .neq('id', profile.id)
        .maybeSingle();

      if (takenCheck) {
        setError('This color is already taken by another racer! Please choose or generate a different one.');
        setLoading(false);
        const { data: refreshColors } = await supabase
          .from('profiles')
          .select('avatar_color')
          .neq('id', profile.id);
        if (refreshColors) setTakenColors(refreshColors.map(p => p.avatar_color.toLowerCase()));
        return;
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
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            className="w-full max-w-md glass-panel rounded-2xl p-4 sm:p-6 relative z-10 shadow-2xl shadow-black/80 border border-[#252528] max-h-[92vh] overflow-y-auto custom-scrollbar font-sans text-zinc-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#1f1f23] mb-4 sm:mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h2 className="text-base sm:text-lg font-bold text-zinc-100">Edit Profile</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors touch-target flex items-center justify-center"
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
              {/* Avatar Upload area */}
              <div className="flex flex-col items-center gap-2">
                <label className="section-label block text-center text-xs font-mono uppercase text-zinc-400">Profile Photo</label>
                <div
                  onClick={triggerFileInput}
                  className={`w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all duration-300 ${
                    avatarPreview ? 'border-violet-500' : 'border-zinc-700 hover:border-violet-500 bg-zinc-900/40 hover:bg-zinc-900/60'
                  }`}
                  style={{ backgroundColor: avatarPreview ? 'transparent' : selectedColor }}
                  title="Click to update photo"
                >
                  {avatarPreview ? (
                    <>
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-bold uppercase tracking-wider gap-1">
                        <Camera className="w-4 h-4 text-zinc-200" />
                        <span>Change</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-white group-hover:text-zinc-200 transition-colors">
                      <span className="text-xl font-bold uppercase">{displayName?.charAt(0) || '?'}</span>
                    </div>
                  )}
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

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    maxLength={25}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">Unique Username (@handle)</label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="danishkhan"
                    maxLength={20}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs font-mono"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-2">Avatar Fallback Color</label>
                <div className="grid grid-cols-4 gap-2.5">
                  {COLORS.filter(color => !takenColors.includes(color.value.toLowerCase())).map((color) => {
                    const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className="h-10 rounded-xl relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                        style={{ backgroundColor: color.value }}
                        disabled={loading}
                        title={color.name}
                      >
                        {isSelected && (
                          <span className="bg-black/30 w-5 h-5 rounded-full flex items-center justify-center text-white">
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
                    let randomHex;
                    let attempts = 0;
                    do {
                      randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                      attempts++;
                    } while (takenColors.includes(randomHex.toLowerCase()) && attempts < 100);
                    setSelectedColor(randomHex);
                  }}
                  disabled={loading}
                  className="w-full mt-2.5 py-1.5 px-3 border border-dashed border-zinc-700 hover:border-violet-500/50 rounded-xl text-xxs font-semibold text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-zinc-900/10 hover:bg-violet-500/5 active:scale-[0.99] select-none"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                  <span>Generate Custom Color</span>
                </button>
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
                    'Save Settings'
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
