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

import '@vaadin/number-field'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '../../../components/swan-number-slider'
import {editorStore} from "Frontend/stores/editor-store";
import { Binder, field } from '@hilla/form';
import FlameCameraBinderModel from "Frontend/views/editor/flame-camera/FlameCameraBinderModel";
import {FlameCameraModel} from "Frontend/views/editor/flame-camera/FlameCameraModel";
import {FlameCameraMapper} from "Frontend/views/editor/flame-camera/FlameCameraMapper";
import {localized, msg} from "@lit/localize";
import {EditPropertyPanel} from "Frontend/views/editor/flame-camera/edit-property-panel";

@localized()
@customElement('editor-edit-camera-panel')
export class EditorEditCameraPanel extends EditPropertyPanel<FlameCameraModel, FlameCameraBinderModel> {
  private _value = new FlameCameraModel()
  private _binder = new Binder(this, FlameCameraBinderModel)

  renderControls() {
    return html`
          <swan-number-slider .onValueChange="${this.flamePropertyChange.bind(this,'camRoll')}" min="${-360}" max="${360}" label="${msg('Roll')}" ${field(this.binder.model.camRoll)}></swan-number-slider>

    `;
  }

  // credit: Typescript documentation, src
// https://www.typescriptlang.org/docs/handbook/advanced-types.html#index-types
  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName]; // o[propertyName] is of type T[K]
  }

  flamePropertyChange = (key: string, value: number) => {
    // @ts-ignore
    const oldVal: any = this.getProperty(editorStore.currFlame,key)
    if(oldVal && oldVal.type) {
      oldVal.value = value
      this.afterPropertyChange()
    }
    console.log('CHANGED', key, value, oldVal)
  }

  get binder(): Binder<FlameCameraModel, FlameCameraBinderModel> {
    return this._binder
  }

  get value(): FlameCameraModel {
    return this._value
  }

  mapValueToFlame(newValue: FlameCameraModel): void {
    FlameCameraMapper.mapToFlame(newValue, editorStore.currFlame)
  }

  mapValueFromFlame(newValue: FlameCameraModel): void {
    FlameCameraMapper.mapFromFlame(editorStore.currFlame, this.value)
  }

}

