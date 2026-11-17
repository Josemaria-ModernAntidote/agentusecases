// Announce new and changed URLs to IndexNow (Bing, Yandex, Seznam, Naver and others share submissions).
// Run after a production deploy is READY:  node scripts/indexnow.mjs [yyyy-mm-dd]
// Defaults to the most recent "added" date in the dataset. The key file lives at /public/<key>.txt.
import { readFileSync, readdirSync } from 'node:fs';

const HOST = 'agent-uses.com';
const KEY = readdirSync(new URL('../public/', import.meta.url)).find(f => /^[a-f0-9]{32}\.txt$/.test(f))?.replace('.txt', '');
if (!KEY) throw new Error('IndexNow key file missing from public/');

const items = JSON.parse(readFileSync(new URL('../src/data/usecases.json', import.meta.url), 'utf8'));
const day = process.argv[2] || items.map(i => i.added).sort().at(-1);
const fresh = items.filter(i => i.added === day);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const paths = new Set(['/', '/new/', '/niche/', '/use-cases/', '/stats/', '/sources/', '/llms.txt', '/llms-full.txt', `/archive/${day.slice(0, 7)}/`]);
for (const i of fresh) {
  paths.add(`/use-cases/${i.slug}/`);
  paths.add(`/categories/${slug(i.category)}/`);
  for (const t of i.tools) paths.add(`/agents/${slug(t)}/`);
}
const urlList = [...paths].map(p => `https://${HOST}${p}`);
const body = { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList };
if (process.env.DRY) { console.log(JSON.stringify(body, null, 2)); process.exit(0); }
const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`IndexNow ${res.status} ${res.statusText}: ${urlList.length} URLs for ${day} (${fresh.length} new entries)`);
