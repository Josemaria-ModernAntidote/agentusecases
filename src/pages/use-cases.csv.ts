import { csv } from '../lib/site';
// The whole directory as CSV (one row per use case), listed in the Dataset JSON-LD and llms.txt.
export async function GET() { return new Response(csv(), { headers: { 'Content-Type': 'text/csv; charset=utf-8' } }); }
