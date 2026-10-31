import {defineConfig} from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import {apiDevPlugin} from './scripts/api-dev.mjs';
import {site} from './src/config/site.ts';

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: {enabled:false},
  integrations: [react(), sitemap()],
  vite: {cacheDir:process.argv.includes('dev')?'node_modules/.vite-starwin-dev':'node_modules/.vite-starwin-build',plugins: [apiDevPlugin()]},
});
