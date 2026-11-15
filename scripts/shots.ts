// Look at the figures in a real browser: bun run shots <figure...> writes shots/<figure>.png,
// a strip of the entrance and of the pointer at a few places. With no names it shoots every figure.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { figures, svg } from '../src/index.ts';

const names = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const reduced = process.argv.includes('--reduced');
const picked = names.length ? figures.filter((f) => names.includes(f.name)) : figures;
const SIZE = 240;
const POINTS: [number, number][] = [[30, 40], [100, 100], [170, 60], [60, 160], [180, 170]];

const built = await Bun.build({ entrypoints: [`${import.meta.dir}/shots.page.ts`], format: 'iife', minify: false });
const script = await built.outputs[0]!.text();
await mkdir('shots', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
for (const figure of picked) {
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  page.on('pageerror', (e) => console.error(figure.name, e.message));
  await page.setContent(`<body style="margin:0"><div id="f" data-name="${figure.name}">${svg(figure)}</div><script>${script}</script></body>`);
  const frames: Buffer[] = [];
  for (const wait of [250, 300, 400, 1800]) {
    await page.waitForTimeout(wait);
    frames.push(await page.screenshot());
  }
  for (const [x, y] of POINTS) {
    await page.mouse.move((x / 200) * SIZE, (y / 200) * SIZE, { steps: 6 });
    await page.waitForTimeout(700);
    frames.push(await page.screenshot());
  }
  await page.mouse.move(-10, -10);
  await page.waitForTimeout(900);
  frames.push(await page.screenshot());
  await page.setViewportSize({ width: SIZE * 5 + 8 * 6, height: SIZE * 2 + 8 * 3 });
  await page.setContent(
    `<body style="margin:0;padding:8px;background:#888;display:grid;grid-template-columns:repeat(5,${SIZE}px);gap:8px">${frames.map((f) => `<img width="${SIZE}" src="data:image/png;base64,${f.toString('base64')}">`).join('')}</body>`,
  );
  await page.screenshot({ path: `shots/${figure.name}${reduced ? '-reduced' : ''}.png` });
  await page.close();
}
await browser.close();
