import {Variation} from "Frontend/flames/model/flame";
import {VariationShaderFunc} from "Frontend/flames/renderer/variation-shader-func";

export class VariationShaders {
    static variations = new Map<string, VariationShaderFunc>()

    static getVariationCode(variation: Variation): string {
        const vsFunc = this.variations.get(variation.name)
        if(!vsFunc) {
            return '{}';
        }
        return vsFunc.getCode(variation)
    }

    public static registerVar(varFunc: VariationShaderFunc) {
        this.variations.set(varFunc.name, varFunc)
    }
}
