import { C, type Figure, type Shape, clamp, draw } from '../model.ts';

export const redline: Figure = {
  name: 'redline',
  label: 'A page of text with one passage struck out in red and another added in blue',
  about: 'The pointer scrubs the edit: to the left the strike is taken back and the blue passage closes up; to the right it is made again.',
  bg: 'sky',
  shapes: () => [
    ['rect', { x: 30, y: 12, width: 140, height: 176, fill: C.white, 'data-fx': 'pop' }],
    ...[42, 66].map((y): Shape => ['path', draw({ d: `M50 ${y}H150` })]),
    ['rect', { x: 50, y: 88, width: 76, height: 14, fill: C.red, 'data-fx': 'fade' }],
    ['path', draw({ d: 'M42 95H134', 'data-p': 'strike' })],
    ['rect', { x: 50, y: 116, width: 100, height: 14, fill: C.blue, 'data-fx': 'fade', 'data-x': -40, 'data-p': 'added', 'data-at': '50 123' }],
    ['path', draw({ d: 'M50 156H118', 'data-p': 'last' })],
  ],
  answer: ({ x }) => {
    const done = clamp((x - 40) / 110);
    return {
      strike: { d: 1 - done },
      added: { sx: done },
      // The line below moves up into the room the blue passage leaves.
      last: { y: -26 * (1 - done) },
    };
  },
};
