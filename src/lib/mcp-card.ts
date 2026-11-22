// MCP Server Card (SEP-2127, schema v1) for the read-only /mcp endpoint. Served at
// /mcp/server-card (the reserved location), mirrored at /.well-known/mcp/server-card.json for
// older scanners, and listed in the AI Catalog at /.well-known/ai-catalog.json.
export const MCP_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
export const serverCard = () => ({
  $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
  name: 'com.agent-uses/use-cases',
  title: 'AI Agent Use Cases',
  description: 'Search real, source-linked AI agent use cases by keyword, agent and category (read-only).',
  version: '1.0.0',
  websiteUrl: 'https://agent-uses.com/',
  remotes: [{ type: 'streamable-http', url: 'https://agent-uses.com/mcp', supportedProtocolVersions: MCP_PROTOCOL_VERSIONS }],
});
export const cardResponse = () => new Response(JSON.stringify(serverCard(), null, 2) + '\n', { headers: { 'Content-Type': 'application/mcp-server-card+json', 'Access-Control-Allow-Origin': '*' } });
