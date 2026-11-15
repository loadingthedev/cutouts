import { C, type Figure, type Shape, clamp, draw, near } from '../model.ts';

const LINE: [number, number][] = [[74, 158], [100, 136], [124, 148], [160, 126]];
const LENGTHS = LINE.slice(1).map(([x, y], i) => Math.hypot(x - LINE[i]![0], y - LINE[i]![1]));
const TOTAL = LENGTHS.reduce((a, b) => a + b);

// The point on the chart line above `px`, and how far along the line it is, 0 to 1.
function along(px: number) {
  const x = clamp(px, 74, 160);
  let run = 0;
  for (let i = 0; i < LENGTHS.length; i++) {
    const [ax, ay] = LINE[i]!;
    const [bx, by] = LINE[i + 1]!;
    if (x <= bx) {
      const t = (x - ax) / (bx - ax);
      return { x, y: ay + (by - ay) * t, part: (run + LENGTHS[i]! * t) / TOTAL };
    }
    run += LENGTHS[i]!;
  }
  return { x: 160, y: 126, part: 1 };
}

export const dashboard: Figure = {
  name: 'dashboard',
  label: 'An app window with a sidebar, two cards and a line chart ending in a red dot',
  about: 'The red dot scrubs the chart to the pointer and the line draws up to it. The card under the pointer lifts.',
  bg: 'lilac',
  shapes: () => [
    ['path', draw({ d: 'M12 28H188V172H12Z' })],
    ['path', draw({ d: 'M12 56H188' })],
    ...[28, 42, 56].map((cx): Shape => ['circle', { cx, cy: 42, r: 4, fill: C.ink, 'data-fx': 'pop' }]),
    ['rect', { x: 12, y: 56, width: 44, height: 116, fill: C.blue, 'data-fx': 'grow' }],
    ['rect', { x: 74, y: 72, width: 46, height: 38, fill: C.white, 'data-fx': 'pop', 'data-p': 'card0' }],
    ['rect', { x: 134, y: 72, width: 38, height: 38, fill: C.sun, 'data-fx': 'pop', 'data-p': 'card1' }],
    ['path', draw({ d: `M${LINE.map((p) => p.join(' ')).join('L')}`, 'data-p': 'line' })],
    ['circle', { cx: 160, cy: 126, r: 8, fill: C.red, 'data-fx': 'pop', 'data-p': 'dot' }],
  ],
  answer: ({ x, y, k }) => {
    const at = along(x);
    return {
      line: { d: 1 - at.part },
      dot: { x: at.x - 160, y: at.y - 126 },
      card0: { y: -6 * k * near(Math.hypot(x - 97, y - 91), 34) },
      card1: { y: -6 * k * near(Math.hypot(x - 153, y - 91), 34) },
    };
  },
};
