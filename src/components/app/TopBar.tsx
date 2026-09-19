"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/app/Logo";
import { iconButtonClasses } from "@/components/ui/Button";
import { GithubIcon, KeyboardIcon } from "@/components/ui/Icons";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/helpers/cn";
import { SITE } from "@/helpers/site";
import { openShortcuts } from "@/store/ui";

const NAV = [{ href: "/kanban", label: "Kanban" }];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <Link href="/" aria-label={`${SITE.name} home`}>
            <Logo className="text-[15px]" />
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                    active ? "bg-white/[0.07] text-zinc-100" : "text-zinc-400 hover:text-zinc-100",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="hidden cursor-default items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-zinc-600 sm:inline-flex">
              Mindmap
              <span className="rounded bg-white/5 px-1 py-px text-[9px] tracking-wider uppercase">
                Soon
              </span>
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openShortcuts}
            aria-label="Keyboard shortcuts"
            className="inline-flex h-8 items-center gap-2 rounded-lg px-2.5 text-[13px] font-semibold text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
          >
            <KeyboardIcon />
            <span className="hidden md:inline">Shortcuts</span>
            <Kbd className="hidden md:inline-flex">?</Kbd>
          </button>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            aria-label="Source on GitHub"
            className={iconButtonClasses}
          >
            <GithubIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
