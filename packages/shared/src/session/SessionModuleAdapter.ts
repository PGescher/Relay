// packages/shared/src/session/SessionModuleAdapter.ts

import type { SessionModuleKey } from './SessionTypes';

/**
 * A UI component provided by a module.
 * The concrete framework (React) is defined in the app layer.
 */
export type SessionViewComponent<Props = any> = (props: Props) => unknown;

export interface SessionModuleAdapter<State = unknown, StartPayload = unknown> {
  /** Which module this adapter belongs to */
  module: SessionModuleKey;

  /** Create initial module state when a session starts */
  createInitialState(payload?: StartPayload): State;

  /** Expanded overlay UI */
  ExpandedView: SessionViewComponent<{
    sessionId: string;
    state: State;
  }>;

  /** Minimized pill UI */
  MinimizedView: SessionViewComponent<{
    sessionId: string;
    state: State;
  }>;

  /** Called when session finishes successfully */
  onFinish(args: { sessionId: string; state: State }): Promise<void> | void;

  /** Optional cancel hook */
  onCancel?(args: { sessionId: string; state: State }): Promise<void> | void;

  /** Optional persistence helpers */
  serialize?(state: State): unknown;
  deserialize?(raw: unknown): State;
}
