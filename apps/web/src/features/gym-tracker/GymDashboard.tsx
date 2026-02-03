import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, History, Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkoutSession } from '@relay/shared';
import ActiveWorkout from './ActiveWorkout';
import { useWorkoutDraftRestore } from './useWorkoutDraftRestore';

const GymDashboard: React.FC = () => {
  const { currentWorkout, setCurrentWorkout, setActiveTab, workoutHistory, isViewingActiveWorkout } = useApp();
  const navigate = useNavigate();

  // ✅ restore draft if exists (and no currentWorkout)
  useWorkoutDraftRestore();

  if (currentWorkout && isViewingActiveWorkout) {
    return <ActiveWorkout />;
  }

  const startWorkout = () => {
    const newWorkout: WorkoutSession = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      startTime: Date.now(),
      logs: [],
      status: 'active',
      module: 'GYM',
    };

    setCurrentWorkout(newWorkout);
    navigate('/activities/gym/active');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-6 py-8">
      <div className="text-center py-4">
        <h2 className="text-4xl font-black italic tracking-tighter">
          GYM TRACKER<span className="text-[var(--primary)]">.</span>
        </h2>
        <p className="text-[var(--text-muted)] font-medium">Precision tracking for peak performance.</p>
      </div>

      {currentWorkout ? (
        <button
          onClick={() => navigate('/activities/gym/active')}
          className="w-full bg-[var(--primary)] text-white p-8 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:opacity-95 active:scale-95 transition-all shadow-xl"
        >
          <span className="font-black text-xl tracking-tight uppercase">Resume Session</span>
        </button>
      ) : (
        <button
          onClick={startWorkout}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] p-8 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:bg-[var(--glass-strong)] active:scale-95 transition-all shadow-xl"
        >
          <div className="bg-[var(--primary-soft)] p-4 rounded-full">
            <Play fill="currentColor" size={32} className="text-[var(--primary)]" />
          </div>
          <span className="font-black text-xl tracking-tight">START NEW WORKOUT</span>
        </button>
      )}

      <div className="grid grid-cols-1 gap-3">
        <DashboardAction
          title="Recent History"
          meta={`${workoutHistory.length} sessions`}
          onClick={() => setActiveTab('history')}
          right={<ChevronRight size={18} className="text-[var(--text-muted)]" />}
        />
        <DashboardAction title="Templates" meta="Coming next" onClick={() => {}} right={<ChevronRight size={18} className="text-[var(--text-muted)]" />} />
        <DashboardAction title="Progress Analytics" meta="Coming soon" onClick={() => {}} right={<ChevronRight size={18} className="text-[var(--text-muted)]" />} />
      </div>
    </div>
  );
};

const DashboardAction: React.FC<{
  title: string;
  meta: string;
  onClick: () => void;
  right: React.ReactNode;
}> = ({ title, meta, onClick, right }) => (
  <button
    onClick={onClick}
    className="flex justify-between items-center p-6 bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] hover:bg-[var(--glass-strong)] transition-colors"
  >
    <div className="text-left">
      <span className="font-black text-sm block">{title}</span>
      <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-tighter">{meta}</span>
    </div>
    {right}
  </button>
);

export default GymDashboard;
