/** Only include installations supported by a Starwin post and its actual photos. */
export type WorkPhoto = {src:string; full:string; srcset:string; width:number; height:number; alt:string};
export type Work = {
  slug:string;
  title:string;
  description:string;
  category:'Ventanas'|'Puertas'|'Cierres';
  location?:string;
  sourceUrl:string;
  photos:WorkPhoto[];
};

// Fotografías verificadas en la galería pública de Starwin; procedencia en cada registro.
export const works:Work[] = [
  {
    "slug": "ventana-fachada",
    "title": "Ventana en fachada",
    "description": "Marco blanco sobre revestimiento horizontal, con persiana exterior.",
    "category": "Ventanas",
    "sourceUrl": "https://www.facebook.com/photo.php?fbid=122161237808837556&set=pb.61575126694834.-2207520000&type=3",
    "photos": [
      {
        "src": "/images/trabajos/obra-8-960.webp",
        "full": "/images/trabajos/obra-8-1600.webp",
        "srcset": "/images/trabajos/obra-8-480.webp 480w, /images/trabajos/obra-8-960.webp 960w, /images/trabajos/obra-8-1600.webp 963w",
        "width": 963,
        "height": 1203,
        "alt": "Marco blanco sobre revestimiento horizontal, con persiana exterior."
      }
    ]
  },
  {
    "slug": "ventana-madera",
    "title": "Acabado madera",
    "description": "Ventana de dos hojas con vista al exterior y acabado de veta madera.",
    "category": "Ventanas",
    "sourceUrl": "https://www.facebook.com/photo.php?fbid=122157445424837556&set=pb.61575126694834.-2207520000&type=3",
    "photos": [
      {
        "src": "/images/trabajos/obra-15-960.webp",
        "full": "/images/trabajos/obra-15-1600.webp",
        "srcset": "/images/trabajos/obra-15-480.webp 480w, /images/trabajos/obra-15-960.webp 960w, /images/trabajos/obra-15-1600.webp 1600w",
        "width": 1638,
        "height": 2048,
        "alt": "Ventana de dos hojas con vista al exterior y acabado de veta madera."
      }
    ]
  },
  {
    "slug": "cierre-interior",
    "title": "Cierre interior",
    "description": "Paños acristalados con perfiles blancos para separar espacios interiores.",
    "category": "Cierres",
    "sourceUrl": "https://www.facebook.com/photo.php?fbid=122159911670837556&set=pb.61575126694834.-2207520000&type=3",
    "photos": [
      {
        "src": "/images/trabajos/obra-11-960.webp",
        "full": "/images/trabajos/obra-11-1600.webp",
        "srcset": "/images/trabajos/obra-11-480.webp 480w, /images/trabajos/obra-11-960.webp 960w, /images/trabajos/obra-11-1600.webp 1600w",
        "width": 2048,
        "height": 1536,
        "alt": "Paños acristalados con perfiles blancos para separar espacios interiores."
      }
    ]
  },
  {
    "slug": "puerta-patio",
    "title": "Salida al patio",
    "description": "Puerta acristalada de dos hojas en acabado madera.",
    "category": "Puertas",
    "sourceUrl": "https://www.facebook.com/photo.php?fbid=122157445394837556&set=pb.61575126694834.-2207520000&type=3",
    "photos": [
      {
        "src": "/images/trabajos/obra-16-960.webp",
        "full": "/images/trabajos/obra-16-1600.webp",
        "srcset": "/images/trabajos/obra-16-480.webp 480w, /images/trabajos/obra-16-960.webp 960w, /images/trabajos/obra-16-1600.webp 1600w",
        "width": 1638,
        "height": 2048,
        "alt": "Puerta acristalada de dos hojas en acabado madera."
      }
    ]
  },
  {
    "slug": "ventana-blanca",
    "title": "Blanco, desde dentro",
    "description": "Vista interior de una ventana blanca de dos hojas.",
    "category": "Ventanas",
    "sourceUrl": "https://www.facebook.com/photo.php?fbid=122156382242837556&set=pb.61575126694834.-2207520000&type=3",
    "photos": [
      {
        "src": "/images/trabajos/obra-25-960.webp",
        "full": "/images/trabajos/obra-25-1600.webp",
        "srcset": "/images/trabajos/obra-25-480.webp 480w, /images/trabajos/obra-25-960.webp 960w, /images/trabajos/obra-25-1600.webp 1200w",
        "width": 1200,
        "height": 1500,
        "alt": "Vista interior de una ventana blanca de dos hojas."
      }
    ]
  },
  {
    "slug": "ventana-cocina",
    "title": "Ventana de cocina",
    "description": "Ventana blanca instalada entre la cocina y un espacio cubierto.",
    "category": "Ventanas",
    "sourceUrl": "https://www.facebook.com/photo.php?fbid=122156381600837556&set=pb.61575126694834.-2207520000&type=3",
    "photos": [
      {
        "src": "/images/trabajos/obra-28-960.webp",
        "full": "/images/trabajos/obra-28-1600.webp",
        "srcset": "/images/trabajos/obra-28-480.webp 480w, /images/trabajos/obra-28-960.webp 960w, /images/trabajos/obra-28-1600.webp 1600w",
        "width": 1600,
        "height": 1200,
        "alt": "Ventana blanca instalada entre la cocina y un espacio cubierto."
      }
    ]
  },
  {
    "slug": "ventana-vista",
    "title": "Una vista enmarcada",
    "description": "Ventana en acabado madera vista desde el interior.",
    "category": "Ventanas",
    "sourceUrl": "https://www.facebook.com/photo.php?fbid=122153005868837556&set=pb.61575126694834.-2207520000&type=3",
    "photos": [
      {
        "src": "/images/trabajos/obra-39-960.webp",
        "full": "/images/trabajos/obra-39-1600.webp",
        "srcset": "/images/trabajos/obra-39-480.webp 480w, /images/trabajos/obra-39-960.webp 960w",
        "width": 960,
        "height": 1200,
        "alt": "Ventana en acabado madera vista desde el interior."
      }
    ]
  }
];
