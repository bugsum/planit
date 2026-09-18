import Link from "next/link";

type Props = {
  name: string;
  description: string;
  href?: string;
};

export function PlannerCard({ name, description, href }: Props) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium text-zinc-100">{name}</h2>
        {href ? null : (
          <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[11px] text-zinc-500">
            Soon
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </>
  );

  if (!href) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5 opacity-60">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      {body}
    </Link>
  );
}
