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
// Source types (/sources/ and /sources.md): every entry grouped by the kind of public source it
// links to, so readers and answer engines can tell community reports (posts, repos, blogs)
// apart from vendor case studies and press coverage, and cite the right kind of evidence.
const VENDOR = ['cognition.ai', 'devin.ai', 'claude.com', 'anthropic.com', 'openai.com', 'cursor.com', 'x.ai', 'hermes-agent.nousresearch.com', 'manus.im'];
const PRESS = ['thedrum.com', 'gizmodo.com', 'inman.com', 'bbc.co.uk', 'theverge.com', 'newclawtimes.com'];
export const sourceTypes = [
  { key: 'x', label: 'Posts on X', blurb: 'Reports posted on X, mostly by the people who set up or use the agent.' },
  { key: 'github', label: 'GitHub repositories', blurb: 'Open source projects, skills and curated lists with code or setup notes.' },
  { key: 'hn', label: 'Hacker News (Show HN)', blurb: 'Projects their builders posted to Hacker News for discussion.' },
  { key: 'blog', label: 'Blogs and newsletters', blurb: 'Write-ups on personal sites, small company blogs, Medium and Substack.' },
  { key: 'press', label: 'News and media', blurb: 'Stories reported by journalists and publications.' },
  { key: 'vendor', label: 'Vendor case studies and docs', blurb: 'Customer stories, guides and docs published by the companies that make the agents.' },
] as const;
export const sourceType = (u: string) => {
  let h = ''; try { h = new URL(u).hostname.replace(/^www\./, ''); } catch {}
  if (h === 'x.com' || h === 'twitter.com') return 'x';
  if (h === 'github.com') return 'github';
  if (h === 'news.ycombinator.com') return 'hn';
  if (VENDOR.includes(h)) return 'vendor';
  if (PRESS.includes(h)) return 'press';
  return 'blog';
};
export const bySource = () => sourceTypes.map(s => ({ ...s, list: data.filter(d => sourceType(d.source) === s.key) }));
export const sourcesFaq = (): [string, string][] => {
  const g = bySource(); const n = (k: string) => g.find(x => x.key === k)!.list.length;
  const firstHand = n('x') + n('github') + n('hn') + n('blog');
  return [
    ['Where do these AI agent use cases come from?', `All ${data.length} entries link to a public source: ${g.filter(x => x.list.length).map(x => `${x.label} (${x.list.length})`).join(', ')}.`],
    ['How many come from the community rather than vendor marketing?', `${firstHand} of ${data.length} come from community sources (posts on X, GitHub, Hacker News, blogs and newsletters). ${n('vendor')} are vendor case studies or docs and ${n('press')} are press stories.`],
    ['Which source type has the most niche examples?', (() => { const r = g.map(x => [x.label, x.list.filter(d => d.niche).length] as const).sort((a, b) => b[1] - a[1]); return `${r[0][0]}, with ${r[0][1]} niche entries, followed by ${r.slice(1, 3).map(([l, c]) => `${l} (${c})`).join(' and ')}.`; })()],
  ];
};
// Topic hubs (/topics/<slug>/): cross-category themes people actually search for, such as
// "AI agents for farming" or "AI agents for kids". Membership is matched on each entry's title and
// description, so new entries join the right topics automatically; `skip` lists slug prefixes of
// entries that match a keyword but are not really about the topic.
type Topic = { slug: string; name: string; q: string; blurb: string; re: RegExp; skip?: string[] };
export const topics: Topic[] = [
  { slug: 'kids-and-parenting', name: 'Kids and parenting', q: 'AI agents for parents and kids', blurb: 'Parents using agents for school logistics, homework, learning games and family life.', re: /\b(kids?|kid's|children|daughters'?|seven-year-old|8-year-old|homework|school|textbooks?)\b/i },
  { slug: 'farming-and-gardening', name: 'Farming and gardening', q: 'AI agents for farming and gardening', blurb: 'Farms, greenhouses, gardens and beehives run or helped by AI agents.', re: /\b(farms?|farm's|farmer|gardens?|garden beds|greenhouse|seedlings|tomato plant|fertilizer|beehive|alpaca)\b/i, skip: ['five-coding-agents-stranded'] },
  { slug: '3d-printing', name: '3D printing', q: 'AI agents for 3D printing', blurb: 'Agents that design, watch over or revive 3D printers and printed parts.', re: /3d[- ]print|3d printer/i },
  { slug: 'smart-home-and-diy-hardware', name: 'Smart home and DIY hardware', q: 'AI agents for smart home and DIY hardware', blurb: 'Raspberry Pis, ESP32s, e-ink screens, Home Assistant and other hardware wired to an agent.', re: /home assistant|homekit|raspberry pi|pi zero|esp32|e-ink|smart plug|energy meter|electricity monitor|arduino|\bpico\b/i },
  { slug: 'cars-and-trucks', name: 'Cars and trucks', q: 'AI agents for cars and trucks', blurb: 'Buying cars, reading car networks, racing and running truck fleets with an agent.', re: /\b(cars?|car's|cybertruck|dealers?|dealership|citro[eë]n|racer|trucks)\b/i, skip: ['trippy-', 'realtor-'] },
  { slug: 'food-and-drink', name: 'Food and drink', q: 'AI agents for restaurants, food and drink', blurb: 'Restaurants, coffee and tea shops, barbecue, home brewing and wine.', re: /\b(restaurants?|coffee shop|bubble tea|brisket|bbq|brew|wine|bakery)\b/i, skip: ['trippy-'] },
  { slug: 'music', name: 'Music', q: 'AI agents for music', blurb: 'Practice tools, songwriting partners and record collections built with agents.', re: /\b(music|piano|karaoke|ableton|songwriting|singer|choir|bandcamp|record store)\b/i, skip: ['ai-video-editing'] },
  { slug: 'games-and-gaming', name: 'Games and gaming', q: 'AI agents for games and gaming', blurb: 'Board games, fantasy leagues, ROM hacks, flight sims and games made for kids.', re: /\b(video game|games?|gaming|minecraft|dungeon master|arcade|pinball|fantasy football|board game|pok[eé]mon|flight sim|DCS)\b/i, skip: ['next-bird'] },
  { slug: 'animals-and-nature', name: 'Animals and nature', q: 'AI agents for animals, pets and nature', blurb: 'Pets, livestock, bees, birds, fish and reef tanks.', re: /\b(pets?|dogs?|alpacas?|horse farm|horses|birds?|ebird|bass fishing|reef tank|beehive|bees)\b/i, skip: ['a-90s-pinball', 'a-dad-s-agent-turns-every-scanned'] },
  { slug: 'radio-and-astronomy', name: 'Radio and astronomy', q: 'AI agents for ham radio and astronomy', blurb: 'Ham radio, LoRaWAN, Morse code, telescopes and exoplanet hunting.', re: /\b(ham radio|FT8|LoRaWAN|telescope|exoplanets?|satellite dish|morse)\b/i },
  { slug: 'trades-and-field-service', name: 'Trades and field service', q: 'AI agents for tradespeople', blurb: 'Plumbers, HVAC techs, machine shops, auto repair and crews in trucks.', re: /\b(plumber|plumbing|hvac|tradies|machine shop|auto repair|field service|40 trucks|dryer|handyman|woodworking)\b/i },
];
export const topicItems = (t: Topic) => data.filter(d => t.re.test(`${d.title} ${d.description}`) && !(t.skip ?? []).some(s => d.slug.startsWith(s)));
export const topicsFor = (d: (typeof data)[number]) => topics.filter(t => topicItems(t).some(x => x.slug === d.slug));
export const topicFaq = (t: Topic, list: typeof data): [string, string][] => {
  const ag = [...new Set(list.flatMap(d => d.tools))]; const cs = [...new Set(list.map(d => d.category))]; const recent = newest(list);
  const counts = ag.map(a => [a, list.filter(d => d.tools.includes(a)).length] as const).sort((x, y) => y[1] - x[1]);
  const qa: [string, string][] = [[`What are real examples of ${t.q}?`, `This directory lists ${list.length} documented examples of ${t.q}, across ${cs.length} ${cs.length === 1 ? 'category' : 'categories'} (${cs.join(', ')}). Examples: ${names(list)}.`]];
  qa.push([`Which AI agents are used for ${t.name.toLowerCase()}?`, `${counts.map(([a, n]) => `${a} (${n})`).join(', ')}.`]);
  if (recent[0]) qa.push([`What is the newest example?`, `"${recent[0].title}", added on ${recent[0].added}.`]);
  qa.push([`Are these examples real?`, `Yes. Every entry links to its original public source, such as a post on X, a blog or a GitHub repository, and entries without a public source are not listed.`]);
  return qa;
};
// Head-to-head agent pages (/compare/<a>-vs-<b>/ and .md): "Claude Code vs OpenAI Codex" style
// queries answered from real, source-linked entries instead of marketing claims. Only agents with
// at least 5 entries are paired, so every page has enough examples on both sides.
export const vsAgents = () => agents.map(a => ({ a, n: data.filter(d => d.tools.includes(a)).length })).filter(r => r.n >= 5).sort((x, y) => y.n - x.n).map(r => r.a);
export const vsPairs = () => { const v = vsAgents(); const out: { a: string; b: string; slug: string }[] = []; v.forEach((a, i) => v.slice(i + 1).forEach(b => out.push({ a, b, slug: `${slugify(a)}-vs-${slugify(b)}` }))); return out; };
export const vsData = (a: string, b: string) => {
  const la = data.filter(d => d.tools.includes(a)), lb = data.filter(d => d.tools.includes(b));
  const both = data.filter(d => d.tools.includes(a) && d.tools.includes(b));
  const onlyA = la.filter(d => !d.tools.includes(b)), onlyB = lb.filter(d => !d.tools.includes(a));
  const rows = [...cats].map(c => ({ c, na: la.filter(d => d.category === c).length, nb: lb.filter(d => d.category === c).length })).filter(r => r.na || r.nb).sort((x, y) => (y.na + y.nb) - (x.na + x.nb));
  return { la, lb, both, onlyA, onlyB, rows };
};
const pct = (n: number, t: number) => t ? Math.round((100 * n) / t) : 0;
export const vsFaq = (a: string, b: string): [string, string][] => {
  const { la, lb, both, rows } = vsData(a, b);
  const topOf = (k: 'na' | 'nb') => [...rows].filter(r => r[k]).sort((x, y) => y[k] - x[k]).slice(0, 3).map(r => `${r.c} (${r[k]})`).join(', ');
  const leanA = rows.filter(r => r.na > r.nb).map(r => r.c), leanB = rows.filter(r => r.nb > r.na).map(r => r.c);
  const qa: [string, string][] = [
    [`${a} vs ${b}: which has more real-world use cases?`, `In this directory ${a} appears in ${la.length} documented use cases and ${b} in ${lb.length}, out of ${data.length} total. ${both.length ? `${both.length} ${both.length === 1 ? 'entry uses' : 'entries use'} both together.` : 'No entry uses both together yet.'}`],
    [`What do people use ${a} for compared with ${b}?`, `${a}'s top categories are ${topOf('na')}. ${b}'s top categories are ${topOf('nb')}.${leanA.length ? ` ${a} shows up more often in ${leanA.join(', ')}.` : ''}${leanB.length ? ` ${b} shows up more often in ${leanB.join(', ')}.` : ''}`],
    [`Which is used more for niche and personal projects, ${a} or ${b}?`, `${la.filter(d => d.niche).length} of ${a}'s ${la.length} entries (${pct(la.filter(d => d.niche).length, la.length)}%) are tagged niche, meaning individuals, hobbies, small operators or odd experiments, versus ${lb.filter(d => d.niche).length} of ${b}'s ${lb.length} (${pct(lb.filter(d => d.niche).length, lb.length)}%).`],
  ];
  if (both.length) qa.push([`Do people use ${a} and ${b} together?`, `Yes, in ${both.length} documented ${both.length === 1 ? 'case' : 'cases'}, for example ${names(both, 2)}.`]);
  qa.push([`Where do these numbers come from?`, `They are counts of real, source-linked entries in ${NAME}, not benchmarks. Every entry links to a public post, repository or write-up, and an entry can use more than one agent.`]);
  return qa;
};
