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

import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '../../components/swan-slider'
import '@vaadin/tabs';
import {FlameParameter} from "Frontend/flames/model/parameters";
import './playground-edit-camera-panel'
import './playground-edit-coloring-panel'
import './playground-edit-motion-panel'
import './playground-edit-denoiser-panel'
import {OnPropertyChange} from "Frontend/components/property-edit";
import {EPSILON} from "Frontend/flames/renderer/mathlib";
import {DenoiserType} from "Frontend/flames/model/flame";

@customElement('playground-edit-panel')
export class PlaygroundEditPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @state()
  selectedTab = 0

  @property()
  onRefresh = ()=>{}

  @property()
  onExportParams = ()=>{}

  render() {
    return html`
      <vertical-layout theme="spacing" style="${this.visible ? `display:block; min-width: 32em;`: `display:none;`}">
        <vaadin-tabs @selected-changed="${this.selectedChanged}">
          <vaadin-tab theme="icon-on-top">
            <vaadin-icon icon="vaadin:fire"></vaadin-icon>
            <span>Camera</span>
          </vaadin-tab>
          <vaadin-tab theme="icon-on-top">
            <vaadin-icon icon="vaadin:eye"></vaadin-icon>
            <span>Coloring</span>
          </vaadin-tab>
          <vaadin-tab theme="icon-on-top">
              <vaadin-icon icon="vaadin:eye"></vaadin-icon>
              <span>Motion</span>
          </vaadin-tab>
            <vaadin-tab theme="icon-on-top">
                <vaadin-icon icon="vaadin:eye"></vaadin-icon>
                <span>Denoiser</span>
            </vaadin-tab>
        </vaadin-tabs>
        <playground-edit-camera-panel .visible=${this.selectedTab===0} .onPropertyChange=${this.onPropertyChange} ></playground-edit-camera-panel>
        <playground-edit-coloring-panel .visible=${this.selectedTab===1} .onPropertyChange=${this.onPropertyChange} ></playground-edit-coloring-panel>
        <playground-edit-motion-panel .visible=${this.selectedTab===2} .onPropertyChange=${this.onPropertyChange} ></playground-edit-motion-panel>
        <playground-edit-denoiser-panel .visible=${this.selectedTab===3} .onPropertyChange=${this.onPropertyChange} ></playground-edit-denoiser-panel>

        <vaadin-button theme="primary" @click="${this.onExportParams}">Export flame as xml</vaadin-button>
          
      </vertical-layout>
`;
  }

  onPropertyChange: OnPropertyChange = (propertyPath: string, changing: boolean, value: any) => {
    if(!playgroundStore.refreshing) {
      const param: FlameParameter = (playgroundStore.flame as any)[propertyPath]
      if (param && typeof param.value === 'number' && Math.abs(param.value - value) > EPSILON) {
        param.value = value
        console.log('CHANGE ', propertyPath, changing, value);
        // if(!changing) {
        this.onRefresh()
        //  }
      }
      // enum
      else if (typeof param === 'number') {
        (playgroundStore.flame as any)[propertyPath] = value
        console.log('CHANGE ', propertyPath, changing, value, param);
        // if(!changing) {
        this.onRefresh()
        //  }
      }


    }
  }

  selectedChanged(e: CustomEvent) {
    this.selectedTab = e.detail.value;
  }

}

