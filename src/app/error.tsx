"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonClasses } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-mono text-sm font-bold text-red-400">Error</p>
      <h1 className="mt-2 text-4xl font-black tracking-tighter sm:text-5xl">Something broke.</h1>
      <p className="mt-4 text-[15px] text-zinc-400">
        A display error doesn&apos;t erase anything — your boards stay stored in this browser. Try
        again, or head back to your boards.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-zinc-600">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={retry}>
          Try again
        </Button>
        <Link href="/kanban" className={buttonClasses()}>
          Your boards
        </Link>
      </div>
    </div>
  );
}
