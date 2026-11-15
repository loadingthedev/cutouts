import { C, type Figure, type Shape, clamp, draw } from '../model.ts';

const FILLS = [C.blue, C.white, C.red];

export const cradle: Figure = {
  name: 'cradle',
  label: 'Three balls hanging in a row from a frame',
  about: 'The cradle runs while the pointer is there: the end balls swing out in turn, further the nearer the pointer is to a side.',
  bg: 'sun',
  shapes: () => [
    ['path', draw({ d: 'M12 182V30H188V182' })],
    ...FILLS.map((fill, i): Shape => {
      const x = 64 + i * 36;
      return [
        'g',
        { 'data-p': `ball${i}`, 'data-at': `${x} 30` },
        [
          ['path', draw({ d: `M${x} 30V118` })],
          ['circle', { cx: x, cy: 134, r: 18, fill, 'data-fx': 'pop' }],
        ],
      ];
    }),
  ],
  answer: ({ x, t, k }) => {
    // 24 degrees is as far as an end ball swings before it meets the frame.
    const swing = Math.min(24, 20 * k) * clamp(0.45 + Math.abs(x - 100) / 90);
    const beat = Math.sin(t * 4.5);
    return {
      ball0: { r: swing * Math.max(0, beat) },
      ball1: { r: -beat },
      ball2: { r: -swing * Math.max(0, -beat) },
    };
  },
};
