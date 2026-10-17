import { items, cats, agents, slugify, abs, lastUpdated } from '../lib/site';
export async function GET() {
  let t = `# AI Agent Use Cases: full dataset\n\n> ${items.length} real-world AI agent use cases across ${cats.length} categories and ${agents.length} agents. Every entry links to its original public source. Last updated ${lastUpdated}. Site: ${abs('/')} Niche & surprising entries: ${abs('/niche/')}\n\n`;
  for (const c of cats) {
    t += `## ${c}\n\n`;
    for (const d of items.filter(x => x.category === c)) t += `### ${d.title}\n\n${d.description}\n\n- Agents: ${d.tools.join(', ')}\n- Category: ${d.category}\n- Page: ${abs(`/use-cases/${d.slug}/`)}\n- Source: ${d.source} (${d.sourceName})\n\n`;
  }
  return new Response(t, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
