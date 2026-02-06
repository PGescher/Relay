import React, { useState } from 'react';
import Papa from 'papaparse';
import { 
  Upload, 
  Download, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Adjust path to your auth

type ImportStatus = 'idle' | 'parsing' | 'uploading_full' | 'batching' | 'exporting' | 'success' | 'error';

const GymImportExport: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const token = localStorage.getItem('relay-token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // --- LOGIC: EXPORT ---
  const handleExport = async () => {
    if (!user) return;
    setStatus('exporting');
    try {
      const res = await fetch(`/api/export/${user.id}`, { headers });
      if (!res.ok) throw new Error("Export failed");
      const jsonData = await res.json();
      
      const csv = Papa.unparse(jsonData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relay_Export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  // --- LOGIC: IMPORT ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('parsing');
    setErrorMsg(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        // Attempt 1: Try full upload
        setStatus('uploading_full');
        try {
          const res = await fetch('/api/import/strong', {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId: user?.id, rows: results.data }),
          });

          if (res.ok) {
            finishSuccess();
            return;
          }

          // If payload too large (413) or other error, fallback to Batch
          if (res.status === 413 || !res.ok) {
            console.warn("Full upload failed or too large. Starting batch fallback...");
            startBatchProcess(results.data);
          }
        } catch (err) {
          startBatchProcess(results.data);
        }
      }
    });
  };

  const startBatchProcess = async (data: any[]) => {
    setStatus('batching');
    
    // Group rows by Workout
    const workoutsMap = new Map<string, any[]>();
    data.forEach((row: any) => {
      const key = `${row.Datum}_${row["Workout-Name"]}`;
      if (!workoutsMap.has(key)) workoutsMap.set(key, []);
      workoutsMap.get(key)?.push(row);
    });

    const workoutKeys = Array.from(workoutsMap.keys());
    const totalWorkouts = workoutKeys.length;
    setProgress({ current: 0, total: totalWorkouts });

    const batchSize = 5;
    for (let i = 0; i < workoutKeys.length; i += batchSize) {
      const chunkKeys = workoutKeys.slice(i, i + batchSize);
      const chunkData = chunkKeys.map(key => ({
        name: key.split('_')[1],
        rows: workoutsMap.get(key)
      }));

      try {
        const res = await fetch('/api/import/strong-batch', {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId: user?.id, workouts: chunkData }),
        });
        
        if (!res.ok) throw new Error("Batch failed");
        
        setProgress(prev => ({ ...prev, current: Math.min(i + batchSize, totalWorkouts) }));
      } catch (error: any) {
        setErrorMsg("Failed during batch transfer.");
        setStatus('error');
        return;
      }
    }
    finishSuccess();
  };

  const finishSuccess = () => {
    setStatus('success');
    setProgress({ current: 0, total: 0 });
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-[900] italic text-[var(--text)] uppercase tracking-tighter">
          Data Lab<span className="text-[var(--primary)]">.</span>
        </h2>
        <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-[0.2em] mt-1">
          Import / Export your legacy workouts
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* IMPORT CARD */}
        <div className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${
          status === 'idle' ? 'bg-[var(--bg-card)] border-[var(--border)]' : 'bg-[var(--glass-strong)] border-[var(--primary)] shadow-2xl shadow-[var(--primary)]/10'
        } p-8`}>
          
          {status === 'idle' ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                  <Upload size={28} />
                </div>
                <div>
                  <h3 className="font-[900] italic text-lg text-[var(--text)] uppercase">Import Workouts</h3>
                  <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">Supports Strong CSV</p>
                </div>
              </div>
              
              <label className="group relative flex items-center gap-2 cursor-pointer bg-[var(--primary)] text-white px-6 py-4 rounded-2xl font-[900] italic uppercase text-sm hover:scale-105 transition-transform active:scale-95">
                <span>Select File</span>
                <ChevronRight size={18} />
                <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <div className="space-y-6 py-4">
               <StatusVisualizer status={status} progress={progress} error={errorMsg} />
            </div>
          )}
        </div>

        {/* EXPORT CARD */}
        <button 
          onClick={handleExport}
          disabled={status !== 'idle'}
          className="group flex items-center justify-between p-8 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--glass)] transition-all disabled:opacity-50"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">
              <Download size={28} />
            </div>
            <div>
              <h3 className="font-[900] italic text-lg text-[var(--text)] uppercase">Backup Cloud</h3>
              <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">Download .csv Archive</p>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--primary)] group-hover:text-[var(--primary)]">
             <ChevronRight size={20} />
          </div>
        </button>

      </div>

      {/* Info Section */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-400">
        <Database size={18} className="shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          Relay uses transactional processing. If an import fails midway, your database remains clean. Batching is automatically used for large files to bypass server limits.
        </p>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT FOR ANIMATIONS ---
const StatusVisualizer: React.FC<{ status: ImportStatus, progress: any, error: string | null }> = ({ status, progress, error }) => {
  const isBatching = status === 'batching';
  const pct = isBatching ? (progress.current / progress.total) * 100 : 0;

  if (status === 'success') return (
    <div className="flex flex-col items-center animate-in zoom-in duration-300">
      <CheckCircle2 size={48} className="text-green-500 mb-2" />
      <span className="font-[900] italic uppercase text-[var(--text)]">Sync Complete</span>
    </div>
  );

  if (status === 'error') return (
    <div className="flex flex-col items-center text-red-500 animate-in shake">
      <AlertCircle size={48} className="mb-2" />
      <span className="font-[900] italic uppercase">{error || 'Unknown Error'}</span>
      <button onClick={() => window.location.reload()} className="text-[10px] mt-4 underline uppercase tracking-widest">Retry</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <h4 className="text-[var(--primary)] font-[900] italic uppercase text-xl animate-pulse">
            {status === 'parsing' && 'Reading File...'}
            {status === 'uploading_full' && 'Direct Upload...'}
            {status === 'batching' && 'Heavy Lifting (Batching)...'}
            {status === 'exporting' && 'Generating Archive...'}
          </h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            {isBatching ? `Processing workout ${progress.current} of ${progress.total}` : 'Optimizing data structures'}
          </p>
        </div>
        {isBatching && <span className="font-[900] text-[var(--primary)] text-2xl">{Math.round(pct)}%</span>}
      </div>

      <div className="h-2 w-full bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
        <div 
          className={`h-full bg-[var(--primary)] transition-all duration-500 ${!isBatching ? 'w-1/2 animate-infinite-scroll' : ''}`}
          style={isBatching ? { width: `${pct}%` } : {}}
        />
      </div>
      
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Loader2 size={14} className="animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Don't leave this page</span>
      </div>
    </div>
  );
};

export default GymImportExport;