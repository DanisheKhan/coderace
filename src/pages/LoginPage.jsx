import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Code2, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (isSignUp && password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error: err } = await signUp(email, password);
        if (err) throw err;
        setSuccess(true);
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

  const InputField = ({ label, type, value, onChange, placeholder, icon: Icon }) => (
    <div>
      <label className="section-label block mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={loading}
          className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm glass-panel rounded-2xl p-8 relative z-10 shadow-2xl shadow-black/50">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center mb-4 shadow-md shadow-violet-500/20">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">
            CodeRace
          </h1>
          <p className="text-zinc-500 text-xs mt-2 text-center">
            {isSignUp ? 'Create your account to join the race' : 'Sign in to track your DSA progress'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Account created!</p>
              <p className="mt-0.5 text-emerald-400/70">Check your email to confirm, or sign in if confirmations are disabled.</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" icon={Mail} />
          <InputField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" icon={Lock} />
          {isSignUp && (
            <InputField label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" icon={Lock} />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-semibold transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-6 pt-5 border-t border-[#1f1f23] text-center">
          <p className="text-zinc-500 text-xs">
            {isSignUp ? 'Already have an account?' : 'Need to join the sheet?'}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(false); }}
              className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer transition-colors"
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
