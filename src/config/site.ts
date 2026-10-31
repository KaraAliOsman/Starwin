/** One public origin for canonical URLs, sitemap, feeds and structured data. */
export function resolveSiteUrl(publicUrl?: string, serverUrl?: string): string {
  const normalize = (value: string) => {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('SITE_URL debe ser un dominio HTTPS sin ruta, credenciales ni parámetros.');
    }
    return url.origin;
  };
  const publicOrigin = publicUrl?.trim() ? normalize(publicUrl) : undefined;
  const serverOrigin = serverUrl?.trim() ? normalize(serverUrl) : undefined;
  if (publicOrigin && serverOrigin && publicOrigin !== serverOrigin) {
    throw new Error('PUBLIC_SITE_URL y SITE_URL deben apuntar al mismo dominio.');
  }
  return publicOrigin || serverOrigin || 'https://starwinpvc.cl';
}

export const site = {
  name: 'Starwin',
  businessName: 'Starwin PVC Chile',
  country: 'CL',
  locale: 'es-CL',
  currency: 'CLP',
  url: resolveSiteUrl(import.meta.env?.PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL, import.meta.env?.SITE_URL ?? process.env.SITE_URL),
  city: 'Concepción',
  region: 'Biobío',
  address: 'Pedro de Valdivia 733',
  phone: '+56 9 6600 3771',
  phoneRaw: '+56966003771',
  whatsapp: '56966003771',
  email: 'starwinchile@gmail.com',
  instagram: 'https://www.instagram.com/starwincl/',
  facebook: 'https://www.facebook.com/Starwinchile/',
  hours: 'Lunes a viernes · 09:00 a 18:30',
  serviceAreas: ['Concepción','San Pedro de la Paz','Chiguayante','Talcahuano','Hualpén','Penco','Tomé','Coronel','Lota','Hualqui','Florida','Santa Juana','Los Ángeles','Cabrero','Yumbel','Laja','San Rosendo','Nacimiento','Negrete','Mulchén','Quilaco','Quilleco','Santa Bárbara','Tucapel','Antuco','Alto Biobío','Arauco','Curanilahue','Lebu','Los Álamos','Cañete','Contulmo','Tirúa'],
};
export const serviceAreaSchema = () => [
  {'@type':'AdministrativeArea',name:'Región del Biobío',containedInPlace:{'@type':'Country',name:'Chile'}},
  ...site.serviceAreas.map(name=>({'@type':'City',name,containedInPlace:{'@type':'AdministrativeArea',name:'Región del Biobío'}})),
];
export const wa = (message = 'Hola Starwin, quiero asesoría para mis ventanas de PVC.') => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
export const absolute = (path: string) => new URL(path, site.url).href;

// Una segunda marca se configura por separado: los precios y el contacto de Chile no se reutilizan en Bolivia.
export const marketTemplate = {country:'BO',locale:'es-BO',currency:'BOB',city:'',businessName:'',phone:'',email:'',priceCatalog:null};
