import { C, type Figure, type Pose, type Shape, draw, near, polar } from '../model.ts';

// radius, where its dots sit, and how far it turns for each unit the pointer crosses.
const RINGS: [number, number[], number][] = [
  [88, [200, 320], 0.5],
  [62, [125, 20], -0.9],
  [36, [245], 1.6],
];

const dot = (r: number, deg: number, size: number, fill: string): Shape => {
  const [cx, cy] = polar(r, deg);
  return ['circle', { cx, cy, r: size, fill, 'data-fx': 'pop' }];
};

export const rings: Figure = {
  name: 'rings',
  label: 'Three rings with dots on them around a red centre',
  about: 'The rings turn like dials as the pointer crosses, each at its own rate. The one under it swells.',
  bg: 'pink',
  shapes: () => [
    ...RINGS.map(
      ([r, dots], i): Shape => [
        'g',
        { 'data-p': `ring${i}`, 'data-at': '100 100' },
        [['circle', draw({ cx: 100, cy: 100, r })], ...dots.map((deg) => dot(r, deg, 6, C.ink)), ...(i === 2 ? [dot(36, 40, 10, C.blue)] : [])],
      ],
    ),
    ['circle', { cx: 100, cy: 100, r: 16, fill: C.red, 'data-fx': 'pop', 'data-p': 'core' }],
  ],
  answer: ({ x, y, k }) => {
    const d = Math.hypot(x - 100, y - 100);
    const poses: Record<string, Pose> = { core: { s: 1 + 0.3 * k * near(d, 34) } };
    RINGS.forEach(([r, , rate], i) => (poses[`ring${i}`] = { r: (x - 100) * rate * k, s: 1 + 0.04 * k * near(d - r, 18) }));
    return poses;
  },
};
