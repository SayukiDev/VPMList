<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  visible: boolean;
  listingUrl: string;
}>();

defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'copy'): void;
}>();

const { t, tm, rt } = useI18n();

function steps(): string[] {
  const raw = tm('help.steps') as unknown as string[];
  return raw.map((s) => rt(s));
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="t('help.title')"
    modal
    :style="{ width: '38rem', maxWidth: '95vw' }"
    @update:visible="(value: boolean) => $emit('update:visible', value)"
  >
    <p class="mt-0 mb-2">{{ t('help.intro') }}</p>
    <ol class="pl-5 mt-1 space-y-1">
      <li v-for="(step, idx) in steps()" :key="idx">{{ step }}</li>
    </ol>
    <div class="mt-4">
      <div class="text-sm font-semibold mb-1">{{ t('help.listingUrl') }}</div>
      <div class="flex gap-2">
        <InputText :model-value="listingUrl" readonly class="flex-1" />
        <Button icon="pi pi-copy" severity="secondary" outlined @click="$emit('copy')" />
      </div>
    </div>
    <p class="text-xs text-surface-500 dark:text-surface-400 mt-4 mb-0">
      <a
        href="https://vcc.docs.vrchat.com"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary-500 hover:underline"
      >
        {{ t('help.docs') }}
      </a>
    </p>
  </Dialog>
</template>
