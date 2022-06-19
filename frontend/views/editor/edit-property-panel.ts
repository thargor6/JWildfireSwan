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
import {TemplateResult} from "lit-html";
import {editorStore} from "Frontend/stores/editor-store";

export interface ComoboBoxItem {
  key: number
  caption: string
}

export interface CheckboxDescriptor {
  key: string
  label: string
  onChange(value: number): void
  value(): boolean
}

export interface ComboBoxDescriptor {
  key: string
  label: string
  items?:Array<ComoboBoxItem>
}

export interface NumberFieldDescriptor {
  key: string
  label: string
  min: number
  max: number
  step: number
  onChange(value: number): void
  value(): number
}

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

  getFlameValue(key: string): number {
    // @ts-ignore
    const val: any = this.getProperty(editorStore.currFlame, key)
    if(val && val.type) {
      return val.value
    }
    return 0
  }

  getFlameBooleanValue(key: string): boolean {
    // @ts-ignore
    const val: any = this.getProperty(editorStore.currFlame, key)
    if(val && val.type && val.value) {
      return true
    }
    return false
  }

  flamePropertyChange = (key: string, value: number) => {
    // @ts-ignore
    const oldVal: any = this.getProperty(editorStore.currFlame, key)
    if(oldVal && oldVal.type) {
      if(oldVal.value !== value) {
        oldVal.value = value
        this.afterPropertyChange()
        // console.log('CHANGED', key, value, oldVal)
      }
    }
  }

  abstract renderControls(): TemplateResult

  renderNumberField(desc: NumberFieldDescriptor): TemplateResult {
    return html `
      <swan-number-slider min="${desc.min}" max="${desc.max}" step="${desc.step}" 
        label="${desc.label}" value="${desc.value()}"
        .onValueChange="${desc.onChange}">
      </swan-number-slider>
    `
  }

  renderCheckbox(desc: CheckboxDescriptor): TemplateResult {
    return html `
        <vaadin-checkbox ?checked=${desc.value} label="${desc.label}"
          @change=${(e: Event)=>desc.onChange((e.target as any).checked ? 1: 0)}>
        </vaadin-checkbox>
    `
  }

  refreshForm() {
   // this.render()
    // TODO
  }

}

