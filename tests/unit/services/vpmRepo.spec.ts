import { describe, expect, it, vi } from 'vitest';
import { fetchRepo, normalizePackages, VpmRepoError } from '@/services/vpmRepo';
import type { VPMRepository } from '@/types/vpm';

const sampleRepo: VPMRepository = {
  name: 'Example Listing',
  id: 'com.example.listing',
  url: 'https://example.com/index.json',
  description: 'Sample',
  packages: {
    'com.example.foo': {
      versions: {
        '1.0.0': {
          name: 'com.example.foo',
          displayName: 'Foo',
          version: '1.0.0',
          description: 'old foo',
          type: 'Tool',
        },
        '1.2.0': {
          name: 'com.example.foo',
          displayName: 'Foo',
          version: '1.2.0',
          description: 'new foo',
          type: 'Tool',
          url: 'https://example.com/foo-1.2.0.zip',
        },
      },
    },
    'com.example.bar': {
      versions: {
        '0.1.0-beta.1': {
          name: 'com.example.bar',
          displayName: 'Bar',
          version: '0.1.0-beta.1',
        },
      },
    },
  },
};

describe('normalizePackages', () => {
  it('produces sorted packages with the latest version selected', () => {
    const result = normalizePackages(sampleRepo);
    expect(result).toHaveLength(2);
    // Sorted by displayName ascending
    expect(result[0].displayName).toBe('Bar');
    expect(result[1].displayName).toBe('Foo');

    const foo = result[1];
    expect(foo.latest.version).toBe('1.2.0');
    expect(foo.latest.description).toBe('new foo');
    expect(foo.allVersions.map((v) => v.version)).toEqual(['1.2.0', '1.0.0']);
  });

  it('skips entries with no versions', () => {
    const result = normalizePackages({
      ...sampleRepo,
      packages: {
        'com.empty': { versions: {} },
      },
    });
    expect(result).toEqual([]);
  });
});

function makeJsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: async () => body,
  } as unknown as Response;
}

describe('fetchRepo', () => {
  it('fetches and normalizes a repository', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeJsonResponse(sampleRepo));
    const result = await fetchRepo('https://example.com/index.json', fetcher);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(result.repo.name).toBe('Example Listing');
    expect(result.normalized).toHaveLength(2);
  });

  it('throws when the response is not ok', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}),
    } as unknown as Response);
    await expect(fetchRepo('https://example.com/missing.json', fetcher)).rejects.toBeInstanceOf(
      VpmRepoError,
    );
  });

  it('throws when the manifest is missing required fields', async () => {
    const fetcher = vi.fn().mockResolvedValue(makeJsonResponse({ id: 'x' }));
    await expect(fetchRepo('https://example.com/bad.json', fetcher)).rejects.toThrow(
      /missing a "name" field/,
    );
  });

  it('throws when fetch itself rejects', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(fetchRepo('https://example.com/index.json', fetcher)).rejects.toMatchObject({
      name: 'VpmRepoError',
    });
  });
});
