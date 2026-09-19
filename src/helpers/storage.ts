import type { StateStorage } from "zustand/middleware";

type Listener = () => void;

const saveErrorListeners = new Set<Listener>();

/**
 * Single persistence boundary for Plan It. Everything above this file talks to
 * the zustand stores, so moving to an API/database later means rewriting only
 * this adapter and the change subscription below.
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
      // Quota exceeded or storage blocked: keep the in-memory state usable and tell the UI.
      for (const listener of saveErrorListeners) listener();
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

export function onSaveError(listener: Listener) {
  saveErrorListeners.add(listener);
  return () => {
    saveErrorListeners.delete(listener);
  };
}

/** Fires when another tab (or window) writes `key`. The `storage` event never fires in the writing tab. */
export function subscribeToExternalChanges(key: string, onChange: Listener) {
  const handler = (event: StorageEvent) => {
    if (event.key === key || event.key === null) onChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

let persistRequested = false;

/**
 * Asks the browser not to evict our data under storage pressure. Call it from
 * a user action: Firefox shows a prompt, which should never appear on page load.
 */
export function requestPersistentStorage() {
  if (persistRequested || typeof navigator === "undefined" || !navigator.storage?.persist) {
    return;
  }
  persistRequested = true;
  void navigator.storage
    .persisted()
    .then((already) => (already ? true : navigator.storage.persist()))
    .catch(() => false);
}
