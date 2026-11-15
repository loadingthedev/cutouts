import { C, type Figure, type Pose, draw, near, stroke } from '../model.ts';

// Where the caret can stand: before, between and after the three blocks. It rests in the last.
const GAPS = [22, 70, 114, 167];
const BLOCKS = [48, 92, 136];

export const compose: Figure = {
  name: 'compose',
  label: 'A text field holding two blocks, an empty dashed block and a red caret',
  about: 'The caret jumps to the gap nearest the pointer and blinks there. The blocks beside it make room.',
  bg: 'blue',
  shapes: () => [
    ['rect', { x: 14, y: 62, width: 172, height: 76, fill: C.white, 'data-fx': 'pop' }],
    ['rect', { x: 30, y: 82, width: 36, height: 36, fill: C.ink, 'data-fx': 'fade', 'data-p': 'block0' }],
    ['rect', { x: 74, y: 82, width: 36, height: 36, fill: C.sun, 'data-fx': 'fade', 'data-p': 'block1' }],
    [
      'g',
      { 'data-p': 'block2' },
      [
        ['rect', { ...stroke, x: 118, y: 82, width: 36, height: 36, 'stroke-dasharray': '5 6', 'data-fx': 'fade', 'data-x': 30 }],
        ['path', draw({ d: 'M118 128H154' })],
      ],
    ],
    ['rect', { x: 164, y: 78, width: 6, height: 44, fill: C.red, 'data-fx': 'pop', 'data-p': 'caret' }],
  ],
  answer: ({ x, t, k }) => {
    const gap = GAPS.reduce((best, g) => (Math.abs(g - x) < Math.abs(best - x) ? g : best));
    const poses: Record<string, Pose> = { caret: { x: gap - 167, o: Math.sin(t * 6) > -0.4 ? 1 : 0.15 } };
    BLOCKS.forEach((at, i) => (poses[`block${i}`] = { x: Math.sign(at - gap) * 3 * k * near(at - gap, 30) }));
    return poses;
  },
};
