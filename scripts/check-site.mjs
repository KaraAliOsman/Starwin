import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
async function walk(dir) {
  const files = [];
  for (const entry of await fs.readdir(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(file)); else files.push(file);
  }
  return files;
}
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|#39);/g, entity => ({'&amp;':'&','&quot;':'"','&apos;':"'",'&#39;':"'",'&lt;':'<','&gt;':'>'})[entity]);
const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return decode(match?.[1] ?? match?.[2] ?? '');
};
const meta = (html, key) => [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]).find(tag => attr(tag, 'name') === key || attr(tag, 'property') === key) || '';
const link = (html, rel) => [...html.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]).find(tag => attr(tag, 'rel') === rel) || '';
const files = await walk(root), fileSet = new Set(files), htmls = files.filter(file => file.endsWith('.html'));
const home = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const production = new URL(attr(link(home, 'canonical'), 'href'));
assert(production.protocol === 'https:' && !/^(localhost|127\.0\.0\.1)$/.test(production.hostname), 'El build debe usar el dominio público HTTPS.');
if (process.env.PUBLIC_SITE_URL || process.env.SITE_URL) assert.equal(production.origin, new URL(process.env.PUBLIC_SITE_URL || process.env.SITE_URL).origin, 'El dominio del build no coincide con la configuración.');

const pages = new Map(), titles = new Set(), descriptions = new Set(), canonicals = new Set();
let schemas = 0, links = 0, anchors = 0, breadcrumbLists = 0;
const routeFor = file => {
  const relative = path.relative(root, file).replaceAll(path.sep, '/');
  return relative === 'index.html' ? '/' : relative.endsWith('/index.html') ? `/${relative.slice(0, -10)}` : `/${relative}`;
};
const localFile = pathname => {
  let target = path.resolve(root, '.' + decodeURIComponent(pathname));
  assert(target === root || target.startsWith(root + path.sep), `Ruta fuera del build: ${pathname}`);
  if (pathname.endsWith('/')) target = path.join(target, 'index.html');
  return target;
};

for (const file of htmls) {
  const html = await fs.readFile(file, 'utf8'), label = path.relative(root, file), route = routeFor(file);
  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || '').trim();
  const description = attr(meta(html, 'description'), 'content').trim();
  assert(title, `${label}: falta título`); assert(!titles.has(title), `${label}: título repetido`); titles.add(title);
  assert(description, `${label}: falta descripción`); assert(!descriptions.has(description), `${label}: descripción repetida`); descriptions.add(description);
  assert(/<html\b[^>]*lang="es-CL"/.test(html), `${label}: idioma`);
  const canonical = new URL(attr(link(html, 'canonical'), 'href'));
  assert.equal(canonical.origin, production.origin, `${label}: dominio canonical divergente`);
  assert.equal(canonical.pathname, route, `${label}: canonical debe apuntar a su ruta final`);
  assert(!canonical.search && !canonical.hash, `${label}: canonical con parámetros`);
  assert(!canonicals.has(canonical.href), `${label}: canonical duplicado`); canonicals.add(canonical.href);
  assert.equal(attr(meta(html, 'og:url'), 'content'), canonical.href, `${label}: og:url divergente`);
  assert.equal(attr(meta(html, 'og:title'), 'content'), title, `${label}: og:title divergente`);
  const robots = attr(meta(html, 'robots'), 'content');
  assert(robots, `${label}: falta directiva robots`);
  const noindex = /(?:^|,)\s*noindex\b/.test(robots);
  if (route === '/404.html') assert(noindex, 'La página 404 debe ser noindex.');
  if (route !== '/404.html') assert(!noindex, `${label}: una página pública está marcada noindex`);
  const ogImage = new URL(attr(meta(html, 'og:image'), 'content'));
  assert.equal(ogImage.origin, production.origin, `${label}: imagen social externa sin procedencia`);
  assert(fileSet.has(localFile(ogImage.pathname)), `${label}: imagen social inexistente`);
  assert(!/>[^<]*\bIVA\b[^<]*</i.test(html), `${label}: texto de precios no permitido`);
  if (!route.startsWith('/cotizador/')) assert.equal((html.match(/<h1\b/g) || []).length, 1, `${label}: debe tener un h1`);

  const blocks = [];
  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) {
    const schema = JSON.parse(match[1]); assert.equal(schema['@context'], 'https://schema.org', `${label}: contexto JSON-LD`);
    blocks.push(...(schema['@graph'] || [schema])); schemas++;
  }
  const business = blocks.find(schema => schema['@type'] === 'HomeAndConstructionBusiness');
  assert(business, `${label}: falta entidad del negocio`);
  assert.equal(business['@id'], new URL('/#empresa', production).href, `${label}: identidad negocio`);
  assert.equal(business.telephone, '+56966003771', `${label}: teléfono negocio`);
  assert.equal(business.email, 'starwinchile@gmail.com', `${label}: correo negocio`);
  assert.equal(business.address?.streetAddress, 'Pedro de Valdivia 733', `${label}: dirección negocio`);
  assert.equal(business.address?.addressLocality, 'Concepción', `${label}: ciudad negocio`);
  assert(!business.aggregateRating && !business.review, `${label}: no insertar valoraciones propias sin evidencia`);
  const website = blocks.find(schema => schema['@type'] === 'WebSite');
  const webpage = blocks.find(schema => schema['@type'] === 'WebPage');
  assert.equal(website?.['@id'], new URL('/#sitio', production).href, `${label}: falta identidad del sitio`);
  assert.equal(webpage?.url, canonical.href, `${label}: WebPage no coincide con canonical`);
  assert.equal(webpage?.isPartOf?.['@id'], website['@id'], `${label}: página sin relación al sitio`);
  for (const schema of blocks) {
    if (schema['@type'] === 'BreadcrumbList') {
      breadcrumbLists++;
      assert(schema.itemListElement.length >= 2, `${label}: breadcrumb incompleto`);
      schema.itemListElement.forEach((item, index) => {
        assert.equal(item.position, index + 1, `${label}: posiciones breadcrumb`);
        assert(item.name?.trim(), `${label}: breadcrumb vacío`);
        const itemUrl = new URL(item.item);
        assert.equal(itemUrl.origin, production.origin, `${label}: breadcrumb externo`);
        assert(fileSet.has(localFile(itemUrl.pathname)), `${label}: destino breadcrumb inexistente`);
      });
    }
    if (schema['@type'] === 'BlogPosting') {
      assert.equal(schema.mainEntityOfPage, canonical.href, `${label}: artículo canonical divergente`);
      assert(schema.author && schema.publisher, `${label}: artículo sin autor/editor`);
    }
  }
  pages.set(file, {html, route, canonical: canonical.href, noindex, ids: new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => decode(match[1])))});
}

for (const [file, page] of pages) {
  const label = path.relative(root, file);
  for (const match of page.html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = decode(match[1]);
    if (!value.startsWith('/') && !value.startsWith('#')) continue;
    if (value.startsWith('//') || value.startsWith('/api/')) continue;
    const url = new URL(value, page.canonical), target = localFile(url.pathname);
    assert(fileSet.has(target), `${label}: falta ${value}`); links++;
    if (url.hash && pages.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert(pages.get(target).ids.has(id), `${label}: ancla inexistente ${value}`); anchors++;
    }
  }
  for (const match of page.html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of decode(match[1]).split(',')) {
      const src = candidate.trim().split(/\s+/)[0];
      if (src.startsWith('/') && !src.startsWith('//')) assert(fileSet.has(localFile(new URL(src, production).pathname)), `${label}: srcset inexistente ${src}`);
    }
  }
}

for (const required of ['sitemap-index.xml', 'sitemap-0.xml', 'robots.txt', 'rss.xml', 'llms.txt', '_redirects', 'images/og-starwin.jpg']) assert(fileSet.has(path.join(root, required)), `Falta ${required}`);
const sitemapFiles = files.filter(file => /sitemap-\d+\.xml$/.test(file));
const sitemapUrls = new Set();
for (const file of sitemapFiles) {
  const xml = await fs.readFile(file, 'utf8');
  for (const match of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const url = decode(match[1]);
    assert(!sitemapUrls.has(url), `Sitemap: URL duplicada ${url}`); sitemapUrls.add(url);
    assert(canonicals.has(url), `Sitemap: URL sin canonical público ${url}`);
  }
}
for (const page of pages.values()) assert.equal(sitemapUrls.has(page.canonical), !page.noindex, `Sitemap: inclusión incorrecta ${page.route}`);
const robots = await fs.readFile(path.join(root, 'robots.txt'), 'utf8');
assert(robots.includes(new URL('/sitemap-index.xml', production).href), 'robots.txt debe señalar el sitemap del dominio configurado.');
assert(!/^Disallow:\s*\/\s*$/m.test(robots), 'robots.txt bloquea el sitio público.');

const redirects = (await fs.readFile(path.join(root, '_redirects'), 'utf8')).split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => line.split(/\s+/));
const redirectSources = new Set();
for (const [from, to, status] of redirects) {
  assert(from.startsWith('/') && to.startsWith('/'), `Redirección local inválida: ${from}`);
  assert(status === '301' || status === '308', `Redirección sin estado permanente: ${from}`);
  assert(!redirectSources.has(from), `Redirección repetida: ${from}`); redirectSources.add(from);
  const target = new URL(to, production);
  assert(fileSet.has(localFile(target.pathname)), `Redirección sin destino: ${from} → ${to}`);
  if (target.hash) assert(pages.get(localFile(target.pathname))?.ids.has(decodeURIComponent(target.hash.slice(1))), `Redirección con ancla inexistente: ${to}`);
}
for (const [, to] of redirects) assert(!redirectSources.has(to), `Cadena de redirecciones innecesaria: ${to}`);
// GitHub Pages also exposed legacy .html pages at their extensionless URLs.
for (const [from, to] of redirects.filter(([from]) => from.endsWith('.html'))) {
  const stem = from.slice(0, -5);
  if (stem === '/index' || to === stem + '/') continue;
  for (const variant of [stem, stem + '/']) {
    assert(redirects.some(([source, target]) => source === variant && target === to), `Falta la variante histórica ${variant} → ${to}`);
  }
}
for (const legacy of ['/blog-comparativa-materiales', '/blog-comparativa-materiales/']) {
  assert(redirects.some(([from, to, status]) => from === legacy && to === '/blog/pvc-o-aluminio/' && status === '301'), `Falta recuperar la URL histórica detectada en Search Console: ${legacy}`);
}

assert(!home.includes('component-export="default"'), 'La portada no debe hidratar React sin necesidad.');
const report = {
  date: new Date().toISOString(), domain: production.origin, pages: htmls.length,
  structuredDataBlocks: schemas, breadcrumbLists, localLinksAndAssets: links, validAnchors: anchors,
  sitemapUrls: sitemapUrls.size, permanentMigrationRules: redirects.length,
  uniqueTitles: true, uniqueDescriptions: true, selfReferencingCanonicals: true,
  sitemapMatchesIndexablePages: true, staticMarketingHTML: true,
  limitation: 'Verificación del build local. No acredita indexación, posiciones, recepción de correo ni Core Web Vitals de usuarios reales.',
};
await fs.mkdir('verificacion', {recursive: true});
await fs.writeFile('verificacion/seo-enlaces.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
