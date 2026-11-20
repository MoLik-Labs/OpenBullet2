# Publish the browser-local edition

The `Publish Molik Public Web to Pages` workflow builds an allowlisted static artifact with `scripts/package-public.py`. It does not publish the repository, native backend, package directory or a Docker image. Site assets use relative URLs so they resolve under the repository's `/OpenBullet2/` project path.

For this repository, choose **Settings → Pages → Build and deployment → Source → GitHub Actions**. If the `github-pages` environment restricts deployments, explicitly allow the publishing branch under **Settings → Environments → github-pages**; retain any existing review requirements. Subsequent matching pushes trigger the workflow. Re-run a failed deployment after enabling Pages. Once the site is promoted to `master`, remove the temporary branch from the trigger.

A green **site** job means the artifact was built. A green **deploy** job, with the environment URL, means GitHub accepted the deployment. Open that URL and select two local manifests; no credentials or server-side inspection service should be requested.
