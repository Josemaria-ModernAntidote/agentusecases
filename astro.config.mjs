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
// Each use case page lists its preview card (/og/<slug>.png) as an image sitemap entry.
const titles = new Map(data.map(d => [d.slug, d.title]));
let dataUpdated = new Date().toISOString().slice(0, 10);
try { dataUpdated = execSync('git log -1 --format=%cs -- src/data/usecases.json', { encoding: 'utf8' }).trim() || dataUpdated; } catch {}
// A finished monthly archive (/archive/<yyyy-mm>/) keeps the date of its last entry.
const monthLast = ym => [...added.values()].filter(a => a.startsWith(ym)).sort().pop();
const lastmodFor = url => { const m = url.match(/\/use-cases\/([^/]+)\/?$/); if (m) return added.get(m[1]) || dataUpdated; const a = url.match(/\/archive\/(\d{4}-\d{2})\/?$/); return (a && monthLast(a[1])) || dataUpdated; };
export default defineConfig({ site: 'https://agent-uses.com', trailingSlash: 'ignore', output: 'static', redirects: { '/agents/codex': '/agents/openai-codex/', '/agents/codex.md': '/agents/openai-codex.md', '/agents/codex/rss.xml': '/agents/openai-codex/rss.xml', '/use-cases/a-dad-with-no-blender-skills-uses-claude-code-to-make-roblox-hair-matching-his-daughter-s-real-haircut': '/use-cases/a-girl-dad-who-didn-t-want-to-buy-a-roblox-skin-has-claude-code-rig-a-creative-commons-3d-model-as-his-own-avatar/', '/use-cases/a-dad-with-no-blender-skills-uses-claude-code-to-make-roblox-hair-matching-his-daughter-s-real-haircut.md': '/use-cases/a-girl-dad-who-didn-t-want-to-buy-a-roblox-skin-has-claude-code-rig-a-creative-commons-3d-model-as-his-own-avatar.md', '/use-cases/a-dad-with-no-blender-skills-uses-claude-code-to-make-roblox-hair-matching-his-daughter-s-real-haircut.json': '/use-cases/a-girl-dad-who-didn-t-want-to-buy-a-roblox-skin-has-claude-code-rig-a-creative-commons-3d-model-as-his-own-avatar.json' }, adapter: vercel(), integrations: [sitemap({ filter: p => !p.includes('/api/'), changefreq: 'weekly', serialize: item => { const m = item.url.match(/\/use-cases\/([^/]+)\/?$/); return { ...item, lastmod: lastmodFor(item.url), ...(m && added.has(m[1]) ? { img: [{ url: `https://agent-uses.com/og/${m[1]}.png`, title: titles.get(m[1]) }] } : {}) }; } })] });
