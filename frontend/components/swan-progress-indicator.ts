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

import '@vaadin/vaadin-progress-bar'
import {MobxLitElement} from "@adobe/lit-mobx";

@customElement('swan-progress-indicator')
export class SwanProgressIndicator extends MobxLitElement {
  @property()
  renderInfo = ''

  @property()
  renderProgress = 0.0

  @property()
  displayWidth = '24em'

  render() {
    return html `
      <div style="display: flex; flex-direction: column; min-width: ${this.displayWidth};">
          <div style="font-size: smaller;">${this.renderInfo}</div>
          <vaadin-progress-bar .value=${this.renderProgress} theme="contrast"></vaadin-progress-bar>
      </div>
    `
  }

}
