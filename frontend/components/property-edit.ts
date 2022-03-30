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

import {html, nothing} from "lit";
import {playgroundStore} from "Frontend/stores/playground-store";
import {FlameParameter, Parameters} from "Frontend/flames/model/parameters";
import '../components/swan-slider'
import '@vaadin/vaadin-checkbox'

export interface PropertyDescriptor {
    controlType: 'slider' | 'checkbox';
    propName: string;
    label: string;
    minValue?: number;
    maxValue?: number;
    step?: number;
}

export type OnPropertyChange = (propertyPath: string, changing: boolean, value: number) => void;

export function renderControl(ctrl: PropertyDescriptor, onPropertyChange: OnPropertyChange) {
    const param = getFlameParam(ctrl.propName)
    if(param) {
        if(ctrl.controlType==='checkbox') {
            return html `
                <vaadin-checkbox checked=${true} @change=${(e: Event)=>onPropertyChange(ctrl.propName, false, (e.target as any).checked ? 1: 0)} label="Backend transparency"></vaadin-checkbox>
            `
        }
        else {
            return html`
                <swan-slider .propName=${ctrl.propName} .label=${ctrl.label} .value=${param.value}
                             .minValue=${ctrl.minValue} .maxValue=${ctrl.maxValue} .step=${ctrl.step}
                             .onPropertyChange=${onPropertyChange}></swan-slider>`
        }
    }
    else {
        return nothing
    }
}

export function getFlameParam(propertyPath: string): FlameParameter | undefined {
    if(!playgroundStore || !playgroundStore.flame) {
        return undefined
    }
    // TODO - subProperties
    const param: FlameParameter = (playgroundStore.flame as any)[propertyPath]
    return param  ? param : undefined
}