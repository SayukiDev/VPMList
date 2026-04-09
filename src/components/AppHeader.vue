<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore, type Locale, type ThemeMode } from '@/stores/settings';

const settings = useSettingsStore();
const { t } = useI18n();

const githubUrl = import.meta.env.VITE_GITHUB_URL;

const themeOptions = computed(() => [
  { label: t('header.theme.light'), value: 'light' as ThemeMode, icon: 'pi pi-sun' },
  { label: t('header.theme.system'), value: 'system' as ThemeMode, icon: 'pi pi-desktop' },
  { label: t('header.theme.dark'), value: 'dark' as ThemeMode, icon: 'pi pi-moon' },
]);

const localeOptions = computed(() => [
  { label: t('header.language.en'), value: 'en' as Locale },
  { label: t('header.language.ja'), value: 'ja' as Locale },
]);

const themeProxy = computed({
  get: () => settings.theme,
  set: (value: ThemeMode) => settings.setTheme(value),
});

const localeProxy = computed({
  get: () => settings.locale,
  set: (value: Locale) => settings.setLocale(value),
});
</script>

<template>
  <header class="border-b border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
    <div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2 flex-1 min-w-[200px]">
        <span class="inline-flex items-center justify-center w-8 h-8 rounded-md bg-emerald-500 text-white">
          <i class="pi pi-box" />
        </span>
        <div class="flex flex-col leading-tight">
          <span class="font-semibold text-base">{{ t('app.title') }}</span>
          <span class="text-xs text-surface-500 dark:text-surface-400">{{ t('app.tagline') }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <SelectButton
          v-model="themeProxy"
          :options="themeOptions"
          option-label="label"
          option-value="value"
          aria-label="Theme"
          :allow-empty="false"
        >
          <template #option="slotProps">
            <i :class="slotProps.option.icon" />
          </template>
        </SelectButton>
        <SelectButton
          v-model="localeProxy"
          :options="localeOptions"
          option-label="label"
          option-value="value"
          aria-label="Language"
          :allow-empty="false"
        />
        <a
          v-if="githubUrl"
          v-tooltip.bottom="'GitHub'"
          :href="githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          class="inline-flex items-center justify-center w-9 h-9 rounded-md text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <i class="pi pi-github text-lg" />
        </a>
      </div>
    </div>
  </header>
</template>
