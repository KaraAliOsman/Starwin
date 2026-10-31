import type { PanelType, WindowPanel } from './pricing/types';

export const PANEL_OPENINGS: {id:PanelType;name:string}[] = [
  {id:'fixed',name:'Fijo'}, {id:'casement-left',name:'Abatible · bisagras izquierda'},
  {id:'casement-right',name:'Abatible · bisagras derecha'},
  {id:'tilt-turn-left',name:'Oscilobatiente · izquierda'},
  {id:'tilt-turn-right',name:'Oscilobatiente · derecha'}, {id:'awning',name:'Proyectante'},
];
export const FRAME_MM=60, DIVIDER_MM=70, MIN_PANE_MM=160, MAX_PANES=16;
export type Rect={x:number;y:number;w:number;h:number};
export type PanelLayout={panel:WindowPanel;nominal:Rect;aperture:Rect;path:string;axis?:number};
export const panelName=(type:PanelType)=>PANEL_OPENINGS.find(p=>p.id===type)?.name??'Fijo';
export const isLeaf=(panel:WindowPanel)=>panel.splitType==='none';

/** Strict bounded tree validation; sliding topology remains a factory preset. */
export function validPanelTree(tree:unknown):tree is WindowPanel {
  const ids=new Set<string>();let leaves=0,nodes=0;
  function walk(value:unknown,depth:number):boolean {
    if(!value||typeof value!=='object'||depth>6||++nodes>31)return false;
    const p=value as WindowPanel;
    if(typeof p.id!=='string'||!p.id||p.id.length>100||ids.has(p.id)||!PANEL_OPENINGS.some(o=>o.id===p.type)||!Array.isArray(p.children)||!Number.isFinite(p.splitPos)||p.splitPos<=0||p.splitPos>=1)return false;
    ids.add(p.id);
    if(p.splitType==='none')return p.children.length===0&&++leaves<=MAX_PANES;
    return ['horizontal','vertical'].includes(p.splitType)&&p.children.length===2&&p.children.every(c=>walk(c,depth+1));
  }
  return walk(tree,0);
}

/** Nominal spans feed the original pricing ratios. Apertures subtract visual
 * members so 2D, 3D and touch selection share the same divider centre lines. */
export function panelLayout(tree:WindowPanel,width:number,height:number):PanelLayout[] {
  const output:PanelLayout[]=[];
  function walk(panel:WindowPanel,nominal:Rect,aperture:Rect,path:string) {
    const entry:PanelLayout={panel,nominal,aperture,path};output.push(entry);
    if(isLeaf(panel))return;
    const vertical=panel.splitType==='vertical';
    const axis=(vertical?nominal.x:nominal.y)+(vertical?nominal.w:nominal.h)*panel.splitPos;
    entry.axis=axis;const half=DIVIDER_MM/2;
    const firstNominal=vertical?{...nominal,w:nominal.w*panel.splitPos}:{...nominal,h:nominal.h*panel.splitPos};
    const secondNominal=vertical?{...nominal,x:axis,w:nominal.w*(1-panel.splitPos)}:{...nominal,y:axis,h:nominal.h*(1-panel.splitPos)};
    const firstAperture=vertical?{...aperture,w:axis-half-aperture.x}:{...aperture,h:axis-half-aperture.y};
    const secondAperture=vertical?{...aperture,x:axis+half,w:aperture.x+aperture.w-axis-half}:{...aperture,y:axis+half,h:aperture.y+aperture.h-axis-half};
    walk(panel.children[0]!,firstNominal,firstAperture,[path,vertical?'izquierda':'arriba'].filter(Boolean).join(' / '));
    walk(panel.children[1]!,secondNominal,secondAperture,[path,vertical?'derecha':'abajo'].filter(Boolean).join(' / '));
  }
  walk(tree,{x:0,y:0,w:width,h:height},{x:FRAME_MM,y:FRAME_MM,w:width-2*FRAME_MM,h:height-2*FRAME_MM},'');
  return output;
}
export function validPanelGeometry(tree:WindowPanel,width:number,height:number):boolean {
  return validPanelTree(tree)&&panelLayout(tree,width,height).filter(l=>isLeaf(l.panel)).every(l=>l.aperture.w>=MIN_PANE_MM-0.01&&l.aperture.h>=MIN_PANE_MM-0.01);
}
export function mapPanel(tree:WindowPanel,id:string,change:(p:WindowPanel)=>WindowPanel):WindowPanel {
  if(tree.id===id)return change(tree);
  return {...tree,children:tree.children.map(p=>mapPanel(p,id,change))};
}
export function dividePanel(tree:WindowPanel,id:string,axis:'horizontal'|'vertical'):WindowPanel {
  return mapPanel(tree,id,p=>isLeaf(p)?{...p,type:'fixed',splitType:axis,splitPos:.5,children:[{id:`${p.id}-a`,type:'fixed',splitType:'none',splitPos:.5,children:[]},{id:`${p.id}-b`,type:'fixed',splitType:'none',splitPos:.5,children:[]}]}:p);
}
export function divisionSummary(tree:WindowPanel|undefined):string {
  if(!tree)return '';
  let horizontal=0,vertical=0;function walk(p:WindowPanel){if(p.splitType==='horizontal')horizontal++;if(p.splitType==='vertical')vertical++;p.children.forEach(walk);}walk(tree);
  return [horizontal?`${horizontal} ${horizontal===1?'travesaño horizontal':'travesaños horizontales'}`:'',vertical?`${vertical} ${vertical===1?'división vertical':'divisiones verticales'}`:''].filter(Boolean).join(' · ');
}
