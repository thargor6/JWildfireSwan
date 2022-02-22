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
    FUNC_TANH, LIB_COMPLEX, VariationMathFunctions
} from "Frontend/flames/renderer/variations/variation-math-functions";
import {M_PI} from "Frontend/flames/renderer/mathlib";

/*
  be sure to import this class somewhere and call register2DSynthVar()
 */

// Local functions
const LIB_SYNTH = 'lib_synth'

// -------------------------------------------------------------
// Interpolation types
const LERP_LINEAR = 0;
const LERP_BEZIER = 1;
// Modes
// "Lagacy" modes from v1
const MODE_SPHERICAL = 0;
const MODE_BUBBLE = 1;
const MODE_BLUR_LEGACY = 2;
// New modes in v2
const MODE_BLUR_NEW = 3;
const MODE_BLUR_ZIGZAG = 4;
const MODE_RAWCIRCLE = 5;
const MODE_RAWX = 6;
const MODE_RAWY = 7;
const MODE_RAWXY = 8;
const MODE_SHIFTX = 9;
const MODE_SHIFTY = 10;
const MODE_SHIFTXY = 11;
const MODE_BLUR_RING = 12;
const MODE_BLUR_RING2 = 13;
const MODE_SHIFTNSTRETCH = 14;
const MODE_SHIFTTANGENT = 15;
const MODE_SHIFTTHETA = 16;
const MODE_XMIRROR = 17;
const MODE_XYMIRROR = 18;
const MODE_SPHERICAL2 = 19;
// Ideas:
// Rectangle
// Grid
// Spiral grid
// Ortho?
// Failed experiments (were 12-18)
const MODE_SINUSOIDAL = 1001;
const MODE_SWIRL = 1002;
const MODE_HYPERBOLIC = 1003;
const MODE_JULIA = 1004;
const MODE_DISC = 1005;
const MODE_RINGS = 1006;
const MODE_CYLINDER = 1007;
// -------------------------------------------------------------
// Wave types
const WAVE_SIN = 0;
const WAVE_COS = 1;
const WAVE_SQUARE = 2;
const WAVE_SAW = 3;
const WAVE_TRIANGLE = 4;
const WAVE_CONCAVE = 5;
const WAVE_CONVEX = 6;
const WAVE_NGON = 7;
// New wave types in v2
const WAVE_INGON = 8;
// -------------------------------------------------------------
// Layer types
const LAYER_ADD = 0;
const LAYER_MULT = 1;
const LAYER_MAX = 2;
const LAYER_MIN = 3;
// -------------------------------------------------------------
// Sine/Cosine interpretation types
const SINCOS_MULTIPLY = 0;
const SINCOS_MIXIN = 1;

class SynthFunc extends VariationShaderFunc2D {
    PARAM_A = "a"
    PARAM_MODE = "mode"
    PARAM_POWER = "power"
    PARAM_MIX = "mix"
    PARAM_SMOOTH = "smooth"

    PARAM_B = "b"
    PARAM_B_TYPE = "b_type"
    PARAM_B_SKEW = "b_skew"
    PARAM_B_FRQ = "b_frq"
    PARAM_B_PHS = "b_phs"
    PARAM_B_LAYER = "b_layer"

    PARAM_C = "c"
    PARAM_C_TYPE = "c_type"
    PARAM_C_SKEW = "c_skew"
    PARAM_C_FRQ = "c_frq"
    PARAM_C_PHS = "c_phs"
    PARAM_C_LAYER = "c_layer"

    PARAM_D = "d"
    PARAM_D_TYPE = "d_type"
    PARAM_D_SKEW = "d_skew"
    PARAM_D_FRQ = "d_frq"
    PARAM_D_PHS = "d_phs"
    PARAM_D_LAYER = "d_layer"

    PARAM_E = "e"
    PARAM_E_TYPE = "e_type"
    PARAM_E_SKEW = "e_skew"
    PARAM_E_FRQ = "e_frq"
    PARAM_E_PHS = "e_phs"
    PARAM_E_LAYER = "e_layer"

    PARAM_F = "f"
    PARAM_F_TYPE = "f_type"
    PARAM_F_SKEW = "f_skew"
    PARAM_F_FRQ = "f_frq"
    PARAM_F_PHS = "f_phs"
    PARAM_F_LAYER = "f_layer"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_MODE, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: -2.00 },
            { name: this.PARAM_MIX, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SMOOTH, type: VariationParamType.VP_NUMBER, initialValue: 0 },

            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_B_TYPE, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_B_SKEW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_B_FRQ, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_B_PHS, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_B_LAYER, type: VariationParamType.VP_NUMBER, initialValue: 0 },

            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_C_TYPE, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_C_SKEW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_C_FRQ, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_C_PHS, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_C_LAYER, type: VariationParamType.VP_NUMBER, initialValue: 0 },

            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_D_TYPE, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_D_SKEW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_D_FRQ, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_D_PHS, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_D_LAYER, type: VariationParamType.VP_NUMBER, initialValue: 0 },

            { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_E_TYPE, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_E_SKEW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_E_FRQ, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_E_PHS, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_E_LAYER, type: VariationParamType.VP_NUMBER, initialValue: 0 },

            { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_F_TYPE, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_F_SKEW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_F_FRQ, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_F_PHS, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_F_LAYER, type: VariationParamType.VP_NUMBER, initialValue: 0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* synth by slobo777, http://slobo777.deviantart.com/art/Synth-V2-128594088 */
        return `{
          float amount = float(${variation.amount});
          SynthParams params;
          params.a = float(${variation.params.get(this.PARAM_A)});
          params.mode = int(${variation.params.get(this.PARAM_MODE)});
          params.power = float(${variation.params.get(this.PARAM_POWER)});
          params.mix = float(${variation.params.get(this.PARAM_MIX)});
          params.smooth = int(${variation.params.get(this.PARAM_SMOOTH)});
         
          params.b = float(${variation.params.get(this.PARAM_B)});
          params.b_type = int(${variation.params.get(this.PARAM_B_TYPE)});
          params.b_skew = float(${variation.params.get(this.PARAM_B_SKEW)});
          params.b_frq = float(${variation.params.get(this.PARAM_B_FRQ)});
          params.b_phs = float(${variation.params.get(this.PARAM_B_PHS)});
          params.b_layer = int(${variation.params.get(this.PARAM_B_LAYER)});
         
          params.c = float(${variation.params.get(this.PARAM_C)});
          params.c_type = int(${variation.params.get(this.PARAM_C_TYPE)});
          params.c_skew = float(${variation.params.get(this.PARAM_C_SKEW)});
          params.c_frq = float(${variation.params.get(this.PARAM_C_FRQ)});
          params.c_phs = float(${variation.params.get(this.PARAM_C_PHS)});
          params.c_layer = int(${variation.params.get(this.PARAM_C_LAYER)});
          
          params.d = float(${variation.params.get(this.PARAM_D)});
          params.d_type = int(${variation.params.get(this.PARAM_D_TYPE)});
          params.d_skew = float(${variation.params.get(this.PARAM_D_SKEW)});
          params.d_frq = float(${variation.params.get(this.PARAM_D_FRQ)});
          params.d_phs = float(${variation.params.get(this.PARAM_D_PHS)});
          params.d_layer = int(${variation.params.get(this.PARAM_D_LAYER)});
          
          params.e = float(${variation.params.get(this.PARAM_E)});
          params.e_type = int(${variation.params.get(this.PARAM_E_TYPE)});
          params.e_skew = float(${variation.params.get(this.PARAM_E_SKEW)});
          params.e_frq = float(${variation.params.get(this.PARAM_E_FRQ)});
          params.e_phs = float(${variation.params.get(this.PARAM_E_PHS)});
          params.e_layer = int(${variation.params.get(this.PARAM_E_LAYER)});
          
          params.f = float(${variation.params.get(this.PARAM_F)});
          params.f_type = int(${variation.params.get(this.PARAM_F_TYPE)});
          params.f_skew = float(${variation.params.get(this.PARAM_F_SKEW)});
          params.f_frq = float(${variation.params.get(this.PARAM_F_FRQ)});
          params.f_phs = float(${variation.params.get(this.PARAM_F_PHS)});
          params.f_layer = int(${variation.params.get(this.PARAM_F_LAYER)});
          
          float Vx, Vy, radius, theta; 
          float theta_factor; 
          float mu;       
          if(params.mode==${MODE_RAWCIRCLE}) { 
              Vx = _tx;
              Vy = _ty;
              radius = sqrt(Vx * Vx + Vy * Vy);
              theta = atan2(Vx, Vy);               
              theta_factor = synth_value(theta, params);
              radius = interpolate(radius, theta_factor, params.smooth);
              float s = sin(theta);
              float c = cos(theta);                 
              _vx += amount * radius * s;
              _vy += amount * radius * c;
           }
           else if(params.mode==${MODE_RAWY}) {
              Vx = _tx;
              Vy = _ty;
              theta_factor = synth_value(Vx, params);
              _vx += amount * Vx;
              _vy += amount * interpolate(Vy, theta_factor, params.smooth);
           }
           else if(params.mode==${MODE_RAWX}) {
              Vx = _tx;
              Vy = _ty;  
              theta_factor = synth_value(Vy, params);             
              _vx += amount * interpolate(Vx, theta_factor, params.smooth);
              _vy += amount * Vy;
            }
            else if(params.mode==${MODE_RAWXY}) {   
              Vx = _tx;
              Vy = _ty;            
              theta_factor = synth_value(Vy, params);
              _vx += amount * interpolate(Vx, theta_factor, params.smooth);      
              theta_factor = synth_value(Vx, params);
              _vy += amount * interpolate(Vy, theta_factor, params.smooth);
            }
            else if(params.mode==${MODE_SPHERICAL}) {
                Vx = _tx;
                Vy = _ty;
                radius = pow(Vx * Vx + Vy * Vy + EPSILON, (params.power + 1.0) / 2.0);
                theta = atan2(Vx, Vy);
                theta_factor = synth_value(theta, params);
                radius = interpolate(radius, theta_factor, params.smooth);
                float s = sin(theta);
                float c = cos(theta);
                _vx += amount * radius * s;
                _vy += amount * radius * c;
            }
            else if(params.mode==${MODE_BUBBLE}) {
              Vx = _tx;
              Vy = _ty;
              radius = sqrt(Vx * Vx + Vy * Vy) / ((Vx * Vx + Vy * Vy) / 4.0 + 1.0);
              theta = atan2(Vx, Vy);
              theta_factor = synth_value(theta, params);
              radius = interpolate(radius, theta_factor, params.smooth);
              float s = sin(theta);
              float c = cos(theta);   
              _vx += amount * radius * s;
              _vy += amount * radius * c;
            }
            else if(params.mode==${MODE_BLUR_LEGACY}) {
              radius = (rand8(tex, rngState) + rand8(tex, rngState) + 0.002 * rand8(tex, rngState)) / 2.002;
              theta = 2.0 * M_PI * rand8(tex, rngState) - M_PI;
              Vx = radius * sin(theta);
              Vy = radius * cos(theta);
              radius = pow(radius * radius + EPSILON, params.power / 2.0); 
              theta_factor = synth_value(theta, params);
              radius = amount * interpolate(radius, theta_factor, params.smooth);
              _vx += Vx * radius;
              _vy += Vy * radius;
            }
            else if(params.mode==${MODE_BLUR_NEW}) {
              radius = 0.5 * (rand8(tex, rngState) + rand8(tex, rngState));
              theta = 2.0 * M_PI * rand8(tex, rngState) - M_PI;
              radius = pow(radius * radius + EPSILON, -params.power / 2.0);         
              theta_factor = synth_value(theta, params);
              radius = interpolate(radius, theta_factor, params.smooth);
              float s = sin(theta);
              float c = cos(theta);
              _vx += amount * radius * s;
              _vy += amount * radius * c;
            }
            else if(params.mode==${MODE_BLUR_RING}) { 
              radius = 1.0 + 0.1 * (rand8(tex, rngState) + rand8(tex, rngState) - 1.0) * params.power;
              theta = 2.0 * M_PI * rand8(tex, rngState) - M_PI;
              theta_factor = synth_value(theta, params);
              radius = interpolate(radius, theta_factor, params.smooth);
              float s = sin(theta);
              float c = cos(theta);
              _vx += amount * radius * s;
              _vy += amount * radius * c;
            }
            else if(params.mode==${MODE_BLUR_RING2}) {
              theta = 2.0 * M_PI * rand8(tex, rngState) - M_PI;
              radius = pow(rand8(tex, rngState) + EPSILON, params.power);
              radius = synth_value(theta, params) + 0.1 * radius;
              float s = sin(theta);
              float c = cos(theta);
              _vx += amount * radius * s;
              _vy += amount * radius * c;
            }
            else if(params.mode==${MODE_SHIFTNSTRETCH}) { 
              Vx = _tx;
              Vy = _ty;
              radius = pow(Vx * Vx + Vy * Vy + EPSILON, params.power / 2.0);
              theta = atan2(Vx, Vy) - 1.0 + synth_value(radius, params);
              float s = sin(theta);
              float c = cos(theta);
              _vx += amount * radius * s;
              _vy += amount * radius * c;
            }
            else if(params.mode==${MODE_SHIFTTANGENT}) {      
              Vx = _tx;
              Vy = _ty;
              radius = pow(Vx * Vx + Vy * Vy + EPSILON, params.power / 2.0);
              theta = atan2(Vx, Vy);
              float  s = sin(theta);
              float  c = cos(theta);
              mu = synth_value(radius, params) - 1.0;
              Vx += mu * c;
              Vy -= mu * s;   
              _vx += amount * Vx;
              _vy += amount * Vy;
            }
            else if(params.mode==${MODE_SHIFTTHETA}) { 
              Vx = _tx;
              Vy = _ty;
              radius = pow(Vx * Vx + Vy * Vy + EPSILON, params.power / 2.0);
              theta = atan2(Vx, Vy) - 1.0 + synth_value(radius, params);
              float s = sin(theta);
              float c = cos(theta);
              radius = sqrt(Vx * Vx + Vy * Vy);
              _vx += amount * radius * s;
              _vy += amount * radius * c;
            }
            else if(params.mode==${MODE_BLUR_ZIGZAG}) {
              Vy = 1.0 + 0.1 * (rand8(tex, rngState) + rand8(tex, rngState) - 1.0) * params.power;
              theta = 2.0 * asin((rand8(tex, rngState) - 0.5) * 2.0);  
              theta_factor = synth_value(theta, params);
              Vy = interpolate(Vy, theta_factor, params.smooth);
              _vx += amount * (theta / M_PI);
              _vy += amount * (Vy - 1.0);
            }
            else if(params.mode==${MODE_SHIFTX}) {
              Vx = _tx;
              Vy = _ty;
              _vx += amount * (Vx + synth_value(Vy, params) - 1.0);
              _vy += amount * Vy;
            }
            else if(params.mode==${MODE_SHIFTY}) { 
              Vx = _tx;
              Vy = _ty;
              _vx += amount * Vx;
              _vy += amount * (Vy + synth_value(Vx, params) - 1.0);
            }
            else if(params.mode==${MODE_SHIFTXY}) { 
              Vx = _tx;
              Vy = _ty;
              _vx += amount * (Vx + synth_value(Vy, params) - 1.0);
              _vy += amount * (Vy + synth_value(Vx, params) - 1.0);
            }
            else if(params.mode==${MODE_SINUSOIDAL}) { 
              Vx = _tx;
              Vy = _ty;
              _vx += amount * (synth_value(Vx, params) - 1.0 + (1.0 - params.mix) * sin(Vx));
              _vy += amount * (synth_value(Vy, params) - 1.0 + (1.0 - params.mix) * sin(Vy));
            }
            else if(params.mode==${MODE_SWIRL}) { 
              Vx = _tx;
              Vy = _ty;
              radius = pow(Vx * Vx + Vy * Vy + EPSILON, params.power / 2.0);
              float s, c;    
              synthsincos(radius, params.smooth, params, s, c);
              _vx += amount * (s * Vx - c * Vy);
              _vy += amount * (c * Vx + s * Vy);
             }
             else if(params.mode==${MODE_HYPERBOLIC}) { 
               Vx = _tx;
               Vy = _ty;
               radius = pow(Vx * Vx + Vy * Vy + EPSILON, params.power / 2.0);
               theta = atan2(Vx, Vy);
               float s, c;
               synthsincos(theta, params.smooth, params, s,c);
               _vx += amount * s / radius;
               _vy += amount * c * radius;
             }
             else if(params.mode==${MODE_JULIA}) { 
               Vx = _tx;
               Vy = _ty;
               radius = pow(Vx * Vx + Vy * Vy + EPSILON, params.power / 4.0);
               theta = atan2(Vx, Vy) / 2.0;
               if (rand8(tex, rngState) < 0.5)
                 theta += M_PI;
               float s, c;
               synthsincos(theta, params.smooth, params, s, c);
               _vx += amount * radius * c;
               _vy += amount * radius * s;
             }
             else if(params.mode==${MODE_DISC}) { 
               Vx = _tx;
               Vy = _ty;
               theta = atan2(Vx, Vy) / M_PI;
               radius = M_PI * pow(Vx * Vx + Vy * Vy + EPSILON, params.power / 2.0);
               float s, c;
               synthsincos(radius, params.smooth, params, s, c);
               _vx = amount * s * theta;
               _vy = amount * c * theta;
             }  
             else if(params.mode==${MODE_RINGS}) { 
               Vx = _tx;
               Vy = _ty;
               radius = sqrt(Vx * Vx + Vy * Vy);
               theta = atan2(Vx, Vy);
               mu = params.power * params.power + EPSILON;
               radius += -2.0 * mu * float(int((radius + mu) / (2.0 * mu))) + radius * (1.0 - mu);
               float s, c;
               synthsincos(theta, params.smooth, params, s, c);
               _vx += amount * s * radius;
               _vy += amount * c * radius;
             }
             else if(params.mode==${MODE_CYLINDER}) { 
               Vx = _tx;
               Vy = _ty;
               radius = pow(Vx * Vx + Vy * Vy + EPSILON, params.power / 2.0);
               float s, c;
               synthsincos(Vx, params.smooth, params, s, c);
               _vx += amount * radius * s;
               _vy += amount * radius * Vy;
             }
             else if(params.mode==${MODE_XMIRROR}) { 
               Vx = _tx;
               Vy = _ty; 
               mu = synth_value(Vx, params) - 1.0;
               Vy = 2.0 * mu - Vy;
               _vx += amount * Vx;
               _vy += amount * Vy;
             }
             else if(params.mode==${MODE_XYMIRROR}) { 
               Vx = _tx;
               Vy = _ty;
               mu = synth_value(Vx, params) - 1.0;
               radius = synth_value(Vy, params) - 1.0;
               Vy = 2.0 * mu - Vy;
               Vx = 2.0 * radius - Vx;
               _vx += amount * Vx;
               _vy += amount * Vy;
             }
             else if(params.mode==${MODE_SPHERICAL2}) { 
               Vx = _tx;
               Vy = _ty;
               radius = sqrt(Vx * Vx + Vy * Vy);
               theta = atan2(Vx, Vy);
               theta_factor = synth_value(theta, params);
               radius = interpolate(radius, theta_factor, params.smooth);
               radius = pow(radius, params.power);
               float s = sin(theta);
               float c = cos(theta);
               _vx += amount * radius * s;
               _vy += amount * radius * c;
             }
        }`;
    }

    get name(): string {
        return "synth";
    }

    get funcDependencies(): string[] {
        return [LIB_SYNTH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function register2DSynthVar() {
    VariationMathFunctions.registerFunction(LIB_SYNTH,
      `      
        struct SynthParams {
          float a;
          int mode;
          float power;
          float mix;
          int smooth;
         
          float b;
          int b_type;
          float b_skew;
          float b_frq;
          float b_phs;
          int b_layer;
         
          float c;
          int c_type;
          float c_skew;
          float c_frq;
          float c_phs; 
          int c_layer;
          
          float d;
          int d_type;
          float d_skew;
          float d_frq;
          float d_phs;
          int d_layer;
          
          float e;
          int e_type;
          float e_skew;
          float e_frq;
          float e_phs;
          int e_layer;
          
          float f;
          int f_type;
          float f_skew;
          float f_frq;
          float f_phs;
          int f_layer;
        };
      // -------------------------------------------------------------
      // synth_value calculates the wave height y from theta, which is an abstract
      // angle that could come from any other calculation - for circular modes
      // it will be the angle between the positive y axis and the vector from
      // the origin to the pont i.e. atan2(x,y)
      // You must call the argument "vp".
      float synth_value(float theta, SynthParams params) {
        float theta_factor = params.a;
        float x = 0.0, y, z;
        if (params.b != 0.0) {
          z = params.b_phs + theta * params.b_frq;
          y = z / (2.0 * M_PI);
          y -= floor(y);
    
          // y is in range 0 - 1. Now skew according to synth_b_skew
          if (params.b_skew != 0.0) {
            z = 0.5 + 0.5 * params.b_skew;
            if (y > z) {
              // y is 0.5 if equals z, up to 1.0
              y = 0.5 + 0.5 * (y - z) / (1.0 - z + EPSILON);
            } else {
              // y is 0.5 if equals z, down to 0.0
              y = 0.5 - 0.5 * (z - y) / (z + EPSILON);
            }
          }
  
          if(params.b_type==${WAVE_SIN}) {
              x = sin(y * 2.0 * M_PI);
          }
          else if(params.b_type==${WAVE_COS}) {
              x = cos(y * 2.0 * M_PI);
          }
          else if(params.b_type==${WAVE_SQUARE}) {
              x = y > 0.5 ? 1.0 : -1.0;
          }
          else if(params.b_type==${WAVE_SAW}) {
              x = 1.0 - 2.0 * y;
          }
          else if(params.b_type==${WAVE_TRIANGLE}) {
              x = y > 0.5 ? 3.0 - 4.0 * y : 2.0 * y - 1.0;
          }
          else if(params.b_type==${WAVE_CONCAVE}) {
              x = 8.0 * (y - 0.5) * (y - 0.5) - 1.0;
          }
          else if(params.b_type==${WAVE_CONVEX}) {
              x = 2.0 * sqrt(y) - 1.0;
          }
          else if(params.b_type==${WAVE_NGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.b_frq);
              x = (1.0 / (cos(y) + EPSILON) - 1.0);
          }
          else if(params.b_type==${WAVE_INGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.b_frq);
              z = cos(y);
              x = z / (1.0 + EPSILON - z);
          }
    
          if(params.b_layer==${LAYER_ADD}) {
              theta_factor += params.b * x;
          }
          else if(params.b_layer==${LAYER_MULT}) {
              theta_factor *= (1.0 + params.b * x);
          }
          else if(params.b_layer==${LAYER_MAX}) {
              z = params.a + params.b * x;
              theta_factor = (theta_factor > z ? theta_factor : z);
          }
          else if(params.b_layer==${LAYER_MIN}) {
              z = params.a + params.b * x;
              theta_factor = (theta_factor < z ? theta_factor : z);
          }   
        }
    
        if (params.c != 0.0) {
          z = params.c_phs + theta * params.c_frq;
          y = z / (2.0 * M_PI);
          y -= floor(y);
          // y is in range 0 - 1. Now skew according to synth_c_skew
          if (params.c_skew != 0.0) {
            z = 0.5 + 0.5 * params.c_skew;
            if (y > z) {
              // y is 0.5 if equals z, up to 1.0
              y = 0.5 + 0.5 * (y - z) / (1.0 - z + EPSILON);
            } else {
              // y is 0.5 if equals z, down to 0.0
              y = 0.5 - 0.5 * (z - y) / (z + EPSILON);
            }
          }
  
          if(params.c_type==${WAVE_SIN}) {
              x = sin(y * 2.0 * M_PI);
          }
          else if(params.c_type==${WAVE_COS}) {
              x = cos(y * 2.0 * M_PI);
          }
          else if(params.c_type==${WAVE_SQUARE}) {
              x = y > 0.5 ? 1.0 : -1.0;
          }
          else if(params.c_type==${WAVE_SAW}) {
              x = 1.0 - 2.0 * y;
          }
          else if(params.c_type==${WAVE_TRIANGLE}) {
              x = y > 0.5 ? 3.0 - 4.0 * y : 2.0 * y - 1.0;
          }
          else if(params.c_type==${WAVE_CONCAVE}) {
              x = 8.0 * (y - 0.5) * (y - 0.5) - 1.0;
          }
          else if(params.c_type==${WAVE_CONVEX}) {
              x = 2.0 * sqrt(y) - 1.0;
          }
          else if(params.c_type==${WAVE_NGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.c_frq);
              x = (1.0 / (cos(y) + EPSILON) - 1.0);
          }
          else if(params.c_type==${WAVE_INGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.c_frq);
              z = cos(y);
              x = z / (1.0 + EPSILON - z);
          }
          
         if(params.c_layer==${LAYER_ADD}) {
              theta_factor += params.c * x;
          }
          else if(params.c_layer==${LAYER_MULT}) {
              theta_factor *= (1.0 + params.c * x);
          }
          else if(params.c_layer==${LAYER_MAX}) {
              z = params.a + params.c * x;
              theta_factor = (theta_factor > z ? theta_factor : z);
          }
          else if(params.c_layer==${LAYER_MIN}) {
              z = params.a + params.c * x;
              theta_factor = (theta_factor < z ? theta_factor : z);
          }   
        }

        if (params.d != 0.0) {
          z = params.d_phs + theta * params.d_frq;
          y = z / (2.0 * M_PI);
          y -= floor(y);
          // y is in range 0 - 1. Now skew according to synth_d_skew
          if (params.d_skew != 0.0) {
            z = 0.5 + 0.5 * params.d_skew;
            if (y > z) {
              // y is 0.5 if equals z, up to 1.0
              y = 0.5 + 0.5 * (y - z) / (1.0 - z + EPSILON);
            } else {
              // y is 0.5 if equals z, down to 0.0
              y = 0.5 - 0.5 * (z - y) / (z + EPSILON);
            }
          }
    
          if(params.d_type==${WAVE_SIN}) {
              x = sin(y * 2.0 * M_PI);
          }
          else if(params.d_type==${WAVE_COS}) {
              x = cos(y * 2.0 * M_PI);
          }
          else if(params.d_type==${WAVE_SQUARE}) {
              x = y > 0.5 ? 1.0 : -1.0;
          }
          else if(params.d_type==${WAVE_SAW}) {
              x = 1.0 - 2.0 * y;
          }
          else if(params.d_type==${WAVE_TRIANGLE}) {
              x = y > 0.5 ? 3.0 - 4.0 * y : 2.0 * y - 1.0;
          }
          else if(params.d_type==${WAVE_CONCAVE}) {
              x = 8.0 * (y - 0.5) * (y - 0.5) - 1.0;
          }
          else if(params.d_type==${WAVE_CONVEX}) {
              x = 2.0 * sqrt(y) - 1.0;
          }
          else if(params.d_type==${WAVE_NGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.d_frq);
              x = (1.0 / (cos(y) + EPSILON) - 1.0);
          }
          else if(params.d_type==${WAVE_INGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.d_frq);
              z = cos(y);
              x = z / (1.0 + EPSILON - z);
          }
    
          if(params.d_layer==${LAYER_ADD}) {
              theta_factor += params.d * x;
          }
          else if(params.d_layer==${LAYER_MULT}) {
              theta_factor *= (1.0 + params.d * x);
          }
          else if(params.d_layer==${LAYER_MAX}) {
              z = params.a + params.d * x;
              theta_factor = (theta_factor > z ? theta_factor : z);
          }
          else if(params.d_layer==${LAYER_MIN}) {
              z = params.a + params.d * x;
              theta_factor = (theta_factor < z ? theta_factor : z);
          }   
        }

    
        if (params.e != 0.0) {
          z = params.e_phs + theta * params.e_frq;
          y = z / (2.0 * M_PI);
          y -= floor(y);
          // y is in range 0 - 1. Now skew according to synth_e_skew
          if (params.e_skew != 0.0) {
            z = 0.5 + 0.5 * params.e_skew;
            if (y > z) {
              // y is 0.5 if equals z, up to 1.0
              y = 0.5 + 0.5 * (y - z) / (1.0 - z + EPSILON);
            } else {
              // y is 0.5 if equals z, down to 0.0
              y = 0.5 - 0.5 * (z - y) / (z + EPSILON);
            }
          }
          
          if(params.e_type==${WAVE_SIN}) {
              x = sin(y * 2.0 * M_PI);
          }
          else if(params.e_type==${WAVE_COS}) {
              x = cos(y * 2.0 * M_PI);
          }
          else if(params.e_type==${WAVE_SQUARE}) {
              x = y > 0.5 ? 1.0 : -1.0;
          }
          else if(params.e_type==${WAVE_SAW}) {
              x = 1.0 - 2.0 * y;
          }
          else if(params.e_type==${WAVE_TRIANGLE}) {
              x = y > 0.5 ? 3.0 - 4.0 * y : 2.0 * y - 1.0;
          }
          else if(params.e_type==${WAVE_CONCAVE}) {
              x = 8.0 * (y - 0.5) * (y - 0.5) - 1.0;
          }
          else if(params.e_type==${WAVE_CONVEX}) {
              x = 2.0 * sqrt(y) - 1.0;
          }
          else if(params.e_type==${WAVE_NGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.e_frq);
              x = (1.0 / (cos(y) + EPSILON) - 1.0);
          }
          else if(params.e_type==${WAVE_INGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.e_frq);
              z = cos(y);
              x = z / (1.0 + EPSILON - z);
          }
          
          if(params.e_layer==${LAYER_ADD}) {
              theta_factor += params.e * x;
          }
          else if(params.e_layer==${LAYER_MULT}) {
              theta_factor *= (1.0 + params.e * x);
          }
          else if(params.e_layer==${LAYER_MAX}) {
              z = params.a + params.e * x;
              theta_factor = (theta_factor > z ? theta_factor : z);
          }
          else if(params.e_layer==${LAYER_MIN}) {
              z = params.a + params.e * x;
              theta_factor = (theta_factor < z ? theta_factor : z);
          }   
        }

        if (params.f != 0.0) {
          z = params.f_phs + theta * params.f_frq;
          y = z / (2.0 * M_PI);
          y -= floor(y);
          // y is in range 0 - 1. Now skew according to synth_f_skew
          if (params.f_skew != 0.0) {
            z = 0.5 + 0.5 * params.f_skew;
            if (y > z) {
              // y is 0.5 if equals z, up to 1.0
              y = 0.5 + 0.5 * (y - z) / (1.0 - z + EPSILON);
            } else {
              // y is 0.5 if equals z, down to 0.0
              y = 0.5 - 0.5 * (z - y) / (z + EPSILON);
            }
          }
          
          if(params.f_type==${WAVE_SIN}) {
              x = sin(y * 2.0 * M_PI);
          }
          else if(params.f_type==${WAVE_COS}) {
              x = cos(y * 2.0 * M_PI);
          }
          else if(params.f_type==${WAVE_SQUARE}) {
              x = y > 0.5 ? 1.0 : -1.0;
          }
          else if(params.f_type==${WAVE_SAW}) {
              x = 1.0 - 2.0 * y;
          }
          else if(params.f_type==${WAVE_TRIANGLE}) {
              x = y > 0.5 ? 3.0 - 4.0 * y : 2.0 * y - 1.0;
          }
          else if(params.f_type==${WAVE_CONCAVE}) {
              x = 8.0 * (y - 0.5) * (y - 0.5) - 1.0;
          }
          else if(params.f_type==${WAVE_CONVEX}) {
              x = 2.0 * sqrt(y) - 1.0;
          }
          else if(params.f_type==${WAVE_NGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.f_frq);
              x = (1.0 / (cos(y) + EPSILON) - 1.0);
          }
          else if(params.e_type==${WAVE_INGON}) {
              y -= 0.5;
              y *= (2.0 * M_PI / params.f_frq);
              z = cos(y);
              x = z / (1.0 + EPSILON - z);
          }  
       
          if(params.f_layer==${LAYER_ADD}) {
              theta_factor += params.f * x;
          }
          else if(params.f_layer==${LAYER_MULT}) {
              theta_factor *= (1.0 + params.f * x);
          }
          else if(params.f_layer==${LAYER_MAX}) {
              z = params.a + params.f * x;
              theta_factor = (theta_factor > z ? theta_factor : z);
          }
          else if(params.f_layer==${LAYER_MIN}) {
              z = params.a + params.f * x;
              theta_factor = (theta_factor < z ? theta_factor : z);
          }   
        }
        // Mix is applied here, assuming 1.0 to be the "flat" line for legacy support
        return theta_factor * params.mix + (1.0 - params.mix);
      }

     // Mapping function y = fn(x) based on quadratic Bezier curves for smooth type 1
     // Returns close to y = x for high/low values of x, y = m when x = 1.0, and
     // something in-between y = m*x and y = x lines when x is close-ish to 1.0
     // Function always has slope of 0.0 or greater, so no x' values "overlap"
     float bezier_quad_map(float x, float m) {
        float a = 1.0; // a is used to control sign of result
        float t = 0.0; // t is the Bezier curve parameter
        // Simply reflect in the y axis for negative values
        if (m < 0.0) {
          m = -m;
          a = -1.0;
        }
        if (x < 0.0) {
          x = -x;
          a = -a;
        }
        // iM is "inverse m" used in a few places below
        float iM = 1.0e10;
        if (m > 1.0e-10) {
          iM = 1.0 / m;
        }
    
        float L = (2.0 - m) > 2.0 * m ? (2.0 - m) : 2.0 * m;
    
        // "Non Curved"
        // Covers x >= L, or always true if m == 1.0
        // y = x  i.e. not distorted
        if ((x > L) || (m == 1.0)) {
          return a * x;
        }
    
        if ((m < 1.0) && (x <= 1.0)) {
          // Bezier Curve #1
          // Covers 0 <= $m <= 1.0, 0 <= $x <= 1.0
          // Control points are (0,0), (m,m) and (1,m)
    
          t = x; // Special case when m == 0.5
          if ((m - 0.5) * (m - 0.5) > 1.0e-10) {
            t = (-1.0 * m + sqrt(m * m + (1.0 - 2.0 * m) * x)) / (1.0 - 2.0 * m);
          }
    
          return a * (x + (m - 1.0) * t * t);
        }
    
        if ((1.0 < m) && (x <= 1.0)) {
          // Bezier Curve #2
          // Covers m >= 1.0, 0 <= x <= 1.0
          // Control points are (0,0), (iM,iM) and (1,m)
    
          t = x; // Special case when m == 2
          if ((m - 2.0) * (m - 2.0) > 1.0e-10) {
            t = (-1.0 * iM + sqrt(iM * iM + (1.0 - 2.0 * iM) * x)) / (1.0 - 2.0 * iM);
          }
          return a * (x + (m - 1.0) * t * t);
        }
    
        // Deliberate divide by zero to rule out code causing a bug
    
        if (m < 1.0) {
          // Bezier Curve #3
          // Covers 0 <= m <= 1.0, 1 <= x <= L
          // Control points are (1,m), (1,1) and (L,L)
          // (L is x value (>1) where we re-join y = x line, and is maximum( iM, 2 * m )
          t = sqrt((x - 1.0) / (L - 1.0));
          return a * (x + (m - 1.0) * t * t + 2.0 * (1.0 - m) * t + (m - 1.0));
        }
        // Curve #4
        // Covers 1.0 <= m, 1 <= x <= L
        // Control points are (1,m), (m,m) and (L,L)
        // (L is x value (>1) where we re-join y = x line, and is maximum( iM, 2 *  m )
        t = (1.0 - m) + sqrt((m - 1.0) * (m - 1.0) + (x - 1.0));
        return a * (x + (m - 1.0) * t * t - 2.0 * (m - 1.0) * t + (m - 1.0));
      }
      
      // Handle potentially many types of interpolation routine in future  . . .
      float interpolate(float x, float m, int lerp_type) {
        if(lerp_type==${LERP_LINEAR}) {
          return x * m;
        }
        else if(lerp_type==${LERP_BEZIER}) {
          return bezier_quad_map(x, m);
        }
        return x * m;
      }

      void synthsincos(float theta, int sine_type, SynthParams params, out float sint, out float cost) {
        sint = sin(theta);
        cost = cos(theta);
        if(sine_type==${SINCOS_MULTIPLY}) {
            sint = sint * synth_value(theta, params);
            cost = cost * synth_value(theta + M_PI / 2.0, params);
        }
        else if(sine_type==${SINCOS_MIXIN}) {
            sint = (1.0 - params.mix) * sint + (synth_value(theta, params) - 1.0);
            cost = (1.0 - params.mix) * cost + (synth_value(theta + M_PI / 2.0, params) - 1.0);
        }
      }     
      
      
    `)

    VariationShaders.registerVar(new SynthFunc())
}
