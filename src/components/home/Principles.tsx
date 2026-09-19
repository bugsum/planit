const PRINCIPLES = [
  {
    title: "Rewrite less.",
    body: "Decide scope and order before code exists, so the code you write is the code you keep.",
  },
  {
    title: "See the whole shape.",
    body: "Backlog, in progress and done on one surface. Nothing important lives only in your head.",
  },
  {
    title: "Own every byte.",
    body: "Boards live in your browser. Export to JSON whenever you like. No account, no lock-in.",
  },
];

export function Principles() {
  return (
    <section aria-labelledby="principles-title" className="border-y border-line bg-surface/40">
      <h2 id="principles-title" className="sr-only">
        Why plan first
      </h2>
      <div className="mx-auto grid max-w-7xl gap-px bg-line sm:grid-cols-3">
        {PRINCIPLES.map((principle, index) => (
          <div key={principle.title} className="bg-canvas px-6 py-12 sm:px-8 sm:py-14">
            <p className="font-mono text-xs font-bold text-accent-light">0{index + 1}</p>
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight">{principle.title}</h3>
            <p className="mt-3 leading-relaxed text-zinc-400">{principle.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
