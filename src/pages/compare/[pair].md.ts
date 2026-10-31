import { abs, NAME, lastUpdated, vsPairs, vsData, vsFaq } from '../../lib/site';
export function getStaticPaths() { return vsPairs().map(p => ({ params: { pair: p.slug }, props: p })); }
export async function GET({ props }: { props: { a: string; b: string; slug: string } }) {
  const { a, b, slug } = props;
  const { la, lb, both, onlyA, onlyB, rows } = vsData(a, b);
  const line = (d: (typeof la)[number]) => `- [${d.title}](${abs(`/use-cases/${d.slug}.md`)}): ${d.description} Agents: ${d.tools.join(', ')}. Category: ${d.category}. Source: ${d.source}\n`;
  let t = `# ${a} vs ${b}: what people actually use them for\n\n> Built from real, source-linked entries in ${NAME}, not benchmarks. ${a}: ${la.length} use cases. ${b}: ${lb.length}. Both together: ${both.length}. Last updated ${lastUpdated}.\n\n- Web page: ${abs(`/compare/${slug}/`)}\n\n## By category\n\n| Category | ${a} | ${b} |\n|---|---|---|\n`;
  for (const r of rows) t += `| ${r.c} | ${r.na} | ${r.nb} |\n`;
  if (both.length) { t += `\n## Using ${a} and ${b} together\n\n`; for (const d of both) t += line(d); }
  t += `\n## ${a} only\n\n`; for (const d of onlyA) t += line(d);
  t += `\n## ${b} only\n\n`; for (const d of onlyB) t += line(d);
  t += `\n## Quick answers\n\n`; for (const [q, ans] of vsFaq(a, b)) t += `### ${q}\n\n${ans}\n\n`;
  t += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
