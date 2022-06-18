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

import {html, PropertyValues} from 'lit';
import {customElement} from 'lit/decorators.js';

import '@vaadin/number-field'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '../../components/swan-number-slider'
import {editorStore} from "Frontend/stores/editor-store";
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel} from "Frontend/views/editor/edit-property-panel";

@localized()
@customElement('editor-edit-camera-panel')
export class EditorEditCameraPanel extends EditPropertyPanel {

  renderControls() {
    console.log('RENDER SUB', editorStore.currFlame.camRoll)
    return html`
 
          <swan-number-slider min="${-360.0}" max="${360.0}" step="${3.0}" label="${msg('Roll')}" 
            value="${editorStore.currFlame.camRoll.value}"
            .onValueChange="${this.flamePropertyChange.bind(this,'camRoll')}"></swan-number-slider>
          <swan-number-slider min="${-360.0}" max="${360.0}" step="${3.0}" label="${msg('Pitch')}" 
            value="${editorStore.currFlame.camPitch.value}"
            .onValueChange="${this.flamePropertyChange.bind(this,'camPitch')}"></swan-number-slider>
          <swan-number-slider min="${-360.0}" max="${360.0}" step="${3.0}" label="${msg('Yaw')}" 
            value="${editorStore.currFlame.camYaw.value}"
            .onValueChange="${this.flamePropertyChange.bind(this,'camYaw')}"></swan-number-slider>
          <swan-number-slider min="${-360.0}" max="${360.0}" step="${3.0}" label="${msg('Bank')}" 
            value="${editorStore.currFlame.camBank.value}"
            .onValueChange="${this.flamePropertyChange.bind(this,'camBank')}"></swan-number-slider>
          <swan-number-slider min="${-1.0}" max="${1.0}" step="${0.1}"  label="${msg('Perspective')}" 
            value="${editorStore.currFlame.camPerspective.value}"
            .onValueChange="${this.flamePropertyChange.bind(this,'camPerspective')}"></swan-number-slider>
          <swan-number-slider min="${-3.0}" max="${3.0}" step="${0.1}"  label="${msg('CentreX')}" 
            value="${editorStore.currFlame.centreX.value}"
            .onValueChange="${this.flamePropertyChange.bind(this,'centreX')}"></swan-number-slider>
         <swan-number-slider min="${-3.0}" max="${3.0}" step="${0.1}"  label="${msg('CentreY')}" 
            value="${editorStore.currFlame.centreY.value}"
            .onValueChange="${this.flamePropertyChange.bind(this,'centreY')}"></swan-number-slider>
         <swan-number-slider min="${0.1}" max="${3.0}" step="${0.1}"  label="${msg('Zoom')}" 
            value="${editorStore.currFlame.camZoom.value}"
            .onValueChange="${this.flamePropertyChange.bind(this,'camZoom')}"></swan-number-slider>

        
        
        
    `;
  }


  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    console.log('AFTER RENDER')
  }


}

