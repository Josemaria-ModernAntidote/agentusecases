import { items, NAME, abs, lastUpdated } from '../lib/site';
// JSON Feed 1.1 of every use case, newest first: a structured, machine-readable feed for readers, aggregators and AI crawlers.
export async function GET() {
  const sorted = [...items].map((d, i) => ({ d, i })).sort((a, b) => (b.d.added || '').localeCompare(a.d.added || '') || b.i - a.i).map(r => r.d);
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: `${NAME}: new use cases`,
    home_page_url: abs('/'),
    feed_url: abs('/feed.json'),
    description: `Real AI agent use cases, each linked to its original source. ${items.length} entries, newest first. Last updated ${lastUpdated}.`,
    language: 'en',
    items: sorted.map(d => ({
      id: abs(`/use-cases/${d.slug}/`),
      url: abs(`/use-cases/${d.slug}/`),
      external_url: d.source,
      title: d.title,
      content_text: `${d.description} Agents: ${d.tools.join(', ')}. Source: ${d.source}`,
      summary: d.description,
      date_published: d.added ? `${d.added}T12:00:00Z` : undefined,
      tags: [d.category, ...d.tools, ...(d.niche ? ['Niche'] : [])],
      _agent_uses: { category: d.category, agents: d.tools, niche: !!d.niche, source_name: d.sourceName, markdown: abs(`/use-cases/${d.slug}.md`) },
    })),
  };
  return new Response(JSON.stringify(feed, null, 1), { headers: { 'Content-Type': 'application/feed+json; charset=utf-8' } });
}
