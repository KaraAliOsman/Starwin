import {build} from 'esbuild';
await build({entryPoints:['worker/visualizer.mjs'],bundle:true,format:'esm',platform:'browser',target:'es2022',external:['cloudflare:workers','node:buffer'],outfile:'output/visualizer-worker.mjs',minify:true});
console.log('Cloudflare visualizer worker bundled.');
