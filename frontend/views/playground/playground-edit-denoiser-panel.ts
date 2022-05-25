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
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-combo-box';
import {MobxLitElement} from "@adobe/lit-mobx";
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '@vaadin/vaadin-checkbox'
import '../../components/swan-slider'
import '@vaadin/tabs';
import {OnPropertyChange, PropertyDescriptor, renderControl} from "Frontend/components/property-edit";
import {DenoiserType} from "Frontend/flames/model/flame";

@customElement('playground-edit-denoiser-panel')
export class PlaygroundEditMotionPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property( {
    attribute: false
  })
  onPropertyChange: OnPropertyChange = (property: string, changing: boolean, value: number) => void {}

  @state()
  cameraControls: PropertyDescriptor[] = [
    {
      controlType: 'listbox',
      propName: 'dnType',
      label: 'Type',
      items: [
        {key: DenoiserType.OFF.valueOf(), caption: "OFF"},
        {key: DenoiserType.SMART_DENOISE.valueOf(), caption: "SMART_DN"},
        {key: DenoiserType.SMART_DENOISE_LUM.valueOf(), caption: "SMART_DN_LUM"},
        {key: DenoiserType.SMART_DENOISE_LUM_LINEAR.valueOf(), caption: "SMART_DN_LUM_LINEAR"},
        {key: DenoiserType.SMART_DENOISE_HSL.valueOf(), caption: "SMART_DN_HSL"},
        {key: DenoiserType.SMART_DENOISE_SRGB.valueOf(), caption: "SMART_DN_RGB"},
      ]
    },
    {
      controlType: 'slider',
      propName: 'dnSplitter',
      label: 'Splitter',
      minValue: -1.0,
      maxValue: 1.0,
      step: 0.1
    },
    {
      controlType: 'slider',
      propName: 'dnSigma',
      label: 'Sigma',
      minValue: 0.5,
      maxValue: 10,
      step: 0.25
    },
    {
      controlType: 'slider',
      propName: 'dnKSigma',
      label: 'KSigma',
      minValue: 0.5,
      maxValue: 10.0,
      step: 0.1
    },
    {
      controlType: 'slider',
      propName: 'dnThreshold',
      label: 'Edge threshold',
      minValue: 0.05,
      maxValue: 1.0,
      step: 0.05
    },
    {
      controlType: 'slider',
      propName: 'dnMix',
      label: 'Mix',
      minValue: 0.0,
      maxValue: 1.0,
      step: 0.05
    },
    {
      controlType: 'slider',
      propName: 'dnGamma',
      label: 'Gamma',
      minValue: 0.25,
      maxValue: 5.0,
      step: 0.1
    }
  ]

  render() {
    return html`
      <vertical-layout theme="spacing" style="${this.visible ? `display:block;`: `display:none;`}">
        ${this.cameraControls.map(ctrl=>renderControl(ctrl, this.onPropertyChange))}
      </vertical-layout>
`;
  }

}

