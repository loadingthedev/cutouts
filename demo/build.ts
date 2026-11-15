// Writes the demo to demo/dist. The figures are in the HTML as plain strings, the way a server would send them;
// main.ts only adds the motion and the controls.
import { cp, mkdir } from 'node:fs/promises';
import { type Figure, figures, svg } from '../src/index.ts';
import * as all from '../src/index.ts';

const out = `${import.meta.dir}/dist`;
await mkdir(out, { recursive: true });

const fonts = {
  'bricolage.woff2': '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
  'instrument.woff2': '@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2',
};
for (const [name, from] of Object.entries(fonts)) await cp(`${import.meta.dir}/../node_modules/${from}`, `${out}/${name}`);

const script = await Bun.build({ entrypoints: [`${import.meta.dir}/main.ts`], format: 'iife', minify: true });
if (!script.success) throw new AggregateError(script.logs);
await Bun.write(`${out}/main.js`, script.outputs[0]!);

// The shadcn registry item: `npx shadcn@latest add <site>/r/cutouts.json` installs the package and adds this one file.
const components = figures.map((f) => f.name[0]!.toUpperCase() + f.name.slice(1));
await Bun.write(
  `${out}/r/cutouts.json`,
  JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name: 'cutouts',
      type: 'registry:ui',
      title: 'Cutouts',
      description: `${figures.length} flat colour figures that draw themselves and answer the pointer.`,
      dependencies: ['cutouts'],
      files: [
        {
          path: 'components/ui/cutouts.tsx',
          type: 'registry:ui',
          content: `// The figures from the cutouts package. This file is yours: wrap them, restyle them, or keep only the ones you use.
// To recolour them, set --cutouts-blue, --cutouts-red and the rest on any parent.
// Docs: https://cutouts.loadingthelife.eu.org/
export {
${components.map((name) => `  ${name},`).join('\n')}
} from "cutouts/react";
export type { CutoutProps } from "cutouts/react";
`,
        },
      ],
      docs: 'Docs: https://cutouts.loadingthelife.eu.org/',
    },
    null,
    2,
  ),
);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const band = [all.look, all.snip, all.orbit, all.dawn, all.keys];

const tile = (f: Figure) => `
      <figure class="tile">
        <div class="art" data-figure="${f.name}">${svg(f, { wait: true })}</div>
        <figcaption><h3>${f.name}</h3><p>${esc(f.about)}</p></figcaption>
      </figure>`;

const code = (title: string, body: string, wide = false) => `
        <div class="snippet${wide ? ' wide' : ''}"><h3>${title}</h3><pre><code>${esc(body.trim())}</code></pre></div>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="https://cutouts.loadingthelife.eu.org/">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23F3F2EE'/%3E%3Ccircle cx='8' cy='8' r='6' fill='%23FF5533'/%3E%3C/svg%3E">
<title>cutouts: flat colour figures that draw themselves</title>
<meta name="description" content="${figures.length} flat colour figures that draw themselves and answer the pointer. For React and for anything with a DOM. No dependencies.">
<style>
@font-face { font-family: Bricolage; src: url(bricolage.woff2) format('woff2'); font-weight: 200 800; font-display: swap; }
@font-face { font-family: Instrument; src: url(instrument.woff2) format('woff2'); font-weight: 400 700; font-display: swap; }
:root { --paper: #F3F2EE; --ink: #15130F; --blue: #2733E6; --red: #FF5533; --sun: #FFD23F; --rule: 3px solid var(--ink); --pad: clamp(18px, 4vw, 56px); }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 17px/1.5 Instrument, system-ui, sans-serif; }
h1, h2, h3, p, figure { margin: 0; }
a { color: inherit; text-underline-offset: 0.2em; text-decoration-thickness: 2px; }
a:hover { color: var(--blue); }
:focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; }
code, pre { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }

.top { padding: clamp(28px, 6vw, 72px) var(--pad) clamp(22px, 3vw, 40px); display: grid; gap: clamp(18px, 3vw, 40px); grid-template-columns: 1fr; align-items: end; }
.top h1 { font: 800 clamp(84px, 21vw, 170px)/0.74 Bricolage, 'Arial Narrow', sans-serif; letter-spacing: -0.055em; margin-left: -0.04em; padding-bottom: 0.08em; }
/* The o is cut out of colour instead of set in type. */
.top h1 i { display: inline-block; width: 0.5em; height: 0.5em; margin: 0 0.035em 0 0.03em; border-radius: 50%; background: var(--red); }
.lede { font: 600 clamp(20px, 2.5vw, 30px)/1.2 Bricolage, sans-serif; letter-spacing: -0.015em; max-width: 21em; text-wrap: balance; }
.get { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 22px; font-weight: 600; font-size: 16px; }
.get code { background: var(--ink); color: var(--paper); padding: 10px 16px; font-size: 15px; font-weight: 400; }
@media (min-width: 900px) {
  .top { grid-template-columns: auto minmax(320px, 1fr); column-gap: clamp(32px, 5vw, 80px); }
  .top h1 { grid-row: span 2; font-size: clamp(150px, 17.5vw, 290px); }
  .lede { align-self: end; }
  .get { align-self: start; }
}

.band { display: grid; grid-template-columns: repeat(3, 1fr); border-block: var(--rule); }
.band .art:nth-child(n + 4) { display: none; }
@media (min-width: 700px) {
  .band { grid-template-columns: repeat(5, 1fr); }
  .band .art:nth-child(n + 4) { display: block; }
}
.art { touch-action: pan-y; }
.art svg { display: block; }

.controls { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 28px; padding: 12px var(--pad); background: var(--paper); border-bottom: var(--rule); font-weight: 600; font-size: 15px; }
.controls label { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.controls output { font-variant-numeric: tabular-nums; min-width: 2.4em; }
.controls .count { margin-left: auto; font-weight: 500; opacity: 0.7; }
@media (max-width: 520px) {
  .controls { gap: 8px 14px; font-size: 14px; }
  .controls label { gap: 9px; }
  .controls output, .controls .count { display: none; }
  input[type='range'] { width: 96px; }
}
input[type='range'] { appearance: none; -webkit-appearance: none; width: clamp(110px, 22vw, 220px); height: 24px; margin: 0; background: transparent; cursor: pointer; }
input[type='range']::-webkit-slider-runnable-track { height: 3px; background: var(--ink); border-radius: 2px; }
input[type='range']::-moz-range-track { height: 3px; background: var(--ink); border-radius: 2px; }
input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; margin-top: -9.5px; border: 0; border-radius: 50%; background: var(--red); }
input[type='range']::-moz-range-thumb { width: 22px; height: 22px; border: 0; border-radius: 50%; background: var(--red); }
input[type='checkbox'] { appearance: none; -webkit-appearance: none; position: relative; width: 46px; height: 26px; margin: 0; border-radius: 13px; background: #fff; box-shadow: inset 0 0 0 3px var(--ink); cursor: pointer; transition: background 0.2s; }
input[type='checkbox']::after { content: ''; position: absolute; top: 7px; left: 7px; width: 12px; height: 12px; border-radius: 50%; background: var(--ink); transition: translate 0.25s cubic-bezier(0.34, 1.5, 0.64, 1); }
input[type='checkbox']:checked { background: var(--sun); }
input[type='checkbox']:checked::after { translate: 20px 0; }
button { font: inherit; color: inherit; background: none; border: 0; padding: 4px 0; border-bottom: 2px solid var(--ink); cursor: pointer; }
button:hover { color: var(--blue); border-color: var(--blue); }
@media (prefers-reduced-motion: reduce) { input[type='checkbox'], input[type='checkbox']::after { transition: none; } }
.still { display: none; padding: 12px var(--pad); background: var(--sun); font-weight: 600; font-size: 15px; }
@media (prefers-reduced-motion: reduce) { .still { display: block; } }

.wall { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px 14px; padding: clamp(22px, 4vw, 48px) var(--pad) clamp(40px, 7vw, 96px); }
@media (min-width: 640px) { .wall { grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 40px 22px; } }
figcaption { padding-top: 10px; }
figcaption h3 { font: 800 21px/1.1 Bricolage, sans-serif; letter-spacing: -0.02em; }
figcaption p { font-size: 14px; line-height: 1.4; margin-top: 4px; opacity: 0.72; text-wrap: pretty; }

.use > *, .snippet { min-width: 0; }
.use { scroll-margin-top: 56px; border-top: var(--rule); padding: clamp(32px, 6vw, 80px) var(--pad); display: grid; gap: clamp(28px, 4vw, 48px); }
.use h2 { font: 800 clamp(40px, 7vw, 96px)/0.9 Bricolage, sans-serif; letter-spacing: -0.04em; }
.snippets { display: grid; gap: 22px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr)); align-items: start; }
.snippet.wide { grid-column: 1 / -1; }
.snippet h3 { font: 800 21px/1.1 Bricolage, sans-serif; letter-spacing: -0.02em; margin-bottom: 10px; }
pre { margin: 0; padding: 18px 20px; background: var(--ink); color: var(--paper); font-size: 13.5px; line-height: 1.6; overflow-x: auto; }
.facts { display: grid; gap: 22px 40px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); padding: 0; margin: 0; list-style: none; }
.facts li { padding-top: 12px; border-top: var(--rule); }
.facts b { display: block; font: 800 21px/1.1 Bricolage, sans-serif; letter-spacing: -0.02em; margin-bottom: 4px; }
.facts code { font-size: 0.86em; background: #fff; padding: 1px 5px; }

footer { border-top: var(--rule); padding: 22px var(--pad) 36px; display: flex; flex-wrap: wrap; gap: 8px 28px; font-weight: 600; font-size: 15px; }
footer span { margin-right: auto; }
</style>
</head>
<body>
  <header class="top">
    <h1 aria-label="cutouts">cut<i></i>uts</h1>
    <p class="lede">Flat colour figures that draw themselves and answer the pointer. For React and for anything with a DOM.</p>
    <p class="get"><code>npm i cutouts</code><a href="https://github.com/loadingthedev/cutouts">GitHub</a><a href="#use">How to use it</a></p>
  </header>

  <div class="band">${band.map((f) => `<div class="art" data-figure="${f.name}" data-play>${svg(f, { wait: true })}</div>`).join('')}</div>

  <div class="controls">
    <label>Intensity <input type="range" id="intensity" min="0" max="1" step="0.05" value="0.5"> <output for="intensity">0.50</output></label>
    <label>Play <input type="checkbox" id="play"></label>
    <button type="button" id="replay">Redraw</button>
    <span class="count">${figures.length} figures</span>
  </div>
  <p class="still">Your system asks for reduced motion, so every figure here is complete and still.</p>

  <main class="wall">${figures.map(tile).join('')}
  </main>

  <section class="use" id="use">
    <h2>Use it</h2>
    <div class="snippets">${code(
      'Anything with a DOM',
      `
import { mount, orbit } from 'cutouts';

const figure = mount(el, orbit, { play: true });

figure.update({ intensity: 0.8 });
figure.destroy();`,
    )}${code(
      'React',
      `
import { Orbit } from 'cutouts/react';

export function Hero() {
  return <Orbit intensity={0.8} />;
}`,
    )}${code(
      'On a server',
      `
import { orbit, svg } from 'cutouts';

// A plain string. No DOM, no script,
// and nothing shifts when the page loads.
const html = svg(orbit);`,
    )}${code(
      'Theme',
      `
.figures {
  --cutouts-blue: #1d4ed8;
  --cutouts-red: #e11d48;
  --cutouts-paper: #fafaf9;
}`,
    )}${code('With shadcn', 'npx shadcn@latest add https://cutouts.loadingthelife.eu.org/r/cutouts.json', true)}
    </div>
    <ul class="facts">
      <li><b>intensity</b>How strongly a figure moves, from <code>0</code> to <code>1</code>. The slider above sets it for every figure on this page.</li>
      <li><b>play</b>The figure walks through its answer on its own until a pointer arrives.</li>
      <li><b>label</b>The accessible name. Every figure comes with one in English.</li>
      <li><b>No dependencies</b>The motion is CSS transforms, the Web Animations API and one small spring.</li>
      <li><b>Drawn on the server</b>Each figure on this page was in the HTML as a plain SVG string before any script ran.</li>
      <li><b>Reduced motion</b>With <code>prefers-reduced-motion</code>, a figure is complete and still.</li>
    </ul>
  </section>

  <footer><span>cutouts, by Aftab Khan. MIT.</span><a href="https://github.com/loadingthedev/cutouts">GitHub</a><a href="https://www.npmjs.com/package/cutouts">npm</a><a href="https://portfolio.loadingthelife.eu.org">Portfolio</a></footer>
  <script src="main.js"></script>
</body>
</html>
`;

await Bun.write(`${out}/index.html`, html);
console.log(`demo/dist/index.html ${(html.length / 1024).toFixed(1)} kB, main.js ${(script.outputs[0]!.size / 1024).toFixed(1)} kB`);
