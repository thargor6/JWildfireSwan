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
    path: 'about',
    component: 'about-view',
    icon: 'la la-file',
    title: 'About',
    action: async (_context, _command) => {
      await import('./views/about/about-view');
      return;
    },
  },
/*
  {
    path: 'hello-world',
    component: 'hello-world-view',
    icon: 'la la-globe',
    title: 'Hello World',
    action: async (_context, _command) => {
      await import('./views/helloworld/hello-world-view');
      return;
    },
  },
  {
    path: 'card-list',
    component: 'card-list-view',
    icon: 'la la-list',
    title: 'Card List',
    action: async (_context, _command) => {
      await import('./views/cardlist/card-list-view');
      return;
    },
  },
  {
    path: 'master-detail',
    component: 'master-detail-view',
    icon: 'la la-columns',
    title: 'Master-Detail',
    action: async (_context, _command) => {
      await import('./views/masterdetail/master-detail-view');
      return;
    },
  },
  {
    path: 'person-form',
    component: 'person-form-view',
    icon: 'la la-user',
    title: 'Person Form',
    action: async (_context, _command) => {
      await import('./views/personform/person-form-view');
      return;
    },
  },
  {
    path: 'address-form',
    component: 'address-form-view',
    icon: 'la la-map-marker',
    title: 'Address Form',
    action: async (_context, _command) => {
      await import('./views/addressform/address-form-view');
      return;
    },
  },
  {
    path: 'credit-card-form',
    component: 'credit-card-form-view',
    icon: '',
    title: 'Credit Card Form',
    action: async (_context, _command) => {
      await import('./views/creditcardform/credit-card-form-view');
      return;
    },
  },
  {
    path: 'map',
    component: 'map-view',
    icon: 'la la-map',
    title: 'Map',
    action: async (_context, _command) => {
      await import('./views/map/map-view');
      return;
    },
  },
  {
    path: 'checkout-form',
    component: 'checkout-form-view',
    icon: '',
    title: 'Checkout Form',
    action: async (_context, _command) => {
      await import('./views/checkoutform/checkout-form-view');
      return;
    },
  },*/
];
export const routes: ViewRoute[] = [
  {
    path: '',
    component: 'main-layout',
    children: [...views],
  },
];
