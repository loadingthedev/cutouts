import { C, type Figure, type Shape, clamp, draw, near, stroke } from '../model.ts';

const BASE = 178;
// x, height, and how far the bar may stretch before it (or the ball on it) leaves the canvas.
const BARS = [
  { x: 18, h: 86, max: 1.9 },
  { x: 78, h: 128, max: 1.04 },
  { x: 138, h: 66, max: 2.4 },
];

// An outlined bar is two posts that stretch and a lid that rides on them, so the stroke keeps its width.
const outline = (i: number): Shape => {
  const { x, h } = BARS[i]!;
  return [
    'g',
    { 'data-fx': 'grow' },
    [
      ['path', { ...stroke, d: `M${x} ${BASE - 1.5}V${BASE - h}M${x + 44} ${BASE - 1.5}V${BASE - h}`, 'data-p': `b${i}`, 'data-at': `${x + 22} ${BASE}` }],
      ['path', { ...stroke, d: `M${x} ${BASE - h}H${x + 44}`, 'data-p': `lid${i}` }],
    ],
  ];
};

export const bars: Figure = {
  name: 'bars',
  label: 'Three bars on a baseline, a red ball above the tallest',
  about: 'Each bar reaches for the pointer as it passes. The ball rides the middle one.',
  bg: 'sun',
  shapes: () => [
    ['path', draw({ d: 'M8 178H192' })],
    outline(0),
    ['rect', { x: 78, y: 50, width: 44, height: 128, fill: C.blue, 'data-fx': 'grow', 'data-p': 'b1' }],
    outline(2),
    ['circle', { cx: 100, cy: 26, r: 20, fill: C.red, 'data-fx': 'pop', 'data-y': -40, 'data-p': 'ball' }],
  ],
  answer: ({ x, y, k }) => {
    const [a, b, c] = BARS.map(({ x: bx, h, max }) => clamp(1 + ((BASE - y) / h - 1) * near(x - bx - 22, 36) * k, 0.3, max)) as [number, number, number];
    return {
      b0: { sy: a },
      lid0: { y: -86 * (a - 1) },
      b1: { sy: b },
      ball: { y: -128 * (b - 1) },
      b2: { sy: c },
      lid2: { y: -66 * (c - 1) },
    };
  },
};
