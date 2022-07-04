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
import {HasValue} from "@hilla/form";
import {Variation} from "Frontend/flames/model/flame";

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
  onChange(value: number): void
  value(): number | undefined
}

export interface NumberFieldDescriptor {
  key: string
  label: string
  min: number
  max: number
  step: number
  labelWidth?: string
  onChange(value: number): void
  value(): number | undefined
}

export abstract class EditPropertyPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property()
  afterPropertyChange = ()=>{}

  @property()
  onPropertyChange = (paramId: number, oldValue: number, newValue: number)=>{}

  render() {
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

  getFlameValue(key: string): number | undefined {
    if(editorStore.currFlame) {
      // @ts-ignore
      const val: any = this.getProperty(editorStore.currFlame, key)
      if (val) {
        if (val.type) {
          return val.value
        } else {
          return 0
        }
      }
    }
    return undefined
  }

  getLayerValue(key: string): number | undefined {
    if(editorStore.currLayer) {
      // @ts-ignore
      const val: any = this.getProperty(editorStore.currLayer, key)
      if(val) {
        if(val.type) {
          return val.value
        }
        else {
          return 0
        }
      }
    }
    return undefined
  }

  getXformValue(key: string): number | undefined {
    if(editorStore.currXform) {
      // @ts-ignore
      const val: any = this.getProperty(editorStore.currXform, key)
      if(val) {
        if(val.type) {
          return val.value
        }
        else {
          return 0
        }
      }
    }
    return undefined
  }

  getVariationValue(src: Variation | undefined, key: string): number | undefined {
    if(src) {
      // @ts-ignore
      const val: any = this.getProperty(src, key)
      if(val) {
        if(val.type) {
          return val.value
        }
        else {
          return 0
        }
      }
    }
    return undefined
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
    if(editorStore.currFlame) {
      // @ts-ignore
      const oldVal: any = this.getProperty(editorStore.currFlame, key)
      if (oldVal && oldVal.type) {
        if (oldVal.value !== value) {
          oldVal.value = value
          this.afterPropertyChange()
          // console.log('FLAME ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  layerPropertyChange = (key: string, value: number) => {
    if(editorStore.currLayer) {
      // @ts-ignore
      const oldVal: any = this.getProperty(editorStore.currLayer, key)
      if (oldVal && oldVal.type) {
        if (oldVal.value !== value) {
          oldVal.value = value
          this.afterPropertyChange()
          // console.log('LAYER ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  xformPropertyChange = (key: string, value: number) => {
    if(editorStore.currXform) {
      // @ts-ignore
      const oldVal: any = this.getProperty(editorStore.currXform, key)
      if(oldVal && oldVal.type) {
        if(oldVal.value !== value) {
          const oldValueNumber = oldVal.value
          oldVal.value = value
          // !!!just for testing now, do not use in production!!!
          if(key==='_xyC21_') {
            this.onPropertyChange(0, oldValueNumber, value)
          }
          else {
            this.afterPropertyChange()
          }
          // console.log('XFORM ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  variationPropertyChange = (src: Variation | undefined, key: string, value: number) => {
    if(src) {
      // @ts-ignore
      const oldVal: any = this.getProperty(src, key)
      if(oldVal && oldVal.type) {
        if(oldVal.value !== value) {
          const oldValueNumber = oldVal.value
          oldVal.value = value
          // !!!just for testing now, do not use in production!!!
          if(key==='_xyC21_') {
            this.onPropertyChange(0, oldValueNumber, value)
          }
          else {
            this.afterPropertyChange()
          }
          // console.log('VARIATION ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  abstract renderControls(): TemplateResult

  renderNumberField(desc: NumberFieldDescriptor): TemplateResult {
    return html `
      <swan-number-slider labelWidth="${desc.labelWidth ? desc.labelWidth : '10em'}" .disabled="${undefined===desc.value()}" min="${desc.min}" max="${desc.max}" step="${desc.step}" 
        label="${desc.label}" value="${desc.value()} "
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

  renderComboBox(desc: ComboBoxDescriptor): TemplateResult {
    return html `
        <vaadin-combo-box style="width:23em;" .items="${desc.items}" item-value-path="key" item-label-path="caption"
                          .value=${desc.value}
                          @change=${(e: Event)=>{
                              const key = (e.target as HasValue<number>).value
                              desc.onChange(key as any)
                          }} label=${desc.label}></vaadin-combo-box>
    `
  }

  /*
  export function getFlameParam(propertyPath: string): FlameParameter | undefined {
    if(!playgroundStore || !playgroundStore.flame) {
        return undefined
    }
    // TODO - subProperties
    let val = (playgroundStore.flame as any)[propertyPath]
    // enums
    if(typeof val==='number') {
        return Parameters.intParam(val)
    }
    else {
        const param: FlameParameter = (playgroundStore.flame as any)[propertyPath]
        return param  ? param : undefined
    }
}
   */
}

