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

import {html} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import { View } from '../../views/view'
import {playgroundStore} from "Frontend/stores/playground-store";
import './renderer-upload-panel';
import './renderer-render-panel';

@customElement('renderer-view')
export class RendererView extends View  {
    canvas!: HTMLCanvasElement
    canvasContainer!: HTMLDivElement

    @state()
    selectedTab = 0

    @state()
    renderInfo = ''

    @state()
    renderProgress = 0.0

    render() {
        return html`
          
            <vertical-layout theme="spacing">
              <swan-error-panel .errorMessage=${playgroundStore.lastError}></swan-error-panel>
              <div class="gap-m grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));">
                  ${this.renderMainTabs()}
              </div>  
            </vertical-layout>
        `;
    }

    private renderMainTabs = () => {
        return html `
           <div style="display: flex; flex-direction: column; padding: 1em;">
                <vaadin-tabs theme="centered" @selected-changed="${this.selectedChanged}">
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:fire"></vaadin-icon>
                        <span>Select files</span>
                    </vaadin-tab>
                    <vaadin-tab theme="icon-on-top">
                        <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                        <span>Render</span>
                    </vaadin-tab>
                </vaadin-tabs>
                <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
                    <renderer-upload-panel id='uploadPnl' .visible=${this.selectedTab === 0}></renderer-upload-panel>
                    <renderer-render-panel id='viewOptsPnl' .visible=${this.selectedTab === 1}></renderer-render-panel>
                 </div>
           </div>`
    }

    selectedChanged(e: CustomEvent) {
        this.selectedTab = e.detail.value;
    }

}