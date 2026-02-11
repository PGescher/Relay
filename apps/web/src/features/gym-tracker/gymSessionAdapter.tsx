// apps/web/src/features/gym-tracker/gymSessionAdapter.tsx

import React, { forwardRef } from 'react';
import type { SessionModuleAdapter } from '@relay/shared';

import { ActiveWorkoutOverlay, type ActiveWorkoutOverlayHandle } from './GymExpandedSessionView';

const MINIMIZE_EVENT = 'relay:overlay:minimize';

function requestOverlayMinimize() {
  window.dispatchEvent(new CustomEvent(MINIMIZE_EVENT));
}

// Minimal placeholder (you can implement later)
function GymMinimizedPill(_props: { sessionId: string; state: any }) {
  return null;
}

/**
 * v0.0.1 adapter for Gym session.
 * State is currently driven via AppContext (currentWorkout) and draft restore inside the view.
 * We'll wire real kernel-owned state later.
 */
export const gymSessionAdapter: SessionModuleAdapter<any, any> = {
  module: 'GYM',

  createInitialState() {
    return {};
  },

  // Important: forwardRef so ActiveSessionOverlay can keep scrollTop (optional)
  ExpandedView: forwardRef<ActiveWorkoutOverlayHandle, { sessionId: string; state: any }>(function GymExpanded(
    _props,
    ref
  ) {
    return <ActiveWorkoutOverlay ref={ref} mode="expanded" onRequestMinimize={requestOverlayMinimize} />;
  }),

  MinimizedView: GymMinimizedPill,

  async onFinish() {},

  async onCancel() {},
};
