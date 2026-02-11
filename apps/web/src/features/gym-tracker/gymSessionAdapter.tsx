// apps/web/src/features/gym-tracker/gymSessionAdapter.tsx

import React, { forwardRef } from 'react';
import type { SessionModuleAdapter } from '@relay/shared';

import { ActiveWorkoutOverlay, type ActiveWorkoutOverlayHandle } from './GymExpandedSessionView';

import { registerModule } from '../../session/moduleRegistry';

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
 * State is kernel-owned (ActiveSession.state), treated as opaque by AppShell/kernel.
 */
export const gymSessionAdapter: SessionModuleAdapter<any, any> = {
  module: 'GYM',

  createInitialState(payload) {
    // For now, use the payload as state (GymDashboard passes a WorkoutSession).
    // Later you can wrap it into a richer opaque state object.
    return payload ?? {};
  },

  // Important: forwardRef so ActiveSessionOverlay can keep scrollTop (optional)
  ExpandedView: forwardRef<ActiveWorkoutOverlayHandle, { sessionId: string; state: any; api?: any }>(function GymExpanded(
    _props,
    ref
  ) {
    return <ActiveWorkoutOverlay ref={ref} mode="expanded" onRequestMinimize={requestOverlayMinimize} />;
  }),

  MinimizedView: GymMinimizedPill,

  async onFinish() {},

  async onCancel() {},
};

registerModule(gymSessionAdapter);