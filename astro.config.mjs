import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
// TODO: set SITE_URL to the real domain before deploy
export default defineConfig({ site: process.env.SITE_URL || 'https://agent-uses.com', output: 'static', integrations: [sitemap()] });
