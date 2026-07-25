import React, { useState } from 'react';
import { useQuestions } from '../contexts/QuestionsContext';
import { X, Plus, BookOpen, Link2, Layers, Sparkles } from 'lucide-react';

const TOPIC_SUGGESTIONS = [
  'Arrays',
  'Strings',
  'Dynamic Programming',
  'Trees',
  'Graphs',
  'Recursion',
  'Stack',
  'Queue',
  'Linked List',
  'Math',
  'Greedy',
  'Backtracking',
];

const AddQuestionModal = ({ isOpen, onClose }) => {
  const { addQuestion } = useQuestions();

  const [problemName, setProblemName] = useState('');
  const [topic, setTopic] = useState('Arrays');
  const [subtopic, setSubtopic] = useState('General');
  const [difficulty, setDifficulty] = useState('3');
  const [link, setLink] = useState('');
  const [phase, setPhase] = useState('Phase 1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemName.trim()) {
      setError('Please enter problem name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await addQuestion({
        problem_name: problemName.trim(),
        topic: topic.trim() || 'General',
        subtopic: subtopic.trim() || 'General',
        difficulty: parseInt(difficulty, 10),
        link: link.trim() || null,
        phase: phase.trim() || 'Phase 1',
      });

      if (res.error) throw res.error;

      onClose();
      // Reset form
      setProblemName('');
      setLink('');
      setSubtopic('General');
    } catch (err) {
      setError(err.message || 'Failed to save question to Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 relative z-10 shadow-2xl shadow-black/80 border border-[#252528]">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f1f23] mb-5">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-violet-400" />
            <h2 className="text-lg font-bold text-zinc-100">Add New DSA Problem</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="section-label block mb-1.5">Problem Name *</label>
            <input
              type="text"
              value={problemName}
              onChange={(e) => setProblemName(e.target.value)}
              placeholder="e.g. 3Sum Closest"
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1.5">Topic *</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-zinc-100 focus:outline-none text-sm bg-[#111113]"
                disabled={loading}
              >
                {TOPIC_SUGGESTIONS.map(t => (
                  <option key={t} value={t} className="bg-[#111113] text-zinc-200">{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="section-label block mb-1.5">Subtopic</label>
              <input
                type="text"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="e.g. Two Pointers"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="section-label block mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-zinc-100 focus:outline-none text-sm bg-[#111113]"
                disabled={loading}
              >
                <option value="1" className="bg-[#111113] text-emerald-400">★☆☆☆☆ Easy (1)</option>
                <option value="2" className="bg-[#111113] text-emerald-300">★★☆☆☆ Easy+ (2)</option>
                <option value="3" className="bg-[#111113] text-amber-400">★★★☆☆ Medium (3)</option>
                <option value="4" className="bg-[#111113] text-orange-400">★★★★☆ Hard (4)</option>
                <option value="5" className="bg-[#111113] text-rose-400">★★★★★ Expert (5)</option>
              </select>
            </div>

            <div>
              <label className="section-label block mb-1.5">Phase</label>
              <input
                type="text"
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                placeholder="e.g. Phase 1"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="section-label block mb-1.5">Problem Link (LeetCode/GFG/CodeChef URL)</label>
            <div className="relative">
              <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f1f23]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-xs font-semibold transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                'Save Problem to Supabase'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;
