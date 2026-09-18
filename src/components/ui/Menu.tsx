"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/helpers/cn";

type Props = {
  label: string;
  align?: "left" | "right";
  children: (close: () => void) => ReactNode;
};

export function Menu({ label, align = "right", children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
      >
        &#8942;
      </button>
      {open ? (
        <div
          className={cn(
            "absolute z-30 mt-1 min-w-44 overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 py-1 shadow-xl shadow-black/40",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

export function MenuItem({
  className,
  danger,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "block w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-transparent",
        danger ? "text-red-400" : "text-zinc-200",
        className,
      )}
      {...props}
    />
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pt-2 pb-1 text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
      {children}
    </p>
  );
}

export function MenuSeparator() {
  return <hr className="my-1 border-zinc-800" />;
}
