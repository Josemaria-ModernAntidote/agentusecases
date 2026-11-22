import { cardResponse } from '../../lib/mcp-card';
// MCP Server Card at the location SEP-2127 reserves: the streamable-HTTP URL plus /server-card.
export async function GET() { return cardResponse(); }
