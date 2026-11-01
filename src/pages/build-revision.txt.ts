import type {APIRoute} from 'astro';

export const prerender = true;
// Public deployment identifier, used to notify search engines only after publication.
export const GET: APIRoute = () => new Response(
  (process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || 'local') + '\n',
  {headers: {'Content-Type': 'text/plain; charset=utf-8'}},
);
