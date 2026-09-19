import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/app/Logo";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <LogoMark size={48} />
      <p className="mt-8 font-mono text-sm font-bold text-accent-light">404</p>
      <h1 className="mt-2 text-4xl font-black tracking-tighter sm:text-5xl">
        Nothing planned here.
      </h1>
      <p className="mt-4 text-[15px] text-zinc-400">
        This page doesn&apos;t exist. If you followed a link to a board, it lives in the browser it
        was created in.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link href="/kanban" className={buttonClasses({ variant: "primary" })}>
          Your boards
        </Link>
        <Link href="/" className={buttonClasses()}>
          Home
        </Link>
      </div>
    </div>
  );
}
