import type { ComponentType, SVGProps } from "react";
import { SectionHeading } from "@/components/home/SectionHeading";
import {
  ColumnsIcon,
  GripIcon,
  KeyboardIcon,
  LockIcon,
  MouseIcon,
  SearchIcon,
  TagIcon,
  UndoIcon,
} from "@/components/ui/Icons";

type Feature = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: ColumnsIcon,
    title: "Columns you define",
    body: "Backlog, Ideas, Blocked, Shipped — name them, reorder them, cap them with WIP limits.",
  },
  {
    icon: GripIcon,
    title: "Drag anything",
    body: "Cards and whole columns, with precise drop indicators and auto-scroll on wide boards.",
  },
  {
    icon: TagIcon,
    title: "Labels and priority",
    body: "Color-coded labels, five priority levels, and due dates that flag themselves when late.",
  },
  {
    icon: SearchIcon,
    title: "Find it instantly",
    body: "Search titles and notes, filter by label or priority, and keep working inside the result.",
  },
  {
    icon: KeyboardIcon,
    title: "Keyboard-first",
    body: "Select, move, duplicate and delete cards without reaching for the mouse.",
  },
  {
    icon: MouseIcon,
    title: "Right-click everything",
    body: "Context menus on cards, columns and the board itself. It feels like an app, not a page.",
  },
  {
    icon: UndoIcon,
    title: "Undo anything",
    body: "Every edit is one keystroke away from reversed. Experiment with the plan freely.",
  },
  {
    icon: LockIcon,
    title: "Local-first",
    body: "Nothing leaves your browser. Export a board as JSON to back it up or move it.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        eyebrow="Kanban"
        title={
          <>
            A board that bends <span className="text-accent">to your process.</span>
          </>
        }
      >
        Most boards hand you three columns and a rulebook. Plan It starts with sensible defaults,
        then gets out of the way.
      </SectionHeading>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
              <Icon width={18} height={18} />
            </span>
            <h3 className="mt-5 text-lg font-extrabold tracking-tight">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-400">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
