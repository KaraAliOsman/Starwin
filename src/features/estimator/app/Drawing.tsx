import { useMemo } from 'react';
import { ProductFrontContent } from '../src/features/canvas/ProductFrontSvg';
import { productFor, membersFor } from './visual';
import type { EstimateItem } from './model';
import { isSliding,itemTree } from './model';
import { isLeaf,panelLayout } from './panels';
const noop=()=>{};
export default function Drawing({item,selected,onSelect}:{item:EstimateItem;selected?:string|null;onSelect?:(id:string)=>void}) {
  const product=useMemo(()=>productFor(item),[item.preset,item.side,item.widthMm,item.heightMm,item.glass,item.panelTree]);
  const members=useMemo(()=>membersFor(item),[item.color]);
  const layout=onSelect&&!isSliding(item)?panelLayout(itemTree(item),item.widthMm,item.heightMm):[];
  return <svg className={`product-front-svg${onSelect?' selectable-drawing':''}`} viewBox={`-50 -50 ${item.widthMm+100} ${item.heightMm+100}`} role={onSelect?'group':'img'} aria-label="Diseño de tu ventana"><ProductFrontContent product={product} members={members} selectedId={null} issues={[]} disabled preview onSelectModule={noop} onAddUnit={noop} onCommitModuleWidth={noop} onCommitTotalWidth={noop} onCommitHeight={noop}/>
    {layout.filter(l=>isLeaf(l.panel)).map((l,index)=><g key={l.panel.id} className={`pane-select${selected===l.panel.id?' is-selected':''}`} role="button" tabIndex={0} aria-label={`Seleccionar paño ${index+1}`} aria-pressed={selected===l.panel.id} onClick={()=>onSelect?.(l.panel.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(l.panel.id);}}}><rect x={l.aperture.x+5} y={l.aperture.y+5} width={Math.max(0,l.aperture.w-10)} height={Math.max(0,l.aperture.h-10)} rx="4"/>{layout.length>1&&<><circle cx={l.aperture.x+l.aperture.w/2} cy={l.aperture.y+l.aperture.h/2} r={Math.min(55,l.aperture.w*.16,l.aperture.h*.16)}/><text x={l.aperture.x+l.aperture.w/2} y={l.aperture.y+l.aperture.h/2} dominantBaseline="central" textAnchor="middle" fontSize={Math.min(52,l.aperture.w*.15,l.aperture.h*.15)}>{index+1}</text></>}</g>)}
    {layout.filter(l=>!isLeaf(l.panel)).map(l=><rect key={l.panel.id} className={`divider-select${selected===l.panel.id?' is-selected':''}`} x={l.panel.splitType==='vertical'?l.axis!-25:l.aperture.x} y={l.panel.splitType==='horizontal'?l.axis!-25:l.aperture.y} width={l.panel.splitType==='vertical'?50:l.aperture.w} height={l.panel.splitType==='horizontal'?50:l.aperture.h} role="button" tabIndex={0} aria-label={`Seleccionar ${l.panel.splitType==='horizontal'?'travesaño horizontal':'división vertical'} ${l.panel.id}`} onClick={()=>onSelect?.(l.panel.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect?.(l.panel.id);}}}/>)}
  </svg>;
}
