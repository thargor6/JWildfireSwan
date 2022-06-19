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
import {customElement} from 'lit/decorators.js';

import {localized} from "@lit/localize";
import {CheckboxDescriptor, EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";

@localized()
@customElement('editor-edit-coloring-panel')
export class EditorEditColoringPanel extends EditPropertyPanel {

  private brightness: NumberFieldDescriptor = {
    key: 'brightness', label: 'Brightness', min: 0, max: 12, step: 0.5,
    onChange: this.flamePropertyChange.bind(this,'brightness'),
    value: this.getFlameValue.bind(this,'brightness')
  }

  private lowDensityBrightness: NumberFieldDescriptor = {
    key: 'lowDensityBrightness', label: 'Low brightness', min: -10, max: 10, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'lowDensityBrightness'),
    value: this.getFlameValue.bind(this,'lowDensityBrightness')
  }

  private gamma: NumberFieldDescriptor = {
    key: 'gamma', label: 'Gamma', min: 1, max: 10, step: 0.2,
    onChange: this.flamePropertyChange.bind(this,'gamma'),
    value: this.getFlameValue.bind(this,'gamma')
  }

  private gammaThreshold: NumberFieldDescriptor = {
    key: 'gammaThreshold', label: 'Gamma threshold', min: 0.0002, max: 0.2, step: 0.05,
    onChange: this.flamePropertyChange.bind(this,'gammaThreshold'),
    value: this.getFlameValue.bind(this,'gammaThreshold')
  }

  private contrast: NumberFieldDescriptor = {
    key: 'contrast', label: 'Contrast', min: 0, max: 1, step: 0.05,
    onChange: this.flamePropertyChange.bind(this,'contrast'),
    value: this.getFlameValue.bind(this,'contrast')
  }

  private balanceRed: NumberFieldDescriptor = {
    key: 'balanceRed', label: 'Red balance', min: 0, max: 3, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'balanceRed'),
    value: this.getFlameValue.bind(this,'balanceRed')
  }

  private balanceGreen: NumberFieldDescriptor = {
    key: 'balanceGreen', label: 'Green balance', min: 0, max: 3, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'balanceGreen'),
    value: this.getFlameValue.bind(this,'balanceGreen')
  }

  private balanceBlue: NumberFieldDescriptor = {
    key: 'balanceBlue', label: 'Blue balance', min: 0, max: 3, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'balanceBlue'),
    value: this.getFlameValue.bind(this,'balanceBlue')
  }

  private whiteLevel: NumberFieldDescriptor = {
    key: 'whiteLevel', label: 'Fade to white', min: 20, max: 500, step: 2,
    onChange: this.flamePropertyChange.bind(this,'whiteLevel'),
    value: this.getFlameValue.bind(this,'whiteLevel')
  }

  private vibrancy: NumberFieldDescriptor = {
    key: 'vibrancy', label: 'Vibrancy', min: 0, max: 1, step: 0.05,
    onChange: this.flamePropertyChange.bind(this,'vibrancy'),
    value: this.getFlameValue.bind(this,'vibrancy')
  }

  private foregroundOpacity: NumberFieldDescriptor = {
    key: 'foregroundOpacity', label: 'Fg opacity', min: 0, max: 2, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'foregroundOpacity'),
    value: this.getFlameValue.bind(this,'foregroundOpacity')
  }

  // TODO refresh does not work
  private bgTransparency: CheckboxDescriptor = {
    key: 'bgTransparency', label: 'Backend transparency',
    onChange: this.flamePropertyChange.bind(this,'bgTransparency'),
    value: this.getFlameBooleanValue.bind(this,'bgTransparency')
  }

  renderControls() {
    return html`
          ${this.renderNumberField(this.brightness)}
          ${this.renderNumberField(this.lowDensityBrightness)}
          ${this.renderNumberField(this.gamma)}
          ${this.renderNumberField(this.gammaThreshold)}
          ${this.renderNumberField(this.contrast)}
          ${this.renderNumberField(this.balanceRed)}
          ${this.renderNumberField(this.balanceGreen)}
          ${this.renderNumberField(this.balanceBlue)}
          ${this.renderNumberField(this.whiteLevel)}
          ${this.renderNumberField(this.vibrancy)}
          ${this.renderNumberField(this.foregroundOpacity)}
          ${this.renderCheckbox(this.bgTransparency)}
    `;
  }


}

