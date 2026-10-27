import { items, cats, slugify, NAME, rss } from '../../../lib/site';
// Per-category RSS feed (newest first); advertised with rel=alternate on the category hub and listed in llms.txt.
export function getStaticPaths() { return cats.map(c => ({ params: { cat: slugify(c) }, props: { c } })); }
export async function GET({ props }: { props: { c: string } }) {
  const { c } = props, s = slugify(c);
  return rss(`${c} AI agent use cases | ${NAME}`, `New real, source-linked ${c} AI agent use cases. Newest first.`, `/categories/${s}/`, `/categories/${s}/rss.xml`, items.filter(d => d.category === c));
}
