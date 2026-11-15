import { C, type Figure, clamp, draw } from '../model.ts';

export const look: Figure = {
  name: 'look',
  label: 'A round eye with a yellow iris under a raised brow',
  about: 'The eye follows the pointer, the pupil a little ahead of the iris, and the brow tilts with it.',
  bg: 'blue',
  shapes: () => [
    ['path', draw({ d: 'M36.4 36.4A90 90 0 0 1 163.6 36.4', stroke: C.white, 'data-p': 'brow', 'data-at': '100 100' })],
    ['circle', { cx: 100, cy: 106, r: 72, fill: C.white, 'data-fx': 'pop' }],
    ['circle', { cx: 100, cy: 106, r: 36, fill: C.sun, 'data-fx': 'pop', 'data-p': 'iris' }],
    [
      'g',
      { 'data-p': 'pupil' },
      [
        ['circle', { cx: 100, cy: 106, r: 16, fill: C.ink, 'data-fx': 'pop' }],
        ['circle', { cx: 107, cy: 99, r: 4, fill: C.white, 'data-fx': 'pop' }],
      ],
    ],
  ],
  answer: ({ x, y, k }) => {
    const d = Math.hypot(x - 100, y - 106) || 1;
    const reach = clamp(d / 90) * Math.min(32, 24 * k);
    const ux = (x - 100) / d;
    const uy = (y - 106) / d;
    return {
      iris: { x: ux * reach, y: uy * reach },
      pupil: { x: ux * (reach + clamp(d / 90) * 9), y: uy * (reach + clamp(d / 90) * 9) },
      brow: { y: clamp((y - 100) * 0.05 * k, -8, 6), r: (x - 100) * 0.05 * k },
    };
  },
};
