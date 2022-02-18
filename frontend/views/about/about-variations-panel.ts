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
import '@vaadin/vaadin-text-field'
import '@vaadin/text-area'
import {playgroundStore} from "Frontend/stores/playground-store";

import {MobxLitElement} from "@adobe/lit-mobx";
import {HasValue} from "@vaadin/form";

@customElement('about-variations-panel')
export class AboutVariationsPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  render() {
    return html`
      <div style="${this.visible ? `display:block;`: `display:none;`}">
        <div style="display: flex; flex-direction: column;">
        <vaadin-text-field readonly label="Supported variations" value="${playgroundStore.variations.length}"></vaadin-text-field>
        <vaadin-text-area style="max-height: 24em;" readonly value="${playgroundStore.variations.join('\n')}"></vaadin-text-area>
        </div>          
      </div>
`;
  }


}
