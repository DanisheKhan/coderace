import React, { useState, useMemo } from 'react';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { useProgressStore } from '../store/progressStore';
import StatusToggle from '../components/ui/StatusToggle';
import { 
  Search, 
  Filter, 
  Star, 
  ExternalLink, 
  Bookmark, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Shuffle, 
  Sparkles,
  Save,
  X,
  Code
} from 'lucide-react';

const MySheetPage = () => {
  const { questions, loading: qLoading } = useQuestions();
  const { profile } = useAuth();
  const { progress, upsertProgress, loading: pLoading } = useProgressStore();

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filterRevisit, setFilterRevisit] = useState(false);

  // Accordion state (expanded phases)
  const [expandedPhases, setExpandedPhases] = useState({});

  // Notes Modal state
  const [activeNotesQuestion, setActiveNotesQuestion] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [solutionLink, setSolutionLink] = useState('');

  // Extract unique phases
  const phases = useMemo(() => {
    return ['All', ...new Set(questions.map(q => q.phase))];
  }, [questions]);

  // Map progress rows for quick lookup
  const progressMap = useMemo(() => {
    const map = {};
    progress.forEach(p => {
      if (p.user_id === profile?.id) {
        map[p.question_id] = p;
      }
    });
    return map;
  }, [progress, profile]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const prog = progressMap[q.id] || {};
      const status = prog.status || 'not_started';
      const revisit = prog.revisit || false;

      const matchesSearch = q.problem_name.toLowerCase().includes(search.toLowerCase()) || 
                            q.topic.toLowerCase().includes(search.toLowerCase());
      
      const matchesPhase = selectedPhase === 'All' || q.phase === selectedPhase;
      
      let matchesDiff = true;
      if (selectedDifficulty !== 'All') {
        const diffInt = parseInt(selectedDifficulty, 10);
        matchesDiff = q.difficulty === diffInt;
      }

      const matchesStatus = selectedStatus === 'All' || status === selectedStatus;
      
      const matchesRevisit = !filterRevisit || revisit === true;

      return matchesSearch && matchesPhase && matchesDiff && matchesStatus && matchesRevisit;
    });
  }, [questions, progressMap, search, selectedPhase, selectedDifficulty, selectedStatus, filterRevisit]);

  // Group filtered questions by Phase
  const groupedQuestions = useMemo(() => {
    const groups = {};
    filteredQuestions.forEach(q => {
      if (!groups[q.phase]) {
        groups[q.phase] = [];
      }
      groups[q.phase].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  const togglePhase = (phaseName) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseName]: !prev[phaseName]
    }));
  };

  // Status Change handler
  const handleStatusChange = async (questionId, newStatus) => {
    if (!profile) return;
    await upsertProgress(profile.id, questionId, { status: newStatus });
  };

  // Revisit Change handler
  const handleRevisitChange = async (questionId, newRevisit) => {
    if (!profile) return;
    await upsertProgress(profile.id, questionId, { revisit: newRevisit });
  };

  // Open Notes Modal
  const openNotesModal = (question) => {
    const prog = progressMap[question.id] || {};
    setActiveNotesQuestion(question);
    setNotesText(prog.notes || '');
    setSolutionLink(prog.solution_link || '');
  };

  // Save Notes handler
  const saveNotes = async () => {
    if (!profile || !activeNotesQuestion) return;
    await upsertProgress(profile.id, activeNotesQuestion.id, {
      notes: notesText,
      solution_link: solutionLink
    });
    setActiveNotesQuestion(null);
  };

  // Surprise Me Handler (Picks random unsolved question from filtered list)
  const [surpriseQuestion, setSurpriseQuestion] = useState(null);
  const handleSurpriseMe = () => {
    const unsolved = filteredQuestions.filter(q => {
      const prog = progressMap[q.id] || {};
      return prog.status !== 'done';
    });

    if (unsolved.length === 0) {
      alert("No unsolved questions in the current filtered list!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * unsolved.length);
    const chosen = unsolved[randomIndex];
    setSurpriseQuestion(chosen);

    // Expand the phase of the chosen question
    setExpandedPhases(prev => ({
      ...prev,
      [chosen.phase]: true
    }));
  };

  // Star Rating Helper
  const renderStars = (difficulty) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-3.5 h-3.5 ${i < difficulty ? 'fill-amber-500' : 'text-zinc-700'}`} 
          />
        ))}
      </div>
    );
  };

  if (qLoading && questions.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin"></div>
        <p className="mt-3 text-zinc-400 text-sm">Loading DSA Sheet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/20 border border-zinc-800/80 p-5 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">DSA master sheet</h2>
          <p className="text-zinc-500 text-sm mt-1">
            Complete the 502 questions sheet to win the race. Expand phases to log solves.
          </p>
        </div>
        <button
          onClick={handleSurpriseMe}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-500/10 cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
          <span>Surprise Me</span>
        </button>
      </div>

      {/* Surprise Question Banner */}
      {surpriseQuestion && (
        <div className="glass-panel border-violet-500/30 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Your Surprise Challenge</p>
              <h4 className="text-sm font-bold text-zinc-100 mt-0.5">{surpriseQuestion.problem_name}</h4>
              <p className="text-xs text-zinc-400 mt-1">{surpriseQuestion.phase} • {surpriseQuestion.topic}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={surpriseQuestion.link}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
            >
              <span>Solve</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setSurpriseQuestion(null)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-[#121214]/50 p-4 rounded-2xl border border-zinc-900 shadow-sm">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problem name or topic..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input text-zinc-100 focus:outline-none"
          />
        </div>

        {/* Difficulty Filter */}
        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl glass-input text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="1">1 Star (Very Easy)</option>
            <option value="2">2 Stars (Easy)</option>
            <option value="3">3 Stars (Medium)</option>
            <option value="4">4 Stars (Hard)</option>
            <option value="5">5 Stars (Very Hard)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl glass-input text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="not_started">Todo</option>
            <option value="attempted">Attempted</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Revisit Toggle */}
        <div className="flex items-center justify-between px-3 py-2 border border-zinc-800 rounded-xl bg-zinc-950/20 max-md:mt-1 lg:justify-center">
          <label className="text-sm text-zinc-400 flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterRevisit}
              onChange={(e) => setFilterRevisit(e.target.checked)}
              className="accent-violet-500 rounded border-zinc-700 bg-zinc-900 w-4 h-4 cursor-pointer"
            />
            <span>Revisit Only</span>
          </label>
        </div>
      </div>

      {/* Accordions */}
      <div className="space-y-3">
        {Object.keys(groupedQuestions).length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900 rounded-2xl">
            <p className="text-zinc-500">No questions found matching the selected filters.</p>
          </div>
        ) : (
          Object.keys(groupedQuestions).map((phaseName) => {
            const phaseQuestions = groupedQuestions[phaseName];
            const isOpen = !!expandedPhases[phaseName];

            // Calculate phase completed count
            const doneCount = phaseQuestions.filter(q => {
              const prog = progressMap[q.id] || {};
              return prog.status === 'done';
            }).length;

            const totalCount = phaseQuestions.length;
            const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

            return (
              <div 
                key={phaseName}
                className={`glass-panel rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-zinc-800 bg-[#121214]/65' : 'border-zinc-900 hover:border-zinc-800 bg-zinc-950/20'
                }`}
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => togglePhase(phaseName)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer focus:outline-none select-none hover:bg-zinc-800/10 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider truncate">{phaseName}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden shrink-0">
                        <div 
                          className="bg-violet-500 h-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 shrink-0">
                        {doneCount} / {totalCount} solved ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-zinc-500 ml-2">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Table wrapper (lazy render) */}
                {isOpen && (
                  <div className="border-t border-zinc-900 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-zinc-900 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          <th className="py-3.5 px-4 w-12 text-center">No</th>
                          <th className="py-3.5 px-4 w-40">Status</th>
                          <th className="py-3.5 px-4">Problem Name</th>
                          <th className="py-3.5 px-4 w-28">Difficulty</th>
                          <th className="py-3.5 px-4 w-16 text-center">Revisit</th>
                          <th className="py-3.5 px-4 w-16 text-center">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {phaseQuestions.map((q) => {
                          const prog = progressMap[q.id] || {};
                          const status = prog.status || 'not_started';
                          const revisit = prog.revisit || false;
                          const hasNotes = !!(prog.notes || prog.solution_link);

                          return (
                            <tr 
                              key={q.id}
                              className={`
                                border-b border-zinc-950/40 text-sm transition-colors hover:bg-zinc-900/15
                                ${status === 'done' ? 'bg-emerald-950/5' : ''}
                                ${status === 'attempted' ? 'bg-amber-950/5' : ''}
                              `}
                            >
                              {/* Sr No */}
                              <td className="py-3 px-4 text-center font-mono text-xs text-zinc-500">
                                {q.sr_no}
                              </td>

                              {/* Status Toggle */}
                              <td className="py-3 px-4">
                                <StatusToggle 
                                  status={status} 
                                  onChange={(newStatus) => handleStatusChange(q.id, newStatus)} 
                                />
                              </td>

                              {/* Problem Name & LeetCode link */}
                              <td className="py-3 px-4 font-medium text-zinc-200">
                                <div className="flex items-center gap-1.5">
                                  {q.link ? (
                                    <a 
                                      href={q.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:text-violet-400 flex items-center gap-1 group/link transition-colors"
                                    >
                                      <span>{q.problem_name}</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover/link:text-violet-400 shrink-0 transition-colors" />
                                    </a>
                                  ) : (
                                    <span>{q.problem_name}</span>
                                  )}
                                </div>
                                <p className="text-xxs text-zinc-500 font-normal mt-0.5">{q.topic} {q.subtopic ? `• ${q.subtopic}` : ''}</p>
                              </td>

                              {/* Difficulty */}
                              <td className="py-3 px-4">
                                {renderStars(q.difficulty)}
                              </td>

                              {/* Revisit */}
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => handleRevisitChange(q.id, !revisit)}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    revisit 
                                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
                                      : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
                                  }`}
                                  title="Mark to redo later"
                                >
                                  <Bookmark className="w-4 h-4" />
                                </button>
                              </td>

                              {/* Notes icon */}
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => openNotesModal(q)}
                                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                    hasNotes
                                      ? 'bg-violet-500/15 border-violet-500/30 text-violet-400'
                                      : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
                                  }`}
                                  title="Add notes/solution"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Notes Dialog Modal */}
      {activeNotesQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800 mb-5">
              <div>
                <h3 className="text-base font-bold text-zinc-200 truncate">{activeNotesQuestion.problem_name}</h3>
                <p className="text-xs text-zinc-500 mt-1">{activeNotesQuestion.topic} • Phase {activeNotesQuestion.phase.split(' ')[1]}</p>
              </div>
              <button 
                onClick={() => setActiveNotesQuestion(null)}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Solution Gist / Repository Link</label>
                <div className="relative">
                  <Code className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="url"
                    value={solutionLink}
                    onChange={(e) => setSolutionLink(e.target.value)}
                    placeholder="https://github.com/... or https://gist.github.com/..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl glass-input text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Personal Study Notes</label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Paste your approach, complexities, or bugs encountered..."
                  rows={6}
                  className="w-full p-4 text-sm rounded-xl glass-input text-zinc-100 focus:outline-none resize-none"
                ></textarea>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-5 border-t border-zinc-800 mt-6">
              <button
                onClick={() => setActiveNotesQuestion(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-850 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white transition-all shadow-md shadow-violet-500/10 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySheetPage;
