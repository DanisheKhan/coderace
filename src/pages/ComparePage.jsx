import React, { useState, useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Award } from 'lucide-react';

const tooltipStyle = {
  backgroundColor: '#111113',
  borderColor: '#1f1f23',
  borderRadius: '10px',
  color: '#f4f4f5',
  fontSize: '12px',
};

const ComparePage = () => {
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();

  const uniquePhases = useMemo(() => [...new Set(questions.map(q => q.phase))], [questions]);
  const [activeComparePhase, setActiveComparePhase] = useState(uniquePhases[0] || '');

  // Phase comparison data
  const phaseComparisonData = useMemo(() => {
    if (!profiles.length || !questions.length) return [];
    const phaseGroups = {};
    questions.forEach(q => {
      if (!phaseGroups[q.phase]) phaseGroups[q.phase] = [];
      phaseGroups[q.phase].push(q.id);
    });
    return Object.keys(phaseGroups).map(phaseName => {
      const qIds = phaseGroups[phaseName];
      const row = { name: phaseName.split(':')[0].trim() };
      profiles.forEach(p => {
        const up = progress.filter(pr => pr.user_id === p.id);
        const solved = up.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
        row[p.display_name] = qIds.length > 0 ? Math.round((solved / qIds.length) * 100) : 0;
      });
      return row;
    });
  }, [profiles, progress, questions]);

  // Topic comparison data
  const topicComparisonData = useMemo(() => {
    if (!activeComparePhase || !profiles.length || !questions.length) return [];
    const phaseQs = questions.filter(q => q.phase === activeComparePhase);
    const topicGroups = {};
    phaseQs.forEach(q => {
      if (!topicGroups[q.topic]) topicGroups[q.topic] = [];
      topicGroups[q.topic].push(q.id);
    });
    return Object.keys(topicGroups).map(topicName => {
      const qIds = topicGroups[topicName];
      const row = { name: topicName };
      profiles.forEach(p => {
        const up = progress.filter(pr => pr.user_id === p.id);
        const solved = up.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
        row[p.display_name] = qIds.length > 0 ? Math.round((solved / qIds.length) * 100) : 0;
      });
      return row;
    });
  }, [profiles, progress, questions, activeComparePhase]);

  // Overview rankings
  const userCompletionRankings = useMemo(() => {
    const totalQ = questions.length || 1;
    return profiles.map(p => {
      const solved = progress.filter(pr => pr.user_id === p.id && pr.status === 'done').length;
      return { ...p, solved, pct: Math.round((solved / totalQ) * 100) };
    }).sort((a, b) => b.pct - a.pct);
  }, [profiles, progress, questions]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">Compare Progress</h1>
        <p className="text-zinc-500 text-sm mt-1">Side-by-side progression across phases and topics.</p>
      </div>

      {/* Overview cards */}
      {userCompletionRankings.length > 0 && (
        <div className="glass-panel p-4 rounded-2xl">
          <p className="section-label mb-3">Overall Completion</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {userCompletionRankings.map((user) => (
              <div key={user.id} className="flex items-center gap-3 bg-zinc-900/40 border border-[#1f1f23] p-3 rounded-xl">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm uppercase shrink-0"
                  style={{ backgroundColor: user.avatar_color || '#6366f1' }}
                >
                  {user.display_name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-300 truncate">{user.display_name}</p>
                  <p className="text-xxs font-bold text-violet-400 mt-0.5">{user.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase comparison chart */}
      <div className="glass-panel p-5 rounded-2xl min-h-[360px] flex flex-col">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-4 h-4 text-zinc-500" />
          <p className="section-label">Phase Completion (%)</p>
        </div>
        {profiles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">
            No racers to compare.
          </div>
        ) : (
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={phaseComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
                {profiles.map(p => (
                  <Bar key={p.id} dataKey={p.display_name} fill={p.avatar_color || '#6366f1'} radius={[3, 3, 0, 0]} maxBarSize={36} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Topic comparison chart */}
      <div className="glass-panel p-5 rounded-2xl min-h-[360px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-zinc-500" />
            <p className="section-label">Topic Completion (%)</p>
          </div>
          <select
            value={activeComparePhase}
            onChange={e => setActiveComparePhase(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg glass-input text-zinc-300 focus:outline-none cursor-pointer w-full sm:w-56"
          >
            {uniquePhases.map(p => (
              <option key={p} value={p}>{p.split(':')[0].trim()}</option>
            ))}
          </select>
        </div>

        {profiles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">
            No data to compare.
          </div>
        ) : (
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topicComparisonData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#3f3f46" tick={{ fill: '#52525b', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#71717a' }} />
                {profiles.map(p => (
                  <Bar key={p.id} dataKey={p.display_name} fill={p.avatar_color || '#6366f1'} radius={[3, 3, 0, 0]} maxBarSize={36} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
