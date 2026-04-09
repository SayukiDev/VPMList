# VPMList

> A clean, fast, theme-aware browser for any [VRChat Package Manager](https://vcc.docs.vrchat.com/vpm/repos) repository.

VPMList fetches a VPM repository manifest, normalizes it, and renders the
contained packages in a searchable, sortable, sharable single-page app —
no backend, no build step per repository.

Point it at any public VPM listing URL (`index.json`) and it just works.

[日本語 README](README-ja.md)

---

## Features

- **Single-listing or multi-listing mode** — by default the site is locked to the repository you bake in via `VITE_DEFAULT_REPO_URL`. Flip `VITE_ALLOW_URL_CHANGE=true` and visitors can paste any VPM `index.json` URL.
- **Shareable URLs** (when URL changes are enabled) — the active repo is reflected in the route hash (`#/?url=...`), so any link you copy loads the same listing on the other side.
- **One-click "Add to VCC"** — generates the `vcc://vpm/addRepo?url=...` protocol link the VRChat Creator Companion expects.
- **Per-package details** — pick any version, see dependencies / VPM dependencies / keywords / license / Unity version / changelog / docs links.
- **Searchable, sortable, paginated** package table powered by PrimeVue's `DataTable`.
- **Light / dark / system theme** with `prefers-color-scheme` follow-mode and a manual toggle, persisted to `localStorage`.
- **English / 日本語** UI via `vue-i18n`, auto-detected from the browser language and persisted.
- **Strict TypeScript**, **Vitest** unit tests, **ESLint + Prettier**.

## Tech Stack

| Layer | Library |
| --- | --- |
| Build | [Vite 7](https://vite.dev) + `@vitejs/plugin-vue` |
| Framework | [Vue 3](https://vuejs.org) (Composition API, `<script setup lang="ts">`) |
| Language | TypeScript (strict) |
| UI | [PrimeVue 4](https://primevue.org) — Aura preset from `@primeuix/themes`, auto-imported via `unplugin-vue-components` |
| Styles | [Tailwind CSS v4](https://tailwindcss.com) + `tailwindcss-primeui` |
| State | [Pinia 3](https://pinia.vuejs.org) |
| Router | [Vue Router 4](https://router.vuejs.org) (hash history) |
| i18n | [vue-i18n 10](https://vue-i18n.intlify.dev) |
| Tests | [Vitest 4](https://vitest.dev) + `@vue/test-utils` + `happy-dom` |

## Quick Start

```bash
# 1. Install
npm install

# 2. (Optional) Set a default repository to load on first visit
cp .env.example .env
# edit .env → VITE_DEFAULT_REPO_URL=https://your-listing.example.com/index.json

# 3. Run the dev server
npm run dev          # http://localhost:5173

# 4. Build for production
npm run build        # → dist/
npm run preview      # serve dist/ locally
```

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check (`vue-tsc`) and build for production |
| `npm run preview` | Preview the production build |
| `npm run test` | Run Vitest once (CI mode) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint over `.ts` / `.vue` |
| `npm run format` | Prettier write |

## Configuration

| Env var | Default | Description |
| --- | --- | --- |
| `VITE_DEFAULT_REPO_URL` | _(empty)_ | The repository URL displayed on first visit. When `VITE_ALLOW_URL_CHANGE` is `false`, this is the only URL the UI will ever load. |
| `VITE_ALLOW_URL_CHANGE` | `false` | When set to `true` (or `1`), visitors can edit the URL bar and load any other VPM repository manifest, and the `#/?url=...` shareable link is honored. When unset or `false`, the URL bar is read-only and locked to `VITE_DEFAULT_REPO_URL`. |

### Modes

- **Locked (default)** — ship a single curated listing. The URL bar is
  read-only, the "Load" button is hidden, `#/?url=...` query parameters are
  ignored, and the only repository ever fetched is `VITE_DEFAULT_REPO_URL`.
  Use this when you publish only your own packages.
- **Open** — set `VITE_ALLOW_URL_CHANGE=true` in `.env`. The URL bar becomes
  editable, the active repo is mirrored to `route.query.url`, and any
  visitor can paste a different VPM listing URL. Use this when running a
  generic VPM browser.

> **Note:** The lock is a UX boundary, not a security one. The default URL
> is inlined into the bundle at build time, and a determined visitor can
> always craft their own fetch. Treat `VITE_ALLOW_URL_CHANGE=false` as
> "this site only shows our packages", not as a sandbox.

## Project Structure

```
src/
├── main.ts                    # Vue / Pinia / Router / PrimeVue / i18n bootstrap
├── App.vue                    # Shell layout
├── style.css                  # Tailwind v4 + tailwindcss-primeui + primeicons
├── router/                    # Hash-mode router
├── stores/
│   ├── repo.ts                # Active repo: loading / error / data
│   └── settings.ts            # Theme + locale (persisted to localStorage)
├── i18n/                      # vue-i18n setup, en.ts / ja.ts message bundles
├── types/vpm.ts               # VPM manifest TypeScript interfaces
├── services/vpmRepo.ts        # fetch + validate + normalize a VPM repo
├── utils/
│   ├── semver.ts              # Lightweight semver compare / pickLatest
│   ├── vcc.ts                 # Build vcc://vpm/addRepo URLs
│   └── clipboard.ts           # navigator.clipboard wrapper with fallback
├── composables/
│   └── useTheme.ts            # html.dark toggle + prefers-color-scheme
├── views/HomeView.vue         # Page composition
└── components/
    ├── AppHeader.vue
    ├── ListingHeader.vue
    ├── AddToVccBar.vue
    ├── HelpDialog.vue
    ├── PackageList.vue
    └── PackageInfoDialog.vue

tests/unit/                    # Vitest specs (utils / services / stores / components)
```

## Testing

```bash
npm run test
```

The test suite covers:

- `utils/semver` — comparator, sort order, prerelease handling
- `utils/vcc` — `vcc://` URL encoding
- `services/vpmRepo` — fetch / validation / normalization (with `vi.fn` fetch)
- `stores/repo` — Pinia action transitions on success / failure
- `components/PackageList` — search filter behavior

## CORS

VPMList fetches the manifest directly from the browser, so the remote server
**must respond with permissive CORS headers**. GitHub Pages-hosted VPM
listings (the most common deployment) do this by default. If a CORS error
occurs, the UI surfaces a hint and the failing URL — there is intentionally
no proxy in the loop.

## References

- VPM repository manifest spec — <https://vcc.docs.vrchat.com/vpm/repos>
- VPM package manifest spec — <https://vcc.docs.vrchat.com/vpm/packages>

## Deploying to GitHub Pages

A ready-to-go workflow lives at
[`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml).
On every push to `main` / `master` it lints, tests, builds with
`BASE_PATH=/<repo-name>/`, and publishes `dist/` to GitHub Pages.

Before the first run:

1. In your repo settings, enable **Pages → Build and deployment → Source: GitHub Actions**.
2. (Optional) Define repository **Variables** under
   _Settings → Secrets and variables → Actions → Variables_:
   - `VITE_DEFAULT_REPO_URL` — the listing the deployed site should display.
   - `VITE_ALLOW_URL_CHANGE` — set to `true` to let visitors browse other repositories.
3. Push to `main`. The workflow can also be triggered manually from the
   Actions tab.

The site will be available at `https://<owner>.github.io/<repo>/`.

## License

Released under the **GNU General Public License v3.0**.
See [`LICENSE`](./LICENSE) for the full text.
