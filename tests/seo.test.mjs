import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Exercise the production TS helpers with deterministic build-environment values.
function compile(file, dependencies = {}, env = {}) {
  const source = fs.readFileSync(file, 'utf8').replaceAll('import.meta.env', JSON.stringify(env));
  const output = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const exports = {};
  new Function('exports', 'require', 'process', output)(exports, name => {
    assert(name in dependencies, `Dependencia de prueba no prevista: ${name}`);
    return dependencies[name];
  }, {env: {}});
  return exports;
}
const config = compile('src/config/site.ts');
const seo = compile('src/lib/seo.ts', {'../config/site': config});

test('Canonical y sitemap comparten un origen HTTPS sin discrepancias de entorno', () => {
  assert.equal(config.resolveSiteUrl(), 'https://starwinpvc.cl');
  assert.equal(config.resolveSiteUrl(' https://example.cl/ ', 'https://example.cl'), 'https://example.cl');
  assert.equal(config.resolveSiteUrl(undefined, 'https://example.cl/'), 'https://example.cl');
  assert.throws(() => config.resolveSiteUrl('https://a.cl', 'https://b.cl'), /mismo dominio/);
  for (const invalid of ['http://example.cl', 'https://example.cl/blog', 'https://user:secret@example.cl', 'https://example.cl/?q=x', 'https://example.cl/#x']) {
    assert.throws(() => config.resolveSiteUrl(invalid), /dominio HTTPS/);
  }
  const staging = compile('src/config/site.ts', {}, {PUBLIC_SITE_URL: 'https://preview.example.cl/'});
  const stagingSEO = compile('src/lib/seo.ts', {'../config/site': staging});
  assert.equal(stagingSEO.canonicalUrl('/ventanas/'), 'https://preview.example.cl/ventanas/');
  assert.equal(stagingSEO.businessSchema()['@id'], 'https://preview.example.cl/#empresa');
});

test('Tracking, fragmentos e index.html no crean canonical duplicados', () => {
  for (const pathname of ['/ventanas', '/ventanas/', '/ventanas/index.html', '/ventanas/?utm_source=ad#modelos']) {
    assert.equal(seo.canonicalUrl(pathname), 'https://starwinpvc.cl/ventanas/');
  }
  assert.equal(seo.canonicalUrl('/index.html?from=x'), 'https://starwinpvc.cl/');
  assert.equal(seo.canonicalUrl('/404/'), 'https://starwinpvc.cl/404.html');
  assert.throws(() => seo.canonicalUrl('https://otro.cl/'), /pertenecer a Starwin/);
  assert.throws(() => seo.canonicalUrl('//otro.cl/'), /pertenecer a Starwin/);
});

test('Entidad, WebSite, WebPage y contenido específico enlazan a IDs coherentes', () => {
  const extra = {'@context': 'https://schema.org', '@type': 'Service', name: 'Consulta de ventanas'};
  const page = seo.buildPageSEO({title: 'Consulta', description: 'Proyecto de ventanas', pathname: '/contacto?utm_source=x', schema: extra});
  assert.equal(page.canonical, 'https://starwinpvc.cl/contacto/');
  assert.equal(page.imageUrl, 'https://starwinpvc.cl/images/og-starwin.jpg');
  assert.equal(page.schemas.length, 4);
  assert.deepEqual(page.schemas[1].publisher, {'@id': page.schemas[0]['@id']});
  assert.deepEqual(page.schemas[2].isPartOf, {'@id': page.schemas[1]['@id']});
  assert.deepEqual(page.schemas[3], extra);
  assert.equal(seo.buildPageSEO({title: '404', description: 'Página inexistente', pathname: '/404/', noindex: true}).robots, 'noindex,follow');
  assert(!('aggregateRating' in page.schemas[0]));
  assert(!('geo' in page.schemas[0]), 'No inventar coordenadas contradictorias del material anterior.');
});

test('JSON-LD no puede cerrar su script aunque un título contenga HTML', () => {
  const data = {name: '</script><img src=x onerror=alert(1)>', text: 'Uno\u2028dos\u2029tres'};
  const serialized = seo.serializeJsonLd(data);
  assert(!serialized.includes('<'));
  assert(!serialized.includes('\u2028') && !serialized.includes('\u2029'));
  assert.deepEqual(JSON.parse(serialized), data);
});

test('Breadcrumb visible y JSON-LD conservan nombres, orden y rutas finales', () => {
  const items = [{name: 'Inicio', href: '/'}, {name: 'Ventanas', href: '/ventanas'}, {name: 'Pro70', href: '/ventanas/corredera-pro70/'}];
  const schema = seo.breadcrumbSchema(items);
  assert.deepEqual(schema.itemListElement.map(item => item.position), [1, 2, 3]);
  assert.deepEqual(schema.itemListElement.map(item => item.name), items.map(item => item.name));
  assert.equal(schema.itemListElement[1].item, 'https://starwinpvc.cl/ventanas/');
});
