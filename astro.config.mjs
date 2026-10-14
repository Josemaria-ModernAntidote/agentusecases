import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
export default defineConfig({ site: 'https://agent-uses.com', trailingSlash: 'ignore', output: 'static', adapter: vercel(), integrations: [sitemap({ filter: p => !p.includes('/api/'), changefreq: 'weekly', lastmod: new Date() })] });
