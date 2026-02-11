import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useApp } from '../../context/AppContext';
import type { ActiveSession } from '@relay/shared';

// ✅ Registry
import { getModuleAdapter } from '../../session/moduleRegistry';

type OverlayMode = 'expanded' | 'minimized';

const FAST = { type: 'spring', stiffness: 900, damping: 52, mass: 0.6 } as const;
const MINIMIZE_EVENT = 'relay:overlay:minimize';

export const ActiveSessionOverlay: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const app = useApp() as any;

  // Bridge: currently the "real" running session is `currentWorkout`
  const { currentWorkout, handMode, setActiveOverlay, overlayExpandReq } = app;

  const [mode, setMode] = useState<OverlayMode>('expanded');

  // optional: keep scroll position when minimizing (works if adapter view is forwardRef)
  const savedScrollTopRef = useRef<number>(0);
  const sessionViewRef = useRef<any>(null);

  // Build an ActiveSession (bridge) from currentWorkout
  const activeSession: ActiveSession | null = useMemo(() => {
    if (!currentWorkout) return null;

    const dockSide = handMode === 'left' ? 'LEFT' : 'RIGHT';

    return {
      id: currentWorkout.id,
      module: 'GYM',
      lifecycle: 'ACTIVE',
      ui: {
        overlay: mode === 'expanded' ? 'EXPANDED' : 'MINIMIZED',
        dockSide,
      },
      // v0.0.1 bridge: state still lives in AppContext, but we pass it anyway
      state: currentWorkout,
      meta: {
        startedAt: currentWorkout.startTime ?? Date.now(),
        lastActiveAt: Date.now(),
        version: 1,
        persistenceKey: `session:GYM:${currentWorkout.id}`,
        restorePolicy: 'ifNotFinished',
      },
    };
  }, [currentWorkout?.id, currentWorkout?.startTime, handMode, mode]);

  // when workout starts: open expanded
  useEffect(() => {
    if (currentWorkout) setMode('expanded');
  }, [currentWorkout?.id]);

  // expose overlay state to AppShell (interaction + header)
  useEffect(() => {
    if (!activeSession) {
      setActiveOverlay?.({ mode: 'hidden' });
      return;
    }
    if (mode === 'expanded') setActiveOverlay?.({ mode: 'expanded' });
    else setActiveOverlay?.({ mode: 'minimized', dock: handMode === 'left' ? 'left' : 'right' });
  }, [activeSession?.id, mode, handMode, setActiveOverlay]);

  // If AppShell requests expanding (e.g. "Resume workout"), force expanded.
  useEffect(() => {
    if (!activeSession) return;
    setMode('expanded');
  }, [overlayExpandReq]); // intentionally not depending on activeSession.id

  const minimize = () => {
    savedScrollTopRef.current = sessionViewRef.current?.getScrollTop?.() ?? 0;
    setMode('minimized');
  };

  const expand = () => {
    setMode('expanded');
    requestAnimationFrame(() => {
      sessionViewRef.current?.setScrollTop?.(savedScrollTopRef.current);
    });
  };

  // ✅ MINIMIZE ONLY WHEN APPSHELL ASKS FOR IT
  useEffect(() => {
    const handler = () => {
      if (!activeSession) return;
      if (mode !== 'expanded') return;
      minimize();
    };

    window.addEventListener(MINIMIZE_EVENT, handler as EventListener);
    return () => window.removeEventListener(MINIMIZE_EVENT, handler as EventListener);
  }, [activeSession?.id, mode]);

  if (!activeSession) return null;

  const dockSide = activeSession.ui.dockSide === 'LEFT' ? 'left' : 'right';

  // ✅ Adapter lookup
  const adapter = getModuleAdapter(activeSession.module);

  // choose view by overlay mode
  const View: any = mode === 'expanded' ? adapter.ExpandedView : adapter.MinimizedView;

  return (
    <>
      {/* Expanded overlay */}
      <AnimatePresence>
        {mode === 'expanded' && (
          <motion.div
            key="overlay-expanded"
            className="fixed inset-0 z-[220]"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.12 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/18 backdrop-blur-[2px]" />

            {/* Home button (visual only; your real nav is in AppShell) */}
            <Link
              to="/home"
              className="fixed z-[240] top-[calc(env(safe-area-inset-top)+10px)] left-3 w-11 h-11 rounded-2xl bg-[var(--primary)] shadow-lg shadow-black/15 flex items-center justify-center"
              aria-label="Home"
              title="Home"
            >
              <Sparkles className="text-white w-5 h-5" />
            </Link>

            {/* full-screen session */}
            <div className="absolute inset-0">
              <div className="h-full w-full bg-[var(--bg)]">
                <View ref={sessionViewRef} sessionId={activeSession.id} state={activeSession.state} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized pill */}
      <AnimatePresence>
        {mode === 'minimized' && (
          <motion.button
            key="overlay-pill"
            type="button"
            onClick={expand}
            className={[
              'fixed z-[235] top-[calc(env(safe-area-inset-top)+92px)]',
              'px-3 py-2 rounded-2xl',
              'border border-[var(--border)]',
              'bg-[var(--bg)]/84 backdrop-blur-xl',
              'shadow-[0_18px_60px_rgba(0,0,0,0.45)]',
              'flex items-center gap-2',
              'text-[var(--text)]',
              'active:scale-[0.98] transition-transform',
              dockSide === 'left' ? 'left-3' : 'right-3',
            ].join(' ')}
            initial={reduceMotion ? false : { opacity: 0, x: dockSide === 'left' ? -14 : 14, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: dockSide === 'left' ? -14 : 14, scale: 0.98 }}
            transition={FAST}
            aria-label="Reopen active session"
            title="Reopen active session"
          >
            {dockSide === 'left' ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest opacity-85">Active</span>
            <Maximize2 size={16} className="opacity-80" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};
