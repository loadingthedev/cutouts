// Records assets/hero.gif: eight figures drawing themselves, then playing. bun run hero (needs ffmpeg and Chrome).
// Time in the page is stepped by hand, one frame at a time, so the GIF is even however slow the screenshots are.
import { chromium } from 'playwright-core';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import * as all from '../src/index.ts';

const FPS = 20;
const SECONDS = 8;
const SIZE = 200;
const cast = [all.look, all.bars, all.snip, all.orbit, all.halves, all.dawn, all.chat, all.keys];

// The page's clock: time, animation frames and Web Animations all move only when step() is called.
const clock = `
  let now = 0;
  const queue = [];
  const started = new WeakMap();
  performance.now = () => now;
  window.requestAnimationFrame = (cb) => queue.push(cb);
  window.step = (ms) => {
    now += ms;
    for (const cb of queue.splice(0)) cb(now);
    for (const a of document.getAnimations()) {
      if (!started.has(a)) {
        a.pause();
        started.set(a, now);
      }
      const at = now - started.get(a);
      // A paused animation never finishes by itself, and the figure waits for that before it answers.
      if (at >= a.effect.getComputedTiming().endTime) a.finish();
      else a.currentTime = at;
    }
  };
`;

const built = await Bun.build({ entrypoints: [`${import.meta.dir}/shots.page.ts`], format: 'iife' });
if (!built.success) throw new AggregateError(built.logs);
const frames = await mkdtemp(join(tmpdir(), 'cutouts-hero-'));
await mkdir('assets', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: SIZE * 4, height: SIZE * 2 }, deviceScaleFactor: 1 });
await page.setContent(
  `<body style="margin:0;display:grid;grid-template-columns:repeat(4,${SIZE}px)"><script>${clock}</script>${cast.map((f) => `<div data-name="${f.name}" data-play>${all.svg(f)}</div>`).join('')}<script>${await built.outputs[0]!.text()}</script></body>`,
);
// Real time, for the browser to report that the figures are in view.
await page.waitForTimeout(500);
await page.evaluate('step(0)');
for (let i = 0; i < FPS * SECONDS; i++) {
  await page.screenshot({ path: join(frames, `${String(i).padStart(4, '0')}.png`) });
  await page.evaluate(`step(${1000 / FPS})`);
}
await browser.close();

// No dither: the figures are flat colour, and dither would speckle them and bloat the file.
const filter = 'split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle';
const ffmpeg = Bun.spawnSync(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, '%04d.png'), '-filter_complex', filter, '-loop', '0', 'assets/hero.gif']);
if (ffmpeg.exitCode) throw new Error(ffmpeg.stderr.toString());
await rm(frames, { recursive: true });
console.log(`assets/hero.gif ${(Bun.file('assets/hero.gif').size / 1024).toFixed(0)} kB, ${FPS * SECONDS} frames at ${FPS} fps`);
