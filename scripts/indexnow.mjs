// Announce new and changed URLs to IndexNow (Bing, Yandex, Seznam, Naver and others share submissions),
// then ping the WebSub hub for every feed that changed so subscribers get the new entries pushed.
// Run after a production deploy is READY:  node scripts/indexnow.mjs [yyyy-mm-dd]
// Defaults to the most recent "added" date in the dataset. The key file lives at /public/<key>.txt.
import { readFileSync, readdirSync } from 'node:fs';

const HOST = 'agent-uses.com';
const KEY = readdirSync(new URL('../public/', import.meta.url)).find(f => /^[a-f0-9]{32}\.txt$/.test(f))?.replace('.txt', '');
if (!KEY) throw new Error('IndexNow key file missing from public/');

const items = JSON.parse(readFileSync(new URL('../src/data/usecases.json', import.meta.url), 'utf8'));
const day = process.argv[2] || items.map(i => i.added).sort().at(-1);
const fresh = items.filter(i => i.added === day);
// Same rule as slugify() in src/lib/site.ts (& becomes "and"), so category URLs such as /categories/hobbies-and-games/ match the site.
const slug = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const paths = new Set(['/', '/new/', '/niche/', '/use-cases/', '/stats/', '/sources/', '/authors/', '/llms.txt', '/llms-full.txt', `/archive/${day.slice(0, 7)}/`]);
for (const i of fresh) {
  paths.add(`/use-cases/${i.slug}/`);
  paths.add(`/categories/${slug(i.category)}/`);
  for (const t of i.tools) paths.add(`/agents/${slug(t)}/`);
}
const urlList = [...paths].map(p => `https://${HOST}${p}`);
const body = { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList };
const HUB = 'https://pubsubhubbub.appspot.com/';
const feeds = new Set(['/rss.xml', '/feed.json']);
for (const i of fresh) {
  feeds.add(`/categories/${slug(i.category)}/rss.xml`);
  for (const t of i.tools) feeds.add(`/agents/${slug(t)}/rss.xml`);
}
const feedUrls = [...feeds].map(p => `https://${HOST}${p}`);
if (process.env.DRY) { console.log(JSON.stringify({ ...body, websub: feedUrls }, null, 2)); process.exit(0); }
const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`IndexNow ${res.status} ${res.statusText}: ${urlList.length} URLs for ${day} (${fresh.length} new entries)`);
let ok = 0;
for (const u of feedUrls) {
  const r = await fetch(HUB, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ 'hub.mode': 'publish', 'hub.url': u }) });
  if (r.status === 204 || r.ok) ok++; else console.log(`WebSub ${r.status} for ${u}`);
}
console.log(`WebSub hub pinged: ${ok}/${feedUrls.length} feeds`);
