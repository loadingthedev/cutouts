import { figures, mount } from '../src/index.ts';

const slider = document.querySelector<HTMLInputElement>('#intensity')!;
const readout = document.querySelector('output')!;
const play = document.querySelector<HTMLInputElement>('#play')!;

// Nothing hovers on a touch screen, so there the figures start out playing.
play.checked = matchMedia('(hover: none)').matches;

const mounted = [...document.querySelectorAll<HTMLElement>('[data-figure]')].map((el) => {
  const always = 'play' in el.dataset;
  const figure = mount(el, figures.find((f) => f.name === el.dataset.figure)!, { intensity: +slider.value, play: always || play.checked });
  return { figure, always };
});

slider.addEventListener('input', () => {
  readout.textContent = (+slider.value).toFixed(2);
  for (const { figure } of mounted) figure.update({ intensity: +slider.value });
});
play.addEventListener('change', () => {
  for (const { figure, always } of mounted) if (!always) figure.update({ play: play.checked });
});
document.querySelector('#replay')!.addEventListener('click', () => {
  for (const { figure } of mounted) figure.replay();
});
