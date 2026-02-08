import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import GymAnalytics from './pages/GymAnalytics';

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { workoutHistory } = useApp();

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
            ANALYTICS<span className="text-[var(--primary)]">.</span>
          </h2>
          <p className="text-[var(--text-muted)] font-medium">All modules.</p>
        </div>

        <div className="w-10" />
      </div>

      <GymAnalytics workoutHistory={workoutHistory} />
    </div>
  );
};

export default AnalyticsDashboard;
