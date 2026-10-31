import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const b=JSON.parse(await fs.readFile('verificacion/browser-check.json','utf8'));
const q=JSON.parse(await fs.readFile('diseno/reconstruccion-oct23/cotizar/resultado.json','utf8'));
const h=JSON.parse(await fs.readFile('diseno/reconstruccion-oct23/verificacion-interfaz.json','utf8'));
const performance=JSON.parse(await fs.readFile('verificacion/rendimiento.json','utf8')).results.find(r=>r.route==='/');
const files=await fs.readdir('public/images');const rasters=files.filter(f=>/\.(webp|png|jpe?g)$/.test(f));
const report={at:new Date().toISOString(),functional:{at:b.date,groups:b.checks.length,errors:b.errors.length,httpFailures:b.httpFailures.length,axeViolations:b.accessibility.reduce((n,r)=>n+r.violations.length,0)},quote:q,interface:h,performance,pricingSha256:crypto.createHash('sha256').update(await fs.readFile('src/features/estimator/app/pricing/pricing.ts')).digest('hex'),provenance:{rasters:rasters.length,missingSidecars:rasters.filter(f=>!files.includes(f+'.json'))},lastChange:'Solo ajuste de la frase introductoria y documentos después de la integración; build y capturas finales de13:06 Chile.'};
await fs.writeFile('diseno/reconstruccion-oct23/ENTREGA.json',JSON.stringify(report,null,2));console.log(JSON.stringify({functional:report.functional,pricing:report.pricingSha256,provenance:report.provenance},null,2));
