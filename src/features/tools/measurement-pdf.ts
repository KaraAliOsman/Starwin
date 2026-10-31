import {jsPDF} from 'jspdf';
import {isMeasurement,totalArea,formatNumber,formatArea,measurementArea,type Measurement} from './model';
import {site} from '../../config/site';
let resources:Promise<string[]>|undefined;
function loadResources(){return resources??=Promise.all(['pdf-fonts/IBMPlexSans-400.ttf','pdf-fonts/IBMPlexSans-600.ttf','starwin-logo.png'].map(async path=>{const response=await fetch(`/${path}`);if(!response.ok)throw Error('No se pudo cargar el PDF.');const bytes=new Uint8Array(await response.arrayBuffer());let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value);})).catch(error=>{resources=undefined;throw error;});}
export async function buildMeasurementPdf(items:Measurement[]):Promise<Blob>{
 if(!items.length||items.length>50||!items.every(isMeasurement))throw Error('La lista de medidas no es válida.');
 const [regular,bold,logo]=await loadResources(),doc=new jsPDF({unit:'mm',format:'a4',compress:true});
 doc.addFileToVFS('Plex.ttf',regular);doc.addFont('Plex.ttf','Plex','normal');doc.addFileToVFS('PlexBold.ttf',bold);doc.addFont('PlexBold.ttf','Plex','bold');doc.setProperties({title:'Ficha de medidas de ventanas',author:'Starwin',subject:'Medidas preliminares y superficie de ventanas'});
 const ink='#17272d',muted='#53636b',blue='#006d94';
 function text(value:string,x:number,y:number,size=9,color=ink,weight:'normal'|'bold'='normal',align:'left'|'right'|'center'='left'){doc.setFont('Plex',weight);doc.setFontSize(size);doc.setTextColor(color);doc.text(value,x,y,{align});}
 function wrap(value:string,width:number,size=9){doc.setFont('Plex','normal');doc.setFontSize(size);return doc.splitTextToSize(value,width) as string[];}
 function header(){doc.addImage(`data:image/png;base64,${logo}`,'PNG',18,16,45,7.5);text(new Intl.DateTimeFormat('es-CL',{dateStyle:'long',timeZone:'America/Santiago'}).format(new Date()),192,22,8,muted,'normal','right');doc.setFillColor(blue);doc.rect(18,33,174,1.3,'F');text('Ficha de medidas.',18,48,24,ink,'bold');text('Medidas preliminares en centímetros. No es una orden de fabricación.',18,58,9,muted);}
 header();let y=68;
 items.forEach((item,index)=>{
  const name=wrap(item.label||`Ventana ${index+1}`,104,12),rowHeight=40+(name.length-1)*5+(item.widths?13:0);
  if(y+rowHeight>246){doc.addPage();header();y=68;}
  doc.setFillColor('#edf3f5');doc.rect(18,y,174,rowHeight-4,'F');
  const scale=Math.min(24/item.widthMm,24/item.heightMm),w=item.widthMm*scale,h=item.heightMm*scale;
  doc.setDrawColor(blue);doc.setLineWidth(.6);doc.rect(40-w/2,y+4+(24-h)/2,w,h);text(`${formatNumber(item.widthMm/10)} × ${formatNumber(item.heightMm/10)} cm`,40,y+32,7,muted,'normal','center');
  name.forEach((line,i)=>text(line,69,y+9+i*5,12,ink,'bold'));const body=y+17+(name.length-1)*5;
  text(`Ancho ${formatNumber(item.widthMm/10)} cm  ·  Alto ${formatNumber(item.heightMm/10)} cm`,69,body,9);text(`Cantidad: ${item.quantity}`,69,body+6,9,muted);
  text(`${formatArea(measurementArea(item))} m²`,185,body+6,12,blue,'bold','right');
  if(item.widths){text(`Anchos: ${item.widths.map(v=>formatNumber(v/10)).join(' / ')} cm`,69,body+13,8,muted);text(`Altos: ${item.heights!.map(v=>formatNumber(v/10)).join(' / ')} cm`,69,body+18,8,muted);}
  y+=rowHeight+3;
 });
 if(y+37>263){doc.addPage();header();y=68;}
 text('SUPERFICIE TOTAL',18,y+9,8,muted,'bold');text(`${formatArea(totalArea(items))} m²`,192,y+13,25,blue,'bold','right');text(`${items.reduce((sum,item)=>sum+item.quantity,0)} ventanas · ${items.length} medidas distintas`,18,y+18,9,muted);
 const note='Superficie = ancho × alto × cantidad. No representa la superficie exacta de vidrio. No se han descontado holguras. Las medidas de fabricación, escuadra, configuración y factibilidad se confirman con revisión técnica.';wrap(note,174,8).forEach((line,i)=>text(line,18,y+29+i*4,8,muted));
 const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);text(`${site.businessName} · ${site.phone} · ${site.email}`,18,281,7,muted);text(`${i} / ${pages}`,192,281,8,muted,'normal','right');}
 return doc.output('blob');
}
