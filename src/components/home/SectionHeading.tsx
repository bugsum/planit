import type { ReactNode } from "react";
import { cn } from "@/helpers/cn";

type Props = {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
};

export function SectionHeading({ eyebrow, title, children, align = "left" }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {children ? (
        <p className="mt-5 text-lg leading-relaxed text-pretty text-zinc-400">{children}</p>
      ) : null}
    </div>
  );
}
