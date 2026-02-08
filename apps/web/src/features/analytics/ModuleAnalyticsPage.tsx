//generic wrapper
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Dumbbell, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const MODULE_MAP: Record<string, { label: string; appModule: string; icon: React.ReactNode }> = {
  gym: { label: 'Gym', appModule: 'GYM', icon: <Dumbbell size={18} /> },
  // running: { label: 'Running', appModule: 'RUN', icon: <Timer size={18} /> },
};

const ModuleAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { module } = useParams<{ module: string }>();
  const { workoutHistory } = useApp();

  const meta = module ? MODULE_MAP[module] : null;

  const scopedHistory = useMemo(() => {
    if (!meta) return [];
    return workoutHistory.filter(w => w.module === meta.appModule);
  }, [workoutHistory, meta]);

  if (!meta) {
    return (
      <div className="px-6 py-8">
        <button onClick={() => navigate('/analytics')} className="text-[var(--primary)] font-bold">
          Back to Analytics
        </button>
        <div className="mt-4 text-[var(--text-muted)]">Unknown module.</div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-2xl border border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-[900] italic tracking-tighter text-[var(--text)]">
            {meta.label.toUpperCase()}<span className="text-[var(--primary)]">.</span>
          </h2>
          <p className="text-[var(--text-muted)] font-medium">Module analytics.</p>
        </div>

        <button
          onClick={() => navigate('/analytics')}
          className="p-2 rounded-2xl border border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl"
          title="Overall Analytics"
        >
          <TrendingUp size={18} />
        </button>
      </div>

      <AnalyticsPanel workoutHistory={scopedHistory} />
    </div>
  );
};

export default ModuleAnalyticsPage;
