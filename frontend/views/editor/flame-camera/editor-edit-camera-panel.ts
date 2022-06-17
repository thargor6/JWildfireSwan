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
import {customElement, property} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";

import '@vaadin/number-field'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '../../../components/swan-slider'
import {editorStore} from "Frontend/stores/editor-store";
import { Binder, field } from '@hilla/form';
import FlameCameraBinderModel from "Frontend/views/editor/flame-camera/FlameCameraBinderModel";
import {FlameCameraModel} from "Frontend/views/editor/flame-camera/FlameCameraModel";
import {FlameCameraMapper} from "Frontend/views/editor/flame-camera/FlameCameraMapper";

@customElement('editor-edit-camera-panel')
export class EditorEditCameraPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  flameCamera = new FlameCameraModel()

  private binder = new Binder(this, FlameCameraBinderModel)

  @property()
  afterPropertyChange = ()=>{}

  render() {
    return html`
      <vertical-layout theme="spacing" style="${this.visible ? `display:block;`: `display:none;`}">
        
         <vaadin-number-field @change="${this.saveForm}" label="Roll" ${field(this.binder.model.camRoll)}></vaadin-number-field>
          
      </vertical-layout>
`;
  }

  refreshForm() {
    FlameCameraMapper.mapFromFlame(editorStore.currFlame, this.flameCamera)
    this.binder.read(this.flameCamera)
  }

  saveForm() {
    this.binder.submitTo(this.saveFlameCamera).then(
      f=>{
        this.afterPropertyChange()
      }
    )
  }

  saveFlameCamera(flameCamera: FlameCameraModel): Promise<FlameCameraModel> {
    FlameCameraMapper.mapToFlame(flameCamera, editorStore.currFlame)
    return Promise.resolve(flameCamera)
  }


}

