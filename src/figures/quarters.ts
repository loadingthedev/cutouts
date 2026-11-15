import { C, type Colour, type Figure, type Pose, type Shape, clamp } from '../model.ts';

const QUARTERS: [string, Colour, number, number][] = [
  ['M100 100V18A82 82 0 0 0 18 100Z', 'blue', -1, -1],
  ['M100 100H182A82 82 0 0 0 100 18Z', 'red', 1, -1],
  ['M100 100V182A82 82 0 0 0 182 100Z', 'sun', 1, 1],
  ['M100 100H18A82 82 0 0 0 100 182Z', 'pink', -1, 1],
];

export const quarters: Figure = {
  name: 'quarters',
  label: 'A disc in four coloured quarters with a dark centre',
  about: 'The quarter the pointer is over pulls out of the disc, and the centre dot looks its way.',
  bg: 'paper',
  shapes: () => [
    ...QUARTERS.map(
      ([d, fill, dx, dy], i): Shape => [
        'path',
        { d, fill: C[fill], stroke: C.paper, 'stroke-width': 4, 'stroke-linejoin': 'round', 'data-fx': 'fade', 'data-x': dx * 44, 'data-y': dy * 44, 'data-p': `q${i}` },
      ],
    ),
    ['circle', { cx: 100, cy: 100, r: 12, fill: C.ink, 'data-fx': 'pop', 'data-p': 'eye' }],
  ],
  answer: ({ x, y, k }) => {
    const d = Math.hypot(x - 100, y - 100) || 1;
    const ux = ((x - 100) / d) * clamp(d / 50);
    const uy = ((y - 100) / d) * clamp(d / 50);
    const poses: Record<string, Pose> = { eye: { x: ux * 7, y: uy * 7 } };
    QUARTERS.forEach(([, , dx, dy], i) => {
      const pull = Math.max(0, (ux * dx + uy * dy) / Math.SQRT2) * 10 * k;
      poses[`q${i}`] = { x: dx * pull, y: dy * pull };
    });
    return poses;
  },
};
