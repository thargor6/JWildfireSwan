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
import {Flame, Layer, Variation, XForm} from "Frontend/flames/model/flame";
import {floatsAreEqual} from "Frontend/components/utils";

export interface ComoboBoxItem {
  key: number
  caption: string
}

export interface CheckboxDescriptor {
  id?: string
  key: string
  label: string
  onChange(value: number, isImmediateValue: boolean): void
  value(): boolean
}

export interface ComboBoxDescriptor {
  id?: string
  key: string
  label: string
  items?:Array<ComoboBoxItem>
  onChange(value: number, isImmediateValue: boolean): void
  value(): number | undefined
}

export interface NumberFieldDescriptor {
  id?: string
  key: string
  label: string
  min: number
  max: number
  step: number
  labelWidth?: string
  onChange(value: number, isImmediateValue: boolean): void
  value(): number | undefined
}

class HtmlControlReference {
  constructor(public desc: NumberFieldDescriptor | ComboBoxDescriptor | CheckboxDescriptor, public component: HTMLElement | undefined) {
    // EMPTY
  }
}

export abstract class EditPropertyPanel extends MobxLitElement {
  @property({type: Boolean})
  visible = true

  @property()
  afterPropertyChange = ()=>{}

  @property()
  onPropertyChange = (paramId: number, oldValue: number, newValue: number)=>{}

  registeredControls = new Map<String, HtmlControlReference>()

  render() {
    return html`
      <vertical-layout theme="spacing" style="${this.visible ? `display:flex; flex-direction: row; flex-wrap: wrap;;`: `display:none;`}">
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
      let val: any = this.getProperty(src, key)
      if(!val) {
        val = src.params.get(key)
      }
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

  flamePropertyChange = (key: string, value: number, isImmediateValue: boolean) => {
    if(editorStore.currFlame && !editorStore.refreshing) {
      const oldVal: any = this.getProperty(editorStore.currFlame, <keyof Flame>key)
      if (oldVal && oldVal.type) {
        if (!floatsAreEqual(oldVal.value, value)) {
          if(!isImmediateValue) {
            editorStore.undoManager.registerFlameAttributeChange(editorStore.currFlame, <keyof Flame>key, value)
          }
          oldVal.value = value
          this.afterPropertyChange()
          // console.log('FLAME ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  layerPropertyChange = (key: string, value: number, isImmediateValue: boolean) => {
    if(editorStore.currLayer && !editorStore.refreshing) {
      // @ts-ignore
      const oldVal: any = this.getProperty(editorStore.currLayer, key)
      if (oldVal && oldVal.type) {
        if (!floatsAreEqual(oldVal.value, value)) {
          if(!isImmediateValue) {
            editorStore.undoManager.registerLayerAttributeChange(editorStore.currFlame, editorStore.currLayer, <keyof Layer>key, value)
          }
          oldVal.value = value
          this.afterPropertyChange()
          // console.log('LAYER ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  xformPropertyChange = (key: string, value: number, isImmediateValue: boolean) => {
    if(editorStore.currXform && !editorStore.refreshing) {
      // @ts-ignore
      const oldVal: any = this.getProperty(editorStore.currXform, key)
      if(oldVal && oldVal.type) {
        if (!floatsAreEqual(oldVal.value, value)) {
          const oldValueNumber = oldVal.value
          if(!isImmediateValue) {
            editorStore.undoManager.registerXformAttributeChange(editorStore.currFlame, editorStore.currXform, <keyof XForm>key, value)
          }
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

  variationPropertyChange = (src: Variation | undefined, key: string, value: number, isImmediateValue: boolean) => {
    if(src  && !editorStore.refreshing) {
      // @ts-ignore
      let oldVal: any = this.getProperty(src, key)
      let isAttrFromMap: boolean
      if(!oldVal) {
        oldVal = src.params.get(key)
        isAttrFromMap = true
      }
      else {
        isAttrFromMap = false
      }
      if(oldVal && oldVal.type) {
        if (!floatsAreEqual(oldVal.value, value)) {
          const oldValueNumber = oldVal.value
          if(!isImmediateValue) {
            if(isAttrFromMap) {
              editorStore.undoManager.registerVariationAttrMapAttributeChange(editorStore.currFlame, src, key, value)
            }
            else {
              editorStore.undoManager.registerVariationAttributeChange(editorStore.currFlame, src, <keyof Variation>key, value)
            }
          }
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

  unregisterAllControls = ()=> {
    this.registeredControls = new Map<String, HtmlControlReference>()
  }

  registerControl(desc: NumberFieldDescriptor | ComboBoxDescriptor | CheckboxDescriptor) {
    const key = desc.id ? desc.id : desc.key
    if (this.registeredControls.has(key)) {
      throw new Error(`Control ${key} is already registered`)
    }
    this.registeredControls.set(key, new HtmlControlReference(desc, undefined))
  }

  renderNumberField(desc: NumberFieldDescriptor): TemplateResult {
    return html `
      <swan-number-slider labelWidth="${desc.labelWidth ? desc.labelWidth : '10em'}" .disabled="${undefined===desc.value()}" min="${desc.min}" max="${desc.max}" step="${desc.step}" 
        label="${desc.label}" .value2=${desc.value()} id="${desc.id ? desc.id : desc.key}"
        .onValueChange="${desc.onChange}">
      </swan-number-slider>
    `
  }

  renderCheckbox(desc: CheckboxDescriptor): TemplateResult {
    return html `
        <vaadin-checkbox ?checked=${desc.value} label="${desc.label}" id="${desc.id ? desc.id : desc.key}"
          @change=${(e: Event)=>desc.onChange((e.target as any).checked ? 1: 0, false)}>
        </vaadin-checkbox>
    `
  }

  renderComboBox(desc: ComboBoxDescriptor): TemplateResult {
    return html `
        <vaadin-combo-box style="width:23em;" .items="${desc.items}" item-value-path="key" item-label-path="caption" id="${desc.id ? desc.id : desc.key}"
                          .value2=${desc.value}
                          @change=${(e: Event)=>{
                              const key = (e.target as HasValue<number>).value
                              desc.onChange(key as any, false)
                          }} label=${desc.label}></vaadin-combo-box>
    `
  }

  updateControlReferences(useShadowDom: boolean) {
    for(const key of this.registeredControls.keys()) {
      let ref = this.registeredControls.get(key)
      if(ref && ref.component==undefined) {
        const ctrl = useShadowDom ? this.shadowRoot!.querySelector('#'+key) : this.querySelector('#'+key)
        if(!ctrl) {
          console.log(`WARN: control ${key} not found`)
        }
        else {
         ref.component = ctrl as HTMLElement
        }
      }
    }
  }

  refreshControls() {
    const oldRefresh = editorStore.refreshing
    editorStore.refreshing = true
    try {
      for (const key of this.registeredControls.keys()) {
        let ref = this.registeredControls.get(key)!
        if (!ref.component) {
          throw new Error('Please call updateControlReferences() first')
        }
        (ref.component as any).value = ref.desc.value()
      }
    }
    finally {
      editorStore.refreshing = oldRefresh
    }
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

  requestContentUpdate() {
    this.refreshControls()
    this.requestUpdate()
  }
}

