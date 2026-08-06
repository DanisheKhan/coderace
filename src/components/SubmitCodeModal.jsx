import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, CheckCircle2, Sparkles, Copy, Lightbulb, Eye, Check, AlertCircle, Zap, Rocket } from 'lucide-react';
import { backdropVariants, modalVariants } from '../lib/animations';

const SOLVE_METHODS = [
  { id: 'gpt',      label: 'AI / GPT',   icon: Sparkles,  activeClass: 'bg-violet-500/10 border-violet-500/25 text-violet-300' },
  { id: 'copy',     label: 'Copy-Paste', icon: Copy,      activeClass: 'bg-rose-500/10   border-rose-500/25   text-rose-300' },
  { id: 'hint',     label: 'Hint Used',  icon: Lightbulb, activeClass: 'bg-amber-500/10  border-amber-500/25  text-amber-300' },
  { id: 'solution', label: 'Ans Seen',   icon: Eye,       activeClass: 'bg-sky-500/10    border-sky-500/25    text-sky-300' },
];

const SubmitCodeModal = ({ isOpen, onClose, question, currentProgress, onSubmit }) => {
  const [bruteForce, setBruteForce] = useState(true);
  const [optimized, setOptimized] = useState(false);
  const [bruteCode, setBruteCode] = useState('');
  const [optimalCode, setOptimalCode] = useState('');
  const [solveMethod, setSolveMethod] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (question && currentProgress) {
      const rawNotes = currentProgress.notes || '';
      const bf = currentProgress.brute_force || false;
      const opt = currentProgress.optimized || false;

      // If no approach was previously set, default to Brute Force
      const defaultBf = (!bf && !opt) ? true : bf;
      const defaultOpt = (!bf && !opt) ? false : opt;

      setBruteForce(defaultBf);
      setOptimized(defaultOpt);

      if (bf && opt && rawNotes.includes('=== ⚡ BRUTE FORCE SOLUTION ===')) {
        const parts = rawNotes.split('=== 🚀 OPTIMAL SOLUTION ===');
        setBruteCode(parts[0]?.replace('=== ⚡ BRUTE FORCE SOLUTION ===', '').trim() || '');
        setOptimalCode(parts[1]?.trim() || '');
      } else if (bf) {
        setBruteCode(rawNotes);
        setOptimalCode('');
      } else {
        setOptimalCode(rawNotes);
        setBruteCode('');
      }

      setSolveMethod(currentProgress.solve_method || null);
    } else {
      setBruteForce(true);
      setOptimized(false);
      setBruteCode('');
      setOptimalCode('');
      setSolveMethod(null);
    }
    setErrorMsg('');
  }, [question, currentProgress, isOpen]);

  if (!isOpen || !question) return null;

  const makeTabHandler = (setter) => (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.target.selectionStart;
      const val = e.target.value;
      setter(val.substring(0, s) + '  ' + val.substring(e.target.selectionEnd));
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0);
    }
  };

  const handleSave = async () => {
    if (!bruteForce && !optimized) {
      setErrorMsg('Please enable at least one approach to submit your solution.');
      return;
    }
    if (bruteForce && !bruteCode.trim()) {
      setErrorMsg('Please enter your brute force code.');
      return;
    }
    if (optimized && !optimalCode.trim()) {
      setErrorMsg('Please enter your optimal code.');
      return;
    }
    let finalNotes = '';
    if (bruteForce && optimized) {
      finalNotes = `=== ⚡ BRUTE FORCE SOLUTION ===\n${bruteCode.trim()}\n\n=== 🚀 OPTIMAL SOLUTION ===\n${optimalCode.trim()}`;
    } else if (bruteForce) {
      finalNotes = bruteCode.trim();
    } else {
      finalNotes = optimalCode.trim();
    }

    const existingAttempts = Array.isArray(currentProgress?.attempts) ? currentProgress.attempts : [];
    const newAttempt = {
      id: Date.now(),
      attempt_number: existingAttempts.length + 1,
      submitted_at: new Date().toISOString(),
      notes: finalNotes,
      solve_method: solveMethod,
      brute_force: bruteForce,
      optimized: optimized,
    };
    const updatedAttempts = [newAttempt, ...existingAttempts];

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        status: 'done',
        notes: finalNotes,
        solve_method: solveMethod,
        brute_force: bruteForce,
        optimized: optimized,
        attempts: updatedAttempts,
      });
      onClose();
    } catch (err) {
      console.error('Error submitting solution:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const attemptCount = (currentProgress?.attempts?.length || 0) + 1;

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden" animate="show" exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl glass-panel rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f23] shrink-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Submit Solution
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-500/10 border border-violet-500/20 text-violet-300">
                  Attempt #{attemptCount}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">
                  {question.topic} · {question.subtopic}
                </span>
              </div>
              <h3 className="font-bold text-zinc-100 text-base sm:text-lg leading-tight mt-0.5 truncate">
                {question.problem_name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors ml-3"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">

            {/* APPROACH SELECTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="section-label flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-violet-400" />
                  Approach Implemented <span className="text-rose-400 ml-0.5">*</span>
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">Toggle one or both</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Brute Force toggle */}
                <button
                  type="button"
                  onClick={() => { setBruteForce(v => !v); setErrorMsg(''); }}
                  className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                    bruteForce
                      ? 'glass-input border-amber-500/30 text-amber-300'
                      : 'glass-input text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${bruteForce ? 'text-amber-400' : 'text-zinc-600'}`} />
                    Brute Force
                  </span>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                    bruteForce
                      ? 'bg-amber-500 border-amber-400 text-zinc-900'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}>
                    {bruteForce && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>

                {/* Optimal toggle */}
                <button
                  type="button"
                  onClick={() => { setOptimized(v => !v); setErrorMsg(''); }}
                  className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                    optimized
                      ? 'glass-input border-emerald-500/30 text-emerald-300'
                      : 'glass-input text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Rocket className={`w-4 h-4 ${optimized ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    Optimal
                  </span>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                    optimized
                      ? 'bg-emerald-500 border-emerald-400 text-zinc-900'
                      : 'border-zinc-700 bg-zinc-900'
                  }`}>
                    {optimized && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              </div>
            </div>

            {bruteForce && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="section-label flex items-center gap-1.5" style={{ color: 'rgba(251,191,36,0.7)' }}>
                    <Zap className="w-3 h-3" />
                    Brute Force Code <span className="text-rose-400 ml-0.5">*</span>
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">Tab to indent</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#252528]" style={{ background: '#070709' }}>
                  <div className="flex items-center gap-2 px-3.5 py-2 border-b border-[#1f1f23]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    </div>
                    <span className="text-[10px] text-zinc-700 font-mono">solution.cpp</span>
                  </div>
                  <textarea
                    value={bruteCode}
                    onChange={e => setBruteCode(e.target.value)}
                    onKeyDown={makeTabHandler(setBruteCode)}
                    placeholder={`// Brute Force approach — O(N²)\nvoid solve() {\n    \n}`}
                    rows={7}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    className="w-full px-4 py-3 text-xs font-mono bg-transparent text-zinc-200 placeholder:text-zinc-700 focus:outline-none resize-none leading-relaxed custom-scrollbar tracking-wide"
                  />
                </div>
              </div>
            )}
            {/* OPTIMAL CODE EDITOR */}
            {optimized && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="section-label flex items-center gap-1.5" style={{ color: 'rgba(52,211,153,0.7)' }}>
                    <Rocket className="w-3 h-3" />
                    Optimal Code <span className="text-rose-400 ml-0.5">*</span>
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono">Tab to indent</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#252528]" style={{ background: '#070709' }}>
                  <div className="flex items-center gap-2 px-3.5 py-2 border-b border-[#1f1f23]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    </div>
                    <span className="text-[10px] text-zinc-700 font-mono">solution.cpp</span>
                  </div>
                  <textarea
                    value={optimalCode}
                    onChange={e => setOptimalCode(e.target.value)}
                    onKeyDown={makeTabHandler(setOptimalCode)}
                    placeholder={`// Optimal approach — O(N) or O(log N)\nvoid solve() {\n    \n}`}
                    rows={7}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    className="w-full px-4 py-3 text-xs font-mono bg-transparent text-zinc-200 placeholder:text-zinc-700 focus:outline-none resize-none leading-relaxed custom-scrollbar tracking-wide"
                  />
                </div>
              </div>
            )}

            {!bruteForce && !optimized && (
              <div className="py-8 text-center border border-dashed border-[#27272a] rounded-xl text-zinc-600 text-xs font-mono">
                Toggle an approach above to open its code editor.
              </div>
            )}

            {/* HOW DID YOU SOLVE IT */}
            <div className="space-y-2">
              <span className="section-label block">How did you solve it? <span className="normal-case text-zinc-600">(optional)</span></span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SOLVE_METHODS.map(m => {
                  const Icon = m.icon;
                  const active = solveMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSolveMethod(active ? null : m.id)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                        active ? m.activeClass : 'glass-input text-zinc-500 hover:text-zinc-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ERROR BANNER */}
          {errorMsg && (
            <div className="mx-5 mb-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[#1f1f23] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#27272a] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit & Mark Solved
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubmitCodeModal;
