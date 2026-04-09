import type {
  NormalizedPackage,
  VPMPackageManifest,
  VPMPackageVersions,
  VPMRepository,
} from '@/types/vpm';
import { compare, sortDesc } from '@/utils/semver';

export interface RepoFetchResult {
  repo: VPMRepository;
  normalized: NormalizedPackage[];
}

export class VpmRepoError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'VpmRepoError';
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function assertRepository(data: unknown): asserts data is VPMRepository {
  if (!isObject(data)) {
    throw new VpmRepoError('Repository manifest must be a JSON object.');
  }
  if (typeof data.name !== 'string') {
    throw new VpmRepoError('Repository manifest is missing a "name" field.');
  }
  if (typeof data.id !== 'string') {
    throw new VpmRepoError('Repository manifest is missing an "id" field.');
  }
  if (!isObject(data.packages)) {
    throw new VpmRepoError('Repository manifest is missing a "packages" object.');
  }
}

export function normalizePackages(repo: VPMRepository): NormalizedPackage[] {
  const result: NormalizedPackage[] = [];

  for (const [pkgId, entry] of Object.entries(repo.packages)) {
    const versions = (entry as VPMPackageVersions | undefined)?.versions;
    if (!versions || typeof versions !== 'object') continue;

    const versionKeys = Object.keys(versions);
    if (versionKeys.length === 0) continue;

    const sortedKeys = sortDesc(versionKeys);
    const allVersions: VPMPackageManifest[] = sortedKeys
      .map((key) => versions[key])
      .filter((v): v is VPMPackageManifest => Boolean(v));

    if (allVersions.length === 0) continue;

    const latest = allVersions[0];
    result.push({
      id: pkgId,
      displayName: latest.displayName ?? latest.name ?? pkgId,
      description: latest.description ?? '',
      type: latest.type ?? '',
      latest,
      allVersions,
    });
  }

  return result.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/** Sort version manifests in-place from newest to oldest. */
export function sortVersions(versions: VPMPackageManifest[]): VPMPackageManifest[] {
  return [...versions].sort((a, b) => compare(b.version, a.version));
}

export async function fetchRepo(url: string, fetcher: typeof fetch = fetch): Promise<RepoFetchResult> {
  if (!url) {
    throw new VpmRepoError('A repository URL is required.');
  }

  let response: Response;
  try {
    response = await fetcher(url, { headers: { Accept: 'application/json' } });
  } catch (err) {
    throw new VpmRepoError(
      'Failed to reach the repository URL. The server may be unreachable or block CORS.',
      err,
    );
  }

  if (!response.ok) {
    throw new VpmRepoError(`Repository request failed: ${response.status} ${response.statusText}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (err) {
    throw new VpmRepoError('Repository response was not valid JSON.', err);
  }

  assertRepository(data);
  return { repo: data, normalized: normalizePackages(data) };
}
