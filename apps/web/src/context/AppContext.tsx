// apps/web/src/context/AppContext.tsx
import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WorkoutSession } from '@relay/shared';

export type HandMode = 'right' | 'left';
export type NavDock = 'left' | 'center' | 'right';

interface AppContextType {
  currentWorkout: WorkoutSession | null;
  setCurrentWorkout: (workout: WorkoutSession | null) => void;

  workoutHistory: WorkoutSession[];
  setWorkoutHistory: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;

  setActiveTab: (tab: string) => void;

  isViewingActiveWorkout: boolean;
  setIsViewingActiveWorkout: (val: boolean) => void;

  // ✅ UX state
  handMode: HandMode;
  setHandMode: (v: HandMode) => void;
  toggleHandMode: () => void;

  /**
   * Dock preference for the single hub button.
   * If navDock !== 'center', it will mirror handMode (see derivedNavDock).
   */
  navDock: NavDock;
  setNavDock: (v: NavDock) => void;

  // derived: final dock side used by UI (mirrors handMode if navDock is left/right)
  derivedNavDock: NavDock;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** ---- persistence helpers ---- */
const loadHandMode = (): HandMode => {
  try {
    const v = localStorage.getItem('relay.handMode');
    return v === 'left' || v === 'right' ? v : 'right';
  } catch {
    return 'right';
  }
};

const saveHandMode = (v: HandMode) => {
  try {
    localStorage.setItem('relay.handMode', v);
  } catch {
    // ignore
  }
};

const loadNavDock = (): NavDock => {
  try {
    const v = localStorage.getItem('relay.navDock');
    return v === 'left' || v === 'center' || v === 'right' ? v : 'right';
  } catch {
    return 'right';
  }
};

const saveNavDock = (v: NavDock) => {
  try {
    localStorage.setItem('relay.navDock', v);
  } catch {
    // ignore
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutSession | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
  const [isViewingActiveWorkout, setIsViewingActiveWorkout] = useState(false);

  // ✅ Global UX state
  const [handMode, setHandModeState] = useState<HandMode>(() => loadHandMode());
  const [navDock, setNavDockState] = useState<NavDock>(() => loadNavDock());

  const navigate = useNavigate();

  const setActiveTab = (tab: string) => {
    if (tab === 'history') navigate('/activities/gym/history');
    if (tab === 'home') navigate('/home');
    if (tab === 'gym') navigate('/activities/gym');
  };

  const setHandMode = (v: HandMode) => {
    setHandModeState(v);
    saveHandMode(v);
  };

  const toggleHandMode = () => setHandMode(handMode === 'right' ? 'left' : 'right');

  const setNavDock = (v: NavDock) => {
    setNavDockState(v);
    saveNavDock(v);
  };

  // ✅ Derived behavior:
  // - center stays center
  // - left/right mirror with handMode (so “side dock” follows your one-hand toggle)
  const derivedNavDock = useMemo<NavDock>(() => {
    if (navDock === 'center') return 'center';
    return handMode === 'left' ? 'left' : 'right';
  }, [navDock, handMode]);

  // keep localStorage synced if state changes elsewhere
  useEffect(() => saveHandMode(handMode), [handMode]);
  useEffect(() => saveNavDock(navDock), [navDock]);

  return (
    <AppContext.Provider
      value={{
        currentWorkout,
        setCurrentWorkout,
        workoutHistory,
        setWorkoutHistory,
        setActiveTab,
        isViewingActiveWorkout,
        setIsViewingActiveWorkout,

        handMode,
        setHandMode,
        toggleHandMode,

        navDock,
        setNavDock,
        derivedNavDock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
