import { C, type Figure, type Pose, draw } from '../model.ts';

const TRACK = { x: 26, y: 60, width: 148, height: 80, rx: 40 };

export const toggle: Figure = {
  name: 'toggle',
  label: 'A switch turned on, with its light lit',
  about: 'The switch follows the pointer’s side: left turns it off and dims the light, right turns it back on.',
  bg: 'red',
  shapes: () => [
    ['rect', { ...TRACK, fill: C.white, 'data-fx': 'pop' }],
    ['rect', { ...TRACK, fill: C.blue, 'data-fx': 'fade', 'data-p': 'on' }],
    ['circle', { cx: 134, cy: 100, r: 30, fill: C.ink, 'data-fx': 'pop', 'data-x': -68, 'data-p': 'knob' }],
    ['circle', { cx: 162, cy: 30, r: 9, fill: C.sun, 'data-fx': 'pop', 'data-p': 'light' }],
    ['path', draw({ d: 'M26 170H118' })],
  ],
  answer: ({ x }): Record<string, Pose> => (x > 100 ? {} : { on: { o: 0 }, knob: { x: -68 }, light: { o: 0.25, s: 0.7 } }),
};
