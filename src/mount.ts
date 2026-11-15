import { type Figure, type Options, type Pose, intensity, svg } from './model.ts';

export type Mounted = {
  /** Change `intensity`, `play` or `label` on the running figure. */
  update(options: Options): void;
  /** Draw the entrance again. */
  replay(): void;
  /** Stop all motion and listeners. The drawing stays, complete and still. */
  destroy(): void;
};

const REST = { x: 0, y: 0, r: 0, s: 1, sx: 1, sy: 1, o: 1, d: 0 };
const KEYS = Object.keys(REST) as (keyof Pose)[];
const OUT = 'cubic-bezier(.22,1,.36,1)';
const BACK = 'cubic-bezier(.34,1.5,.64,1)';

type Part = { el: SVGElement; cur: number[]; vel: number[]; dirty: boolean };
type Step = (dt: number) => boolean;

// One loop for every figure on the page. A figure at rest leaves it; it stops when none is moving.
const live = new Set<Step>();
let last = 0;
function frame(now: number) {
  const dt = Math.min(0.032, (now - last) / 1000);
  last = now;
  for (const step of live) if (!step(dt)) live.delete(step);
  if (live.size) requestAnimationFrame(frame);
}
function wake(step: Step) {
  if (!live.size) {
    last = performance.now();
    requestAnimationFrame(frame);
  }
  live.add(step);
}

const num = (el: SVGElement, key: string) => +(el.dataset[key] ?? 0);

function entrance(el: SVGElement): Keyframe[] {
  const fx = el.dataset.fx;
  const from = `translate(${num(el, 'x')}px,${num(el, 'y')}px) rotate(${num(el, 'rot')}deg) scale(${fx === 'pop' ? 0 : 1},${fx === 'pop' || fx === 'grow' ? 0 : 1})`;
  const to = 'translate(0px,0px) rotate(0deg) scale(1,1)';
  if (fx === 'draw')
    return [
      { opacity: 0, strokeDasharray: '1', strokeDashoffset: 1 },
      { opacity: 1, strokeDasharray: '1', strokeDashoffset: 0.85, offset: 0.15 },
      { opacity: 1, strokeDasharray: '1', strokeDashoffset: 0 },
    ];
  return [
    { opacity: 0, transform: from },
    { opacity: 1, transform: to },
  ];
}

// The path `play` walks when no pointer is on the figure: a slow loop that crosses the whole canvas.
const tour = (t: number): [number, number] => [100 + 80 * Math.sin(t * 0.9), 100 + 66 * Math.sin(t * 1.4 + 0.6)];

/**
 * Add motion to a figure. `target` is the `<svg>` that `svg()` made, or an element holding it;
 * an element without one gets the figure drawn into it.
 */
export function mount(target: Element, figure: Figure, options: Options = {}): Mounted {
  const sel = `svg[data-cutout="${figure.name}"]`;
  let found = target.matches(sel) ? target : target.querySelector(sel);
  if (!found) {
    target.innerHTML = svg(figure, options);
    found = target.firstElementChild!;
  } else if (options.label !== undefined) found.setAttribute('aria-label', options.label);
  const root = found as SVGSVGElement;

  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const fx = [...root.querySelectorAll<SVGElement>('[data-fx]')];
  const parts = new Map<string, Part>();
  for (const el of root.querySelectorAll<SVGElement>('[data-fx],[data-p]')) {
    const at = el.dataset.at;
    el.style.transformBox = at ? 'view-box' : 'fill-box';
    el.style.transformOrigin = at ? at.replace(/(\S+) (\S+)/, '$1px $2px') : el.dataset.fx === 'grow' ? '50% 100%' : 'center';
    if (el.dataset.p) parts.set(el.dataset.p, { el, cur: Object.values(REST), vel: KEYS.map(() => 0), dirty: false });
  }

  let level = intensity(options.intensity);
  let play = !!options.play;
  let on = false;
  let px = 100;
  let py = 100;
  let clock = 0;
  let shown = false;
  let visible = false;
  let entering = 0;
  let anims: Animation[] = [];

  const step: Step = (dt) => {
    const playing = play && visible && !on && !still.matches;
    const active = shown && !entering && (on || playing);
    clock += dt;
    const [x, y] = on ? [px, py] : tour(clock);
    const poses = active ? figure.answer({ x, y, t: clock, k: 0.25 + 1.5 * level }) : {};
    // Calm and exactly damped at intensity 0, loose and springy at 1.
    const w = 14;
    const c = 2 * w * (1 - 0.6 * level);
    let moving = false;
    for (const [name, part] of parts) {
      const pose = poses[name];
      let away = false;
      KEYS.forEach((key, i) => {
        let to = pose?.[key] ?? REST[key];
        let cur = part.cur[i]!;
        let vel = part.vel[i]!;
        // A turn is the same picture every 360 degrees: go the short way round.
        if (key === 'r') to += 360 * Math.round((cur - to) / 360);
        for (let n = 0; n < 2; n++) {
          vel += (w * w * (to - cur) - c * vel) * (dt / 2);
          cur += vel * (dt / 2);
        }
        if (Math.abs(to - cur) < 0.001 && Math.abs(vel) < 0.01) [cur, vel] = [to, 0];
        else moving = true;
        if (cur !== REST[key]) away = true;
        part.cur[i] = cur;
        part.vel[i] = vel;
      });
      if (away || part.dirty) write(part, away);
    }
    return moving || on || playing || entering > 0;
  };

  function write(part: Part, away: boolean) {
    const style = part.el.style;
    const [x, y, r, s, sx, sy, o, d] = part.cur.map((n) => +n.toFixed(3)) as [number, number, number, number, number, number, number, number];
    part.dirty = away;
    style.transform = away ? `translate(${x}px,${y}px) rotate(${r}deg) scale(${s * sx},${s * sy})` : '';
    style.opacity = away && o !== 1 ? String(Math.max(0, o)) : '';
    style.strokeDasharray = away && d > 0 ? '1' : '';
    style.strokeDashoffset = away && d > 0 ? String(Math.min(1, d)) : '';
  }

  function enter() {
    for (const a of anims) a.cancel();
    const gap = Math.min(80, 900 / fx.length);
    const run = ++entering;
    anims = fx.map((el, i) => {
      el.style.opacity = '';
      const kind = el.dataset.fx;
      return el.animate(entrance(el), { duration: kind === 'draw' ? 1200 : 900, easing: kind === 'pop' ? BACK : OUT, delay: 150 + i * gap, fill: 'backwards' });
    });
    const done = () => {
      // A replay started since: its own run ends the entrance.
      if (run === entering) entering = 0;
    };
    Promise.all(anims.map((a) => a.finished)).then(done, done);
    wake(step);
  }

  const seen = new IntersectionObserver(
    ([entry]) => {
      visible = !!entry?.isIntersecting;
      if (!shown && entry && entry.intersectionRatio >= 0.25) {
        shown = true;
        if (still.matches) for (const el of fx) el.style.opacity = '';
        else enter();
      }
      if (visible && play) wake(step);
    },
    { threshold: [0, 0.25] },
  );

  const move = (e: PointerEvent) => {
    if (still.matches) return;
    const box = root.getBoundingClientRect();
    px = ((e.clientX - box.left) / box.width) * 200;
    py = ((e.clientY - box.top) / box.height) * 200;
    on = true;
    wake(step);
  };
  const leave = () => {
    on = false;
  };

  // Hidden only until it scrolls into view. With reduced motion nothing is ever hidden.
  if (!still.matches) for (const el of fx) el.style.opacity = '0';
  seen.observe(root);
  root.addEventListener('pointerenter', move);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', leave);
  root.addEventListener('pointercancel', leave);

  return {
    update(next) {
      if ('intensity' in next) level = intensity(next.intensity);
      if ('play' in next) play = !!next.play;
      if (next.label !== undefined) root.setAttribute('aria-label', next.label);
      wake(step);
    },
    replay() {
      if (!still.matches) enter();
    },
    destroy() {
      seen.disconnect();
      live.delete(step);
      root.removeEventListener('pointerenter', move);
      root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerleave', leave);
      root.removeEventListener('pointercancel', leave);
      for (const a of anims) a.cancel();
      for (const el of root.querySelectorAll<SVGElement>('[data-fx],[data-p]')) el.removeAttribute('style');
    },
  };
}
