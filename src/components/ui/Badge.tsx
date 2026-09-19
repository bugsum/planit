import type { ReactNode } from "react";
import { cn } from "@/helpers/cn";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] leading-none font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}
