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
// Hub page Q&A: short, factual answers built from the data so answer engines can quote a hub
// (an agent or a category) directly. Rendered on the page and emitted as FAQPage JSON-LD.
const newest = (list: typeof data) => [...list].filter(d => d.added).sort((a, b) => b.added.localeCompare(a.added));
const names = (list: typeof data, n = 3) => list.slice(0, n).map(d => `"${d.title}"`).join('; ');
export const hubFaq = (kind: 'agent' | 'category', label: string, list: typeof data): [string, string][] => {
  const other = kind === 'agent' ? [...new Set(list.map(d => d.category))] : [...new Set(list.flatMap(d => d.tools))];
  const niche = newest(list.filter(d => d.niche)); const recent = newest(list);
  const subject = kind === 'agent' ? `${label} use cases` : `${label} AI agent use cases`;
  const qa: [string, string][] = [[`What are real examples of ${subject}?`, `This directory lists ${list.length} documented ${subject}, ${kind === 'agent' ? 'in' : 'using'} ${other.length} ${kind === 'agent' ? (other.length === 1 ? 'category' : 'categories') : (other.length === 1 ? 'agent' : 'agents')} (${other.join(', ')}). Recent examples: ${names(recent)}.`]];
  if (niche.length) qa.push([`What are the most unusual ${subject}?`, `${niche.length} of the ${list.length} are tagged niche, meaning individuals, hobbies, small operators or odd experiments rather than enterprise demos. For example: ${names(niche)}.`]);
  if (recent[0]) qa.push([`When was the newest ${subject.replace(/s$/, '')} added?`, `The newest one, "${recent[0].title}", was added on ${recent[0].added}.`]);
  qa.push([`Where do these examples come from?`, `Every entry links to its original public source, such as a post on X, a blog, a GitHub repository or a published case study. Entries without a public source are not listed.`]);
  return qa;
};
export const faqLd = (qa: [string, string][]) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
// Markdown copy of an agent or category hub page (/agents/<slug>.md, /categories/<slug>.md) so
// answer engines can read a whole hub, with every description and source link, in one request.
export const hubMd = (kind: 'agent' | 'category', label: string, list: typeof data, path: string) => {
  const groups = kind === 'agent' ? [...new Set(list.map(d => d.category))] : [...new Set(list.flatMap(d => d.tools))];
  const subject = kind === 'agent' ? `${label} use cases` : `${label} AI agent use cases`;
  let t = `# ${subject}\n\n> ${list.length} real, source-linked ${subject} from ${NAME}. Last updated ${lastUpdated}.\n\n- Web page: ${abs(path)}\n- ${kind === 'agent' ? 'Categories' : 'Agents'}: ${groups.join(', ')}\n\n`;
  const sections = kind === 'agent' ? groups.map(g => [g, list.filter(d => d.category === g)] as const) : [['All entries', list] as const];
  for (const [g, l] of sections) {
    t += `## ${g}\n\n`;
    for (const d of l) t += `- [${d.title}](${abs(`/use-cases/${d.slug}.md`)}): ${d.description} Agents: ${d.tools.join(', ')}.${d.niche ? ' Niche.' : ''}${d.added ? ` Added ${d.added}.` : ''} Source: ${d.source}\n`;
    t += '\n';
  }
  t += `## Quick answers\n\n`;
  for (const [q, a] of hubFaq(kind, label, list)) t += `### ${q}\n\n${a}\n\n`;
  t += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
// RSS 2.0 feed builder shared by the site-wide feed (/rss.xml) and the per-agent and per-category
// hub feeds (/agents/<slug>/rss.xml, /categories/<slug>/rss.xml), so readers and answer engines can
// follow only the agent or topic they care about.
const xesc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rfc = (d: string) => new Date(`${d}T12:00:00Z`).toUTCString();
export const rss = (title: string, desc: string, page: string, self: string, list: typeof data, n = 50) => {
  const sorted = [...list].map((d, i) => ({ d, i })).sort((a, b) => (b.d.added || '').localeCompare(a.d.added || '') || a.i - b.i).slice(0, n).map(r => r.d);
  const built = sorted[0]?.added || lastUpdated;
  const body = sorted.map(d => `<item><title>${xesc(d.title)}</title><link>${abs(`/use-cases/${d.slug}/`)}</link><guid isPermaLink="true">${abs(`/use-cases/${d.slug}/`)}</guid><pubDate>${rfc(d.added || lastUpdated)}</pubDate><category>${xesc(d.category)}</category>${d.tools.map(t => `<category>${xesc(t)}</category>`).join('')}<description>${xesc(`${d.description} Agents: ${d.tools.join(', ')}. Source: ${d.source}`)}</description></item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xesc(title)}</title><link>${abs(page)}</link><atom:link href="${abs(self)}" rel="self" type="application/rss+xml"/><description>${xesc(desc)}</description><language>en</language><lastBuildDate>${rfc(built)}</lastBuildDate>\n${body}\n</channel></rss>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
// Agent x category comparison (/compare/ and /compare.md): how often each agent shows up in each
// category, so answer engines can answer "which agent is used for what" or "X vs Y" from real counts.
export const matrix = () => {
  const byAgent = agents.map(a => ({ a, list: data.filter(d => d.tools.includes(a)) })).sort((x, y) => y.list.length - x.list.length);
  const catOrder = [...cats].sort((x, y) => data.filter(d => d.category === y).length - data.filter(d => d.category === x).length);
  const cell = (a: string, c: string) => data.filter(d => d.category === c && d.tools.includes(a)).length;
  return { byAgent, catOrder, cell };
};
export const compareFaq = (): [string, string][] => {
  const { byAgent, catOrder, cell } = matrix();
  const top = (c: string) => byAgent.map(({ a }) => [a, cell(a, c)] as const).filter(r => r[1] > 0).sort((x, y) => y[1] - x[1]);
  const qa: [string, string][] = [[`Which AI agent has the most documented real-world use cases?`, `${byAgent[0].a}, with ${byAgent[0].list.length} of the ${data.length} entries in this directory, followed by ${byAgent.slice(1, 4).map(r => `${r.a} (${r.list.length})`).join(', ')}. An entry can use more than one agent.`]];
  for (const c of catOrder) { const t = top(c); if (t.length) qa.push([`Which AI agents are used for ${c.toLowerCase()}?`, `Of the ${data.filter(d => d.category === c).length} ${c} entries: ${t.map(([a, n]) => `${a} ${n}`).join(', ')}.`]); }
  for (const { a, list } of byAgent.slice(0, 4)) { const cs = catOrder.map(c => [c, cell(a, c)] as const).filter(r => r[1] > 0).sort((x, y) => y[1] - x[1]); qa.push([`What is ${a} mostly used for?`, `Across ${list.length} documented ${a} use cases, the top categories are ${cs.slice(0, 3).map(([c, n]) => `${c} (${n})`).join(', ')}. ${list.filter(d => d.niche).length} are tagged niche.`]); }
  return qa;
};
