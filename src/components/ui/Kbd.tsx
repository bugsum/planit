"use client";

import type { ReactNode } from "react";
import { cn } from "@/helpers/cn";
import { comboParts } from "@/helpers/shortcuts";
import { useIsMac } from "@/helpers/use-hotkeys";

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line-strong bg-raised px-1.5 font-mono text-[11px] font-semibold text-zinc-300 shadow-[inset_0_-1px_0_var(--color-line-strong)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function Combo({ combo, className }: { combo: string; className?: string }) {
  const mac = useIsMac();
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {comboParts(combo, mac).map((part, index) => (
        <Kbd key={index}>{part}</Kbd>
      ))}
    </span>
  );
}
