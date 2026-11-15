import { C, type Figure, clamp, draw } from '../model.ts';

// The frame hangs from its top-left corner; the red handle is the corner the pointer drags.
const X = 36;
const Y = 40;
const W = 118;
const H = 110;

export const select: Figure = {
  name: 'select',
  label: 'A selection frame with a red handle around a yellow disc and a blue square; a pink disc sits outside it',
  about: 'The pointer drags the red handle and the frame stretches after it. Shapes it takes in lift a little.',
  bg: 'paper',
  shapes: () => [
    ['circle', { cx: 82, cy: 86, r: 28, fill: C.sun, 'data-fx': 'pop', 'data-p': 'a' }],
    ['rect', { x: 100, y: 96, width: 40, height: 40, fill: C.blue, 'data-fx': 'pop', 'data-p': 'b' }],
    ['circle', { cx: 60, cy: 172, r: 15, fill: C.pink, 'data-fx': 'pop', 'data-p': 'c' }],
    ['path', draw({ d: `M${X} ${Y}H${X + W}`, 'data-p': 'top', 'data-at': `${X} ${Y}` })],
    ['path', draw({ d: `M${X} ${Y}V${Y + H}`, 'data-p': 'left', 'data-at': `${X} ${Y}` })],
    ['path', draw({ d: `M${X + W} ${Y}V${Y + H}`, 'data-p': 'right', 'data-at': `${X + W} ${Y}` })],
    ['path', draw({ d: `M${X} ${Y + H}H${X + W}`, 'data-p': 'bottom', 'data-at': `${X} ${Y + H}` })],
    ['rect', { x: X - 4, y: Y - 4, width: 8, height: 8, fill: C.ink, 'data-fx': 'pop' }],
    ['rect', { x: X + W - 7, y: Y + H - 7, width: 14, height: 14, fill: C.red, 'data-fx': 'pop', 'data-p': 'handle' }],
  ],
  answer: ({ x, y, k }) => {
    const cx = clamp(x, 70, 188);
    const cy = clamp(y, 70, 188);
    const sx = (cx - X) / W;
    const sy = (cy - Y) / H;
    const lift = (px: number, py: number) => ({ s: px < cx && py < cy ? 1 + 0.08 * k : 1 });
    return {
      top: { sx },
      left: { sy },
      right: { x: cx - X - W, sy },
      bottom: { y: cy - Y - H, sx },
      handle: { x: cx - X - W, y: cy - Y - H },
      a: lift(82, 86),
      b: lift(120, 116),
      c: lift(60, 172),
    };
  },
};
