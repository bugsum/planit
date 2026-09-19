import type { LabelColor } from "@/types/kanban";

export type BoardTemplate = {
  id: string;
  name: string;
  description: string;
  columns: Array<{ title: string; wipLimit?: number }>;
  labels: Array<{ name: string; color: LabelColor }>;
};

export const TEMPLATES: BoardTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "The four columns most plans start with.",
    columns: [
      { title: "Backlog" },
      { title: "To Do" },
      { title: "In Progress" },
      { title: "Done" },
    ],
    labels: [
      { name: "Feature", color: "indigo" },
      { name: "Bug", color: "red" },
      { name: "Idea", color: "amber" },
    ],
  },
  {
    id: "sprint",
    name: "Sprint",
    description: "Plan a sprint and keep work in progress small.",
    columns: [
      { title: "Backlog" },
      { title: "Sprint" },
      { title: "In Progress", wipLimit: 3 },
      { title: "Review", wipLimit: 2 },
      { title: "Done" },
    ],
    labels: [
      { name: "Feature", color: "indigo" },
      { name: "Bug", color: "red" },
      { name: "Chore", color: "slate" },
      { name: "Spike", color: "sky" },
    ],
  },
  {
    id: "bug-triage",
    name: "Bug triage",
    description: "Take reports from new to verified.",
    columns: [
      { title: "New" },
      { title: "Triaged" },
      { title: "Fixing", wipLimit: 3 },
      { title: "Verifying" },
      { title: "Closed" },
    ],
    labels: [
      { name: "Critical", color: "red" },
      { name: "Major", color: "amber" },
      { name: "Minor", color: "slate" },
      { name: "Regression", color: "pink" },
    ],
  },
  {
    id: "launch",
    name: "Product launch",
    description: "Everything between the idea and launch day.",
    columns: [
      { title: "Ideas" },
      { title: "Planned" },
      { title: "Building" },
      { title: "Launch prep" },
      { title: "Shipped" },
    ],
    labels: [
      { name: "Design", color: "pink" },
      { name: "Engineering", color: "indigo" },
      { name: "Marketing", color: "amber" },
      { name: "Docs", color: "green" },
    ],
  },
  {
    id: "personal",
    name: "Personal project",
    description: "Light structure for side projects.",
    columns: [
      { title: "Ideas" },
      { title: "Next up" },
      { title: "Doing", wipLimit: 2 },
      { title: "Done" },
    ],
    labels: [
      { name: "Must have", color: "red" },
      { name: "Nice to have", color: "sky" },
    ],
  },
];

export function findTemplate(id: string | undefined) {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0];
}
