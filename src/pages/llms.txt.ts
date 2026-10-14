import data from '../data/usecases.json';
export async function GET() {
  const cats = [...new Set(data.map(d => d.category))];
  let t = `# AI Agent Use Cases\n\n> A curated directory of ${data.length} real-world AI agent use cases (OpenClaw, Claude Code, OpenAI Codex, Devin, Cursor, Grok Bot, Hermes Agent, Manus and more), each linked to its original source.\n\n`;
  for (const c of cats) { t += `## ${c}\n\n`; for (const d of data.filter(x => x.category === c)) t += `- [${d.title}](${d.source}): ${d.description} Tools: ${d.tools.join(', ')}.\n`; t += '\n'; }
  return new Response(t, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
