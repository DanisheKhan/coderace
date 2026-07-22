import React, { useState, useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useQuestions } from '../contexts/QuestionsContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BarChart3, Users, Award, Percent } from 'lucide-react';

const ComparePage = () => {
  const { profiles, progress } = useProgressStore();
  const { questions } = useQuestions();

  // Active Phase for topic breakdown (default to the first phase found)
  const uniquePhases = useMemo(() => {
    return [...new Set(questions.map(q => q.phase))];
  }, [questions]);

  const [activeComparePhase, setActiveComparePhase] = useState(uniquePhases[0] || '');

  // Calculate phase progress for all users side by side
  // Data format: [ { name: 'Phase 1', 'User A': 45, 'User B': 30, ... }, ... ]
  const phaseComparisonData = useMemo(() => {
    if (profiles.length === 0 || questions.length === 0) return [];

    // Group questions by phase
    const phaseGroups = {};
    questions.forEach(q => {
      if (!phaseGroups[q.phase]) {
        phaseGroups[q.phase] = [];
      }
      phaseGroups[q.phase].push(q.id);
    });

    return Object.keys(phaseGroups).map(phaseName => {
      const qIds = phaseGroups[phaseName];
      const row = {
        // Simplify phase names for display (e.g., "PHASE 1 : FUNDAMENTALS" -> "Phase 1")
        name: phaseName.split(':')[0].trim()
      };

      profiles.forEach(p => {
        const userProgress = progress.filter(pr => pr.user_id === p.id);
        const solvedCount = userProgress.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
        const totalCount = qIds.length;
        const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
        row[p.display_name] = pct;
      });

      return row;
    });
  }, [profiles, progress, questions]);

  // Calculate topic progress for all users side by side for the selected phase
  const topicComparisonData = useMemo(() => {
    if (!activeComparePhase || profiles.length === 0 || questions.length === 0) return [];

    // Filter questions in active phase
    const phaseQuestions = questions.filter(q => q.phase === activeComparePhase);

    // Group questions by topic
    const topicGroups = {};
    phaseQuestions.forEach(q => {
      if (!topicGroups[q.topic]) {
        topicGroups[q.topic] = [];
      }
      topicGroups[q.topic].push(q.id);
    });

    return Object.keys(topicGroups).map(topicName => {
      const qIds = topicGroups[topicName];
      const row = {
        name: topicName
      };

      profiles.forEach(p => {
        const userProgress = progress.filter(pr => pr.user_id === p.id);
        const solvedCount = userProgress.filter(pr => qIds.includes(pr.question_id) && pr.status === 'done').length;
        const totalCount = qIds.length;
        const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
        row[p.display_name] = pct;
      });

      return row;
    });
  }, [profiles, progress, questions, activeComparePhase]);

  // Overall completion percentages for ranking/cards
  const userCompletionRankings = useMemo(() => {
    const totalQ = questions.length || 1;
    return profiles.map(p => {
      const solved = progress.filter(pr => pr.user_id === p.id && pr.status === 'done').length;
      const pct = Math.round((solved / totalQ) * 100);
      return {
        ...p,
        solved,
        pct
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [profiles, progress, questions]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-violet-500" />
          <span>Compare Progress</span>
        </h2>
        <p className="text-zinc-500 text-sm mt-1">Side-by-side progression comparison across topics and phases.</p>
      </div>

      {/* Grid: Overview cards */}
      {userCompletionRankings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 bg-zinc-900/10 border border-zinc-900 p-4 rounded-2xl">
          {userCompletionRankings.map((user, idx) => (
            <div key={user.id} className="glass-panel p-3 rounded-xl flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm uppercase shadow-sm"
                style={{ backgroundColor: user.avatar_color || '#6366f1' }}
              >
                {user.display_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-300 truncate">{user.display_name}</p>
                <div className="flex items-center gap-1 mt-0.5 text-xxs font-bold text-violet-400">
                  <Percent className="w-3 h-3" />
                  <span>{user.pct}% Done</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grouped Horizontal Bar Chart: Phase Completion */}
      <div className="glass-panel p-5 rounded-2xl shadow-sm min-h-[380px] flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-violet-400" />
          <h3 className="text-base font-bold text-zinc-200">Phase Progress Comparison (%)</h3>
        </div>
        
        {profiles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-zinc-500">
            No racers to compare. Add racers to see comparison charts.
          </div>
        ) : (
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={phaseComparisonData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis domain={[0, 100]} stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121214',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fafafa'
                  }}
                />
                <Legend iconType="circle" />
                {profiles.map(p => (
                  <Bar 
                    key={p.id}
                    dataKey={p.display_name} 
                    fill={p.avatar_color || '#6366f1'} 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Topic-Wise Comparison for Selected Phase */}
      <div className="glass-panel p-5 rounded-2xl shadow-sm min-h-[380px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-bold text-zinc-200">Topic Progress Comparison (%)</h3>
          </div>
          
          {/* Phase selector dropdown */}
          <div>
            <select
              value={activeComparePhase}
              onChange={(e) => setActiveComparePhase(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl glass-input text-zinc-300 focus:outline-none cursor-pointer w-full sm:w-60"
            >
              {uniquePhases.map(p => (
                <option key={p} value={p}>
                  {p.split(':')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {profiles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-zinc-500">
            No data to compare.
          </div>
        ) : (
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={topicComparisonData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#71717a" />
                <YAxis domain={[0, 100]} stroke="#71717a" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121214',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    color: '#fafafa'
                  }}
                />
                <Legend iconType="circle" />
                {profiles.map(p => (
                  <Bar 
                    key={p.id}
                    dataKey={p.display_name} 
                    fill={p.avatar_color || '#6366f1'} 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
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
