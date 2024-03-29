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
import {EditPropertyPanel, NumberFieldDescriptor} from "./edit-property-panel";

@localized()
@customElement('editor-edit-motion-panel')
export class EditorEditMotionPanel extends EditPropertyPanel {

  private fps: NumberFieldDescriptor = {
    key: 'fps', label: msg('FPS'), min: 1, max: 120, step: 1,
    onChange: this.flamePropertyChange.bind(this,'fps'),
    value: this.getFlameValue.bind(this,'fps')
  }

  private motionBlurLength: NumberFieldDescriptor = {
    key: 'motionBlurLength', label: msg('Motion-blur length'), min: 0, max: 120, step: 1,
    onChange: this.flamePropertyChange.bind(this,'motionBlurLength'),
    value: this.getFlameValue.bind(this,'motionBlurLength')
  }

  private motionBlurTimeStep: NumberFieldDescriptor = {
    key: 'motionBlurTimeStep', label: msg('Mblur time-step'), min: 0, max: 1, step: 0.05,
    onChange: this.flamePropertyChange.bind(this,'motionBlurTimeStep'),
    value: this.getFlameValue.bind(this,'motionBlurTimeStep')
  }

  private motionBlurDecay: NumberFieldDescriptor = {
    key: 'motionBlurDecay', label: msg('Motion-blur decay'), min: 0, max: 0.5, step: 0.01,
    onChange: this.flamePropertyChange.bind(this,'motionBlurDecay'),
    value: this.getFlameValue.bind(this,'motionBlurDecay')
  }

  renderControls() {
    return html`
          ${this.renderNumberField(this.fps)}
          ${this.renderNumberField(this.motionBlurLength)}
          ${this.renderNumberField(this.motionBlurTimeStep)}
          ${this.renderNumberField(this.motionBlurDecay)}
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties)
    this.registerControl(this.fps)
    this.registerControl(this.motionBlurLength)
    this.registerControl(this.motionBlurTimeStep)
    this.registerControl(this.motionBlurDecay)
    this.updateControlReferences(true)
  }

}

