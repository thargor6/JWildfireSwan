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
import {MobxLitElement} from "@adobe/lit-mobx";
import {AppInfoEndpoint} from "Frontend/generated/endpoints";
import '@vaadin/vaadin-button'

@customElement('about-session-info-panel')
export class AboutSessionInfoPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @state()
  instanceRunningInMinutes = 0

  @state()
  randomFlamesCreated = 0

  @state()
  randomGradientsCreated = 0

  @state()
  flamesParsed = 0

  @state()
  exampleFlamesProvided = 0

  @state()
  flamesRendered = 0

  render() {
    return html`
      <div style="${this.visible ? `display:block;`: `display:none;`}">
        <p><b>Instance running</b>: ${Math.round(this.instanceRunningInMinutes * 10)/10} minutes</p>
        <p><b>Random flames generated</b>: ${this.randomFlamesCreated}</p>
        <p><b>Random gradiens generated</b>: ${this.randomGradientsCreated}</p>
        <p><b>Flames parsed</b>: ${this.flamesParsed}</p>
        <p><b>Example flames provided</b>: ${this.exampleFlamesProvided}</p>
        <p><b>Flames rendered</b>: ${this.flamesRendered}</p>
        <vaadin-button theme="secondary" @click="${async ()=>{await this.refreshSessionInfo();}}">Refresh</vaadin-button>
      </div>
`;
  }

  refreshSessionInfo = async ()=> {
    this.instanceRunningInMinutes = await AppInfoEndpoint.getUpTimeInMs() / 1000 / 60
    this.randomFlamesCreated = await AppInfoEndpoint.getRandomFlamesCreated()
    this.randomGradientsCreated = await AppInfoEndpoint.getRandomGradientsCreated()
    this.flamesParsed = await AppInfoEndpoint.getFlamesParsed()
    this.exampleFlamesProvided = await AppInfoEndpoint.getExampleFlamesProvided()
    this.flamesRendered = await AppInfoEndpoint.getFlamesRendered()
  }

  async connectedCallback() {
    super.connectedCallback();
    this.refreshSessionInfo()
  }

}
