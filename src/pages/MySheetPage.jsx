import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import {
  Search, ExternalLink, ChevronDown, ChevronUp,
  Shuffle, Save, X, Code, MoreHorizontal,
  Bookmark, BookmarkCheck, FileText,
  Link2, Trash2, CheckCircle2,
  Clock, AlertCircle, RotateCcw, Circle,
  Sparkles, Copy, Lightbulb, Eye, Plus
} from 'lucide-react';
import AddQuestionModal from '../components/AddQuestionModal';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition, staggerContainer, fadeUp, backdropVariants, modalVariants } from '../lib/animations';

// ── Portal Dropdown ──────────────────────────────────────────────────────────
const PortalDropdown = ({ anchor, open, children, onClose, align = 'auto' }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const portalRef = useRef(null);

  useEffect(() => {
    if (!open || !anchor) return;
    const updatePosition = () => {
      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      let left = rect.left;
      const menuWidth = portalRef.current ? portalRef.current.offsetWidth : 200;

      if (align === 'right' || left + menuWidth > viewportWidth - 12) {
        left = Math.max(12, rect.right - menuWidth);
      }
      left = Math.max(12, Math.min(left, viewportWidth - menuWidth - 12));

      setPos({ top: rect.bottom + 4, left, width: rect.width });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [open, anchor, align]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (anchor && anchor.contains(e.target)) return;
      if (portalRef.current && portalRef.current.contains(e.target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchor]);

  if (!open) return null;
  return createPortal(
    <div
      ref={portalRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width, zIndex: 9999 }}
      className="animate-fadeIn"
    >
      {children}
    </div>,
    document.body
  );
};

// ── Stars ────────────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
  <span className="tracking-tight text-xs select-none">
    <span className="text-amber-400">{'★'.repeat(n)}</span>
    <span className="text-zinc-800">{'★'.repeat(5 - n)}</span>
  </span>
);

// ── Dropdown base style ───────────────────────────────────────────────────────
const dropdownPanelCls = 'border border-white/[0.06] rounded-xl shadow-2xl shadow-black/80 py-1 overflow-hidden';
const dropdownPanelBg  = { background: '#0d0d0f' };

// ── Status Dropdown ──────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Todo',      icon: Circle,       color: 'text-zinc-400',    dot: 'bg-zinc-600' },
  { value: 'attempted',   label: 'Attempted', icon: Clock,        color: 'text-amber-400',   dot: 'bg-amber-400' },
  { value: 'done',        label: 'Done',      icon: CheckCircle2, color: 'text-emerald-400', dot: 'bg-emerald-400' },
];

const statusPillStyles = {
  not_started: 'bg-zinc-900 text-zinc-500 border-white/[0.06] hover:border-zinc-600/40',
  attempted:   'bg-amber-500/[0.08] text-amber-400 border-amber-500/20 hover:border-amber-500/40',
  done:        'bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40',
};

const StatusCell = ({ status, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center justify-between w-[112px] px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer select-none ${statusPillStyles[status] || statusPillStyles.not_started}`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cur.dot}`} />
          <span className="truncate">{cur.label}</span>
        </span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <PortalDropdown anchor={ref.current} open={open} onClose={() => setOpen(false)}>
        <div className={dropdownPanelCls} style={{ ...dropdownPanelBg, minWidth: 144 }}>
          {STATUS_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isActive = opt.value === status;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors text-left ${
                  isActive ? `${opt.color} bg-white/[0.04]` : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? opt.color : 'text-zinc-700'}`} />
                {opt.label}
                {isActive && <span className="ml-auto text-zinc-700 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </PortalDropdown>
    </div>
  );
};

// ── Approach Dropdown ─────────────────────────────────────────────────────────
const APPROACH_OPTIONS = [
  { value: 'none',        label: 'Todo',        dot: 'bg-zinc-600',    pill: 'bg-zinc-900 text-zinc-500 border-white/[0.06] hover:border-zinc-600/40' },
  { value: 'brute_force', label: 'Brute Force', dot: 'bg-amber-400',   pill: 'bg-amber-500/[0.08] text-amber-400 border-amber-500/20 hover:border-amber-500/40' },
  { value: 'optimized',   label: 'Optimal',     dot: 'bg-emerald-400', pill: 'bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40' },
  { value: 'both',        label: 'Both',        dot: 'bg-violet-400',  pill: 'bg-violet-500/[0.08] text-violet-400 border-violet-500/20 hover:border-violet-500/40' },
];

const ApproachCell = ({ bruteForce, optimized, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const value = bruteForce && optimized ? 'both' : bruteForce ? 'brute_force' : optimized ? 'optimized' : 'none';
  const cur = APPROACH_OPTIONS.find(o => o.value === value) || APPROACH_OPTIONS[0];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center justify-between w-[112px] px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer select-none ${cur.pill}`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cur.dot}`} />
          <span className="truncate">{cur.label}</span>
        </span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <PortalDropdown anchor={ref.current} open={open} onClose={() => setOpen(false)}>
        <div className={dropdownPanelCls} style={{ ...dropdownPanelBg, minWidth: 144 }}>
          {APPROACH_OPTIONS.map(opt => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors text-left ${
                  isActive ? 'text-zinc-200 bg-white/[0.04]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                {opt.label}
                {isActive && <span className="ml-auto text-zinc-700 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </PortalDropdown>
    </div>
  );
};

// ── Solve Method Config ────────────────────────────────────────────────────────
const SOLVE_METHODS = [
  { id: 'gpt',      label: 'AI / GPT',   icon: Sparkles,  color: 'text-violet-400', activeBg: 'bg-violet-500/[0.10] border-violet-500/30' },
  { id: 'copy',     label: 'Copy-Paste', icon: Copy,      color: 'text-rose-400',   activeBg: 'bg-rose-500/[0.10] border-rose-500/30' },
  { id: 'hint',     label: 'Hint Used',  icon: Lightbulb, color: 'text-amber-400',  activeBg: 'bg-amber-500/[0.10] border-amber-500/30' },
  { id: 'solution', label: 'Ans Seen',   icon: Eye,       color: 'text-sky-400',    activeBg: 'bg-sky-500/[0.10] border-sky-500/30' },
];

// ── Row Context Menu ──────────────────────────────────────────────────────────
const RowMenu = ({ question, prog, onOpenNotes, onIncrementRevisit, onToggleRevisit, onSolveMethodChange, onClearProgress }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const solveMethod = prog?.solve_method || null;
  const hasNotes = !!(prog?.notes || prog?.solution_link);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`p-1.5 rounded-lg cursor-pointer transition-all ${open ? 'text-zinc-200 bg-white/[0.06]' : 'text-zinc-700 hover:text-zinc-300 hover:bg-white/[0.04]'}`}
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <PortalDropdown anchor={ref.current} open={open} onClose={() => setOpen(false)} align="right">
        <div className="w-56 border border-white/[0.06] rounded-xl shadow-2xl shadow-black/90 overflow-hidden py-1.5 animate-fadeIn" style={{ background: '#0d0d0f' }}>
          {/* How Solved */}
          <div className="px-3 py-2.5 border-b border-white/[0.04] mb-1">
            <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest block mb-2">How Solved?</span>
            <div className="grid grid-cols-2 gap-1.5">
              {SOLVE_METHODS.map(m => {
                const Icon = m.icon;
                const isActive = solveMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSolveMethodChange(isActive ? null : m.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? `${m.activeBg} ${m.color}`
                        : 'border-white/[0.05] bg-white/[0.02] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isActive ? m.color : 'text-zinc-700'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Revisit */}
          <div className="px-3 py-2.5 border-b border-white/[0.04] mb-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Revisit Tracker</span>
              {(prog?.revisit_count || 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/[0.08] border border-rose-500/20 text-[9px] font-mono font-bold text-rose-400">
                  ↺ {prog.revisit_count}×
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { onIncrementRevisit(); setOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/[0.08] border border-rose-500/20 text-rose-400 hover:bg-rose-500/[0.15] hover:border-rose-500/35 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Mark Revisited (+1)</span>
              </button>
              {prog?.revisit && (
                <button
                  onClick={() => { onToggleRevisit(false); setOpen(false); }}
                  className="px-2 py-1.5 text-xs rounded-lg border border-white/[0.06] text-zinc-600 hover:text-rose-400 hover:border-rose-500/25 hover:bg-rose-500/[0.06] transition-colors cursor-pointer"
                  title="Remove Revisit Flag"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <button onClick={() => { onOpenNotes(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200 transition-colors cursor-pointer text-left">
            <FileText className={`w-3.5 h-3.5 ${hasNotes ? 'text-violet-400' : 'text-zinc-700'}`} />
            {hasNotes ? 'Edit Notes / Solution' : 'Add Notes / Solution'}
            {hasNotes && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
          </button>

          {prog?.solution_link && (
            <a href={prog.solution_link} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200 transition-colors cursor-pointer">
              <Link2 className="w-3.5 h-3.5 text-zinc-700" /> Open My Solution
            </a>
          )}

          {question.link && (
            <a href={question.link} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200 transition-colors cursor-pointer">
              <ExternalLink className="w-3.5 h-3.5 text-zinc-700" /> Open Problem ↗
            </a>
          )}

          <div className="h-px bg-white/[0.04] my-1" />

          <button onClick={() => { onClearProgress(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-rose-500/70 hover:bg-rose-500/[0.06] hover:text-rose-400 transition-colors cursor-pointer text-left">
            <Trash2 className="w-3.5 h-3.5" /> Reset Progress
          </button>
        </div>
      </PortalDropdown>
    </div>
  );
};

// ── Filter Select ─────────────────────────────────────────────────────────────
const FilterSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-xl glass-input text-zinc-300 cursor-pointer transition-all select-none whitespace-nowrap"
      >
        {cur?.label || placeholder}
        <ChevronDown className={`w-3 h-3 text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <PortalDropdown anchor={ref.current} open={open} onClose={() => setOpen(false)}>
        <div className={dropdownPanelCls} style={{ ...dropdownPanelBg, minWidth: 160 }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors text-left ${
                opt.value === value ? 'text-violet-400 bg-violet-500/[0.06]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`}
            >
              {opt.dot && <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />}
              {opt.label}
              {opt.value === value && <span className="ml-auto text-zinc-700 text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      </PortalDropdown>
    </div>
  );
};

const DIFFICULTY_OPTIONS = [
  { value: 'All', label: 'All Difficulties' },
  { value: '1',   label: '★☆☆☆☆  Easy' },
  { value: '2',   label: '★★☆☆☆  Easy+' },
  { value: '3',   label: '★★★☆☆  Medium' },
  { value: '4',   label: '★★★★☆  Hard' },
  { value: '5',   label: '★★★★★  Expert' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'All',         label: 'All Statuses' },
  { value: 'not_started', label: 'Todo',      dot: 'bg-zinc-600' },
  { value: 'attempted',   label: 'Attempted', dot: 'bg-amber-400' },
  { value: 'done',        label: 'Done',      dot: 'bg-emerald-400' },
];

// ── Table header cell ─────────────────────────────────────────────────────────
const TH = ({ children, className = '' }) => (
  <th className={`px-4 py-3 text-[9px] text-zinc-600 uppercase tracking-widest font-bold border-r border-white/[0.04] last:border-r-0 ${className}`}>
    {children}
  </th>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const MySheetPage = () => {
  const { questions, loading: qLoading } = useQuestions();
  const { profile } = useAuth();
  const { progress, upsertProgress } = useProgressStore();

  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filterRevisit, setFilterRevisit] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [surpriseQuestion, setSurpriseQuestion] = useState(null);
  const [activeNotes, setActiveNotes] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [solutionLink, setSolutionLink] = useState('');

  const progressMap = useMemo(() => {
    const map = {};
    progress.forEach(p => { if (p.user_id === profile?.id) map[p.question_id] = p; });
    return map;
  }, [progress, profile]);

  const filteredQuestions = useMemo(() =>
    questions.filter(q => {
      const prog = progressMap[q.id] || {};
      const status = prog.status || 'not_started';
      const matchSearch = q.problem_name.toLowerCase().includes(search.toLowerCase())
        || q.topic.toLowerCase().includes(search.toLowerCase())
        || (q.subtopic || '').toLowerCase().includes(search.toLowerCase());
      const matchDiff   = selectedDifficulty === 'All' || q.difficulty === parseInt(selectedDifficulty, 10);
      const matchStatus = selectedStatus === 'All' || status === selectedStatus;
      const matchRevisit = !filterRevisit || prog.revisit === true;
      return matchSearch && matchDiff && matchStatus && matchRevisit;
    }),
    [questions, progressMap, search, selectedDifficulty, selectedStatus, filterRevisit]
  );

  const groupedByTopic = useMemo(() => {
    const groups = {};
    filteredQuestions.forEach(q => {
      if (!groups[q.topic]) groups[q.topic] = [];
      groups[q.topic].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  const handleStatus   = (qId, ns)  => { if (profile) upsertProgress(profile.id, qId, { status: ns }); };
  const handleApproach = (qId, val) => {
    if (!profile) return;
    if (val === 'none')             upsertProgress(profile.id, qId, { brute_force: false, optimized: false });
    else if (val === 'brute_force') upsertProgress(profile.id, qId, { brute_force: true,  optimized: false });
    else if (val === 'optimized')   upsertProgress(profile.id, qId, { brute_force: false, optimized: true  });
    else if (val === 'both')        upsertProgress(profile.id, qId, { brute_force: true,  optimized: true  });
  };
  const handleSolveMethod      = (qId, method) => { if (profile) upsertProgress(profile.id, qId, { solve_method: method }); };
  const handleIncrementRevisit = (qId) => {
    if (!profile) return;
    const prog = progressMap[qId] || {};
    upsertProgress(profile.id, qId, { revisit: true, revisit_count: (prog.revisit_count || 0) + 1 });
  };
  const handleToggleRevisit  = (qId, val) => { if (profile) upsertProgress(profile.id, qId, { revisit: val }); };
  const handleClearProgress  = (qId) => {
    if (!profile) return;
    upsertProgress(profile.id, qId, { status: 'not_started', brute_force: false, approach: false, optimized: false, revisit: false, revisit_count: 0, notes: '', solution_link: '' });
  };

  const openNotes = q => {
    const prog = progressMap[q.id] || {};
    setActiveNotes(q);
    setNotesText(prog.notes || '');
    setSolutionLink(prog.solution_link || '');
  };

  const saveNotes = async () => {
    if (!profile || !activeNotes) return;
    await upsertProgress(profile.id, activeNotes.id, { notes: notesText, solution_link: solutionLink });
    setActiveNotes(null);
  };

  const handleSurpriseMe = () => {
    const unsolved = filteredQuestions.filter(q => (progressMap[q.id]?.status || 'not_started') !== 'done');
    if (!unsolved.length) return;
    const pick = unsolved[Math.floor(Math.random() * unsolved.length)];
    setSurpriseQuestion(pick);
    setExpandedTopics(prev => ({ ...prev, [pick.topic]: true }));
    setTimeout(() => document.getElementById(`topic-${pick.topic}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  if (qLoading && !questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-7 h-7 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-zinc-600 text-sm">Loading DSA Sheet…</p>
      </div>
    );
  }

  const totalDone = progress.filter(p => p.user_id === profile?.id && p.status === 'done').length;
  const totalPct  = questions.length ? Math.round((totalDone / questions.length) * 100) : 0;

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit="exit"
      variants={pageTransition}
      className="space-y-4 pb-10"
    >

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">DSA Master Sheet</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-36 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full rounded-full transition-all duration-500 bg-violet-500"
                style={{ width: `${totalPct}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              <strong className="text-zinc-300">{totalDone}</strong>/{questions.length} solved
              <span className="text-zinc-600 ml-1">({totalPct}%)</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Problem
          </button>
          <button
            onClick={handleSurpriseMe}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Surprise Me
          </button>
        </div>
      </div>

      <AddQuestionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {/* ── Surprise Banner ── */}
      {surpriseQuestion && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-900/80">
          <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-mono text-violet-400 uppercase tracking-wider">Challenge →</span>
            <span className="text-xs text-white font-semibold">{surpriseQuestion.problem_name}</span>
            <span className="text-zinc-500 text-xs">{surpriseQuestion.topic} · {surpriseQuestion.subtopic}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {surpriseQuestion.link && (
              <a href={surpriseQuestion.link} target="_blank" rel="noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
                Open ↗
              </a>
            )}
            <button onClick={() => setSurpriseQuestion(null)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search problem, topic…"
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-zinc-900/80 border border-zinc-800 focus:border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition-colors"
          />
        </div>
        <FilterSelect value={selectedDifficulty} onChange={setSelectedDifficulty} options={DIFFICULTY_OPTIONS} placeholder="All Difficulties" />
        <FilterSelect value={selectedStatus}     onChange={setSelectedStatus}     options={STATUS_FILTER_OPTIONS} placeholder="All Statuses" />
        <button
          onClick={() => setFilterRevisit(v => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border cursor-pointer transition-colors select-none ${
            filterRevisit
              ? 'border-red-500/30 bg-red-500/10 text-red-400 font-medium'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Revisit Only
        </button>
      </div>

      {/* ── Topic Accordions ── */}
      {Object.keys(groupedByTopic).length === 0 ? (
        <div className="text-center py-20 text-zinc-700 text-sm">No questions match your filters.</div>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedByTopic).map(([topic, topicQuestions]) => {
            const isOpen = !!expandedTopics[topic];
            const done   = topicQuestions.filter(q => progressMap[q.id]?.status === 'done').length;
            const total  = topicQuestions.length;
            const pct    = total ? Math.round((done / total) * 100) : 0;

            const subtopicGroups = {};
            topicQuestions.forEach(q => {
              const k = q.subtopic || '';
              if (!subtopicGroups[k]) subtopicGroups[k] = [];
              subtopicGroups[k].push(q);
            });

            return (
              <div key={topic} id={`topic-${topic}`}
                className="rounded-xl overflow-hidden border border-white/[0.05]"
                style={{ background: '#0a0a0c' }}>

                {/* Topic Header */}
                <button
                  onClick={() => setExpandedTopics(prev => ({ ...prev, [topic]: !isOpen }))}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left cursor-pointer hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest truncate">{topic}</span>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="w-24 h-0.5 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-700 font-mono tabular-nums">{done}/{total}</span>
                      {pct === 100 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </div>
                  </div>
                  <span className="text-zinc-800 group-hover:text-zinc-500 transition-colors ml-3 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {/* Table */}
                {isOpen && (
                  <div className="overflow-x-auto border-t border-white/[0.04]">
                    <table className="w-full border-collapse text-sm" style={{ minWidth: 820 }}>
                      <thead>
                        <tr style={{ background: 'rgba(10,10,12,0.98)' }}>
                          <TH className="text-right w-10">#</TH>
                          <TH className="w-44 text-left">Subtopic</TH>
                          <TH className="text-left">Problem</TH>
                          <TH className="w-28 text-center">Difficulty</TH>
                          <TH className="w-32 text-center">Approach</TH>
                          <TH className="w-32 text-center">Status</TH>
                          <th className="px-3 py-3 w-10 text-center text-[9px] text-zinc-700 uppercase tracking-widest">···</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rows = [];
                          Object.entries(subtopicGroups).forEach(([subtopic, stQs]) => {
                            stQs.forEach((q, qIdx) => {
                              const prog         = progressMap[q.id] || {};
                              const status       = prog.status || 'not_started';
                              const bruteForce   = prog.brute_force || false;
                              const optimized    = prog.optimized   || false;
                              const revisit      = prog.revisit     || false;
                              const revisitCount = prog.revisit_count || 0;
                              const isSurprise   = surpriseQuestion?.id === q.id;
                              const isFirstSub   = qIdx === 0;

                              const rowBg =
                                isSurprise             ? 'dsa-row-surprise' :
                                revisit                ? 'dsa-row-revisit'  :
                                status === 'done'      ? 'dsa-row-done'     :
                                status === 'attempted' ? 'dsa-row-attempted' : '';

                              const borderL =
                                isSurprise ? 'border-l-2 border-l-violet-500' :
                                revisit    ? 'border-l-2 border-l-rose-500'   : '';

                              rows.push(
                                <tr
                                  key={q.id}
                                  className={[
                                    'border-b border-white/[0.025] dsa-table-row',
                                    rowBg, borderL,
                                    !isSurprise && !revisit ? 'dsa-table-row-hover' : '',
                                  ].filter(Boolean).join(' ')}
                                >
                                  {/* Sr No */}
                                  <td className="px-4 py-3 text-right font-mono text-[10px] text-zinc-800 border-r border-white/[0.03] whitespace-nowrap">
                                    {q.sr_no}
                                  </td>

                                  {/* Subtopic */}
                                  {isFirstSub && (
                                    <td
                                      rowSpan={stQs.length}
                                      className="px-4 py-3 text-xs text-zinc-700 border-r border-white/[0.03] align-top pt-3.5 leading-relaxed"
                                      style={{ background: 'rgba(10,10,12,0.6)', borderBottom: '1px solid rgba(255,255,255,0.025)' }}
                                    >
                                      {subtopic}
                                    </td>
                                  )}

                                  {/* Problem Name */}
                                  <td className="px-4 py-3 border-r border-white/[0.03]">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`text-sm leading-snug transition-colors ${status === 'done' ? 'line-through text-zinc-700' : 'text-zinc-200'}`}>
                                        {q.problem_name}
                                      </span>
                                      {q.link && (
                                        <a href={q.link} target="_blank" rel="noreferrer"
                                          className="text-zinc-700 hover:text-violet-400 transition-colors" title="Open problem">
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                      {(() => {
                                        const sm = SOLVE_METHODS.find(m => m.id === prog.solve_method);
                                        if (!sm) return null;
                                        const Icon = sm.icon;
                                        return (
                                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border ${sm.activeBg} ${sm.color}`}
                                            title={`Solved: ${sm.label}`}>
                                            <Icon className="w-2.5 h-2.5" />
                                            <span>{sm.label}</span>
                                          </span>
                                        );
                                      })()}
                                      {revisit && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/[0.08] border border-rose-500/20 text-[9px] font-mono font-bold text-rose-400">
                                          <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                                          REVISIT{revisitCount > 1 ? ` · ${revisitCount}×` : ''}
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Difficulty */}
                                  <td className="px-4 py-3 text-center border-r border-white/[0.03] whitespace-nowrap">
                                    <Stars n={q.difficulty} />
                                  </td>

                                  {/* Approach */}
                                  <td className="px-3 py-2.5 text-center border-r border-white/[0.03] whitespace-nowrap">
                                    <ApproachCell bruteForce={bruteForce} optimized={optimized} onChange={val => handleApproach(q.id, val)} />
                                  </td>

                                  {/* Status */}
                                  <td className="px-3 py-2.5 text-center border-r border-white/[0.03]">
                                    <StatusCell status={status} onChange={ns => handleStatus(q.id, ns)} />
                                  </td>

                                  {/* Menu */}
                                  <td className="px-2 py-2.5 text-center">
                                    <RowMenu
                                      question={q} prog={prog}
                                      onOpenNotes={() => openNotes(q)}
                                      onIncrementRevisit={() => handleIncrementRevisit(q.id)}
                                      onToggleRevisit={v => handleToggleRevisit(q.id, v)}
                                      onSolveMethodChange={m => handleSolveMethod(q.id, m)}
                                      onClearProgress={() => handleClearProgress(q.id)}
                                    />
                                  </td>
                                </tr>
                              );
                            });
                          });
                          return rows;
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Notes Modal ── */}
      <AnimatePresence>
        {activeNotes && (
          <motion.div 
            initial="hidden"
            animate="show"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
          >
            <motion.div 
              variants={modalVariants}
              className="w-full max-w-md border border-white/[0.07] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden"
              style={{ background: '#0d0d0f', boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.9)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.05]">
                <div>
                  <h3 className="font-bold text-zinc-100 text-sm leading-tight">{activeNotes.problem_name}</h3>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{activeNotes.topic} · {activeNotes.subtopic}</p>
                </div>
                <button onClick={() => setActiveNotes(null)} className="text-zinc-700 hover:text-zinc-200 cursor-pointer ml-4 p-0.5 mt-0.5 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest block mb-2">Solution Link</label>
                  <div className="relative">
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700" />
                    <input type="url" value={solutionLink} onChange={e => setSolutionLink(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-zinc-200 placeholder:text-zinc-700 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest block mb-2">Notes</label>
                  <textarea value={notesText} onChange={e => setNotesText(e.target.value)}
                    placeholder="Approach, complexity, edge cases…"
                    rows={6}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input text-zinc-200 placeholder:text-zinc-700 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/[0.05]" style={{ background: 'rgba(10,10,12,0.9)' }}>
                <button onClick={() => setActiveNotes(null)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-white/[0.07] text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors cursor-pointer">
                  Cancel
                </button>
                <button onClick={saveNotes}
                  className="px-3.5 py-2 text-xs rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-violet-600/20">
                  <Save className="w-3.5 h-3.5" /> Save Notes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MySheetPage;
