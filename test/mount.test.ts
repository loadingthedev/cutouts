import { afterAll, afterEach, beforeAll, beforeEach, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { type Mounted, bars, mount as mountFigure, orbit, svg } from '../src/index.ts';

// happy-dom gives the elements; what decides motion is stubbed so each test can set it.
let reduced = false;
let frames: FrameRequestCallback[] = [];
let animated: Element[] = [];
let see: (ratio: number) => void = () => {};
let now = 0;
let mounted: Mounted[] = [];

const mount: typeof mountFigure = (...args) => {
  const figure = mountFigure(...args);
  mounted.push(figure);
  return figure;
};

beforeAll(() => {
  GlobalRegistrator.register();
  window.matchMedia = (() => ({ get matches() { return reduced; } })) as unknown as typeof window.matchMedia;
  globalThis.matchMedia = window.matchMedia;
  globalThis.requestAnimationFrame = (cb) => frames.push(cb);
  globalThis.performance.now = () => now;
  globalThis.IntersectionObserver = class {
    constructor(cb: IntersectionObserverCallback) {
      see = (ratio) => cb([{ isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  Element.prototype.animate = function (this: Element) {
    animated.push(this);
    return { finished: Promise.resolve(), cancel() {} } as unknown as Animation;
  };
});
afterAll(() => GlobalRegistrator.unregister());

beforeEach(() => {
  reduced = false;
  animated = [];
  document.body.innerHTML = '';
});
// Every figure shares one loop, so a test must not leave a figure running in it.
afterEach(() => {
  for (const figure of mounted.splice(0)) figure.destroy();
  run(100);
});

function run(ms: number) {
  for (let end = now + ms; now < end; ) {
    now += 16;
    for (const cb of frames.splice(0)) cb(now);
  }
}

// The entrance ends on a promise; give it a full turn of the event loop.
const entered = () => new Promise((done) => setTimeout(done, 0));

function stage(html = '') {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.append(el);
  return el;
}

function point(root: Element, type: string, x = 0, y = 0) {
  root.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 200 }) as DOMRect;
  const event = new Event(type) as Event & { clientX: number; clientY: number };
  event.clientX = x;
  event.clientY = y;
  root.dispatchEvent(event);
}

const styles = (el: Element) => [...el.querySelectorAll<SVGElement>('[data-fx],[data-p]')].map((s) => s.style);

test('mount draws the figure into an empty element', () => {
  const el = stage();
  mount(el, orbit, { label: 'Mine' });
  expect(el.querySelector('svg')?.getAttribute('data-cutout')).toBe('orbit');
  expect(el.querySelector('svg')?.getAttribute('aria-label')).toBe('Mine');
});

test('mount adopts a server-rendered figure without redrawing it, and takes over a waiting one', () => {
  const el = stage(svg(orbit, { wait: true }));
  const before = el.querySelector('svg')!;
  expect(before.hasAttribute('data-wait')).toBe(true);
  mount(el, orbit);
  expect(el.querySelector('svg')).toBe(before);
  expect(before.hasAttribute('data-wait')).toBe(false);
});

test('parts wait hidden, then the entrance plays once the figure is a quarter in view', async () => {
  const el = stage(svg(orbit));
  mount(el, orbit);
  const fx = [...el.querySelectorAll<SVGElement>('[data-fx]')];
  expect(fx.every((s) => s.style.opacity === '0')).toBe(true);
  see(0.1);
  expect(animated.length).toBe(0);
  see(0.3);
  expect(animated.length).toBe(fx.length);
  expect(fx.every((s) => s.style.opacity === '')).toBe(true);
  see(0.9);
  expect(animated.length).toBe(fx.length);
});

test('the pointer moves the parts, and they come back to rest when it leaves', async () => {
  const el = stage(svg(orbit));
  mount(el, orbit);
  see(1);
  await entered();
  const root = el.querySelector('svg')!;
  const disc = el.querySelector<SVGElement>('[data-p="disc"]')!;
  point(root, 'pointermove', 180, 100);
  run(1500);
  // Default intensity: the disc leans 8% of the way from the centre to the pointer.
  expect(disc.style.transform).toBe('translate(6.4px,0px) rotate(0deg) scale(1,1)');
  point(root, 'pointerleave');
  run(3000);
  expect(disc.style.transform).toBe('');
  expect(frames.length).toBe(0);
});

test('intensity scales the answer and is clamped', async () => {
  for (const [intensity, lean] of [[0, 1.6], [1, 11.2], [7, 11.2], [-3, 1.6], ['strong', 6.4]] as const) {
    const el = stage(svg(orbit));
    mount(el, orbit, { intensity: intensity as number });
    see(1);
    await entered();
    point(el.querySelector('svg')!, 'pointermove', 180, 100);
    run(4000);
    expect(el.querySelector<SVGElement>('[data-p="disc"]')!.style.transform).toStartWith(`translate(${lean}px,`);
  }
});

test('play walks the figure on its own while it is in view, and update turns it off', async () => {
  const el = stage(svg(bars));
  const figure = mount(el, bars, { play: true });
  see(1);
  await entered();
  run(1000);
  expect(styles(el).some((s) => s.transform)).toBe(true);
  expect(frames.length).toBe(1);
  figure.update({ play: false });
  run(4000);
  expect(styles(el).some((s) => s.transform)).toBe(false);
  expect(frames.length).toBe(0);
});

test('with reduced motion the figure is complete and still', async () => {
  reduced = true;
  const el = stage(svg(bars));
  const figure = mount(el, bars, { play: true });
  expect(styles(el).some((s) => s.opacity)).toBe(false);
  see(1);
  await Promise.resolve();
  point(el.querySelector('svg')!, 'pointermove', 40, 20);
  figure.replay();
  run(1000);
  expect(animated.length).toBe(0);
  expect(styles(el).some((s) => s.opacity || s.transform)).toBe(false);
});

test('destroy leaves the drawing as the server sent it', () => {
  const html = svg(orbit);
  const el = stage(html);
  const figure = mount(el, orbit);
  see(1);
  point(el.querySelector('svg')!, 'pointermove', 180, 100);
  run(300);
  figure.destroy();
  expect(el.querySelectorAll('[style]').length).toBe(0);
  run(300);
  expect(frames.length).toBe(0);
});
