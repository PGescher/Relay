import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import type { WorkoutTemplate, Exercise, WorkoutSession, SetLog } from '@relay/shared';
import { ExerciseLibraryModal } from './ExerciseLibraryModal';
import { EXERCISES } from './constants';
import { useApp } from '../../context/AppContext';

const uid = () => (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

type SimpleSet = { reps?: number; weight?: number };

type TemplateRow = {
  rowId: string; // allow duplicates
  exerciseId: string;
  exerciseName: string;
  restSec: number;
  sets: SimpleSet[];
};

const clampInt = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const DEFAULT_REST_SEC = 120;

const TemplateBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { workoutHistory } = useApp(); // ✅ same source as ActiveWorkout
  const token = useMemo(() => localStorage.getItem('relay-token'), []);

  const exercises: Exercise[] = EXERCISES;
  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const [name, setName] = useState('');
  const [items, setItems] = useState<TemplateRow[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && items.length > 0 && !saving;

  // --- Prefill from workoutHistory (same logic as ActiveWorkout) ---
  const getLastCompletedSetsForExercise = (exerciseId: string): Array<{ reps: number; weight: number }> | null => {
    const hist = workoutHistory as unknown as WorkoutSession[] | undefined;
    if (!hist?.length) return null;

    const ts = (w: any) =>
      (typeof w?.endTime === 'number' && w.endTime) ||
      (typeof w?.updatedAt === 'number' && w.updatedAt) ||
      (typeof w?.startTime === 'number' && w.startTime) ||
      0;

    const sorted = [...hist].sort((a, b) => ts(b) - ts(a));

    for (const w of sorted) {
      const status = String((w as any)?.status ?? '').toLowerCase();
      const isFinished = status === 'finished' || status === 'completed' || Boolean((w as any)?.endTime);
      if (!isFinished) continue;

      const logs = (w as any)?.logs;
      if (!Array.isArray(logs)) continue;

      const log = logs.find((l: any) => l?.exerciseId === exerciseId);
      if (!log) continue;

      const sets = Array.isArray(log?.sets) ? (log.sets as SetLog[]) : [];
      if (!sets.length) continue;

      const completed = sets.filter((s) => s?.isCompleted);
      const source = completed.length ? completed : sets;

      const mapped = source.map((s) => ({
        reps: typeof s?.reps === 'number' ? s.reps : 0,
        weight: typeof s?.weight === 'number' ? s.weight : 0,
      }));

      const hasSignal =
        completed.length > 0 || mapped.some((s) => (s.reps ?? 0) !== 0 || (s.weight ?? 0) !== 0);

      if (hasSignal) return mapped;
    }

    return null;
  };

  const defaultSetsForExercise = (exerciseId: string): SimpleSet[] => {
    const last = getLastCompletedSetsForExercise(exerciseId);
    return last?.length ? last : [{ reps: 0, weight: 0 }]; // ✅ default only if never done
  };

  // --- Edit mode load ---
  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/templates/gym/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`Failed to load template (${res.status})`);

        const tpl: WorkoutTemplate = await res.json();
        if (cancelled) return;

        setName(tpl.name ?? '');
        const rows: TemplateRow[] = (tpl.data?.exercises ?? []).map((e) => ({
          rowId: uid(),
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          restSec: e.restSec ?? DEFAULT_REST_SEC,
          sets: e.sets?.length
            ? e.sets.map((s) => ({ reps: s.reps ?? 0, weight: s.weight ?? 0 }))
            : [{ reps: 0, weight: 0 }],
        }));
        setItems(rows);
      } catch (e: any) {
        alert(e?.message ?? 'Failed to load template');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEdit, id, token]);

  // --- Actions ---
  const addExerciseRows = (exerciseIds: string[]) => {
    setItems((prev) => {
      const next = [...prev];
      for (const exId of exerciseIds) {
        const ex = exerciseById.get(exId);
        if (!ex) continue;
        next.push({
          rowId: uid(),
          exerciseId: ex.id,
          exerciseName: ex.name,
          restSec: DEFAULT_REST_SEC,
          sets: defaultSetsForExercise(ex.id), // ✅ one-time prefill
        });
      }
      return next;
    });
  };

  const removeRow = (rowId: string) => setItems((prev) => prev.filter((p) => p.rowId !== rowId));

  const moveRow = (rowId: string, dir: -1 | 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.rowId === rowId);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      const [it] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, it);
      return copy;
    });
  };

  const setRestSec = (rowId: string, n: number) => {
    setItems((prev) =>
      prev.map((p) => (p.rowId === rowId ? { ...p, restSec: clampInt(n, 0, 600) } : p))
    );
  };

  const patchSet = (rowId: string, setIdx: number, patch: { reps?: number; weight?: number }) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.rowId !== rowId) return p;
        const sets = p.sets.map((s, i) => (i === setIdx ? { ...s, ...patch } : s));
        return { ...p, sets };
      })
    );
  };

  const addSet = (rowId: string) => {
    setItems((prev) =>
      prev.map((p) => (p.rowId === rowId ? { ...p, sets: [...p.sets, { reps: 0, weight: 0 }] } : p))
    );
  };

  const removeSet = (rowId: string, setIdx: number) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.rowId !== rowId) return p;
        const nextSets = p.sets.filter((_, i) => i !== setIdx);
        return { ...p, sets: nextSets.length ? nextSets : [{ reps: 0, weight: 0 }] };
      })
    );
  };

  const saveTemplate = async () => {
    const trimmed = name.trim();
    if (!trimmed || items.length === 0) return;

    setSaving(true);
    try {
      const now = Date.now();

      const payload: WorkoutTemplate = {
        dataVersion: 1,
        id: isEdit ? String(id) : uid(),
        module: 'GYM',
        name: trimmed,
        createdAt: now,
        updatedAt: now,
        data: {
          exercises: items.map((i) => ({
            exerciseId: i.exerciseId,
            exerciseName: i.exerciseName,
            restSec: i.restSec,
            targetSets: i.sets.length, // keep for compatibility
            sets: i.sets.map((s) => ({ reps: s.reps ?? 0, weight: s.weight ?? 0 })),
          })),
        },
      };

      const res = await fetch(isEdit ? `/api/templates/gym/${id}` : `/api/templates/gym`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '');
        throw new Error(msg || `Failed to save template (${res.status})`);
      }

      navigate('/activities/gym/');
    } catch (e: any) {
      alert(e?.message ?? 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Topbar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center h-11 w-11 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--glass-strong)] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0 text-center flex-1">
          <div className="text-2xl font-[900] italic text-[var(--text)] truncate">
            TEMPLATE BUILDER<span className="text-[var(--primary)]">.</span>
          </div>
          <div className="text-[10px] font-[900] uppercase tracking-[0.45em] text-[var(--text-muted)]">
            {isEdit ? 'Edit template' : 'Create template'}
          </div>
        </div>

        <button
          type="button"
          onClick={saveTemplate}
          disabled={!canSave}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] text-white px-4 py-3 disabled:opacity-60"
        >
          <Save size={16} />
          <span className="text-[10px] font-[900] uppercase tracking-widest">{saving ? 'Saving…' : 'Save'}</span>
        </button>
      </div>

      {/* Name */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl p-5">
        <label className="block text-[10px] font-[900] uppercase tracking-widest text-[var(--text-muted)] mb-2">
          Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Push Day A"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-4 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)]"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-[900] uppercase tracking-widest text-[var(--text-muted)]">
          Exercises ({items.length})
        </div>

        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] text-white px-4 py-3"
        >
          <Plus size={16} />
          <span className="text-[10px] font-[900] uppercase tracking-widest">Add</span>
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-[var(--text-muted)]">
          Add exercises to build your template.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={it.rowId} className="rounded-3xl border border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-[900] italic truncate text-[var(--text)]">{it.exerciseName}</div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveRow(it.rowId, -1)}
                      disabled={idx === 0}
                      className="p-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] disabled:opacity-40"
                      aria-label="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(it.rowId, 1)}
                      disabled={idx === items.length - 1}
                      className="p-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] disabled:opacity-40"
                      aria-label="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeRow(it.rowId)}
                      className="p-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-red-500 hover:text-red-500 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Rest top-right */}
                <div className="w-28">
                  <label className="block text-[9px] font-[900] uppercase tracking-widest text-[var(--text-muted)] mb-1">
                    Rest (sec)
                  </label>
                  <input
                    inputMode="numeric"
                    value={String(it.restSec)}
                    onChange={(e) => setRestSec(it.rowId, parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-black text-sm"
                  />
                </div>
              </div>

              {/* Sets (no numbers) */}
              <div className="mt-5 space-y-2">
                {it.sets.map((s, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      inputMode="decimal"
                      value={s.weight ?? 0}
                      onChange={(e) => {
                        const raw = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                        const num = raw === '' ? 0 : Number(raw);
                        patchSet(it.rowId, i, { weight: Number.isFinite(num) ? num : 0 });
                      }}
                      className="col-span-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-black text-sm"
                      placeholder="Weight"
                    />

                    <input
                      inputMode="numeric"
                      value={s.reps ?? 0}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        const num = raw === '' ? 0 : parseInt(raw, 10);
                        patchSet(it.rowId, i, { reps: Number.isFinite(num) ? num : 0 });
                      }}
                      className="col-span-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 font-black text-sm"
                      placeholder="Reps"
                    />

                    <button
                      type="button"
                      onClick={() => removeSet(it.rowId, i)}
                      className="col-span-2 inline-flex items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-red-500 hover:text-red-500 transition-colors py-2"
                      aria-label="Remove set"
                      title="Remove set"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add set */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => addSet(it.rowId)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-[10px] font-[900] uppercase tracking-widest hover:bg-[var(--glass-strong)]"
                >
                  + Add set
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ExerciseLibraryModal
        open={showLibrary}
        title="ADD EXERCISES"
        exercises={exercises}
        mode="multi"
        onConfirm={(ids) => addExerciseRows(ids)}
        onClose={() => setShowLibrary(false)}
      />

      {!canSave && (
        <div className="text-center text-[10px] font-[900] uppercase tracking-[0.35em] text-[var(--text-muted)] pt-2">
          Add at least 1 exercise and a name to save.
        </div>
      )}
    </div>
  );
};

export default TemplateBuilderPage;
