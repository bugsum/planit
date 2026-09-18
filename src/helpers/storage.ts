import type { StateStorage } from "zustand/middleware";

/**
 * Single persistence boundary for Plan It. Everything above this file talks to
 * the zustand stores, so moving to an API/database later means rewriting only
 * the three methods below.
 */
export const planitStorage: StateStorage = {
  getItem: (name) => {
    try {
      return globalThis.localStorage?.getItem(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage?.setItem(name, value);
    } catch {
      // Private mode or quota exceeded: keep the in-memory state usable.
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage?.removeItem(name);
    } catch {
      // Ignore.
    }
  },
};
