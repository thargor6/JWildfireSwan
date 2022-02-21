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

import {html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-combo-box';
import {playgroundStore} from "Frontend/stores/playground-store";

import {MobxLitElement} from "@adobe/lit-mobx";
import {HasValue} from "@vaadin/form";
import {DisplayMode} from "Frontend/flames/renderer/render-settings";
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'

interface DisplayModeItem {
  displayMode: DisplayMode;
  caption: string;
}

@customElement('playground-render-panel')
export class PlaygroundRenderPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property()
  onRefresh = ()=>{}

  @property()
  onCancelRender = ()=>{}

  @property()
  onImageSizeChanged: ()=>void = ()=>{}

  @state()
  imageSize = 512

  imageSizes = [128, 256, 512, 1024, 2048]

  @state()
  swarmSize = 256

  swarmSizes = [8, 16, 32, 64, 128, 256, 512, 1024]

  displayModes: DisplayModeItem[] = [
      { displayMode: DisplayMode.FLAME, caption: "Flame"},
      { displayMode: DisplayMode.POSITION_ITER, caption: "Position iteration"},
      { displayMode: DisplayMode.COLOR_ITER, caption: "Color iteration"},
      { displayMode: DisplayMode.GRADIENT, caption: "Gradient"}]

  @state()
  displayMode: DisplayMode = DisplayMode.FLAME

  capturedImageContainer!: HTMLDivElement

  render() {
    return html`
      <vertical-layout theme="spacing" style="${this.visible ? `display:block; width: 20em;`: `display:none;`}">

          <vaadin-horizontal-layout theme="spacing">
          <vaadin-combo-box style="max-width: 10em;" label="Image size" .items="${this.imageSizes}" value="${this.imageSize}"
                            @change="${(event: Event) => this.imageSizeChanged(event)}"></vaadin-combo-box>
          <vaadin-combo-box style="max-width: 10em;" label="Swarm size" .items="${this.swarmSizes}" value="${this.swarmSize}"
                            @change="${(event: Event) => this.pointsSizeChanged(event)}"></vaadin-combo-box>
          </vaadin-horizontal-layout>

        <vaadin-horizontal-layout theme="spacing">
          <vaadin-button theme="primary" style="max-width: 10em;" @click="${this.onRefresh}">Refresh</vaadin-button>
          <vaadin-button style="max-width: 10em;" @click="${this.onCancelRender}">Cancel</vaadin-button>
        </vaadin-horizontal-layout>  

          <vaadin-combo-box style="max-width: 10em;" label="Display mode" 
                            .items="${this.displayModes}" .value=${this.displayMode}
                            item-value-path="displayMode" item-label-path="caption"
                            @change="${(event: Event) => this.displayModeChanged(event)}"></vaadin-combo-box>

        <div style="display: flex; align-items: center; justify-content: center; margin-top: 2em;">
          <vertical-layout>
            <label>Final image (use right-click and save-as to export):</label>
            <div id="captured-image-container"></div>
          </vertical-layout>
        </div>
      </vertical-layout>
`;
  }

  private imageSizeChanged(event: Event) {
    if ((event.target as HasValue<string>).value) {
      this.imageSize = parseInt((event.target as HasValue<string>).value!)
      this.onImageSizeChanged()
    }
  }

  private pointsSizeChanged(event: Event) {
    if ((event.target as HasValue<string>).value) {
      this.swarmSize = parseInt((event.target as HasValue<string>).value!)
      this.onImageSizeChanged()
    }
  }

  private displayModeChanged(event: Event) {
    if ((event.target as HasValue<DisplayMode>).value) {
      this.displayMode = (event.target as HasValue<DisplayMode>).value!
      if(this.displayMode && playgroundStore.renderer) {
        playgroundStore.renderer.settings.displayMode = this.displayMode
      }
    }
  }

  protected firstUpdated() {
    this.capturedImageContainer = this.shadowRoot!.querySelector('#captured-image-container')!
    playgroundStore.notifyInit(this.tagName)
  }

}
