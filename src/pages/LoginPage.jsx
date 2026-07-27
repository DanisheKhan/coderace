import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Code2, Mail, Lock, User, AtSign, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../lib/animations';

const InputField = ({ label, type, value, onChange, placeholder, icon: Icon, disabled, helpText }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">{label}</label>
      {helpText && <span className="text-[9px] font-mono text-zinc-500">{helpText}</span>}
    </div>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-zinc-600 text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-xs transition-colors font-sans"
      />
    </div>
  </div>
);

const LoginPage = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all required fields.'); return; }

    let cleanUsername = '';
    if (isSignUp) {
      if (!displayName.trim()) { setError('Please enter your full name.'); return; }

      cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (!cleanUsername) { setError('Please enter a unique username.'); return; }
      if (cleanUsername.length < 3) { setError('Username must be at least 3 characters.'); return; }

      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Check username uniqueness in Supabase profiles table
        const { data: existingUser, error: checkErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .maybeSingle();

        if (existingUser) {
          setError(`Username '@${cleanUsername}' is already taken. Please choose another.`);
          setLoading(false);
          return;
        }

        const { error: err } = await signUp(email, password, displayName.trim(), cleanUsername);
        if (err) throw err;
        navigate('/onboarding', { replace: true });
      } else {
        const { error: err } = await signIn(email, password);
        if (err) throw err;
      }
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
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
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

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
            {isSignUp ? 'Create an account to track your DSA progress' : 'Sign in to access your sheet and leaderboard'}
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
          <AnimatePresence initial={false}>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden space-y-4"
              >
                <InputField 
                  label="Full Name / Racer Name" 
                  type="text" 
                  value={displayName} 
                  onChange={e => setDisplayName(e.target.value)} 
                  placeholder="e.g. Danish Khan" 
                  icon={User} 
                  disabled={loading} 
                />

                <InputField 
                  label="Unique Username (@handle)" 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                  placeholder="e.g. danishkhan" 
                  icon={AtSign} 
                  disabled={loading} 
                  helpText="Must be unique"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <InputField 
            label="Email Address" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="you@example.com" 
            icon={Mail} 
            disabled={loading} 
          />
          <InputField 
            label="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••" 
            icon={Lock} 
            disabled={loading} 
          />
          
          <AnimatePresence initial={false}>
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <InputField 
                  label="Confirm Password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="••••••••" 
                  icon={Lock} 
                  disabled={loading} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 mt-1 rounded-lg bg-white hover:bg-zinc-200 active:bg-zinc-300 text-zinc-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-zinc-900 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign In / Sign Up */}
        <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
          <p className="text-zinc-500 text-xs">
            {isSignUp ? 'Already have an account?' : 'Need to join the sheet?'}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-zinc-300 hover:text-white font-medium cursor-pointer transition-colors"
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
