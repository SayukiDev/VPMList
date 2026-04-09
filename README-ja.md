# VPMList

> 任意の [VRChat Package Manager](https://vcc.docs.vrchat.com/vpm/repos) リポジトリをきれいに高速に閲覧できる、テーマ対応の Web ビューア。

VPMList は VPM のリポジトリマニフェストを取得して正規化し、含まれる
パッケージを検索・ソート・共有可能な単一ページアプリで表示します。
バックエンドは不要、リポジトリごとのビルドも不要です。

公開されている VPM リスティングの URL (`index.json`) を渡すだけで動作します。

[English README](./README.md)

---

## 特徴

- **単一リスティング / 複数リスティングの 2 モード** — 既定では `VITE_DEFAULT_REPO_URL` で指定したリポジトリにロックされます。`VITE_ALLOW_URL_CHANGE=true` を設定すると、訪問者が任意の VPM `index.json` URL を貼り付けて閲覧できます。
- **共有可能な URL** (URL 変更を許可した場合) — 表示中のリポジトリはルートハッシュ (`#/?url=...`) に反映されるため、URL をそのまま共有すれば相手側でも同じ一覧が開きます。
- **ワンクリックで「Add to VCC」** — VRChat Creator Companion が認識する `vcc://vpm/addRepo?url=...` プロトコルリンクを生成します。
- **パッケージ詳細表示** — 任意のバージョンを選択して、依存・VPM 依存・キーワード・ライセンス・対応 Unity バージョン・変更履歴・ドキュメントへのリンクを確認できます。
- **検索・ソート・ページネーション** — PrimeVue の `DataTable` を使用したパッケージテーブル。
- **ライト / ダーク / システム** テーマ対応。`prefers-color-scheme` への自動追従と手動切替の両方をサポートし、`localStorage` に永続化します。
- **English / 日本語** UI を `vue-i18n` で切替。ブラウザ言語から自動検出して保存します。
- **strict TypeScript**、**Vitest** 単体テスト、**ESLint + Prettier** 構成。

## 技術スタック

| レイヤ | ライブラリ |
| --- | --- |
| ビルド | [Vite 7](https://vite.dev) + `@vitejs/plugin-vue` |
| フレームワーク | [Vue 3](https://vuejs.org) (Composition API, `<script setup lang="ts">`) |
| 言語 | TypeScript (strict) |
| UI | [PrimeVue 4](https://primevue.org) — `@primeuix/themes` の Aura preset、`unplugin-vue-components` で自動 import |
| スタイル | [Tailwind CSS v4](https://tailwindcss.com) + `tailwindcss-primeui` |
| 状態管理 | [Pinia 3](https://pinia.vuejs.org) |
| ルーティング | [Vue Router 4](https://router.vuejs.org) (hash history) |
| 国際化 | [vue-i18n 10](https://vue-i18n.intlify.dev) |
| テスト | [Vitest 4](https://vitest.dev) + `@vue/test-utils` + `happy-dom` |

## クイックスタート

```bash
# 1. インストール
npm install

# 2. (任意) 初回表示時のデフォルトリポジトリを設定
cp .env.example .env
# .env を編集 → VITE_DEFAULT_REPO_URL=https://your-listing.example.com/index.json

# 3. 開発サーバー起動
npm run dev          # http://localhost:5173

# 4. プロダクションビルド
npm run build        # → dist/
npm run preview      # dist/ をローカルでプレビュー
```

### スクリプト

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | HMR 付き Vite 開発サーバーを起動 |
| `npm run build` | `vue-tsc` で型チェックしてプロダクションビルド |
| `npm run preview` | プロダクションビルドをプレビュー |
| `npm run test` | Vitest を 1 回実行 (CI モード) |
| `npm run test:watch` | Vitest を watch モードで実行 |
| `npm run lint` | `.ts` / `.vue` に対して ESLint を実行 |
| `npm run format` | Prettier で整形 |

## 設定

| 環境変数 | 既定値 | 説明 |
| --- | --- | --- |
| `VITE_DEFAULT_REPO_URL` | _(空)_ | 初回表示時に読み込むリポジトリ URL。`VITE_ALLOW_URL_CHANGE` が `false` の場合、UI が読み込む唯一のリポジトリになります。 |
| `VITE_ALLOW_URL_CHANGE` | `false` | `true` (または `1`) を設定すると、訪問者が URL バーを編集して任意の VPM リポジトリマニフェストを読み込めるようになり、`#/?url=...` の共有リンクも有効になります。`false` の場合は URL バーが読み取り専用となり、`VITE_DEFAULT_REPO_URL` だけが利用されます。 |

### 動作モード

- **ロック (既定)** — 単一の厳選リスティングを公開する用途。
  URL バーは読み取り専用、「Load」ボタンは非表示、`#/?url=...` のクエリは
  無視され、`VITE_DEFAULT_REPO_URL` だけが取得対象になります。
  自分のパッケージリストだけを公開したい場合に使います。
- **オープン** — `.env` に `VITE_ALLOW_URL_CHANGE=true` を設定すると有効化されます。
  URL バーが編集可能になり、表示中のリポジトリは `route.query.url` に反映され、
  訪問者は別の VPM リスティング URL を貼り付けて閲覧できます。
  汎用の VPM ブラウザとして運用したい場合に使います。

> **注意:** このロックは UX の境界であり、セキュリティの境界ではありません。
> デフォルト URL はビルド時にバンドルへインライン展開されるため、
> 意図のある訪問者は自分で任意の fetch を組み立てられます。
> `VITE_ALLOW_URL_CHANGE=false` は「このサイトは自分のパッケージのみを表示する」
> という UI 上の宣言として扱ってください。

## ディレクトリ構成

```
src/
├── main.ts                    # Vue / Pinia / Router / PrimeVue / i18n の初期化
├── App.vue                    # 共通レイアウト
├── style.css                  # Tailwind v4 + tailwindcss-primeui + primeicons
├── router/                    # ハッシュモードのルーター
├── stores/
│   ├── repo.ts                # 現在のリポジトリ状態 (loading / error / data)
│   └── settings.ts            # テーマ + ロケール (localStorage に永続化)
├── i18n/                      # vue-i18n 設定 + en.ts / ja.ts メッセージ
├── types/vpm.ts               # VPM マニフェストの TypeScript インターフェース
├── services/vpmRepo.ts        # VPM リポジトリの fetch + バリデーション + 正規化
├── utils/
│   ├── semver.ts              # 軽量 semver 比較 / pickLatest
│   ├── vcc.ts                 # vcc://vpm/addRepo URL の生成
│   └── clipboard.ts           # navigator.clipboard ラッパ (フォールバック付き)
├── composables/
│   └── useTheme.ts            # html.dark トグル + prefers-color-scheme
├── views/HomeView.vue         # ページ全体の組み立て
└── components/
    ├── AppHeader.vue
    ├── ListingHeader.vue
    ├── AddToVccBar.vue
    ├── HelpDialog.vue
    ├── PackageList.vue
    └── PackageInfoDialog.vue

tests/unit/                    # Vitest スペック (utils / services / stores / components)
```

## テスト

```bash
npm run test
```

テストでカバーしている範囲:

- `utils/semver` — 比較関数、ソート順、プレリリースの扱い
- `utils/vcc` — `vcc://` URL のエンコード
- `services/vpmRepo` — `vi.fn` で fetch をモックした取得 / バリデーション / 正規化
- `stores/repo` — 成功 / 失敗時の Pinia アクション遷移
- `components/PackageList` — 検索フィルタの挙動

## CORS について

VPMList はマニフェストをブラウザから直接取得するため、対象サーバーが
**許可的な CORS ヘッダーを返す必要があります**。GitHub Pages 上にホスト
された VPM リスティング (もっとも一般的なデプロイ方式) はデフォルトで
許可されています。CORS エラーが発生した場合は UI 上にヒントと該当 URL を
表示します。プロキシは意図的に経由しません。

## 参考

- VPM リポジトリマニフェスト仕様 — <https://vcc.docs.vrchat.com/vpm/repos>
- VPM パッケージマニフェスト仕様 — <https://vcc.docs.vrchat.com/vpm/packages>

## GitHub Pages へのデプロイ

すぐに使えるワークフローを
[`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml)
に同梱しています。`main` / `master` への push ごとに lint → test → ビルド
(`BASE_PATH=/<repo 名>/`) → `dist/` を GitHub Pages に公開します。

初回セットアップ:

1. リポジトリ設定で **Pages → Build and deployment → Source: GitHub Actions** を選択。
2. (任意) **Settings → Secrets and variables → Actions → Variables** に以下を定義:
   - `VITE_DEFAULT_REPO_URL` — デプロイしたサイトに表示するリスティング URL
   - `VITE_ALLOW_URL_CHANGE` — `true` にすると訪問者が別リポジトリを閲覧可能
3. `main` に push。Actions タブから手動実行 (`workflow_dispatch`) も可能です。

公開後の URL は `https://<owner>.github.io/<repo>/` になります。

## ライセンス

**GNU General Public License v3.0** で公開しています。
全文は [`LICENSE`](./LICENSE) を参照してください。
