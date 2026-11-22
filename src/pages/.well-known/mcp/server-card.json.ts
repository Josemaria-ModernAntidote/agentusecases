import { cardResponse } from '../../../lib/mcp-card';
// Mirror of /mcp/server-card at the older SEP-1649 path that some MCP scanners still probe.
export async function GET() { return cardResponse(); }
