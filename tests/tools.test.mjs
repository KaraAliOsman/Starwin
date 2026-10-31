import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTS} from './load-ts.mjs';
const {decimal,cmToMm,isMeasurement,readMeasurements,measurementArea,totalArea,estimatorLink,dewPoint,recommendOpening}=loadTS('src/features/tools/model.ts');
test('Medidas: decimales chilenos, unidades, cantidades y sumas exactas en mm',()=>{
 assert.equal(decimal(' 120,5 '),120.5);assert.equal(cmToMm('120,5'),1205);assert.equal(cmToMm('0,1'),1);
 for(const value of ['', '1,2,3', 'Infinity', 'NaN', '1e3', '-5', '0','1000.1'])assert.equal(cmToMm(value),null,value);
 const items=[{id:'a',label:'Sala',widthMm:1205,heightMm:1400,quantity:2},{id:'b',label:'Baño',widthMm:700,heightMm:600,quantity:1}];
 assert.equal(measurementArea(items[0]),3.374);assert.equal(totalArea(items),3.794);
 const query=new URL(estimatorLink(items[0]),'https://starwinpvc.cl');assert.equal(query.searchParams.get('width'),'120.5');assert.equal(query.searchParams.get('height'),'140');
 assert(isMeasurement(items[0]));assert(!isMeasurement({...items[0],quantity:1.5}));assert(!isMeasurement({...items[0],widthMm:Infinity}));assert(!isMeasurement({...items[0],widths:[1205,1206,1207]}));
 assert(isMeasurement({...items[0],widths:[1205,1206,1207],heights:[1400,1401,1400]}));assert(!isMeasurement({...items[0],widths:[1206,1207,1208],heights:[1400,1401,1400]}));
 assert.deepEqual(readMeasurements(JSON.stringify({version:1,items})),items);assert.deepEqual(readMeasurements('broken'),[]);assert.deepEqual(readMeasurements(JSON.stringify({version:2,items})),[]);assert.deepEqual(readMeasurements(JSON.stringify({version:1,items:[items[0],items[0]]})),[]);
});
test('Condensación: valores conocidos, saturación y rangos de entrada',()=>{
 assert(Math.abs(dewPoint(20,60)-12.007)<.01);assert(Math.abs(dewPoint(25,60)-16.698)<.01);
 for(const t of [0,5,20,40])assert(Math.abs(dewPoint(t,100)-t)<1e-10);
 assert(dewPoint(20,80)>dewPoint(20,60));assert(dewPoint(20,60)<20);
 for(const [t,h] of [[-1,60],[41,60],[20,0],[20,101],[NaN,60],[20,Infinity]])assert.equal(dewPoint(t,h),null);
});
test('Asistente: todas las combinaciones dan dos opciones y respetan restricciones',()=>{
 for(const room of ['bedroom','living','bathroom','kitchen'])for(const space of ['clear','inside','outside'])for(const priority of ['air','seal','light']){
  const results=recommendOpening(room,space,priority);assert.equal(results.length,2);assert.notEqual(results[0].query,results[1].query);
  if(priority==='light')assert.equal(results[0].query,'fixed');
  else if(space==='inside')assert(results.every(p=>['sliding2','awning'].includes(p.query)));
  else if(space==='outside')assert(results.every(p=>['casement','tilt'].includes(p.query)));
 }
 assert.deepEqual(recommendOpening('x','clear','air'),[]);
});
