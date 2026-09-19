/**
 * CI gate for pull requests. Reads PR data from the environment (never from
 * shell interpolation) and fails with a list of everything that needs fixing:
 *
 * - the version in package.json is higher than the base branch's, by at least
 *   what the PR type requires (feat → minor, breaking → major, or minor < 1.0)
 * - CHANGELOG.md has a section for the new version with at least one entry
 * - the "What & why" section of the PR description is actually filled in
 *
 * Dependabot PRs skip only the description check: every change that lands on
 * master still needs a version bump, so bump on the Dependabot branch first.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { atLeast, bumpLevel, parseVersion, type Level } from "./version";

const { BASE_SHA = "", PR_TITLE = "", PR_BODY = "", PR_AUTHOR = "" } = process.env;
const problems: string[] = [];
const bot = PR_AUTHOR === "dependabot[bot]";

const headVersion = (JSON.parse(readFileSync("package.json", "utf8")) as { version: string })
  .version;
const baseVersion = (
  JSON.parse(execFileSync("git", ["show", `${BASE_SHA}:package.json`], { encoding: "utf8" })) as {
    version: string;
  }
).version;

const header = /^(\w+)(\([^)]*\))?(!)?:/.exec(PR_TITLE);
const type = header?.[1] ?? "";
const breaking = Boolean(header?.[3]) || /BREAKING CHANGE/.test(PR_BODY);
const preRelease = parseVersion(baseVersion)[0] === 0;
const required: Level = breaking
  ? preRelease
    ? "minor"
    : "major"
  : type === "feat"
    ? "minor"
    : "patch";

const level = bumpLevel(parseVersion(baseVersion), parseVersion(headVersion));
if (!level) {
  problems.push(
    `package.json version must be higher than ${baseVersion} (it is ${headVersion}). Run \`bun run version:bump ${required}\`.`,
  );
} else if (!atLeast(level, required)) {
  problems.push(
    `A "${type}${breaking ? "!" : ""}" change needs at least a ${required} bump; ${baseVersion} → ${headVersion} is a ${level} bump.`,
  );
}

const changelog = readFileSync("CHANGELOG.md", "utf8");
const section = new RegExp(
  `^## \\[${headVersion.replace(/\./g, "\\.")}\\][^\\n]*\\n([\\s\\S]*?)(?=^## \\[|^\\[)`,
  "m",
).exec(changelog);
if (!section) {
  problems.push(`CHANGELOG.md needs a "## [${headVersion}] - YYYY-MM-DD" section.`);
} else if (!/^\s*[-*] \S/m.test(section[1])) {
  problems.push(`The CHANGELOG.md section for ${headVersion} has no entries.`);
}

const whatAndWhy = /##\s*What & why\s*\n([\s\S]*?)(?=\n##\s|$)/.exec(PR_BODY)?.[1] ?? "";
const described = whatAndWhy.replace(/<!--[\s\S]*?-->/g, "").trim();
if (!bot && described.length < 30) {
  problems.push('Fill in the "What & why" section of the PR description (a sentence or two).');
}

if (problems.length > 0) {
  console.error("This pull request is not ready yet:\n");
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}

console.log(`OK: ${baseVersion} → ${headVersion} (${level}), changelog and description present.`);
