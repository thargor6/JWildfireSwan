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


import '@vaadin/horizontal-layout';
import '@vaadin/polymer-legacy-adapter';
import '@vaadin/select';
import '@vaadin/vertical-layout';
import '@vaadin/vaadin-button'
import '@vaadin/combo-box'
import {html, nothing} from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { View } from '../../views/view';
import {galleryStore, SortOrder} from "Frontend/stores/gallery-store";
import {Router} from "@vaadin/router";
import {playgroundStore} from "Frontend/stores/playground-store";

@customElement('gallery-view')
export class GalleryView extends View {

  render = () => {
    return html`
      <main class="max-w-screen-lg mx-auto pb-l px-l">
        <vaadin-horizontal-layout class="items-center justify-between">
          <vaadin-vertical-layout>
            <h2 class="mb-0 mt-xl text-3xl">Gallery</h2>
            <p class="mb-xl mt-0 text-secondary">A gallery of example flames.</p>
            <p class="mb-xl mt-0 text-secondary">All images where rendered inside the browser</p>
          </vaadin-vertical-layout>
        <vaadin-vertical-layout>
          <vaadin-combo-box label="Sort by" .value=${galleryStore.sortOrder} .items=${
             [{ value: SortOrder.NEWEST_FIRST, caption: "Newest first"}, 
                 { value: SortOrder.OLDEST_FIRST, caption: "Oldest first"},
                 { value: SortOrder.RANDOM, caption: "Random"}]} 
                  item-label-path="caption" item-value-path="value" @change="${this.sortOrderChanged}">
          </vaadin-combo-box>
          <vaadin-button @click="${this.refreshItems}">Refresh</vaadin-button>
        </vaadin-vertical-layout>
        </vaadin-horizontal-layout>
        <ol class="gap-m grid list-none m-0 p-0">
          ${galleryStore.exampleFlames.map(
            (example) => html`
              <li class="bg-contrast-5 flex flex-col items-start p-m rounded-l">
                <div
                  class="bg-contrast flex items-center justify-center mb-m overflow-hidden rounded-m w-full"
                  style="height: 160px;"
                >
                  <img alt=${example.title} @click="${this.renderExample.bind(this, example.name)}" class="w-full" style="cursor: pointer;" loading="lazy" src="./images/${example.name}.jpg" />
                </div>
                <span class="text-xl font-semibold">${example.title}</span>
                ${(example.caption && example.caption!=='') ? html `<span class="text-s text-secondary">${example.caption}</span>`: nothing}  
                
                <span class="text-s text-secondary">Date: ${example.modified.toLocaleString()}</span>
                ${(example.description && example.description!=='') ? html `<p class = "my-m" >${example.description}</p>`: nothing}
                ${example.tags.length > 0 ? html `${example.tags.map(tag => html `#${tag} `)}` : nothing}
                <vaadin-button @click="${this.renderExample.bind(this, example.name)}">Render in Playground</vaadin-button>
              </li>
            `
          )}
        </ol>
      </main>
    `;
  }

  connectedCallback = () => {
    super.connectedCallback();
    this.classList.add('flex', 'flex-col', 'h-full');
  }

  sortOrderChanged = (e: any)=>{
     const sortOrder: SortOrder = e.target.value
     galleryStore.changeSortOrder(sortOrder)
  }

  renderExample = (example: string) => {
      Router.go('/playground/'+example)
  }

  refreshItems = () => {
      galleryStore.changeSortOrder(galleryStore.sortOrder)
  }
}
