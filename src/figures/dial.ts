import { C, type Figure, type Shape, angle, clamp, draw, polar, stroke } from '../model.ts';

// The needle is drawn 35 degrees right of straight up; the bar below shows the same reading.
const REST = 35;
const reading = (deg: number) => (deg + 80) / 160;

export const dial: Figure = {
  name: 'dial',
  label: 'A half-round gauge with a needle on a red hub, above a bar showing its reading',
  about: 'The needle swings to point at the pointer, and the bar below fills to the same reading.',
  bg: 'paper',
  shapes: () => [
    ['path', { d: 'M20 132A80 80 0 0 1 180 132Z', fill: C.sun, 'data-fx': 'grow' }],
    ['path', draw({ d: 'M8 132H192' })],
    ...[205, 237.5, 270, 302.5, 335].map((deg): Shape => {
      const [cx, cy] = polar(68, deg, 100, 132);
      return ['circle', { cx, cy, r: 4, fill: C.ink, 'data-fx': 'pop' }];
    }),
    ['path', draw({ d: `M100 132L${polar(54, REST - 90, 100, 132).join(' ')}`, 'stroke-width': 5, 'data-p': 'needle', 'data-at': '100 132' })],
    ['circle', { cx: 100, cy: 132, r: 11, fill: C.red, 'data-fx': 'pop' }],
    ['rect', { x: 40, y: 156, width: 120 * reading(REST), height: 16, fill: C.blue, 'data-fx': 'fade', 'data-x': -30, 'data-p': 'bar', 'data-at': '40 164' }],
    ['rect', { ...stroke, x: 40, y: 156, width: 120, height: 16, pathLength: 1, 'data-fx': 'draw' }],
  ],
  answer: ({ x, y }) => {
    // Degrees from straight up, -180 to 180, held inside the gauge.
    const up = ((angle(x, y, 100, 132) + 630) % 360) - 180;
    const deg = clamp(up, -80, 80);
    return { needle: { r: deg - REST }, bar: { sx: reading(deg) / reading(REST) } };
  },
};
