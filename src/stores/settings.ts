import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Locale = 'en' | 'ja';

const THEME_KEY = 'vpmlist:theme';
const LOCALE_KEY = 'vpmlist:locale';

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemeMode>('system');
  const locale = ref<Locale>('en');

  function hydrate(): void {
    const storedTheme = readStorage(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
      theme.value = storedTheme;
    }
    const storedLocale = readStorage(LOCALE_KEY);
    if (storedLocale === 'en' || storedLocale === 'ja') {
      locale.value = storedLocale;
    } else {
      locale.value = detectLocale();
    }
  }

  function setTheme(next: ThemeMode): void {
    theme.value = next;
    writeStorage(THEME_KEY, next);
  }

  function setLocale(next: Locale): void {
    locale.value = next;
    writeStorage(LOCALE_KEY, next);
  }

  return { theme, locale, hydrate, setTheme, setLocale };
});
