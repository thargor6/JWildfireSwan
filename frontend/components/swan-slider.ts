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

import {customElement, property} from 'lit/decorators.js';
import {MobxLitElement} from "@adobe/lit-mobx";
import {html, nothing, PropertyValues} from "lit";
import '@vaadin/vaadin-details'
import '@vaadin/text-area';
import '@polymer/paper-slider/paper-slider'

@customElement('swan-slider')
export class SwanSlider extends MobxLitElement {

    @property()
    propName = ''

    @property()
    label = ''

    propTarget: any

    @property()
    value = 0.0

    @property()
    minValue = -5.0

    @property()
    maxValue = 5.0


    onValueChange: (propertyTarget: any, property: string, changing: boolean, value: number) => void = () =>{}

    render() {
        return html  `
            <label>${this.label}</label>
            <paper-slider property="${this.propName}" @immediate-value-change="${this.immediateValueChanged}" @value-change="${this.valueChanged}" value="${this.value}" min="${this.minValue}" step=${(this.maxValue-this.minValue)/200.0} max="${this.maxValue}"></paper-slider>
        `
    }

    immediateValueChanged = (e: Event) => {
        const target: any = e.target
        if(target && this.propTarget && this.propName) {
            this.onValueChange(this.propTarget, this.propName, true, target.immediateValue)
        }
    }

    valueChanged = (e: Event) => {
        const target: any = e.target
        if(target && this.propTarget && this.propName) {
            this.onValueChange(this.propTarget, this.propName, false, target.value)
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        if(this.propTarget && this.propName) {
            this.propName = this.propTarget[this.propName]
        }
    }
}