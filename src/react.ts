'use client';
import { type ComponentPropsWithoutRef, createElement, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as all from './figures/index.ts';
import { type Figure, type Options, svg } from './model.ts';
import { type Mounted, mount } from './mount.ts';

export type CutoutProps = Options & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'dangerouslySetInnerHTML'>;

function component(figure: Figure) {
  const Cutout = forwardRef<HTMLDivElement, CutoutProps>(function Cutout({ intensity, play, label, field, wait = true, ...rest }, ref) {
    const el = useRef<HTMLDivElement>(null);
    const mounted = useRef<Mounted | null>(null);
    useImperativeHandle(ref, () => el.current!);
    const name = label ?? rest['aria-label'];
    // The drawing is in the first HTML the server sends; the effects below only add motion to it.
    // A component always brings its script, so by default the parts wait for it instead of showing and starting over.
    // The name is left out of the dependencies: a new one is set in place below, without drawing the figure again.
    const html = useMemo(() => svg(figure, { label: name, field, wait }), [field, wait]);
    useEffect(() => {
      mounted.current = mount(el.current!, figure, { intensity, play });
      return () => mounted.current?.destroy();
    }, [html]);
    useEffect(() => mounted.current?.update({ intensity, play }), [intensity, play]);
    useEffect(() => mounted.current?.update({ label: name ?? '' }), [name]);
    return createElement('div', { ...rest, 'aria-label': undefined, ref: el, dangerouslySetInnerHTML: { __html: html } });
  });
  Cutout.displayName = figure.name[0]!.toUpperCase() + figure.name.slice(1);
  return Cutout;
}

export const Orbit = component(all.orbit);
export const Bars = component(all.bars);
export const Halves = component(all.halves);
export const Rings = component(all.rings);
export const Quarters = component(all.quarters);
export const Dashboard = component(all.dashboard);
export const Swap = component(all.swap);
export const Release = component(all.release);
export const Redline = component(all.redline);
export const Crates = component(all.crates);
export const Phone = component(all.phone);
export const Checks = component(all.checks);
export const Pair = component(all.pair);
export const Compose = component(all.compose);
export const Chat = component(all.chat);
export const Look = component(all.look);
export const Dial = component(all.dial);
export const Toggle = component(all.toggle);
export const Cradle = component(all.cradle);
export const Dawn = component(all.dawn);
export const Dots = component(all.dots);
export const Select = component(all.select);
export const Keys = component(all.keys);
export const Snip = component(all.snip);
export const Fan = component(all.fan);
