// apps/web/src/session/moduleRegistry.ts

import type { SessionModuleAdapter, SessionModuleKey } from '@relay/shared';

type AnyAdapter = SessionModuleAdapter<any, any>;

const registry = new Map<SessionModuleKey, AnyAdapter>();

/**
 * Register a module adapter.
 * Should be called once at app startup.
 */
export function registerModule(adapter: AnyAdapter) {
  if (registry.has(adapter.module)) {
    // prevent silent overwrites (debug safety)
    throw new Error(`Session module already registered: ${adapter.module}`);
  }
  registry.set(adapter.module, adapter);
}

/**
 * Get adapter for a module key.
 */
export function getModuleAdapter(module: SessionModuleKey): AnyAdapter {
  const adapter = registry.get(module);
  if (!adapter) {
    throw new Error(`No session module adapter registered for: ${module}`);
  }
  return adapter;
}

/**
 * Useful for debugging / future module screens.
 */
export function listRegisteredModules(): SessionModuleKey[] {
  return Array.from(registry.keys());
}

/**
 * Test helper / dev convenience.
 */
export function __clearRegistryForTests() {
  registry.clear();
}
