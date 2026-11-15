export const palette = {
  blue: '#2733E6',
  red: '#FF5533',
  sun: '#FFD23F',
  pink: '#FFA8CB',
  green: '#0B7A50',
  sky: '#A9D3FF',
  lilac: '#C3B4FF',
  paper: '#F3F2EE',
  ink: '#15130F',
  white: '#FFFFFF',
} as const;

export type Colour = keyof typeof palette;

// Every colour goes out as a custom property with the palette value as its fallback, so a page rethemes with CSS alone.
export const C = Object.fromEntries(Object.entries(palette).map(([k, v]) => [k, `var(--cutouts-${k},${v})`])) as Record<Colour, string>;

export type Attrs = Record<string, string | number>;
/** `[element, attributes, children?]` on a 200x200 canvas. */
export type Shape = [string, Attrs, Shape[]?];

/** Where a part sits relative to its drawn place. Left out, a value is at rest: 0, or 1 for the scales and opacity. */
export type Pose = {
  x?: number;
  y?: number;
  /** Rotation in degrees. */
  r?: number;
  s?: number;
  sx?: number;
  sy?: number;
  o?: number;
  /** How much of a drawn line is taken back, 0 to 1. Only for shapes made with `draw`. */
  d?: number;
};

export type Pointer = {
  /** Canvas units, 0 to 200. */
  x: number;
  y: number;
  /** Seconds, for answers that move in time. */
  t: number;
  /** Strength: 0.25 at intensity 0, 1 at the default, 1.75 at intensity 1. */
  k: number;
};

export type Figure = {
  name: string;
  /** The default accessible name. */
  label: string;
  /** What the pointer does, in one line. */
  about: string;
  bg: Colour;
  shapes: () => Shape[];
  /** A pose for each part (`data-p`) that is away from rest. */
  answer: (p: Pointer) => Record<string, Pose>;
};

export type Options = {
  /** How strongly the figure moves, 0 to 1. Default 0.5. */
  intensity?: number;
  /** Walk through the answer on its own while no pointer is on the figure. Default false. */
  play?: boolean;
  /** The accessible name. */
  label?: string;
  /** Draw the coloured field behind the figure. Default true. */
  field?: boolean;
};

export const stroke = { fill: 'none', stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
/** A line that draws itself on entrance. */
export const draw = (a: Attrs): Attrs => ({ ...stroke, pathLength: 1, 'data-fx': 'draw', ...a });

export const polar = (r: number, deg: number, cx = 100, cy = 100): [number, number] => [
  +(cx + r * Math.cos((deg * Math.PI) / 180)).toFixed(1),
  +(cy + r * Math.sin((deg * Math.PI) / 180)).toFixed(1),
];

export const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
/** 1 at distance 0, falling off over about `width`. */
export const near = (d: number, width: number) => Math.exp(-((d / width) ** 2));
export const angle = (x: number, y: number, cx = 100, cy = 100) => (Math.atan2(y - cy, x - cx) * 180) / Math.PI;

export const intensity = (n: unknown) => (typeof n === 'number' && !Number.isNaN(n) ? clamp(n) : 0.5);

const esc = (s: string | number) => String(s).replace(/[&<>"]/g, (c) => `&${{ '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot' }[c]};`);
const attrs = (a: Attrs) =>
  Object.entries(a)
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join('');
const markup = (shapes: Shape[]): string => shapes.map(([el, a, kids]) => (kids ? `<${el}${attrs(a)}>${markup(kids)}</${el}>` : `<${el}${attrs(a)}/>`)).join('');

/** The whole figure as an SVG string. Needs no DOM. */
export function svg(figure: Figure, options: Options = {}): string {
  const field = options.field !== false;
  const root: Attrs = { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 200 200', width: '100%', role: 'img', 'aria-label': options.label ?? figure.label, 'data-cutout': figure.name };
  // Without the field the figure sits on the page's own colour, and its parts may travel past the canvas.
  if (!field) root.overflow = 'visible';
  return `<svg${attrs(root)}>${field ? `<rect width="200" height="200" fill="${C[figure.bg]}"/>` : ''}${markup(figure.shapes())}</svg>`;
}
