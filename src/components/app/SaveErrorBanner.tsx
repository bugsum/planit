"use client";

import { useEffect, useState } from "react";
import { IconButton } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/Icons";
import { onSaveError } from "@/helpers/storage";

export function SaveErrorBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => onSaveError(() => setVisible(true)), []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-3 text-sm text-red-100 shadow-2xl shadow-black/60 backdrop-blur"
    >
      <div className="flex-1">
        <p className="font-bold">Couldn&apos;t save your changes.</p>
        <p className="mt-0.5 text-red-200/80">
          Browser storage is full or blocked. Your edits stay in this tab until you close it —
          export your boards as JSON to keep them.
        </p>
      </div>
      <IconButton
        aria-label="Dismiss"
        onClick={() => setVisible(false)}
        className="text-red-200 hover:bg-white/10 hover:text-white"
      >
        <CloseIcon />
      </IconButton>
    </div>
  );
}
