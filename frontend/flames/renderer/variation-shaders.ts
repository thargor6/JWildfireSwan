
import {VariationShaderFunc} from "Frontend/flames/renderer/variation-shader-func";
import {RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";

export class VariationShaders {
    static variations = new Map<string, VariationShaderFunc>()

    static getVariationCode(xform: RenderXForm, variation: RenderVariation): string {
        const vsFunc = this.variations.get(variation.name)
        if(!vsFunc) {
            return '{}';
        }
        return vsFunc.getCode(xform, variation)
    }

    static getVariationDepFunctions(variation: RenderVariation): string[] {
        const vsFunc = this.variations.get(variation.name)
        if(!vsFunc) {
            return [];
        }
        return vsFunc.funcDependencies
    }

    public static registerVar(varFunc: VariationShaderFunc) {
        this.variations.set(varFunc.name, varFunc)
    }
}
