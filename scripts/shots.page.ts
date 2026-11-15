import { figures, mount } from '../src/index.ts';

const el = document.getElementById('f')!;
mount(el, figures.find((f) => f.name === el.dataset.name)!);
