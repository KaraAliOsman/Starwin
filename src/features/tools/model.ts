import {products} from '../../data/products';

export const toolProducts = products.map(product => ({...product, facts: ({
 sliding2: {space:'Sin giro hacia el interior.', ventilation:'Apertura por deslizamiento; depende del reparto de hojas.', cleaning:'Comprueba el acceso a ambas caras del vidrio.', closure:'Cierre sobre rieles. Compara con un sistema de presión si priorizas el sellado.'},
 casement: {space:'Reserva el recorrido lateral de la hoja.', ventilation:'Apertura lateral amplia.', cleaning:'El acceso depende del sentido de apertura y la ubicación.', closure:'Cierre a presión sobre juntas perimetrales.'},
 tilt: {space:'Reserva el giro lateral, además de la inclinación.', ventilation:'Giro lateral o inclinación superior.', cleaning:'En modo lateral facilita el acceso, según la instalación.', closure:'Cierre a presión; dos posiciones de apertura.'},
 awning: {space:'Proyecta hacia fuera. Revisa obstáculos exteriores.', ventilation:'Apertura inferior hacia el exterior.', cleaning:'Revisa cómo accederás a la cara exterior.', closure:'Cierre perimetral. Debe cerrarse con lluvia y viento.'},
 fixed: {space:'Sin recorrido de hoja.', ventilation:'No proporciona ventilación.', cleaning:'Necesita acceso independiente a ambas caras.', closure:'Paño sin partes móviles.'},
 } as const)[product.query]}));

export const tools = [
 {slug:'elegir-ventana',name:'Encuentra tu apertura',description:'Tres respuestas para orientar tu elección.',image:'tilt',action:'Encontrar mi ventana'},
 {slug:'comparar-ventanas',name:'Compara ventanas',description:'Mira dos aperturas lado a lado.',image:'casement',action:'Comparar aperturas'},
 {slug:'medir-ventanas',name:'Medidas y m²',description:'Reúne varias ventanas y descarga tu ficha en PDF.',image:'fixed',action:'Medir mis ventanas'},
 {slug:'calculadora-condensacion',name:'¿Por qué se empaña?',description:'Calcula el punto de rocío con temperatura y humedad.',image:'material-glass',action:'Revisar condensación'},
] as const;

/** Plain decimal input only. Accepts the comma used on Spanish phone keyboards. */
export function decimal(value:string):number|null {
 const text=value.trim();
 if(!/^-?\d+(?:[.,]\d+)?$/.test(text))return null;
 const n=Number(text.replace(',','.'));return Number.isFinite(n)?n:null;
}
export function cmToMm(value:string):number|null {
 const n=decimal(value);return n!==null&&n>=.1&&n<=1000?Math.round(n*10):null;
}
export const formatNumber=(value:number,digits=1)=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:digits}).format(value);
export const formatArea=(value:number)=>new Intl.NumberFormat('es-CL',{minimumFractionDigits:2,maximumFractionDigits:4}).format(value);
export type Measurement={id:string;label:string;widthMm:number;heightMm:number;quantity:number;widths?:number[];heights?:number[]};
export function isMeasurement(value:unknown):value is Measurement {
 if(!value||typeof value!=='object')return false;
 const v=value as Measurement;
 const dimension=(n:number)=>Number.isInteger(n)&&n>=1&&n<=10000;
 return typeof v.id==='string'&&v.id.length>0&&v.id.length<=80&&typeof v.label==='string'&&v.label.length<=80&&dimension(v.widthMm)&&dimension(v.heightMm)&&Number.isInteger(v.quantity)&&v.quantity>=1&&v.quantity<=99&&
  ((v.widths===undefined)===(v.heights===undefined))&&
  (v.widths===undefined||(Array.isArray(v.widths)&&v.widths.length===3&&v.widths.every(dimension)&&Math.min(...v.widths)===v.widthMm))&&
  (v.heights===undefined||(Array.isArray(v.heights)&&v.heights.length===3&&v.heights.every(dimension)&&Math.min(...v.heights)===v.heightMm));
}
export function readMeasurements(raw:string|null):Measurement[]{
 if(!raw)return [];
 try{const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.items)||data.items.length>50)return [];const items=data.items.filter(isMeasurement);return new Set(items.map((v:Measurement)=>v.id)).size===items.length?items:[];}catch{return [];}
}
export const measurementArea=(item:Measurement)=>item.widthMm*item.heightMm*item.quantity/1_000_000;
export const totalArea=(items:Measurement[])=>items.reduce((sum,item)=>sum+item.widthMm*item.heightMm*item.quantity,0)/1_000_000;
export const estimatorLink=(item:Measurement)=>`/cotizador/?width=${item.widthMm/10}&height=${item.heightMm/10}`;

/** August–Roche–Magnus over liquid water, a=17.625 and b=243.04 °C.
 * Source: https://qed.epa.gov/hms/meteorology/humidity/algorithms/
 * UI intentionally limits ambient input to 0–40 °C and 1–100% RH. */
export function dewPoint(temperature:number,humidity:number):number|null {
 if(!Number.isFinite(temperature)||!Number.isFinite(humidity)||temperature<0||temperature>40||humidity<=0||humidity>100)return null;
 const gamma=Math.log(humidity/100)+17.625*temperature/(243.04+temperature);
 return 243.04*gamma/(17.625-gamma);
}
export function recommendOpening(room:string,space:string,priority:string){
 if(!['bedroom','living','bathroom','kitchen'].includes(room)||!['inside','outside','clear'].includes(space)||!['air','seal','light'].includes(priority))return [];
 let keys:string[];
 if(priority==='light')keys=['fixed',space==='inside'?'awning':'tilt'];
 else if(space==='inside')keys=room==='bathroom'?['awning','sliding2']:['sliding2','awning'];
 else if(space==='outside')keys=priority==='seal'?['casement','tilt']:['tilt','casement'];
 else if(room==='bathroom')keys=['awning','tilt'];
 else keys=priority==='seal'?['casement','tilt']:['tilt','casement'];
 return keys.map(key=>toolProducts.find(p=>p.query===key)!);
}
