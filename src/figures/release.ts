import { C, type Figure, type Pose, type Shape, clamp, draw, near, stroke } from '../model.ts';

const FILLS = [C.white, C.blue, C.red];

export const release: Figure = {
  name: 'release',
  label: 'Three boxes in a row, with an arrow curving from the last back to the one before',
  about: 'The box under the pointer lifts and its dot swells. Over the first box, the arrow steps back one more.',
  bg: 'sky',
  shapes: () => [
    ['path', draw({ d: 'M4 132H196' })],
    ...FILLS.map((fill, i): Shape => ['rect', { x: 4 + i * 68, y: 76, width: 56, height: 56, fill, 'data-fx': 'grow', 'data-p': `box${i}` }]),
    [
      'g',
      { 'data-p': 'arrow' },
      [
        ['path', draw({ d: 'M168 66A34 34 0 0 0 100 66' })],
        ['path', { ...stroke, d: 'M91 57L100 68L109 57', 'data-fx': 'fade' }],
      ],
    ],
    ...[32, 100, 168].map((cx, i): Shape => ['circle', { cx, cy: 150, r: 5, fill: C.ink, 'data-fx': 'pop', 'data-p': `dot${i}` }]),
  ],
  answer: ({ x, k }) => {
    // Which box the pointer is over, as a number that slides from 0 to 2.
    const at = clamp((x - 32) / 68, 0, 2);
    const back = clamp(1 - at);
    const lift = (box: number) => -12 * k * near(at - box, 0.6);
    // The arrow rises with whichever box under it rises more, so a lifted box never runs into it.
    const poses: Record<string, Pose> = { arrow: { x: -68 * back, y: Math.min(lift(1 - back), lift(2 - back)) } };
    for (let i = 0; i < 3; i++) {
      poses[`box${i}`] = { y: lift(i) };
      poses[`dot${i}`] = { s: 1 + 0.7 * k * near(at - i, 0.6) };
    }
    return poses;
  },
};
