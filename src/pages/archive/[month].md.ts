import { months, monthFaq, abs, NAME } from '../../lib/site';
// Markdown version of each monthly archive; linked from the HTML page and llms.txt.
export function getStaticPaths() { return months().map(m => ({ params: { month: m.ym }, props: { m } })); }
export async function GET({ props }: { props: { m: ReturnType<typeof months>[number] } }) {
  const { m } = props; const list = m.list;
  let s = `# AI agent use cases added in ${m.name}\n\n> ${list.length} real, source-linked AI agent use cases added to ${NAME} in ${m.name}.\n\n- Web page: ${abs(`/archive/${m.ym}/`)}\n- All months: ${abs('/archive.md')}\n\n`;
  for (const day of [...new Set(list.map(d => d.added))].reverse()) {
    s += `## ${day}\n\n`;
    for (const d of list.filter(x => x.added === day)) s += `- [${d.title}](${abs(`/use-cases/${d.slug}.md`)}): ${d.description} Agents: ${d.tools.join(', ')}. Category: ${d.category}.${d.niche ? ' Niche.' : ''} Source: ${d.source}\n`;
    s += '\n';
  }
  s += `## Quick answers\n\n`;
  for (const [q, a] of monthFaq(m.name, list)) s += `### ${q}\n\n${a}\n\n`;
  s += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(s, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
