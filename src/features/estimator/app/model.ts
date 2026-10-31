import { calcularPrecio } from './pricing/pricing';
import type { AdvancedVentanaConfig, PanelType, VentanaColor, VentanaVidrio, WindowPanel } from './pricing/types';
import { validPanelGeometry, panelName } from './panels';

export const COLORS: { id: VentanaColor; name: string; hex: string; wood?: boolean }[] = [
  {id:'BLANCO',name:'Blanco',hex:'#f4f3ee'}, {id:'ANTRACITA',name:'Antracita',hex:'#41464b'},
  {id:'NEGRO',name:'Negro',hex:'#202224'}, {id:'NOGAL',name:'Nogal',hex:'#684532',wood:true},
  {id:'ROBLE_DORADO',name:'Roble dorado',hex:'#ba8648',wood:true},
  {id:'WINCHESTER',name:'Winchester',hex:'#9c7756',wood:true},
  {id:'ROBLE_MONTANA',name:'Roble montaña',hex:'#81735f',wood:true},
];
export const GLASSES: { id: VentanaVidrio; name: string }[] = [
  {id:'TERMOPANEL',name:'Termopanel'}, {id:'CONTROL_SOLAR',name:'Control solar'},
  {id:'TRIPLE',name:'Triple vidrio'}, {id:'LAMINADO',name:'Laminado'}, {id:'SIMPLE',name:'Vidrio simple'},
];
export const PRESETS = [
  {id:'sliding2',name:'Corredera Serie Pro70 · 2 hojas',short:'Corredera Pro70',description:'Se deslizan hacia los lados. Aprovecha el espacio.',min:60},
  {id:'mono',name:'Corredera Serie Pro70 · 1 fija + 1 móvil',short:'Corredera Pro70 fija + móvil',description:'Una mitad fija y una hoja que se desliza.',min:60},
  {id:'sliding3',name:'Corredera Serie Pro70 · 3 hojas',short:'Corredera Pro70 triple',description:'Tres hojas para espacios más amplios.',min:90},
  {id:'fixed',name:'Ventana fija',short:'Fija',description:'Luz y vista despejada. No tiene apertura.',min:30},
  {id:'casement',name:'Ventana abatible',short:'Abatible',description:'Abre hacia adentro desde un costado.',min:40},
  {id:'tilt',name:'Ventana oscilobatiente',short:'Oscilobatiente',description:'Apertura lateral y apertura superior para ventilar.',min:40},
  {id:'awning',name:'Ventana proyectante',short:'Proyectante',description:'Abre hacia afuera desde la parte inferior.',min:40},
  {id:'custom',name:'Ventana con travesaños',short:'Ventana combinada',description:'Combina paños fijos y hojas con apertura.',min:60},
] as const;
export type Preset = typeof PRESETS[number]['id'];
export type Extras = AdvancedVentanaConfig['extras'];
export const EXTRA_LABELS: Record<keyof Extras,string> = {mosquitero:'Mosquitero',premarco:'Premarco',ventilacion:'Ventilación',manillaLlave:'Manilla con llave',vidrioOpaco:'Vidrio opaco'};
export type EstimateItem = {id:string;label:string;preset:Preset;widthMm:number;heightMm:number;color:VentanaColor;glass:VentanaVidrio;side:'left'|'right';quantity:number;extras:Extras;panelTree?:WindowPanel};
export const emptyExtras = (): Extras => ({mosquitero:false,premarco:false,ventilacion:false,manillaLlave:false,vidrioOpaco:false});
let sequence=0;
export function newId():string {
  if(typeof globalThis.crypto?.randomUUID==='function')return crypto.randomUUID();
  // LAN previews on a phone can use HTTP, where randomUUID is unavailable.
  const random=globalThis.crypto?.getRandomValues?.(new Uint32Array(2));
  return `sw-${Date.now().toString(36)}-${(++sequence).toString(36)}-${random?Array.from(random,n=>n.toString(36)).join(''):Math.random().toString(36).slice(2)}`;
}
export function defaultItem(): EstimateItem {return {id:newId(),label:'',preset:'fixed',widthMm:1000,heightMm:1000,color:'BLANCO',glass:'TERMOPANEL',side:'left',quantity:1,extras:emptyExtras()};}
export const clp = (value:number) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(value);
export const cm = (mm:number) => new Intl.NumberFormat('es-CL',{maximumFractionDigits:1}).format(mm/10);
export const presetInfo = (id:Preset) => PRESETS.find(p=>p.id===id)!;
export const colorName = (id:VentanaColor) => COLORS.find(c=>c.id===id)!.name;
export const glassName = (id:VentanaVidrio) => GLASSES.find(g=>g.id===id)!.name;
export const designName = (item:EstimateItem) => item.panelTree?(item.panelTree.splitType==='none'?panelName(item.panelTree.type):'Ventana con travesaños'):presetInfo(item.preset).name;
export const itemName = (item:EstimateItem) => item.label.trim() || (item.panelTree?designName(item):presetInfo(item.preset).short);
export const PRICE_NOTE = 'Referencia sujeta a revisión de medidas, configuración y factibilidad.';

function leaf(id:string,type:PanelType):WindowPanel {return {id,type,splitType:'none',splitPos:.5,children:[]};}
/** Canonical preset -> the EXACT tree expected by the original pricing engine. */
export function presetTree(item:EstimateItem):WindowPanel {
  let root:WindowPanel;
  if (item.preset==='sliding2'||item.preset==='mono') root={...leaf('root','sliding'),splitType:'vertical',children:[leaf('p1',item.preset==='mono'?'fixed':'sliding'),leaf('p2','sliding')]};
  else if(item.preset==='sliding3') root={...leaf('root','sliding'),splitType:'vertical',splitPos:1/3,children:[leaf('p1','sliding'),{...leaf('p23','sliding'),splitType:'vertical',children:[leaf('p2','sliding'),leaf('p3','sliding')]}]};
  else root=leaf('p1',['fixed','custom'].includes(item.preset)?'fixed':item.preset==='awning'?'awning':item.preset==='tilt'?`tilt-turn-${item.side}`:`casement-${item.side}`);
  return root;
}
export const isSliding = (item:Pick<EstimateItem,'preset'>)=>['sliding2','sliding3','mono'].includes(item.preset);
export const itemTree=(item:EstimateItem)=>item.panelTree??presetTree(item);
export function priceConfig(item:EstimateItem):AdvancedVentanaConfig {
  return {id:item.id,modules:[{id:'m1',system:isSliding(item)?'SLIDING':'CASEMENT',width:item.widthMm,height:item.heightMm,rootPanel:structuredClone(itemTree(item)),angleWithNext:180}],color:item.color,vidrio:item.glass,extras:{...item.extras},precio:0};
}
export function validateItem(value:unknown):value is EstimateItem {
  if (!value||typeof value!=='object') return false;
  const v=value as EstimateItem;
  const preset=PRESETS.find(p=>p.id===v.preset);
  return !!preset && typeof v.id==='string' && v.id.length>0 && v.id.length<100 && typeof v.label==='string' && v.label.length<=60 &&
    Number.isInteger(v.widthMm) && v.widthMm>=preset.min*10 && v.widthMm<=4000 &&
    Number.isInteger(v.heightMm) && v.heightMm>=300 && v.heightMm<=3000 &&
    (v.panelTree===undefined||(!isSliding(v)&&validPanelGeometry(v.panelTree,v.widthMm,v.heightMm))) &&
    COLORS.some(c=>c.id===v.color) && GLASSES.some(g=>g.id===v.glass) && ['left','right'].includes(v.side) &&
    Number.isInteger(v.quantity) && v.quantity>=1 && v.quantity<=99 && !!v.extras &&
    Object.keys(EXTRA_LABELS).every(k=>typeof v.extras[k as keyof Extras]==='boolean');
}
export function unitPrice(item:EstimateItem):number {
  if(!validateItem(item)) throw new Error('Revisa las medidas y la cantidad de ventanas.');
  const price=calcularPrecio(priceConfig(item)).precio;
  if(!Number.isSafeInteger(price)||price<=0) throw new Error('No se pudo calcular esta ventana.');
  return price;
}
export function quoteLines(items:EstimateItem[]) {return items.map(item=>{const unit=unitPrice(item);return {item,unit,subtotal:unit*item.quantity};});}
export function quoteTotal(items:EstimateItem[]) {const total=quoteLines(items).reduce((sum,line)=>sum+line.subtotal,0);if(!Number.isSafeInteger(total)) throw new Error('El total supera el límite admitido.');return total;}
export function parseCm(raw:string):number|null {
  if(!/^\d{1,3}([.,]\d)?$/.test(raw.trim())) return null;
  const mm=Math.round(Number(raw.trim().replace(',','.'))*10);
  return Number.isSafeInteger(mm)?mm:null;
}
export const STORAGE_KEY='starwin-estimate-v1';
export function readItems(raw:string|null):EstimateItem[] {
  try {const saved=JSON.parse(raw||'null');if(saved?.version!==1||!Array.isArray(saved.items)||saved.items.length>100) return [];
    const items=saved.items.filter(validateItem);const seen=new Set<string>();return items.filter((i:EstimateItem)=>{if(seen.has(i.id))return false;seen.add(i.id);return true;});
  } catch {return [];}
}
export function cleanItems(items:EstimateItem[]):EstimateItem[] {
  // Persist only input fields. Never persist/trust cached prices or totals.
  return items.map(i=>({id:i.id,label:i.label,preset:i.preset,widthMm:i.widthMm,heightMm:i.heightMm,color:i.color,glass:i.glass,side:i.side,quantity:i.quantity,extras:{...i.extras},...(i.panelTree?{panelTree:structuredClone(i.panelTree)}:{})}));
}
