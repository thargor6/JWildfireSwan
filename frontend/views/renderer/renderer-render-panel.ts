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

import {html, render} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";
import {RendererFlame, rendererStore} from "Frontend/stores/renderer-store";
import '@vaadin/vaadin-grid'
import '@vaadin/vaadin-grid/vaadin-grid-column'
import {GridActiveItemChangedEvent, GridItemModel} from "@vaadin/grid";
import { applyTheme } from 'Frontend/generated/theme';

@customElement('renderer-render-panel')
export class RendererRenderPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @state()
  private selectedItems: RendererFlame[] = [];

  // for displaying badges properly
  protected createRenderRoot() {
    const root = super.createRenderRoot();
    applyTheme(root);
    return root;
  }

  render() {
    return html`
      <div style="${this.visible ? `display:block;`: `display:none;`}">
          
          <vaadin-grid .items=${rendererStore.flames}
                  .selectedItems="${this.selectedItems}"
                  @active-item-changed="${(e: GridActiveItemChangedEvent<RendererFlame>) => {
                  const item = e.detail.value;
                  this.selectedItems = item ? [item] : [];
              }}">
              <vaadin-grid-column
                      header="Flame"
                      path = "finished"
                      .renderer="${this.flameRenderer}"
                      auto-width
              ></vaadin-grid-column>
              <vaadin-grid-column
                      header="Status"
                      path="uuid"
                      .renderer="${this.statusRenderer}"
                      auto-width
              ></vaadin-grid-column>
          </vaadin-grid>

      </div>
     `;
  }

  private flameRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<RendererFlame>) => {
    const flame = model.item;
    render(
      html`
         <div style="display: flex; flex-direction: column;"> 
           <span>${flame.filename}</span>
           <span style="font-size: xx-small;">${flame.uuid}</span>
         </div>
       `,
      root
    );
  };

  private statusRenderer = (root: HTMLElement, _: HTMLElement, model: GridItemModel<RendererFlame>) => {
    const flame = model.item;
    render(
      html`
        <span theme="${flame.finished ? 'badge success' : 'badge'}">${flame.finished ? 'finished' : 'idle'}</span>
      `,
      root
    );
  };
}
