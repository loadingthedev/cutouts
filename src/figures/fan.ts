import { C, type Figure, type Pose, type Shape, angle, clamp, near } from '../model.ts';

// A hand of cards fanned about a point below them. Each is drawn upright and turned by a plain transform.
const PIVOT = '100 176';
const FAN = 24;
const FILLS = [C.blue, C.sun, C.white];

export const fan: Figure = {
  name: 'fan',
  label: 'Three cards held in a fan, the front one marked with a red dot',
  about: 'The hand turns toward the pointer and opens wider as the pointer rises. The card under it slides up out of the fan.',
  bg: 'ink',
  shapes: () =>
    FILLS.map((fill, i): Shape => {
      const turn = (i - 1) * FAN;
      return [
        'g',
        { transform: `rotate(${turn} ${PIVOT})` },
        [
          [
            'g',
            { 'data-p': `card${i}`, 'data-at': PIVOT, 'data-fx': 'fade', 'data-rot': -turn, 'data-y': 30 },
            [['rect', { x: 68, y: 44, width: 64, height: 96, rx: 10, fill }], ...(i === 2 ? [['circle', { cx: 100, cy: 74, r: 9, fill: C.red }] as Shape] : [])],
          ],
        ],
      ];
    }),
  answer: ({ x, y, k }) => {
    const hand = (x - 100) * 0.1 * k;
    const wider = 1 + 0.4 * k * clamp((120 - y) / 100, -0.6, 1);
    const pointer = angle(x, y, 100, 176) + 90;
    const poses: Record<string, Pose> = {};
    FILLS.forEach((_, i) => {
      // Past 32 degrees a card's corner leaves the canvas.
      const turn = clamp((i - 1) * FAN * wider + hand, -32, 32);
      poses[`card${i}`] = { r: turn - (i - 1) * FAN, y: -14 * k * near(pointer - turn, 13) };
    });
    return poses;
  },
};
