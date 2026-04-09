<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NormalizedPackage, VPMPackageManifest } from '@/types/vpm';
import { normalizeAuthor } from '@/types/vpm';

const props = defineProps<{
  visible: boolean;
  pkg: NormalizedPackage | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'add-to-vcc', pkg: NormalizedPackage): void;
}>();

const { t } = useI18n();

const selectedVersion = ref<string>('');

watch(
  () => props.pkg,
  (next) => {
    selectedVersion.value = next?.latest.version ?? '';
  },
  { immediate: true },
);

const versionOptions = computed(() =>
  (props.pkg?.allVersions ?? []).map((v) => ({ label: v.version, value: v.version })),
);

const current = computed<VPMPackageManifest | null>(() => {
  if (!props.pkg) return null;
  return (
    props.pkg.allVersions.find((v) => v.version === selectedVersion.value) ?? props.pkg.latest
  );
});

const author = computed(() => normalizeAuthor(current.value?.author));

const dependencies = computed(() => {
  const deps = current.value?.dependencies ?? {};
  return Object.entries(deps);
});

const vpmDependencies = computed(() => {
  const deps = current.value?.vpmDependencies ?? {};
  return Object.entries(deps);
});

const keywords = computed(() => current.value?.keywords ?? []);
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :style="{ width: '46rem', maxWidth: '95vw' }"
    @update:visible="(value: boolean) => emit('update:visible', value)"
  >
    <template #header>
      <div v-if="pkg" class="flex flex-col gap-1">
        <div class="text-xl font-bold leading-tight">{{ pkg.displayName }}</div>
        <div class="text-xs text-surface-500 dark:text-surface-400 font-mono">{{ pkg.id }}</div>
      </div>
    </template>

    <div v-if="pkg && current" class="flex flex-col gap-4">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-xs uppercase tracking-wide text-surface-500">{{ t('details.version') }}</span>
          <Select
            v-model="selectedVersion"
            :options="versionOptions"
            option-label="label"
            option-value="value"
            class="w-40"
          />
        </div>
        <Tag v-if="current.unity" :value="`Unity ${current.unity}`" severity="secondary" />
        <Tag v-if="current.type" :value="current.type" severity="info" />
        <div class="flex-1" />
        <Button
          :label="t('listing.addToVcc')"
          icon="pi pi-external-link"
          size="small"
          @click="emit('add-to-vcc', pkg)"
        />
        <Button
          v-if="current.url"
          :label="t('details.download')"
          icon="pi pi-download"
          size="small"
          severity="secondary"
          outlined
          as="a"
          :href="current.url"
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>

      <Divider class="!my-0" />

      <section>
        <h4 class="text-sm font-semibold uppercase tracking-wide m-0 mb-1 text-surface-500">
          {{ t('details.description') }}
        </h4>
        <p class="m-0 text-sm">
          {{ current.description || t('details.noDescription') }}
        </p>
      </section>

      <section v-if="author">
        <h4 class="text-sm font-semibold uppercase tracking-wide m-0 mb-1 text-surface-500">
          {{ t('details.author') }}
        </h4>
        <p class="m-0 text-sm">
          <a
            v-if="author.url"
            :href="author.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-500 hover:underline"
            :title="author.email"
          >
            {{ author.name }}
          </a>
          <span v-else>{{ author.name }}</span>
        </p>
      </section>

      <section>
        <h4 class="text-sm font-semibold uppercase tracking-wide m-0 mb-1 text-surface-500">
          {{ t('details.vpmDependencies') }}
        </h4>
        <ul v-if="vpmDependencies.length" class="m-0 pl-5 text-sm">
          <li v-for="[name, version] in vpmDependencies" :key="name">
            <span class="font-mono">{{ name }}</span>
            <span class="text-surface-500"> @ {{ version }}</span>
          </li>
        </ul>
        <p v-else class="m-0 text-sm text-surface-500">{{ t('details.noDependencies') }}</p>
      </section>

      <section v-if="dependencies.length">
        <h4 class="text-sm font-semibold uppercase tracking-wide m-0 mb-1 text-surface-500">
          {{ t('details.dependencies') }}
        </h4>
        <ul class="m-0 pl-5 text-sm">
          <li v-for="[name, version] in dependencies" :key="name">
            <span class="font-mono">{{ name }}</span>
            <span class="text-surface-500"> @ {{ version }}</span>
          </li>
        </ul>
      </section>

      <section>
        <h4 class="text-sm font-semibold uppercase tracking-wide m-0 mb-1 text-surface-500">
          {{ t('details.keywords') }}
        </h4>
        <div v-if="keywords.length" class="flex flex-wrap gap-1.5">
          <Tag v-for="kw in keywords" :key="kw" :value="kw" severity="secondary" />
        </div>
        <p v-else class="m-0 text-sm text-surface-500">{{ t('details.noKeywords') }}</p>
      </section>

      <section v-if="current.license || current.licensesUrl">
        <h4 class="text-sm font-semibold uppercase tracking-wide m-0 mb-1 text-surface-500">
          {{ t('details.license') }}
        </h4>
        <a
          v-if="current.licensesUrl"
          :href="current.licensesUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-primary-500 hover:underline"
        >
          {{ current.license || current.licensesUrl }}
        </a>
        <span v-else class="text-sm">{{ current.license }}</span>
      </section>

      <section v-if="current.documentationUrl || current.changelogUrl" class="flex gap-3 flex-wrap">
        <a
          v-if="current.documentationUrl"
          :href="current.documentationUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-primary-500 hover:underline"
        >
          <i class="pi pi-book mr-1" />{{ t('details.documentation') }}
        </a>
        <a
          v-if="current.changelogUrl"
          :href="current.changelogUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm text-primary-500 hover:underline"
        >
          <i class="pi pi-history mr-1" />{{ t('details.changelog') }}
        </a>
      </section>
    </div>
  </Dialog>
</template>
