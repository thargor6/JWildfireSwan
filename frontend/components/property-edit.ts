import {html} from "lit";
import {playgroundStore} from "Frontend/stores/playground-store";
import {FlameParameter, Parameters} from "Frontend/flames/model/parameters";

export interface PropertyDescriptor {
    propName: string;
    label: string;
    minValue: number;
    maxValue: number;
}

export type OnPropertyChange = (propertyPath: string, changing: boolean, value: number) => void;

export function renderControl(ctrl: PropertyDescriptor, onPropertyChange: OnPropertyChange) {
    return html `<swan-slider .propName=${ctrl.propName} .label=${ctrl.label} .value=${getFlameParam(ctrl.propName).value} .minValue=${ctrl.minValue} .maxValue=${ctrl.maxValue} .onPropertyChange=${onPropertyChange}></swan-slider>`
}

export function getFlameParam(propertyPath: string): FlameParameter {
    if(!playgroundStore.flame) {
        return Parameters.dNumber(0.0)
    }
    // TODO - subProperties
    const param: FlameParameter = (playgroundStore.flame as any)[propertyPath]
    return param ? param : Parameters.dNumber(0.0)
}