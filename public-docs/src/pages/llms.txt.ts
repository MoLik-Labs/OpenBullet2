import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = new URL(import.meta.env.BASE_URL.replace(/\/?$/, '/'), site);
  const guides = await getCollection('docs', ({ id, data }) => id.startsWith('guides/') && !data.draft);
  const lines = guides.sort((a,b) => a.id.localeCompare(b.id)).map(({ id, data }) =>
    `- [${data.title}](${new URL(id + '/index.md', base)}): ${data.description}`);
  return new Response(['# Molik Handbook', '', '> Guides for the browser-local release tools.', '', '## Guides', ...lines, ''].join('\n'));
};
