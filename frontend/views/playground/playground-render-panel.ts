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

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-combo-box';
import {playgroundStore} from "Frontend/stores/playground-store";

import {MobxLitElement} from "@adobe/lit-mobx";
import {HasValue} from "@hilla/form";
import {DisplayMode} from "Frontend/flames/renderer/render-settings";
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import {RenderResolution, RenderResolutions} from "Frontend/flames/renderer/render-resolution";
import {ComboBoxRenderer} from "@vaadin/combo-box";

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
  renderSize = RenderResolutions.defaultRenderSize

  renderSizes = RenderResolutions.renderSizes

  @state()
  swarmSize = RenderResolutions.defaultSwarmSize

  swarmSizes = RenderResolutions.swarmSizes

  @state()
  cropSize = RenderResolutions.defaultRenderResolution

  cropSizes = RenderResolutions.getRenderResolutions(this.renderSize)


  @state()
  qualityScale = RenderResolutions.defaultQualityScale

  qualityScaleValues = RenderResolutions.qualityScales

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
      <vertical-layout theme="spacing" style="${this.visible ? `display:block;`: `display:none;`}">
        <div class="gap-m grid list-none m-0 p-0" style="grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));">
          <vaadin-combo-box style="max-width: 10em;" label="Render size" .items="${this.renderSizes}" value="${this.renderSize}"
                            @change="${(event: Event) => this.renderSizeChanged(event)}"></vaadin-combo-box>
          <vaadin-combo-box style="max-width: 10em;" label="Crop size" 
              .items="${this.cropSizes!.map(cropSize => cropSize.displayName)}" value="${this.cropSize.displayName}" 
                              @change="${(event: Event) => this.cropSizeChanged(event)}"></vaadin-combo-box>
          <vaadin-combo-box style="max-width: 10em;" label="Swarm size" .items="${this.swarmSizes}" value="${this.swarmSize}"
                          @change="${(event: Event) => this.pointsSizeChanged(event)}"></vaadin-combo-box>
            <vaadin-combo-box style="max-width: 10em;" label="Quality scale"
                              .items="${this.qualityScaleValues}" value="${this.qualityScale}"
                              @change="${(event: Event) => this.qualityScaleChanged(event)}"></vaadin-combo-box>
            <vaadin-combo-box style="max-width: 10em;" label="Display mode"
                              .items="${this.displayModes}" .value=${this.displayMode}
                              item-value-path="displayMode" item-label-path="caption"
                              @change="${(event: Event) => this.displayModeChanged(event)}"></vaadin-combo-box>
         </div>
          
 
        <div style="display: flex; margin-top: 2em;">
          <div style="display: flex; flex-wrap: wrap;">
            <label>Final image (use right-click and save-as to export):</label>
            <div id="captured-image-container"></div>
          </div>
            <div style="display: flex; align-items: center;">
                <vaadin-button theme="primary" style="max-width: 10em;" @click="${this.onRefresh}">Refresh</vaadin-button>
                <vaadin-button theme="tertiary" style="max-width: 10em;" @click="${this.onCancelRender}">Cancel</vaadin-button>
            </div>
        </div>
      </vertical-layout>
`;
  }

  private renderSizeChanged(event: Event) {
    if ((event.target as HasValue<string>).value) {
      this.renderSize = parseInt((event.target as HasValue<string>).value!)
      this.cropSizes = RenderResolutions.getRenderResolutions(this.renderSize)
      this.cropSize = this.cropSizes![0]
      this.onImageSizeChanged()
    }
  }

  private cropSizeChanged(event: Event) {
    if ((event.target as HasValue<string>).value) {
      this.cropSize = RenderResolutions.findRenderResolutionByName(this.renderSize, (event.target as HasValue<string>).value!)
      this.onImageSizeChanged()
    }
  }

  private pointsSizeChanged(event: Event) {
    if ((event.target as HasValue<string>).value) {
      this.swarmSize = parseInt((event.target as HasValue<string>).value!)
      this.onImageSizeChanged()
    }
  }


  private qualityScaleChanged(event: Event) {
    if ((event.target as HasValue<string>).value) {
      this.qualityScale = parseFloat((event.target as HasValue<string>).value!)
      this.onImageSizeChanged()
    }
  }

  private displayModeChanged(event: Event) {
    if ((event.target as HasValue<DisplayMode>).value) {
      this.displayMode = (event.target as HasValue<DisplayMode>).value!
    }
  }

  protected firstUpdated() {
    this.capturedImageContainer = this.shadowRoot!.querySelector('#captured-image-container')!
    playgroundStore.notifyInit(this.tagName)
  }

  private cropSizesRenderer: ComboBoxRenderer<RenderResolutions> = (root, _, { item: resolution }) => {
    render(
      html`
        <div>Jo
         
        </div>
      `,
      root
    );
  };
}
