// Look at the demo page: bun run scripts/page.ts writes shots/page-<width>-<n>.png, one viewport at a time down the page.
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

await mkdir('shots', { recursive: true });
const reduced = process.argv.includes('--reduced');
const browser = await chromium.launch({ channel: 'chrome' });
for (const [width, height] of [[390, 844], [1440, 900]] as const) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: width < 600, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  page.on('pageerror', (e) => console.error(width, e.message));
  page.on('console', (m) => m.type() === 'error' && console.error(width, m.text()));
  await page.goto(`file://${process.cwd()}/demo/dist/index.html`);
  await page.waitForTimeout(2600);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0, n = 0; y < total; y += height - 60, n++) {
    await page.evaluate((to) => scrollTo(0, to), y);
    await page.waitForTimeout(2400);
    await page.screenshot({ path: `shots/page-${width}${reduced ? '-reduced' : ''}-${n}.png` });
  }
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(width, 'page height', total, wide ? 'OVERFLOWS SIDEWAYS' : 'no sideways overflow');
  await page.close();
}
await browser.close();
