import { items, abs, NAME, lastUpdated, bySource, sourcesFaq } from '../lib/site';
export async function GET() {
  const groups = bySource().filter(g => g.list.length);
  let t = `# Where AI agent use cases come from\n\n> All ${items.length} real AI agent use cases from ${NAME}, grouped by the kind of public source they link to. Last updated ${lastUpdated}.\n\n- Web page: ${abs('/sources/')}\n${groups.map(g => `- ${g.label}: ${g.list.length}`).join('\n')}\n\n## Quick answers\n\n`;
  for (const [q, a] of sourcesFaq()) t += `### ${q}\n\n${a}\n\n`;
  for (const g of groups) {
    t += `## ${g.label} (${g.list.length})\n\n${g.blurb}\n\n`;
    for (const d of g.list) t += `- [${d.title}](${abs(`/use-cases/${d.slug}.md`)}): Agents: ${d.tools.join(', ')}. Category: ${d.category}.${d.niche ? ' Niche.' : ''} Source: ${d.source}\n`;
    t += '\n';
  }
  t += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
