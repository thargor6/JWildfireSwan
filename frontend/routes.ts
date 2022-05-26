/*
  JWildfire Swan - fractal flames the playful way, GPU accelerated
  Copyright (C) 2021-2022 Andreas Maschke

  This is free software; you can redistribute it and/or modify it under the terms of the GNU Lesser
  General Public License as published by the Free Software Foundation; either version 2.1 of the
  License, or (at your option) any later version.

  This software is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
  even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
  Lesser General Public License for more details.

  You should have received a copy of the GNU Lesser General Public License along with this software;
  if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
  02110-1301 USA, or see the FSF site: http://www.fsf.org.
*/

import { Route } from '@vaadin/router';
import './views/playground/playground-view';
import './views/main-layout';

export type ViewRoute = Route & {
  title?: string;
  icon?: string;
  children?: ViewRoute[];
};

export const views: ViewRoute[] = [
  // place routes below (more info https://vaadin.com/docs/latest/fusion/routing/overview)
  {
    path: '',
    component: 'playground-view',
    icon: '',
    title: '',
  },
  {
    path: 'playground',
    component: 'playground-view',
    icon: 'la la-file',
    title: 'Playground',
  },
  {
    path: 'playground/:example',
    component: 'playground-view',
    icon: 'la la-file',
    title: 'Playground',
  },
  {
    path: 'playground/rnd/:rndFlameName',
    component: 'playground-view',
    icon: 'la la-file',
    title: 'Playground',
  },
  {
    path: 'playground/rnd/:parentRndFlameName/:rndFlameName',
    component: 'playground-view',
    icon: 'la la-file',
    title: 'Playground',
  },
  {
    path: 'editor',
    component: 'editor-view',
    icon: 'la la-file',
    title: 'Editor',
    action: async (_context, _command) => {
      await import('./views/editor/editor-view');
      return;
    },
  },
  {
    path: 'randomizer',
    component: 'randomizer-view',
    icon: 'la la-th-list',
    title: 'Flame randomizer',
    action: async (_context, _command) => {
      await import('./views/randomizer/randomizer-view');
      return;
    },
  },
  {
    path: 'gallery',
    component: 'gallery-view',
    icon: 'la la-th-list',
    title: 'Example Gallery',
    action: async (_context, _command) => {
      await import('./views/gallery/gallery-view');
      return;
    },
  },
  {
    path: 'renderer',
    component: 'renderer-view',
    icon: 'la la-th-list',
    title: 'Batch renderer',
    action: async (_context, _command) => {
      await import('./views/renderer/renderer-view');
      return;
    },
  },
  {
    path: 'about',
    component: 'about-view',
    icon: 'la la-file',
    title: 'Help / About',
    action: async (_context, _command) => {
      await import('./views/about/about-view');
      return;
    },
  },
];

export const routes: ViewRoute[] = [
  {
    path: '',
    component: 'main-layout',
    children: [...views],
  },
];
