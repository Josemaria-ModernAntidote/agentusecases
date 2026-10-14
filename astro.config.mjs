import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
export default defineConfig({ site: process.env.SITE_URL || 'https://agent-uses.com', output: 'static', adapter: vercel(), integrations: [sitemap()] });
