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
import { until } from 'lit/directives/until.js';
import {customElement} from 'lit/decorators.js';
import { View } from '../../views/view';

import '@polymer/paper-slider/paper-slider'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-text-field'
import '@vaadin/dialog';
import '@vaadin/horizontal-layout';
import '@vaadin/text-area';
import '@vaadin/text-field';
import '@vaadin/vertical-layout';
import '@vaadin/vaadin-details'

import {AppInfoEndpoint} from "Frontend/generated/endpoints";
import '@vaadin/vaadin-combo-box';
import {appStore} from "Frontend/stores/app-store";

@customElement('about-view')
export class AboutView extends View {

  render() {
    return html`
      
      <vaadin-details opened="${true}">
        <h2 slot="summary">${appStore.applicationName}</h2>
        <p><b>Version</b>: ${until(AppInfoEndpoint.getAppVersion().then((data) =>  html`<span>${data}</span>`), html`<span>${appStore.loadingText}</span>`)}</p>
        <p><b>Build date</b>: ${until(AppInfoEndpoint.getAppBuildDate().then((data) =>  html`<span>${data}</span>`), html`<span>${appStore.loadingText}</span>`)}</p>
      </vaadin-details>

      <vaadin-details opened="${true}">
        <h2 slot="summary">Current TODO's</h2>
        <p>fix basic camera stuff</p>
        <p>user settings</p>
        <p>display shader code in browser</p>
        <p>line codes for shader display</p>
        <p>dynamic param evaluation stuff</p>
        <p>basic editor</p>
        <p>more variations</p>
      </vaadin-details>
      
`;
  }

}
