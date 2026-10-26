import { items, agents, slugify, hubMd } from '../../lib/site';
// Markdown version of each agent hub page; linked from the HTML page and llms.txt.
export function getStaticPaths() { return agents.map(a => ({ params: { agent: slugify(a) }, props: { a } })); }
export async function GET({ props }: { props: { a: string } }) {
  const { a } = props;
  return hubMd('agent', a, items.filter(d => d.tools.includes(a)), `/agents/${slugify(a)}/`);
}
