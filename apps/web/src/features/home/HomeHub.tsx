import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Zap, TrendingUp } from 'lucide-react';

interface HomeHubProps {
  user: any;
}

const HomeHub: React.FC<HomeHubProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome & Progress Panel */}
      <div className="bg-[var(--primary)] p-8 rounded-[40px] text-white shadow-2xl shadow-indigo-500/20">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">
              Good to see you,
            </p>
            <h2 className="text-3xl font-black mt-1">{user?.name || 'Tribe Member'} 🔥</h2>
          </div>
          <TrendingUp className="opacity-50" size={32} />
        </div>
        
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest opacity-70">Weekly Streak</p>
          <p className="text-xl font-black">4 Days</p>
        </div>
      </div>

      {/* Grid of Clickable Panels */}
      <div className="grid grid-cols-1 gap-4">
        <HubPanel 
          title="Activities" 
          subtitle="Gym, Run, Cycle" 
          icon={<Zap className="text-yellow-500" />} 
          onClick={() => navigate('/activities')} 
        />
        <HubPanel 
          title="Tribe Feed" 
          subtitle="See what others are doing" 
          icon={<Users className="text-purple-500" />} 
          onClick={() => navigate('/feed')} 
        />
      </div>
    </div>
  );
};

const HubPanel: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; onClick: () => void }> = ({ 
  title, subtitle, icon, onClick 
}) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-6 p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] hover:scale-[1.02] transition-all text-left active:scale-95"
  >
    <div className="w-14 h-14 bg-[var(--bg)] rounded-2xl flex items-center justify-center shadow-sm">
      {icon}
    </div>
    <div>
      <h3 className="font-black text-lg leading-tight">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] font-medium">{subtitle}</p>
    </div>
  </button>
);

export default HomeHub;