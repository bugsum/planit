import type { SVGProps } from "react";
import { cn } from "@/helpers/cn";
import { SITE } from "@/helpers/site";

/** The Plan It mark. Matches `src/app/icon.svg`, with rounded corners for in-app use. */
export function LogoMark({ size = 22, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg viewBox="0 0 1254 1254" width={size} height={size} aria-hidden="true" {...props}>
      <rect width="1254" height="1254" rx="280" fill="var(--color-accent)" />
      <g fill="#fff">
        <rect x="276" y="225" width="178" height="850" rx="36" />
        <rect x="491" y="748" width="178" height="327" rx="30" />
        <path d="M513 225H775C925 225 1025 335 1025 490C1025 625 925 720 795 720H505Q487 720 487 702V596Q487 563 520 563H745C795 563 827 527 827 482C827 432 792 400 745 400H513Q486 400 486 372V255Q486 225 513 225Z" />
      </g>
    </svg>
  );
}

export function Logo({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 font-extrabold tracking-tight", className)}
    >
      <LogoMark size={size} />
      {SITE.name}
    </span>
  );
}
