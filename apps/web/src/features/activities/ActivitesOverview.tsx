import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Timer } from 'lucide-react';

const ActivitiesOverview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 px-4 md:px-6 py-6">
      <h2 className="text-2xl font-[900] italic uppercase tracking-tight text-[var(--text)]">
        Choose Activity.
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <ModuleCard
          label="Gym"
          icon={<Dumbbell size={26} />}
          onClick={() => navigate('/activities/gym')}
        />

        <ModuleCard
          label="Running"
          subtitle="Coming soon"
          icon={<Timer size={26} />}
          disabled
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}> = ({ label, subtitle, icon, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={[
      "group w-full",
      "rounded-[28px]",
      "border border-[var(--border)]",
      "bg-[var(--glass)] backdrop-blur-xl",
      "shadow-[0_20px_60px_rgba(0,0,0,0.14)]",
      "p-8 flex flex-col items-center gap-5",
      "transition-all",
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-[var(--glass-strong)] hover:-translate-y-[1px] active:scale-[0.98]",
    ].join(" ")}
  >
    <div className="w-16 h-16 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center shadow-[0_0_40px_var(--glow)]">
      <span className="text-[var(--primary)]">{icon}</span>
    </div>

    <div className="text-center">
      <span className="block text-sm font-[900] uppercase tracking-widest text-[var(--text)]">
        {label}
      </span>

      {subtitle && (
        <span className="mt-1 block text-[10px] font-[900] uppercase tracking-[0.45em] text-[var(--text-muted)]">
          {subtitle}
        </span>
      )}
    </div>
  </button>
);

export default ActivitiesOverview;
