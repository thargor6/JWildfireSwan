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

import {html, PropertyValues, render} from 'lit';
import { guard } from 'lit/directives/guard.js';
import { until } from 'lit/directives/until.js';
import {customElement, property, query, state} from 'lit/decorators.js';
import { View } from '../../views/view';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-text-field'
import '@vaadin/dialog';
import '@vaadin/horizontal-layout';
import '@vaadin/text-area';
import '@vaadin/text-field';
import '@vaadin/vertical-layout';

import {FlameRenderer} from '../../flames/renderer/flame-renderer'
import {AppInfoEndpoint, FlamesEndpoint} from "Frontend/generated/endpoints";
import {FlameMapper} from '../../flames/model/mapper/flame-mapper'
import {HasValue} from "@vaadin/form";
import '@vaadin/vaadin-combo-box';

@customElement('example-view')
export class ExampleView extends View {
  @query("#canvas-container")
  canvasContainer!: HTMLDivElement;

  @state()
  flameName = 'example08'

  flameNames = ['example01', 'example02', 'example03', 'example04', 'example05', 'example06', 'example07', 'example08', 'example10', 'example11', 'example12', 'example14', 'example16', 'example17', 'example20']

  @state()
  imageSize = 512

  imageSizes = [256, 512, 1024, 2048]

  @state()
  pointsSize = 512

  pointsSizes = [64, 128, 256, 512 ]


  render() {
    return html`
      ${this.renderFlameImportDialog()}
        
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="display: flex; flex-direction: row; align-items: flex-end; margin-right: 1em;">
            <vaadin-button ?disabled="{false}" @click="${() => (this.dialogOpened = true)}">Import flame...</vaadin-button>
            <vaadin-combo-box label="Image size" .items="${this.imageSizes}" value="${this.imageSize}" @change="${(event: Event)=>this.imageSizeChanged(event)}"></vaadin-combo-box>
            <vaadin-combo-box label="Flame" .items="${this.flameNames}" value="${this.flameName}" @change="${(event: Event)=>this.flameNameChanged(event)}"></vaadin-combo-box>
            <vaadin-button @click="${this.onClick}">Refresh</vaadin-button>
         </div>
  
        
        <div id="canvas-container">
          <canvasx id="screen1" width="512" height="512"></canvasx>
        </div>
  
      

      <div style="display: none;">
        <paper-slider id="brightness" step="0.0001" value="1.6" min="0" max="4"></paper-slider>
        <paper-slider  id="param1" step="0.1" value="2.5" min="0" max="10.0"></paper-slider>
        <label><input type="radio" name="displayMode" value="flame" checked="checked">Flame</label>
        <label><input type="radio" name="displayMode" value="position">Position Iteration</label>
        <label><input type="radio" name="displayMode" value="colour">Color Iteration</label>
      </div>    
        
      </div>
`;
  }

  initFlag = false;

  renderFlame() {
    this.canvasContainer.innerHTML = '';

    var brightnessElement = document.querySelector("#brightness") as HTMLElement;
    var param1Element = document.querySelector("#param1") as HTMLElement;
    var radioButtonElements = document.getElementsByName('displayMode') ;
    var canvas = document.createElement('canvas');

    canvas.id = "screen1";
    canvas.width = 512;
    canvas.height = 512;
    this.canvasContainer.appendChild(canvas);

    FlamesEndpoint.getExampleFlame(this.flameName).then( flame=> {
      console.log("FLAME", flame)
      const renderer = new FlameRenderer(this.imageSize, this.pointsSize, canvas, FlameMapper.mapFromBackend(flame), brightnessElement, radioButtonElements, param1Element);
      renderer.drawScene()
    })
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    if(!this.initFlag && this.canvasContainer) {
      this.initFlag = true;
      this.renderFlame()
    }

  }

  onClick = ()=> {
    this.renderFlame()
    //FlamesEndpoint.getExampleFlame("example04").then( f=> console.log("FLAME:",  FlameMapper.mapFromBackend(f)))
  }

  private flameNameChanged(event: Event) {
    if((event.target as HasValue<string>).value) {
      this.flameName = (event.target as HasValue<string>).value!
      this.renderFlame()
    }
  }

  private imageSizeChanged(event: Event) {
    if((event.target as HasValue<string>).value) {
      this.imageSize = parseInt( (event.target as HasValue<string>).value!)
      this.renderFlame()
    }
  }

  @state()
  private dialogOpened = false

  @state()
  private flameXml = ''

  private renderFlameImportDialog() {
    return html`
      <vaadin-dialog
          aria-label="Import flame"
          draggable
          modeless
          .opened="${this.dialogOpened}"
          @opened-changed="${(e: CustomEvent) => (this.dialogOpened = e.detail.value)}"
          .renderer="${guard([], () => (root: HTMLElement) => {
            render(
                html`
              <vaadin-vertical-layout
                theme="spacing"
                style="width: 300px; max-width: 100%; align-items: stretch;"
              >
                <vaadin-horizontal-layout
                  class="draggable"
                  style="border-bottom: 1px solid var(--lumo-contrast-20pct); cursor: move; padding: var(--lumo-space-m) var(--lumo-space-l); margin: calc(var(--lumo-space-s) * -1) calc(var(--lumo-space-l) * -1) 0"
                >
                  <h2 style="margin: 0; font-size: 1.5em; font-weight: bold;">Add note</h2>
                </vaadin-horizontal-layout>
                <vaadin-vertical-layout style="align-items: stretch;">
                  <vaadin-text-area label="Flame" value="${this.flameXml}" @change="${(event: Event)=>this.flameXmlChanged(event)}"></vaadin-text-area>
                </vaadin-vertical-layout>
                <vaadin-horizontal-layout theme="spacing" style="justify-content: flex-end">
                  <vaadin-button @click="${() => (this.dialogOpened = false)}">
                    Cancel
                  </vaadin-button>
                  <vaadin-button theme="primary" @click="${() => {
                    console.log("Importing...", this.flameXml);

                    this.canvasContainer.innerHTML = '';

                    var brightnessElement = document.querySelector("#brightness") as HTMLElement;
                    var param1Element = document.querySelector("#param1") as HTMLElement;
                    var radioButtonElements = document.getElementsByName('displayMode') ;
                    var canvas = document.createElement('canvas');

                    canvas.id = "screen1";
                    canvas.width = 512;
                    canvas.height = 512;
                    this.canvasContainer.appendChild(canvas);
          
                    FlamesEndpoint.parseFlame(this.flameXml).then( flame=> {
                      console.log("FLAME", flame)
                      const renderer = new FlameRenderer(this.imageSize, this.pointsSize, canvas, FlameMapper.mapFromBackend(flame), brightnessElement, radioButtonElements, param1Element);
                      renderer.drawScene()
                    })
                    
                    this.dialogOpened = false
                  }}">
                    Import flame
                  </vaadin-button>
                </vaadin-horizontal-layout>
              </vaadin-vertical-layout>
            `,
                root
            );
          })}"
      ></vaadin-dialog>
    `
  }

  private flameXmlChanged(event: Event) {
    if((event.target as HasValue<string>).value) {
      this.flameXml = (event.target as HasValue<string>).value!
    }
  }
}
