import { Fragment } from "react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Combo, Kbd } from "@/components/ui/Kbd";

const ROWS: Array<{ label: string; combos: string[]; joiner?: string }> = [
  { label: "Select a card", combos: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"] },
  { label: "Move it to the next column", combos: ["shift+ArrowRight"] },
  { label: "Open it", combos: ["Enter"] },
  { label: "New card", combos: ["n"] },
  { label: "Duplicate", combos: ["mod+d"] },
  { label: "Set priority", combos: ["1", "4"], joiner: "to" },
  { label: "Undo", combos: ["mod+z"] },
  { label: "Search the board", combos: ["/"] },
];

export function KeyboardShowcase() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-surface/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-40 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-sky-400/10 blur-[110px]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Keyboard-first"
            title={
              <>
                Your hands never <span className="text-accent-light">leave the keyboard.</span>
              </>
            }
          >
            Select, move, duplicate and delete cards with a keystroke. Right-click brings up the
            rest, and every change can be undone. It behaves like a desktop app, because planning
            should feel fast.
          </SectionHeading>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-line-strong bg-canvas px-4 py-2 text-sm font-semibold text-zinc-300">
            Try it now — press <Kbd>?</Kbd>
          </p>
        </div>

        <div className="rounded-2xl border border-line-strong bg-canvas p-2 shadow-2xl shadow-black/50">
          <ul className="divide-y divide-line">
            {ROWS.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-4 px-4 py-3.5 text-[15px]"
              >
                <span className="font-semibold text-zinc-200">{row.label}</span>
                <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                  {row.combos.map((combo, index) => (
                    <Fragment key={combo}>
                      {row.joiner && index > 0 ? <span>{row.joiner}</span> : null}
                      <Combo combo={combo} />
                    </Fragment>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
