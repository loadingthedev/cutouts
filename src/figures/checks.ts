import { C, type Figure, type Pose, type Shape, clamp, draw, near } from '../model.ts';

const ENDS = [176, 150, 164];

export const checks: Figure = {
  name: 'checks',
  label: 'Three rows, each a disc and a line: two blue discs and one red',
  about: 'Each row is a slider. The disc in the pointer’s row runs along its line to the pointer.',
  bg: 'sun',
  shapes: () => [
    ...ENDS.map((x, i): Shape => ['path', draw({ d: `M74 ${50 + i * 50}H${x}` })]),
    ...ENDS.map((_, i): Shape => ['circle', { cx: 40, cy: 50 + i * 50, r: 16, fill: i < 2 ? C.blue : C.red, 'data-fx': 'pop', 'data-p': `knob${i}` }]),
  ],
  answer: ({ x, y, k }) => {
    const poses: Record<string, Pose> = {};
    ENDS.forEach((end, i) => {
      const row = near(y - 50 - i * 50, 24);
      poses[`knob${i}`] = { x: row * clamp(x - 40, 0, end - 40), s: 1 + 0.12 * k * row };
    });
    return poses;
  },
};
