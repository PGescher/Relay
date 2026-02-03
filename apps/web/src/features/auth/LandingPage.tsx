import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import ThemeToggle from '../../components/ui/ThemeToggle';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--hero-bg)] text-[var(--hero-text)] flex flex-col items-center justify-center px-8 relative overflow-hidden font-inter">
      {/* Top-right controls */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-3">
        <ThemeToggle />
      </div>

      {/* Atmosphere */}
      <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />
      <div className="absolute inset-0 noise pointer-events-none" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--glow-1)] rounded-full blur-[140px] animate-pulse-glow pointer-events-none z-0" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-[var(--glow-2)] rounded-full blur-[120px] animate-drift pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[var(--glow-2)] rounded-full blur-[120px] animate-drift pointer-events-none" style={{ animationDirection: 'reverse' }} />

      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)]/25 to-transparent animate-scan pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Main Content */}
      <div className="flex flex-col items-center z-10 w-full relative">
        <div className="mb-14 relative animate-reveal stagger-1">
          <div className="w-24 h-24 bg-white rounded-[38px] flex items-center justify-center shadow-[0_0_60px_rgba(0,0,0,0.08)] group transition-all duration-700">
            <Zap className="text-[var(--primary)] w-12 h-12 fill-current transform transition-transform duration-500" />
          </div>
          <div className="absolute -inset-6 border border-[var(--border)] rounded-full animate-pulse opacity-40 pointer-events-none" />
        </div>

        <div className="text-center mb-16 select-none animate-reveal stagger-2">
          <h1 className="text-8xl md:text-[145px] font-[900] italic tracking-tighter leading-[0.78] uppercase flex flex-col items-center">
            <span className="text-[var(--text)] drop-shadow-[0_10px_30px_rgba(0,0,0,0.10)]">BIG</span>
            <span className="text-[var(--primary)] tracking-[-0.05em] drop-shadow-[0_4px_15px_rgba(0,0,0,0.18)]">STEPPA.</span>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-10 w-full max-w-xs animate-reveal stagger-3">
          <Link
            to="/signup"
            className={[
              "group w-full py-6 rounded-full flex items-center justify-center gap-3 transition-all",
              "bg-[var(--cta)] text-white hover:bg-[var(--cta-hover)] active:scale-[0.97]",
              "shadow-[0_15px_45px_var(--cta-shadow)] border border-white/5",
            ].join(" ")}
          >
            <span className="text-2xl font-[900] italic uppercase tracking-tight">Sign up</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
          </Link>

          <div className="flex items-center gap-6 w-full opacity-70 hover:opacity-100 transition-all">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[var(--text-muted)]/30 to-[var(--text-muted)]/30" />
            <Link
              to="/login"
              className="text-[11px] font-[900] uppercase tracking-[0.5em] text-[var(--text-muted)] hover:text-[var(--text)] transition-all whitespace-nowrap group flex items-center gap-2"
            >
              RESUME
              <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse" />
            </Link>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[var(--text-muted)]/30 to-[var(--text-muted)]/30" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-[900] uppercase tracking-[0.8em] text-[var(--text-muted)] select-none animate-reveal stagger-3" style={{ animationDelay: '0.6s' }}>
        Relay // v. 0.0.1
      </div>
    </div>
  );
};

export default LandingPage;
