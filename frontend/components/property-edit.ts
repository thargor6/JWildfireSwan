import {html, nothing} from "lit";
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
    const param = getFlameParam(ctrl.propName)
    if(param) {
        return html`<swan-slider .propName=${ctrl.propName} .label=${ctrl.label} .value=${param.value} .minValue=${ctrl.minValue} .maxValue=${ctrl.maxValue} .onPropertyChange=${onPropertyChange}></swan-slider>`
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