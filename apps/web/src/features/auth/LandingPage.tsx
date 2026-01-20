import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center px-8 pt-20 text-center transition-colors">
      <div className="w-20 h-20 bg-[var(--primary)] rounded-[28px] flex items-center justify-center mb-10 shadow-2xl shadow-indigo-500/20">
        <Sparkles className="text-white w-12 h-12" />
      </div>
      
      <h1 className="text-5xl font-black text-[var(--text)] mb-6 tracking-tight leading-[1.1]">
        The modular<br />
        <span className="text-[var(--primary)]">Fitness Tribe.</span>
      </h1>
      
      <p className="text-[var(--text-muted)] text-lg mb-16 max-w-xs font-medium leading-relaxed">
        Connect your training metrics with your group. Simple, fast, and modular.
      </p>

      <div className="w-full space-y-4 max-w-xs">
        <button 
          onClick={() => navigate('/signup')}
          className="w-full bg-[var(--text)] text-[var(--bg)] font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
        >
          JOIN RELAY
          <ArrowRight className="w-5 h-5" />
        </button>
        <button 
          onClick={() => navigate('/login')}
          className="w-full py-4 text-[var(--text-muted)] font-black tracking-widest text-xs hover:text-[var(--primary)] transition-colors"
        >
          LOG IN
        </button>
      </div>
    </div>
  );
};

export default LandingPage;