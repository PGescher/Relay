import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Timer, Navigation } from 'lucide-react';

const ActivitiesOverview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black">Choose Activity.</h2>
      <div className="grid grid-cols-2 gap-4">
        <ModuleCard 
          label="Gym" 
          icon={<Dumbbell size={32} />} 
          color="bg-blue-500" 
          onClick={() => navigate('/activities/gym')} 
        />
        <ModuleCard 
          label="Running" 
          icon={<Timer size={32} />} 
          color="bg-orange-500" 
          onClick={() => navigate('/activities/run')} 
        />
      </div>
    </div>
  );
};

const ModuleCard: React.FC<{ label: string; icon: React.ReactNode; color: string; onClick: () => void }> = ({ 
  label, icon, color, onClick 
}) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-8 rounded-[40px] bg-[var(--bg-card)] border border-[var(--border)] gap-4 hover:border-[var(--primary)] transition-colors"
  >
    <div className={`${color} text-white p-4 rounded-2xl shadow-lg`}>
      {icon}
    </div>
    <span className="font-black text-xs uppercase tracking-widest">{label}</span>
  </button>
);

export default ActivitiesOverview;