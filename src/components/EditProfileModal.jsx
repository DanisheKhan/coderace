import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, User, Camera, Check, Sparkles } from 'lucide-react';

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
  const [selectedColor, setSelectedColor] = useState(profile?.avatar_color || COLORS[0].value);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen || !profile) return null;

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

    setLoading(true);
    setError('');

    try {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 relative z-10 shadow-2xl shadow-black/80 border border-[#252528]">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f1f23] mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h2 className="text-lg font-bold text-zinc-100">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
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
            <label className="section-label block text-center">Profile Photo</label>
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
            <label className="section-label block mb-1.5">Display Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                maxLength={25}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="section-label block mb-2">Avatar Fallback Color</label>
            <div className="grid grid-cols-4 gap-2.5">
              {COLORS.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className="h-10 rounded-xl relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                    style={{ backgroundColor: color.value }}
                    disabled={loading}
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
      </div>
    </div>
  );
};

export default EditProfileModal;
