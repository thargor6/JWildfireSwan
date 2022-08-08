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
import {
  FloatMotionCurveParameter,
  IntMotionCurveParameter
} from "Frontend/flames/model/parameters";
import {flameEditService, FlameEditService} from "Frontend/flames/service/flame-edit-service";
import {propertyHandlingService} from "Frontend/flames/service/property-handling-service";

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
  sliderWidth?: string
  hideSlider?: boolean
  hideEditField?: boolean
  onChange(value: number, isImmediateValue: boolean): void
  buttonIcon?: () => string
  onButtonClicked?: (e: Event) => void
  value(): number | undefined
  noUpdateOfSliderRange?: boolean
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
    return o[propertyName] // o[propertyName] is of type T[K]
  }

  setProperty<T, K extends keyof T>(o: T, propertyName: K, newValue: T[K])  {
    o[propertyName] = newValue
  }

  flameKeyFrameClicked(key: keyof Flame, e:Event) {
    if(editorStore.currFlame) {
      const val: any = this.getProperty(editorStore.currFlame, key)
      if(val && val.type && val.datatype) {
        const currFrame = editorStore.currFlame.frame.value
        if(val.datatype==='float') {
          if(val.type==='scalar') {
            this.setProperty(editorStore.currFlame, key, flameEditService.createFloatMotionCurveFromPoint(currFrame, val.value))
          }
          else if(val.type==='curve') {
            this.setProperty(editorStore.currFlame, key, flameEditService.addPointToFloatMotionCurve(currFrame, val.value, val as FloatMotionCurveParameter))
          }
          else {
            console.log(`WARN: unsupported type ${val.type} for flame parameter ${key}`)
          }
        }
        else if(val.datatype==='int') {
          if(val.type==='scalar') {
            this.setProperty(editorStore.currFlame, key, flameEditService.createIntMotionCurveFromPoint(currFrame, val.value))
          }
          else if(val.type==='curve') {
            this.setProperty(editorStore.currFlame, key, flameEditService.addPointToIntMotionCurve(currFrame, val.value, val as IntMotionCurveParameter))
          }
          else {
            console.log(`WARN: unsupported type ${val.type} for flame parameter ${key}`)
          }
        }
        else {
          console.log(`WARN: unsupported datatype ${val.datatype} for flame parameter ${key}`)
        }
        const setVal: any = this.getProperty(editorStore.currFlame, key)
      }
      else {
        console.log(`WARN: unsupported flame parameter ${key}`)
      }
    }
  }

  xformKeyFrameClicked(key: keyof XForm, e:Event) {
    if(editorStore.currXform) {
      const val: any = this.getProperty(editorStore.currXform, key)
      if(val && val.type && val.datatype) {
        const currFrame = editorStore.currFlame.frame.value
        if(val.datatype==='float') {
          if(val.type==='scalar') {
            this.setProperty(editorStore.currXform, key, flameEditService.createFloatMotionCurveFromPoint(currFrame, val.value))
          }
          else if(val.type==='curve') {
            this.setProperty(editorStore.currXform, key, flameEditService.addPointToFloatMotionCurve(currFrame, val.value, val as FloatMotionCurveParameter))
          }
          else {
            console.log(`WARN: unsupported type ${val.type} for xform parameter ${key}`)
          }
        }
        else if(val.datatype==='int') {
          if(val.type==='scalar') {
            this.setProperty(editorStore.currXform, key, flameEditService.createIntMotionCurveFromPoint(currFrame, val.value))
          }
          else if(val.type==='curve') {
            this.setProperty(editorStore.currXform, key, flameEditService.addPointToIntMotionCurve(currFrame, val.value, val as IntMotionCurveParameter))
          }
          else {
            console.log(`WARN: unsupported type ${val.type} for xform parameter ${key}`)
          }
        }
        else {
          console.log(`WARN: unsupported datatype ${val.datatype} for xform parameter ${key}`)
        }
        const setVal: any = this.getProperty(editorStore.currXform, key)
      }
      else {
        console.log(`WARN: unsupported xform parameter ${key}`)
      }
    }
  }

  getFlameValue(key: keyof Flame): number | undefined {
    return propertyHandlingService.getFlameValue(key)
  }

  getFlameKeyFrameIcon(key: keyof Flame): string {
    return propertyHandlingService.getFlameKeyFrameIcon(key)
  }

  getFlameBooleanValue(key: keyof Flame): boolean {
    return propertyHandlingService.getFlameBooleanValue(key)
  }

  getLayerValue(key: keyof Layer): number | undefined {
    return propertyHandlingService.getLayerValue(key)
  }

  getXformValue(key: keyof XForm): number | undefined {
    return propertyHandlingService.getXformValue(key)
  }

  getXformKeyFrameIcon(key: keyof XForm): string {
    return propertyHandlingService.getXformKeyFrameIcon(key)
  }

  getVariationValue(src: Variation | undefined, key: string): number | undefined {
    return propertyHandlingService.getVariationValue(src, key)
  }

  flamePropertyChange = (key: string, value: number, isImmediateValue: boolean) => {
    propertyHandlingService.flamePropertyChange(key, value, isImmediateValue, this.afterPropertyChange)
  }

  layerPropertyChange = (key: string, value: number, isImmediateValue: boolean) => {
    propertyHandlingService.layerPropertyChange(key, value, isImmediateValue, this.afterPropertyChange)
  }

  xformPropertyChange = (key: string, value: number, isImmediateValue: boolean) => {
    propertyHandlingService.xformPropertyChange(key, value, isImmediateValue, this.afterPropertyChange, this.onPropertyChange)
  }

  variationPropertyChange = (src: Variation | undefined, key: string, value: number, isImmediateValue: boolean) => {
    propertyHandlingService.variationPropertyChange(src, key, value, isImmediateValue, this.afterPropertyChange, this.onPropertyChange)
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

  getRegisteredControl(key: string): HTMLElement {
    const ref = this.registeredControls.get(key)
    if(ref && ref.component) {
      return ref.component
    }
    else {
      throw new Error(`No instance of component ${key} found`)
    }
  }

  renderNumberField(desc: NumberFieldDescriptor): TemplateResult {
    return html `
      <swan-number-slider 
        .labelWidth="${desc.labelWidth ? desc.labelWidth : '8em'}"
        .sliderWidth="${desc.sliderWidth ? desc.sliderWidth : '14em'}"
        .hideSlider=${(!!desc.hideSlider)}
        .hideEditField=${(!!desc.hideEditField)}
        .noUpdateOfSliderRange=${(!!desc.noUpdateOfSliderRange)}
        .buttonIcon=${desc.buttonIcon ? desc.buttonIcon() : ''} 
        .disabled="${undefined===desc.value()}" min="${desc.min}" max="${desc.max}" step="${desc.step}" 
        label="${desc.label}" id="${desc.id ? desc.id : desc.key}"
        .onValueChange=${desc.onChange} .onButtonClicked=${desc.onButtonClicked ? 
              (e:Event)=>{if(desc.onButtonClicked) {
                     desc.onButtonClicked(e)
                   }
                   this.requestContentUpdate()} : undefined
           }
      >
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

  requestContentUpdate() {
    this.refreshControls()
    this.requestUpdate()
  }
}

