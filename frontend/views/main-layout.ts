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
      <vaadin-app-layout primary-section="drawer">
        <header class="bg-base border-b border-contrast-10 box-border flex h-xl items-center w-full" slot="navbar">
          <vaadin-drawer-toggle aria-label="Menu toggle" class="text-secondary" theme="contrast"></vaadin-drawer-toggle>
          <h1 class="m-0 text-l">${appStore.currentViewTitle}</h1>
        </header>
        <section class="flex flex-col items-stretch max-h-full min-h-full" slot="drawer">
            <img style="margin-left: 1em; margin-top: 1em; width: 12.5rem;" alt="JWildfire Swan" src="./icons/swan_logo_05.svg" />
          <h2 class="flex items-center h-xl m-0 px-m text-m">${appStore.applicationName}</h2>
          <nav aria-labelledby="views-title" class="border-b border-contrast-10 flex-grow overflow-auto">
            <h3 class="flex items-center h-m mx-m my-0 text-s text-tertiary" id="views-title">Views</h3>
            <ul class="list-none m-0 p-0">
              ${this.getMenuRoutes().map(
            (viewRoute) => html`
                  <li>
                    <a
                      ?highlight=${viewRoute.path == appStore.location}
                      class="flex mx-s p-s relative text-secondary"
                      href=${router.urlForPath(viewRoute.path)}
                    >
                      <span class="${viewRoute.icon} me-s text-l"></span>
                      <span class="font-medium text-s">${viewRoute.title}</span>
                    </a>
                  </li>
                `
        )}
            </ul>
          </nav>
          <footer class="flex items-center my-s px-m py-xs"></footer>
        </section>
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
        return views.filter((route) => (route.path.indexOf(':')<0)) as RouteInfo[];
    }
}
