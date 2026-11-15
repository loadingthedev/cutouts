import { figures, mount } from '../src/index.ts';

// Mounts every figure the page holds: <div data-name="orbit">, with data-play to have it play on its own.
for (const el of document.querySelectorAll<HTMLElement>('[data-name]')) mount(el, figures.find((f) => f.name === el.dataset.name)!, { play: 'play' in el.dataset });
