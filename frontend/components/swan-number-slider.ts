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
import {html, nothing, PropertyValues} from "lit";
import '@polymer/paper-slider/paper-slider'
import {PaperSliderElement} from "@polymer/paper-slider";
import {NumberField} from "@vaadin/number-field/src/vaadin-number-field";
import {CustomFieldValueChangedEvent} from "@vaadin/custom-field";
import {floatsAreEqual} from "Frontend/components/utils";
import {editorStore} from "Frontend/stores/editor-store";
import '@vaadin/number-field'
import '@vaadin/vaadin-button'
import '@vaadin/vaadin-icon'


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
    editFieldWidth = '5em'

    @property()
    sliderWidth = '15em'

    @property()
    hideSlider = false

    @property()
    hideEditField = false

    @property()
    buttonText = ''

    @property()
    buttonIcon = 'vaadin:plus-circle-o'

    @property()
    buttonWidth = '3em'

    @property()
    onValueChange?: (value: number, isImmediateValue: boolean)=>{}

    @property()
    onButtonClicked : (((e: Event) => void) | undefined) = undefined

    @query('paper-slider')
    private slider!: PaperSliderElement

    @query('vaadin-number-field')
    private numberField!: NumberField

    refreshing = false

    render() {
        return html  `
          <div style="display: flex; flex-direction: row; align-items: center;">
            <div style="width: ${this.labelWidth}; margin-right: 0.5em; text-align: end; font-size: small; font-weight: bold;">${this.label}</div>
            ${!this.onButtonClicked ? nothing : html `
              <vaadin-button style="min-width: ${this.buttonWidth}; margin-right: 0.5em;" @click="${this.onButtonClicked}"><vaadin-icon icon="${this.buttonIcon}"></vaadin-icon>${this.buttonText}</vaadin-button>  
             `
            }
              
            ${this.hideEditField ? html `<div style="font-size: small; min-width:3em;">${this.value}</div>` : html `
              <vaadin-number-field style="width: ${this.editFieldWidth};" theme="small" @change=${this.numberFieldChanged} step=${this.step}
                ?disabled="${this.disabled}" value="${this.value}"></vaadin-number-field>            
            `}
            ${this.hideSlider ? nothing : html `
              <paper-slider style="width: ${this.sliderWidth};" @immediate-value-change="${this.immediateValueChanged}"
                ?disabled="${this.disabled}" @value-change="${this.sliderChange}" value="${this.value}" 
                min="${this.min}" step=${this.step} max="${this.max}"></paper-slider>                
            `}  

          </div>
        `
    }

    sliderChange = (e: Event) => {
        const newValue = (e.target as any).value
        if(!floatsAreEqual(this.value, newValue) && !editorStore.refreshing) {
            //console.log('SLIDER', this.value, '->', newValue, e)
            this.value = newValue
            if (this.onValueChange) {
               // leads to unwanted changes of the slider-position:
               // this.onValueChange(newValue, false)
            }
        }
    }

    numberFieldChanged = (e: Event) => {
        const newValue = parseFloat((e.target as any).value)
        if(!floatsAreEqual(this.value, newValue)) {
            // console.log('NUMBER FIELD', this.value, '->', newValue, e)
            this.updateMinMax(newValue)
            this.value = newValue
            if (this.onValueChange) {
                this.onValueChange(newValue, false)
            }
        }
    }

    immediateValueChanged = (e: Event) => {
        const newValue = (e.target as any).immediateValue
        if(!floatsAreEqual(this.value, newValue)) {
            //console.log('SLIDER IMMEDIATE', this.value, '->', newValue, e)
            this.value = newValue
            if (this.onValueChange) {
                this.onValueChange(newValue, false)
            }
        }
    }

    updateMinMax = (newValue: number) => {
        if(newValue<this.min) {
            this.min = newValue - (this.max -newValue) / 10
            if(this.slider) {
                this.slider.min = this.min
            }
         //   console.log("upd min", this.max, newValue)
        }
        if(newValue>this.max) {
            this.max = newValue + (newValue - this.min) / 10
            if(this.slider) {
                this.slider.max = this.max
            }
          //  console.log("upd max", this.max, newValue)
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties)
        this.updateMinMax(this.value)
    }

    private convertValueToString(value: number) {
        return value.toString()
    }

    onChange = (e: CustomFieldValueChangedEvent) => {
        if(!this.refreshing) {
            //console.log('CHANGE', e.detail.value, (e.detail as any).isImmediateValue)
            const val = e.detail.value
            e.preventDefault()
            const newValue = parseFloat(val)
            // changing of this.value would cause an unwanted refresh here,
            // currently we do not need value at all (except for setting an initial value)
            this.value = newValue
            this.numberField.value = val
            if (this.onValueChange) {
                this.onValueChange(newValue, (e.detail as any).isImmediateValue)
            }
        }
    }

}