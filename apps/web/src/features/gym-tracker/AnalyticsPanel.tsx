// Redesigned AnalyticsPanel.tsx
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { calculate1RM, getMuscleGroupSplits, getVolume, getAdvancedInsights } from './analyticsUtils';
import { useApp } from '../../context/AppContext';
import { useMemo, useState } from 'react';

import { ChevronLeft, ChevronRight, Trophy, Dumbbell, Flame, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsPanel: React.FC = () => {
  const { workoutHistory } = useApp();
  const [exerciseId, setExerciseId] = useState('all');
  const [view, setView] = useState<'volume' | 'strength' | 'split'>('volume');

  // Derived Data
  const muscleSplits = useMemo(() => getMuscleGroupSplits(workoutHistory), [workoutHistory]);
  
  const chartData = useMemo(() => {
    return workoutHistory
      .filter(w => w.status === 'completed')
      .sort((a, b) => a.startTime - b.startTime)
      .map(w => {
        const date = new Date(w.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        if (exerciseId === 'all') {
          return { date, value: getVolume(w), name: w.name };
        } else {
          const log = w.logs.find(l => l.exerciseId === exerciseId);
          const max1RM = log ? Math.max(...log.sets.map(s => calculate1RM(s.weight, s.reps))) : 0;
          return { date, value: Math.round(max1RM), name: w.name };
        }
      });
  }, [workoutHistory, exerciseId]);

  // 1. Get exercise list and find current index for "Cycling"
  const exerciseOptions = useMemo(() => {
    const map = new Map<string, string>();
    workoutHistory.forEach(w => w.logs.forEach(l => map.set(l.exerciseId, l.exerciseName)));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [workoutHistory]);

  const currentIndex = exerciseOptions.findIndex(e => e.id === exerciseId);

  const cycleExercise = (direction: 'next' | 'prev') => {
    if (exerciseOptions.length === 0) return;
    let nextIdx = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIdx >= exerciseOptions.length) nextIdx = -1; // back to all
    if (nextIdx < -1) nextIdx = exerciseOptions.length - 1;
    
    setExerciseId(nextIdx === -1 ? 'all' : exerciseOptions[nextIdx].id);
  };

  // 2. Advanced Insights logic
  const insights = useMemo(() => getAdvancedInsights(workoutHistory), [workoutHistory]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['volume', 'strength', 'split'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as any)}
            className={`px-6 py-3 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all
              ${view === v ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--text)]' : 'bg-[var(--glass)] border-[var(--border)] text-[var(--text-muted)]'}`}
          >
            {v}
          </button>
        ))}
      </div>
      {/* 1. TOP INSIGHT CARDS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-[var(--primary)] p-5 text-white shadow-lg shadow-[var(--primary)]/20">
          <Trophy size={20} className="opacity-80" />
          <p className="text-[10px] font-black uppercase mt-4 opacity-80">Favorite</p>
          <h4 className="text-lg font-black leading-tight italic uppercase">{insights.favorite?.name || '---'}</h4>
          <p className="text-[10px] font-bold mt-1">{insights.favorite?.count} sessions total</p>
        </div>
        
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] p-5 shadow-sm">
          <TrendingUp size={20} className="text-[var(--primary)]" />
          <p className="text-[10px] font-black uppercase mt-4 text-[var(--text-muted)]">Absolute PR</p>
          <h4 className="text-lg font-black leading-tight italic uppercase">{insights.strongest?.name.split(' ')[0]}</h4>
          <p className="text-[10px] font-bold text-[var(--primary)] mt-1">{Math.round(insights.strongest?.oneRM || 0)} kg Est. 1RM</p>
        </div>
      </div>
        
      {/* 2. EXERCISE CYCLER */}
      <div className="flex items-center justify-between bg-[var(--glass)] border border-[var(--border)] rounded-[24px] p-2">
        <button onClick={() => cycleExercise('prev')} className="p-3 hover:bg-[var(--bg-card)] rounded-xl transition-colors">
          <ChevronLeft size={20} />
        </button>
        
        <div className="text-center">
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Currently Viewing</p>
          <p className="text-sm font-black italic uppercase">{exerciseId === 'all' ? 'Overall Progress' : exerciseOptions[currentIndex]?.name}</p>
        </div>

        <button onClick={() => cycleExercise('next')} className="p-3 hover:bg-[var(--bg-card)] rounded-xl transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 3. MAIN AREA CHART (Existing chart logic goes here, but styled better) */}
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--glass)] p-6 shadow-xl relative overflow-hidden"></div>

        {/* Main Chart Card */}
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--glass)] p-6 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black italic uppercase">{exerciseId === 'all' ? 'Workload' : 'Max Strength'}</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Progress Over Time</p>
            </div>
            <select 
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-2 text-xs font-bold"
              onChange={(e) => setExerciseId(e.target.value)}
            >
              <option value="all">All Exercises</option>
              {/* Map your exercise options here */}
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase">{payload[0].payload.date}</p>
                          <p className="text-lg font-black italic">{payload[0].value} {exerciseId === 'all' ? 'kg' : 'kg (1RM)'}</p>
                          <p className="text-[10px] font-bold text-[var(--primary)]">{payload[0].payload.name}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Muscle Split & Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--glass)] p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-6">Target Split</h3>
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={muscleSplits}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {muscleSplits.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {muscleSplits.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-[10px] font-black uppercase">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--glass)] p-6 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2">Pound-for-Pound</p>
              <h4 className="text-4xl font-black italic uppercase">Level 42</h4>
              <p className="text-xs text-[var(--text-muted)] mt-2 font-medium leading-relaxed">
                Based on your current volume and estimated 1RM, you are stronger than 84% of users in your weight class.
              </p>
              <button className="mt-6 w-full py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--primary-soft)] transition-all">
                View Insights
              </button>
          </div>

      {/* 4. PERFORMANCE SUMMARY TABLE */}
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
          <h3 className="text-[10px] font-black uppercase tracking-widest">Strength Rankings</h3>
          <Flame size={16} className="text-orange-500" />
        </div>
        <div className="divide-y divide-[var(--border)]">
          {Object.entries(insights.allStats)
            .sort((a, b) => b[1].max1RM - a[1].max1RM)
            .slice(0, 5)
            .map(([name, stats], i) => (
              <div key={name} className="px-5 py-4 flex items-center justify-between hover:bg-[var(--glass)] transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-[var(--text-muted)] w-4">{i + 1}</span>
                  <div>
                    <p className="text-sm font-black uppercase italic leading-none">{name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold">{stats.sets} total sets</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black italic">{Math.round(stats.max1RM)} kg</p>
                  <p className="text-[9px] font-bold text-[var(--primary)] uppercase">Est. 1RM</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export default AnalyticsPanel