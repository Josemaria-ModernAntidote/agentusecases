// AI Catalog (domain-level discovery for MCP Server Cards): one entry for the read-only /mcp server.
export async function GET() {
  const cat = { specVersion: '1.0', entries: [{ identifier: 'urn:air:agent-uses.com:mcp:use-cases', type: 'application/mcp-server-card+json', url: 'https://agent-uses.com/mcp/server-card' }] };
  return new Response(JSON.stringify(cat, null, 2) + '\n', { headers: { 'Content-Type': 'application/ai-catalog+json', 'Access-Control-Allow-Origin': '*' } });
}
