import { C, type Figure, clamp, draw, near } from '../model.ts';

export const crates: Figure = {
  name: 'crates',
  label: 'Three stacked crates on the ground beside a red ball',
  about: 'The top crate slides along the two below to stay under the pointer. The ball hops when the pointer comes near.',
  bg: 'green',
  shapes: () => [
    ['path', draw({ d: 'M8 178H192', stroke: C.white })],
    ['rect', { x: 20, y: 114, width: 64, height: 64, fill: C.sun, 'data-fx': 'grow' }],
    ['rect', { x: 84, y: 114, width: 64, height: 64, fill: C.white, 'data-fx': 'grow' }],
    ['rect', { x: 52, y: 50, width: 64, height: 64, fill: C.pink, 'data-fx': 'pop', 'data-y': -40, 'data-p': 'top' }],
    ['circle', { cx: 170, cy: 156, r: 22, fill: C.red, 'data-fx': 'fade', 'data-x': 40, 'data-p': 'ball' }],
  ],
  answer: ({ x, y, k }) => ({
    top: { x: clamp(x - 84, -32, 32) },
    ball: { y: -26 * k * near(Math.hypot(x - 170, y - 156), 52) },
  }),
};
