import { items, cats, agents, abs, NAME, lastUpdated } from '../lib/site';
// Machine-readable copy of the whole directory, so AI search tools, researchers and
// dataset crawlers can use the data without scraping HTML. Described by the Dataset
// JSON-LD on the homepage and linked from llms.txt.
export async function GET() {
  const body = {
    name: NAME,
    url: abs('/'),
    description: 'Real-world AI agent use cases, each linked to its original public source.',
    updated: lastUpdated,
    count: items.length,
    categories: cats,
    agents,
    useCases: items.map(d => ({
      title: d.title,
      description: d.description,
      category: d.category,
      agents: d.tools,
      niche: !!d.niche,
      added: d.added || null,
      url: abs(`/use-cases/${d.slug}/`),
      markdown: abs(`/use-cases/${d.slug}.md`),
      source: d.source,
      sourceName: d.sourceName,
    })),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
