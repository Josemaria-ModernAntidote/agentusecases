import { items, agents, cats, abs, slugify } from '../../lib/site';
// RFC 9727 API catalog: one well-known URL where agents and crawlers can discover every
// machine-readable endpoint this site offers (dataset, feeds, llms.txt, Markdown, search),
// as an RFC 9264 linkset. The homepage advertises it with Link: rel="api-catalog".
export async function GET() {
  const cat = abs('/.well-known/api-catalog');
  const doc = { href: abs('/llms.txt'), type: 'text/plain', title: 'llms.txt: what every endpoint contains' };
  const about = { href: abs('/about/'), type: 'text/html', title: 'About and FAQ' };
  const eps: [string, string, string][] = [
    ['/use-cases.json', 'application/json', `Full dataset as JSON: ${items.length} use cases with title, description, category, agents, date added and source URL`],
    ['/use-cases.csv', 'text/csv', 'Full dataset as CSV, one row per use case'],
    ['/feed.json', 'application/feed+json', 'JSON Feed 1.1 of every use case, newest first'],
    ['/rss.xml', 'application/rss+xml', 'RSS feed of new use cases'],
    ['/llms.txt', 'text/plain', 'llms.txt summary index for AI assistants'],
    ['/llms-full.txt', 'text/plain', 'Every entry in plain text with category, agents and source'],
    ['/use-cases.md', 'text/markdown', 'Every use case A to Z in Markdown'],
    ['/new.md', 'text/markdown', 'Newest additions in Markdown, grouped by day added'],
    ['/stats.md', 'text/markdown', 'Citable statistics by agent, category and week in Markdown'],
    ['/opensearch.xml', 'application/opensearchdescription+xml', 'OpenSearch description of site search (/?q=<term>)'],
    ['/sitemap-index.xml', 'application/xml', 'XML sitemap of every page'],
  ];
  const linkset = [
    { anchor: cat, item: eps.map(([p, type, title]) => ({ href: abs(p), type, title })), 'service-doc': [doc, about] },
    ...eps.map(([p]) => ({ anchor: abs(p), 'service-doc': [doc], describedby: [about] })),
    { anchor: abs('/agents/'), item: agents.map(a => ({ href: abs(`/agents/${slugify(a)}/rss.xml`), type: 'application/rss+xml', title: `${a} use cases (RSS)` })) },
    { anchor: abs('/categories/'), item: cats.map(c => ({ href: abs(`/categories/${slugify(c)}/rss.xml`), type: 'application/rss+xml', title: `${c} use cases (RSS)` })) },
  ];
  return new Response(JSON.stringify({ linkset }, null, 2) + '\n', { headers: { 'Content-Type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"' } });
}
