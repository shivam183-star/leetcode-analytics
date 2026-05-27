import React, { useState } from 'react';
import axios from 'axios';
import { Target, CheckCircle2, Zap, Trophy, Flame, Calendar, Activity } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { StatCard } from './components/StatCard';
import { DifficultyPieChart, LanguagePieChart, TrendLineChart, MonthlyBarChart } from './components/Charts';
import { Heatmap } from './components/Heatmap';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [longLoading, setLongLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (username) => {
    setLoading(true);
    setLongLoading(false);
    setError('');
    setData(null);

    const timeoutId = setTimeout(() => {
      setLongLoading(true);
    }, 5000); // 5 seconds

    try {
      // Point this to your FastAPI backend URL.
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${apiUrl}/api/user/${username}`);
      setData(response.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to fetch data. Please make sure the backend server is running.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setLongLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 mb-4 tracking-tight">
          LeetCode Analytics
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Deep dive into your competitive programming journey with advanced metrics, activity tracking, and beautiful visualizations.
        </p>
      </div>

      <div className="mb-12">
        <SearchBar onSearch={handleSearch} isLoading={loading} />
        {longLoading && (
          <div className="mt-4 p-4 bg-indigo-900/50 border border-indigo-500/50 text-indigo-200 rounded-xl text-center max-w-2xl mx-auto animate-pulse flex items-center justify-center space-x-3">
            <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Waking up the server. This first search might take up to a minute...</span>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-xl text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}
      </div>

      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Solved" 
              value={data.stats.totalSolved} 
              icon={Target} 
              className="bg-gradient-to-br from-slate-900/60 to-slate-800/60"
            />
            <StatCard 
              title="Total Submissions" 
              value={data.stats.totalSubmissions} 
              icon={Activity} 
            />
            <StatCard 
              title="Acceptance Rate" 
              value={`${data.stats.acceptanceRate}%`} 
              icon={CheckCircle2} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DifficultyPieChart data={data.stats} />
            <LanguagePieChart data={data.languages} />
          </div>

          {data.hasActivity && (
            <>
              {/* Peak Activity & Streaks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Current Streak" 
                  value={`${data.streaks.current} Days`} 
                  subtitle={`Max: ${data.streaks.max} Days`}
                  icon={Flame} 
                  className="bg-gradient-to-br from-orange-900/40 to-slate-900/60 border-orange-500/30"
                />
                <StatCard 
                  title="Best Day" 
                  value={data.peak.day.submissions} 
                  subtitle={data.peak.day.date}
                  icon={Trophy} 
                />
                <StatCard 
                  title="Best Week" 
                  value={data.peak.week.submissions} 
                  subtitle={data.peak.week.date}
                  icon={Zap} 
                />
                <StatCard 
                  title="Best Month" 
                  value={data.peak.month.submissions} 
                  subtitle={data.peak.month.date}
                  icon={Calendar} 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MonthlyBarChart data={data.monthly} />
                <TrendLineChart data={data.trend} />
              </div>

              <Heatmap data={data.daily} />
            </>
          )}

        </div>
      )}

    </div>
  );
}

export default App;
