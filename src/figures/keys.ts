import { C, type Figure, type Pose, type Shape, near, stroke } from '../model.ts';

const DEPTH = 10;
const KEYS: { x: number; y: number; w: number; fill: string; mark: Shape }[] = [
  { x: 14, y: 36, w: 52, fill: C.white, mark: ['circle', { ...stroke, cx: 40, cy: 62, r: 8 }] },
  { x: 74, y: 36, w: 52, fill: C.sun, mark: ['circle', { cx: 100, cy: 62, r: 8, fill: C.red }] },
  { x: 134, y: 36, w: 52, fill: C.white, mark: ['path', { ...stroke, d: 'M150 62H170' }] },
  { x: 14, y: 110, w: 172, fill: C.blue, mark: ['path', { ...stroke, stroke: C.white, d: 'M76 136H124' }] },
];

export const keys: Figure = {
  name: 'keys',
  label: 'Three keys above a wide space bar, each standing on its shadow',
  about: 'The key under the pointer sinks flat onto its shadow, and the keys beside it dip.',
  bg: 'lilac',
  shapes: () =>
    KEYS.flatMap(({ x, y, w, fill, mark }, i): Shape[] => [
      ['rect', { x, y: y + DEPTH, width: w, height: 52, rx: 10, fill: C.ink, 'data-fx': 'pop' }],
      ['g', { 'data-p': `key${i}`, 'data-fx': 'pop' }, [['rect', { x, y, width: w, height: 52, rx: 10, fill }], mark]],
    ]),
  answer: ({ x, y, k }) => {
    const poses: Record<string, Pose> = {};
    const spread = 8 + 10 * k;
    KEYS.forEach((key, i) => {
      const dx = Math.max(0, Math.abs(x - key.x - key.w / 2) - key.w / 2);
      const dy = Math.max(0, Math.abs(y - key.y - 26 - DEPTH / 2) - 26 - DEPTH / 2);
      poses[`key${i}`] = { y: DEPTH * near(Math.hypot(dx, dy), spread) };
    });
    return poses;
  },
};
