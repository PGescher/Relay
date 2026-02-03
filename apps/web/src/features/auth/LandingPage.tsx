
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0000] text-white flex flex-col items-center justify-center px-8 relative overflow-hidden font-inter">
      {/* 1. Base Dot Grid */}
      <div className="absolute inset-0 dot-grid pointer-events-none opacity-30" />
      
      {/* 2. Noise Texture Layer */}
      <div className="absolute inset-0 noise" />

      {/* 3. Primary Central Pulse Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-900 rounded-full blur-[140px] animate-pulse-glow pointer-events-none z-0" />

      {/* 4. Secondary Drifting Glows for depth */}
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-rose-950/20 rounded-full blur-[120px] animate-drift pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#30000a]/20 rounded-full blur-[120px] animate-drift pointer-events-none" style={{ animationDirection: 'reverse' }} />

      {/* 5. Scanning Light Beam */}
      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent animate-scan pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* 6. Floating Particles */}
      <div className="absolute top-[20%] left-[15%] w-1.5 h-1.5 bg-rose-400 rounded-full opacity-20 animate-float" />
      <div className="absolute bottom-[25%] right-[20%] w-2 h-2 bg-rose-400 rounded-full opacity-15 animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[60%] right-[10%] w-1 h-1 bg-white rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }} />

      {/* Main Content */}
      <div className="flex flex-col items-center z-10 w-full relative">
        
        {/* Logo with interactive hover */}
        <div className="mb-14 relative animate-reveal stagger-1">
          <div className="w-24 h-24 bg-white rounded-[38px] flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.08)] group transition-all duration-700 hover:rotate-[360deg] hover:rounded-[48px]">
            <Zap className="text-[#800020] w-12 h-12 fill-current transform transition-transform duration-500 group-hover:scale-110" />
          </div>
          <div className="absolute -inset-6 border border-white/5 rounded-full animate-pulse opacity-40 pointer-events-none" />
        </div>

        {/* Hero Typography */}
        <div className="text-center mb-16 select-none animate-reveal stagger-2">
          <h1 className="text-8xl md:text-[145px] font-[900] italic tracking-tighter leading-[0.78] uppercase flex flex-col items-center group">
            <span className="text-white drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-transform duration-500 group-hover:-translate-y-2">BIG</span>
            <span className="text-[#68001a] tracking-[-0.05em] drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:translate-y-2">STEPPA.</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-10 w-full max-w-xs animate-reveal stagger-3">
          <Link 
            to="/signup"
            className="group w-full bg-[#800020] text-white py-6 rounded-full flex items-center justify-center gap-3 hover:bg-[#a8002d] active:scale-[0.97] transition-all shadow-[0_15px_45px_rgba(128,0,32,0.45)] border border-white/5"
          >
            <span className="text-2xl font-[900] italic uppercase tracking-tight">ENLIST</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
          </Link>
          
          <div className="flex items-center gap-6 w-full opacity-60 hover:opacity-100 transition-all">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-white/20"></div>
            <Link 
              to="/login" 
              className="text-[11px] font-[900] uppercase tracking-[0.5em] text-white/50 hover:text-white transition-all whitespace-nowrap group flex items-center gap-2"
            >
              RESUME
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse group-hover:bg-white" />
            </Link>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/20 to-white/20"></div>
          </div>
        </div>
      </div>

      {/* Terminal Signature */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-[900] uppercase tracking-[0.8em] text-white/10 select-none animate-reveal stagger-3" style={{ animationDelay: '0.6s' }}>
        Relay // v. 0.0.1
      </div>
    </div>
  ); 
};

export default LandingPage;
