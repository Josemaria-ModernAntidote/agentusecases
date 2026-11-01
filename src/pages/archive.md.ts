import { items, months, abs, NAME, lastUpdated } from '../lib/site';
// Markdown index of the monthly archives.
export async function GET() {
  let s = `# AI agent use cases by month\n\n> All ${items.length} real, source-linked entries in ${NAME}, grouped by the month they were added. Last updated ${lastUpdated}.\n\n`;
  for (const m of months()) s += `- [AI agent use cases added in ${m.name}](${abs(`/archive/${m.ym}/`)}) ([markdown](${abs(`/archive/${m.ym}.md`)})): ${m.list.length} entries, ${m.list.filter(d => d.niche).length} niche\n`;
  s += `\n---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(s, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
