import {jsPDF} from 'jspdf';
import {renderToStaticMarkup} from 'react-dom/server';
import Drawing from './Drawing';
import drawingCss from '../src/features/canvas/Drawing.css?raw';
import {quoteLines,quoteTotal,clp,cm,colorName,glassName,EXTRA_LABELS,PRICE_NOTE,newId,type EstimateItem,type Extras} from './model';
import {designLabel} from './catalog';

async function file64(name:string) {
  const response=await fetch(`${import.meta.env.BASE_URL}${name}`);
  if(!response.ok)throw new Error('No se pudo cargar un recurso del PDF.');
  const bytes=new Uint8Array(await response.arrayBuffer());let text='';
  for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(text);
}
let resources:Promise<[string,string,string]>|undefined;
function loadResources() {
  return resources??=Promise.all([file64('pdf-fonts/IBMPlexSans-400.ttf'),file64('pdf-fonts/IBMPlexSans-600.ttf'),file64('starwin-logo.png')]).catch(e=>{resources=undefined;throw e;});
}
async function drawingPng(item:EstimateItem) {
  const tokens=getComputedStyle(document.documentElement);
  let svg=renderToStaticMarkup(<Drawing item={item}/>);
  svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000" ').replace('>','><style>'+drawingCss+'</style>');
  svg=svg.replace(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g,(_,key:string,fallback:string)=>tokens.getPropertyValue(key).trim()||fallback||'#65747e');
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  try {
    const img=new Image();img.src=url;await img.decode();
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1000;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No se pudo dibujar la ventana.');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1200,1000);ctx.drawImage(img,0,0);return canvas.toDataURL('image/png');
  }finally{URL.revokeObjectURL(url);}
}
export async function buildQuotePdf(items:EstimateItem[],projectName:string) {
  if(!items.length||items.length>100)throw new Error('Agrega al menos una ventana.');
  const lines=quoteLines(items),total=quoteTotal(items),[regular,bold,logo]=await loadResources();
  const doc=new jsPDF({unit:'mm',format:'a4',compress:true});
  doc.addFileToVFS('Plex-Regular.ttf',regular);doc.addFont('Plex-Regular.ttf','Plex','normal');
  doc.addFileToVFS('Plex-Semibold.ttf',bold);doc.addFont('Plex-Semibold.ttf','Plex','bold');
  doc.setProperties({title:projectName||'Presupuesto de ventanas Starwin',subject:'Estimación de ventanas PVC',author:'Starwin',creator:'Starwin'});

  const ink='#202a30',muted='#65737b',blue='#254c5b';
  const date=new Intl.DateTimeFormat('es-CL',{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Santiago'}).format(new Date());
  const ref=`SW-${new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Santiago'}).format(new Date()).replaceAll('-','')}-${newId().replaceAll('-','').slice(-4).toUpperCase()}`;
  function text(content:string,x:number,y:number,size=9,color=ink,bold=false,options?:Parameters<typeof doc.text>[3]){doc.setFont('Plex',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(color);doc.text(content,x,y,options);}
  function amountWithTax(amount:number,x:number,y:number,size:number,color=ink){
    const taxSize=size>20?8:7.5;
    doc.setFont('Plex','normal');doc.setFontSize(taxSize);
    const taxWidth=doc.getTextWidth('+ IVA');
    text(clp(amount),x-taxWidth-2,y,size,color,true,{align:'right'});
    text('+ IVA',x,y,taxSize,muted,false,{align:'right'});
  }
  function wrap(value:string,width:number,size:number,bold=false){doc.setFont('Plex',bold?'bold':'normal');doc.setFontSize(size);return doc.splitTextToSize(value,width) as string[];}
  function header(){
    doc.addImage(`data:image/png;base64,${logo}`,'PNG',18,17,45,7.5,undefined,'FAST');
    text('VENTANAS DE PVC / CONCEPCIÓN',192,19,7,muted,false,{align:'right'});text(date,192,25,8,muted,false,{align:'right'});
    doc.setDrawColor('#e1c05d');doc.setLineWidth(.8);doc.line(18,34,192,34);
    text('Presupuesto de ventanas.',18,49,23,ink);
    text(projectName.trim()?wrap(projectName.trim(),120,10)[0]!:'Estimación para tu proyecto',18,58,10,muted);
    text(ref,192,58,8,muted,false,{align:'right'});
    doc.setDrawColor('#d6dddf');doc.setLineWidth(.2);doc.line(18,64,192,64);
  }
  header();let y=70;
  for(let index=0;index<lines.length;index++){
    const {item,unit,subtotal}=lines[index]!,label=designLabel(item);
    const nameLines=wrap(item.label||label,95,13).slice(0,3);
    const metadata=[...(item.label?[label]:[]),`${cm(item.widthMm)} × ${cm(item.heightMm)} cm · ${colorName(item.color)}`,glassName(item.glass)];
    const extras=Object.entries(item.extras).filter(([,v])=>v).map(([k])=>EXTRA_LABELS[k as keyof Extras]).join(' · ');
    if(extras)metadata.push(extras);
    const detailLines=metadata.flatMap(line=>wrap(line,95,8.5));
    const rowHeight=Math.max(69,30+nameLines.length*5.2+detailLines.length*4.3);
    if(y+rowHeight>266){doc.addPage();header();y=70;}
    text(String(index+1).padStart(2,'0'),18,y+8,9,muted);
    const png=await drawingPng(item);doc.addImage(png,'PNG',18,y+12,65,54.17,undefined,'FAST');
    nameLines.forEach((line,n)=>text(line,92,y+8+n*5.2,13,ink));
    const detailY=y+15+(nameLines.length-1)*5.2;
    detailLines.forEach((line,n)=>text(line,92,detailY+n*4.3,8.5,muted));
    const priceY=y+rowHeight-8;
    text(`${item.quantity} ${item.quantity===1?'unidad':'unidades'} × ${clp(unit)}`,92,priceY-8,8,muted);
    text(clp(subtotal),192,priceY,16,ink,true,{align:'right'});
    doc.setDrawColor('#d6dddf');doc.setLineWidth(.2);doc.line(18,y+rowHeight,192,y+rowHeight);y+=rowHeight+8;
    await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  }
  if(y+42>274){doc.addPage();header();y=70;}
  const count=items.reduce((sum,item)=>sum+item.quantity,0);
  text('TOTAL ESTIMADO',18,y+13,8,muted,true);text(`${count} ${count===1?'ventana':'ventanas'} · Pesos chilenos`,18,y+22,9,muted);
  let totalSize=27;doc.setFont('Plex','bold');doc.setFontSize(totalSize);while(doc.getTextWidth(clp(total))>84&&totalSize>12)doc.setFontSize(--totalSize);
  amountWithTax(total,192,y+22,totalSize,blue);text(PRICE_NOTE,18,y+35,8,muted);
  for(let n=1;n<=doc.getNumberOfPages();n++){
    doc.setPage(n);doc.setDrawColor('#d6dddf');doc.line(18,279,192,279);
    text('STARWIN PVC CHILE',18,285,7,ink,true);text('starwinchile@gmail.com  /  +56 9 6600 3771',192,285,7,muted,false,{align:'right'});
    text(`${n} / ${doc.getNumberOfPages()}`,192,291,7,muted,false,{align:'right'});
  }
  return {doc,ref,total};
}
export async function downloadQuote(items:EstimateItem[],projectName:string) {const {doc,ref}=await buildQuotePdf(items,projectName);doc.save(`Starwin-${ref}.pdf`);}
