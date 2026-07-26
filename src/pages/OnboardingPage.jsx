import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, User, Check, Camera } from 'lucide-react';

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

const OnboardingPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
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

  useEffect(() => {
    if (user?.email) {
      // Pre-fill display name from email prefix
      const username = user.email.split('@')[0];
      setDisplayName(username.charAt(0).toUpperCase() + username.slice(1));
    }
  }, [user]);

  // Fetch already selected profile colors
  useEffect(() => {
    const fetchTakenColors = async () => {
      try {
        const { data } = await supabase.from('profiles').select('avatar_color');
        if (data) {
          const colors = data.map(p => p.avatar_color.toLowerCase());
          setTakenColors(colors);
          
          // Ensure default selected color is unique
          setSelectedColor(prevColor => {
            if (colors.includes(prevColor.toLowerCase())) {
              const availableDefault = COLORS.find(c => !colors.includes(c.value.toLowerCase()));
              if (availableDefault) {
                return availableDefault.value;
              } else {
                let randomHex;
                do {
                  randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                } while (colors.includes(randomHex.toLowerCase()));
                return randomHex;
              }
            }
            return prevColor;
          });
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
    if (!displayName.trim()) {
      setError('Please enter a display name.');
      return;
    }
    if (!avatarFile) {
      setError('Please upload a profile photo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Double check that the color is still available (concurrency validation)
      const { data: takenCheck } = await supabase
        .from('profiles')
        .select('id')
        .eq('avatar_color', selectedColor)
        .maybeSingle();

      if (takenCheck) {
        setError('This color was just taken by another racer! Please choose or generate a different one.');
        setLoading(false);
        // Refresh taken colors list
        const { data: refreshColors } = await supabase.from('profiles').select('avatar_color');
        if (refreshColors) setTakenColors(refreshColors.map(p => p.avatar_color.toLowerCase()));
        return;
      }
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

      const { error: insertErr } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: displayName.trim(),
          avatar_color: selectedColor,
          avatar_url: avatarUrl,
          email: user.email
        });

      if (insertErr) throw insertErr;
      
      // Update local context
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
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm glass-panel rounded-2xl p-8 relative z-10 shadow-2xl shadow-black/50">
        <div className="flex flex-col items-center mb-7 text-center">
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Welcome to CodeRace</h1>
          <p className="text-zinc-500 text-xs mt-2">
            Set up your profile to join the DSA tracker board.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload area */}
          <div className="flex flex-col items-center gap-2">
            <label className="section-label block text-center mb-1">Profile Photo (Mandatory)</label>
            <div 
              onClick={triggerFileInput}
              className={`w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group transition-all duration-300 ${
                avatarPreview ? 'border-violet-500' : 'border-zinc-700 hover:border-violet-500 bg-zinc-900/40 hover:bg-zinc-900/60'
              }`}
              title="Click to upload photo"
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
                <div className="flex flex-col items-center gap-1 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span className="text-[8px] font-semibold uppercase tracking-wider">Add Photo</span>
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
            <label className="section-label block mb-2">Display Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Danish Khan"
                maxLength={25}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="section-label block mb-3">Avatar Color</label>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.filter(color => !takenColors.includes(color.value.toLowerCase())).map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.value.toLowerCase();
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className="h-12 rounded-xl relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
                    style={{ backgroundColor: color.value }}
                    disabled={loading}
                    title={color.name}
                  >
                    {isSelected && (
                      <span className="bg-black/30 w-6 h-6 rounded-full flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* Show custom color box if not in defaults */}
              {!COLORS.some(color => color.value.toLowerCase() === selectedColor.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => setSelectedColor(selectedColor)}
                  className="h-12 rounded-xl relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md border border-white/20 animate-fadeIn"
                  style={{ backgroundColor: selectedColor }}
                  disabled={loading}
                >
                  <span className="bg-black/30 w-6 h-6 rounded-full flex items-center justify-center text-white">
                    <Check className="w-4 h-4" />
                  </span>
                </button>
              )}
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
              className="w-full mt-3 py-2 px-3 border border-dashed border-zinc-700 hover:border-violet-500/50 rounded-xl text-xxs font-semibold text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-zinc-900/10 hover:bg-violet-500/5 active:scale-[0.99] select-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span>Generate Custom Color</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-semibold transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              'Save & Enter Race'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
