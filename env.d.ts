/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_REPO_URL?: string;
  /**
   * When set to "true" (or "1"), the UI lets visitors edit the URL bar and
   * load any other VPM repository manifest. When unset or "false" (default),
   * the URL bar is read-only and only VITE_DEFAULT_REPO_URL is ever loaded.
   */
  readonly VITE_ALLOW_URL_CHANGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
