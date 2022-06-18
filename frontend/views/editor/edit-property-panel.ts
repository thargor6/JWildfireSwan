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
import '../../components/swan-slider'
import {TemplateResult} from "lit-html";
import {editorStore} from "Frontend/stores/editor-store";

export abstract class EditPropertyPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property()
  afterPropertyChange = ()=>{}

  render() {
    console.log('RENDER MAIN')
    return html`
      <vertical-layout theme="spacing" style="${this.visible ? `display:block;`: `display:none;`}">
       ${this.renderControls()}
      </vertical-layout>
`;
  }

  // https://www.nadershamma.dev/blog/2019/how-to-access-object-properties-dynamically-using-bracket-notation-in-typescript/
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
    // console.log('CHANGED', key, value, oldVal)
  }

  abstract renderControls(): TemplateResult

}

