import { C, type Figure, type Pose, type Shape, near } from '../model.ts';

export const chat: Figure = {
  name: 'chat',
  label: 'Two chat bubbles, blue and white; the white one shows three typing dots',
  about: 'The typing dots bounce in a wave while the pointer is there. The bubble nearer the pointer swells and the two slide apart.',
  bg: 'pink',
  shapes: () => [
    ['rect', { x: 14, y: 30, width: 120, height: 60, rx: 14, fill: C.blue, 'data-fx': 'fade', 'data-x': -40, 'data-p': 'a' }],
    [
      'g',
      { 'data-p': 'b' },
      [
        ['rect', { x: 66, y: 110, width: 120, height: 60, rx: 14, fill: C.white, 'data-fx': 'fade', 'data-x': 40 }],
        ...[102, 126, 150].map((cx, i): Shape => ['circle', { cx, cy: 140, r: 5, fill: C.ink, 'data-fx': 'pop', 'data-p': `dot${i}` }]),
      ],
    ],
  ],
  answer: ({ x, y, t, k }) => {
    const slide = (x - 100) * 0.05 * k;
    const poses: Record<string, Pose> = {
      a: { x: slide, s: 1 + 0.06 * k * near(Math.hypot(x - 74, y - 60), 70) },
      b: { x: -slide, s: 1 + 0.06 * k * near(Math.hypot(x - 126, y - 140), 70) },
    };
    for (let i = 0; i < 3; i++) poses[`dot${i}`] = { y: -8 * k * Math.max(0, Math.sin(t * 7 - i * 0.9)) };
    return poses;
  },
};
