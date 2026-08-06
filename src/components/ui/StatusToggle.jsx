import React from 'react';

const StatusToggle = ({ status, onChange, disabled }) => {
  const states = [
    { value: 'not_started', label: 'Not Attempted', color: 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300' },
    { value: 'done', label: 'Solved', color: 'text-emerald-500/80 bg-emerald-500/5 hover:bg-emerald-500/15 border-emerald-500/25' }
  ];

  return (
    <div className="inline-flex rounded-xl p-0.5 bg-zinc-950/40 border border-zinc-800/80 shadow-inner">
      {states.map((s) => {
        const active = status === s.value;
        let activeClass = '';
        
        if (active) {
          if (s.value === 'not_started') activeClass = 'bg-zinc-800 text-zinc-300 border border-zinc-700/60 shadow-sm';
          if (s.value === 'attempted') activeClass = 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/5';
          if (s.value === 'done') activeClass = 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/5';
        }

        return (
          <button
            key={s.value}
            disabled={disabled}
            onClick={() => onChange(s.value)}
            className={`
              px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none border border-transparent
              ${active ? activeClass : `text-zinc-600 ${s.color}`}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
};

export default StatusToggle;
