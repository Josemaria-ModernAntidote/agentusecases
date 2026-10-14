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
export const abs = (p: string) => new URL(p, SITE).href;
export const crumbs = (list: [string, string][]) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(p) })) });
export const itemList = (name: string, list: typeof data) => ({ '@context': 'https://schema.org', '@type': 'ItemList', name, numberOfItems: list.length, itemListElement: list.map((d, i) => ({ '@type': 'ListItem', position: i + 1, name: d.title, url: abs(`/use-cases/${d.slug}/`) })) });
