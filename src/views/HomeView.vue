<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';
import { useRepoStore } from '@/stores/repo';
import { addRepoUrl } from '@/utils/vcc';
import type { NormalizedPackage } from '@/types/vpm';
import ListingHeader from '@/components/ListingHeader.vue';
import AddToVccBar from '@/components/AddToVccBar.vue';
import PackageList from '@/components/PackageList.vue';
import PackageInfoDialog from '@/components/PackageInfoDialog.vue';

const route = useRoute();
const router = useRouter();
const repoStore = useRepoStore();
const { repo, packages, loading, error } = storeToRefs(repoStore);
const { t } = useI18n();
const toast = useToast();

function parseBool(v: string | undefined): boolean {
  // Default: false (URL is locked to VITE_DEFAULT_REPO_URL).
  if (v === undefined) return true;
  return v === 'true' || v === '1';
}

const defaultUrl = import.meta.env.VITE_DEFAULT_REPO_URL ?? '';
const allowUrlChange = parseBool(import.meta.env.VITE_ALLOW_URL_CHANGE);
const currentUrl = ref<string>('');

const infoVisible = ref(false);
const infoPkg = ref<NormalizedPackage | null>(null);

function showInfo(pkg: NormalizedPackage) {
  infoPkg.value = pkg;
  infoVisible.value = true;
}

function downloadPackage(pkg: NormalizedPackage) {
  if (!pkg.latest.url) return;
  window.open(pkg.latest.url, '_blank', 'noopener,noreferrer');
}

function addPackageToVcc() {
  if (!currentUrl.value) return;
  window.location.href = addRepoUrl(currentUrl.value);
}

function loadFromUrl(url: string) {
  if (!allowUrlChange) return;
  currentUrl.value = url;
  router.replace({ query: { ...route.query, url } });
}

function resolveInitialUrl(): string {
  if (allowUrlChange) {
    const queryUrl = route.query.url;
    if (typeof queryUrl === 'string' && queryUrl) return queryUrl;
  }
  return defaultUrl;
}

onMounted(() => {
  const initial = resolveInitialUrl();
  if (initial) {
    currentUrl.value = initial;
    repoStore.load(initial);
  }
});

watch(
  () => route.query.url,
  (next) => {
    if (!allowUrlChange) return;
    const url = typeof next === 'string' ? next : '';
    if (url && url !== repoStore.url) {
      currentUrl.value = url;
      repoStore.load(url);
    }
  },
);

watch(currentUrl, (next) => {
  if (!allowUrlChange) return;
  if (next && next !== repoStore.url) {
    repoStore.load(next);
  }
});

const hasPackages = computed(() => packages.value.length > 0);

watch(error, (err) => {
  if (err) {
    toast.add({ severity: 'error', summary: t('status.error'), detail: err, life: 6000 });
  }
});
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
    <ListingHeader :repo="repo" />

    <AddToVccBar v-model="currentUrl" :locked="!allowUrlChange" @submit="loadFromUrl" />

    <div v-if="loading" class="flex flex-col items-center gap-2 py-10">
      <ProgressSpinner style="width: 3rem; height: 3rem" stroke-width="3" />
      <span class="text-sm text-surface-500">{{ t('status.loading') }}</span>
    </div>

    <Message v-else-if="error" severity="error" :closable="false">
      <div class="flex flex-col gap-1">
        <span class="font-semibold">{{ t('status.error') }}</span>
        <span class="text-xs">{{ error }}</span>
        <span class="text-xs text-surface-500">{{ t('status.cors') }}</span>
      </div>
    </Message>

    <Message v-else-if="!repo" severity="secondary" :closable="false">
      {{ t('status.noRepo') }}
    </Message>

    <PackageList
      v-else-if="hasPackages"
      :packages="packages"
      @show-info="showInfo"
      @download="downloadPackage"
      @add-to-vcc="addPackageToVcc"
    />

    <Message v-else severity="secondary" :closable="false">
      {{ t('packages.none') }}
    </Message>

    <PackageInfoDialog
      v-model:visible="infoVisible"
      :pkg="infoPkg"
      @add-to-vcc="addPackageToVcc"
    />
  </div>
</template>
