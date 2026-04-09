import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import AddToVccBar from '@/components/AddToVccBar.vue';
import en from '@/i18n/en';

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}));

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } });

const stubs = {
  InputText: {
    props: ['modelValue', 'readonly'],
    emits: ['update:modelValue'],
    template:
      '<input :value="modelValue" :readonly="readonly" data-testid="url-input" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  Button: {
    props: ['label'],
    template: '<button :data-label="label"><slot /></button>',
  },
  HelpDialog: { template: '<div></div>' },
};

const directives = {
  tooltip: { mounted: () => {}, updated: () => {} },
};

function buildWrapper(props: { modelValue: string; locked?: boolean }) {
  return mount(AddToVccBar, {
    props,
    global: { plugins: [i18n], stubs, directives },
  });
}

describe('AddToVccBar', () => {
  it('renders an editable input and Load button when not locked', () => {
    const wrapper = buildWrapper({ modelValue: 'https://example.com/index.json' });
    const input = wrapper.get('[data-testid="url-input"]');
    expect(input.attributes('readonly')).toBeUndefined();
    const labels = wrapper.findAll('button').map((b) => b.attributes('data-label'));
    expect(labels).toContain(en.listing.load);
    expect(labels).toContain(en.listing.addToVcc);
  });

  it('marks input readonly and hides the Load button when locked', () => {
    const wrapper = buildWrapper({ modelValue: 'https://example.com/index.json', locked: true });
    const input = wrapper.get('[data-testid="url-input"]');
    expect(input.attributes('readonly')).toBeDefined();
    const labels = wrapper.findAll('button').map((b) => b.attributes('data-label'));
    expect(labels).not.toContain(en.listing.load);
    expect(labels).toContain(en.listing.addToVcc);
    expect(wrapper.text()).toContain(en.listing.locked);
  });

  it('does not emit submit when locked even if Enter is pressed', async () => {
    const wrapper = buildWrapper({ modelValue: 'https://example.com/index.json', locked: true });
    await wrapper.get('[data-testid="url-input"]').trigger('keyup.enter');
    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('emits submit with the trimmed URL when not locked', async () => {
    const wrapper = buildWrapper({ modelValue: '' });
    const input = wrapper.get('[data-testid="url-input"]');
    await input.setValue('  https://example.com/x.json  ');
    await input.trigger('keyup.enter');
    expect(wrapper.emitted('submit')?.[0]).toEqual(['https://example.com/x.json']);
  });
});
