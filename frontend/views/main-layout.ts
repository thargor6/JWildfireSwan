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

import '@vaadin/app-layout';
import { AppLayout } from '@vaadin/app-layout';
import '@vaadin/app-layout/vaadin-drawer-toggle';
import '@vaadin/avatar/vaadin-avatar';
import '@vaadin/context-menu';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/tabs';
import '@vaadin/tabs/vaadin-tab';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { router } from '../index';
import { views } from '../routes';
import { appStore } from '../stores/app-store';
import { Layout } from './view';
import {galleryStore} from "Frontend/stores/gallery-store";

interface RouteInfo {
  path: string;
  title: string;
  icon: string;
}

@customElement('main-layout')
export class MainLayout extends Layout {
  render() {
    return html`
        <vaadin-app-layout>
            <header class="bg-base border-b border-contrast-10 box-border flex flex-col w-full" slot="navbar">
                <div class="flex h-xl items-center px-l">
                    <h1 class="my-0 me-auto text-l">${appStore.applicationName}</h1>
                </div>
                <nav class="flex gap-s overflow-auto px-m">
                    <ul class="flex list-none m-0 p-0">
                        ${this.getMenuRoutes().map(
                                (viewRoute) => html`
                                    <li>
                                        <a
                                                ?highlight=${viewRoute.path == appStore.location}
                                                class="flex 
                  h-m items-center px-s relative text-secondary"
                                                href=${router.urlForPath(viewRoute.path)}
                                        >
                                            <span class="${viewRoute.icon} me-s text-l"></span>
                                            <span class="font-medium text-s whitespace-nowrap">${viewRoute.title}</span>
                                        </a>
                                    </li>
                                `
                        )}
                    </ul>
                </nav>
            </header>
            <slot></slot>
        </vaadin-app-layout>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add('block', 'h-full');
    this.reaction(
      () => appStore.location,
      () => {
        AppLayout.dispatchCloseOverlayDrawerEvent();
      }
    );

  }


  private getMenuRoutes(): RouteInfo[] {
    return views.filter((route) => (route.title === 'Help / About' || route.title === 'Playground' || route.title === 'Example Gallery') && (route.path.indexOf(':')<0)) as RouteInfo[];
  }
}
