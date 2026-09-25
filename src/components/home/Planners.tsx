import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { ArrowRightIcon, ColumnsIcon, MindmapIcon, RoadmapIcon } from "@/components/ui/Icons";
import { cn } from "@/helpers/cn";

type Planner = {
  name: string;
  status: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  body: string;
  points: string[];
  href?: string;
};

const PLANNERS: Planner[] = [
  {
    name: "Kanban",
    status: "Live",
    icon: ColumnsIcon,
    body: "Turn a pile of ideas into an ordered backlog and walk it to done.",
    points: [
      "Custom columns and WIP limits",
      "Keyboard control and context menus",
      "Labels, priority, due dates",
    ],
    href: "/kanban",
  },
  {
    name: "Mindmap",
    status: "Live",
    icon: MindmapIcon,
    body: "Branch out an idea before it becomes a task, then send a branch to a board.",
    points: [
      "Tab and Enter to grow the map",
      "Collapse branches, colour them, add notes",
      "Send a branch to Kanban as cards",
    ],
    href: "/mindmap",
  },
  {
    name: "Roadmap",
    status: "Planned",
    icon: RoadmapIcon,
    body: "Lay milestones on a timeline and see what lands when.",
    points: ["Milestones and phases", "Linked to your boards", "Shareable snapshots"],
  },
];

export function Planners() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow="Planners"
        title={
          <>
            One workspace. <span className="text-accent-light">Every way you plan.</span>
          </>
        }
      >
        Kanban is where it starts. Every planner that follows shares the same keyboard model,
        context menus and local-first storage.
      </SectionHeading>

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {PLANNERS.map((planner) => (
          <PlannerCard key={planner.name} planner={planner} />
        ))}
      </div>
    </section>
  );
}

function PlannerCard({ planner }: { planner: Planner }) {
  const { icon: Icon, href } = planner;
  const live = href !== undefined;

  const body = (
    <>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-xl",
            live ? "bg-accent text-white" : "bg-white/[0.05] text-zinc-400",
          )}
        >
          <Icon width={20} height={20} />
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
            live ? "bg-emerald-500/15 text-emerald-300" : "bg-white/[0.05] text-zinc-500",
          )}
        >
          {planner.status}
        </span>
      </div>
      <h3 className="mt-6 text-2xl font-extrabold tracking-tight">{planner.name}</h3>
      <p className="mt-2 leading-relaxed text-zinc-400">{planner.body}</p>
      <ul className="mt-5 space-y-2 text-sm font-medium text-zinc-300">
        {planner.points.map((point) => (
          <li key={point} className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-accent" : "bg-zinc-600")} />
            {point}
          </li>
        ))}
      </ul>
      {live ? (
        <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent-light transition-colors group-hover:text-white">
          Open {planner.name}
          <ArrowRightIcon width={14} height={14} />
        </span>
      ) : null}
    </>
  );

  if (!live) {
    return (
      <div className="rounded-2xl border border-line bg-surface/50 p-7 opacity-75">{body}</div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-accent/40 bg-linear-to-b from-accent/[0.08] to-surface p-7 transition-colors hover:border-accent/70"
    >
      {body}
    </Link>
  );
}
