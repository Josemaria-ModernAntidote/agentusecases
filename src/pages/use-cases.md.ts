import { items, abs, NAME, lastUpdated } from '../lib/site';
// Markdown twin of /use-cases/: every entry A to Z, one line each.
export async function GET() {
  const key = (s: string) => s.replace(/^[^a-z0-9]+/i, '');
  const list = [...items].sort((a, b) => key(a.title).localeCompare(key(b.title), 'en', { sensitivity: 'base' }));
  let t = `# All AI agent use cases, A to Z\n\n> All ${list.length} real AI agent use cases in ${NAME}, in alphabetical order, each with its agents, category, date added and original public source. Last updated ${lastUpdated}.\n\n- Web page: ${abs('/use-cases/')}\n- Full text of every entry: ${abs('/llms-full.txt')}\n\n`;
  for (const d of list) t += `- [${d.title}](${abs(`/use-cases/${d.slug}/`)}) ([markdown](${abs(`/use-cases/${d.slug}.md`)})): ${d.tools.join(', ')}; ${d.category}; added ${d.added}. Source: ${d.source}\n`;
  t += `\n---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
