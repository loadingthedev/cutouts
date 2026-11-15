import { C, type Figure, clamp, draw } from '../model.ts';

export const pair: Figure = {
  name: 'pair',
  label: 'Two overlapping discs, blue and yellow, with a red dot where they meet',
  about: 'The discs close over each other as the pointer nears the middle and part toward the edges. The red dot grows with the overlap.',
  bg: 'ink',
  shapes: () => [
    ['circle', { cx: 70, cy: 100, r: 56, fill: C.blue, 'data-fx': 'fade', 'data-x': -44, 'data-p': 'a' }],
    [
      'g',
      { 'data-p': 'b' },
      [
        ['circle', draw({ cx: 130, cy: 100, r: 56, stroke: C.white })],
        ['circle', { cx: 130, cy: 100, r: 56, fill: C.sun, 'fill-opacity': 0.9, 'data-fx': 'fade', 'data-x': 44 }],
      ],
    ],
    ['circle', { cx: 100, cy: 100, r: 9, fill: C.red, 'data-fx': 'pop', 'data-p': 'dot' }],
  ],
  answer: ({ x, y, k }) => {
    // 1 with the pointer on the middle, -1 at either edge.
    const close = 1 - Math.abs(x - 100) / 50;
    const shift = clamp(18 * k * close, -14, 30);
    const lean = (y - 100) * 0.06 * k;
    return {
      a: { x: shift, y: lean },
      b: { x: -shift, y: -lean },
      dot: { s: clamp(1 + shift / 20, 0.3, 2.4) },
    };
  },
};
