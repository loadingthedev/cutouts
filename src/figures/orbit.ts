import { C, type Figure, type Pose, type Shape, angle, draw, near, polar } from '../model.ts';

const MOONS = [-60, -5, 50];

export const orbit: Figure = {
  name: 'orbit',
  label: 'Three blue moons on a ring around a white disc',
  about: 'The moons run round the ring to the pointer and gather where it touches. The disc leans after it.',
  bg: 'red',
  shapes: () => [
    ['circle', draw({ cx: 100, cy: 100, r: 86 })],
    ['circle', { cx: 100, cy: 100, r: 56, fill: C.white, 'data-fx': 'pop', 'data-p': 'disc' }],
    ...MOONS.map((deg, i): Shape => {
      const [cx, cy] = polar(86, deg);
      return ['circle', { cx, cy, r: 14, fill: C.blue, 'data-fx': 'fade', 'data-rot': -120, 'data-p': `moon${i}`, 'data-at': '100 100' }];
    }),
  ],
  answer: ({ x, y, k }) => {
    const turn = angle(x, y) - MOONS[1]!;
    // 55 degrees apart at rest; on the ring they close up until they almost touch.
    const gap = Math.max(22, 55 - 30 * k * near(Math.hypot(x - 100, y - 100) - 86, 40));
    const poses: Record<string, Pose> = { disc: { x: (x - 100) * 0.08 * k, y: (y - 100) * 0.08 * k } };
    MOONS.forEach((_, i) => (poses[`moon${i}`] = { r: turn + (i - 1) * (gap - 55) }));
    return poses;
  },
};
