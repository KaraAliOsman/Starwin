/** Only include installations supported by a Starwin post and its actual photos. */
export type WorkPhoto = {src:string; width:number; height:number; alt:string};
export type Work = {
  slug:string;
  title:string;
  description:string;
  category:'Ventanas'|'Puertas'|'Cierres';
  location?:string;
  sourceUrl:string;
  photos:WorkPhoto[];
};

// No stock photographs or unverified projects are used to populate this page.
export const works:Work[] = [];
