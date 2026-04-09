<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { addRepoUrl } from '@/utils/vcc';
import { copyText } from '@/utils/clipboard';
import HelpDialog from './HelpDialog.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    locked?: boolean;
  }>(),
  { locked: false },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit', value: string): void;
}>();

const { t } = useI18n();
const toast = useToast();

const draft = ref(props.modelValue);
watch(
  () => props.modelValue,
  (next) => {
    draft.value = next;
  },
);

const helpVisible = ref(false);

function submit() {
  if (props.locked) return;
  const trimmed = draft.value.trim();
  if (!trimmed) return;
  emit('update:modelValue', trimmed);
  emit('submit', trimmed);
}

function addToVcc() {
  if (!draft.value) return;
  window.location.href = addRepoUrl(draft.value);
}

async function onCopy() {
  if (!draft.value) return;
  try {
    await copyText(draft.value);
    toast.add({ severity: 'success', summary: t('listing.copied'), life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: t('listing.copyFailed'), life: 3000 });
  }
}
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <label class="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-surface-400">
      {{ locked ? t('listing.repoUrlLockedLabel') : t('listing.repoUrlLabel') }}
    </label>
    <div class="flex flex-wrap gap-2 items-stretch">
      <InputText
        v-model="draft"
        :placeholder="t('listing.repoUrlPlaceholder')"
        :readonly="locked"
        class="flex-1 min-w-[260px]"
        @keyup.enter="submit"
      />
      <Button
        v-if="!locked"
        :label="t('listing.load')"
        icon="pi pi-download"
        severity="secondary"
        @click="submit"
      />
      <Button :label="t('listing.addToVcc')" icon="pi pi-external-link" @click="addToVcc" />
      <Button
        v-tooltip.bottom="t('listing.copy')"
        icon="pi pi-copy"
        severity="secondary"
        outlined
        :aria-label="t('listing.copy')"
        @click="onCopy"
      />
      <Button
        v-tooltip.bottom="t('listing.help')"
        icon="pi pi-question-circle"
        severity="secondary"
        outlined
        :aria-label="t('listing.help')"
        @click="helpVisible = true"
      />
    </div>
    <p
      v-if="locked"
      class="text-xs text-surface-500 dark:text-surface-400 m-0 flex items-center gap-1"
    >
      <i class="pi pi-lock text-[10px]" />
      {{ t('listing.locked') }}
    </p>
    <HelpDialog v-model:visible="helpVisible" :listing-url="draft" @copy="onCopy" />
  </div>
</template>
