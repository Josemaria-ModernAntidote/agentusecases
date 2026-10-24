import { items, slugify, abs, lastUpdated, NAME, relatedTo } from '../../lib/site';
// Plain Markdown copy of every use case page at /use-cases/<slug>.md (the llms.txt convention):
// answer engines and agents get the facts and the source link without HTML, nav or scripts.
// Each HTML page points here with <link rel="alternate" type="text/markdown">.
export function getStaticPaths() { return items.map(d => ({ params: { slug: d.slug }, props: { d } })); }
export async function GET({ props }: { props: { d: (typeof items)[number] } }) {
  const { d } = props;
  const modified = (d as any).updated ?? d.added ?? lastUpdated;
  const page = abs(`/use-cases/${d.slug}/`);
  let t = `# ${d.title}\n\n> ${d.description}\n\n`;
  t += `- Agent(s): ${d.tools.map(a => `[${a}](${abs(`/agents/${slugify(a)}/`)})`).join(', ')}\n`;
  t += `- Category: [${d.category}](${abs(`/categories/${slugify(d.category)}/`)})\n`;
  if (d.niche) t += `- Tag: Niche (individuals, hobbies, small operators or odd experiments)\n`;
  t += `- Original source: [${d.sourceName}](${d.source})\n`;
  if (d.added) t += `- Added: ${d.added}\n`;
  t += `- Last updated: ${modified}\n- Web page: ${page}\n`;
  const rel = relatedTo(d);
  if (rel.length) { t += `\n## Related use cases\n\n`; for (const r of rel) t += `- [${r.title}](${abs(`/use-cases/${r.slug}.md`)}) (${r.tools.join(', ')})\n`; }
  t += `\n---\nFrom ${NAME} (${abs('/')}), a directory of real AI agent use cases, each linked to its public source. Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
