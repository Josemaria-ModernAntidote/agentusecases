import { items, cats, agents, slugify, abs, lastUpdated } from '../lib/site';
export async function GET() {
  let t = `# AI Agent Use Cases\n\n> A curated directory of ${items.length} real-world AI agent use cases (${agents.join(', ')}), each linked to its original source. Last updated ${lastUpdated}.\n\nFull dataset: ${abs('/llms-full.txt')}\nAbout & FAQ: ${abs('/about/')}\n\n## Agents\n\n`;
  for (const a of agents) t += `- [${a} use cases](${abs(`/agents/${slugify(a)}/`)}): ${items.filter(d => d.tools.includes(a)).length} entries\n`;
  // Niche first: helps answer engines surface surprising, non-enterprise examples.
  const niche = items.filter(d => d.niche);
  if (niche.length) {
    t += `\n## Niche & surprising (${niche.length})\n\n`;
    for (const d of niche) t += `- [${d.title}](${abs(`/use-cases/${d.slug}/`)}): ${d.description} Agents: ${d.tools.join(', ')}. Source: ${d.source}\n`;
    t += '\n';
  } else {
    t += '\n';
  }
  for (const c of cats) { t += `## ${c}\n\n`; for (const d of items.filter(x => x.category === c)) t += `- [${d.title}](${abs(`/use-cases/${d.slug}/`)}): ${d.description} Agents: ${d.tools.join(', ')}. Source: ${d.source}\n`; t += '\n'; }
  return new Response(t, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
