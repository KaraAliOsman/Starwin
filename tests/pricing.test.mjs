import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import ts from 'typescript';
import {loadTS} from './load-ts.mjs';
const base='src/features/estimator/app/';
const m=loadTS(base+'model.ts'),catalog=loadTS(base+'catalog.ts');
const original={};const raw=fs.readFileSync('procedencia/precios/Starwinpvc-pricing-route.original.ts.txt','utf8').replace(/^import \{ NextResponse \} from 'next\/server';\r?\n/,'');
new Function('exports','NextResponse',ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(original,{json:data=>({data})});
test('El motor integrado conserva el mismo archivo que el estimador validado',()=>{
 const engine=fs.readFileSync(base+'pricing/pricing.ts');
 const hash=crypto.createHash('sha256').update(engine).digest('hex');
 assert.equal(hash,'f4bf0eab0813d872011e054e6d0f61af4fb1a940c641abb37bdf6b0643013a42');
});
test('945 configuraciones coinciden peso por peso con la ruta original de Starwinpvc',async()=>{
 let comparisons=0;
 for(const d of catalog.DESIGNS)for(const c of m.COLORS)for(const g of m.GLASSES)for(const variant of [0,1,2]){
  let item=catalog.selectDesign(m.defaultItem(),d.id);
  item={...item,color:c.id,glass:g.id,widthMm:variant===0?d.minWidth:variant===1?Math.max(d.minWidth,1805):4000,heightMm:variant===0?d.minHeight:variant===1?Math.max(d.minHeight,1400):3000,extras:variant===2?Object.fromEntries(Object.keys(m.EXTRA_LABELS).map(k=>[k,true])):m.emptyExtras()};
  assert(m.validateItem(item));const config=m.priceConfig(item);
  const expected=(await original.POST({json:async()=>structuredClone(config)})).data.precio;
  assert.equal(m.unitPrice(item),expected,`${d.id}/${c.id}/${g.id}/${variant}`);comparisons++;
 }
 assert.equal(comparisons,945);
});
test('Varias ventanas conservan cantidades, subtotales y total de la referencia',()=>{
 const a={...catalog.selectDesign(m.defaultItem(),'sliding2'),widthMm:1805,heightMm:1400,color:'ANTRACITA',quantity:2};
 const b={...catalog.selectDesign(m.defaultItem(),'transom-double'),widthMm:1900,heightMm:1500,color:'NOGAL'};
 const c={...catalog.selectDesign(m.defaultItem(),'awning'),widthMm:700,heightMm:600,extras:{...m.emptyExtras(),vidrioOpaco:true}};
 assert.equal(m.unitPrice(a),488829);assert.equal(m.unitPrice(b),531612);assert.equal(m.unitPrice(c),112783);assert.equal(m.quoteTotal([a,b,c]),1622053);
});
test('La primera estimación es una fija blanca de 100 × 100 cm con termopanel',()=>{
 const item=m.defaultItem();
 assert.equal(item.preset,'fixed');assert.equal(item.widthMm,1000);assert.equal(item.heightMm,1000);
 assert.equal(item.color,'BLANCO');assert.equal(item.glass,'TERMOPANEL');assert.equal(item.quantity,1);
 assert.equal(catalog.DESIGNS[0].id,'fixed');
 assert(m.unitPrice(item)<m.unitPrice(catalog.selectDesign(item,'sliding2')));
});
test('Almacenamiento alterado, cantidades inválidas y medidas fuera del rango se rechazan',()=>{
 for(const change of [{widthMm:0},{widthMm:4001},{heightMm:NaN},{quantity:0},{quantity:100},{quantity:1.5},{glass:'otro'},{color:'otro'}])assert(!m.validateItem({...m.defaultItem(),...change}));
 assert.deepEqual(m.readItems('{mal json'),[]);assert.deepEqual(m.readItems(JSON.stringify({version:99,items:[m.defaultItem()]})),[]);
 const item=m.defaultItem();assert.equal(m.readItems(JSON.stringify({version:1,items:[item,item]})).length,1);
 assert.equal(m.parseCm('180,5'),1805);assert.equal(m.parseCm('180.5'),1805);assert.equal(m.parseCm('1e3'),null);
});
