import type {APIRoute} from 'astro';
import {site} from '../config/site';

export const prerender = true;
export const GET: APIRoute = () => new Response([
  'User-agent: *',
  'Allow: /',
  'Disallow: /api/',
  '',
  `Sitemap: ${new URL('/sitemap-index.xml', site.url).href}`,
  '',
].join('\n'), {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
