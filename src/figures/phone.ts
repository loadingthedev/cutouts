import { C, type Figure, draw, near } from '../model.ts';

export const phone: Figure = {
  name: 'phone',
  label: 'A phone showing a picture, two lines of text and a button, with a red badge on its corner',
  about: 'The phone tilts toward the pointer and its screen scrolls with the pointer’s height. The badge swells as the pointer nears it.',
  bg: 'lilac',
  shapes: () => [
    [
      'g',
      { 'data-p': 'phone', 'data-at': '100 190' },
      [
        ['rect', { x: 52, y: 10, width: 96, height: 180, rx: 16, fill: C.white, 'data-fx': 'pop' }],
        ['rect', draw({ x: 52, y: 10, width: 96, height: 180, rx: 16 })],
        [
          'g',
          { 'data-p': 'screen' },
          [
            ['rect', { x: 66, y: 40, width: 68, height: 44, fill: C.blue, 'data-fx': 'grow' }],
            ['path', draw({ d: 'M66 104H134' })],
            ['path', draw({ d: 'M66 124H112' })],
            ['rect', { x: 66, y: 146, width: 68, height: 22, fill: C.sun, 'data-fx': 'pop' }],
          ],
        ],
        ['circle', { cx: 150, cy: 22, r: 16, fill: C.red, 'data-fx': 'pop', 'data-y': -30, 'data-p': 'badge' }],
      ],
    ],
  ],
  answer: ({ x, y, k }) => ({
    phone: { r: (x - 100) * 0.05 * k },
    screen: { y: (100 - y) * 0.1 * k },
    badge: { s: 1 + 0.3 * k * near(Math.hypot(x - 150, y - 22), 60) },
  }),
};
