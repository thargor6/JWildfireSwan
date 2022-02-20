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

import {VariationParam, VariationParamType, VariationShaderFunc2D, VariationTypes} from "./variation-shader-func";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";
import {
    FUNC_COSH,
    FUNC_HYPOT,
    FUNC_LOG10,
    FUNC_MODULO,
    FUNC_SGN,
    FUNC_SINH,
    FUNC_SQRT1PM1,
    FUNC_TANH, LIB_COMPLEX
} from "Frontend/flames/renderer/variations/variation-math-functions";
import {M_PI} from "Frontend/flames/renderer/mathlib";

/*
  be sure to import this class somewhere and call register2DVars()
 */

class AcosechFunc extends VariationShaderFunc2D {
    //acosech by Whittaker Courtney,
    //based on the hyperbolic variations by Tatyana Zabanova and DarkBeam's implementation of them.
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex_AcosecH(z);
              Complex_Flip(z);
              Complex_Scale(z, amount  * 2.0 / M_PI);
              if (rand2(tex) < 0.5) {
                _vy += z.im;
                _vx += z.re;
              } else {
                _vy += -z.im;
                _vx += -z.re;
              }
        }`;
    }

    get name(): string {
        return "acosech";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AcoshFunc extends VariationShaderFunc2D {
    //acosh by Whittaker Courtney,
    //based on the hyperbolic variations by Tatyana Zabanova and DarkBeam's implementation of them.
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex_AcosH(z);
              Complex_Scale(z, amount * 2.0 / M_PI);
              if(rand2(tex)<0.5) {
                _vy += z.im;
                _vx += z.re;
              }
              else {
                _vy += -z.im;
                _vx += -z.re;
              }
        }`;
    }

    get name(): string {
        return "acosh";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AcothFunc extends VariationShaderFunc2D {
    //acoth by Whittaker Courtney,
    //based on the hyperbolic variations by Tatyana Zabanova and DarkBeam's implementation of them.
     getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex_AcotH(z);
              Complex_Flip(z);
              Complex_Scale(z, amount * 2.0 / M_PI);
              _vy += z.im;
              _vx += z.re;
        }`;
    }

    get name(): string {
        return "acoth";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Arcsech2Func extends VariationShaderFunc2D {
    // author Tatyana Zabanova 2017. Implemented by DarkBeam 2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex_Recip(z);
              Complex z2;
              Complex_Init(z2, z.re, z.im);
              Complex_Dec(z2);
              Complex_Sqrt(z2);
              Complex z3;
              Complex_Init(z3, z.re, z.im);
              Complex_Inc(z3);
              Complex_Sqrt(z3);
              Complex_Mul(z3, z2);
              Complex_Add(z, z3);
              Complex_Log(z);
              Complex_Scale(z, amount * 2.0 / M_PI);
              _vy += z.im;
              if (z.im < 0.0) {
                _vx += z.re;
                _vy += 1.0;
              } else {
                _vx -= z.re;
                _vy -= 1.0;
              }
        }`;
    }

    get name(): string {
        return "arcsech2";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function register2DComplexVars() {
    VariationShaders.registerVar(new AcosechFunc())
    VariationShaders.registerVar(new AcoshFunc())
    VariationShaders.registerVar(new AcothFunc())
    VariationShaders.registerVar(new Arcsech2Func())
}
