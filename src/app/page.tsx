import { PlannerCard } from "@/components/app/PlannerCard";

const PLANNERS = [
  {
    name: "Kanban",
    description:
      "Flexible boards with your own columns. Backlog, todos, in progress, done — however you work.",
    href: "/kanban",
  },
  {
    name: "Mindmap",
    description: "Branch out ideas before they become tasks.",
  },
  {
    name: "Roadmap",
    description: "Lay milestones on a timeline and see what lands when.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Plan it before you build it.
      </h1>
      <p className="mt-3 max-w-xl text-zinc-400">
        A home for the thinking that happens before the first commit. Pick a planner and
        start mapping out your next project.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANNERS.map((planner) => (
          <PlannerCard key={planner.name} {...planner} />
        ))}
      </div>
    </div>
  );
}
