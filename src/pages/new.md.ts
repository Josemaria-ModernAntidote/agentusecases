import { items, abs, NAME, lastUpdated } from '../lib/site';
// Markdown twin of /new/: the 40 newest entries grouped by the day they were added.
export async function GET() {
  const list = [...items].filter(d => d.added).sort((a, b) => b.added.localeCompare(a.added)).slice(0, 40);
  const days = [...new Set(list.map(d => d.added))];
  let t = `# New AI agent use cases, latest additions\n\n> The ${list.length} newest real, source-linked AI agent use cases in ${NAME}, grouped by the day they were added. Last updated ${lastUpdated}.\n\n- Web page: ${abs('/new/')}\n- RSS: ${abs('/rss.xml')}\n- JSON Feed: ${abs('/feed.json')}\n\n`;
  for (const day of days) {
    const dl = list.filter(d => d.added === day);
    t += `## Added ${day} (${dl.length})\n\n`;
    for (const d of dl) t += `- [${d.title}](${abs(`/use-cases/${d.slug}/`)}) ([markdown](${abs(`/use-cases/${d.slug}.md`)})): ${d.description} Agents: ${d.tools.join(', ')}. Category: ${d.category}. Source: ${d.source}\n`;
    t += '\n';
  }
  t += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
