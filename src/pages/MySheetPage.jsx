import React, { useState, useMemo } from 'react';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import {
  Search,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Save,
  X,
  Code,
  Bookmark,
  CheckCircle,
  Circle,
  Clock,
} from 'lucide-react';

// ── Star rating (filled / empty) ──────────────────────────────────────────────
const Stars = ({ n }) => (
  <span className="tracking-tight text-[13px]">
    {'★'.repeat(n)}
    <span className="text-zinc-600">{'☆'.repeat(5 - n)}</span>
  </span>
);

// ── Compact status cycle button ───────────────────────────────────────────────
const StatusCell = ({ status, onChange }) => {
  const cycle = { not_started: 'attempted', attempted: 'done', done: 'not_started' };
  const label = { not_started: '–', attempted: 'Attempted', done: 'Done' };
  const cls = {
    not_started: 'text-zinc-500 hover:text-zinc-300',
    attempted: 'text-amber-400',
    done: 'text-emerald-400',
  };
  return (
    <button
      onClick={() => onChange(cycle[status])}
      className={`text-xs font-semibold transition-colors cursor-pointer select-none whitespace-nowrap ${cls[status]}`}
      title="Click to cycle status"
    >
      {label[status]}
    </button>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
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

  // notes modal
  const [activeNotes, setActiveNotes] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [solutionLink, setSolutionLink] = useState('');

  // progress lookup keyed by question_id
  const progressMap = useMemo(() => {
    const map = {};
    progress.forEach(p => {
      if (p.user_id === profile?.id) map[p.question_id] = p;
    });
    return map;
  }, [progress, profile]);

  // filtered + grouped
  const filteredQuestions = useMemo(() =>
    questions.filter(q => {
      const prog = progressMap[q.id] || {};
      const status = prog.status || 'not_started';
      const matchSearch =
        q.problem_name.toLowerCase().includes(search.toLowerCase()) ||
        q.topic.toLowerCase().includes(search.toLowerCase()) ||
        (q.subtopic || '').toLowerCase().includes(search.toLowerCase());
      const matchDiff =
        selectedDifficulty === 'All' || q.difficulty === parseInt(selectedDifficulty, 10);
      const matchStatus = selectedStatus === 'All' || status === selectedStatus;
      const matchRevisit = !filterRevisit || prog.revisit === true;
      return matchSearch && matchDiff && matchStatus && matchRevisit;
    }), [questions, progressMap, search, selectedDifficulty, selectedStatus, filterRevisit]);

  const groupedByPhase = useMemo(() => {
    const groups = {};
    filteredQuestions.forEach(q => {
      if (!groups[q.phase]) groups[q.phase] = [];
      groups[q.phase].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  const handleStatusChange = (questionId, newStatus) => {
    if (!profile) return;
    upsertProgress(profile.id, questionId, { status: newStatus });
  };

  const handleRevisit = (questionId, current) => {
    if (!profile) return;
    upsertProgress(profile.id, questionId, { revisit: !current });
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
    // scroll to top of table area
    setTimeout(() => {
      document.getElementById(`phase-${pick.phase}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (qLoading && !questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading DSA Sheet…</p>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const totalDone = progress.filter(p => p.user_id === profile?.id && p.status === 'done').length;

  return (
    <div className="space-y-4 pb-8">
      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">DSA Master Sheet</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {totalDone} / {totalQuestions} solved &mdash; expand a phase and click a status to log progress
          </p>
        </div>
        <button
          onClick={handleSurpriseMe}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg
                     border border-zinc-700 text-zinc-300 hover:border-violet-500/60 hover:text-violet-400
                     transition-colors cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Surprise Me
        </button>
      </div>

      {/* ── Surprise banner ── */}
      {surpriseQuestion && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg
                        border border-violet-500/30 bg-violet-500/5 text-sm">
          <div className="min-w-0">
            <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">Challenge ↓ </span>
            <span className="text-zinc-200 font-semibold">{surpriseQuestion.problem_name}</span>
            <span className="text-zinc-500 text-xs ml-2">{surpriseQuestion.topic} · {surpriseQuestion.subtopic}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {surpriseQuestion.link && (
              <a href={surpriseQuestion.link} target="_blank" rel="noreferrer"
                className="text-xs text-violet-400 hover:text-violet-300 underline underline-offset-2">
                Open ↗
              </a>
            )}
            <button onClick={() => setSurpriseQuestion(null)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search problem, topic, subtopic…"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-zinc-900 border border-zinc-800
                       text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-md bg-zinc-900 border border-zinc-800
                     text-zinc-300 focus:outline-none cursor-pointer">
          <option value="All">All Difficulties</option>
          {[1,2,3,4,5].map(d => <option key={d} value={d}>{'★'.repeat(d)}{'☆'.repeat(5-d)}</option>)}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 text-xs rounded-md bg-zinc-900 border border-zinc-800
                     text-zinc-300 focus:outline-none cursor-pointer">
          <option value="All">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="attempted">Attempted</option>
          <option value="done">Done</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
          <input type="checkbox" checked={filterRevisit} onChange={e => setFilterRevisit(e.target.checked)}
            className="accent-violet-500 w-3.5 h-3.5 cursor-pointer rounded" />
          Revisit
        </label>
      </div>

      {/* ── Phase accordion sections ── */}
      {Object.keys(groupedByPhase).length === 0 ? (
        <div className="text-center py-16 text-zinc-600 text-sm">No questions match your filters.</div>
      ) : (
        <div className="space-y-2">
          {Object.entries(groupedByPhase).map(([phase, phaseQuestions]) => {
            const isOpen = !!expandedPhases[phase];
            const done = phaseQuestions.filter(q => progressMap[q.id]?.status === 'done').length;
            const total = phaseQuestions.length;
            const pct = total ? Math.round((done / total) * 100) : 0;

            // Build topic groups for merged-cell display (within this phase)
            const topicGroups = {};
            phaseQuestions.forEach(q => {
              const key = q.topic;
              if (!topicGroups[key]) topicGroups[key] = [];
              topicGroups[key].push(q);
            });

            return (
              <div key={phase} id={`phase-${phase}`}
                className="border border-zinc-800/70 rounded-xl overflow-hidden bg-zinc-950/30">
                {/* Phase header */}
                <button
                  onClick={() => setExpandedPhases(prev => ({ ...prev, [phase]: !isOpen }))}
                  className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer
                             hover:bg-zinc-900/40 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 truncate">
                      {phase}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-zinc-600 font-mono">{done}/{total}</span>
                    </div>
                  </div>
                  <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors ml-2">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {/* Phase table */}
                {isOpen && (
                  <div className="overflow-x-auto border-t border-zinc-800/60">
                    <table className="w-full border-collapse text-xs" style={{ minWidth: 800 }}>
                      {/* Table head */}
                      <thead>
                        <tr className="bg-zinc-900/70 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="px-3 py-2.5 text-right w-10 font-semibold border-r border-zinc-800/40">Sr</th>
                          <th className="px-3 py-2.5 text-right w-10 font-semibold border-r border-zinc-800/40">Sub</th>
                          <th className="px-3 py-2.5 w-24 font-semibold border-r border-zinc-800/40">Topic</th>
                          <th className="px-3 py-2.5 w-36 font-semibold border-r border-zinc-800/40">Subtopic</th>
                          <th className="px-3 py-2.5 font-semibold border-r border-zinc-800/40">Problem Name</th>
                          <th className="px-3 py-2.5 w-20 text-center font-semibold border-r border-zinc-800/40">Difficulty</th>
                          <th className="px-3 py-2.5 w-24 text-center font-semibold border-r border-zinc-800/40">Status</th>
                          <th className="px-3 py-2.5 w-12 text-center font-semibold border-r border-zinc-800/40">Notes</th>
                          <th className="px-3 py-2.5 w-16 text-center font-semibold">Revisit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Render rows with rowspan for Topic
                          const rows = [];
                          let globalSubSr = 0; // sub-serial within topic

                          Object.entries(topicGroups).forEach(([topic, topicQuestions]) => {
                            // Subtopic grouping within topic
                            const subtopicGroups = {};
                            topicQuestions.forEach(q => {
                              const stKey = q.subtopic || '';
                              if (!subtopicGroups[stKey]) subtopicGroups[stKey] = [];
                              subtopicGroups[stKey].push(q);
                            });

                            let topicRowsRendered = 0;

                            Object.entries(subtopicGroups).forEach(([subtopic, stQuestions]) => {
                              stQuestions.forEach((q, qIdx) => {
                                globalSubSr++;
                                const prog = progressMap[q.id] || {};
                                const status = prog.status || 'not_started';
                                const revisit = prog.revisit || false;
                                const hasNotes = !!(prog.notes || prog.solution_link);
                                const isSurprise = surpriseQuestion?.id === q.id;

                                const isFirstInTopic = topicRowsRendered === 0;
                                const isFirstInSubtopic = qIdx === 0;

                                topicRowsRendered++;

                                rows.push(
                                  <tr
                                    key={q.id}
                                    className={[
                                      'border-b border-zinc-800/30 transition-colors group/row',
                                      status === 'done' ? 'bg-emerald-950/10' : '',
                                      status === 'attempted' ? 'bg-amber-950/8' : '',
                                      isSurprise ? 'bg-violet-950/20 border-l-2 border-l-violet-500' : 'hover:bg-zinc-900/30',
                                    ].join(' ')}
                                  >
                                    {/* Sr No */}
                                    <td className="px-3 py-2 text-right font-mono text-zinc-500 border-r border-zinc-800/20 whitespace-nowrap">
                                      {q.sr_no}
                                    </td>

                                    {/* Sub Sr */}
                                    <td className="px-3 py-2 text-right font-mono text-zinc-600 border-r border-zinc-800/20 whitespace-nowrap">
                                      {globalSubSr}
                                    </td>

                                    {/* Topic — rowspan first occurrence */}
                                    {isFirstInTopic && (
                                      <td
                                        rowSpan={topicQuestions.length}
                                        className="px-3 py-2 font-semibold text-zinc-300 border-r border-zinc-800/40 align-middle text-center"
                                        style={{ borderBottom: '1px solid rgba(39,39,42,0.4)' }}
                                      >
                                        <span className="writing-vertical-rl rotate-180" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}>
                                          {topic}
                                        </span>
                                      </td>
                                    )}

                                    {/* Subtopic — rowspan first in subtopic */}
                                    {isFirstInSubtopic && (
                                      <td
                                        rowSpan={stQuestions.length}
                                        className="px-3 py-2 text-zinc-400 border-r border-zinc-800/20 align-top pt-3"
                                        style={{ borderBottom: '1px solid rgba(39,39,42,0.4)' }}
                                      >
                                        {subtopic}
                                      </td>
                                    )}

                                    {/* Problem name + link */}
                                    <td className="px-3 py-2 border-r border-zinc-800/20">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`${status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'} transition-colors`}>
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

                                    {/* Difficulty stars */}
                                    <td className="px-3 py-2 text-center border-r border-zinc-800/20 whitespace-nowrap text-amber-500">
                                      <Stars n={q.difficulty} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-3 py-2 text-center border-r border-zinc-800/20">
                                      <StatusCell
                                        status={status}
                                        onChange={newStatus => handleStatusChange(q.id, newStatus)}
                                      />
                                    </td>

                                    {/* Notes button */}
                                    <td className="px-3 py-2 text-center border-r border-zinc-800/20">
                                      <button
                                        onClick={() => openNotes(q)}
                                        className={`p-1 rounded cursor-pointer transition-colors ${hasNotes ? 'text-violet-400' : 'text-zinc-700 hover:text-zinc-400'}`}
                                        title="Add notes / solution"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                      </button>
                                    </td>

                                    {/* Revisit */}
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        onClick={() => handleRevisit(q.id, revisit)}
                                        className={`p-1 rounded cursor-pointer transition-colors ${revisit ? 'text-rose-400' : 'text-zinc-700 hover:text-zinc-400'}`}
                                        title="Flag to revisit"
                                      >
                                        <Bookmark className={`w-3.5 h-3.5 ${revisit ? 'fill-rose-400' : ''}`} />
                                      </button>
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

      {/* ── Notes / Solution modal ── */}
      {activeNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">{activeNotes.problem_name}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">{activeNotes.topic} · {activeNotes.subtopic}</p>
              </div>
              <button onClick={() => setActiveNotes(null)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer ml-4">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Solution Link</label>
                <div className="relative">
                  <Code className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                  <input type="url" value={solutionLink} onChange={e => setSolutionLink(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-md bg-zinc-900 border border-zinc-800
                               text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">Notes</label>
                <textarea value={notesText} onChange={e => setNotesText(e.target.value)}
                  placeholder="Approach, complexity, edge cases…"
                  rows={5}
                  className="w-full px-3 py-2 text-xs rounded-md bg-zinc-900 border border-zinc-800
                             text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setActiveNotes(null)}
                className="px-3 py-1.5 text-xs rounded-md border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={saveNotes}
                className="px-3 py-1.5 text-xs rounded-md bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5">
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
