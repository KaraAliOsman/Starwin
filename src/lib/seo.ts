import {site,serviceAreaSchema} from '../config/site';

type JsonLd = Record<string, unknown>;
export interface BreadcrumbItem {name: string; href: string;}
export interface PageSEOInput {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  noindex?: boolean;
  schema?: object | object[];
}

/** Public routes have one slash-terminated canonical; tracking never creates a new page. */
export function canonicalUrl(pathname = '/'): string {
  const url = new URL(pathname, site.url);
  if (url.origin !== new URL(site.url).origin) throw new Error('La URL canónica debe pertenecer a Starwin.');
  url.search = '';
  url.hash = '';
  if (url.pathname.endsWith('/index.html')) url.pathname = url.pathname.slice(0, -10);
  if (url.pathname === '/404/' || url.pathname === '/404') url.pathname = '/404.html';
  if (!url.pathname.endsWith('/') && !/\.[a-z\d]+$/i.test(url.pathname)) url.pathname += '/';
  return url.href;
}

export const businessId = new URL('/#empresa', site.url).href;
export const websiteId = new URL('/#sitio', site.url).href;

export function businessSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': businessId,
    name: site.businessName,
    alternateName: site.name,
    url: canonicalUrl('/'),
    telephone: site.phoneRaw,
    email: site.email,
    image: new URL('/images/og-starwin.jpg', site.url).href,
    logo: new URL('/starwin-logo.png', site.url).href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address,
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
    },
    areaServed: serviceAreaSchema(),
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:30',
    }],
    sameAs: [site.instagram, site.facebook],
  };
}

export function buildPageSEO({title, description, pathname, image = '/images/og-starwin.jpg', noindex = false, schema = []}: PageSEOInput) {
  const canonical = canonicalUrl(pathname);
  const imageUrl = new URL(image, site.url).href;
  const schemas: object[] = [
    businessSchema(),
    {
      '@context': 'https://schema.org', '@type': 'WebSite', '@id': websiteId,
      name: site.name, alternateName: site.businessName, url: canonicalUrl('/'),
      inLanguage: site.locale, publisher: {'@id': businessId},
    },
    {
      '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${canonical}#pagina`,
      url: canonical, name: title, description, inLanguage: site.locale,
      isPartOf: {'@id': websiteId}, about: {'@id': businessId},
    },
    ...(Array.isArray(schema) ? schema : [schema]),
  ];
  return {canonical, imageUrl, robots: noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large', schemas};
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: canonicalUrl(item.href),
    })),
  };
}

/** JSON-LD stays data even when a future editorial string contains an HTML delimiter. */
export function serializeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
