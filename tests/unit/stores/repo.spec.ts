import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRepoStore } from '@/stores/repo';

const validResponse = {
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => ({
    name: 'Test',
    id: 'test',
    packages: {
      'com.test.pkg': {
        versions: {
          '1.0.0': { name: 'com.test.pkg', displayName: 'Pkg', version: '1.0.0' },
        },
      },
    },
  }),
};

describe('useRepoStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loads packages on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(validResponse);
    vi.stubGlobal('fetch', fetchMock);

    const store = useRepoStore();
    await store.load('https://example.com/index.json');

    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.repo?.name).toBe('Test');
    expect(store.packages).toHaveLength(1);
  });

  it('records errors on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({}),
      }),
    );

    const store = useRepoStore();
    await store.load('https://example.com/index.json');

    expect(store.error).not.toBeNull();
    expect(store.repo).toBeNull();
    expect(store.packages).toEqual([]);
  });

  it('clears state when called with an empty url', async () => {
    const store = useRepoStore();
    await store.load('');
    expect(store.url).toBe('');
    expect(store.error).toBeNull();
  });
});
