"use client";

import { useEffect, useSyncExternalStore } from "react";

type PersistApi = {
  persist: {
    rehydrate: () => unknown;
    hasHydrated: () => boolean;
    onFinishHydration: (listener: () => void) => () => void;
  };
};

/**
 * Stores are created with `skipHydration`, so nothing reads localStorage until
 * a component mounts. This kicks off that read and re-renders once it lands,
 * keeping the server markup and the first client render identical.
 */
export function useHydrated(store: PersistApi) {
  useEffect(() => {
    if (!store.persist.hasHydrated()) void store.persist.rehydrate();
  }, [store]);

  return useSyncExternalStore(
    (onChange) => store.persist.onFinishHydration(onChange),
    () => store.persist.hasHydrated(),
    () => false,
  );
}
