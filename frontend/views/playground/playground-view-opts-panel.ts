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
import {customElement, property} from 'lit/decorators.js';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-text-field'
import '@vaadin/dialog';
import '@vaadin/horizontal-layout';
import '@vaadin/text-area';
import '@vaadin/text-field';
import '@vaadin/vertical-layout';
import '@vaadin/vaadin-details'
import '@vaadin/vaadin-combo-box';
import {playgroundStore} from "Frontend/stores/playground-store";

import {MobxLitElement} from "@adobe/lit-mobx";

@customElement('playground-view-opts-panel')
export class PlaygroundViewOptsPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  brightnessElement!: any

  param1Element!: any

  displayModeElements!: any

  render() {
    console.log("RENDER PNK")
    return html`
      <div style="${this.visible ? `display:block;`: `display:none;`}">
        <paper-slider id="brightness" step="0.0001" value="1.6" min="0" max="4"></paper-slider>
        <paper-slider  id="param1" step="0.1" value="2.5" min="0" max="10.0"></paper-slider>
        <label><input type="radio" id="displayMode" name="displayMode" value="flame" checked="checked">Flame</label>
        <label><input type="radio" id="displayMode" name="displayMode" value="position">Position Iteration</label>
        <label><input type="radio" id="displayMode" name="displayMode" value="colour">Color Iteration</label>
      </div>
`;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  protected firstUpdated() {
    this.brightnessElement = this.shadowRoot!.querySelector("#brightness") as HTMLElement
    this.param1Element = this.shadowRoot!.querySelector("#param1") as HTMLElement
    this.displayModeElements = this.shadowRoot!.querySelectorAll('#displayMode')
    playgroundStore.notifyInit(this.tagName)
   }


}
