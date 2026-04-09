<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { NormalizedPackage } from '@/types/vpm';

const props = defineProps<{
  packages: NormalizedPackage[];
}>();

const emit = defineEmits<{
  (e: 'add-to-vcc', pkg: NormalizedPackage): void;
  (e: 'show-info', pkg: NormalizedPackage): void;
  (e: 'download', pkg: NormalizedPackage): void;
}>();

const { t } = useI18n();

const query = ref('');

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return props.packages;
  return props.packages.filter((pkg) => {
    return (
      pkg.id.toLowerCase().includes(q) ||
      pkg.displayName.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q)
    );
  });
});
</script>

<template>
  <div class="w-full flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2 flex-wrap">
      <h2 class="text-xl font-semibold m-0">{{ t('packages.title') }}</h2>
      <IconField icon-position="left" class="flex-1 max-w-md">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="query"
          :placeholder="t('packages.searchPlaceholder')"
          class="w-full"
        />
      </IconField>
    </div>

    <DataTable
      :value="filtered"
      data-key="id"
      striped-rows
      paginator
      :rows="20"
      :rows-per-page-options="[10, 20, 50]"
      removable-sort
      :empty-message="t('packages.empty')"
      class="text-sm"
    >
      <Column field="displayName" :header="t('packages.columnName')" sortable>
        <template #body="{ data }">
          <div class="flex flex-col gap-0.5">
            <div class="font-semibold text-base">{{ data.displayName }}</div>
            <div v-if="data.description" class="text-xs text-surface-600 dark:text-surface-300">
              {{ data.description }}
            </div>
            <div class="text-[11px] text-surface-500 dark:text-surface-400 font-mono">
              {{ data.id }} · v{{ data.latest.version }}
            </div>
          </div>
        </template>
      </Column>
      <Column field="type" :header="t('packages.columnType')" sortable style="width: 8rem">
        <template #body="{ data }">
          <Tag v-if="data.type" :value="data.type" severity="info" />
          <span v-else class="text-surface-400">—</span>
        </template>
      </Column>
      <Column :header="t('packages.columnActions')" style="width: 16rem">
        <template #body="{ data }">
          <div class="flex justify-end gap-2">
            <Button
              :label="t('listing.addToVcc')"
              size="small"
              @click="emit('add-to-vcc', data)"
            />
            <Button
              v-tooltip.top="t('packages.info')"
              icon="pi pi-info-circle"
              size="small"
              severity="secondary"
              outlined
              :aria-label="t('packages.info')"
              @click="emit('show-info', data)"
            />
            <Button
              v-tooltip.top="t('packages.download')"
              icon="pi pi-download"
              size="small"
              severity="secondary"
              outlined
              :disabled="!data.latest.url"
              :aria-label="t('packages.download')"
              @click="emit('download', data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
