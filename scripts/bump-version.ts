/**
 * Usage: bun run version:bump <major|minor|patch>
 *
 * Bumps package.json and turns the CHANGELOG's "Unreleased" notes into a dated
 * section for the new version, with a compare link. Write the notes under
 * "## [Unreleased]" first; the script moves them.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { bump, formatVersion, parseVersion, type Level } from "./version";

const REPO = "https://github.com/bugsum/planit";
const level = process.argv[2] as Level | undefined;

if (level !== "major" && level !== "minor" && level !== "patch") {
  console.error("Usage: bun run version:bump <major|minor|patch>");
  process.exit(1);
}

const pkgPath = "package.json";
const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
const previous = pkg.version;
const next = formatVersion(bump(parseVersion(previous), level));
pkg.version = next;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

const changelogPath = "CHANGELOG.md";
let changelog = readFileSync(changelogPath, "utf8");
const today = new Date().toISOString().slice(0, 10);

if (!changelog.includes("## [Unreleased]")) {
  console.error('CHANGELOG.md has no "## [Unreleased]" heading.');
  process.exit(1);
}

changelog = changelog
  .replace("## [Unreleased]", `## [Unreleased]\n\n## [${next}] - ${today}`)
  .replace(
    /^\[Unreleased\]: .*$/m,
    `[Unreleased]: ${REPO}/compare/v${next}...HEAD\n[${next}]: ${REPO}/compare/v${previous}...v${next}`,
  );
writeFileSync(changelogPath, changelog);

console.log(`Bumped ${previous} → ${next}. Check the notes under "## [${next}]" in CHANGELOG.md.`);
