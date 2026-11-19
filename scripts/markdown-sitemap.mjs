// Markdown sitemap: list every Markdown twin (/use-cases/<slug>.md, hub and index .md files) in
// /sitemap-markdown.xml with an accurate <lastmod>, and add it to /sitemap-index.xml so crawlers
// and answer engines that prefer Markdown can find all of it from robots.txt. Runs after astro build.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
const SITE = 'https://agent-uses.com';
const root = existsSync('.vercel/output/static') ? '.vercel/output/static' : 'dist/client';
if (existsSync(root)) {
  const data = JSON.parse(readFileSync('src/data/usecases.json', 'utf8'));
  const added = new Map(data.filter(d => d.added).map(d => [d.slug, d.added]));
  let updated = new Date().toISOString().slice(0, 10);
  try { updated = execSync('git log -1 --format=%cs -- src/data/usecases.json', { encoding: 'utf8' }).trim() || updated; } catch {}
  const monthLast = ym => [...added.values()].filter(a => a.startsWith(ym)).sort().pop();
  const files = [];
  const walk = dir => { for (const n of readdirSync(dir)) { const p = `${dir}/${n}`; if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.md')) files.push(p.slice(root.length)); } };
  walk(root);
  const lastmod = p => { const u = p.match(/^\/use-cases\/([^/]+)\.md$/); if (u) return added.get(u[1]) || updated; const a = p.match(/^\/archive\/(\d{4}-\d{2})\.md$/); return (a && monthLast(a[1])) || updated; };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  files.sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.map(p => `<url><loc>${esc(SITE + p)}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join('\n')}\n</urlset>\n`;
  writeFileSync(`${root}/sitemap-markdown.xml`, xml);
  const idx = `${root}/sitemap-index.xml`;
  if (existsSync(idx)) {
    let s = readFileSync(idx, 'utf8');
    if (!s.includes('sitemap-markdown.xml')) s = s.replace('</sitemapindex>', `<sitemap><loc>${SITE}/sitemap-markdown.xml</loc><lastmod>${updated}</lastmod></sitemap></sitemapindex>`);
    writeFileSync(idx, s);
  }
  console.log(`markdown sitemap: ${files.length} Markdown URLs`);
}
