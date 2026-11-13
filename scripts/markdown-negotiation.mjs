// Markdown for agents: when a client sends "Accept: text/markdown" (as AI agents and answer
// engines increasingly do), serve the Markdown twin of the page at the same URL instead of HTML.
// Every HTML page with a Markdown version also gets a Link: rel="alternate" header pointing at it,
// and Vary: Accept so caches keep the two representations apart. Runs after astro build.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
const f = '.vercel/output/config.json';
const root = existsSync('.vercel/output/static') ? '.vercel/output/static' : 'dist/client';
if (existsSync(f)) {
  const c = JSON.parse(readFileSync(f, 'utf8'));
  const md = { type: 'header', key: 'accept', value: '.*text/markdown.*' };
  // Hubs whose every page /<dir>/<slug>/ has a twin at /<dir>/<slug>.md.
  const dirs = ['use-cases', 'agents', 'categories', 'compare', 'archive', 'topics'].filter(d => existsSync(`${root}/${d}`) && readdirSync(`${root}/${d}`).some(n => n.endsWith('.md')));
  // Top-level pages /<page>/ with a twin at /<page>.md.
  const pages = ['new', 'niche', 'stats', 'archive', 'compare', 'sources', 'topics'].filter(p => existsSync(`${root}/${p}.md`));
  const hub = `^/(${dirs.join('|')})/([^/.]+)/?$`, top = `^/(${pages.join('|')})/?$`;
  const routes = [
    { src: hub, has: [md], dest: '/$1/$2.md', headers: { Vary: 'Accept' } },
    { src: top, has: [md], dest: '/$1.md', headers: { Vary: 'Accept' } },
    { src: '^/$', has: [md], dest: '/llms.txt', headers: { Vary: 'Accept' } },
    { src: hub, headers: { Vary: 'Accept', Link: '</$1/$2.md>; rel="alternate"; type="text/markdown"' }, continue: true },
    { src: top, headers: { Vary: 'Accept', Link: '</$1.md>; rel="alternate"; type="text/markdown"' }, continue: true },
    { src: '^/$', headers: { Vary: 'Accept', Link: '</llms.txt>; rel="alternate"; type="text/plain"' }, continue: true },
  ];
  const at = c.routes.findIndex(r => r.handle === 'filesystem');
  c.routes = c.routes.filter(r => !(r.has || []).some(h => h.value === md.value) && !(r.headers?.Vary === 'Accept'));
  c.routes.splice(c.routes.findIndex(r => r.handle === 'filesystem'), 0, ...routes);
  writeFileSync(f, JSON.stringify(c, null, 2));
  console.log(`markdown negotiation: ${dirs.length} hub dirs, ${pages.length} top pages (filesystem at ${at})`);
}
