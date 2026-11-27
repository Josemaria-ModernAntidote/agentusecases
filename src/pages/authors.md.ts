import { items, abs, NAME, lastUpdated, byAuthor, authorsFaq } from '../lib/site';
export async function GET() {
  const groups = byAuthor(), credited = groups.reduce((n, g) => n + g.list.length, 0);
  let t = `# Who reported these AI agent use cases\n\n> ${credited} of the ${items.length} real AI agent use cases on ${NAME} come from a source that names its first-hand author: ${groups.length} people and accounts on X, GitHub, Reddit and Medium, most entries first. Last updated ${lastUpdated}.\n\n- Web page: ${abs('/authors/')}\n\n## Quick answers\n\n`;
  for (const [q, a] of authorsFaq()) t += `### ${q}\n\n${a}\n\n`;
  t += `## All authors (${groups.length})\n\n`;
  for (const g of groups) {
    t += `### ${g.a.name}${g.a.name !== g.a.handle ? ` (${g.a.handle})` : ''}\n\nProfile: ${g.a.url}. Entries: ${g.list.length}. Anchor: ${abs(`/authors/#${g.anchor}`)}\n\n`;
    for (const d of g.list) t += `- [${d.title}](${abs(`/use-cases/${d.slug}.md`)}): Agents: ${d.tools.join(', ')}. Category: ${d.category}.${d.added ? ` Added ${d.added}.` : ''} Source: ${d.source}\n`;
    t += '\n';
  }
  t += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
