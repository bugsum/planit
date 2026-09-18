import { Badge } from "@/components/ui/Badge";
import { Kbd } from "@/components/ui/Kbd";
import { LABEL_CLASSES, PRIORITY_CLASSES } from "@/helpers/board";
import { cn } from "@/helpers/cn";
import type { LabelColor, Priority } from "@/types/kanban";

type MockCard = {
  title: string;
  label?: [string, LabelColor];
  priority?: Exclude<Priority, "none">;
  due?: string;
  selected?: boolean;
};

const PRIORITY_NAMES: Record<Exclude<Priority, "none">, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const COLUMNS: Array<{ title: string; count: string; cards: MockCard[] }> = [
  {
    title: "Backlog",
    count: "6",
    cards: [
      { title: "Write the landing page copy", label: ["Idea", "amber"] },
      { title: "Research auth providers", label: ["Feature", "indigo"], priority: "low" },
      { title: "Dark mode for email templates" },
    ],
  },
  {
    title: "To Do",
    count: "3",
    cards: [
      {
        title: "Design the onboarding flow",
        label: ["Feature", "indigo"],
        priority: "high",
        selected: true,
      },
      { title: "Set up error tracking", priority: "medium", due: "Oct 2" },
    ],
  },
  {
    title: "In Progress",
    count: "2/3",
    cards: [
      { title: "Checkout API", label: ["Feature", "indigo"], priority: "urgent" },
      { title: "Fix the flaky login test", label: ["Bug", "red"] },
    ],
  },
  {
    title: "Done",
    count: "9",
    cards: [{ title: "Pick the stack" }, { title: "Sketch the data model" }],
  },
];

/** A static, non-interactive picture of the real board UI for the homepage. */
export function HeroBoard() {
  return (
    <div className="relative mx-auto max-w-6xl" aria-hidden="true">
      <div className="absolute -inset-px rounded-2xl bg-linear-to-b from-accent/50 via-line-strong to-transparent" />
      <div className="relative overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/70">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="h-3 w-3 rounded-full bg-zinc-700" />
          <span className="ml-3 text-sm font-extrabold tracking-tight">Launch plan</span>
          <span className="ml-auto hidden items-center gap-2 text-[11px] font-medium text-zinc-500 sm:flex">
            <Kbd>/</Kbd> Search
            <Kbd className="ml-2">?</Kbd> Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-canvas/40 p-3 sm:p-4 md:grid-cols-4">
          {COLUMNS.map((column, index) => (
            <div
              key={column.title}
              className={cn(
                "flex-col gap-2 rounded-xl border border-line bg-surface/80 p-2",
                index > 1 ? "hidden md:flex" : "flex",
              )}
            >
              <div className="flex items-center gap-2 px-1.5 pt-1 pb-0.5">
                <span className="text-[11px] font-extrabold tracking-wide uppercase">
                  {column.title}
                </span>
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                    column.count.includes("/")
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-white/[0.05] text-zinc-500",
                  )}
                >
                  {column.count}
                </span>
              </div>
              {column.cards.map((card) => (
                <MockCardView key={card.title} card={card} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-[36%] left-[44%] hidden w-56 animate-fade-up rounded-xl border border-line-strong bg-raised/95 p-1 shadow-2xl shadow-black/70 backdrop-blur [animation-delay:900ms] lg:block">
        <MockMenuItem label="Open card" hint="Enter" active />
        <MockMenuItem label="Duplicate" hint="Ctrl+D" />
        <MockMenuItem label="Move down" hint="Shift+↓" />
        <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
          Move to
        </p>
        <MockMenuItem label="In Progress" />
        <MockMenuItem label="Done" />
        <div className="mx-1 my-1 h-px bg-line" />
        <MockMenuItem label="Delete card" hint="Del" danger />
      </div>

      <div className="absolute -bottom-5 left-6 hidden animate-fade-up items-center gap-2 rounded-full border border-line-strong bg-raised px-3 py-2 text-xs font-semibold text-zinc-300 shadow-xl shadow-black/60 [animation-delay:1100ms] sm:flex">
        <Kbd>Shift</Kbd>
        <Kbd>→</Kbd>
        <span>moves the card to the next column</span>
      </div>
    </div>
  );
}

function MockCardView({ card }: { card: MockCard }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-raised px-2.5 py-2",
        card.selected ? "border-accent ring-3 ring-accent/25" : "border-line",
      )}
    >
      {card.priority === "urgent" || card.priority === "high" ? (
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-[3px]",
            card.priority === "urgent" ? "bg-red-400" : "bg-orange-400",
          )}
        />
      ) : null}
      <p className="text-[12px] leading-snug font-semibold text-zinc-100">{card.title}</p>
      {card.label || card.priority || card.due ? (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {card.priority ? (
            <Badge className={PRIORITY_CLASSES[card.priority]}>
              {PRIORITY_NAMES[card.priority]}
            </Badge>
          ) : null}
          {card.label ? (
            <Badge className={LABEL_CLASSES[card.label[1]]}>{card.label[0]}</Badge>
          ) : null}
          {card.due ? (
            <Badge className="border-line-strong bg-white/[0.03] text-zinc-400">{card.due}</Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MockMenuItem({
  label,
  hint,
  active,
  danger,
}: {
  label: string;
  hint?: string;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 rounded-lg px-2.5 py-1.5 text-[12px] font-medium",
        danger ? "text-red-400" : "text-zinc-200",
        active && "bg-white/[0.07]",
      )}
    >
      {label}
      {hint ? <span className="font-mono text-[10px] text-zinc-500">{hint}</span> : null}
    </div>
  );
}
