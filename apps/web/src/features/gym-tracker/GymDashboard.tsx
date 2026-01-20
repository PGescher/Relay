import React from 'react';
import { Play, History, BookOpen } from 'lucide-react';

const GymDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="text-center py-6">
        <h2 className="text-3xl font-black">Gym Tracker.</h2>
        <p className="text-[var(--text-muted)]">Track sets, reps, and PRs.</p>
      </div>

      <button className="w-full bg-[var(--text)] text-[var(--bg)] p-6 rounded-[32px] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
        <Play fill="currentColor" size={20} />
        <span className="font-black text-lg">START NEW WORKOUT</span>
      </button>

      <div className="grid grid-cols-1 gap-3">
        <button className="flex justify-between items-center p-5 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <History size={18} className="text-[var(--text-muted)]" />
            <span className="font-bold">Recent History</span>
          </div>
          <span className="text-xs bg-[var(--bg)] px-2 py-1 rounded-md text-[var(--text-muted)]">12 sessions</span>
        </button>
      </div>
    </div>
  );
};

export default GymDashboard;