import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import PackageList from '@/components/PackageList.vue';
import en from '@/i18n/en';
import type { NormalizedPackage } from '@/types/vpm';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } });

const packages: NormalizedPackage[] = [
  {
    id: 'com.example.alpha',
    displayName: 'Alpha Tool',
    description: 'First package',
    type: 'Tool',
    latest: { name: 'com.example.alpha', version: '1.0.0' },
    allVersions: [{ name: 'com.example.alpha', version: '1.0.0' }],
  },
  {
    id: 'com.example.beta',
    displayName: 'Beta Library',
    description: 'A different thing',
    type: 'Library',
    latest: { name: 'com.example.beta', version: '2.0.0' },
    allVersions: [{ name: 'com.example.beta', version: '2.0.0' }],
  },
];

// Stub PrimeVue components used in the template; we only care about the
// filter behavior here, not the look of the table.
const stubs = {
  DataTable: {
    props: ['value'],
    template: '<div data-testid="rows">{{ value.map(v => v.displayName).join("|") }}</div>',
  },
  Column: { template: '<div></div>' },
  IconField: { template: '<div><slot /></div>' },
  InputIcon: { template: '<i></i>' },
  InputText: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  Button: { template: '<button><slot /></button>' },
  Tag: { template: '<span><slot /></span>' },
};

describe('PackageList', () => {
  it('renders all packages by default', () => {
    const wrapper = mount(PackageList, {
      props: { packages },
      global: { plugins: [i18n], stubs },
    });
    expect(wrapper.get('[data-testid="rows"]').text()).toBe('Alpha Tool|Beta Library');
  });

  it('filters packages by display name', async () => {
    const wrapper = mount(PackageList, {
      props: { packages },
      global: { plugins: [i18n], stubs },
    });
    await wrapper.get('input').setValue('beta');
    expect(wrapper.get('[data-testid="rows"]').text()).toBe('Beta Library');
  });

  it('filters packages by id substring', async () => {
    const wrapper = mount(PackageList, {
      props: { packages },
      global: { plugins: [i18n], stubs },
    });
    await wrapper.get('input').setValue('alpha');
    expect(wrapper.get('[data-testid="rows"]').text()).toBe('Alpha Tool');
  });
});
