import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Code2, Mail, Lock, User, AtSign, AlertCircle, ArrowRight, ArrowLeft, 
  Camera, Upload, Image as ImageIcon, Sparkles, Check
} from 'lucide-react';
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

const InputField = ({ label, type, value, onChange, placeholder, icon: Icon, disabled, helpText, required }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
        {label} {required && <span className="text-zinc-500 font-bold">*</span>}
      </label>
      {helpText && <span className="text-[9px] font-mono text-zinc-500">{helpText}</span>}
    </div>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800/90 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs transition-colors font-sans"
      />
    </div>
  </div>
);

const LoginPage = () => {
  const { signIn, signUp, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile Customization State
  const [selectedColor, setSelectedColor] = useState(() => {
    const randomIndex = Math.floor(Math.random() * COLORS.length);
    return COLORS[randomIndex].value;
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);

  // Username Availability State
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, msg: '' });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check Username Availability live on Sign Up
  useEffect(() => {
    if (!isSignUp || !username.trim()) {
      setUsernameStatus({ checking: false, available: null, msg: '' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

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
  }, [username, isSignUp]);

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

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    let cleanUsername = '';
    if (isSignUp) {
      if (!displayName.trim()) {
        setError('Please enter your Full Name.');
        return;
      }

      cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!cleanUsername || cleanUsername.length < 3) {
        setError('Please enter a valid unique handle (at least 3 characters).');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);

      // Verify username uniqueness again right before sign up
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        setError(`Username '@${cleanUsername}' is already taken. Please choose a different handle.`);
        setUsernameStatus({ checking: false, available: false, msg: 'Taken' });
        setLoading(false);
        return;
      }
    } else {
      setLoading(true);
    }

    try {
      if (isSignUp) {
        // 1. Sign up user via Supabase Auth
        const res = await signUp(email, password, displayName.trim(), cleanUsername);
        if (res.error) throw res.error;

        const userId = res.data?.user?.id;
        if (!userId) throw new Error('Failed to create account.');

        // 2. Upload avatar photo if selected
        let avatarUrl = '';
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `user_avatars/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile);

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            avatarUrl = urlData?.publicUrl || '';
          }
        }

        // 3. Upsert complete profile in profiles table
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            display_name: displayName.trim(),
            username: cleanUsername,
            avatar_color: selectedColor,
            avatar_url: avatarUrl,
            email: email.trim(),
            approved: true
          }, { onConflict: 'id' });

        if (profileErr) throw profileErr;

        await refreshProfile();
        navigate('/dashboard', { replace: true });
      } else {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
        await refreshProfile();
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('User already registered') || msg.includes('already exists')) {
        setError('An account with this email address already exists. Please Sign In instead.');
      } else {
        setError(msg || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative font-sans text-zinc-100 selection:bg-zinc-800 selection:text-white"
    >
      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors font-mono"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      {/* Main Minimal Classic Card Container */}
      <motion.div 
        layout
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`w-full border border-zinc-800 bg-[#0d0d10] rounded-xl p-6 sm:p-7 relative z-10 shadow-lg transition-all ${
          isSignUp ? 'max-w-2xl' : 'max-w-sm'
        }`}
      >
        {/* Minimal Header */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2 text-zinc-100">
            <Code2 className="w-4 h-4 text-zinc-100" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight font-mono">
            CodeRace
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5 text-center font-mono">
            {isSignUp ? 'Set up your racer identity to join the leaderboard' : 'Sign in to access your sheet and leaderboard'}
          </p>

          {/* Minimal Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/80 w-full max-w-xs mt-4">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer select-none text-center ${
                !isSignUp ? 'bg-white text-zinc-900 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer select-none text-center ${
                isSignUp ? 'bg-white text-zinc-900 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              className="mb-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-start gap-2 overflow-hidden"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp ? (
            // 2-Column Minimal Layout for Registration
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: Avatar & Handle */}
              <div className="space-y-3.5 bg-zinc-950/60 p-3.5 rounded-lg border border-zinc-800/80 flex flex-col justify-between">
                <div>
                  <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400 mb-2">
                    Profile Avatar
                  </label>

                  {/* Clean Minimal Avatar Uploader */}
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
                        {avatarPreview ? 'Photo Selected' : 'Upload Photo'}
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

                {/* Accent Color Selection */}
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
                          className="h-5.5 rounded relative flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/10"
                          style={{ backgroundColor: color.value }}
                          disabled={loading}
                          title={color.name}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Handle Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-mono font-medium uppercase tracking-wider text-zinc-400">
                      Handle (@username) <span className="text-zinc-500 font-bold">*</span>
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
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g. danishkhan"
                      maxLength={20}
                      className="w-full pl-9 pr-7 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs font-mono font-bold transition-colors"
                      disabled={loading}
                    />
                    {usernameStatus.available === true && (
                      <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Personal & Credentials */}
              <div className="space-y-3 flex flex-col justify-between">
                <InputField 
                  label="Full Name / Racer Name" 
                  type="text" 
                  value={displayName} 
                  onChange={e => setDisplayName(e.target.value)} 
                  placeholder="e.g. Danish Khan" 
                  icon={User} 
                  disabled={loading} 
                  required
                />

                <InputField 
                  label="Email Address" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="you@example.com" 
                  icon={Mail} 
                  disabled={loading} 
                  required
                />

                <InputField 
                  label="Password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  icon={Lock} 
                  disabled={loading} 
                  required
                />

                <InputField 
                  label="Confirm Password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  icon={Lock} 
                  disabled={loading} 
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                >
                  {loading ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-zinc-900 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Start</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // 1-Column Classic Layout for Sign In
            <div className="space-y-3.5">
              <InputField 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                icon={Mail} 
                disabled={loading} 
                required
              />
              <InputField 
                label="Password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                icon={Lock} 
                disabled={loading} 
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-zinc-900 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
