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
import '@vaadin/number-field';
import '@polymer/paper-slider/paper-slider'
import {OnPropertyChange} from "Frontend/components/property-edit";
import {getTimeStamp} from "Frontend/components/utils";
import {PaperSliderElement} from "@polymer/paper-slider";

@customElement('swan-slider')
export class SwanSlider extends MobxLitElement {

    @property()
    propName = ''

    @property()
    label = ''

    @property()
    value = 0.0

    @property()
    minValue = -5.0

    @property()
    maxValue = 5.0

    @property()
    step = 1

    lastValueChangeTimeStamp = 0

    @query('paper-slider')
    slider!: PaperSliderElement

    onPropertyChange: OnPropertyChange = (property: string, changing: boolean, value: number) => {}

    render() {
        this.updateMinMax()
        return html  `
            <div style="display: flex; flex-direction: column;">
                <label>${this.label}</label>
                <div style="display: flex; flex-direction: row; align-items: center; ">
                    <paper-slider property="${this.propName}" @immediate-value-change="${this.immediateValueChanged}"
                                  @value-change="${this.sliderValueChanged}" value="${this.value}" min="${this.minValue}"
                                  step=${this.step} max="${this.maxValue}"></paper-slider>
                    <vaadin-number-field @change="${this.numberFieldChanged}" step=${this.step} min="${this.minValue}" 
                                         max="${this.maxValue}" value="${this.value}" has-controls></vaadin-number-field>
                </div>
            </div>
        `
    }

    immediateValueChanged = (e: Event) => {
        const target: any = e.target
        if(target && this.propName) {
            const currTimeStamp = getTimeStamp()
            if(currTimeStamp > this.lastValueChangeTimeStamp + 25) {
                console.log("  ", target.immediateValue)
                this.onPropertyChange(this.propName, true, target.immediateValue)
                this.lastValueChangeTimeStamp = getTimeStamp()
                this.value = target.value
                this.updateMinMax()
            }
        }
    }

    sliderValueChanged = (e: Event) => {
        const target: any = e.target
        if(target && this.propName) {
            this.onPropertyChange(this.propName, false, target.value)
            this.lastValueChangeTimeStamp = getTimeStamp()
            this.value = target.value
            this.updateMinMax()
        }
    }

    numberFieldChanged = (e: Event) => {
        const target: any = e.target
        if(target && this.propName) {
            this.onPropertyChange(this.propName, false, target.value)
            this.lastValueChangeTimeStamp = getTimeStamp()
            this.value = target.value
            this.updateMinMax()
        }
    }

    updateMinMax() {
        if(this.value<this.minValue) {
            this.minValue = this.value
        }
        if(this.value>this.maxValue) {
            this.maxValue = this.value
        }
    }

}