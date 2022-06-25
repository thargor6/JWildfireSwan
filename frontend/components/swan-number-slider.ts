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
    onValueChange?: (value: number)=>{}

    @query('vaadin-custom-field')
    private customField!: CustomField

    @query('paper-slider')
    private slider!: PaperSliderElement

    @query('vaadin-number-field')
    private numberField!: NumberField

    render() {
        return html  `
            <vaadin-custom-field
              ?disabled="${this.disabled}"
              @change="${(e: CustomFieldValueChangedEvent) => {
                  // console.log(e.detail.value)
                  const val = e.detail.value
                  e.preventDefault()
                  this.value = parseFloat(val)
                  this.numberField.value = val
                  this.customField.value = val
                  if(this.onValueChange) {
                      this.onValueChange(this.value)
                  }
              }}">
              <div style="display: flex; flex-direction: row; align-items: center;">
                <div style="width: 10em; margin-right: 0.5em;">${this.label}</div>
                <vaadin-number-field @change=${this.numberFieldChanged} step=${this.step} min="${this.min}"
                  ?disabled="${this.disabled}" max="${this.max}" value="${this.value}" has-controls></vaadin-number-field>
                 <paper-slider @immediate-value-change="${this.immediateValueChanged}"
                   ?disabled="${this.disabled}" @value-change="${this.sliderChange}" value="${this.value}" min="${this.min}"
                   step=${this.step} max="${this.max}"></paper-slider>
              </div>
            </vaadin-custom-field>
        `
    }

    sliderChange = (e: Event) => {
        const target: any = e.target
        if(target) {
            e.preventDefault()
            this.value = target.value
            this.numberField.value = target.value
            this.dispatchChangeEvent(target.value)
        }
    }

    numberFieldChanged = (e: Event) => {
        const target: any = e.target
        if(target) {
            e.preventDefault()
        }
    }

    immediateValueChanged = (e: Event) => {
        const target: any = e.target
        if(target) {
            e.preventDefault()
            this.value = target.immediateValue
            this.numberField.value = target.immediateValue
            this.dispatchChangeEvent(target.immediateValue)
        }
    }

    updateMinMax() {
        if(this.value<this.min) {
            this.min = this.value
        }
        if(this.value>this.max) {
            this.max = this.value
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

    dispatchChangeEvent = (value: number) => {
        const event = new CustomEvent('change', {
            detail: {
                value: this.convertValueToString(value),
                rawValue: value
            },
            bubbles: true,
            cancelable: true,
            composed: false
        });
        this.customField.dispatchEvent(event)
    }

}