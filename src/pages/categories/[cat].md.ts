import { items, cats, slugify, hubMd } from '../../lib/site';
// Markdown version of each category hub page; linked from the HTML page and llms.txt.
export function getStaticPaths() { return cats.map(c => ({ params: { cat: slugify(c) }, props: { c } })); }
export async function GET({ props }: { props: { c: string } }) {
  const { c } = props;
  return hubMd('category', c, items.filter(d => d.category === c), `/categories/${slugify(c)}/`);
}
