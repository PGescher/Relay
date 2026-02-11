// packages/shared/src/session/ActiveSession.ts

import {
  SessionModuleKey,
  SessionLifecycle,
  OverlayMode,
  DockSide,
  RestorePolicy,
} from './SessionTypes'

export const ACTIVE_SESSION_VERSION = 1 as const;

/**
 * ActiveSession
 *
 * Represents one long-lived user activity (v0.0.1: exactly one at a time).
 * Module state is opaque and owned by the module.
 */
export interface ActiveSession {
  /** Unique session id */
  id: string

  /** Which module owns this session */
  module: SessionModuleKey

  /** Lifecycle state */
  lifecycle: SessionLifecycle

  /** UI-related session state (owned by AppShell) */
  ui: {
    overlay: OverlayMode
    dockSide: DockSide
  }

  /**
   * Opaque module-owned state.
   * Must be JSON-serializable.
   */
  state: unknown

  /** Metadata used by the kernel */
  meta: {
    /** Timestamp when session started */
    startedAt: number

    /** Last interaction timestamp */
    lastActiveAt: number

    /**
     * Version of the session contract.
     * Allows future migrations.
     */
    version: number

    /**
     * Storage key for persistence.
     * Example: `session:GYM:<id>`
     */
    persistenceKey: string

    /** Restore rules on app reload */
    restorePolicy: RestorePolicy
  }
}
