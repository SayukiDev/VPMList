<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { VPMRepository } from '@/types/vpm';
import { normalizeAuthor } from '@/types/vpm';

const props = defineProps<{
  repo: VPMRepository | null;
}>();

const { t } = useI18n();

const author = computed(() => normalizeAuthor(props.repo?.author));
const bannerUrl = computed(() => {
  const banner = props.repo?.bannerUrl;
  if (!banner) return null;
  if (banner.startsWith('http://') || banner.startsWith('https://')) return banner;
  // Resolve relative banner against the repo URL
  const base = props.repo?.url;
  if (!base) return null;
  try {
    return new URL(banner, base).toString();
  } catch {
    return null;
  }
});
</script>

<template>
  <section v-if="repo" class="flex flex-col items-center text-center gap-2 w-full">
    <div
      v-if="bannerUrl"
      class="w-full max-w-3xl rounded-lg overflow-hidden"
      :style="{
        aspectRatio: '5 / 1',
        backgroundImage: `url(${bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    />
    <h1 class="text-3xl font-bold m-0">{{ repo.name }}</h1>
    <p v-if="repo.description" class="text-surface-600 dark:text-surface-300 max-w-2xl m-0">
      {{ repo.description }}
    </p>
    <div v-if="author" class="text-sm text-surface-500 dark:text-surface-400">
      <span v-if="author.url">
        <i18n-t keypath="listing.publishedBy" tag="span">
          <template #name>
            <a
              :href="author.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-500 hover:underline"
              :title="author.email"
            >
              {{ author.name }}
            </a>
          </template>
        </i18n-t>
      </span>
      <span v-else>
        {{ t('listing.publishedBy', { name: author.name }) }}
      </span>
    </div>
    <a
      v-if="repo.infoLink?.url"
      :href="repo.infoLink.url"
      target="_blank"
      rel="noopener noreferrer"
      class="text-sm text-primary-500 hover:underline"
    >
      {{ repo.infoLink.text || t('listing.learnMore') }}
    </a>
  </section>
</template>
