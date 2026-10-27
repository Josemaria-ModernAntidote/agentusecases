import { items, NAME, rss } from '../lib/site';
// RSS feed of use cases, newest first, so readers, aggregators and answer engines can pick up new entries.
export async function GET() {
  return rss(`${NAME}: new use cases`, 'Real AI agent use cases, each linked to its original source. Newest first.', '/', '/rss.xml', items);
}
