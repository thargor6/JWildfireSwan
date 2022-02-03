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

import {
    VariationParam,
    VariationParamType, VariationShaderFunc2D,
    VariationShaderFunc3D,
    VariationTypes
} from "./variation-shader-func";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";
import {FUNC_SGN} from "Frontend/flames/renderer/variations/variation-math-functions";

/*
  be sure to import this class somewhere and call registerZTransformVars()
 */
class FlattenFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          _vz = 0.0;
        }`;
    }

    get name(): string {
        return "flatten";
    }

    get priority(): number {
        return 1;
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM, VariationTypes.VARTYPE_POST];
    }
}

class ZConeFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
           _vz += amount * sqrt(_tx * _tx + _ty * _ty);
        }`;
    }

    get name(): string {
        return "zcone";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class ZTranslateFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
          _vz += amount;
        }`;
    }

    get name(): string {
        return "ztranslate";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}


export function registerZTransformVars() {
    VariationShaders.registerVar(new FlattenFunc())
    VariationShaders.registerVar(new ZConeFunc())
    VariationShaders.registerVar(new ZTranslateFunc())
}
