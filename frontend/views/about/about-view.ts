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
import {customElement, state} from 'lit/decorators.js';
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

import {AppInfoEndpoint, GalleryEndpoint} from "Frontend/generated/endpoints";
import '@vaadin/vaadin-combo-box';
import {appStore} from "Frontend/stores/app-store";

@customElement('about-view')
export class AboutView extends View {

  @state()
  example_1 = "example003"

  @state()
  example_2 = "example029"

  @state()
  example_3 = "example025"

  render() {
    return html`

      <div
          class="bg-contrast flex items-center justify-center mb-m overflow-hidden rounded-m w-full"
          style="min-height: 160px;">
        <img alt=${this.example_1} class="w-full" loading="lazy" src="./images/${this.example_1}.jpg" />
      </div>
      <h1>Welcome to JWildfire Swan: awesome fractal flames, GPU accelerated!</h1>
      The basic idea is to use standard Web-technologies to create an application which 
      allows playful access to the fascinating world of fractal flames, without barriers. 
      So it shall be simple to use and require no certain hardware or operating system.

      It is a clear side-project (rather than a replacement) to JWildfire and will never 
      have such a lot of features (by design). So it is more a game than a professional 
      application, even you will be able to create real art with it.

      There shall be no special GPU mode, so GPU (when available) is used per default.

      <div
          class="bg-contrast flex items-center justify-center mb-m overflow-hidden rounded-m w-full"
          style="min-height: 160px;">
        <img alt=${this.example_2} class="w-full" loading="lazy" src="./images/${this.example_2}.jpg" />
      </div>
      <h2>Getting started</h2>
      <h3>Gallery live examples</h3>
   
      There is no editor yet, but you can experiment with the examples from the gallery.
      By clicking at an image you can load the fractal in the playground, which then starts
      to render it.

      <h3>Basic editing</h3>
      
      You can modify a fractal flame by editing the xml-description of the parameters directly in
      the browser. 
      Many parameters should be self-explanatory and are the same you know from JWildfire. 
      
      You can also use JWildfire to edit the parameters. But please note, that JWildfire Swan 
      only supports a small fearure set of JWildfire, so many changes you do in JWildfire
      will have no effect
      
      <h3>Create random gradients</h3>
      You can modify the colors of the fractal by generating random gradients in the playground.
      The xml-representation is updated accordingly, so you can also export these flames, 
      e. g. into JWildfire.

      <h3>Create random flames</h3>
      You can also create random flames using the same random-flame-generators known from JWildfire.
      The xml-representation is updated accordingly, so you can also export these flames,
      e. g. into JWildfire.
      But, most generators work not very well yet, because of limited features and variations.
      This behaviour will improve over time.

      <div
          class="bg-contrast flex items-center justify-center mb-m overflow-hidden rounded-m w-full"
          style="min-height: 160px;">
        <img alt=${this.example_3} class="w-full" loading="lazy" src="./images/${this.example_3}.jpg" />
      </div>
      <h2>Program information</h2>
      <p><b>Version</b>: ${until(AppInfoEndpoint.getAppVersion().then((data) =>  html`<span>${data}</span>`), html`<span>${appStore.loadingText}</span>`)}</p>
      <p><b>Build date</b>: ${until(AppInfoEndpoint.getAppBuildDate().then((data) =>  html`<span>${data}</span>`), html`<span>${appStore.loadingText}</span>`)}</p>

      <h2>Known Limitations/Bugs</h2>
      The options at the Render-tab are currently not working as expected. 
      It is recommended to leave them alone.
      
      Camera for 3D-flames ist wierd, while camera for 2D-flames should work well.
      
`;
  }

}
