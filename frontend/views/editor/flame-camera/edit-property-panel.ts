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
import {property} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";

import '@vaadin/number-field'
import '@vaadin/vaadin-ordered-layout/vaadin-vertical-layout'
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout'
import '../../../components/swan-slider'
import { Binder } from '@hilla/form';
import {TemplateResult} from "lit-html";
import {AbstractModel} from "@hilla/form/Models";

export abstract class EditPropertyPanel<ValueType, BinderModelType extends AbstractModel<ValueType>> extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property()
  afterPropertyChange = ()=>{}

  render() {
    return html`
      <vertical-layout theme="spacing" style="${this.visible ? `display:block;`: `display:none;`}">
       ${this.renderControls()}
      </vertical-layout>
`;
  }

  refreshForm = () => {
    this.mapValueFromFlame(this.value)
    this.binder.read(this.value)
  }

  saveValue = (newValue: ValueType): Promise<ValueType> => {
    this.mapValueToFlame(newValue)
    return Promise.resolve(newValue)
  }

  saveForm = () => {
    this.binder.submitTo(this.saveValue).then(
      value=>{
        this.afterPropertyChange()
      }
    )
  }

  abstract mapValueToFlame(newValue: ValueType): void
  abstract mapValueFromFlame(newValue: ValueType): void

  abstract get binder(): Binder<ValueType, BinderModelType>

  abstract get value(): ValueType

  abstract renderControls(): TemplateResult

}

