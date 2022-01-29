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

import {VariationShaderFunc} from "Frontend/flames/renderer/variations/variation-shader-func";
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

    public static get varNameList() {
        let res = new Array<string>()
        this.variations.forEach((_value, key) => res.push(key))
        return res
    }
}
