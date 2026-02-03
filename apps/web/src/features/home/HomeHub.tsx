import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Zap, TrendingUp, ArrowRight, Flame } from 'lucide-react';

interface HomeHubProps {
  user: any;
}

const HomeHub: React.FC<HomeHubProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="px-4 md:px-6 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome / hero card */}
      <div
        className={[
          "rounded-[28px] overflow-hidden",
          "border border-[var(--border)]",
          "bg-[var(--glass)] backdrop-blur-xl",
          "shadow-[0_30px_90px_rgba(0,0,0,0.18)]",
        ].join(" ")}
      >
        <div className="px-7 pt-7 pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[10px] font-[900] uppercase tracking-[0.55em] text-[var(--text-muted)]">
                Good to see you
              </p>

              <h2 className="mt-3 text-4xl md:text-5xl font-[900] italic tracking-tighter leading-[0.9] uppercase">
                <span className="text-[var(--text)] drop-shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
                  {user?.name || 'Tribe'}
                </span>
                <span className="block text-[var(--primary)] tracking-[-0.05em] drop-shadow-[0_4px_15px_rgba(0,0,0,0.18)]">
                  MEMBER.
                </span>
              </h2>
            </div>

            <div className="shrink-0">
              <div
                className={[
                  "w-12 h-12 rounded-2xl",
                  "border border-[var(--border)]",
                  "bg-[var(--glass)]",
                  "flex items-center justify-center",
                  "shadow-[0_0_40px_var(--glow)]",
                ].join(" ")}
              >
                <TrendingUp className="text-[var(--text-muted)]" size={22} />
              </div>
            </div>
          </div>

          <div className="mt-7">
            <p className="text-[10px] font-[900] uppercase tracking-[0.55em] text-[var(--text-muted)]">
              Weekly streak
            </p>

            <div className="mt-2 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2">
                <Flame className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm font-[900] uppercase tracking-[0.25em] text-[var(--text)]">
                  4 days
                </span>
              </div>

              <span className="text-[10px] font-[900] uppercase tracking-[0.45em] text-[var(--text-muted)]">
                keep it burning
              </span>
            </div>
          </div>
        </div>

        <div className="h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent" />
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 gap-4">
        <HubPanel
          title="Activities"
          subtitle="Gym, Run, Cycle"
          icon={<Zap className="w-6 h-6 text-[var(--primary)]" />}
          onClick={() => navigate('/activities')}
        />
        <HubPanel
          title="Tribe Feed"
          subtitle="See what others are doing"
          icon={<Users className="w-6 h-6 text-[var(--primary)]" />}
          onClick={() => navigate('/feed')}
        />
      </div>
    </div>
  );
};

const HubPanel: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, subtitle, icon, onClick }) => (
  <button
    onClick={onClick}
    className={[
      "group w-full text-left",
      "rounded-[28px] border border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl",
      "shadow-[0_20px_60px_rgba(0,0,0,0.14)]",
      "px-6 py-6 flex items-center gap-5",
      "hover:bg-[var(--glass-strong)] hover:translate-y-[-1px]",
      "active:scale-[0.98] transition-all",
    ].join(' ')}
  >
    <div className="w-14 h-14 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center shadow-[0_0_40px_var(--glow)]">
      {icon}
    </div>

    <div className="flex-1 min-w-0">
      <h3 className="text-xl font-[900] italic uppercase tracking-tight text-[var(--text)]">
        {title}
      </h3>
      <p className="mt-1 text-[11px] font-[900] uppercase tracking-[0.45em] text-[var(--text-muted)]">
        {subtitle}
      </p>
    </div>

    <div className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--glass)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors">
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
    </div>
  </button>
);

export default HomeHub;
