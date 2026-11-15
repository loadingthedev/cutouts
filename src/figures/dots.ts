import { C, type Figure, type Pose, type Shape, clamp, near } from '../model.ts';

const AT = [28, 64, 100, 136, 172];
const GRID = AT.flatMap((cy) => AT.map((cx): [number, number] => [cx, cy]));

export const dots: Figure = {
  name: 'dots',
  label: 'A grid of white dots, one of them red',
  about: 'The dots swell under the pointer and lean away from it, like a lens passing over the grid.',
  bg: 'blue',
  shapes: () => GRID.map(([cx, cy], i): Shape => ['circle', { cx, cy, r: 5, fill: i === 8 ? C.red : C.white, 'data-fx': 'pop', 'data-p': `dot${i}` }]),
  answer: ({ x, y, k }) => {
    const poses: Record<string, Pose> = {};
    GRID.forEach(([cx, cy], i) => {
      const d = Math.hypot(cx - x, cy - y) || 1;
      const lens = near(d, 44);
      const push = (9 * k * lens * clamp(d / 20)) / d;
      poses[`dot${i}`] = { x: (cx - x) * push, y: (cy - y) * push, s: Math.min(3.2, 1 + 1.5 * k * lens) };
    });
    return poses;
  },
};
