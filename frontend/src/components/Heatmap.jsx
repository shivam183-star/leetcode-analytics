import React from 'react';
import { format, parseISO, subDays } from 'date-fns';

export const Heatmap = ({ data }) => {
  // data is an array of {date: "YYYY-MM-DD", count: number}
  
  // Create a map for easy lookup
  const dataMap = new Map(data.map(d => [d.date, d.count]));
  
  // Generate last 365 days
  const today = new Date();
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = subDays(today, i);
    days.push(format(d, 'yyyy-MM-dd'));
  }

  // Find max count to scale colors
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getColor = (count) => {
    if (!count || count === 0) return 'bg-slate-800';
    
    const ratio = count / maxCount;
    if (ratio < 0.25) return 'bg-teal-900';
    if (ratio < 0.5) return 'bg-teal-700';
    if (ratio < 0.75) return 'bg-teal-500';
    return 'bg-teal-400';
  };

  return (
    <div className="glass-panel p-6 overflow-x-auto">
      <h3 className="text-slate-300 font-medium mb-4 text-center">Submission Activity (Last 365 Days)</h3>
      <div className="min-w-max flex justify-center mx-auto">
        <div className="flex gap-1">
          {/* Group days by week (7 days) for columns */}
          {Array.from({ length: 52 }).map((_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayOffset = weekIndex * 7 + dayIndex;
                if (dayOffset >= 365) return null;
                const dateStr = days[dayOffset];
                const count = dataMap.get(dateStr) || 0;
                
                return (
                  <div
                    key={dateStr}
                    className={`w-3 h-3 rounded-sm ${getColor(count)} hover:ring-2 hover:ring-slate-300 transition-all cursor-pointer group relative`}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {count} submissions on {format(parseISO(dateStr), 'dd-MMM-yyyy')}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
