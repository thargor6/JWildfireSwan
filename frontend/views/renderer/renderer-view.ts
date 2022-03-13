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

import {html, PropertyValues} from 'lit'
import {customElement} from 'lit/decorators.js'
import { View } from '../../views/view'
import './renderer-upload-panel';
import './renderer-render-panel';
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import {rendererStore} from "Frontend/stores/renderer-store";
import '../../components/render-panel'
import '../../components/swan-error-panel'
import {FlameRenderer} from "Frontend/flames/renderer/flame-renderer";
import {DisplayMode} from "Frontend/flames/renderer/render-settings";
import {RenderPanel} from "Frontend/components/render-panel";

@customElement('renderer-view')
export class RendererView extends View  {

    render() {
        return html`
            <vertical-layout theme="spacing">
              <swan-error-panel .errorMessage=${rendererStore.lastError}></swan-error-panel>
              <div class="gap-m grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(30em, 1fr));">
                  <div style="display: flex; flex-direction: column; padding: 1em;">
                      <renderer-upload-panel></renderer-upload-panel>
                      <renderer-render-panel></renderer-render-panel>
                  </div>
                  <render-panel .onCreateFlameRenderer=${this.createFlameRenderer}></render-panel>
                  <vaadin-button @click="${()=>this.getRenderPanel().rerenderFlame()}">Button</vaadin-button>                  
              </div>
            </vertical-layout>
        `;
    }

    createFlameRenderer = ()=> {
        return new FlameRenderer(256, 256,
          DisplayMode.FLAME, this.getRenderPanel().canvas, undefined,
          false, rendererStore.selectedFlames[0].flame)
    }

    getRenderPanel = (): RenderPanel =>  {
        return document.querySelector('render-panel')!
    }

}