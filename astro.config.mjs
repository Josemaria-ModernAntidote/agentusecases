import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
// Accurate per-URL <lastmod> in the sitemap: a use case page uses the date it was added,
// every other page uses the date the dataset last changed. Stamping every URL with the
// build time teaches crawlers to ignore lastmod, so we avoid that.
const data = JSON.parse(readFileSync(new URL('./src/data/usecases.json', import.meta.url), 'utf8'));
const added = new Map(data.filter(d => d.added).map(d => [d.slug, d.added]));
let dataUpdated = new Date().toISOString().slice(0, 10);
try { dataUpdated = execSync('git log -1 --format=%cs -- src/data/usecases.json', { encoding: 'utf8' }).trim() || dataUpdated; } catch {}
const lastmodFor = url => { const m = url.match(/\/use-cases\/([^/]+)\/?$/); return (m && added.get(m[1])) || dataUpdated; };
export default defineConfig({ site: 'https://agent-uses.com', trailingSlash: 'ignore', output: 'static', adapter: vercel(), integrations: [sitemap({ filter: p => !p.includes('/api/'), changefreq: 'weekly', serialize: item => ({ ...item, lastmod: lastmodFor(item.url) }) })] });
