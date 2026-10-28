import { items, abs, NAME, lastUpdated, matrix, compareFaq, slugify } from '../lib/site';
export async function GET() {
  const { byAgent, catOrder, cell } = matrix();
  let t = `# Which AI agent is used for what?\n\n> How often each of ${byAgent.length} AI agents appears in each category across ${items.length} real, source-linked use cases from ${NAME}. An entry can use more than one agent. Last updated ${lastUpdated}.\n\n- Web page: ${abs('/compare/')}\n\n`;
  t += `| Agent | Total | ${catOrder.join(' | ')} |\n|---|---|${catOrder.map(() => '---').join('|')}|\n`;
  for (const { a, list } of byAgent) t += `| [${a}](${abs(`/agents/${slugify(a)}.md`)}) | ${list.length} | ${catOrder.map(c => cell(a, c)).join(' | ')} |\n`;
  t += `\n## Quick answers\n\n`;
  for (const [q, a] of compareFaq()) t += `### ${q}\n\n${a}\n\n`;
  t += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
