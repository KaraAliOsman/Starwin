import { designName, presetInfo, type EstimateItem, type Preset } from './model';
import type { WindowPanel } from './pricing/types';
export const DESIGNS = [
  {id:'fixed',name:'Fija',minWidth:300,minHeight:300},
  {id:'sliding2',name:'Corredera Serie Pro70 · 2 hojas',minWidth:600,minHeight:300},
  {id:'casement',name:'Abatible',minWidth:400,minHeight:300},
  {id:'tilt',name:'Oscilobatiente',minWidth:400,minHeight:300},
  {id:'awning',name:'Proyectante',minWidth:400,minHeight:300},
  {id:'mono',name:'Corredera Serie Pro70 · 1 fija + 1 móvil',minWidth:600,minHeight:300},
  {id:'sliding3',name:'Corredera Serie Pro70 · 3 hojas',minWidth:900,minHeight:300},
  {id:'transom-single',name:'Abatible con fijo superior',minWidth:600,minHeight:900},
  {id:'transom-double',name:'Dos abatibles con fijo superior',minWidth:1000,minHeight:900},
] as const;
export type DesignId=typeof DESIGNS[number]['id'];
const leaf=(id:string,type:WindowPanel['type']):WindowPanel=>({id,type,splitType:'none',splitPos:.5,children:[]});
export function transomTree(double:boolean):WindowPanel {
  const lower=double?{...leaf('bottom','fixed'),splitType:'vertical' as const,children:[leaf('left','casement-left'),leaf('right','casement-right')]}:leaf('bottom','casement-right');
  return {...leaf('top-split','fixed'),splitType:'horizontal',splitPos:.3,children:[leaf('top','fixed'),lower]};
}
const shape=(p:WindowPanel):string=>p.splitType==='none'?p.type:`${p.splitType}:${p.splitPos}(${p.children.map(shape).join(',')})`;
export function designId(item:EstimateItem):DesignId|'saved' {
  if(!item.panelTree)return item.preset==='custom'?'fixed':item.preset;
  if(shape(item.panelTree)===shape(transomTree(false)))return 'transom-single';
  if(shape(item.panelTree)===shape(transomTree(true)))return 'transom-double';
  return 'saved';
}
export function selectDesign(item:EstimateItem,id:DesignId):EstimateItem {
  const info=DESIGNS.find(d=>d.id===id)!;
  const custom=id.startsWith('transom-');
  return {...item,preset:custom?'custom':id as Preset,panelTree:custom?transomTree(id==='transom-double'):undefined,widthMm:Math.max(item.widthMm,info.minWidth),heightMm:Math.max(item.heightMm,info.minHeight)};
}
export function designLabel(item:EstimateItem):string {
  return DESIGNS.find(d=>d.id===designId(item))?.name??designName(item);
}
export function designLimits(item:EstimateItem) {
  const info=DESIGNS.find(d=>d.id===designId(item));
  return {minWidth:info?.minWidth??presetInfo(item.preset).min*10,minHeight:info?.minHeight??300};
}
