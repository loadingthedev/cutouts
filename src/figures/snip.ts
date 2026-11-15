import { C, type Figure, type Shape, clamp } from '../model.ts';

// Drawn shut along the cut line and opened 14 degrees by a plain transform, so the pose turns each arm about the rivet.
const OPEN = 14;
const RIVET = '76 100';
const handle = { fill: 'none', stroke: C.sun, 'stroke-width': 7, 'stroke-linecap': 'round' };

const arm = (i: number): Shape => {
  // The arm whose blade is on top has its ring below, and the other way round.
  const s = i ? 1 : -1;
  const y = (n: number) => 100 + s * n;
  return [
    'g',
    { transform: `rotate(${s * OPEN} ${RIVET})` },
    [
      [
        'g',
        { 'data-p': `arm${i}`, 'data-at': RIVET, 'data-fx': 'fade', 'data-rot': s * -OPEN },
        [
          ['path', { d: `M68 100H152L70 ${y(9)}Z`, fill: C.white }],
          ['path', { ...handle, d: `M72 ${y(-2)}L42 ${y(-14)}` }],
          ['circle', { ...handle, cx: 27, cy: y(-22), r: 16 }],
        ],
      ],
    ],
  ];
};

export const snip: Figure = {
  name: 'snip',
  label: 'A pair of scissors open on a dashed cutting line',
  about: 'The scissors travel along the line with the pointer, and snip as it moves.',
  bg: 'green',
  shapes: () => [
    ['path', { d: 'M6 100H194', fill: 'none', stroke: C.white, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': '6 9', 'data-fx': 'fade' }],
    ['g', { 'data-p': 'scissors' }, [arm(0), arm(1), ['circle', { cx: 76, cy: 100, r: 5, fill: C.red, 'data-fx': 'pop' }]]],
  ],
  answer: ({ x, k }) => {
    // One snip for every 36 units the pointer travels.
    const open = clamp(OPEN * k, 6, 24) * (0.5 + 0.5 * Math.cos((x / 36) * 2 * Math.PI));
    return {
      scissors: { x: clamp(x / 200) * 42 },
      arm0: { r: OPEN - open },
      arm1: { r: open - OPEN },
    };
  },
};
