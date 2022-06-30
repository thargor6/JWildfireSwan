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
import './views/editor/editor-view';
import './views/main-layout';
import {msg} from "@lit/localize";

export type ViewRoute = Route & {
  title?: string;
  icon?: string;
  children?: ViewRoute[];
};

export const views: ViewRoute[] = [
  // place routes below (more info https://vaadin.com/docs/latest/fusion/routing/overview)
  {
    path: '',
    component: 'editor-view',
    icon: '',
    title: '',
  },
  {
    path: 'editor',
    component: 'editor-view',
    icon: 'la la-file',
    title: msg('Flame editor'),
  },
  {
    path: 'editor/example/:example',
    component: 'editor-view',
    icon: 'la la-file',
    title: msg('Flame editor'),
  },
  {
    path: 'editor/genrnd/:rndGenName',
    component: 'editor-view',
    icon: 'la la-file',
    title: msg('Flame editor'),
  },
  {
    path: 'editor/openrnd/:rndFlameName',
    component: 'editor-view',
    icon: 'la la-file',
    title: msg('Flame editor'),
  },
  {
    path: 'playground/openrnd/:parentRndFlameName/:rndFlameName',
    component: 'editor-view',
    icon: 'la la-file',
    title: msg('Flame editor'),
  },
  {
    path: 'single-renderer',
    component: 'single-renderer-view',
    icon: 'la la-th-list',
    title: msg('Flame renderer'),
    action: async (_context, _command) => {
      await import('./views/single-renderer/single-renderer-view');
      return;
    },
  },
  /*
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

   */
  {
    path: 'gallery',
    component: 'gallery-view',
    icon: 'la la-th-list',
    title: msg('Flame example gallery'),
    action: async (_context, _command) => {
      await import('./views/gallery/gallery-view');
      return;
    },
  },
/*
  {
    path: 'batch-renderer',
    component: 'batch-renderer-view',
    icon: 'la la-th-list',
    title: msg('Batch renderer'),
    action: async (_context, _command) => {
      await import('./views/batch-renderer/batch-renderer-view');
      return;
    },
  },
*/
  {
    path: 'about',
    component: 'about-view',
    icon: 'la la-file',
    title: msg('Help / About'),
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
