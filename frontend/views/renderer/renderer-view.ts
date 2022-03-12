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
import {customElement, state, query} from 'lit/decorators.js'
import { View } from '../../views/view'
import './renderer-upload-panel';
import './renderer-render-panel';
import {rendererStore} from "Frontend/stores/renderer-store";
import {RendererUploadPanel} from "Frontend/views/renderer/renderer-upload-panel";

@customElement('renderer-view')
export class RendererView extends View  {
    canvas!: HTMLCanvasElement
    canvasContainer!: HTMLDivElement

    @state()
    renderInfo = ''

    @state()
    renderProgress = 0.0

    @query('#uploadPnl')
    uploadPnl?: RendererUploadPanel

    render() {
        return html`
          
            <vertical-layout theme="spacing">
              <swan-error-panel .errorMessage=${rendererStore.lastError}></swan-error-panel>
              <div class="gap-m grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));">
                  ${this.renderMainTabs()}
              </div>  
            </vertical-layout>
        `;
    }

    private renderMainTabs = () => {
        return html `
           <div style="display: flex; flex-direction: column; padding: 1em;">

 
               <renderer-upload-panel id='uploadPnl'></renderer-upload-panel>

               <renderer-render-panel id='renderPnl'></renderer-render-panel>
           </div>`
    }

}