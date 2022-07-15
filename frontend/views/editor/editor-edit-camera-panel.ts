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
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";

@localized()
@customElement('editor-edit-camera-panel')
export class EditorEditCameraPanel extends EditPropertyPanel {

  private camRoll: NumberFieldDescriptor = {
    key: 'camRoll', label: msg('Roll'), min: -360, max: 360, step: 3,
    onChange: this.flamePropertyChange.bind(this,'camRoll'),
    value: this.getFlameValue.bind(this,'camRoll')
  }

  private camPitch: NumberFieldDescriptor = {
    key: 'camPitch', label: msg('Pitch'), min: -360, max: 360, step: 3,
    onChange: this.flamePropertyChange.bind(this,'camPitch'),
    value: this.getFlameValue.bind(this,'camPitch')
  }

  private camYaw: NumberFieldDescriptor = {
    key: 'camYaw', label: msg('Yaw'), min: -360, max: 360, step: 3,
    onChange: this.flamePropertyChange.bind(this,'camYaw'),
    value: this.getFlameValue.bind(this,'camYaw')
  }

  private camBank: NumberFieldDescriptor = {
    key: 'camBank', label: msg('Bank'), min: -360, max: 360, step: 3,
    onChange: this.flamePropertyChange.bind(this,'camBank'),
    value: this.getFlameValue.bind(this,'camBank')
  }

  private camPerspective: NumberFieldDescriptor = {
    key: 'camPerspective', label: msg('Perspective'), min: -1, max: 1, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'camPerspective'),
    value: this.getFlameValue.bind(this,'camPerspective')
  }

  private centreX: NumberFieldDescriptor = {
    key: 'centreX', label: msg('CentreX'), min: -3, max: 3, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'centreX'),
    value: this.getFlameValue.bind(this,'centreX')
  }

  private centreY: NumberFieldDescriptor = {
    key: 'centreY', label: msg('CentreY'), min: -3, max: 3, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'centreY'),
    value: this.getFlameValue.bind(this,'centreY')
  }

  private camZoom: NumberFieldDescriptor = {
    key: 'camZoom', label: msg('Zoom'), min: 0.1, max: 3, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'camZoom'),
    value: this.getFlameValue.bind(this,'camZoom')
  }

  renderControls() {
    return html`
          ${this.renderNumberField(this.camRoll)}
          ${this.renderNumberField(this.camPitch)}
          ${this.renderNumberField(this.camYaw)}
          ${this.renderNumberField(this.camBank)}
          ${this.renderNumberField(this.camPerspective)}
          ${this.renderNumberField(this.centreX)}
          ${this.renderNumberField(this.centreY)}
          ${this.renderNumberField(this.camZoom)}
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.registerControl(this.camRoll)
    this.registerControl(this.camPitch)
    this.registerControl(this.camYaw)
    this.registerControl(this.camBank)
    this.registerControl(this.camPerspective)
    this.registerControl(this.centreX)
    this.registerControl(this.centreY)
    this.registerControl(this.camZoom)
    this.updateControlReferences(true)
  }


}

