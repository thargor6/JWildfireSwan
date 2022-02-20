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

class ArcsinhFunc extends VariationShaderFunc2D {
    // author Tatyana Zabanova 2017. Implemented by DarkBeam 2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex_AsinH(z);
              Complex_Scale(z, amount * 2.0 / M_PI);
              _vx += z.re;
              _vy += z.im;
        }`;
    }

    get name(): string {
        return "arcsinh";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ArctanhFunc extends VariationShaderFunc2D {
    // author Tatyana Zabanova 2017. Implemented by DarkBeam 2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex z2;
              Complex_Init(z2, z.re, z.im);
              Complex_Scale(z2, -1.0);
              Complex_Inc(z2);
              Complex z3;
              Complex_Init(z3, z.re, z.im);
              Complex_Inc(z3);
              Complex_Div(z3, z2);
              Complex_Log(z3);
              Complex_Scale(z3, amount * 2.0 / M_PI);
              _vx += z3.re;
              _vy += z3.im;
        }`;
    }

    get name(): string {
        return "arctanh";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PlusRecipFunc extends VariationShaderFunc2D {
    PARAM_AR = "ar"
    PARAM_AI = "ai"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_AR, type: VariationParamType.VP_NUMBER, initialValue: 4.0 },
            { name: this.PARAM_AI, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // author DarkBeam. Implemented by DarkBeam 2019
        return `{
          float amount = float(${variation.amount});
          float ar = float(${variation.params.get(this.PARAM_AR)});
          float ai = float(${variation.params.get(this.PARAM_AI)});
          Complex z;
          Complex_Init(z, _tx, _ty);
          Complex k;
          Complex_Init(k, z.re, z.im);
          Complex a;
          Complex_Init(a, ar, ai);
          float aa = sqrt(Complex_Mag2eps(a));
          Complex_Sqr(k);
          Complex_Sub(k, a);
          Complex_Sqrt(k);
          Complex_Add(k, z);
          Complex_Copy(z, k);
          Complex_Sqr(z);
          if(sqrt(Complex_Mag2eps(z))<aa) {
            Complex_Conj(k);
            Complex_Scale(a, -1.0 / aa);
            Complex_Mul(k, a);
          }
          if(k.re < 0.0) {
            Complex_Neg(k);
          }
          Complex_Scale(k, amount);
          _vx += k.re;
          _vy += k.im;
        }`;
    }

    get name(): string {
        return "plusrecip";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Sqrt_AcosechFunc extends VariationShaderFunc2D {
    //Sqrt AcosecH by Whittaker Courtney 12-19-2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex_Sqrt(z);
              Complex_AcosecH(z);
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
        return "sqrt_acosech";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Sqrt_AcoshFunc extends VariationShaderFunc2D {
    //Sqrt AcosH by Whittaker Courtney 12-19-2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex_Sqrt(z);
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
        return "sqrt_acosh";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Sqrt_AcothFunc extends VariationShaderFunc2D {
    //Sqrt AcotH by Whittaker Courtney 12-19-2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z, _tx, _ty);
              Complex_Sqrt(z);
              Complex_AcotH(z);
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
        return "sqrt_acoth";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Sqrt_AsechFunc extends VariationShaderFunc2D {
    //Sqrt AsecH by Whittaker Courtney 12-19-2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z,_tx, _ty);
              Complex_Sqrt(z);
              Complex_AsecH(z);
              Complex_Scale(z, amount * (2.0 / M_PI));
              if (rand2(tex) < 0.5) {
                _vy += z.im;
                _vx += z.re;
              }  
              else{   
                _vy += -z.im;
                _vx += -z.re;
              }
        }`;
    }

    get name(): string {
        return "sqrt_asech";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Sqrt_AsinhFunc extends VariationShaderFunc2D {
    //Sqrt AsinH by Whittaker Courtney 12-19-2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z,_tx, _ty);
              Complex_Sqrt(z);
              Complex_AsinH(z);
              Complex_Scale(z,amount * (2.0 / M_PI));
              if (rand2(tex) < 0.5) {
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
        return "sqrt_asinh";
    }

    get funcDependencies(): string[] {
        return [LIB_COMPLEX];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Sqrt_AtanhFunc extends VariationShaderFunc2D {
    //Sqrt AtanH by Whittaker Courtney 12-19-2018
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              Complex z;
              Complex_Init(z,_tx, _ty);    
              Complex_Sqrt(z);
              Complex_AtanH(z); 
              Complex_Scale(z,amount * (2.0 / M_PI));
              if (rand2(tex) < 0.5) {
                _vy += z.im; 
                _vx += z.re;
              } 
              else{ 
                _vy += -z.im; 
                _vx += -z.re;    
              }
        }`;
    }

    get name(): string {
        return "sqrt_atanh";
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
    VariationShaders.registerVar(new ArcsinhFunc())
    VariationShaders.registerVar(new ArctanhFunc())
    VariationShaders.registerVar(new PlusRecipFunc())
    VariationShaders.registerVar(new Sqrt_AcosechFunc())
    VariationShaders.registerVar(new Sqrt_AcoshFunc())
    VariationShaders.registerVar(new Sqrt_AcothFunc())
    VariationShaders.registerVar(new Sqrt_AsechFunc())
    VariationShaders.registerVar(new Sqrt_AsinhFunc())
    VariationShaders.registerVar(new Sqrt_AtanhFunc())

}
