import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, ExternalLink, Copy, Check, User, Sparkles, Lightbulb, Eye, Zap, Rocket, History, Clock } from 'lucide-react';
import { backdropVariants, modalVariants } from '../lib/animations';
import { SolveTags, DiffDot } from './UserProfileModal';

const SolutionViewModal = ({ isOpen, onClose, question, prog, user }) => {
  const [copiedSection, setCopiedSection] = useState('');
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState(0);

  if (!isOpen || !question || !prog) return null;

  const attempts = Array.isArray(prog.attempts) && prog.attempts.length > 0
    ? prog.attempts
    : [{
        attempt_number: 1,
        submitted_at: prog.updated_at,
        notes: prog.notes || '',
        solve_method: prog.solve_method,
        brute_force: prog.brute_force,
        optimized: prog.optimized,
      }];

  const currentAttempt = attempts[selectedAttemptIdx] || attempts[0];
  const codeSnippet = currentAttempt?.notes || '';
  const solutionLink = prog.solution_link || '';

  const isMultiSection = codeSnippet.includes('=== ⚡ BRUTE FORCE SOLUTION ===') && codeSnippet.includes('=== 🚀 OPTIMAL SOLUTION ===');

  let brutePart = '';
  let optimalPart = '';

  if (isMultiSection) {
    const parts = codeSnippet.split('=== 🚀 OPTIMAL SOLUTION ===');
    brutePart = parts[0]?.replace('=== ⚡ BRUTE FORCE SOLUTION ===', '').trim() || '';
    optimalPart = parts[1]?.trim() || '';
  }

  const handleCopyCode = (textToCopy, sectionKey) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="show"
        exit="exit"
        variants={backdropVariants}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl cursor-pointer"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[90vh]"
          style={{ background: '#09090b', boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 32px 80px rgba(0,0,0,0.95)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.06] bg-zinc-950/80 shrink-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Solution Code
                </span>
                {user && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                    <User className="w-2.5 h-2.5 text-violet-400" />
                    <span>{user.display_name || user.username}</span>
                  </span>
                )}
                <DiffDot difficulty={question.difficulty} />
              </div>
              <h3 className="font-bold text-zinc-100 text-base sm:text-lg leading-tight truncate">
                {question.problem_name}
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                {question.topic} · {question.subtopic}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-200 cursor-pointer ml-3 p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Solution Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
            
            {/* Attempt Selector Tabs (If multiple attempts exist) */}
            {attempts.length > 1 && (
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-violet-400" />
                    Solution Attempts History ({attempts.length})
                  </span>
                  {currentAttempt.submitted_at && (
                    <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      {new Date(currentAttempt.submitted_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {attempts.map((att, idx) => {
                    const isSelected = selectedAttemptIdx === idx;
                    return (
                      <button
                        key={att.id || idx}
                        onClick={() => setSelectedAttemptIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-violet-500/15 border-violet-500/30 text-violet-300 shadow-sm'
                            : 'border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <span>Attempt #{att.attempt_number || (attempts.length - idx)}</span>
                        {idx === 0 && <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-sans">Latest</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Metadata Tags */}
            <div className="flex items-center justify-between gap-2 flex-wrap bg-zinc-950 p-3 rounded-xl border border-white/[0.05]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">Metadata:</span>
                <SolveTags prog={currentAttempt} />
              </div>

              {solutionLink && (
                <a
                  href={solutionLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 transition-colors"
                >
                  <span>Open Full Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Render Multi Section or Single Code Snippet */}
            {isMultiSection ? (
              <div className="space-y-4">
                {/* Brute Force Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider font-mono flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Brute Force Solution
                    </span>
                    <button
                      onClick={() => handleCopyCode(brutePart, 'brute')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                    >
                      {copiedSection === 'brute' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-500" />
                          <span>Copy Brute Force Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-[#050507] font-mono text-xs text-zinc-200 whitespace-pre-wrap overflow-x-auto leading-relaxed custom-scrollbar max-h-[260px]">
                    {brutePart || '// No code provided for Brute Force.'}
                  </div>
                </div>

                {/* Optimal Section */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider font-mono flex items-center gap-1.5">
                      <Rocket className="w-3.5 h-3.5" />
                      Optimal Solution
                    </span>
                    <button
                      onClick={() => handleCopyCode(optimalPart, 'optimal')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                    >
                      {copiedSection === 'optimal' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-zinc-500" />
                          <span>Copy Optimal Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-[#050507] font-mono text-xs text-zinc-200 whitespace-pre-wrap overflow-x-auto leading-relaxed custom-scrollbar max-h-[260px]">
                    {optimalPart || '// No code provided for Optimal.'}
                  </div>
                </div>
              </div>
            ) : codeSnippet ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider font-mono flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-emerald-400" />
                    Submitted Solution Code
                  </span>
                  <button
                    onClick={() => handleCopyCode(codeSnippet, 'main')}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                  >
                    {copiedSection === 'main' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-500" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#050507] font-mono text-xs text-zinc-200 whitespace-pre-wrap overflow-x-auto leading-relaxed custom-scrollbar max-h-[380px]">
                  {codeSnippet}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border border-zinc-800 rounded-xl bg-zinc-950/40">
                <Code className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 font-mono">No raw code text submitted for this attempt.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-5 py-3 border-t border-white/[0.06] bg-zinc-950/90 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SolutionViewModal;
