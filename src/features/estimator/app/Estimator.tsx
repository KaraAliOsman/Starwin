import React,{lazy,Suspense,useEffect,useMemo,useState} from 'react';
import ControlIcon from '../../../components/ControlIcon';
import Drawing from './Drawing';
import {DESIGNS,designId,designLabel,designLimits,selectDesign,type DesignId} from './catalog';
import {COLORS,GLASSES,EXTRA_LABELS,PRICE_NOTE,STORAGE_KEY,clp,cm,colorName,glassName,defaultItem,newId,parseCm,quoteTotal,unitPrice,validateItem,readItems,cleanItems,type EstimateItem,type Extras} from './model';
const Window3D=lazy(()=>import('./Window3D'));
function Quantity({value,onChange,label='Cantidad'}:{value:number;onChange:(n:number)=>void;label?:string}) {
  return <div className="quantity" role="group" aria-label={label}><button type="button" aria-label={`Reducir ${label.toLowerCase()}`} disabled={value<=1} onClick={()=>onChange(value-1)}>−</button><output aria-label={label}>{value}</output><button type="button" aria-label={`Aumentar ${label.toLowerCase()}`} disabled={value>=99} onClick={()=>onChange(value+1)}>+</button></div>;
}
export default function StarwinEstimator() {
  const [items,setItems]=useState<EstimateItem[]>([]),[storageReady,setStorageReady]=useState(false);
  const [item,setItem]=useState(defaultItem),[width,setWidth]=useState('100'),[height,setHeight]=useState('100');
  const [view,setView]=useState<'design'|'quote'>('design'),[mode,setMode]=useState<'2d'|'3d'>('2d'),[editing,setEditing]=useState<string|null>(null);
  const [pdfBusy,setPdfBusy]=useState(false),[pdfError,setPdfError]=useState(''),[storageError,setStorageError]=useState(false),[showErrors,setShowErrors]=useState(false),[announcement,setAnnouncement]=useState('');
  const [removed,setRemoved]=useState<{item:EstimateItem;index:number}|null>(null),[projectName,setProjectName]=useState('');
  useEffect(()=>{try{setItems(readItems(localStorage.getItem(STORAGE_KEY)));}catch{setStorageError(true);}finally{setStorageReady(true);}},[]);
  useEffect(()=>{const params=new URLSearchParams(window.location.search),design=params.get('design'),color=params.get('color');let next=defaultItem();if(DESIGNS.some(d=>d.id===design))next=selectDesign(next,design as DesignId);if(COLORS.some(c=>c.id===color))next={...next,color:color as EstimateItem['color']};const queryWidth=parseCm(params.get('width')||''),queryHeight=parseCm(params.get('height')||'');if(queryWidth!==null&&queryHeight!==null){const measured={...next,widthMm:queryWidth,heightMm:queryHeight},limits=designLimits(measured);if(validateItem(measured)&&queryWidth>=limits.minWidth&&queryHeight>=limits.minHeight)next=measured;}setItem(next);setWidth(String(next.widthMm/10));setHeight(String(next.heightMm/10));if(params.get('view')==='3d')setMode('3d');},[]);
  useEffect(()=>{if(!storageReady)return;try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,items:cleanItems(items)}));setStorageError(false);}catch{setStorageError(true);}},[items,storageReady]);
  const limits=designLimits(item),w=parseCm(width),h=parseCm(height);
  const validWidth=w!==null&&w>=limits.minWidth&&w<=4000,validHeight=h!==null&&h>=limits.minHeight&&h<=3000;
  const candidate={...item,widthMm:w??0,heightMm:h??0},valid=validWidth&&validHeight&&validateItem(candidate);
  const displayItem=useMemo(()=>valid?candidate:item,[item,width,height,valid]);
  const price=valid?unitPrice(candidate):null,total=quoteTotal(items),count=items.reduce((s,i)=>s+i.quantity,0);
  function jump(next:'design'|'quote') {setView(next);setPdfError('');window.scrollTo({top:0,behavior:'instant'});}
  function choose(id:DesignId) {const next=selectDesign({...item,widthMm:w??item.widthMm,heightMm:h??item.heightMm},id);setItem(next);setWidth(String(next.widthMm/10));setHeight(String(next.heightMm/10));setShowErrors(false);}
  function add() {
    setShowErrors(true);if(!valid)return;
    if(items.length>=100&&!editing){setAnnouncement('Puedes agregar hasta 100 modelos en un presupuesto.');return;}
    const saved={...candidate,label:candidate.label.trim(),id:editing??newId()};
    setItems(previous=>editing?previous.map(i=>i.id===editing?saved:i):[...previous,saved]);
    setAnnouncement(editing?'Cambios guardados.':'Ventana agregada.');setEditing(null);setItem({...saved,id:newId(),label:'',quantity:1});setShowErrors(false);jump('quote');
  }
  function edit(i:EstimateItem) {setItem(structuredClone(i));setWidth(String(i.widthMm/10));setHeight(String(i.heightMm/10));setEditing(i.id);setShowErrors(false);setMode('2d');jump('design');}
  function newWindow() {setEditing(null);setShowErrors(false);setItem(i=>({...i,id:newId(),label:'',quantity:1}));setMode('2d');jump('design');}
  async function download() {
    if(!items.length||pdfBusy)return;setPdfError('');setPdfBusy(true);
    try {const {downloadQuote}=await import('./pdf');await downloadQuote(cleanItems(items),projectName.trim());setAnnouncement('PDF descargado.');}catch(e){console.error(e);setPdfError('No pudimos crear el PDF. Vuelve a intentarlo.');}finally{setPdfBusy(false);}
  }
  return <div className="app">
    <header className="header"><a className="brand" href="/" aria-label="Starwin, volver al inicio"><img src={`${import.meta.env.BASE_URL}starwin-logo.png`} width="162" height="27" alt="Starwin"/></a><button className="budget-link" onClick={()=>jump(view==='design'?'quote':'design')}>{view==='design'?<>Presupuesto <span>{count}</span></>:<>← Volver</>}</button></header>
    <main><div className="page-heading"><h1>{view==='design'?(editing?'Editar ventana':'Cotiza tus ventanas'):'Tu presupuesto'}</h1>{editing&&<button className="text-button" onClick={()=>{setEditing(null);jump('quote');}}>Cancelar</button>}</div>
      {view==='design'?<div className="design-layout">
        <section className="visual" aria-label="Vista de tu ventana">
          <label className="model-field" htmlFor="preset">Modelo<select id="preset" value={designId(item)} onChange={e=>choose(e.target.value as DesignId)}>{designId(item)==='saved'&&<option value="saved">Diseño guardado</option>}{DESIGNS.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <div className="preview"><div className="view-tabs" aria-label="Visualización"><button aria-pressed={mode==='2d'} onClick={()=>setMode('2d')}>Dibujo</button><button aria-pressed={mode==='3d'} onClick={()=>setMode('3d')}>Ver en 3D</button></div>
            {mode==='2d'?<div className="drawing-stage"><Drawing item={displayItem}/><span>{cm(displayItem.widthMm)} × {cm(displayItem.heightMm)} cm</span></div>:<Suspense fallback={<div className="fallback" role="status">Cargando 3D…</div>}><Window3D key={`${item.preset}-${item.side}`} item={displayItem}/></Suspense>}
          </div>
        </section>
        <section className="configuration" aria-label="Personaliza tu ventana">
          <div className="dimensions"><label htmlFor="width">Ancho<div className="input-unit"><input id="width" inputMode="decimal" enterKeyHint="next" value={width} onChange={e=>setWidth(e.target.value)} onBlur={()=>setShowErrors(true)} aria-invalid={showErrors&&!validWidth}/><span>cm</span></div></label><label htmlFor="height">Alto<div className="input-unit"><input id="height" inputMode="decimal" enterKeyHint="done" value={height} onChange={e=>setHeight(e.target.value)} onBlur={()=>setShowErrors(true)} aria-invalid={showErrors&&!validHeight}/><span>cm</span></div></label></div>
          {showErrors&&!valid&&<p className="error" role="alert">{!validWidth?`Ancho entre ${cm(limits.minWidth)} y 400 cm.`:!validHeight?`Alto entre ${cm(limits.minHeight)} y 300 cm.`:'Estas medidas no permiten conservar el diseño guardado.'}</p>}
          <div className="color-field"><div className="field-label">Color <span>{colorName(item.color)}</span></div><div className="swatches">{COLORS.map(c=><button key={c.id} style={{'--swatch':c.hex} as React.CSSProperties} className={`swatch ${c.wood?'wood':''}`} aria-label={`Color ${c.name}`} aria-pressed={item.color===c.id} title={c.name} onClick={()=>setItem({...item,color:c.id})}><span>{item.color===c.id&&'✓'}</span></button>)}</div></div>
          <div className="quantity-row"><span>Ventanas iguales</span><Quantity value={item.quantity} onChange={quantity=>setItem({...item,quantity})}/></div>
          <details className="options"><summary>Vidrio y otros detalles <span>{glassName(item.glass)}</span></summary><div className="options-content"><label htmlFor="glass">Vidrio<select id="glass" value={item.glass} onChange={e=>setItem({...item,glass:e.target.value as EstimateItem['glass']})}>{GLASSES.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
            {['casement','tilt'].includes(item.preset)&&!item.panelTree&&<label htmlFor="hinge-side">Bisagras<select id="hinge-side" value={item.side} onChange={e=>setItem({...item,side:e.target.value as 'left'|'right'})}><option value="left">Lado izquierdo</option><option value="right">Lado derecho</option></select></label>}
            <div className="extras">{Object.entries(EXTRA_LABELS).map(([key,label])=><label key={key}><input type="checkbox" checked={item.extras[key as keyof Extras]} onChange={e=>setItem({...item,extras:{...item.extras,[key]:e.target.checked}})}/><span>{label}</span></label>)}</div>
            <label htmlFor="label">Nombre de la ventana <span className="optional">Opcional</span><input id="label" maxLength={60} placeholder="Ej. Dormitorio" value={item.label} onChange={e=>setItem({...item,label:e.target.value})}/></label>
          </div></details><p className="reference-note">Medidas en centímetros.</p>
        </section>
      </div>:<section className="quote-section" aria-label="Ventanas de tu presupuesto">
        {items.length===0?<div className="empty"><p>Aún no agregas ventanas.</p><button className="primary" onClick={newWindow}>Agregar una ventana</button></div>:<>
          <div className="quote-heading"><span>{count} {count===1?'ventana':'ventanas'}</span><button className="text-button" onClick={newWindow}>+ Agregar otra</button></div>
          {removed&&<div className="undo" role="status">Ventana eliminada.<button disabled={items.length>=100} onClick={()=>{setItems(p=>{if(p.length>=100)return p;const next=[...p];next.splice(Math.min(removed.index,next.length),0,removed.item);return next;});setRemoved(null);}}>Deshacer</button><button aria-label="Cerrar aviso" onClick={()=>setRemoved(null)}>×</button></div>}
          <div className="quote-list">{items.map((i,index)=><article className="quote-item" key={i.id} data-testid="quote-item"><div className="quote-drawing"><Drawing item={i}/></div><div className="item-content"><h2>{i.label||designLabel(i)}</h2>{i.label&&<p>{designLabel(i)}</p>}<p>{cm(i.widthMm)} × {cm(i.heightMm)} cm · {colorName(i.color)}</p><p>{glassName(i.glass)}</p><strong>{clp(unitPrice(i)*i.quantity)}</strong><small>{i.quantity>1&&`${clp(unitPrice(i))} cada una`}</small></div><div className="item-footer"><Quantity value={i.quantity} label={`Cantidad ventana ${index+1}`} onChange={quantity=>setItems(previous=>previous.map(p=>p.id===i.id?{...p,quantity}:p))}/><div className="item-tools"><button onClick={()=>edit(i)}>Editar</button><button aria-label={`Duplicar ventana ${index+1}`} disabled={items.length>=100} onClick={()=>{setItems(p=>p.length<100?[...p,{...structuredClone(i),id:newId()}]:p);setAnnouncement('Ventana duplicada.');}}>Duplicar</button><button aria-label={`Quitar ventana ${index+1}`} onClick={()=>{setRemoved({item:i,index});setItems(p=>p.filter(p=>p.id!==i.id));}}>Quitar</button></div></div></article>)}</div>
          <label className="project-field" htmlFor="projectName">Nombre del proyecto <span className="optional">Opcional</span><input id="projectName" placeholder="Ej. Mi casa" maxLength={70} value={projectName} onChange={e=>setProjectName(e.target.value)}/></label><p className="reference-note">El PDF incluye el dibujo, las medidas y el precio de cada ventana. Estimación sujeta a revisión y confirmación.</p><a className="quote-contact" href="/contacto/">Revisar mi proyecto con Starwin ↗</a>
        </>}{pdfError&&<p className="error" role="alert">{pdfError}</p>}
      </section>}
      {storageError&&<p className="error" role="status">No se pudo guardar en este navegador. Descarga el PDF antes de salir.</p>}<div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    </main>
    {(view==='design'||items.length>0)&&<footer className="bottom-bar"><div className="bottom-content"><div className="bottom-price"><span>{view==='design'?(item.quantity>1?`${item.quantity} ventanas`:'Esta ventana'):`Total · ${count} ventanas`}</span><strong data-testid={view==='quote'?'quote-total':'active-price'}>{view==='design'?(price!==null?clp(price*item.quantity):'Revisa medidas'):clp(total)}</strong></div>{view==='design'?<button className="primary" data-action="add" onClick={add} disabled={!valid}>{editing?'Guardar':'Agregar'}<ControlIcon name={editing?'check':'plus'}/></button>:<button className="primary" data-action="download" onClick={download} disabled={pdfBusy} aria-busy={pdfBusy}>{pdfBusy?'Creando PDF…':'Descargar PDF'}<ControlIcon name="download"/></button>}</div><p>{PRICE_NOTE}</p></footer>}
  </div>;
}
