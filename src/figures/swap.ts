import { C, type Figure, clamp } from '../model.ts';

export const swap: Figure = {
  name: 'swap',
  label: 'A pink disc on a yellow square, beside the empty dashed ring it came from',
  about: 'The disc follows the pointer back to its empty ring in an arc, shrinking to fit, and the square tips as it leaves.',
  bg: 'green',
  shapes: () => [
    ['circle', { cx: 34, cy: 102, r: 28, fill: 'none', stroke: C.white, 'stroke-width': 3, 'stroke-dasharray': '5 7', 'data-fx': 'fade' }],
    ['rect', { x: 70, y: 40, width: 124, height: 124, fill: C.sun, 'data-fx': 'pop', 'data-p': 'square' }],
    ['circle', { cx: 132, cy: 102, r: 38, fill: C.pink, 'data-fx': 'fade', 'data-x': -98, 'data-p': 'disc' }],
  ],
  answer: ({ x, k }) => {
    const home = clamp((132 - x) / 98);
    return {
      disc: { x: -98 * home, y: -20 * k * Math.sin(Math.PI * home), s: 1 - 0.34 * home },
      square: { r: -4 * k * home },
    };
  },
};
