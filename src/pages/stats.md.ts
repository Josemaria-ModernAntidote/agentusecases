import { abs, NAME, lastUpdated, stats, share } from '../lib/site';
export async function GET() {
  const s = stats(); const pc = (n: number) => share(n, s.total);
  let t = `# AI agent use case statistics\n\n> Counts from ${s.total} real, source-linked AI agent use cases in ${NAME}. Updated ${lastUpdated}.\n\n- Web page: ${abs('/stats/')}\n- Raw data: ${abs('/use-cases.csv')} and ${abs('/use-cases.json')}\n\n## Key numbers\n\n`;
  for (const f of s.facts) t += `### ${f.q}\n\n${f.a} (${abs(`/stats/#${f.id}`)})\n\n`;
  t += `## Use cases by agent\n\n| Agent | Entries | Share | Added in last 7 days |\n|---|---|---|---|\n${s.byAgent.map(r => `| ${r.a} | ${r.n} | ${pc(r.n)} | ${r.n7} |`).join('\n')}\n\nAn entry can use more than one agent.\n\n`;
  t += `## Use cases by category\n\n| Category | Entries | Share |\n|---|---|---|\n${s.byCat.map(r => `| ${r.c} | ${r.n} | ${pc(r.n)} |`).join('\n')}\n\n`;
  t += `## Growth by week\n\n| Week ending | Added | Running total |\n|---|---|---|\n${s.weeks.map(w => `| ${w.end} | ${w.added} | ${w.total} |`).join('\n')}\n\n`;
  t += `## How to cite\n\n${NAME}, "AI agent use case statistics", ${abs('/stats/')}, updated ${lastUpdated}.\n\n---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
