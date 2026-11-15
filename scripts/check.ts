// What bun test cannot see, checked in a real Chrome: bun run check.
// The waiting state, the pointer, reduced motion, theming, and React hydrating the server's HTML.
import { chromium, type Page } from 'playwright-core';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { orbit, svg } from '../src/index.ts';
import { Orbit } from '../src/react.ts';

const built = await Bun.build({ entrypoints: [`${import.meta.dir}/check.page.ts`], format: 'iife', define: { 'process.env.NODE_ENV': '"development"' } });
const script = `<script>${(await built.outputs[0]!.text()).replace(/<\/script/g, '<\\/script')}</script>`;
const browser = await chromium.launch({ channel: 'chrome' });
let failed = 0;
const ok = (what: string, pass: boolean, got?: unknown) => {
  if (!pass) failed++;
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${what}${pass || got === undefined ? '' : ` (got ${JSON.stringify(got)})`}`);
};

async function open(body: string, reduced = false) {
  const page = await browser.newPage({ viewport: { width: 400, height: 400 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.setContent(`<body style="margin:0"><div id="f" style="width:400px">${body}</div></body>`);
  return { page, errors };
}
const opacities = (page: Page) => page.evaluate(() => [...document.querySelectorAll('[data-fx]')].map((el) => getComputedStyle(el).opacity));
const disc = (page: Page) => page.evaluate(() => (document.querySelector('[data-p="disc"]') as SVGElement).style.transform);
const hover = async (page: Page) => {
  await page.mouse.move(360, 200, { steps: 4 });
  await page.waitForTimeout(1500);
};

{
  const { page } = await open(svg(orbit));
  ok('a plain string is complete at once, with no script', (await opacities(page)).every((o) => o === '1'));
  await page.close();
}
{
  const { page } = await open(svg(orbit, { wait: true }));
  ok('a waiting string holds its parts back', (await opacities(page)).every((o) => o === '0'));
  await page.waitForTimeout(3300);
  ok('and shows them by itself after three seconds if no script comes', (await opacities(page)).every((o) => o === '1'));
  await page.close();
}
{
  const { page } = await open(svg(orbit, { wait: true }), true);
  ok('with reduced motion a waiting string hides nothing', (await opacities(page)).every((o) => o === '1'));
  await page.close();
}
{
  const { page, errors } = await open(svg(orbit, { wait: true }) + script);
  await page.evaluate(() => (window as any).lib.mount(document.getElementById('f'), (window as any).lib.orbit));
  ok('mount keeps a waiting figure hidden until it is drawn', (await opacities(page)).some((o) => o === '0'));
  await page.waitForTimeout(2600);
  ok('the entrance ends with every part shown', (await opacities(page)).every((o) => o === '1'));
  await hover(page);
  ok('the pointer moves a part', (await disc(page)) === 'translate(6.4px, 0px) rotate(0deg) scale(1, 1)', await disc(page));
  await page.mouse.move(399, 399);
  await page.mouse.move(200, 500);
  await page.waitForTimeout(2500);
  ok('and the part comes back to rest when it leaves', (await disc(page)) === '', await disc(page));
  ok('no errors on the page', errors.length === 0, errors);
  await page.close();
}
{
  const { page } = await open(svg(orbit) + script, true);
  await page.evaluate(() => (window as any).lib.mount(document.getElementById('f'), (window as any).lib.orbit, { play: true }));
  await page.waitForTimeout(800);
  await hover(page);
  const state = await page.evaluate(() => ({
    opacity: [...document.querySelectorAll('[data-fx]')].every((el) => getComputedStyle(el).opacity === '1'),
    moved: [...document.querySelectorAll<SVGElement>('[data-p]')].some((el) => el.style.transform),
    animations: document.getAnimations().length,
  }));
  ok('with reduced motion a mounted figure is complete and still, even with play and a pointer', state.opacity && !state.moved && state.animations === 0, state);
  await page.close();
}
{
  const { page } = await open(`<div style="--cutouts-blue:#00ff00;--cutouts-red:rgb(1,2,3)">${svg(orbit)}</div>`);
  const fills = await page.evaluate(() => [getComputedStyle(document.querySelector('[data-p="moon0"]')!).fill, getComputedStyle(document.querySelector('svg > rect')!).fill]);
  ok('custom properties recolour the figure', fills[0] === 'rgb(0, 255, 0)' && fills[1] === 'rgb(1, 2, 3)', fills);
  await page.close();
}
{
  const { page } = await open(svg(orbit));
  const box = await page.evaluate(() => {
    const b = document.querySelector('svg')!.getBoundingClientRect();
    return [b.width, b.height];
  });
  ok('the figure fills its parent as a square', box[0] === 400 && box[1] === 400, box);
  await page.close();
}
{
  const html = renderToString(createElement(Orbit, { intensity: 1 }));
  const { page, errors } = await open(html + script);
  await page.evaluate(() => (window as any).hydrate(document.getElementById('f'), { intensity: 1 }));
  await page.waitForTimeout(2600);
  await hover(page);
  // At intensity 1 the spring is loose and may still be settling: compare the lean within a hair.
  ok('React hydrates the server HTML and the pointer moves a part', Math.abs(parseFloat((await disc(page)).slice(10)) - 11.2) < 0.05, await disc(page));
  ok('no hydration warnings or errors', errors.length === 0, errors);
  await page.close();
}

await browser.close();
if (failed) process.exit(1);
