import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Pages publishes the workspace at /<repo>/ and this site one level below it.
const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'MoLik-Labs/OpenBullet2').split('/');
export default defineConfig({
  site: `https://${owner.toLowerCase()}.github.io`,
  base: `/${repo}/docs`,
  trailingSlash: 'always',
  integrations: [starlight({
    title: 'Molik Handbook',
    description: 'Practical guides to using Molik Public Web with local files.',
    favicon: '/mark.svg',
    sidebar: [
      { label: 'Start here', items: [{ label: 'Overview', slug: '' }] },
      { label: 'Release checks', items: [ {slug:'guides/compare-manifests'}, {slug:'guides/verify-checksum'} ] },
      { label: 'Reference', items: [{slug:'guides/privacy-and-limits'}] },
    ],
    customCss: ['./src/styles/brand.css'],
  })],
});
