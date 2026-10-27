import { items, agents, slugify, NAME, rss } from '../../../lib/site';
// Per-agent RSS feed (newest first); advertised with rel=alternate on the agent hub and listed in llms.txt.
export function getStaticPaths() { return agents.map(a => ({ params: { agent: slugify(a) }, props: { a } })); }
export async function GET({ props }: { props: { a: string } }) {
  const { a } = props, s = slugify(a);
  return rss(`${a} use cases | ${NAME}`, `New real, source-linked ${a} use cases. Newest first.`, `/agents/${s}/`, `/agents/${s}/rss.xml`, items.filter(d => d.tools.includes(a)));
}
