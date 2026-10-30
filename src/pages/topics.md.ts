import { items, topics, topicItems, abs, NAME, lastUpdated } from '../lib/site';
// Markdown index of every topic hub with its entry count.
export async function GET() {
  const rows = topics.map(t => ({ t, n: topicItems(t).length })).filter(r => r.n >= 3).sort((a, b) => b.n - a.n);
  let s = `# AI agent use cases by topic\n\n> ${rows.length} cross-category topics drawn from ${items.length} real, source-linked entries in ${NAME}. Last updated ${lastUpdated}.\n\n`;
  for (const { t, n } of rows) s += `- [${t.q}](${abs(`/topics/${t.slug}/`)}) ([markdown](${abs(`/topics/${t.slug}.md`)})): ${n} entries. ${t.blurb}\n`;
  s += `\n---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(s, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
