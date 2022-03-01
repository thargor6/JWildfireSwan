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
import '@vaadin/vaadin-text-field'
import '@vaadin/dialog';
import '@vaadin/horizontal-layout';
import '@vaadin/text-area';
import '@vaadin/text-field';
import '@vaadin/vertical-layout';
import '@vaadin/vaadin-details'
import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import {playgroundStore} from "Frontend/stores/playground-store";

import {MobxLitElement} from "@adobe/lit-mobx";
import {HasValue} from "@vaadin/form";

@customElement('playground-flame-panel')
export class PlaygroundFlamePanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property()
  flameXml = ''

  @property()
  onImport: ()=>void = ()=> {}

  @property()
  onRandomFlame: ()=>void = ()=> {}

  @property()
  onRandomGradient: ()=>void = ()=> {}

  @property()
  onCaptureImage: ()=>void = ()=>{}

  @state()
  flameName = 'example003'

  @property()
  onFlameNameChanged: ()=>void = ()=> {}

  render() {
    return html`
      <div style="${this.visible ? `display:block;`: `display:none;`}">
        <div style="display:flex; flex-direction: column;">
          <vaadin-combo-box label="Example flame" .items="${playgroundStore.exampleFlamenames}" value="${this.flameName}"
                            @change="${(event: Event) => this.flameNameChanged(event)}"></vaadin-combo-box>
          <vaadin-text-area style="max-width:100em; max-height: 32em; font-size: xx-small;" label="Flame xml" value="${this.flameXml}" @change="${(event: Event)=>this.flameXmlChanged(event)}"></vaadin-text-area>
          <vaadin-vertical-layout theme="padding">
          
          <div style="display: grid;">
            <vaadin-button ?disabled=${playgroundStore.calculating} theme="primary" @click="${this.onImport}">Import flame from xml</vaadin-button>
            <vaadin-horizontal-layout theme="spacing">
            <vaadin-button ?disabled=${playgroundStore.calculating} theme="primary" @click="${this.onRandomFlame}">Generate random flame</vaadin-button>
            <vaadin-button ?disabled=${playgroundStore.calculating} theme="secondary" @click="${this.onRandomGradient}">Generate random gradient</vaadin-button>
            </vaadin-horizontal-layout>
          </div>
          <swan-loading-indicator .loading=${playgroundStore.calculating} caption="Calculating..."></swan-loading-indicator>
          </vaadin-vertical-layout>
        </div>
      </div>
`;
  }

  private flameXmlChanged(event: Event) {
    if((event.target as HasValue<string>).value) {
      this.flameXml = (event.target as HasValue<string>).value!
    }
  }

  private flameNameChanged(event: Event) {
    if ((event.target as HasValue<string>).value) {
      this.flameName = (event.target as HasValue<string>).value!
      this.onFlameNameChanged()
    }
  }

  protected firstUpdated() {
    playgroundStore.notifyInit(this.tagName)
  }

}
