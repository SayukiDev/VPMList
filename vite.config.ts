import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

// https://vite.dev/config/
export default defineConfig({
  // Allows project-pages-style hosting (e.g. https://user.github.io/<repo>/)
  // by setting BASE_PATH=/<repo>/ at build time. Defaults to "/" for local dev.
  base: process.env.BASE_PATH || '/',
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [PrimeVueResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.spec.ts'],
  },
});
