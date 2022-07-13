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

import {customElement, property, query} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";
import {html, PropertyValues} from "lit";
import '@vaadin/number-field';
import '@vaadin/custom-field'
import '@polymer/paper-slider/paper-slider'
import {PaperSliderElement} from "@polymer/paper-slider";
import {NumberField} from "@vaadin/number-field/src/vaadin-number-field";
import {CustomField, CustomFieldValueChangedEvent} from "@vaadin/custom-field";

@customElement('swan-number-slider')
export class SwanNumberSlider extends MobxLitElement {

    @property()
    label = ''

    @property()
    value = 0.0

    @property()
    min = -5.0

    @property()
    max = 5.0

    @property()
    step = 0.5

    @property()
    disabled = false

    @property()
    labelWidth = '8em'

    @property()
    sliderWidth = '15em'

    @property()
    onValueChange?: (value: number, isImmediateValue: boolean)=>{}

    @query('vaadin-custom-field')
    private customField!: CustomField

    @query('paper-slider')
    private slider!: PaperSliderElement

    @query('vaadin-number-field')
    private numberField!: NumberField

    render() {
        return html  `
            <vaadin-custom-field
              theme="small"
              ?disabled="${this.disabled}"
              @change="${(e: CustomFieldValueChangedEvent) => {
                  //console.log('CHANGE', e.detail.value, (e.detail as any).isImmediateValue)
                  const val = e.detail.value
                  e.preventDefault()
                  const newValue = parseFloat(val)
                  // changing of this.value would cause an unwanted refresh here,
                  // currently we do not need value at all (except for setting an initial value)
                  // this.value = newValue
                  this.numberField.value = val
                  this.customField.value = val
                  if(this.onValueChange) {
                      this.onValueChange(newValue, (e.detail as any).isImmediateValue)
                  }
              }}">
              <div style="display: flex; flex-direction: row; align-items: center;">
                <div style="width: ${this.labelWidth}; margin-right: 0.5em; text-align: end; font-weight: bold;">${this.label}</div>
                <vaadin-number-field theme="small" @change=${this.numberFieldChanged} step=${this.step}
                  ?disabled="${this.disabled}" value="${this.value}"></vaadin-number-field>
                 <paper-slider style="width: ${this.sliderWidth};" @immediate-value-change="${this.immediateValueChanged}"
                   ?disabled="${this.disabled}" @value-change="${this.sliderChange}" value="${this.value}" min="${this.min}"
                   step=${this.step} max="${this.max}"></paper-slider>
              </div>
            </vaadin-custom-field>
        `
    }

    sliderChange = (e: Event) => {
        // console.log("SLIDER", e)
        const target: any = e.target
        if(target) {
            e.preventDefault()
            this.value = target.value
            this.numberField.value = target.value
          //  this.dispatchChangeEvent(target.value, false)
        }
    }

    numberFieldChanged = (e: Event) => {
        const target: any = e.target
        if(target) {
            e.preventDefault()
        }
    }

    immediateValueChanged = (e: Event) => {
        // console.log("SLIDER IMMEDIATE", e)
        const target: any = e.target
        if(target) {
            e.preventDefault()
            this.value = target.immediateValue
            this.numberField.value = target.immediateValue
            this.dispatchChangeEvent(target.immediateValue, true)
        }
    }

    updateMinMax() {
        if(this.value<this.min) {
            this.min = this.value - 1
        }
        if(this.value>this.max) {
            this.max = this.value + 1
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties)
        this.updateMinMax()
        if(this.customField) {
            this.customField.i18n = {
                formatValue(inputValues: unknown[]): string {
                    if(inputValues && inputValues.length>0 && typeof inputValues[0] === "string" ) {
                        return inputValues[0]
                    }
                    return "";
                }, parseValue(value: string): unknown[] {
                    return [value];
                }
            }
        }
    }

    private convertValueToString(value: number) {
        return value.toString()
    }

    dispatchChangeEvent = (value: number, isImmediateValue: boolean) => {
        const event = new CustomEvent('change', {
            detail: {
                value: this.convertValueToString(value),
                isImmediateValue: isImmediateValue,
                rawValue: value
            },
            bubbles: false,
            cancelable: true,
            composed: false
        });
        this.customField.dispatchEvent(event)
    }

}