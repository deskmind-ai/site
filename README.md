# deskmind.dev

The DeskMind 得心 website and docs, built with [Astro](https://astro.build) and
[Starlight](https://starlight.astro.build).

| Path | What | Source |
|---|---|---|
| `/`, `/zh/` | Homepage, English and 简体中文 | `src/components/Home.astro`, copy in `src/i18n/home.ts` |
| `/docs/`, `/zh/docs/` | Docs, organised as start / how-to / reference / explanation / project | `src/content/docs/` |
| any unknown path | 404 with Xiaofang | `public/404.html` |

Brand assets in `public/assets/` are copied from
[deskmind-ai/deskmind](https://github.com/deskmind-ai/deskmind/tree/main/brand) and follow its BRAND.md. Fonts are
self-hosted (Manrope, JetBrains Mono); Chinese text uses the system font, so the site loads without Google Fonts.

## Develop

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview
```

In mainland China, add `--registry=https://registry.npmmirror.com` to `npm install` if the default registry is slow.

## Editing

- **Homepage copy:** edit both languages in `src/i18n/home.ts`. The numbers come from
  [brain/docs/results.md](https://github.com/deskmind-ai/brain/blob/main/docs/results.md); update them together.
- **Docs:** each English page under `src/content/docs/docs/` has a Chinese twin at the same path under
  `src/content/docs/zh/docs/`. The sidebar is generated from the folders; `sidebar.order` in the frontmatter sets the
  order.
- **Demo video:** `public/video/demo-{en,zh}.mp4` (1280 px, H.264, faststart), loaded only when the visitor presses play.

## Deploy (launch day)

Cloudflare Pages, since the deskmind.dev DNS is already on Cloudflare:

1. Pages → Create → connect this repo. Framework preset: Astro. Build command `npm run build`, output directory `dist`.
2. Check the `*.pages.dev` preview.
3. Custom domains → add `deskmind.dev` (and `www.deskmind.dev`, redirected to the apex). Remove the current redirect
   rule for the apex first.

Binding the domain makes the site public. Do it on launch day, together with the repositories going public, so that
the GitHub, Hugging Face and ModelScope links resolve.

## Before launch

- Check the numbers against `brain/docs/results.md`.
- Point the download buttons at the published App release (`APP_DOWNLOAD` in `src/i18n/home.ts`).
- Make sure `security@deskmind.dev` forwards to a monitored inbox.
- Push this repo to `github.com/deskmind-ai/site` (public): the docs' “Edit page” links point there.
- Push `CONTRIBUTING.md` to `deskmind-ai/.github`; the contributing page links to it.
- Make the ModelScope repos `gxcsoccer/brain-{0.8b,4b}` public; the quickstart and troubleshooting pages use them.

## Licence

Text (homepage copy and docs): CC BY 4.0, see [LICENSE-docs](LICENSE-docs). Code: Apache-2.0, see [LICENSE](LICENSE). The DeskMind and 得心 names, the logo and Xiaofang are covered by
[BRAND.md](https://github.com/deskmind-ai/deskmind/blob/main/BRAND.md), not by these licences.
