# deskmind.dev

The DeskMind 得心 website: one static page (`index.html`), no build step. English and 简体中文 ship in the same page;
the toggle and the browser language pick one. Brand assets in `assets/` are copied from
[deskmind-ai/deskmind](https://github.com/deskmind-ai/deskmind/tree/main/brand) and follow its BRAND.md.

## Preview locally

```bash
python3 -m http.server 8080   # then open http://127.0.0.1:8080
```

## Deploy (launch day)

Cloudflare Pages is the simplest fit, since the deskmind.dev DNS is already on Cloudflare:

1. Pages → Create → Direct upload (or connect this repo once it is on GitHub). Build command: none. Output directory: `/`.
2. Check the `*.pages.dev` preview.
3. Custom domains → add `deskmind.dev` (and `www.deskmind.dev`, redirected to the apex). Remove the current redirect
   rule for the apex first.

Binding the domain makes the site public. Do it on launch day, together with the repositories going public, so that
the GitHub and Hugging Face links on the page resolve.

GitHub Pages also works (`404.html` is picked up automatically); add a `CNAME` file containing `deskmind.dev`.

## Before launch

- Replace the demo slot (`#demo-slot`) with the launch video or GIF.
- Check that the numbers still match `brain/docs/results.md`.
- Make sure `security@deskmind.dev` forwards to a monitored inbox.

## Licence

Text: CC BY 4.0. Code: Apache-2.0. The DeskMind and 得心 names, the logo and Xiaofang are covered by
[BRAND.md](https://github.com/deskmind-ai/deskmind/blob/main/BRAND.md), not by these licences.
