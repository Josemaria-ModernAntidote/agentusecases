// Per-page social and answer-engine preview cards (1200x630 PNG), rendered at build time with resvg
// from a bundled copy of Inter (SIL OFL, see src/assets/fonts/Inter-LICENSE.txt). No runtime cost.
import { Resvg } from '@resvg/resvg-js';
import { join } from 'node:path';

const FONTS = ['Inter-Bold.ttf', 'Inter-SemiBold.ttf'].map(f => join(process.cwd(), 'src/assets/fonts', f));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Greedy word wrap using an average glyph width for Inter Bold (about 0.52 em), so no text measuring is needed.
function wrap(text: string, size: number, width: number) {
  const max = Math.floor(width / (size * 0.52));
  const lines: string[] = []; let cur = '';
  for (const w of text.split(/\s+/)) {
    if (!cur) cur = w; else if ((cur + ' ' + w).length <= max) cur += ' ' + w; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function ogCard({ kicker, title, footer }: { kicker: string; title: string; footer: string }) {
  let size = 64, lines = wrap(title, size, 1064);
  while (lines.length > 5 && size > 36) { size -= 4; lines = wrap(title, size, 1064); }
  if (lines.length > 6) { lines = lines.slice(0, 6); lines[5] = lines[5].replace(/[\s,;:.]*$/, '') + '…'; }
  const lh = Math.round(size * 1.18);
  // Center the title block vertically between the kicker and the footer.
  const top = Math.round(325 - ((lines.length - 1) * lh) / 2 + size * 0.27);
  const tspans = lines.map((l, i) => `<tspan x="68" y="${top + i * lh}">${esc(l)}</tspan>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0d0e13"/><rect width="1200" height="8" fill="#7c5cff"/><rect y="614" width="1200" height="16" fill="#2a3040"/><rect y="622" width="1200" height="8" fill="#22d3ee"/>
<text x="68" y="92" font-family="Inter" font-weight="600" font-size="28" fill="#a99bff">${esc(kicker)}</text>
<text font-family="Inter" font-weight="700" font-size="${size}" fill="#eef1f8" letter-spacing="-1">${tspans}</text>
<text x="68" y="574" font-family="Inter" font-weight="700" font-size="28" fill="#a99bff">agent-uses.com</text>
<text x="1132" y="574" text-anchor="end" font-family="Inter" font-weight="600" font-size="24" fill="#94a0b8">${esc(footer)}</text>
</svg>`;
  return new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Inter' }, fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
