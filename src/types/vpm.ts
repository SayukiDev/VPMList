export interface VPMAuthor {
  name?: string;
  email?: string;
  url?: string;
}

export interface VPMInfoLink {
  url: string;
  text?: string;
}

export interface VPMPackageManifest {
  name: string;
  displayName?: string;
  version: string;
  description?: string;
  unity?: string;
  author?: VPMAuthor | string;
  url?: string;
  license?: string;
  licensesUrl?: string;
  changelogUrl?: string;
  documentationUrl?: string;
  dependencies?: Record<string, string>;
  vpmDependencies?: Record<string, string>;
  zipSHA256?: string;
  keywords?: string[];
  type?: string;
  legacyFolders?: Record<string, string>;
  legacyPackages?: string[];
}

export interface VPMPackageVersions {
  versions: Record<string, VPMPackageManifest>;
}

export interface VPMRepository {
  name: string;
  id: string;
  url?: string;
  author?: VPMAuthor | string;
  description?: string;
  bannerUrl?: string;
  infoLink?: VPMInfoLink;
  packages: Record<string, VPMPackageVersions>;
}

/** Normalized package shape used throughout the UI. */
export interface NormalizedPackage {
  id: string;
  displayName: string;
  description: string;
  type: string;
  latest: VPMPackageManifest;
  /** Versions sorted from newest to oldest. */
  allVersions: VPMPackageManifest[];
}

/** Normalized author info (always object form). */
export interface NormalizedAuthor {
  name: string;
  email?: string;
  url?: string;
}

export function normalizeAuthor(author: VPMAuthor | string | undefined): NormalizedAuthor | null {
  if (!author) return null;
  if (typeof author === 'string') {
    return { name: author };
  }
  if (!author.name && !author.email && !author.url) return null;
  return {
    name: author.name ?? author.email ?? 'Unknown',
    email: author.email,
    url: author.url,
  };
}
