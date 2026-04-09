# VPMList — Repo Manifest Viewer

A Vue 3 single-page app that fetches any [VRChat Package Manager (VPM) repository
manifest](https://vcc.docs.vrchat.com/vpm/repos) and renders the contained packages
in a searchable, theme-aware listing UI.

## Tech Stack

- **Vue 3** (Composition API, `<script setup lang="ts">`)
- **Vite 7** + `@vitejs/plugin-vue@^6`
- **TypeScript** (strict)
- **PrimeVue 4** with the **Aura** preset from `@primeuix/themes`
  (auto-imported via `unplugin-vue-components` + `PrimeVueResolver`)
- **Tailwind CSS v4** with the `tailwindcss-primeui` plugin and a `dark` custom variant
- **Pinia 3** for state, **Vue Router 4** in hash mode
- **vue-i18n 10** (English / Japanese)
- **Vitest** + **@vue/test-utils** + **happy-dom**

## Scripts

```bash
npm run dev       # Start the Vite dev server (default: http://localhost:5173)
npm run build     # Type-check (vue-tsc) and build for production
npm run preview   # Preview the production build
npm run test      # Run Vitest unit tests once
npm run test:watch
npm run lint      # ESLint
npm run format    # Prettier write
```

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_DEFAULT_REPO_URL` | _(empty)_ | The repository manifest URL displayed on first visit. When the site is locked (default), this is the only URL the UI will ever load. |
| `VITE_ALLOW_URL_CHANGE` | `false` | When `true` / `1`, visitors can edit the URL bar and `#/?url=...` query parameters are honored. When unset or `false`, the URL bar is read-only and locked to `VITE_DEFAULT_REPO_URL`. |

Copy `.env.example` → `.env` and edit as needed. By default the site behaves
as a single-listing viewer; set `VITE_ALLOW_URL_CHANGE=true` to turn it into
a generic VPM browser where any repo URL can be loaded.

The lock is enforced in `src/views/HomeView.vue` (`parseBool` →
`allowUrlChange`) and in `src/components/AddToVccBar.vue` (the `locked` prop
makes the input `readonly` and hides the Load button). It is a UX boundary,
not a security one — `VITE_DEFAULT_REPO_URL` is inlined into the bundle and
a determined visitor can still craft their own fetch.

## Directory Layout

```
src/
├── main.ts              # App bootstrap (Vue, Pinia, Router, PrimeVue, i18n, Toast)
├── App.vue              # Shell layout (header + RouterView + Toast)
├── style.css            # Tailwind v4 + tailwindcss-primeui + primeicons
├── router/              # Vue Router (hash mode)
├── stores/
│   ├── repo.ts          # Current repo state (loading / error / data)
│   └── settings.ts      # Theme + locale, persisted to localStorage
├── i18n/                # vue-i18n setup + en.ts / ja.ts message bundles
├── types/vpm.ts         # VPM manifest TypeScript interfaces
├── services/vpmRepo.ts  # fetch + validate + normalize a VPM repo
├── utils/
│   ├── semver.ts        # Lightweight semver compare / pickLatest
│   ├── vcc.ts           # Build vcc://vpm/addRepo URLs
│   └── clipboard.ts     # navigator.clipboard wrapper with fallback
├── composables/
│   └── useTheme.ts      # html.dark toggle + prefers-color-scheme
├── views/
│   └── HomeView.vue     # Page layout: header → URL bar → list / dialogs
└── components/
    ├── AppHeader.vue
    ├── ListingHeader.vue
    ├── AddToVccBar.vue
    ├── HelpDialog.vue
    ├── PackageList.vue
    └── PackageInfoDialog.vue

tests/unit/              # Vitest specs for utils / services / stores / components
```

## How It Works

1. On mount, `HomeView` resolves the initial URL from
   `route.query.url` → `VITE_DEFAULT_REPO_URL`.
2. `useRepoStore.load(url)` calls `services/vpmRepo.fetchRepo`,
   which fetches JSON, validates the shape, and runs `normalizePackages`
   to expand `packages[<id>].versions[<ver>]` into `NormalizedPackage[]`
   (latest version + sorted version list).
3. `PackageList` renders a PrimeVue `DataTable` with client-side search.
4. `PackageInfoDialog` shows per-version details and supports switching versions.
5. `AddToVccBar` builds a `vcc://vpm/addRepo?url=...` URL for one-click VCC integration.

## Theming & i18n

- Theme is one of `light` / `dark` / `system`. The `system` mode listens to
  `prefers-color-scheme` and toggles the `dark` class on `<html>`.
  PrimeVue's Aura preset is configured with `darkModeSelector: '.dark'`,
  and Tailwind v4 uses a matching custom variant in `style.css`.
- Locale is `en` or `ja`. Initial value comes from `localStorage` or
  `navigator.language`. Both selections persist to `localStorage`.

## CORS Note

The browser fetches the remote manifest directly. The remote server must
respond with permissive CORS headers — most GitHub Pages hosted VPM listings
do. If you hit a CORS error, the UI shows a hint message with the failing URL.
There is intentionally no proxy.

## References

- VPM repository manifest spec: <https://vcc.docs.vrchat.com/vpm/repos>
- VPM package manifest spec: <https://vcc.docs.vrchat.com/vpm/packages>
- PrimeVue 4 docs: <https://primevue.org>
- Tailwind v4 docs: <https://tailwindcss.com>
