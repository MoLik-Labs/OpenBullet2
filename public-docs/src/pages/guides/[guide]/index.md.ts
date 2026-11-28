import { getCollection } from 'astro:content';
import type { GetStaticPaths, APIRoute } from 'astro';

// Keep the Markdown beside its HTML page so relative links keep their meaning.
export const getStaticPaths = (async () => {
  const guides = await getCollection('docs', ({ id, data }) => id.startsWith('guides/') && !data.draft);
  return guides.map(({ id, body, data }) => ({
    params: { guide: id.slice('guides/'.length) },
    props: { markdown: `# ${data.title}\n\n${body?.trim() ?? ''}\n` },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => new Response(props.markdown);
