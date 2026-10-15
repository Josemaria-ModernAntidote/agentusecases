import data from '../data/usecases.json';
import { execSync } from 'node:child_process';
export const SITE = 'https://agent-uses.com';
export const NAME = 'AI Agent Use Cases';
export const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const items = data;
export const cats = [...new Set(data.map(d => d.category))];
export const agents = [...new Set(data.flatMap(d => d.tools))];
let updated = new Date().toISOString().slice(0, 10);
try { updated = execSync('git log -1 --format=%cs -- src/data/usecases.json', { encoding: 'utf8' }).trim() || updated; } catch {}
export const lastUpdated = updated;
// Trim meta descriptions at a word boundary instead of mid-word.
export const clip = (s: string, n = 155) => { if (s.length <= n) return s; const c = s.slice(0, n - 1); const i = c.lastIndexOf(' '); return (i > n * 0.6 ? c.slice(0, i) : c).replace(/[\s,;:.\-–—(]+$/, '') + '…'; };
// Related use cases: score by shared category and agents, then rotate through the list starting
// after the current entry so internal links are spread across every page instead of the first few.
export const relatedTo = (d: (typeof data)[number], n = 6) => {
  const N = data.length, at = data.findIndex(x => x.slug === d.slug);
  return data.map((x, i) => ({ x, i, s: (x.category === d.category ? 2 : 0) + x.tools.filter(t => d.tools.includes(t)).length + (!!x.niche === !!d.niche ? 0.5 : 0) }))
    .filter(r => r.x.slug !== d.slug && r.s >= 1)
    .sort((a, b) => b.s - a.s || ((a.i - at + N) % N) - ((b.i - at + N) % N))
    .slice(0, n).map(r => r.x);
};
export const abs = (p: string) => new URL(p, SITE).href;
export const crumbs = (list: [string, string][]) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })) });
export const itemList = (name: string, list: typeof data) => ({ '@context': 'https://schema.org', '@type': 'ItemList', name, numberOfItems: list.length, itemListElement: list.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.title, url: abs(`/use-cases/${d.slug}/`) })) });
