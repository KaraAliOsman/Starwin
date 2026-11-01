import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

export const ORIGIN = 'https://starwinpvc.cl';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const STATE = '.cache/indexnow-production.json';

export function publicUrl(value) {
  const url = new URL(value);
  if (url.origin !== ORIGIN || url.username || url.password || url.search || url.hash || url.pathname === '/api' || url.pathname.startsWith('/api/')) {
    throw Error('IndexNow solo puede notificar URL públicas y canónicas de Starwin.');
  }
  return url.href;
}

export function sitemapLocations(xml) {
  if (!/<(?:sitemapindex|urlset)\b/.test(xml)) throw Error('Sitemap XML no reconocido.');
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(([, value]) => publicUrl(value.replaceAll('&amp;', '&')));
}

// Ignore code and presentation changes; retain visible text, metadata, links,
// image sources/alt text and structured data, which affect search discovery.
export function contentFingerprint(html) {
  // Cloudflare's public email obfuscation uses a fresh XOR key per response.
  // Compare the public address, not that transient representation.
  const email = hex => {
    if (hex.length < 4 || hex.length % 2) return null;
    const bytes = Uint8Array.from(hex.match(/../g), pair => Number.parseInt(pair, 16));
    try { return new TextDecoder('utf-8', {fatal: true}).decode(bytes.slice(1).map(byte => byte ^ bytes[0])); }
    catch { return null; }
  };
  html = html.replace(/href=(["'])\/cdn-cgi\/l\/email-protection#([a-f0-9]+)\1/gi, (tag, quote, hex) => {
    const decoded = email(hex); return decoded === null ? tag : `href=${quote}mailto:${decoded}${quote}`;
  }).replace(/<span\b[^>]*data-cfemail=(["'])([a-f0-9]+)\1[^>]*>[^]*?<\/span>/gi, (tag, quote, hex) => email(hex) ?? tag);
  const attrs = (tag) => [...tag.matchAll(/\b(?:name|property|content|href|src|srcset|alt)\s*=\s*(?:"[^"]*"|'[^']*')/gi)].map(m => m[0]).join(' ');
  const metadata = [...html.matchAll(/<(?:meta|img|a|link)\b[^>]*>/gi)]
    .filter(m => !/^<link\b/i.test(m[0]) || /\brel=["'](?:canonical|alternate)["']/i.test(m[0]))
    .map(m => attrs(m[0])).join('\n');
  const content = html.replace(/<!--[^]*?-->/g, '')
    .replace(/<style\b[^>]*>[^]*?<\/style>/gi, '')
    .replace(/<script\b([^>]*)>([^]*?)<\/script>/gi, (_, attributes, body) => /application\/ld\+json/i.test(attributes) ? body : '')
    .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(content + '\n' + metadata).digest('hex');
}

export function changedUrls(current, previous = {}) {
  const urls = new Set([...Object.keys(current), ...Object.keys(previous)]);
  return [...urls].filter(url => current[url] !== previous[url]).map(publicUrl).sort();
}

export function notificationPlan(current, saved) {
  // The v1 fingerprint included rotating Cloudflare email links. Rebase only
  // existing URLs once; additions and removals still produce notifications.
  const previous = saved?.version === 1
    ? Object.fromEntries(Object.entries(saved.pages).map(([url, hash]) => [url, current[url] ?? hash]))
    : saved?.pages || {};
  return {urls: changedUrls(current, previous), baselineMigration: saved?.version === 1 ? 'v1_to_v2' : null};
}

async function get(url) {
  const response = await fetch(publicUrl(url), {
    redirect: 'manual', signal: AbortSignal.timeout(20000),
    headers: {'Cache-Control': 'no-cache', 'User-Agent': 'Starwin-Publication-Check/1.0'},
  });
  if (response.status !== 200) throw Error(`HTTP ${response.status} al verificar ${url}`);
  return response;
}

async function waitForDeployment(revision) {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw Error('Identificador de publicación inválido.');
  for (let attempt = 0; attempt < 30; attempt++) {
    const response = await fetch(ORIGIN + '/build-revision.txt', {headers: {'Cache-Control': 'no-cache'}, signal: AbortSignal.timeout(15000)});
    if (response.ok && (await response.text()).trim() === revision) return;
    if (attempt === 29) throw Error('La revisión esperada aún no está publicada. No se notificaron cambios.');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

async function listPages() {
  const pending = [ORIGIN + '/sitemap-index.xml'], visited = new Set(), urls = new Set();
  while (pending.length) {
    const url = pending.shift();
    if (visited.has(url)) continue;
    if (visited.size >= 20) throw Error('Demasiados sitemaps.');
    visited.add(url);
    const xml = await (await get(url)).text();
    const locations = sitemapLocations(xml);
    if (/<sitemapindex\b/.test(xml)) pending.push(...locations);
    else for (const location of locations) urls.add(location);
  }
  if (!urls.size || urls.size > 1000) throw Error('Cantidad de páginas inesperada.');
  return [...urls].sort();
}

export async function notify(urls, key, fetcher = fetch) {
  if (!/^[a-f0-9]{64}$/.test(key)) throw Error('Archivo de verificación IndexNow inválido.');
  if (!urls.length || urls.length > 10000) throw Error('Cantidad de notificaciones inválida.');
  const response = await fetcher(ENDPOINT, {
    method: 'POST', signal: AbortSignal.timeout(30000),
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    body: JSON.stringify({host: new URL(ORIGIN).host, key, keyLocation: ORIGIN + '/indexnow-key.txt', urlList: urls.map(publicUrl)}),
  });
  if (![200, 202].includes(response.status)) throw Error(`IndexNow rechazó el aviso: HTTP ${response.status}. No se actualizó el registro local.`);
  return {httpStatus: response.status, state: response.status === 200 ? 'received' : 'received_pending_key_verification', indexed: 'not_verified'};
}

export async function main() {
  const submit = process.argv.includes('--submit');
  const revision = process.env.INDEXNOW_EXPECTED_REVISION;
  if (revision) await waitForDeployment(revision);
  const key = (await fs.readFile('public/indexnow-key.txt', 'utf8')).trim();
  if (!/^[a-f0-9]{64}$/.test(key)) throw Error('Archivo de verificación IndexNow inválido.');
  if (submit && (await (await get(ORIGIN + '/indexnow-key.txt')).text()).trim() !== key) throw Error('El archivo público de verificación no coincide.');
  let saved;
  try {
    saved = JSON.parse(await fs.readFile(STATE, 'utf8'));
    if (saved.origin !== ORIGIN || ![1, 2].includes(saved.version) || !saved.pages || typeof saved.pages !== 'object') throw Error('Registro de notificaciones incompatible.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const urls = await listPages(), current = {};
  for (const url of urls) {
    const response = await get(url), html = await response.text();
    if (/\bnoindex\b/i.test(response.headers.get('x-robots-tag') || '') || /<meta[^>]*content=["'][^"']*noindex/i.test(html)) throw Error(`Página no indexable dentro del sitemap: ${url}`);
    current[url] = contentFingerprint(html);
  }
  // A newer deployment could replace production while pages are being read.
  if (revision && (await (await get(ORIGIN + '/build-revision.txt')).text()).trim() !== revision) throw Error('Producción cambió durante la comprobación. No se notificó.');
  const {urls: changed, baselineMigration} = notificationPlan(current, saved);
  const report = {date: new Date().toISOString(), origin: ORIGIN, revision: revision || null, mode: submit ? 'submit' : 'dry_run', pages: urls.length, changed: changed.length, urls: changed, baselineMigration, result: null};
  if (submit && changed.length) report.result = await notify(changed, key);
  if (submit) {
    await fs.mkdir(path.dirname(STATE), {recursive: true});
    await fs.writeFile(STATE, JSON.stringify({version: 2, origin: ORIGIN, date: report.date, pages: current}, null, 2));
  }
  await fs.mkdir('verificacion/indexnow', {recursive: true});
  await fs.writeFile('verificacion/indexnow/ultimo-envio.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => {console.error(error.message); process.exitCode = 1;});
}
