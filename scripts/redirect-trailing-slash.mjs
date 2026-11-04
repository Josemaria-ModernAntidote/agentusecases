// The Vercel adapter emits redirect routes as ^/path$, so /path/ (the form in our sitemap,
// trailingSlash 'ignore') falls through to the 404. Let page redirects match an optional slash.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const f = '.vercel/output/config.json';
if (existsSync(f)) {
  const c = JSON.parse(readFileSync(f, 'utf8'));
  const seen = new Set();
  c.routes = c.routes.filter(r => {
    if (r.status >= 301 && r.status <= 308 && r.headers?.Location && /\$$/.test(r.src) && !/\\\.[a-z]+\$$/.test(r.src)) r.src = r.src.replace(/\/?\$$/, '/?$');
    const k = JSON.stringify(r); if (r.status && seen.has(k)) return false; seen.add(k); return true;
  });
  writeFileSync(f, JSON.stringify(c, null, 2));
}
