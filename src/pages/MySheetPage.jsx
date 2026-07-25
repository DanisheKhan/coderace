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
  Sparkles, Copy, Lightbulb, Eye,
} from 'lucide-react';

// ── Portal Dropdown ──────────────────────────────────────────────────────────
const PortalDropdown = ({ anchor, open, children, onClose }) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const portalRef = useRef(null);

  useEffect(() => {
    if (!open || !anchor) return;
    const rect = anchor.getBoundingClientRect();
    // Use fixed positioning — no scroll offset needed
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, [open, anchor]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      // Don't close when clicking the trigger button
      if (anchor && anchor.contains(e.target)) return;
      // Don't close when clicking INSIDE the portal dropdown panel
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
    <span className="text-zinc-700">{'★'.repeat(5 - n)}</span>
  </span>
);

// ── Status Dropdown ──────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Todo',      icon: Circle,       color: 'text-zinc-400', dot: 'bg-zinc-500' },
  { value: 'attempted',   label: 'Attempted', icon: Clock,        color: 'text-amber-400', dot: 'bg-amber-400' },
  { value: 'done',        label: 'Done',      icon: CheckCircle2, color: 'text-emerald-400', dot: 'bg-emerald-400' },
];

const statusPillStyles = {
  not_started: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:border-zinc-600/60',
  attempted:   'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:border-amber-500/50',
  done:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:border-emerald-500/50',
};

const StatusCell = ({ status, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center justify-between w-[115px] px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer select-none ${statusPillStyles[status] || statusPillStyles.not_started}`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cur.dot}`} />
          <span className="truncate">{cur.label}</span>
        </span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <PortalDropdown anchor={ref.current} open={open} onClose={() => setOpen(false)}>
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl shadow-2xl shadow-black/60 py-1 overflow-hidden" style={{ minWidth: 148 }}>
          {STATUS_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isActive = opt.value === status;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors text-left ${
                  isActive ? `${opt.color} bg-white/5` : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? opt.color : 'text-zinc-600'}`} />
                {opt.label}
                {isActive && <span className="ml-auto text-zinc-600">✓</span>}
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
  { value: 'none',        label: 'Todo',       dot: 'bg-zinc-500',    pill: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40 hover:border-zinc-600/60' },
  { value: 'brute_force', label: 'Brute Force', dot: 'bg-amber-400',   pill: 'bg-amber-500/10 text-amber-400 border-amber-500/25 hover:border-amber-500/50' },
  { value: 'optimized',   label: 'Optimal',    dot: 'bg-emerald-400', pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:border-emerald-500/50' },
  { value: 'both',        label: 'Both',       dot: 'bg-violet-400',  pill: 'bg-violet-500/10 text-violet-400 border-violet-500/25 hover:border-violet-500/50' },
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
        className={`inline-flex items-center justify-between w-[115px] px-2.5 py-1 rounded-full border text-xs font-medium transition-all cursor-pointer select-none ${cur.pill}`}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cur.dot}`} />
          <span className="truncate">{cur.label}</span>
        </span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <PortalDropdown anchor={ref.current} open={open} onClose={() => setOpen(false)}>
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl shadow-2xl shadow-black/60 py-1 overflow-hidden" style={{ minWidth: 148 }}>
          {APPROACH_OPTIONS.map(opt => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer transition-colors text-left ${
                  isActive ? 'text-zinc-200 bg-white/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                {opt.label}
                {isActive && <span className="ml-auto text-zinc-600">✓</span>}
              </button>
            );
          })}
        </div>
      </PortalDropdown>
    </div>
  );
};

// ── Solve Source Options ──────────────────────────────────────────────────────
const SOLVE_METHODS = [
  { id: 'gpt',      label: 'AI / GPT',    icon: Sparkles,  color: 'text-violet-400', activeBg: 'bg-violet-500/12 border-violet-500/35' },
  { id: 'copy',     label: 'Copy-Paste', icon: Copy,      color: 'text-rose-400',   activeBg: 'bg-rose-500/12 border-rose-500/35' },
  { id: 'hint',     label: 'Hint Used',  icon: Lightbulb, color: 'text-amber-400',  activeBg: 'bg-amber-500/12 border-amber-500/35' },
  { id: 'solution', label: 'Ans Seen',   icon: Eye,       color: 'text-sky-400',    activeBg: 'bg-sky-500/12 border-sky-500/35' },
];

// ── Row context menu ──────────────────────────────────────────────────────────
const RowMenu = ({ question, prog, onOpenNotes, onIncrementRevisit, onToggleRevisit, onSolveMethodChange, onClearProgress }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const solveMethod = prog?.solve_method || null;

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const revisit = prog?.revisit || false;
  const hasNotes = !!(prog?.notes || prog?.solution_link);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`p-1.5 rounded-lg cursor-pointer transition-all ${open ? 'text-zinc-200 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/70'}`}
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-56 bg-[#111113] border border-[#252528] rounded-xl shadow-2xl shadow-black/60 overflow-hidden py-1.5" style={{ top: '100%' }}>
          {/* How Solved Tags */}
          <div className="px-3 py-2.5 border-b border-[#1f1f23] mb-1">
            <span className="section-label block mb-2">How Solved?</span>
            <div className="grid grid-cols-2 gap-1.5">
              {SOLVE_METHODS.map(m => {
                const Icon = m.icon;
                const isActive = solveMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSolveMethodChange(isActive ? null : m.id)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xxs font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                      isActive
                        ? `${m.activeBg} ${m.color} shadow-sm`
                        : 'border-[#252528] bg-zinc-950/40 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? m.color : 'text-zinc-600'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Revisit Action */}
          <div className="px-3 py-2.5 border-b border-[#1f1f23] my-1">
            <div className="flex items-center justify-between mb-2">
              <span className="section-label">Revisit Tracker</span>
              {(prog?.revisit_count || 0) > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-[9px] font-mono font-bold text-rose-400 select-none" title={`Revisited ${prog.revisit_count} time(s)`}>
                  ↺ {prog.revisit_count}×
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { onIncrementRevisit(); setOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-all cursor-pointer select-none active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mark Revisited (+1)</span>
              </button>
              {prog?.revisit && (
                <button
                  onClick={() => { onToggleRevisit(false); setOpen(false); }}
                  className="px-2 py-1.5 text-xs font-semibold rounded-lg border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Remove Revisit Flag"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>


          <button
            onClick={() => { onOpenNotes(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors cursor-pointer text-left"
          >
            <FileText className={`w-3.5 h-3.5 ${hasNotes ? 'text-violet-400' : 'text-zinc-600'}`} />
            {hasNotes ? 'Edit Notes / Solution' : 'Add Notes / Solution'}
            {hasNotes && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
          </button>

          {prog?.solution_link && (
            <a
              href={prog.solution_link} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-zinc-600" /> Open My Solution
            </a>
          )}

          {question.link && (
            <a
              href={question.link} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-600" /> Open Problem ↗
            </a>
          )}

          <div className="h-px bg-[#1f1f23] my-1" />

          <button
            onClick={() => { onClearProgress(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-rose-400/80 hover:bg-rose-500/8 hover:text-rose-300 transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Progress
          </button>
        </div>
      )}
    </div>
  );
};

// ── Filter Select (custom) ────────────────────────────────────────────────────
const FilterSelect = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cur = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-lg glass-input text-zinc-300 cursor-pointer transition-all select-none whitespace-nowrap"
      >
        {cur?.label || placeholder}
        <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <PortalDropdown anchor={ref.current} open={open} onClose={() => setOpen(false)}>
        <div className="bg-[#111113] border border-[#2a2a2e] rounded-xl shadow-2xl shadow-black/60 py-1 overflow-hidden" style={{ minWidth: 160 }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors text-left ${
                opt.value === value ? 'text-violet-400 bg-violet-500/8' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {opt.dot && <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />}
              {opt.label}
              {opt.value === value && <span className="ml-auto text-zinc-600 text-[10px]">✓</span>}
            </button>
          ))}
        </div>
      </PortalDropdown>
    </div>
  );
};

const DIFFICULTY_OPTIONS = [
  { value: 'All', label: 'All Difficulties' },
  { value: '1', label: '★☆☆☆☆  Easy' },
  { value: '2', label: '★★☆☆☆  Easy+' },
  { value: '3', label: '★★★☆☆  Medium' },
  { value: '4', label: '★★★★☆  Hard' },
  { value: '5', label: '★★★★★  Expert' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'All',         label: 'All Statuses' },
  { value: 'not_started', label: 'Todo',      dot: 'bg-zinc-500' },
  { value: 'attempted',   label: 'Attempted', dot: 'bg-amber-400' },
  { value: 'done',        label: 'Done',      dot: 'bg-emerald-400' },
];

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
      const matchDiff = selectedDifficulty === 'All' || q.difficulty === parseInt(selectedDifficulty, 10);
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

  const handleStatus = (qId, ns) => { if (profile) upsertProgress(profile.id, qId, { status: ns }); };
  const handleApproach = (qId, val) => {
    if (!profile) return;
    if (val === 'none')        upsertProgress(profile.id, qId, { brute_force: false, optimized: false });
    else if (val === 'brute_force') upsertProgress(profile.id, qId, { brute_force: true, optimized: false });
    else if (val === 'optimized')   upsertProgress(profile.id, qId, { brute_force: false, optimized: true });
    else if (val === 'both')        upsertProgress(profile.id, qId, { brute_force: true, optimized: true });
  };
  const handleSolveMethod = (qId, method) => {
    if (!profile) return;
    upsertProgress(profile.id, qId, { solve_method: method });
  };
  const handleIncrementRevisit = (qId) => {
    if (!profile) return;
    const prog = progressMap[qId] || {};
    const currentCount = prog.revisit_count || 0;
    upsertProgress(profile.id, qId, {
      revisit: true,
      revisit_count: currentCount + 1,
    });
  };
  const handleToggleRevisit = (qId, val) => { if (profile) upsertProgress(profile.id, qId, { revisit: val }); };
  const handleClearProgress = (qId) => {
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
        <div className="w-7 h-7 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading DSA Sheet…</p>
      </div>
    );
  }

  const totalDone = progress.filter(p => p.user_id === profile?.id && p.status === 'done').length;
  const totalPct  = questions.length ? Math.round((totalDone / questions.length) * 100) : 0;

  return (
    <div className="space-y-4 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">DSA Master Sheet</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="w-32 h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalPct}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                }}
              />
            </div>
            <span className="text-xs text-zinc-500 font-mono">{totalDone}/{questions.length} solved</span>
          </div>
        </div>
        <button
          onClick={handleSurpriseMe}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#2a2a2e] text-zinc-400 hover:border-violet-500/40 hover:text-violet-400 hover:bg-violet-500/5 transition-all cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Surprise Me
        </button>
      </div>

      {/* ── Surprise banner ── */}
      {surpriseQuestion && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-violet-500/25 bg-violet-500/5">
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <span className="section-label text-violet-500">Challenge →</span>
            <span className="text-sm text-zinc-200 font-medium">{surpriseQuestion.problem_name}</span>
            <span className="text-zinc-600 text-xs">{surpriseQuestion.topic} · {surpriseQuestion.subtopic}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {surpriseQuestion.link && (
              <a href={surpriseQuestion.link} target="_blank" rel="noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2">
                Open ↗
              </a>
            )}
            <button onClick={() => setSurpriseQuestion(null)} className="text-zinc-600 hover:text-zinc-300 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search problem, topic…"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>

        <FilterSelect
          value={selectedDifficulty}
          onChange={setSelectedDifficulty}
          options={DIFFICULTY_OPTIONS}
          placeholder="All Difficulties"
        />

        <FilterSelect
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={STATUS_FILTER_OPTIONS}
          placeholder="All Statuses"
        />

        <button
          onClick={() => setFilterRevisit(v => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all select-none ${
            filterRevisit
              ? 'border-rose-500/40 bg-rose-500/8 text-rose-400'
              : 'glass-input text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Revisit Only
        </button>
      </div>

      {/* ── Topic accordions ── */}
      {Object.keys(groupedByTopic).length === 0 ? (
        <div className="text-center py-20 text-zinc-600 text-sm">No questions match your filters.</div>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedByTopic).map(([topic, topicQuestions]) => {
            const isOpen = !!expandedTopics[topic];
            const done  = topicQuestions.filter(q => progressMap[q.id]?.status === 'done').length;
            const total = topicQuestions.length;
            const pct   = total ? Math.round((done / total) * 100) : 0;

            const subtopicGroups = {};
            topicQuestions.forEach(q => {
              const k = q.subtopic || '';
              if (!subtopicGroups[k]) subtopicGroups[k] = [];
              subtopicGroups[k].push(q);
            });

            return (
              <div key={topic} id={`topic-${topic}`} className="border border-[#1f1f23] rounded-xl overflow-hidden" style={{ background: '#0c0c0e' }}>
                {/* Topic header */}
                <button
                  onClick={() => setExpandedTopics(prev => ({ ...prev, [topic]: !isOpen }))}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left cursor-pointer hover:bg-zinc-900/40 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="section-label truncate">{topic}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-28 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : 'linear-gradient(90deg,#7c3aed,#a78bfa)' }}
                        />
                      </div>
                      <span className="text-xxs text-zinc-600 font-mono tabular-nums">{done}/{total}</span>
                      {pct === 100 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </div>
                  </div>
                  <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors ml-3">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {/* Table */}
                {isOpen && (
                  <div className="overflow-x-auto border-t border-[#1f1f23]">
                    <table className="w-full border-collapse text-sm" style={{ minWidth: 820 }}>
                      <thead>
                        <tr style={{ background: 'rgba(18,18,21,0.95)' }} className="text-zinc-600 font-semibold text-xxs uppercase tracking-wider">
                          <th className="px-4 py-3 text-right w-10 border-r border-[#1f1f23]">#</th>
                          <th className="px-4 py-3 w-44 border-r border-[#1f1f23] text-left">Subtopic</th>
                          <th className="px-4 py-3 border-r border-[#1f1f23] text-left">Problem</th>
                          <th className="px-4 py-3 w-28 text-center border-r border-[#1f1f23]">Difficulty</th>
                          <th className="px-4 py-3 w-32 text-center border-r border-[#1f1f23]">Approach</th>
                          <th className="px-4 py-3 w-32 text-center border-r border-[#1f1f23]">Status</th>
                          <th className="px-3 py-3 w-10 text-center">···</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rows = [];

                          Object.entries(subtopicGroups).forEach(([subtopic, stQs]) => {
                            stQs.forEach((q, qIdx) => {
                              const prog       = progressMap[q.id] || {};
                              const status     = prog.status || 'not_started';
                              const bruteForce = prog.brute_force || false;
                              const optimized  = prog.optimized  || false;
                              const revisit    = prog.revisit    || false;
                              const revisitCount = prog.revisit_count || 0;
                              const isSurprise = surpriseQuestion?.id === q.id;
                              const isFirstSub   = qIdx === 0;

                              const rowBg =
                                isSurprise             ? 'bg-violet-950/25' :
                                revisit                ? 'bg-rose-950/15' :
                                status === 'done'      ? 'bg-emerald-950/10' :
                                status === 'attempted' ? 'bg-amber-950/8' : '';

                              const borderL =
                                isSurprise ? 'border-l-2 border-l-violet-500' :
                                revisit    ? 'border-l-2 border-l-rose-500' : '';

                              rows.push(
                                <tr
                                  key={q.id}
                                  className={[
                                    'border-b border-[#181818] transition-all duration-150',
                                    rowBg,
                                    borderL,
                                    !isSurprise && !revisit ? 'hover:bg-zinc-900/30' : '',
                                  ].filter(Boolean).join(' ')}
                                >
                                  {/* Sr No */}
                                  <td className="px-4 py-2.5 text-right font-mono text-xxs text-zinc-700 border-r border-[#1f1f23]/50 whitespace-nowrap">
                                    {q.sr_no}
                                  </td>

                                  {/* Subtopic — rowspan */}
                                  {isFirstSub && (
                                    <td
                                      rowSpan={stQs.length}
                                      className="px-4 py-3 text-xs text-zinc-600 border-r border-[#1f1f23]/50 align-top pt-3 leading-relaxed bg-[#0c0c0e]"
                                      style={{ borderBottom: '1px solid rgba(31,31,35,0.5)' }}
                                    >
                                      {subtopic}
                                    </td>
                                  )}

                                  {/* Problem name */}
                                  <td className="px-4 py-2.5 border-r border-[#1f1f23]/50">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-sm leading-snug transition-colors ${status === 'done' ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                                        {q.problem_name}
                                      </span>
                                      {q.link && (
                                        <a
                                          href={q.link}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-zinc-600 hover:text-violet-400 transition-colors"
                                          title="Open problem link"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                      {(() => {
                                        const solveMethod = prog.solve_method;
                                        if (!solveMethod) return null;
                                        const m = SOLVE_METHODS.find(sm => sm.id === solveMethod);
                                        if (!m) return null;
                                        const Icon = m.icon;
                                        return (
                                          <span
                                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${m.activeBg} ${m.color}`}
                                            title={`Solved method: ${m.label}`}
                                          >
                                            <Icon className="w-3 h-3" />
                                            <span>{m.label}</span>
                                          </span>
                                        );
                                      })()}
                                      {/* Active Revisit Badge */}
                                      {revisit && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-mono font-bold text-rose-400 select-none shadow-sm shadow-rose-950/30">
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                                          <span>REVISIT{revisitCount > 1 ? ` · ${revisitCount}×` : ''}</span>
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Difficulty */}
                                  <td className="px-4 py-2.5 text-center border-r border-[#1f1f23]/50 whitespace-nowrap">
                                    <Stars n={q.difficulty} />
                                  </td>

                                  {/* Approach */}
                                  <td className="px-3 py-2 text-center border-r border-[#1f1f23]/50 whitespace-nowrap">
                                    <ApproachCell bruteForce={bruteForce} optimized={optimized} onChange={val => handleApproach(q.id, val)} />
                                  </td>

                                  {/* Status */}
                                  <td className="px-3 py-2 text-center border-r border-[#1f1f23]/50">
                                    <StatusCell status={status} onChange={ns => handleStatus(q.id, ns)} />
                                  </td>

                                  {/* Menu */}
                                  <td className="px-2 py-2 text-center">
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

      {/* ── Notes modal ── */}
      {activeNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0f0f11] border border-[#252528] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-[#1f1f23]">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm leading-tight">{activeNotes.problem_name}</h3>
                <p className="text-xxs text-zinc-600 mt-0.5">{activeNotes.topic} · {activeNotes.subtopic}</p>
              </div>
              <button onClick={() => setActiveNotes(null)} className="text-zinc-600 hover:text-zinc-200 cursor-pointer ml-4 p-0.5 mt-0.5 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              <div>
                <label className="section-label block mb-2">Solution Link</label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type="url" value={solutionLink} onChange={e => setSolutionLink(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="section-label block mb-2">Notes</label>
                <textarea value={notesText} onChange={e => setNotesText(e.target.value)}
                  placeholder="Approach, complexity, edge cases…"
                  rows={6}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#1f1f23]">
              <button onClick={() => setActiveNotes(null)}
                className="px-3.5 py-2 text-xs rounded-lg border border-[#252528] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={saveNotes}
                className="px-3.5 py-2 text-xs rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySheetPage;
