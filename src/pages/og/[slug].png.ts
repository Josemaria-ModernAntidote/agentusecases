import { items } from '../../lib/site';
import { ogCard } from '../../lib/og';
export function getStaticPaths() { return items.map(d => ({ params: { slug: d.slug }, props: { d } })); }
export async function GET({ props }: { props: { d: (typeof items)[number] } }) {
  const { d } = props;
  const png = ogCard({ kicker: `${d.tools.join(' + ')} · ${d.category}`, title: d.title, footer: d.added ? `Real AI agent use case · added ${d.added}` : 'Real AI agent use case' });
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
