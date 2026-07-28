import React, { useState } from 'react';
import { useQuestions } from '../contexts/QuestionsContext';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus, BookOpen, Link2, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropVariants, modalVariants } from '../lib/animations';

const TOPIC_SUGGESTIONS = [
  'Added Questions',
  'Arrays',
  '2D Arrays',
  'Basic Maths',
  'Strings',
  'Binary Search',
  'Recursion',
  'Sorting',
  'OOPS',
  'Linkedlist',
  'Stacks',
  'Queues',
  'Binary Trees',
  'Binary Search Trees',
  'Heaps / Priority Queues',
  'Graphs',
  'Dynamic Programming',
  'Two Pointers & Sliding Window',
  'Prefix Sum',
  'Bit Manipulation',
  'Tries',
  'Hashmaps',
  'Greedy',
  'Backtracking',
  '__CUSTOM__'
];

const AddQuestionModal = ({ isOpen, onClose }) => {
  const { addQuestion } = useQuestions();
  const { profile, user } = useAuth();

  const [problemName, setProblemName] = useState('');
  const [topic, setTopic] = useState('Added Questions');
  const [customTopic, setCustomTopic] = useState('');
  const [subtopic, setSubtopic] = useState('General');
  const [difficulty, setDifficulty] = useState('3');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!problemName.trim()) {
      setError('Please enter problem name.');
      return;
    }

    const finalTopic = topic === '__CUSTOM__' 
      ? (customTopic.trim() || 'Added Questions') 
      : topic;

    const creatorName = profile?.display_name || profile?.username || user?.email?.split('@')[0] || 'User';

    setLoading(true);
    setError('');

    try {
      const res = await addQuestion({
        problem_name: problemName.trim(),
        topic: finalTopic,
        subtopic: subtopic.trim() || 'General',
        difficulty: parseInt(difficulty, 10),
        link: link.trim() || null,
        phase: 'Phase 1',
        is_custom: true,
        created_by_name: creatorName,
      });

      if (res.error) throw res.error;

      onClose();
      // Reset form
      setProblemName('');
      setLink('');
      setSubtopic('General');
      setCustomTopic('');
      setTopic('Added Questions');
    } catch (err) {
      setError(err.message || 'Failed to save question to Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial="hidden"
          animate="show"
          exit="exit"
          variants={backdropVariants}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            className="w-full max-w-lg glass-panel rounded-2xl p-4 sm:p-6 relative z-10 shadow-2xl shadow-black/80 border border-[#252528] max-h-[92vh] overflow-y-auto custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
        <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-[#1f1f23] mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-violet-400" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-100">Add New DSA Problem</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors touch-target flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
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
              <label className="section-label block mb-1.5">Topic / Section *</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-zinc-100 focus:outline-none text-sm bg-[#111113]"
                disabled={loading}
              >
                {TOPIC_SUGGESTIONS.map(t => (
                  <option key={t} value={t} className="bg-[#111113] text-zinc-200">
                    {t === '__CUSTOM__' ? '+ Custom Section / Topic...' : t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="section-label block mb-1.5">
                {topic === '__CUSTOM__' ? 'New Section Name *' : 'Subtopic'}
              </label>
              {topic === '__CUSTOM__' ? (
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Added Questions"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-violet-300 placeholder:text-zinc-600 focus:outline-none text-sm border-violet-500/30"
                  disabled={loading}
                />
              ) : (
                <input
                  type="text"
                  value={subtopic}
                  onChange={(e) => setSubtopic(e.target.value)}
                  placeholder="e.g. Two Pointers"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-zinc-100 placeholder:text-zinc-600 focus:outline-none text-sm"
                  disabled={loading}
                />
              )}
            </div>
          </div>

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
      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddQuestionModal;
