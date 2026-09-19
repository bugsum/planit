import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/helpers/cn";

const BASE =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-[border-color,box-shadow] hover:border-line-strong focus:border-accent/70 focus:ring-3 focus:ring-accent/20 focus:outline-none disabled:opacity-50";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(BASE, className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(BASE, "resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(BASE, "cursor-pointer", className)} {...props} />;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">{children}</span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </label>
  );
}
