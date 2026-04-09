import { onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore, type ThemeMode } from '@/stores/settings';

const DARK_CLASS = 'dark';

function isSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyClass(isDark: boolean): void {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === 'undefined') return;
  if (mode === 'system') {
    applyClass(isSystemDark());
  } else {
    applyClass(mode === 'dark');
  }
}

export function useTheme() {
  const settings = useSettingsStore();
  const { theme } = storeToRefs(settings);

  let media: MediaQueryList | null = null;
  const onMediaChange = () => {
    if (theme.value === 'system') applyClass(isSystemDark());
  };

  onMounted(() => {
    applyTheme(theme.value);
    if (typeof window !== 'undefined' && window.matchMedia) {
      media = window.matchMedia('(prefers-color-scheme: dark)');
      media.addEventListener('change', onMediaChange);
    }
  });

  onUnmounted(() => {
    media?.removeEventListener('change', onMediaChange);
  });

  watch(theme, (next) => applyTheme(next));

  return { applyTheme };
}
