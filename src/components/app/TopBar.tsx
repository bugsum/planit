import Link from "next/link";

export function TopBar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-5 w-5 rounded bg-indigo-500" />
          Plan It
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/kanban"
            className="rounded-md px-3 py-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            Kanban
          </Link>
        </nav>
      </div>
    </header>
  );
}
