import { items, cats, agents, slugify, abs, lastUpdated } from '../lib/site';
export async function GET() {
  let t = `# AI Agent Use Cases\n\n> A curated directory of ${items.length} real-world AI agent use cases (${agents.join(', ')}), each linked to its original source. Last updated ${lastUpdated}.\n\nFull dataset: ${abs('/llms-full.txt')}\nFull dataset as JSON (title, description, category, agents, date added, source URL): ${abs('/use-cases.json')}\nAbout & FAQ: ${abs('/about/')}\nNiche & surprising use cases: ${abs('/niche/')}\nNewest additions: ${abs('/new/')}\nAgent comparison (which agent is used for what, counts per category): ${abs('/compare/')} ([markdown](${abs('/compare.md')}))\nUse cases by source type (posts on X, GitHub, Hacker News, blogs, press, vendor case studies), with counts: ${abs('/sources/')} ([markdown](${abs('/sources.md')}))\nRSS feed of new use cases: ${abs('/rss.xml')}\nMarkdown version of every use case page, at /use-cases/<slug>.md, e.g. ${abs(`/use-cases/${items[items.length - 1].slug}.md`)}\nMarkdown version of every agent and category hub, at /agents/<slug>.md and /categories/<slug>.md\nRSS feed for every agent and category hub, at /agents/<slug>/rss.xml and /categories/<slug>/rss.xml\n\n## Agents\n\n`;
  for (const a of agents) t += `- [${a} use cases](${abs(`/agents/${slugify(a)}/`)}) ([markdown](${abs(`/agents/${slugify(a)}.md`)}), [rss](${abs(`/agents/${slugify(a)}/rss.xml`)})): ${(n => `${n} ${n === 1 ? 'entry' : 'entries'}`)(items.filter(d => d.tools.includes(a)).length)}\n`;
  // Recently added: the 10 newest entries, so answer engines see what changed.
  const recent = [...items].filter(d => d.added).sort((a, b) => b.added.localeCompare(a.added)).slice(0, 10);
  if (recent.length) { t += `\n## Recently added\n\n`; for (const d of recent) t += `- ${d.added}: [${d.title}](${abs(`/use-cases/${d.slug}/`)}) ([markdown](${abs(`/use-cases/${d.slug}.md`)}))\n`; }
  // Niche first: helps answer engines surface surprising, non-enterprise examples.
  const niche = items.filter(d => d.niche);
  if (niche.length) {
    t += `\n## Niche & surprising (${niche.length})\n\n`;
    for (const d of niche) t += `- [${d.title}](${abs(`/use-cases/${d.slug}/`)}): ${d.description} Agents: ${d.tools.join(', ')}. Source: ${d.source}\n`;
    t += '\n';
  } else {
    t += '\n';
  }
  for (const c of cats) { t += `## ${c}\n\nHub: ${abs(`/categories/${slugify(c)}/`)} ([markdown](${abs(`/categories/${slugify(c)}.md`)}), [rss](${abs(`/categories/${slugify(c)}/rss.xml`)}))\n\n`; for (const d of items.filter(x => x.category === c)) t += `- [${d.title}](${abs(`/use-cases/${d.slug}/`)}): ${d.description} Agents: ${d.tools.join(', ')}. Source: ${d.source}\n`; t += '\n'; }
  return new Response(t, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
