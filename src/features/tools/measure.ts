import {cmToMm,decimal,formatNumber,formatArea,measurementArea,totalArea,readMeasurements,estimatorLink,type Measurement} from './model';
import {wa} from '../../config/site';
const root=document.querySelector<HTMLElement>('[data-measure]');
if(root){
 const get=<T extends Element=HTMLElement>(selector:string)=>root.querySelector<T>(selector)!;
 const form=get<HTMLFormElement>('[data-measure-form]'),width=get<HTMLInputElement>('[name=width]'),height=get<HTMLInputElement>('[name=height]'),quantity=get<HTMLInputElement>('[name=quantity]'),label=get<HTMLInputElement>('[name=label]'),detail=get<HTMLDetailsElement>('[data-measure-detail]'),save=get<HTMLInputElement>('[data-measure-save]');
 const widths=[...root.querySelectorAll<HTMLInputElement>('[data-width-point]')],heights=[...root.querySelectorAll<HTMLInputElement>('[data-height-point]')];
 const storageKey='starwin-measurements-v1';let items:Measurement[]=[],editing:string|null=null,undo:Measurement[]|null=null;
 try{const raw=localStorage.getItem(storageKey);items=readMeasurements(raw);save.checked=raw!==null&&items.length>0;}catch{}
 function current():Measurement|null{
  const w=detail.open?widths.map(input=>cmToMm(input.value)):[cmToMm(width.value)],h=detail.open?heights.map(input=>cmToMm(input.value)):[cmToMm(height.value)],q=decimal(quantity.value);
  if(w.some(n=>n===null)||h.some(n=>n===null)||q===null||!Number.isInteger(q)||q<1||q>99)return null;
  return {id:editing||crypto.randomUUID(),label:label.value.trim(),widthMm:Math.min(...w as number[]),heightMm:Math.min(...h as number[]),quantity:q,...(detail.open?{widths:w as number[],heights:h as number[]}:{})};
 }
 function updateCurrent(){
  const item=current();get<HTMLOutputElement>('[data-measure-area]').value=item?formatArea(measurementArea(item)):'—';
  if(detail.open&&item){width.value=String(item.widthMm/10);height.value=String(item.heightMm/10);get('[data-measure-variation]').textContent=new Set(item.widths).size>1||new Set(item.heights).size>1?'Las medidas varían. Se registra la menor; la escuadra y el montaje requieren revisión.':'Las tres lecturas coinciden en cada dirección.';}else get('[data-measure-variation]').textContent='';
 }
 function persist(){
  const status=get('[data-storage-status]');
  try{if(save.checked){localStorage.setItem(storageKey,JSON.stringify({version:1,items}));status.textContent='Lista guardada en este navegador. Desactiva la opción para borrar la copia guardada.';}else{localStorage.removeItem(storageKey);status.textContent='Las medidas se conservan solo si activas esta opción.';}}catch{status.textContent='El navegador no permitió guardar la lista. Descarga el PDF para conservarla.';}
 }
 function textList(){return ['Hola Starwin, quiero consultar estas medidas preliminares:',...items.map((item,i)=>`${i+1}. ${item.label||'Ventana'}: ${formatNumber(item.widthMm/10)} × ${formatNumber(item.heightMm/10)} cm; cantidad: ${item.quantity}.${item.widths?` Anchos: ${item.widths.map(v=>formatNumber(v/10)).join(' / ')} cm. Altos: ${item.heights!.map(v=>formatNumber(v/10)).join(' / ')} cm.`:''}`),`Superficie total: ${formatArea(totalArea(items))} m². Las medidas requieren revisión técnica.`].join('\n\n');}
 function render(){
  const list=get('[data-measure-items]');list.replaceChildren();
  items.forEach((item,index)=>{
   const fragment=get<HTMLTemplateElement>('#measure-row-template').content.cloneNode(true) as DocumentFragment;
   fragment.querySelector('h3')!.textContent=item.label||`Ventana ${index+1}`;
   fragment.querySelector('[data-row-detail]')!.textContent=`${formatNumber(item.widthMm/10)} × ${formatNumber(item.heightMm/10)} cm · ${item.quantity} ${item.quantity===1?'unidad':'unidades'}`;
   fragment.querySelector('[data-row-points]')!.textContent=item.widths?'Vano medido en tres puntos.':'';
   fragment.querySelector('[data-row-area]')!.textContent=`${formatArea(measurementArea(item))} m²`;
   const edit=fragment.querySelector<HTMLButtonElement>('[data-row-edit]')!,remove=fragment.querySelector<HTMLButtonElement>('[data-row-remove]')!;
   edit.setAttribute('aria-label',`Editar ${item.label||`ventana ${index+1}`}`);remove.setAttribute('aria-label',`Quitar ${item.label||`ventana ${index+1}`}`);
   edit.addEventListener('click',()=>editItem(item));remove.addEventListener('click',()=>{undo=[...items];items=items.filter(v=>v.id!==item.id);if(editing===item.id)reset();get('[data-measure-status]').textContent='Ventana quitada.';render();persist();});fragment.querySelector<HTMLAnchorElement>('[data-row-estimate]')!.href=estimatorLink(item);list.append(fragment);
  });
  get('[data-measure-empty]').hidden=items.length>0;get('[data-measure-summary]').hidden=items.length===0;get('[data-measure-clear]').hidden=items.length===0;get('[data-measure-undo]').hidden=undo===null;
  const count=items.reduce((n,item)=>n+item.quantity,0);get('[data-measure-count]').textContent=`${count} ${count===1?'ventana':'ventanas'} · ${items.length} ${items.length===1?'medida':'medidas'}`;get<HTMLOutputElement>('[data-measure-total]').value=formatArea(totalArea(items));
  const text=textList();get<HTMLAnchorElement>('[data-measure-wa]').href=wa(text);get<HTMLAnchorElement>('[data-measure-mail]').href=`mailto:${root!.dataset.email}?subject=${encodeURIComponent('Mis medidas de ventanas')}&body=${encodeURIComponent(text)}`;
 }
 function reset(){editing=null;form.reset();detail.open=false;width.readOnly=false;height.readOnly=false;widths.concat(heights).forEach(input=>input.value='');get('[data-editor-title]').textContent='Tu ventana.';get('[data-measure-submit]').textContent='Agregar ventana +';get('[data-measure-cancel]').hidden=true;get('[data-measure-error]').textContent='';form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));updateCurrent();}
 function editItem(item:Measurement){editing=item.id;label.value=item.label;width.value=String(item.widthMm/10);height.value=String(item.heightMm/10);quantity.value=String(item.quantity);widths.forEach((input,i)=>input.value=item.widths?String(item.widths[i]/10):'');heights.forEach((input,i)=>input.value=item.heights?String(item.heights[i]/10):'');detail.open=!!item.widths;width.readOnly=detail.open;height.readOnly=detail.open;get('[data-editor-title]').textContent='Editar ventana.';get('[data-measure-submit]').textContent='Guardar cambios';get('[data-measure-cancel]').hidden=false;get('[data-measure-error]').textContent='';get('[data-measure-editor]')?.scrollIntoView();label.focus();updateCurrent();}
 detail.addEventListener('toggle',()=>{width.readOnly=detail.open;height.readOnly=detail.open;if(detail.open){widths.forEach(input=>{if(!input.value)input.value=width.value;});heights.forEach(input=>{if(!input.value)input.value=height.value;});}updateCurrent();});form.addEventListener('input',updateCurrent);
 form.addEventListener('submit',event=>{event.preventDefault();const item=current();
  const fields=detail.open?[...widths,...heights]:[width,height];fields.forEach(input=>input.setAttribute('aria-invalid',String(cmToMm(input.value)===null)));const q=decimal(quantity.value);quantity.setAttribute('aria-invalid',String(q===null||!Number.isInteger(q)||q<1||q>99));
  if(!item){get('[data-measure-error]').textContent='Revisa las medidas (0,1 a 1.000 cm) y la cantidad (1 a 99, sin decimales).';form.querySelector<HTMLInputElement>('[aria-invalid=true]')?.focus();return;}
  if(!editing&&items.length>=50){get('[data-measure-error]').textContent='Esta ficha admite hasta 50 medidas distintas. Descárgala antes de comenzar otra.';return;}
  const wasEditing=!!editing;items=editing?items.map(v=>v.id===editing?item:v):[...items,item];undo=null;reset();render();persist();get('[data-measure-status]').textContent=wasEditing?'Medidas actualizadas.':'Ventana agregada a tu lista.';
 });
 get('[data-measure-cancel]').addEventListener('click',reset);get('[data-measure-clear]').addEventListener('click',()=>{undo=[...items];items=[];reset();render();persist();get('[data-measure-status]').textContent='Lista vaciada. Puedes deshacer.';});get('[data-measure-undo]').addEventListener('click',()=>{if(undo){items=undo;undo=null;render();persist();get('[data-measure-status]').textContent='Lista restaurada.';}});save.addEventListener('change',persist);
 get('[data-measure-copy]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(textList());get('[data-measure-status]').textContent='Lista copiada.';}catch{get('[data-measure-status]').textContent='No se pudo copiar. Puedes descargar la ficha o abrir un mensaje con las medidas.';}});
 get('[data-measure-pdf]').addEventListener('click',async()=>{const button=get<HTMLButtonElement>('[data-measure-pdf]'),snapshot=items.map(item=>({...item}));if(!snapshot.length)return;button.disabled=true;button.textContent='Preparando PDF…';try{const {buildMeasurementPdf}=await import('./measurement-pdf');const blob=await buildMeasurementPdf(snapshot);const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='starwin-ficha-de-medidas.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);get('[data-measure-status]').textContent='Ficha PDF preparada.';}catch{get('[data-measure-status]').textContent='No se pudo crear el PDF. Inténtalo de nuevo o copia la lista.';}finally{button.disabled=false;button.textContent='Descargar ficha PDF ↓';}});
 render();updateCurrent();if(save.checked)get('[data-storage-status]').textContent='Lista recuperada de este navegador. Desactiva la opción para borrar la copia guardada.';
}
