import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { NormalizedPackage, VPMRepository } from '@/types/vpm';
import { fetchRepo, VpmRepoError } from '@/services/vpmRepo';

export const useRepoStore = defineStore('repo', () => {
  const url = ref<string>('');
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const repo = ref<VPMRepository | null>(null);
  const packages = ref<NormalizedPackage[]>([]);

  async function load(targetUrl: string): Promise<void> {
    if (!targetUrl) {
      error.value = null;
      repo.value = null;
      packages.value = [];
      url.value = '';
      return;
    }

    loading.value = true;
    error.value = null;
    url.value = targetUrl;

    try {
      const result = await fetchRepo(targetUrl);
      repo.value = result.repo;
      packages.value = result.normalized;
    } catch (err) {
      repo.value = null;
      packages.value = [];
      error.value = err instanceof VpmRepoError ? err.message : 'Unknown error while loading repository.';
    } finally {
      loading.value = false;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  return {
    url,
    loading,
    error,
    repo,
    packages,
    load,
    clearError,
  };
});
