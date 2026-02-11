// packages/shared/src/session/SessionModuleAdapter.ts

import type { SessionModuleKey } from './SessionTypes';

export type SessionViewApi<TState = unknown> = {
  setState: (nextState: TState) => void;
  minimize: () => void;
  expand: () => void;
  finish: () => Promise<void>;
  cancel: () => void;
};

/**
 * A UI component provided by a module.
 * Framework (React) lives in app layer; this type stays serializable/framework-agnostic.
 *
 * React components are compatible because `(props) => JSX.Element` is assignable to `(props) => unknown`.
 */
export type SessionViewComponent<Props = any> = (props: Props) => unknown;

export interface SessionModuleAdapter<State = unknown, StartPayload = unknown> {
  module: SessionModuleKey;

  createInitialState(payload?: StartPayload): State;

  ExpandedView: SessionViewComponent<{
    sessionId: string;
    state: State;
    api: SessionViewApi<State>;
  }>;

  MinimizedView: SessionViewComponent<{
    sessionId: string;
    state: State;
    api: SessionViewApi<State>;
  }>;

  onFinish(args: { sessionId: string; state: State }): Promise<void> | void;

  onCancel?(args: { sessionId: string; state: State }): Promise<void> | void;

  serialize?(state: State): unknown;
  deserialize?(raw: unknown): State;
}
