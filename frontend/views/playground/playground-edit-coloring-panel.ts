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
import {playgroundStore} from "Frontend/stores/playground-store";

import {MobxLitElement} from "@adobe/lit-mobx";

import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '../../components/swan-slider'
import '@vaadin/tabs';
import {OnPropertyChange, PropertyDescriptor, renderControl} from "Frontend/components/property-edit";

@customElement('playground-edit-coloring-panel')
export class PlaygroundEditColoringPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property( {
    attribute: false
  })
  onPropertyChange: OnPropertyChange = (property: string, changing: boolean, value: number) => void {}

  @state()
  cameraControls: PropertyDescriptor[] = [
    {
      propName: 'brightness',
      label: 'Brightness',
      minValue: 0.0,
      maxValue: 25.0,
    },
    {
      propName: 'whiteLevel',
      label: 'Fade to white',
      minValue: 20.0,
      maxValue: 500.0,
    },
    {
      propName: 'contrast',
      label: 'Contrast',
      minValue: 0.0,
      maxValue: 1.0,
    },
    {
      propName: 'lowDensityBrightness',
      label: 'Low density brightness',
      minValue: -10.0,
      maxValue: 10.0,
    },
    {
      propName: 'balanceRed',
      label: 'Red balance',
      minValue: 0.0,
      maxValue: 3.0,
    },
    {
      propName: 'balanceGreen',
      label: 'Green balance',
      minValue: 0.0,
      maxValue: 3.0,
    },
    {
      propName: 'balanceBlue',
      label: 'Blue balance',
      minValue: 0.0,
      maxValue: 3.0,
    },
    {
      propName: 'gamma',
      label: 'Gamma',
      minValue: 0.0,
      maxValue: 10.0,
    },
    {
      propName: 'gammaThreshold',
      label: 'Gamma threshold',
      minValue: 0.0002,
      maxValue: 0.2,
    },
    {
      propName: 'vibrancy',
      label: 'Vibrancy',
      minValue: 0.0,
      maxValue: 1.0,
    }

  ]

//  public sampleDensity = Parameters.dNumber(100.0)
 // public foregroundOpacity = Parameters.dNumber(0.0)
//  public saturation = Parameters.dNumber(1.0)

  render() {
    return html`
      <vertical-layout theme="spacing" style="${this.visible ? `display:block;`: `display:none;`}">
        ${this.cameraControls.map(ctrl=>renderControl(ctrl, this.onPropertyChange))}
      </vertical-layout>
`;
  }

}

