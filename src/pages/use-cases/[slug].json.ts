import { items, slugify, abs, lastUpdated, NAME, relatedTo, sourceType, sourceLabel } from '../../lib/site';
// One small JSON document per use case at /use-cases/<slug>.json, so an agent or answer engine
// that needs a single entry (to cite it, check its source or show a card) can fetch a few hundred
// bytes instead of the whole dataset or the HTML page. Linked from each page with
// <link rel="alternate" type="application/json">, from /use-cases.json, the API catalog and llms.txt.
export function getStaticPaths() { return items.map(d => ({ params: { slug: d.slug }, props: { d } })); }
export async function GET({ props }: { props: { d: (typeof items)[number] } }) {
  const { d } = props;
  const page = abs(`/use-cases/${d.slug}/`);
  const modified = (d as any).updated ?? d.added ?? lastUpdated;
  const body = {
    title: d.title,
    description: d.description,
    category: { name: d.category, url: abs(`/categories/${slugify(d.category)}/`) },
    agents: d.tools.map(a => ({ name: a, url: abs(`/agents/${slugify(a)}/`) })),
    niche: !!d.niche,
    added: d.added || null,
    updated: modified,
    url: page,
    markdown: abs(`/use-cases/${d.slug}.md`),
    image: abs(`/og/${d.slug}.png`),
    source: { url: d.source, name: d.sourceName, type: sourceType(d.source), typeLabel: sourceLabel(d.source) },
    citation: `${NAME}. (${(d.added ?? modified).slice(0, 4)}). ${d.title}. Retrieved from ${page} (original source: ${d.source})`,
    related: relatedTo(d).map(r => ({ title: r.title, url: abs(`/use-cases/${r.slug}/`), json: abs(`/use-cases/${r.slug}.json`) })),
    dataset: abs('/use-cases.json'),
  };
  return new Response(JSON.stringify(body, null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
