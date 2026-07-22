import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import {
  Search, ExternalLink, ChevronDown, ChevronUp,
  Shuffle, Save, X, Code, MoreHorizontal,
  Bookmark, BookmarkCheck, FileText,
  Zap, Brain, Rocket, Link2, Trash2,
} from 'lucide-react';

// ── Star Rating ──
const Stars = ({ n }) => (
  <span className="tracking-tight text-xs text-amber-500 select-none">
    {'★'.repeat(n)}
    <span className="text-zinc-700">{'☆'.repeat(5 - n)}</span>
  </span>
);

// ── Status Badge / Select ──
const statusStyles = {
  not_started: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/40',
  attempted:   'bg-amber-500/8 text-amber-400 border-amber-500/20',
  done:        'bg-emerald-500/8 text-emerald-400 border-emerald-500/20',
  revisit:     'bg-rose-500/8 text-rose-400 border-rose-500/20',
};

const StatusCell = ({ status, onChange }) => (
  <select
    value={status}
    onChange={e => onChange(e.target.value)}
    className={`border px-2.5 py-1 text-xs rounded-full font-medium focus:outline-none cursor-pointer transition-all ${statusStyles[status] || statusStyles.not_started}`}
  >
    <option value="not_started">Todo</option>
    <option value="attempted">Attempted</option>
    <option value="done">Done</option>
    <option value="revisit">Revisit</option>
  </select>
);

// ── Step toggle ──
const StepToggle = ({ value, onChange, icon: Icon, activeColor, label }) => (
  <button
    onClick={() => onChange(!value)}
    title={label}
    className="flex flex-col items-center gap-0.5 p-1.5 rounded cursor-pointer transition-all"
  >
    <Icon className={`w-3.5 h-3.5 transition-colors ${value ? activeColor : 'text-zinc-700 hover:text-zinc-500'}`} />
    <span className={`text-[9px] font-semibold uppercase tracking-wide leading-none transition-colors ${value ? activeColor : 'text-zinc-700'}`}>
      {label}
    </span>
  </button>
);

// ── Row context menu ──
const RowMenu = ({ question, prog, bruteForce, approach, optimized, onStepChange, onOpenNotes, onRevisit, onClearProgress }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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
        className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/70 cursor-pointer transition-colors"
        title="More options"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-52 bg-[#111113] border border-[#1f1f23] rounded-xl shadow-2xl shadow-black/40 overflow-hidden py-1" style={{ top: '100%' }}>
          {/* Solution steps */}
          <div className="px-3 py-2.5 border-b border-[#1f1f23]">
            <span className="section-label block mb-2">Solution Steps</span>
            <div className="flex items-center justify-around bg-zinc-950/60 px-1 py-1 rounded-lg border border-zinc-800/60">
              <StepToggle value={bruteForce} onChange={v => onStepChange('brute_force', v)} icon={Zap}    activeColor="text-amber-400" label="Brute" />
              <StepToggle value={approach}   onChange={v => onStepChange('approach', v)}   icon={Brain}   activeColor="text-sky-400"   label="Think" />
              <StepToggle value={optimized}  onChange={v => onStepChange('optimized', v)}  icon={Rocket}  activeColor="text-emerald-400" label="Optim" />
            </div>
          </div>

          {/* Notes */}
          <button
            onClick={() => { onOpenNotes(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors cursor-pointer text-left"
          >
            <FileText className={`w-4 h-4 ${hasNotes ? 'text-violet-400' : 'text-zinc-500'}`} />
            {hasNotes ? 'Edit Notes / Solution' : 'Add Notes / Solution'}
          </button>

          {prog?.solution_link && (
            <a
              href={prog.solution_link} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-zinc-500" /> Open My Solution
            </a>
          )}

          {question.link && (
            <a
              href={question.link} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-zinc-500" /> Open Problem ↗
            </a>
          )}

          <div className="h-px bg-[#1f1f23] my-1" />

          <button
            onClick={() => { onRevisit(!revisit); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-colors cursor-pointer text-left"
          >
            {revisit
              ? <BookmarkCheck className="w-4 h-4 text-rose-400" />
              : <Bookmark className="w-4 h-4 text-zinc-500" />}
            {revisit ? 'Remove Revisit Flag' : 'Flag for Revisit'}
          </button>

          <div className="h-px bg-[#1f1f23] my-1" />

          <button
            onClick={() => { onClearProgress(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/8 transition-colors cursor-pointer text-left"
          >
            <Trash2 className="w-4 h-4" /> Reset Progress
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Page ──
const MySheetPage = () => {
  const { questions, loading: qLoading } = useQuestions();
  const { profile } = useAuth();
  const { progress, upsertProgress } = useProgressStore();

  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filterRevisit, setFilterRevisit] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState({});
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

  const groupedByPhase = useMemo(() => {
    const groups = {};
    filteredQuestions.forEach(q => {
      if (!groups[q.phase]) groups[q.phase] = [];
      groups[q.phase].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  const handleStatus = (qId, ns) => { if (profile) upsertProgress(profile.id, qId, { status: ns }); };
  const handleStep = (qId, field, val) => { if (profile) upsertProgress(profile.id, qId, { [field]: val }); };
  const handleRevisit = (qId, val) => { if (profile) upsertProgress(profile.id, qId, { revisit: val }); };
  const handleClearProgress = (qId) => {
    if (!profile) return;
    upsertProgress(profile.id, qId, { status: 'not_started', brute_force: false, approach: false, optimized: false, revisit: false, notes: '', solution_link: '' });
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
    setExpandedPhases(prev => ({ ...prev, [pick.phase]: true }));
    setTimeout(() => document.getElementById(`phase-${pick.phase}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">DSA Master Sheet</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {totalDone} / {questions.length} solved
          </p>
        </div>
        <button
          onClick={handleSurpriseMe}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#1f1f23] text-zinc-400 hover:border-violet-500/40 hover:text-violet-400 transition-all cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Surprise Me
        </button>
      </div>

      {/* Surprise banner */}
      {surpriseQuestion && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-violet-500/20 bg-violet-500/5">
          <div className="min-w-0">
            <span className="section-label">Challenge → </span>
            <span className="text-sm text-zinc-200 font-medium ml-1">{surpriseQuestion.problem_name}</span>
            <span className="text-zinc-500 text-xs ml-2">{surpriseQuestion.topic} · {surpriseQuestion.subtopic}</span>
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

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search problem, topic…"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
          />
        </div>
        <select
          value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg glass-input text-zinc-300 focus:outline-none cursor-pointer"
        >
          <option value="All">All Difficulties</option>
          {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>{'★'.repeat(d)}{'☆'.repeat(5 - d)}</option>)}
        </select>
        <select
          value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg glass-input text-zinc-300 focus:outline-none cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="not_started">Todo</option>
          <option value="attempted">Attempted</option>
          <option value="done">Done</option>
          <option value="revisit">Revisit</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
          <input type="checkbox" checked={filterRevisit} onChange={e => setFilterRevisit(e.target.checked)}
            className="accent-violet-500 w-3.5 h-3.5 cursor-pointer rounded" />
          Revisit Only
        </label>
      </div>

      {/* Column legend */}
      <div className="flex items-center gap-4 text-xxs text-zinc-600 pb-1">
        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Brute Force</span>
        <span className="flex items-center gap-1"><Brain className="w-3 h-3 text-sky-400" /> Approach</span>
        <span className="flex items-center gap-1"><Rocket className="w-3 h-3 text-emerald-400" /> Optimized</span>
      </div>

      {/* Phase accordions */}
      {Object.keys(groupedByPhase).length === 0 ? (
        <div className="text-center py-16 text-zinc-600 text-sm">No questions match your filters.</div>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedByPhase).map(([phase, phaseQuestions]) => {
            const isOpen = !!expandedPhases[phase];
            const done = phaseQuestions.filter(q => progressMap[q.id]?.status === 'done').length;
            const total = phaseQuestions.length;
            const pct = total ? Math.round((done / total) * 100) : 0;

            const topicGroups = {};
            phaseQuestions.forEach(q => {
              if (!topicGroups[q.topic]) topicGroups[q.topic] = [];
              topicGroups[q.topic].push(q);
            });

            return (
              <div key={phase} id={`phase-${phase}`} className="border border-[#1f1f23] rounded-xl overflow-hidden bg-[#0c0c0e]">
                {/* Phase header */}
                <button
                  onClick={() => setExpandedPhases(prev => ({ ...prev, [phase]: !isOpen }))}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left cursor-pointer hover:bg-zinc-900/30 transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="section-label truncate">{phase}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 transition-all rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xxs text-zinc-500 font-mono">{done}/{total}</span>
                    </div>
                  </div>
                  <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors ml-3">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {/* Table */}
                {isOpen && (
                  <div className="overflow-x-auto border-t border-[#1f1f23]">
                    <table className="w-full border-collapse text-sm" style={{ minWidth: 820 }}>
                      <thead>
                        <tr className="bg-zinc-900/70 text-zinc-600 font-semibold text-xxs uppercase tracking-wider">
                          <th className="px-4 py-3 text-right w-12 border-r border-[#1f1f23]">#</th>
                          <th className="px-4 py-3 w-28 border-r border-[#1f1f23] text-left">Topic</th>
                          <th className="px-4 py-3 w-44 border-r border-[#1f1f23] text-left">Subtopic</th>
                          <th className="px-4 py-3 border-r border-[#1f1f23] text-left">Problem</th>
                          <th className="px-4 py-3 w-28 text-center border-r border-[#1f1f23]">Difficulty</th>
                          <th className="px-4 py-3 w-28 text-center border-r border-[#1f1f23]">Status</th>
                          <th className="px-3 py-3 w-12 text-center">···</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const rows = [];
                          let subSr = 0;

                          Object.entries(topicGroups).forEach(([topic, topicQs]) => {
                            const subtopicGroups = {};
                            topicQs.forEach(q => {
                              const k = q.subtopic || '';
                              if (!subtopicGroups[k]) subtopicGroups[k] = [];
                              subtopicGroups[k].push(q);
                            });

                            let topicRendered = 0;

                            Object.entries(subtopicGroups).forEach(([subtopic, stQs]) => {
                              stQs.forEach((q, qIdx) => {
                                subSr++;
                                const prog = progressMap[q.id] || {};
                                const status = prog.status || 'not_started';
                                const bruteForce = prog.brute_force || false;
                                const approach = prog.approach || false;
                                const optimized = prog.optimized || false;
                                const revisit = prog.revisit || false;
                                const isSurprise = surpriseQuestion?.id === q.id;
                                const isFirstTopic = topicRendered === 0;
                                const isFirstSub = qIdx === 0;
                                topicRendered++;

                                const rowBg =
                                  isSurprise ? 'bg-violet-950/20' :
                                  status === 'done' ? 'bg-emerald-950/5' :
                                  status === 'attempted' ? 'bg-amber-950/5' :
                                  status === 'revisit' ? 'bg-rose-950/5' : '';

                                rows.push(
                                  <tr
                                    key={q.id}
                                    className={[
                                      'border-b border-[#1f1f23]/60 transition-colors',
                                      rowBg,
                                      isSurprise ? 'border-l-2 border-l-violet-500' : '',
                                      revisit && !isSurprise ? 'border-l-2 border-l-rose-500/40' : '',
                                      !isSurprise && !revisit ? 'hover:bg-zinc-900/20' : '',
                                    ].filter(Boolean).join(' ')}
                                  >
                                    {/* Sr No */}
                                    <td className="px-4 py-2.5 text-right font-mono text-xxs text-zinc-600 border-r border-[#1f1f23]/50 whitespace-nowrap">
                                      {q.sr_no}
                                    </td>

                                    {/* Topic — rowspan */}
                                    {isFirstTopic && (
                                      <td
                                        rowSpan={topicQs.length}
                                        className="px-3 py-3 font-medium text-xs text-zinc-400 border-r border-[#1f1f23]/50 align-middle text-center"
                                        style={{ borderBottom: '1px solid rgba(31,31,35,0.6)' }}
                                      >
                                        <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block', whiteSpace: 'nowrap' }}>
                                          {topic}
                                        </span>
                                      </td>
                                    )}

                                    {/* Subtopic — rowspan */}
                                    {isFirstSub && (
                                      <td
                                        rowSpan={stQs.length}
                                        className="px-4 py-3 text-xs text-zinc-500 border-r border-[#1f1f23]/50 align-top pt-3"
                                        style={{ borderBottom: '1px solid rgba(31,31,35,0.6)' }}
                                      >
                                        {subtopic}
                                      </td>
                                    )}

                                    {/* Problem name */}
                                    <td className="px-4 py-2.5 border-r border-[#1f1f23]/50">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-sm transition-colors ${status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                          {q.problem_name}
                                        </span>
                                        {q.link && (
                                          <a href={q.link} target="_blank" rel="noopener noreferrer"
                                            className="shrink-0 text-zinc-600 hover:text-violet-400 transition-colors">
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        )}
                                      </div>
                                    </td>

                                    {/* Difficulty */}
                                    <td className="px-4 py-2.5 text-center border-r border-[#1f1f23]/50 whitespace-nowrap">
                                      <Stars n={q.difficulty} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-2.5 text-center border-r border-[#1f1f23]/50">
                                      <StatusCell status={status} onChange={ns => handleStatus(q.id, ns)} />
                                    </td>

                                    {/* Menu */}
                                    <td className="px-2 py-2.5 text-center">
                                      <RowMenu
                                        question={q} prog={prog}
                                        bruteForce={bruteForce} approach={approach} optimized={optimized}
                                        onStepChange={(field, val) => handleStep(q.id, field, val)}
                                        onOpenNotes={() => openNotes(q)}
                                        onRevisit={v => handleRevisit(q.id, v)}
                                        onClearProgress={() => handleClearProgress(q.id)}
                                      />
                                    </td>
                                  </tr>
                                );
                              });
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

      {/* Notes modal */}
      {activeNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111113] border border-[#1f1f23] rounded-2xl shadow-2xl shadow-black/50 p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm leading-tight">{activeNotes.problem_name}</h3>
                <p className="text-xxs text-zinc-500 mt-1">{activeNotes.topic} · {activeNotes.subtopic}</p>
              </div>
              <button onClick={() => setActiveNotes(null)} className="text-zinc-500 hover:text-zinc-200 cursor-pointer ml-4 p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="section-label block mb-1.5">Solution Link</label>
                <div className="relative">
                  <Code className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type="url" value={solutionLink} onChange={e => setSolutionLink(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="section-label block mb-1.5">Notes</label>
                <textarea value={notesText} onChange={e => setNotesText(e.target.value)}
                  placeholder="Approach, complexity, edge cases…"
                  rows={6}
                  className="w-full px-3 py-2 text-xs rounded-lg glass-input text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setActiveNotes(null)}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#1f1f23] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={saveNotes}
                className="px-3 py-1.5 text-xs rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors cursor-pointer flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySheetPage;
