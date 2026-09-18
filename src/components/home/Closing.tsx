import Link from "next/link";
import { SectionHeading } from "@/components/home/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowRightIcon, GithubIcon, LogoMark } from "@/components/ui/Icons";
import { SITE } from "@/helpers/site";

const STEPS = [
  {
    title: "Create a board",
    body: "Start from Backlog, To Do, In Progress and Done, or tear them up and name your own.",
  },
  {
    title: "Shape the work",
    body: "Break ideas into cards, label them, set priorities and dates until the order is obvious.",
  },
  {
    title: "Drag it to done",
    body: "Move cards as you build. Export the board when the plan is settled, or keep it going.",
  },
];

export function Closing() {
  return (
    <>
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <SectionHeading
            eyebrow="How it works"
            align="center"
            title={
              <>
                From idea to plan <span className="text-accent">in three moves.</span>
              </>
            }
          />
          <ol className="mt-14 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-line bg-canvas p-7">
                <span className="text-5xl font-black tracking-tighter text-zinc-800">
                  0{index + 1}
                </span>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-zinc-400">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-56 left-1/2 h-[480px] w-[min(900px,140vw)] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]"
        />
        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 sm:py-36">
          <h2 className="text-4xl font-black tracking-tighter text-balance sm:text-6xl">
            Your next project deserves <span className="text-accent">a plan.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
            Free, open source, and yours. Open a board and start shaping the work in seconds.
          </p>
          <Link
            href="/kanban"
            className={buttonClasses({ variant: "primary", size: "lg", className: "mt-10" })}
          >
            Start planning
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-500 sm:px-6">
          <span className="flex items-center gap-2.5 font-extrabold tracking-tight text-zinc-300">
            <LogoMark width={18} height={18} />
            {SITE.name}
          </span>
          <span>MIT licensed · Built for people who plan first</span>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-semibold transition-colors hover:text-zinc-200"
          >
            <GithubIcon />
            GitHub
          </a>
        </div>
      </footer>
    </>
  );
}
