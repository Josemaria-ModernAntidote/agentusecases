import type { APIRoute } from 'astro';
export const prerender = false;

// Adds an email to a Resend audience (contacts only; no email is sent).
// Env: RESEND_API_KEY (needs full access, not send-only), RESEND_AUDIENCE_ID
export const POST: APIRoute = async ({ request }) => {
  let email = '';
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) email = String((await request.json()).email || '');
    else email = String((await request.formData()).get('email') || '');
  } catch {}
  email = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return json({ ok: false, error: 'Please enter a valid email.' }, 400);
  const key = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
  const audience = import.meta.env.RESEND_AUDIENCE_ID ?? process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) return json({ ok: false, error: 'Newsletter not configured.' }, 500);
  const r = await fetch(`https://api.resend.com/audiences/${audience}/contacts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, unsubscribed: false }),
  });
  if (!r.ok) return json({ ok: false, error: 'Could not subscribe right now.' }, 502);
  return json({ ok: true });
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } });
