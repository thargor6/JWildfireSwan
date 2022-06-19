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
import {localized, msg} from "@lit/localize";
import {ComboBoxDescriptor, EditPropertyPanel, NumberFieldDescriptor} from "Frontend/views/editor/edit-property-panel";
import {DenoiserType} from "Frontend/flames/model/flame";

@localized()
@customElement('editor-edit-denoiser-panel')
export class EditorEditDenoiserPanel extends EditPropertyPanel {

  private dnType: ComboBoxDescriptor = {
    key: 'dnType', label: msg('Type'),
     items: [
      {key: DenoiserType.OFF.valueOf(), caption: "OFF"},
      {key: DenoiserType.SMART_DENOISE.valueOf(), caption: "SMART_DN"},
      {key: DenoiserType.SMART_DENOISE_LUM.valueOf(), caption: "SMART_DN_LUM"},
      {key: DenoiserType.SMART_DENOISE_LUM_LINEAR.valueOf(), caption: "SMART_DN_LUM_LINEAR"},
      {key: DenoiserType.SMART_DENOISE_HSL.valueOf(), caption: "SMART_DN_HSL"},
      {key: DenoiserType.SMART_DENOISE_SRGB.valueOf(), caption: "SMART_DN_RGB"},
    ],
    onChange: this.flamePropertyChange.bind(this,'dnType'),
    value: this.getFlameValue.bind(this,'dnType')
  }

  private dnSplitter: NumberFieldDescriptor = {
    key: 'dnSplitter', label: msg('Splitter'), min: -1, max: 1, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'dnSplitter'),
    value: this.getFlameValue.bind(this,'dnSplitter')
  }

  private dnSigma: NumberFieldDescriptor = {
    key: 'dnSigma', label: msg('Sigma'), min: 0.5, max: 10, step: 0.25,
    onChange: this.flamePropertyChange.bind(this,'dnSigma'),
    value: this.getFlameValue.bind(this,'dnSigma')
  }

  private dnKSigma: NumberFieldDescriptor = {
    key: 'dnKSigma', label: msg('KSigma'), min: 0.5, max: 10, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'dnKSigma'),
    value: this.getFlameValue.bind(this,'dnKSigma')
  }

  private dnThreshold: NumberFieldDescriptor = {
    key: 'dnThreshold', label: msg('Edge threshold'), min: 0.05, max: 1, step: 0.05,
    onChange: this.flamePropertyChange.bind(this,'dnThreshold'),
    value: this.getFlameValue.bind(this,'dnThreshold')
  }

  private dnMix: NumberFieldDescriptor = {
    key: 'dnMix', label: msg('Mix'), min: 0, max: 1, step: 0.05,
    onChange: this.flamePropertyChange.bind(this,'dnMix'),
    value: this.getFlameValue.bind(this,'dnMix')
  }

  private dnGamma: NumberFieldDescriptor = {
    key: 'dnGamma', label: msg('Gamma'), min: 0.25, max: 5, step: 0.1,
    onChange: this.flamePropertyChange.bind(this,'dnGamma'),
    value: this.getFlameValue.bind(this,'dnGamma')
  }

  renderControls() {
    return html`
          ${this.renderComboBox(this.dnType)}
          ${this.renderNumberField(this.dnSplitter)}
          ${this.renderNumberField(this.dnSigma)}
          ${this.renderNumberField(this.dnKSigma)}
          ${this.renderNumberField(this.dnThreshold)}
          ${this.renderNumberField(this.dnMix)}
          ${this.renderNumberField(this.dnGamma)}
    `;
  }


}

