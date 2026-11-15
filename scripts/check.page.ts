import { createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import * as lib from '../src/index.ts';
import { Orbit } from '../src/react.ts';

Object.assign(window, {
  lib,
  hydrate: (el: Element, props: object) => hydrateRoot(el, createElement(Orbit, props)),
});
