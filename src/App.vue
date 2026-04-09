<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import { useTheme } from '@/composables/useTheme';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import { watch } from 'vue';

const settings = useSettingsStore();
settings.hydrate();

const { locale } = useI18n();
locale.value = settings.locale;
watch(
  () => settings.locale,
  (next) => {
    locale.value = next;
  },
);

useTheme();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 w-full">
      <RouterView />
    </main>
    <Toast position="bottom-right" />
  </div>
</template>
