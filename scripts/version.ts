export type Version = [major: number, minor: number, patch: number];
export type Level = "major" | "minor" | "patch";

export function parseVersion(value: string): Version {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value.trim());
  if (!match) throw new Error(`Not a plain x.y.z version: "${value}"`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function formatVersion([major, minor, patch]: Version) {
  return `${major}.${minor}.${patch}`;
}

export function bump([major, minor, patch]: Version, level: Level): Version {
  if (level === "major") return [major + 1, 0, 0];
  if (level === "minor") return [major, minor + 1, 0];
  return [major, minor, patch + 1];
}

/** Which part changed between two versions, or null when `next` isn't higher. */
export function bumpLevel(previous: Version, next: Version): Level | null {
  if (next[0] !== previous[0]) return next[0] > previous[0] ? "major" : null;
  if (next[1] !== previous[1]) return next[1] > previous[1] ? "minor" : null;
  if (next[2] !== previous[2]) return next[2] > previous[2] ? "patch" : null;
  return null;
}

const RANK: Record<Level, number> = { patch: 0, minor: 1, major: 2 };

export function atLeast(actual: Level, required: Level) {
  return RANK[actual] >= RANK[required];
}
