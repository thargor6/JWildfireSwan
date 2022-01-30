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

@customElement('playground-render-panel')
export class PlaygroundRenderPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property()
  onRefresh = ()=>{}

  @property()
  onImageSizeChanged: ()=>void = ()=>{}

  @state()
  imageSize = 512

  imageSizes = [256, 512, 1024, 2048]

  @state()
  pointsSize = 256

  pointsSizes = [8, 16, 32, 64, 128, 256, 512]

  brightnessElement!: any
  param1Element!: any
  displayModeElements!: any

  render() {
    return html`
      <div style="${this.visible ? `display:block;`: `display:none;`}">
        <div style="display: flex; flex-direction: column;">
        
        <vaadin-combo-box style="max-width: 10em;" label="Image size" .items="${this.imageSizes}" value="${this.imageSize}"
                          @change="${(event: Event) => this.imageSizeChanged(event)}"></vaadin-combo-box>
        <vaadin-combo-box style="max-width: 10em;" label="Swarm size" .items="${this.pointsSizes}" value="${this.pointsSize}"
                          @change="${(event: Event) => this.pointsSizeChanged(event)}"></vaadin-combo-box>

        <vaadin-button style="max-width: 10em;" @click="${this.onRefresh}">Refresh</vaadin-button>
        
        <div style="display: flex;">
        <label>brightness</label><paper-slider id="brightness" step="0.0001" value="1.6" min="0" max="4"></paper-slider>
        <paper-slider style="display: none;" id="param1" step="0.1" value="2.5" min="0" max="10.0"></paper-slider>
        </div>
        <label><input type="radio" id="displayMode" name="displayMode" value="flame" checked="checked">Flame</label>
        <label><input type="radio" id="displayMode" name="displayMode" value="position">Position Iteration</label>
        <label><input type="radio" id="displayMode" name="displayMode" value="colour">Color Iteration</label>

        </div>
      </div>
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
      this.pointsSize = parseInt((event.target as HasValue<string>).value!)
      this.onImageSizeChanged()
    }
  }

  protected firstUpdated() {
    this.brightnessElement = this.shadowRoot!.querySelector("#brightness") as HTMLElement
    this.param1Element = this.shadowRoot!.querySelector("#param1") as HTMLElement
    this.displayModeElements = this.shadowRoot!.querySelectorAll('#displayMode')
    playgroundStore.notifyInit(this.tagName)
  }

}
