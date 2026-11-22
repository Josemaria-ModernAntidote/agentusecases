import type { APIRoute } from 'astro';
import data from '../data/usecases.json';
import { MCP_PROTOCOL_VERSIONS as VERSIONS } from '../lib/mcp-card';
export const prerender = false;

// Read-only MCP server (Model Context Protocol, Streamable HTTP transport, stateless JSON
// responses) so AI assistants and agents can search the directory as a tool instead of
// scraping pages. Connect any MCP client to https://agent-uses.com/mcp. No auth, no writes,
// no sessions: every POST carries one JSON-RPC message and gets one JSON response.
const SITE = 'https://agent-uses.com';
const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
type Item = (typeof data)[number];
const agents = [...new Set(data.flatMap(d => d.tools))];
const cats = [...new Set(data.map(d => d.category))];
const card = (d: Item) => ({ title: d.title, description: d.description, agents: d.tools, category: d.category, niche: !!d.niche, added: d.added ?? null, url: `${SITE}/use-cases/${d.slug}/`, markdown: `${SITE}/use-cases/${d.slug}.md`, source: d.source, source_name: d.sourceName, slug: d.slug });
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]+/g, ' ');
const findAgent = (a?: string) => a ? agents.find(x => norm(x).trim() === norm(a).trim() || slugify(x) === slugify(a)) ?? null : undefined;
const findCat = (c?: string) => c ? cats.find(x => norm(x).trim() === norm(c).trim() || slugify(x) === slugify(c)) ?? null : undefined;

const TOOLS = [
  { name: 'search_use_cases', title: 'Search AI agent use cases', description: `Search ${data.length} real, source-linked AI agent use cases (${agents.join(', ')}) by keyword, agent and category. Returns matching entries with summary, agents, category, date added, page URL and original source URL.`, inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'Keywords, e.g. "3D printer", "phone call", "Raspberry Pi". Empty matches everything.' }, agent: { type: 'string', enum: agents, description: 'Only entries that use this agent' }, category: { type: 'string', enum: cats, description: 'Only entries in this category' }, niche: { type: 'boolean', description: 'true for niche and surprising entries only' }, limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 } } }, annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: 'get_use_case', title: 'Get one use case', description: 'Full entry for one use case by its slug or page URL, with a ready-made citation.', inputSchema: { type: 'object', properties: { slug: { type: 'string', description: 'Slug (from search results) or https://agent-uses.com/use-cases/<slug>/ URL' } }, required: ['slug'] }, annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: 'latest_use_cases', title: 'Newest use cases', description: 'The most recently added use cases, newest first. New entries are added most days.', inputSchema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }, agent: { type: 'string', enum: agents } } }, annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: 'list_agents', title: 'List agents and categories', description: 'Every agent and category in the directory with entry counts and hub page URLs.', inputSchema: { type: 'object', properties: {} }, annotations: { readOnlyHint: true, openWorldHint: false } },
];

const text = (obj: unknown) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }], structuredContent: obj });
const toolErr = (msg: string) => ({ content: [{ type: 'text', text: msg }], isError: true });
const clampN = (n: unknown, def = 10) => Math.max(1, Math.min(50, Number.isFinite(Number(n)) ? Math.floor(Number(n)) : def));

function callTool(name: string, a: Record<string, unknown> = {}) {
  if (name === 'search_use_cases') {
    const agent = findAgent(a.agent as string), cat = findCat(a.category as string);
    if (agent === null) return toolErr(`Unknown agent. Known agents: ${agents.join(', ')}`);
    if (cat === null) return toolErr(`Unknown category. Known categories: ${cats.join(', ')}`);
    const terms = norm(String(a.query ?? '')).split(/\s+/).filter(t => t.length > 1);
    const scored = data.filter(d => (!agent || d.tools.includes(agent)) && (!cat || d.category === cat) && (a.niche === undefined || !!d.niche === !!a.niche))
      .map(d => { const t = norm(d.title), all = norm(`${d.title} ${d.description} ${d.tools.join(' ')} ${d.category}`); return { d, s: terms.reduce((s, w) => s + (t.includes(w) ? 3 : 0) + (all.includes(w) ? 1 : 0), 0), hit: terms.every(w => all.includes(w)) }; })
      .filter(r => !terms.length || r.s > 0)
      .sort((x, y) => Number(y.hit) - Number(x.hit) || y.s - x.s || String(y.d.added ?? '').localeCompare(String(x.d.added ?? '')));
    const results = scored.slice(0, clampN(a.limit)).map(r => card(r.d));
    return text({ total_matches: scored.length, returned: results.length, results, browse: `${SITE}/use-cases/` });
  }
  if (name === 'get_use_case') {
    const s = String(a.slug ?? '').trim().replace(/^https?:\/\/[^/]+\/use-cases\//, '').replace(/(\.md|\.json)?\/?$/, '');
    const d = data.find(x => x.slug === s);
    if (!d) return toolErr(`No use case with slug "${s}". Use search_use_cases to find slugs.`);
    return text({ ...card(d), citation: `AI Agent Use Cases. (${String(d.added ?? '').slice(0, 4)}). ${d.title}. Retrieved from ${SITE}/use-cases/${d.slug}/ (original source: ${d.source})` });
  }
  if (name === 'latest_use_cases') {
    const agent = findAgent(a.agent as string);
    if (agent === null) return toolErr(`Unknown agent. Known agents: ${agents.join(', ')}`);
    const list = data.map((d, i) => ({ d, i })).filter(r => !agent || r.d.tools.includes(agent)).sort((x, y) => String(y.d.added ?? '').localeCompare(String(x.d.added ?? '')) || y.i - x.i).slice(0, clampN(a.limit)).map(r => card(r.d));
    return text({ returned: list.length, results: list, rss: `${SITE}/rss.xml` });
  }
  if (name === 'list_agents') {
    return text({ total_use_cases: data.length, agents: agents.map(x => ({ name: x, entries: data.filter(d => d.tools.includes(x)).length, url: `${SITE}/agents/${slugify(x)}/` })), categories: cats.map(c => ({ name: c, entries: data.filter(d => d.category === c).length, url: `${SITE}/categories/${slugify(c)}/` })) });
  }
  return null;
}

const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID', 'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS } });
const rpcErr = (id: unknown, code: number, message: string, status = 200) => json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } }, status);

function handle(m: any) {
  const { id, method, params } = m ?? {};
  if (m?.jsonrpc !== '2.0' || typeof method !== 'string') return { error: [-32600, 'Invalid Request'] as const };
  if (id === undefined) return { notification: true }; // notifications/initialized, cancelled, etc.
  switch (method) {
    case 'initialize': {
      const v = VERSIONS.includes(params?.protocolVersion) ? params.protocolVersion : VERSIONS[0];
      return { result: { protocolVersion: v, capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'com.agent-uses/use-cases', title: 'AI Agent Use Cases', version: '1.0.0', websiteUrl: SITE }, instructions: `Read-only search over ${data.length} real AI agent use cases, each linked to its original public source. Use search_use_cases first, then get_use_case for a citation. When quoting an entry, link its page and its original source.` } };
    }
    case 'ping': return { result: {} };
    case 'tools/list': return { result: { tools: TOOLS } };
    case 'tools/call': {
      const r = callTool(String(params?.name ?? ''), params?.arguments ?? {});
      return r ? { result: r } : { error: [-32602, `Unknown tool: ${params?.name}`] as const };
    }
    case 'resources/list': return { result: { resources: [] } };
    case 'prompts/list': return { result: { prompts: [] } };
    default: return { error: [-32601, `Method not found: ${method}`] as const };
  }
}

export const POST: APIRoute = async ({ request }) => {
  let m: any;
  try { m = await request.json(); } catch { return rpcErr(null, -32700, 'Parse error', 400); }
  if (Array.isArray(m)) return rpcErr(null, -32600, 'Batching is not supported; send one JSON-RPC message per request', 400);
  const r = handle(m);
  if ('notification' in r) return new Response(null, { status: 202, headers: CORS });
  if ('error' in r && r.error) return rpcErr(m?.id, r.error[0], r.error[1]);
  return json({ jsonrpc: '2.0', id: m.id, result: (r as any).result });
};

// No server-initiated stream: GET is not offered (MCP spec allows 405 here).
export const GET: APIRoute = async () => new Response(JSON.stringify({ name: 'AI Agent Use Cases MCP server', transport: 'streamable-http', endpoint: `${SITE}/mcp`, usage: 'POST JSON-RPC 2.0 messages (initialize, tools/list, tools/call). Read-only, no auth.', tools: TOOLS.map(t => t.name), docs: `${SITE}/llms.txt` }, null, 2), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'POST, OPTIONS', ...CORS } });
export const OPTIONS: APIRoute = async () => new Response(null, { status: 204, headers: CORS });
// Any other method gets 405 here instead of falling through to the 404 lookup, which crashes the function.
export const ALL: APIRoute = async () => new Response(null, { status: 405, headers: { Allow: 'POST, OPTIONS', ...CORS } });
