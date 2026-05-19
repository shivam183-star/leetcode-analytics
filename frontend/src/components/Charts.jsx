import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  BarChart, Bar
} from 'recharts';

const COLORS = ['#14b8a6', '#6366f1', '#f43f5e', '#eab308', '#8b5cf6', '#ec4899'];
const DIFF_COLORS = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border-none bg-slate-800/90 shadow-lg">
        <p className="text-slate-200 mb-1 font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DifficultyPieChart = ({ data }) => {
  const chartData = [
    { name: 'Easy', value: data.easy },
    { name: 'Medium', value: data.medium },
    { name: 'Hard', value: data.hard },
  ].filter(d => d.value > 0);

  return (
    <div className="glass-panel p-6 h-80 flex flex-col">
      <h3 className="text-slate-300 font-medium mb-4">Difficulty Distribution</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DIFF_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const LanguagePieChart = ({ data }) => {
  return (
    <div className="glass-panel p-6 h-80 flex flex-col">
      <h3 className="text-slate-300 font-medium mb-4">Language Usage</h3>
      <div className="flex-1 min-h-0">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                nameKey="language"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">No language data</div>
        )}
      </div>
    </div>
  );
};

export const TrendLineChart = ({ data }) => {
  return (
    <div className="glass-panel p-6 h-96 flex flex-col">
      <h3 className="text-slate-300 font-medium mb-4">Cumulative Submissions Over Time</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="week" stroke="#475569" tick={{fill: '#94a3b8'}} tickMargin={10} />
            <YAxis stroke="#475569" tick={{fill: '#94a3b8'}} />
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="cumulative" name="Total Submissions" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCum)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const MonthlyBarChart = ({ data }) => {
  return (
    <div className="glass-panel p-6 h-96 flex flex-col">
      <h3 className="text-slate-300 font-medium mb-4">Monthly Submissions</h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
            <YAxis stroke="#475569" tick={{fill: '#94a3b8', fontSize: 12}} />
            <Tooltip cursor={{fill: '#334155'}} content={<CustomTooltip />} />
            <Bar dataKey="submissions" name="Submissions" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
