/**
 * Lightweight semver utilities for VPM package versions.
 *
 * VPM versions follow semver, e.g. "1.0.0", "1.0.0-beta.1", "2.10.3+build".
 * We do not need a full implementation — just enough to compare and sort.
 */

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[];
}

const NUMERIC = /^\d+$/;

export function parse(version: string): ParsedVersion {
  // Strip build metadata; we ignore it for comparison.
  const [core, prerelease = ''] = version.split('+')[0].split('-', 2);
  const parts = core.split('.');
  const major = Number(parts[0] ?? 0) || 0;
  const minor = Number(parts[1] ?? 0) || 0;
  const patch = Number(parts[2] ?? 0) || 0;
  return {
    major,
    minor,
    patch,
    prerelease: prerelease ? prerelease.split('.') : [],
  };
}

/**
 * Compare two version strings. Returns negative when a < b, positive when a > b, zero when equal.
 */
export function compare(a: string, b: string): number {
  const pa = parse(a);
  const pb = parse(b);

  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  if (pa.patch !== pb.patch) return pa.patch - pb.patch;

  // A version without a prerelease tag is considered greater than one with.
  if (pa.prerelease.length === 0 && pb.prerelease.length > 0) return 1;
  if (pa.prerelease.length > 0 && pb.prerelease.length === 0) return -1;

  const length = Math.max(pa.prerelease.length, pb.prerelease.length);
  for (let i = 0; i < length; i++) {
    const ai = pa.prerelease[i];
    const bi = pb.prerelease[i];
    if (ai === undefined) return -1;
    if (bi === undefined) return 1;

    const aNumeric = NUMERIC.test(ai);
    const bNumeric = NUMERIC.test(bi);

    if (aNumeric && bNumeric) {
      const diff = Number(ai) - Number(bi);
      if (diff !== 0) return diff;
    } else if (aNumeric !== bNumeric) {
      // Numeric identifiers always have lower precedence than non-numeric.
      return aNumeric ? -1 : 1;
    } else if (ai !== bi) {
      return ai < bi ? -1 : 1;
    }
  }

  return 0;
}

/** Sort versions descending (newest first). */
export function sortDesc(versions: string[]): string[] {
  return [...versions].sort((a, b) => compare(b, a));
}

/** Pick the latest version key from a map of version → manifest. */
export function pickLatestKey(versions: Record<string, unknown>): string | undefined {
  const keys = Object.keys(versions);
  if (keys.length === 0) return undefined;
  return sortDesc(keys)[0];
}
