# Molik Handbook

The handbook is an Astro Starlight static site. The workspace stays at the Pages project root; the handbook and its Pagefind search index live under `docs/`. Search runs locally after the index is downloaded. No hosted search account, third-party fonts, or API is required.

Use Node.js 24 and npm. From `public-docs/`, run `npm ci && npm run dev` and visit the `/OpenBullet2/docs/` path shown by Astro. `npm run build` produces `dist/`. Edit Markdown or MDX in `src/content/docs/` and register new guides in the task-based sidebar in `astro.config.mjs`.

For production, `.github/workflows/public-pages.yml` builds and assembles both sites, checks relative links and anchors, and deploys a single artifact. Only the Pages build of the workspace links to the handbook; a standalone workspace ZIP doesn't depend on it. Run `python3 public-docs/check-site.py <assembled-site-directory>` from the repository root to repeat the link check. The private package inspector is never included.
