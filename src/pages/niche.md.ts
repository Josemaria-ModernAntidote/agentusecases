import { items, abs, NAME, lastUpdated } from '../lib/site';
// Markdown twin of /niche/: every niche, surprising entry grouped by category.
export async function GET() {
  const list = items.filter(d => d.niche);
  const cats = [...new Set(list.map(d => d.category))].sort((a, b) => list.filter(d => d.category === b).length - list.filter(d => d.category === a).length);
  let t = `# Niche and surprising AI agent use cases\n\n> ${list.length} unusual, real AI agent use cases from individuals, hobbyists and small operators (farms, family life, hardware hacks, small shops and odd experiments) in ${NAME}, each linked to its original public source. Last updated ${lastUpdated}.\n\n- Web page: ${abs('/niche/')}\n${cats.map(c => `- ${c}: ${list.filter(d => d.category === c).length}`).join('\n')}\n\n`;
  for (const c of cats) {
    t += `## ${c}\n\n`;
    for (const d of list.filter(x => x.category === c)) t += `- [${d.title}](${abs(`/use-cases/${d.slug}/`)}) ([markdown](${abs(`/use-cases/${d.slug}.md`)})): ${d.description} Agents: ${d.tools.join(', ')}. Added ${d.added}. Source: ${d.source}\n`;
    t += '\n';
  }
  t += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(t, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
