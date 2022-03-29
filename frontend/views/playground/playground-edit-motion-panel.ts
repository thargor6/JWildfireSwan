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

@customElement('playground-edit-motion-panel')
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
      controlType: 'slider',
      propName: 'frame',
      label: 'Frame',
      minValue: 0,
      maxValue: 100,
    },
    {
      controlType: 'slider',
      propName: 'frameCount',
      label: 'Frame count',
      minValue: 3,
      maxValue: 100,
    },
    {
      controlType: 'slider',
      propName: 'fps',
      label: 'FPS',
      minValue: 1,
      maxValue: 120.0,
    },
    {
      controlType: 'slider',
      propName: 'motionBlurLength',
      label: 'Motion-blur length',
      minValue: 0.0,
      maxValue: 100.0,
    },
    {
      controlType: 'slider',
      propName: 'motionBlurTimeStep',
      label: 'Motion-blur time-step',
      minValue: 0.0,
      maxValue: 1.0,
    },
    {
      controlType: 'slider',
      propName: 'motionBlurDecay',
      label: 'Motion-blur decay',
      minValue: 0.0,
      maxValue: 0.5,
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

