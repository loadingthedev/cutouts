import { C, type Figure, type Pose, type Shape, clamp, draw } from '../model.ts';

export const dawn: Figure = {
  name: 'dawn',
  label: 'A sun half risen over the sea, with a small red sail on the horizon',
  about: 'The sun rises and sets with the pointer’s height and drifts after it. Its reflection widens as it climbs, and the boat rocks.',
  bg: 'sky',
  shapes: () => [
    ['circle', { cx: 100, cy: 118, r: 44, fill: C.sun, 'data-fx': 'fade', 'data-y': 50, 'data-p': 'sun' }],
    ['rect', { x: 0, y: 118, width: 200, height: 82, fill: C.blue, 'data-fx': 'grow' }],
    ...[[76, 124], [86, 114], [94, 106]].map(([a, b], i): Shape => ['path', draw({ d: `M${a} ${140 + i * 16}H${b}`, stroke: C.white, 'data-p': `glint${i}` })]),
    [
      'g',
      { 'data-p': 'boat', 'data-at': '165 118' },
      [
        ['path', { d: 'M160 110V82L180 110Z', fill: C.red, 'data-fx': 'pop' }],
        ['path', { d: 'M146 112H184L178 122H152Z', fill: C.ink, 'data-fx': 'pop' }],
      ],
    ],
  ],
  answer: ({ x, y, t, k }) => {
    const up = clamp(((100 - y) / 100) * k, -1, 1);
    const drift = (x - 100) * 0.25;
    const poses: Record<string, Pose> = {
      // 40 up shows the whole disc; 46 down puts it under the sea.
      sun: { x: drift, y: up > 0 ? -40 * up : -46 * up },
      boat: { r: 4 * k * Math.sin(t * 2.2), y: 1.5 * Math.sin(t * 2.2 + 1) },
    };
    for (let i = 0; i < 3; i++) poses[`glint${i}`] = { x: drift, sx: clamp(1 + 0.7 * up, 0.15, 1.7) };
    return poses;
  },
};
