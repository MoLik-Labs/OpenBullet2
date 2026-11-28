# Publish the browser-local edition

The `Publish Molik Public Web to Pages` workflow builds an allowlisted static artifact with `scripts/package-public.py`. The same artifact includes the Astro Starlight handbook and Pagefind index at `docs/`. It does not publish the repository, native backend, package directory or a Docker image. Site assets use relative URLs so they resolve under the repository's `/OpenBullet2/` project path.

This repository uses **Settings → Pages → Build and deployment → GitHub Actions**. Keep the `github-pages` environment restricted to `master`. Pull requests validate and upload the artifact without deploying. After review and merge, the push to `master` builds and deploys it. A manual run on `master` can also retry publication.

A green **site** job means the artifact was built. A green **deploy** job, with the environment URL, means GitHub accepted the deployment. Open that URL and select two local manifests; no credentials or server-side inspection service should be requested.
