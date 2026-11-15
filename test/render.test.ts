import { expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { figures, palette, svg } from '../src/index.ts';
import { intensity } from '../src/model.ts';
import * as components from '../src/react.ts';

// Strict enough to catch what a hand-built string gets wrong: unbalanced tags, unquoted or repeated attributes, stray text.
function wellFormed(xml: string) {
  const open: string[] = [];
  const rest = xml.replace(/<(\/?)([a-zA-Z]+)((?:\s+[\w:-]+="[^"<]*")*)\s*(\/?)>/g, (_, close, name, attrs: string, selfClosing) => {
    const names = [...attrs.matchAll(/\s([\w:-]+)=/g)].map((m) => m[1]);
    if (new Set(names).size !== names.length) throw new Error(`repeated attribute in <${name}>`);
    if (close) {
      if (open.pop() !== name) throw new Error(`</${name}> closes nothing`);
    } else if (!selfClosing) open.push(name);
    return '';
  });
  if (rest.trim()) throw new Error(`left over: ${rest.slice(0, 60)}`);
  if (open.length) throw new Error(`unclosed: ${open.join(', ')}`);
}

const parts = (xml: string) => [...xml.matchAll(/data-p="([^"]+)"/g)].map((m) => m[1]!);

test('this file runs with no DOM', () => {
  expect(typeof document).toBe('undefined');
  expect(typeof window).toBe('undefined');
});

test('there are 25 figures with unique names', () => {
  expect(figures.length).toBe(25);
  expect(new Set(figures.map((f) => f.name)).size).toBe(25);
});

for (const figure of figures) {
  test(`${figure.name} renders a well-formed SVG string`, () => {
    const out = svg(figure);
    wellFormed(out);
    expect(out).toStartWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"');
    expect(out).not.toMatch(/undefined|NaN|\[object/);
    expect(out).toContain(`<rect width="200" height="200" fill="var(--cutouts-${figure.bg},${palette[figure.bg]})"/>`);
    // Every colour is a custom property with a palette fallback, never a bare hex.
    for (const [, value] of out.matchAll(/(?:fill|stroke)="([^"]+)"/g)) expect(value).toMatch(/^(none|var\(--cutouts-\w+,#[0-9A-F]{6}\))$/);
  });

  test(`${figure.name} has an accessible name`, () => {
    expect(figure.label.length).toBeGreaterThan(10);
    expect(figure.about.length).toBeGreaterThan(10);
    expect(svg(figure)).toContain(`role="img" aria-label="${figure.label}"`);
    expect(svg(figure, { label: 'Mine' })).toContain('aria-label="Mine"');
    expect(svg(figure, { label: '' })).toContain(`aria-label="${figure.label}"`);
  });

  test(`${figure.name} answers the pointer with finite poses for parts it has`, () => {
    const names = parts(svg(figure));
    expect(new Set(names).size).toBe(names.length);
    const posed = new Set<string>();
    for (const k of [0.25, 1, 1.75])
      for (const t of [0, 0.37, 2.9])
        for (let x = -20; x <= 220; x += 20)
          for (let y = -20; y <= 220; y += 20)
            for (const [name, pose] of Object.entries(figure.answer({ x, y, t, k }))) {
              expect(names).toContain(name);
              posed.add(name);
              for (const value of Object.values(pose)) expect(Number.isFinite(value)).toBe(true);
            }
    // A part nothing ever moves is a typo in the figure.
    expect([...posed].sort()).toEqual([...names].sort());
  });
}

test('the field can be left out', () => {
  const out = svg(figures[0]!, { field: false });
  wellFormed(out);
  expect(out).not.toContain('<rect width="200" height="200"');
  expect(out).toContain('overflow="visible"');
});

test('wait holds the parts back with CSS alone, and only when motion is allowed', () => {
  const out = svg(figures[0]!, { wait: true });
  expect(out).toContain(' data-wait=""');
  expect(out).toContain('<style>@media (prefers-reduced-motion:no-preference){svg[data-wait] [data-fx]{');
  expect(svg(figures[0]!)).not.toMatch(/data-wait|<style/);
});

test('a label cannot break out of its attribute', () => {
  const out = svg(figures[0]!, { label: '"><script>alert(1)</script>&' });
  wellFormed(out);
  expect(out).not.toContain('<script>');
  expect(out).toContain('aria-label="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;&amp;"');
});

test('intensity is clamped to 0…1 and anything that is not a number is 0.5', () => {
  expect(intensity(0.3)).toBe(0.3);
  expect(intensity(-4)).toBe(0);
  expect(intensity(9)).toBe(1);
  expect(intensity(Infinity)).toBe(1);
  for (const junk of [undefined, null, NaN, '0.9', {}, true]) expect(intensity(junk)).toBe(0.5);
});

test('every figure has a React component that renders the drawing on the server', () => {
  for (const figure of figures) {
    const name = figure.name[0]!.toUpperCase() + figure.name.slice(1);
    const Component = (components as Record<string, unknown>)[name] as typeof components.Orbit;
    expect(Component).toBeDefined();
    const html = renderToString(createElement(Component, { label: 'Mine', className: 'art' }));
    expect(html).toStartWith('<div class="art"><svg');
    expect(html).toContain('data-wait');
    expect(renderToString(createElement(Component, { wait: false }))).not.toContain('data-wait');
    expect(html).toContain(`data-cutout="${figure.name}"`);
    expect(html).toContain('aria-label="Mine"');
  }
});

test('the README lists every figure with what it does', async () => {
  const readme = await Bun.file(`${import.meta.dir}/../README.md`).text();
  for (const figure of figures) expect(readme).toContain(`| \`${figure.name}\` | \`${figure.name[0]!.toUpperCase()}${figure.name.slice(1)}\` | ${figure.label}. | ${figure.about} |`);
});
