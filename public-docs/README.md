# Molik Handbook

The handbook is an Astro Starlight static site. The workspace stays at the Pages project root; the handbook and its Pagefind search index live under `docs/`. Search runs locally after the index is downloaded. No hosted search account, third-party fonts, or API is required.

Use Node.js 24 and npm. From `public-docs/`, run `npm ci && npm run dev` and visit the `/OpenBullet2/docs/` path shown by Astro. `npm run build` produces `dist/`. Edit Markdown or MDX in `src/content/docs/` and register new guides in the task-based sidebar in `astro.config.mjs`.

For production, `.github/workflows/public-pages.yml` builds and assembles both sites, checks relative links and anchors, and deploys a single artifact. Only the Pages build of the workspace links to the handbook; a standalone workspace ZIP doesn't depend on it. Run `python3 public-docs/check-site.py <assembled-site-directory>` from the repository root to repeat the link check. The private package inspector is never included.

## Nimbus integration and publication checks

The landing-page walkthrough uses a source-adapted [Nimbus Steps](src/components/nimbus/UPSTREAM.md) component. Its numbered instructions render as HTML without additional client JavaScript. The three Markdown guides also have static `guides/<guide>/index.md` counterparts and a `llms.txt` index. Both formats come from the same content collection. Starlight remains the only router; there is no Cloudflare service or AI endpoint.

When diagnosing publication, distinguish three checks:

1. `npm run build` creates the Starlight routes, static Markdown, and Pagefind assets. `check-site.py` then validates the assembled project path, the Markdown index and the expected sample file difference.
2. A successful Actions **site** job confirms GitHub received the artifact, not that Pages served it.
3. Inspect the **deploy** job and `github-pages` environment. An environment branch restriction requires approval from the repository owner; do not disable all protection rules. Use the successful deployment's environment URL and append `docs/` to open the handbook.
