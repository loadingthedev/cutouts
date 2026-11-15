import { C, type Figure, type Pose, type Shape, draw, near } from '../model.ts';

export const halves: Figure = {
  name: 'halves',
  label: 'A disc split in two halves, blue and yellow, with a red ball above the gap',
  about: 'The halves part as the pointer nears the seam, and the ball drops into the gap.',
  bg: 'ink',
  shapes: () => [
    ['path', draw({ d: 'M14 186H186', stroke: C.white })],
    ['path', { d: 'M92 34A70 70 0 0 0 92 174Z', fill: C.blue, 'data-fx': 'fade', 'data-x': -48, 'data-p': 'left' }],
    ['path', { d: 'M108 34A70 70 0 0 1 108 174Z', fill: C.sun, 'data-fx': 'fade', 'data-x': 48, 'data-p': 'right' }],
    ...[78, 104, 130].map((cy, i): Shape => ['circle', { cx: 100, cy, r: 5, fill: C.white, 'data-fx': 'pop', 'data-p': `dot${i}` }]),
    ['circle', { cx: 100, cy: 16, r: 13, fill: C.red, 'data-fx': 'pop', 'data-y': -40, 'data-p': 'ball' }],
  ],
  answer: ({ x, k }) => {
    const open = near(x - 100, 46);
    const poses: Record<string, Pose> = {
      left: { x: -13 * open * k },
      right: { x: 13 * open * k },
      ball: { y: 46 * open * Math.min(k, 1.2) },
    };
    for (let i = 0; i < 3; i++) poses[`dot${i}`] = { y: 8 * open * k };
    return poses;
  },
};
