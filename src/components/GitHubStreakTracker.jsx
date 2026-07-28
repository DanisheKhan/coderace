import React, { useState, useMemo } from 'react';
import { Flame, Calendar, Zap } from 'lucide-react';

const DAY_MS = 86400000;

const getLocalDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function GitHubStreakTracker({ progress = [], userId = null, title = "Contribution Activity" }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  const now = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => getLocalDateStr(now), [now]);
  const todayTime = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(), [now]);

  // Process progress data into date counts and streak metrics
  const { dateCounts, totalSolvedInYear, currentStreak, longestStreak } = useMemo(() => {
    if (!userId) return { dateCounts: {}, totalSolvedInYear: 0, currentStreak: 0, longestStreak: 0 };

    const userDone = progress.filter(p => p.user_id === userId && p.status === 'done');
    const counts = {};
    let totalInYear = 0;

    const oneYearAgo = todayTime - 365 * DAY_MS;

    userDone.forEach(p => {
      if (!p.updated_at) return;
      const d = new Date(p.updated_at);
      const key = getLocalDateStr(d);
      counts[key] = (counts[key] || 0) + 1;

      if (d.getTime() >= oneYearAgo) {
        totalInYear++;
      }
    });

    // Compute Streaks
    let maxStreak = 0;
    let tempStreak = 0;
    let checkDate = new Date(todayTime - 365 * DAY_MS);

    for (let i = 0; i <= 365; i++) {
      const key = getLocalDateStr(checkDate);
      if (counts[key] > 0) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
      checkDate = new Date(checkDate.getTime() + DAY_MS);
    }

    // Active Current Streak
    const yesterday = new Date(todayTime - DAY_MS);
    const yesterdayKey = getLocalDateStr(yesterday);

    let activeStreak = 0;
    let currCheck = counts[todayStr] ? new Date(todayTime) : (counts[yesterdayKey] ? yesterday : null);

    if (currCheck) {
      while (true) {
        const key = getLocalDateStr(currCheck);
        if (counts[key] > 0) {
          activeStreak++;
          currCheck = new Date(currCheck.getTime() - DAY_MS);
        } else {
          break;
        }
      }
    }

    return {
      dateCounts: counts,
      totalSolvedInYear: totalInYear,
      currentStreak: activeStreak,
      longestStreak: maxStreak,
    };
  }, [progress, userId, todayTime, todayStr]);

  // Generate 52 weeks grid (ending on current week's Saturday)
  const weeksData = useMemo(() => {
    const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
    const endDate = new Date(todayTime + (6 - dayOfWeek) * DAY_MS);
    const startDate = new Date(endDate.getTime() - (52 * 7 - 1) * DAY_MS);

    const weeks = [];
    let currentDate = new Date(startDate.getTime());

    for (let w = 0; w < 52; w++) {
      const days = [];

      for (let d = 0; d < 7; d++) {
        const key = getLocalDateStr(currentDate);
        const count = dateCounts[key] || 0;
        const dateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).getTime();

        days.push({
          date: new Date(currentDate.getTime()),
          dateStr: key,
          dateTime,
          count,
          isToday: key === todayStr,
          isFuture: dateTime > todayTime,
          formattedDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push({
        weekIndex: w,
        days
      });
    }

    return weeks;
  }, [dateCounts, now, todayTime, todayStr]);

  // Month Header Labels positioned cleanly above columns
  const monthLabels = useMemo(() => {
    const labels = [];
    let prevMonth = -1;

    weeksData.forEach((week, weekIdx) => {
      const firstDay = week.days[0];
      const month = firstDay.date.getMonth();

      if (month !== prevMonth) {
        prevMonth = month;
        labels.push({
          colIndex: weekIdx,
          name: firstDay.date.toLocaleDateString('en-US', { month: 'short' }),
        });
      }
    });

    return labels;
  }, [weeksData]);

  const getColorClass = (count) => {
    if (!count || count === 0) return 'bg-[#161b22] border-white/[0.04] hover:border-zinc-500';
    if (count === 1) return 'bg-[#006d32] border-[#006d32]'; // Layer 1 (1 solved)
    if (count === 2) return 'bg-[#26a641] border-[#26a641] shadow-sm shadow-[#26a641]/30'; // Layer 2 (2 solved)
    return 'bg-[#39d353] border-[#39d353] shadow-md shadow-[#39d353]/70'; // Layer 3 (3+ solved - Goal Reached)
  };

  return (
    <div className="glass-panel rounded-xl p-4 sm:p-5 border border-zinc-800/80 space-y-4 font-sans relative overflow-hidden">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 uppercase font-mono tracking-wider">{title}</h3>
            <p className="text-[10px] text-zinc-500">{totalSolvedInYear} questions solved in the last year</p>
          </div>
        </div>

        {/* Streak Badges */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5 text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-zinc-400 text-[10px]">Active:</span>
            <span className="font-bold text-amber-400">{currentStreak}d</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center gap-1.5 text-xs font-mono">
            <Zap className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
            <span className="text-zinc-400 text-[10px]">Longest:</span>
            <span className="font-bold text-violet-300">{longestStreak}d</span>
          </div>
        </div>
      </div>

      {/* ── Heatmap Container with Clean Padding ── */}
      <div className="overflow-x-auto no-scrollbar py-2">
        <div className="min-w-[760px] space-y-1.5 px-2">
          
          {/* Month Labels Row (positioned accurately) */}
          <div className="relative h-4 text-[9px] font-mono text-zinc-500 select-none">
            {monthLabels.map((m, idx) => {
              if (idx > 0 && m.colIndex - monthLabels[idx - 1].colIndex < 3) return null;
              return (
                <span
                  key={`${m.name}-${m.colIndex}`}
                  className="absolute top-0 text-zinc-400 font-semibold"
                  style={{ left: `calc(2.25rem + ${m.colIndex * 13}px)` }}
                >
                  {m.name}
                </span>
              );
            })}
          </div>

          {/* Heatmap Grid Row */}
          <div className="flex items-start gap-2.5 pl-1 pr-8">
            {/* Day Labels Column with proper width & padding */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-zinc-500 h-[88px] pt-[1px] shrink-0 w-7 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* 52 Weeks Columns */}
            <div className="flex gap-[3px] flex-1 py-1">
              {weeksData.map((week) => (
                <div key={week.weekIndex} className="flex flex-col gap-[3px] shrink-0">
                  {week.days.map((day) => {
                    if (day.isFuture) {
                      return (
                        <div
                          key={day.dateStr}
                          className="w-[10px] h-[10px] opacity-0 pointer-events-none"
                        />
                      );
                    }

                    return (
                      <div
                        key={day.dateStr}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-[10px] h-[10px] rounded-[2px] border transition-all cursor-pointer relative ${getColorClass(day.count)} ${
                          day.isToday
                            ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#09090b] shadow-[0_0_8px_rgba(52,211,153,0.9)] z-10 scale-105'
                            : ''
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer: Active Tooltip & Color Legend */}
          <div className="flex items-center justify-between pt-3 text-[10px] font-mono text-zinc-500 flex-wrap gap-2 px-1">
            <div className="min-h-[16px] text-zinc-300">
              {hoveredDay ? (
                <span className="flex items-center gap-1.5">
                  <span>
                    <strong className="text-emerald-400">{hoveredDay.count}</strong> {hoveredDay.count === 1 ? 'question' : 'questions'} solved on {hoveredDay.formattedDate} {hoveredDay.isToday ? '(Today)' : ''}
                  </span>
                  {hoveredDay.count >= 3 && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Goal Reached 🎉
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-zinc-600">Hover over any square for daily activity</span>
              )}
            </div>

            {/* GitHub Legend - 3 Activity Intensity Layers */}
            <div className="flex items-center gap-1.5 select-none">
              <span>Less</span>
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161b22] border border-white/[0.04]" title="0 solved" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#006d32]" title="Layer 1: 1 solved" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#26a641]" title="Layer 2: 2 solved" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#39d353] shadow-sm shadow-[#39d353]/60" title="Layer 3: 3+ solved (Goal Reached)" />
              <span>More</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
