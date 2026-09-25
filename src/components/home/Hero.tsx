import Link from "next/link";
import { HeroBoard } from "@/components/home/HeroBoard";
import { buttonClasses } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, GithubIcon } from "@/components/ui/Icons";
import { SITE } from "@/helpers/site";

const PROMISES = [
  "No account needed",
  "Works offline",
  "Your data stays local",
  "Free and open source",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)] opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 h-[560px] w-[min(1000px,140vw)] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <Link
            href="/kanban"
            className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-line-strong bg-surface/80 py-1 pr-3 pl-1 text-[13px] font-semibold text-zinc-300 backdrop-blur transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
              New
            </span>
            Mindmaps are here, and they talk to your boards
            <ArrowRightIcon width={13} height={13} />
          </Link>

          <h1 className="mt-8 animate-fade-up text-5xl leading-[0.95] font-black tracking-tighter [animation-delay:80ms] sm:text-7xl lg:text-8xl">
            Think it through.
            <span className="block bg-linear-to-r from-accent-light via-sky-300 to-white bg-clip-text pb-2 text-transparent">
              Then build it.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-pretty text-zinc-400 [animation-delay:160ms] sm:text-xl">
            <strong className="font-bold text-zinc-100">Plan It</strong> is the workspace for
            everything that happens before the first commit — the backlog, the ideas, the order you
            will ship in. Settle the shape of the work first, and{" "}
            <strong className="font-bold text-zinc-100">stop rewriting it later.</strong>
          </p>

          <div className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
            <Link href="/kanban" className={buttonClasses({ variant: "primary", size: "lg" })}>
              Start planning
              <ArrowRightIcon />
            </Link>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className={buttonClasses({ size: "lg" })}
            >
              <GithubIcon />
              View source
            </a>
          </div>

          <ul className="mt-8 flex animate-fade-up flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-semibold text-zinc-500 [animation-delay:320ms]">
            {PROMISES.map((promise) => (
              <li key={promise} className="inline-flex items-center gap-1.5">
                <CheckIcon width={14} height={14} className="text-accent-light" />
                {promise}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 animate-fade-up [animation-delay:420ms] sm:mt-20">
          <HeroBoard />
        </div>
      </div>
    </section>
  );
}
