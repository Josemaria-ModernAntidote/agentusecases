import { items, abs, NAME, lastUpdated } from '../lib/site';
// RSS feed of use cases, newest first, so readers, aggregators and answer engines can pick up new entries.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rfc = (d: string) => new Date(`${d}T12:00:00Z`).toUTCString();
export async function GET() {
  const list = [...items].map((d, i) => ({ d, i })).sort((a, b) => (b.d.added || '').localeCompare(a.d.added || '') || a.i - b.i).slice(0, 50).map(r => r.d);
  const body = list.map(d => `<item><title>${esc(d.title)}</title><link>${abs(`/use-cases/${d.slug}/`)}</link><guid isPermaLink="true">${abs(`/use-cases/${d.slug}/`)}</guid><pubDate>${rfc(d.added || lastUpdated)}</pubDate><category>${esc(d.category)}</category><description>${esc(`${d.description} Agents: ${d.tools.join(', ')}. Source: ${d.source}`)}</description></item>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(NAME)}: new use cases</title><link>${abs('/')}</link><atom:link href="${abs('/rss.xml')}" rel="self" type="application/rss+xml"/><description>Real AI agent use cases, each linked to its original source. Newest first.</description><language>en</language><lastBuildDate>${rfc(lastUpdated)}</lastBuildDate>\n${body}\n</channel></rss>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
