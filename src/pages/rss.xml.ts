import type {APIRoute} from 'astro';
import {articles} from '../data/articles';
import {site,absolute} from '../config/site';
const xml=(s:string)=>s.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export const GET:APIRoute=()=>new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Guías Starwin</title><link>${site.url}/blog/</link><description>Guías sobre ventanas de PVC, termopanel y proyectos en Concepción y toda la Región del Biobío.</description><language>es-cl</language>${articles.map(a=>`<item><title>${xml(a.title)}</title><link>${absolute(`/blog/${a.slug}/`)}</link><guid>${absolute(`/blog/${a.slug}/`)}</guid><description>${xml(a.description)}</description><pubDate>Mon, 19 Oct 2026 12:00:00 GMT</pubDate></item>`).join('')}</channel></rss>`,{headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
