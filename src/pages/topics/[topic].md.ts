import { topics, topicItems, topicFaq, abs, NAME, lastUpdated } from '../../lib/site';
// Markdown version of each topic hub; linked from the HTML page and llms.txt.
export function getStaticPaths() { return topics.filter(t => topicItems(t).length >= 3).map(t => ({ params: { topic: t.slug }, props: { t } })); }
export async function GET({ props }: { props: { t: (typeof topics)[number] } }) {
  const { t } = props; const list = topicItems(t);
  let s = `# ${t.q}\n\n> ${list.length} real, source-linked examples of ${t.q} from ${NAME}. ${t.blurb} Last updated ${lastUpdated}.\n\n- Web page: ${abs(`/topics/${t.slug}/`)}\n- All topics: ${abs('/topics.md')}\n\n## Entries\n\n`;
  for (const d of list) s += `- [${d.title}](${abs(`/use-cases/${d.slug}.md`)}): ${d.description} Agents: ${d.tools.join(', ')}. Category: ${d.category}.${d.added ? ` Added ${d.added}.` : ''} Source: ${d.source}\n`;
  s += `\n## Quick answers\n\n`;
  for (const [q, a] of topicFaq(t, list)) s += `### ${q}\n\n${a}\n\n`;
  s += `---\nFrom ${NAME} (${abs('/')}). Index for LLMs: ${abs('/llms.txt')}\n`;
  return new Response(s, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
