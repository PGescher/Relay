
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EXERCISES } from './constants.tsx';
import { Plus, Check, Trash2, ChevronDown, Clock, X } from 'lucide-react';
import { SetLog, ExerciseLog, WorkoutSession } from '@relay/shared';

const ActiveWorkout: React.FC = () => {
  const { currentWorkout, setCurrentWorkout, setWorkoutHistory, workoutHistory, setActiveTab } = useApp();
  const [timer, setTimer] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed();
    }, 1000);
    return () => clearInterval(interval);
  }, [currentWorkout]);

  const setElapsed = () => {
    if (!currentWorkout) return;
    setTimer(Math.floor((Date.now() - currentWorkout.startTime) / 1000));
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addExercise = (exerciseId: string) => {
    if (!currentWorkout) return;
    const exercise = EXERCISES.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newLog: ExerciseLog = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ id: Math.random().toString(), reps: 0, weight: 0, isCompleted: false }]
    };

    setCurrentWorkout({
      ...currentWorkout,
      logs: [...currentWorkout.logs, newLog]
    });
    setShowExercisePicker(false);
  };

  const addSet = (exerciseIndex: number) => {
    if (!currentWorkout) return;
    const newLogs = [...currentWorkout.logs];
    newLogs[exerciseIndex].sets.push({
      id: Math.random().toString(),
      reps: 0,
      weight: 0,
      isCompleted: false
    });
    setCurrentWorkout({ ...currentWorkout, logs: newLogs });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, data: Partial<SetLog>) => {
    if (!currentWorkout) return;
    const newLogs = [...currentWorkout.logs];
    newLogs[exerciseIndex].sets[setIndex] = {
      ...newLogs[exerciseIndex].sets[setIndex],
      ...data
    };
    setCurrentWorkout({ ...currentWorkout, logs: newLogs });
  };

  const finishWorkout = () => {
    if (!currentWorkout) return;
    const finished: WorkoutSession = {
      ...currentWorkout,
      endTime: Date.now(),
      status: 'completed'
    };
    setWorkoutHistory([finished, ...workoutHistory]);
    setCurrentWorkout(null);
    setActiveTab('history');
  };

  return (
    // Changed: Added pb-40 to ensure the last card isn't hidden by the App Nav
    <div className="min-h-screen bg-[var(--bg)] animate-in slide-in-from-right duration-300">
      {/* SUB-HEADER: FIXED BELOW THE MAIN HEADER */}
      {/* top-16 = 64px (the height of the AppShell header) */}
      <div className="fixed top-16 left-0 right-0 z-[90] bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <button 
            onClick={() => { if(confirm('Cancel workout?')) setCurrentWorkout(null); }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Duration</span>
                <span className="text-lg font-black italic leading-none">{formatTime(timer)}</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex flex-col items-start">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Status</span>
                <span className="text-sm font-black italic leading-none uppercase">Live Session</span>
            </div>
        </div>

        <button 
            onClick={finishWorkout}
            className="bg-white text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          Finish
        </button>
      </div>

      {/* CONTENT AREA */}
      {/* pt-20 inside this div + top-16 fixed header = 144px total offset */}
      <div className="p-6 pt-20 space-y-6 pb-40">
        <div className="space-y-6">
            {currentWorkout?.logs.map((log, exIndex) => (
               <div key={exIndex} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-5 shadow-sm">
                  {/* ... Exercise Card Content ... */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black italic text-lg">{log.exerciseName}</h3>
                    <button className="text-gray-300"><ChevronDown size={20} /></button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 px-2 text-[10px] font-black uppercase text-gray-400">
                      <span>Set</span>
                      <span>Lbs</span>
                      <span>Reps</span>
                      <span className="text-center">Done</span>
                    </div>

                    {log.sets.map((set, setIndex) => (
                      <div key={set.id} className={`grid grid-cols-4 gap-2 items-center p-2 rounded-xl transition-colors ${set.isCompleted ? 'bg-green-50' : ''}`}>
                        <span className="font-black text-sm">{setIndex + 1}</span>
                        <input 
                          type="number" 
                          value={set.weight || ''} 
                          onChange={(e) => updateSet(exIndex, setIndex, { weight: parseFloat(e.target.value) })}
                          placeholder="0"
                          className="bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold text-center w-full"
                        />
                        <input 
                          type="number" 
                          value={set.reps || ''} 
                          onChange={(e) => updateSet(exIndex, setIndex, { reps: parseInt(e.target.value) })}
                          placeholder="0"
                          className="bg-white border border-gray-100 rounded-lg p-2 text-xs font-bold text-center w-full"
                        />
                        <button 
                          onClick={() => updateSet(exIndex, setIndex, { isCompleted: !set.isCompleted })}
                          className={`flex justify-center items-center h-8 w-8 mx-auto rounded-lg transition-all ${set.isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => addSet(exIndex)}
                    className="w-full mt-4 border-2 border-dashed border-gray-200 p-3 rounded-xl text-gray-400 font-bold text-xs hover:border-blue-200 hover:text-blue-400 transition-all"
                  >
                    + ADD SET
                  </button>
               </div>
            ))}

            <button 
              onClick={() => setShowExercisePicker(true)}
              className="w-full bg-blue-50 text-blue-600 p-6 rounded-[24px] font-black flex items-center justify-center gap-2"
            >
              <Plus size={20} strokeWidth={3} />
              ADD EXERCISE
            </button>
        </div>
      </div>
      
      {/* Modal code ... */}
      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col justify-end p-4">
            <div className="bg-white rounded-[40px] p-6 max-h-[80vh] overflow-y-auto w-full max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black italic">LIBRARY</h3>
                    <button onClick={() => setShowExercisePicker(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="space-y-3">
                    {EXERCISES.map(ex => (
                        <button 
                            key={ex.id} 
                            onClick={() => addExercise(ex.id)}
                            className="w-full p-5 bg-gray-50 rounded-2xl flex justify-between items-center hover:bg-gray-100"
                        >
                            <div className="text-left">
                                <p className="font-black">{ex.name}</p>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{ex.muscleGroup}</p>
                            </div>
                            <Plus size={20} className="text-blue-600" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default ActiveWorkout;
