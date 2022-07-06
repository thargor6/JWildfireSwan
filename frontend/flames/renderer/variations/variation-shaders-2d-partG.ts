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

import {VariationParam, VariationParamType, VariationShaderFunc2D, VariationTypes} from './variation-shader-func';
import {VariationShaders} from 'Frontend/flames/renderer/variations/variation-shaders';
import {RenderVariation, RenderXForm} from 'Frontend/flames/model/render-flame';
import {
    FUNC_ACOSH,
    FUNC_COSH, FUNC_ERF, FUNC_LGAMMA, FUNC_HYPOT,
    FUNC_MODULO,
    FUNC_RINT,
    FUNC_ROUND,
    FUNC_SGN,
    FUNC_SINH,
    FUNC_SQRT1PM1
} from 'Frontend/flames/renderer/variations/variation-math-functions';
import {M_PI} from "Frontend/flames/renderer/mathlib";

/*
  be sure to import this class somewhere and call registerVars_2D_PartG()
 */
class GlynniaFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // glynnia my Michael Faber, http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970
        return `{
            float amount = ${variation.amount.toWebGl()};
            float _vvar2 = amount * sqrt(2.0) / 2.0; 
            float r = sqrt(sqr(_tx) + sqr(_ty));
            float d;
            if (r >= 1.0) {
              if (rand8(tex, rngState) > 0.5) {
                d = sqrt(r + _tx);
                if (d != 0.0) {
                  _vx += _vvar2 * d;
                  _vy -= _vvar2 / d * _ty; 
                }
              } else {
                d = r + _tx;
                float dx = sqrt(r * (sqr(_ty) + sqr(d)));
                if (dx != 0.0) {
                  r = amount / dx;
                  _vx += r * d;
                  _vy += r * _ty;                   
                }
              }
            } else {
              if (rand8(tex, rngState) > 0.5) {
                d = sqrt(r + _tx);
                if (d != 0.0) {
                  _vx -= _vvar2 * d;
                  _vy -= _vvar2 / d * _ty;                
                }
              } else {
                d = r + _tx;
                float dx = sqrt(r * (sqr(_ty) + sqr(d)));
                if (dx != 0.0) {
                  r = amount / dx;
                  _vx -= r * d;
                  _vy += r * _ty;               
                }
              }
            }
        }`;
    }

    get name(): string {
        return 'glynnia';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class GlynnSim1Func extends VariationShaderFunc2D {
    PARAM_RADIUS = 'radius'
    PARAM_RADIUS1 = 'radius1'
    PARAM_PHI1 = 'phi1'
    PARAM_THICKNESS = 'thickness'
    PARAM_POW = 'pow'
    PARAM_CONTRAST = 'contrast'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_RADIUS1, type: VariationParamType.VP_FLOAT, initialValue: 0.1 },
            { name: this.PARAM_PHI1, type: VariationParamType.VP_FLOAT, initialValue: 110.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_FLOAT, initialValue: 0.1 },
            { name: this.PARAM_POW, type: VariationParamType.VP_FLOAT, initialValue: 1.5 },
            { name: this.PARAM_CONTRAST, type: VariationParamType.VP_FLOAT, initialValue: 0.50 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* GlynnSim1 by eralex61, http://eralex61.deviantart.com/art/GlynnSim-plugin-112621621 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float radius = ${variation.params.get(this.PARAM_RADIUS)!.toWebGl()};
          float radius1 = ${variation.params.get(this.PARAM_RADIUS1)!.toWebGl()};
          float phi1 = ${variation.params.get(this.PARAM_PHI1)!.toWebGl()};
          float thickness = ${variation.params.get(this.PARAM_THICKNESS)!.toWebGl()};
          float _pow = ${variation.params.get(this.PARAM_POW)!.toWebGl()};
          float contrast = ${variation.params.get(this.PARAM_CONTRAST)!.toWebGl()};
          float a = M_PI * phi1 / 180.0;
          float sinPhi1 = sin(a);
          float cosPhi1 = cos(a);
          float _x1 = radius * cosPhi1;
          float _y1 = radius * sinPhi1;
          float _absPow = abs(_pow); 
          float r = sqrt(_tx * _tx + _ty * _ty);
          float Alpha = radius / r;
          float tp_x, tp_y;
          if (r < radius) { 
            float rr = radius1 * (thickness + (1.0 - thickness) * rand8(tex, rngState));
            float Phi = 2.0 * M_PI * rand8(tex, rngState);
            float sinPhi = sin(Phi);
            float cosPhi = cos(Phi);
            tp_x = rr * cosPhi + _x1;
            tp_y = rr * sinPhi + _y1;
            _vx += amount * tp_x;
            _vy += amount * tp_y;
          } else {
            if (rand8(tex, rngState) > contrast * pow(Alpha, _absPow)) {
              tp_x = _tx;
              tp_y = _ty;
            } else {
              tp_x = Alpha * Alpha * _tx;
              tp_y = Alpha * Alpha * _ty;
            }
            float Z = sqr(tp_x - _x1) + sqr(tp_y - _y1);
            if (Z < radius1 * radius1) { 
              float rr = radius1 * (thickness + (1.0 - thickness) * rand8(tex, rngState));
              float Phi = 2.0 * M_PI * rand8(tex, rngState);
              float sinPhi = sin(Phi);
              float cosPhi = cos(Phi);
              tp_x = rr * cosPhi + _x1;
              tp_y = rr * sinPhi + _y1;
              _vx += amount * tp_x;
              _vy += amount * tp_y;
            } else {
              _vx += amount * tp_x;
              _vy += amount * tp_y;
            }
          } 
        }`;
    }

    get name(): string {
        return 'glynnSim1';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class GlynnSim2Func extends VariationShaderFunc2D {
    PARAM_RADIUS = 'radius'
    PARAM_THICKNESS = 'thickness'
    PARAM_CONTRAST = 'contrast'
    PARAM_POW = 'pow'
    PARAM_PHI1 = 'phi1'
    PARAM_PHI2 = 'phi2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_FLOAT, initialValue: 0.1 },
            { name: this.PARAM_CONTRAST, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_POW, type: VariationParamType.VP_FLOAT, initialValue: 1.5 },
            { name: this.PARAM_PHI1, type: VariationParamType.VP_FLOAT, initialValue: 110.0 },
            { name: this.PARAM_PHI2, type: VariationParamType.VP_FLOAT, initialValue: 150.0 }           ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* GlynnSim2 by eralex61, http://eralex61.deviantart.com/art/GlynnSim-plugin-112621621 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float radius = ${variation.params.get(this.PARAM_RADIUS)!.toWebGl()};
          float thickness = ${variation.params.get(this.PARAM_THICKNESS)!.toWebGl()};
          float contrast = ${variation.params.get(this.PARAM_CONTRAST)!.toWebGl()};
          float _pow = ${variation.params.get(this.PARAM_POW)!.toWebGl()};          
          float phi1 = ${variation.params.get(this.PARAM_PHI1)!.toWebGl()};                    
          float phi2 = ${variation.params.get(this.PARAM_PHI2)!.toWebGl()};
          float _phi10 = M_PI * phi1 / 180.0;
          float _phi20 = M_PI * phi2 / 180.0;
          float _gamma = thickness * (2.0 * radius + thickness) / (radius + thickness);
          float _delta = _phi20 - _phi10;
          float _absPow = abs(_pow);
          float r = sqrt(_tx * _tx + _ty * _ty);
          float Alpha = radius / r;
          float tp_x, tp_y;
          if (r < radius) {
            float rr = radius + thickness - _gamma * rand8(tex, rngState);
            float Phi = _phi10 + _delta * rand8(tex, rngState);
            float sinPhi = sin(Phi);
            float cosPhi = cos(Phi);
            tp_x = r * cosPhi;
            tp_y = r * sinPhi;
            _vx += amount * tp_x;
            _vy += amount * tp_y;
           } 
           else {
             if (rand8(tex, rngState) > contrast * pow(Alpha, _absPow)) {
               _vx += amount * _tx;
               _vy += amount * _ty;
             } else {
               _vx += amount * Alpha * Alpha * _tx;
               _vy += amount * Alpha * Alpha * _ty;
             }
           }  
        }`;
    }

    get name(): string {
        return 'glynnSim2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class GlynnSim3Func extends VariationShaderFunc2D {
    PARAM_RADIUS = 'radius'
    PARAM_THICKNESS = 'thickness'
    PARAM_CONTRAST = 'contrast'
    PARAM_POW = 'pow'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_FLOAT, initialValue: 0.1 },
            { name: this.PARAM_CONTRAST, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_POW, type: VariationParamType.VP_FLOAT, initialValue: 1.5 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* GlynnSim3 by eralex61, http://eralex61.deviantart.com/art/GlynnSim-plugin-112621621 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float radius = ${variation.params.get(this.PARAM_RADIUS)!.toWebGl()};
          float thickness = ${variation.params.get(this.PARAM_THICKNESS)!.toWebGl()};
          float contrast = ${variation.params.get(this.PARAM_CONTRAST)!.toWebGl()};
          float _pow = ${variation.params.get(this.PARAM_POW)!.toWebGl()};          
          float _radius1 = radius + thickness;
          float _radius2 = sqr(radius) / _radius1;
          float _gamma = _radius1 / (_radius1 + _radius2);
          float _absPow = abs(_pow);
          float r = sqrt(_tx * _tx + _ty * _ty);
          float alpha = radius / r;
          if (r < _radius1) {
            float phi = 2.0 * M_PI * rand8(tex, rngState);
            float sinPhi = sin(phi);
            float cosPhi = cos(phi);
            float r;
            if (rand8(tex, rngState) < _gamma) {
              r = _radius1;
            } else {
              r = _radius2;
            }
            float tp_x = r * cosPhi;
            float tp_y = r * sinPhi;
            _vx += amount * tp_x;
            _vy += amount * tp_y;
          } else {
            if (rand8(tex, rngState) > contrast * pow(alpha, _absPow)) {
              _vx += amount * _tx;
              _vy += amount * _ty;
            } else {
              _vx += amount * alpha * alpha * _tx;
              _vy += amount * alpha * alpha * _ty;
            }
          } 
        }`;
    }

    get name(): string {
        return 'glynnSim3';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HadamardFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Hadamard IFS
         *
         * @author Jesus Sosa
         * @date November 4, 2017
         * based on a work of:
         * http://paulbourke.net/fractals/pascaltriangle/roger9.c
         */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x, y;
            if (rand8(tex, rngState) < 0.333) {
              x = _tx / 2.0;
              y = _ty / 2.0;
            } else if (rand8(tex, rngState) < 0.666) {
              x = _ty / 2.0;
              y = -_tx / 2.0 - 0.5;
            } else {
              x = -_ty / 2.0 - 0.5;
              y = _tx / 2.0;
            }
            _vx += x * amount;
            _vy += y * amount;
        }`;
    }

    get name(): string {
        return 'hadamard_js';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HeartFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = sqrt(_tx * _tx + _ty * _ty);
            float angle = _phi;
            float sinr = sin(r * angle);
            float cosr = cos(r * angle);
            r *= amount;
            _vx += r * sinr;
            _vy -= r * cosr;
        }`;
    }

    get name(): string {
        return 'heart';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class GammaFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // "gamma" variation created by zephyrtronium implemented into JWildfire by darkbeam
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += lgamma(hypot(_ty, _tx)) * amount;
          _vy += atan2(_ty, _tx) * amount;;
        }`;
    }

    get name(): string {
        return 'gamma';
    }

    get funcDependencies(): string[] {
        return [FUNC_LGAMMA, FUNC_HYPOT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class GaussianBlurFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = rand8(tex, rngState) * 2.0 * M_PI;
          float sina = sin(r);
          float cosa = cos(r);
          r = amount * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'gaussian_blur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class HeartWFFunc extends VariationShaderFunc2D {
    PARAM_SCALE_X = 'scale_x'
    PARAM_SCALE_T = 'scale_t'
    PARAM_SHIFT_T = 'shift_t'
    PARAM_SCALE_R_LEFT = 'scale_r_left'
    PARAM_SCALE_R_RIGHT = 'scale_r_right'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALE_X, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SCALE_T, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_SHIFT_T, type: VariationParamType.VP_FLOAT, initialValue: 0.0},
            { name: this.PARAM_SCALE_R_LEFT, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_SCALE_R_RIGHT, type: VariationParamType.VP_FLOAT, initialValue: 1.0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float scale_x = ${variation.params.get(this.PARAM_SCALE_X)!.toWebGl()};
            float scale_t = ${variation.params.get(this.PARAM_SCALE_T)!.toWebGl()};
            float shift_t = ${variation.params.get(this.PARAM_SHIFT_T)!.toWebGl()};
            float scale_r_left = ${variation.params.get(this.PARAM_SCALE_R_LEFT)!.toWebGl()};
            float scale_r_right = ${variation.params.get(this.PARAM_SCALE_R_RIGHT)!.toWebGl()}; 
          
            float T_MAX = 60.0;
            float a = atan2(_tx, _ty);
            float r = sqrt(_tx * _tx + _ty * _ty);
            float nx, t;
            if (a < 0.0) {
              t = -a / M_PI * T_MAX * scale_r_left - shift_t;
              if (t > T_MAX) {
                t = T_MAX;
              }
              nx = -0.001 * (-t * t + 40.0 * t + 1200.0) * sin(M_PI * t / 180.0) * r;
            } 
            else {
              t = a / M_PI * T_MAX * scale_r_right - shift_t;
              if (t > T_MAX) {
                t = T_MAX;
              }
              nx = 0.001 * (-t * t + 40.0 * t + 1200.0) * sin(M_PI * t / 180.0) * r;
            }
            float ny = -0.001 * (-t * t + 40.0 * t + 400.0) * cos(M_PI * t / 180.0) * r;
            nx *= scale_x;
            _vx += amount * nx;
            _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'heart_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HenonFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 1.0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Henon by TyrantWave
        // https://www.deviantart.com/tyrantwave/art/Henon-and-Lozi-Apo-Plugins-125039554
        return `{
            float amount = ${variation.amount.toWebGl()};
            float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
            float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
            float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
            _vx += (c - (a * sqr(_tx)) + _ty) * amount;
            _vy += b * _tx * amount;
        }`;
    }

    get name(): string {
        return 'henon';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HoleFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_INSIDE = 'inside'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_INSIDE, type: VariationParamType.VP_INT, initialValue: 0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
            int inside = ${variation.params.get(this.PARAM_INSIDE)!.toWebGl()};
            float alpha = atan2(_ty,_tx);
            float delta = pow(alpha/M_PI + 1.0, a);
            float r;
            if (inside!=0)
              r = amount*delta/(_tx*_tx + _ty*_ty + delta);
            else
              r = amount*sqrt(_tx*_tx + _ty*_ty + delta);
            float s = sin(alpha);
            float c = cos(alpha);
            _vx += r * c;
            _vy += r * s;
        }`;
    }

    get name(): string {
        return 'hole';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Hole2Func extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'
    PARAM_INSIDE = 'inside'
    PARAM_SHAPE = 'shape'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_D, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_INSIDE, type: VariationParamType.VP_INT, initialValue: 0},
            { name: this.PARAM_SHAPE, type: VariationParamType.VP_INT, initialValue: 0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Hole2 by Michael Faber, Brad Stefanov, and Rick Sidwell
        return `{
            float amount = ${variation.amount.toWebGl()};
            float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
            float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
            float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
            float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
            int inside = ${variation.params.get(this.PARAM_INSIDE)!.toWebGl()};
            int shape = ${variation.params.get(this.PARAM_SHAPE)!.toWebGl()};
            float _theta = atan2(_ty, _tx);
            float rhosq = _r2;
            float theta = _theta * d;
            float delta = pow(theta / M_PI + 1.0, a) * c;
            float r1 = 1.0;
            if(shape<=0) { 
              r1 = sqrt(rhosq) + delta;
            }
            else if(shape==1) {
              r1 = sqrt(rhosq + delta);
            }
            else if(shape==2) {
              r1 = sqrt(rhosq + sin(b * theta) + delta);
            }
            else if(shape==3) {
              r1 = sqrt(rhosq + sin(theta) + delta);
            }
            else if(shape==4) {
              r1 = sqrt(rhosq + sqr(theta) - delta + 1.0);
            }  
            else if(shape==5) {
              r1 = sqrt(rhosq + abs(tan(theta)) + delta);
            }
            else if(shape==6) {
              r1 = sqrt(rhosq * (1.0 + sin(b * theta)) + delta);
            }
            else if(shape==7) {
              r1 = sqrt(rhosq + abs(sin(0.5 * b * theta)) + delta);
            }
            else if(shape==8) {
              r1 = sqrt(rhosq + sin(M_PI * sin(b * theta)) + delta);
            }
            else if(shape>=9) {
              r1 = sqrt(rhosq + (sin(b * theta) + sin(2.0 * b * theta + (M_PI*0.5))) / 2.0 + delta);
            }                    
            if (inside != 0)
              r1 = amount / r1;
            else
              r1 = amount * r1;
            
            _vx += r1 * cos(theta);
            _vy += r1 * sin(theta);
        }`;
    }

    get name(): string {
        return 'hole2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HorseshoeFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = ${variation.amount.toWebGl()};
           float sinA = _tx / _r;
           float cosA = _ty / _r;
           _vx += amount * (sinA * _tx - cosA * _ty);
           _vy += amount * (cosA * _tx + sinA * _ty);
        }`;
    }

    get name(): string {
        return 'horseshoe';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HyperbolicFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = ${variation.amount.toWebGl()};
           _vx += amount * _tx / _r2;
           _vy += amount * _ty;
        }`;
    }

    get name(): string {
        return 'float amount = ${variation.amount.toWebGl()};';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HypershiftFunc extends VariationShaderFunc2D {
    PARAM_SHIFT = 'shift'
    PARAM_STRETCH = 'stretch'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
            { name: this.PARAM_STRETCH, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // "Hypershift" variation created by Zy0rg implemented into JWildfire by Brad Stefanov
        return `{
            float amount = ${variation.amount.toWebGl()};
            float shift = ${variation.params.get(this.PARAM_SHIFT)!.toWebGl()};
            float stretch = ${variation.params.get(this.PARAM_STRETCH)!.toWebGl()};
            float scale = 1.0 - shift * shift;
            float rad = 1.0 / (_tx * _tx + _ty * _ty);
            float x = rad * _tx + shift;
            float y = rad * _ty;
            rad = amount * scale / (x * x + y * y);
            _vx += rad * x + shift;
            _vy += rad * y * stretch;
          }`;
    }

    get name(): string {
        return 'hypershift';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HypertileFunc extends VariationShaderFunc2D {
    PARAM_P = 'p'
    PARAM_Q = 'q'
    PARAM_N = 'n'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_P, type: VariationParamType.VP_INT, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_INT, initialValue: 7 },
            { name: this.PARAM_N, type: VariationParamType.VP_INT, initialValue: 1 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* hypertile by Zueuk, http://zueuk.deviantart.com/art/Hyperbolic-tiling-plugins-165829025?q=sort%3Atime+gallery%3AZueuk&qo=0 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            int p = ${variation.params.get(this.PARAM_P)!.toWebGl()};
            int q = ${variation.params.get(this.PARAM_Q)!.toWebGl()};
            int n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
            float pa = 2.0 * M_PI / float(p);
            float qa = 2.0 * M_PI / float(q);
            float r = (1.0 - cos(pa)) / (cos(pa) + cos(qa)) + 1.0;
            if (r > 0.0)
              r = 1.0 / sqrt(r);
            else
              r = 1.0;
            float angle = float(n) * pa;
            float _re = r * cos(angle);
            float _im = r * sin(angle); 
            float a = _tx + _re;
            float b = _ty - _im;
            float c = _re * _tx - _im * _ty + 1.0;
            float d = _re * _ty + _im * _tx;
            float vr = amount / (sqr(c) + sqr(d));
            _vx += vr * (a * c + b * d);
            _vy += vr * (b * c - a * d);
          }`;
    }

    get name(): string {
        return 'hypertile';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Hypertile1Func extends VariationShaderFunc2D {
    PARAM_P = 'p'
    PARAM_Q = 'q'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_P, type: VariationParamType.VP_INT, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_INT, initialValue: 7 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* hypertile1 by Zueuk, http://zueuk.deviantart.com/art/Hyperbolic-tiling-plugins-165829025?q=sort%3Atime+gallery%3AZueuk&qo=0 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            int p = ${variation.params.get(this.PARAM_P)!.toWebGl()};
            int q = ${variation.params.get(this.PARAM_Q)!.toWebGl()};
            float pa = 2.0 * M_PI / float(p);
            float r2 = 1.0 - (cos(2.0 * M_PI / float(p)) - 1.0) / (cos(2.0 * M_PI / float(p)) + cos(2.0 * M_PI / float(q)));
            float r; 
            if (r2 > 0.0)
              r = 1.0 / sqrt(r2);
            else
              r = 1.0;
            float rpa = float(iRand8(tex, 37678, rngState)) * pa;
            float sina = sin(rpa);
            float cosa = cos(rpa);
            float re = r * cosa;
            float im = r * sina;
            float a = _tx + re, b = _ty - im;
            float c = re * _tx - im * _ty + 1.0;
            float d = re * _ty + im * _tx;
            float vr = amount / (sqr(c) + sqr(d));
            _vx += vr * (a * c + b * d);
            _vy += vr * (b * c - a * d);
        }`;
    }

    get name(): string {
        return 'hypertile1';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Hypertile2Func extends VariationShaderFunc2D {
    PARAM_P = 'p'
    PARAM_Q = 'q'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_P, type: VariationParamType.VP_INT, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_INT, initialValue: 7 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* hypertile2 by Zueuk, http://zueuk.deviantart.com/art/Hyperbolic-tiling-plugins-165829025?q=sort%3Atime+gallery%3AZueuk&qo=0 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            int p = ${variation.params.get(this.PARAM_P)!.toWebGl()};
            int q = ${variation.params.get(this.PARAM_Q)!.toWebGl()};
            float pa = 2.0 * M_PI / float(p);
            float r2 = 1.0 - (cos(2.0 * M_PI / float(p)) - 1.0) / (cos(2.0 * M_PI / float(p)) + cos(2.0 * M_PI / float(q)));
            float r; 
            if (r2 > 0.0)
              r = 1.0 / sqrt(r2);
            else
              r = 1.0;  
            float a = _tx + r;
            float b = _ty;
            float c = r * _tx + 1.0;
            float d = r * _ty;
            float x = (a * c + b * d);
            float y = (b * c - a * d);
            float vr = amount / (sqr(c) + sqr(d));
            float rpa = pa * float(iRand8(tex, 37678, rngState));
            float sina = sin(rpa);
            float cosa = cos(rpa);
            _vx += vr * (x * cosa + y * sina);
            _vy += vr * (y * cosa - x * sina);
        }`;
    }

    get name(): string {
        return 'hypertile2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JapaneseMapleLeafFunc extends VariationShaderFunc2D {
    PARAM_FILLED = 'filled'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_FLOAT, initialValue: 0.15 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // japanese maple leaf formula by Hamid Naderi Yeganeh: https://blogs.scientificamerican.com/guest-blog/how-to-draw-with-math/
        return `{
          float amount = ${variation.amount.toWebGl()};
          float filled = ${variation.params.get(this.PARAM_FILLED)!.toWebGl()};
          float t = _phi*0.5+(M_PI*0.5);
          float scale = 0.667;
          float r = (filled > 0.0 && filled > rand8(tex, rngState)) ? amount * rand8(tex, rngState) * scale : amount * scale;
          float lx = (4.0/15.0+pow(cos(8.0*t),2.0) + 1.0/5.0 * pow(cos(8.0*t)*cos(24.0*t),10.0) +
                    (1.0/6.0 * pow(cos(80.0*t),2.0) + 1.0/15.0 * pow(cos(80.0*t),10.0)))*
                            (1.0-pow(sin(8.0*t),10.0)) *
                            sin(2.0*t)*(1.0+sin(t))*(1.0-pow(cos(t),10.0) * pow(cos(3.0*t),2.0)+1.0/30.0*pow(cos(t),9.0)*pow(cos(5.0*t),10.0));
          float ly = (8.0/30.0 + pow(cos(8.0*t),2.0) + 1.0/5.0*pow(cos(8.0*t)*cos(24.0*t),10.0)
            +(1.0/6.0 * pow(cos(80.0*t),2.0) +1.0/15.0*pow(cos(80.0*t),10.0))
            *(1.0-pow(cos(t),10.0) *pow(cos(3.0*t),2.0)) * (1.0-pow(sin(8.0*t),10.0)))
            *cos(2.0*t)*(1.0+sin(t)+pow(cos(t)*cos(3.0*t),10.0));
          _vx += r * lx;
          _vy += r * ly;
        }`;
    }

    get name(): string {
        return 'japanese_maple_leaf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class IDiscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // idisc my Michael Faber, http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float _v = amount * (1.0 / M_PI); 
            float a = M_PI / (sqrt(sqr(_tx) + sqr(_ty)) + 1.0);
            float r = atan2(_ty, _tx) * _v;
            float sina = sin(a);
            float cosa = cos(a);
            _vx += r * cosa;
            _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'idisc';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class IntersectionFunc extends VariationShaderFunc2D {
    PARAM_XWIDTH = 'xwidth'
    PARAM_XTILESIZE = 'xtilesize'
    PARAM_XMOD1 = 'xmod1'
    PARAM_XMOD2 = 'xmod2'
    PARAM_XHEIGHT = 'xheight'
    PARAM_YHEIGHT = 'yheight'
    PARAM_YTILESIZE = 'ytilesize'
    PARAM_YMOD1 = 'ymod1'
    PARAM_YMOD2 = 'ymod2'
    PARAM_YWIDTH = 'ywidth'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XWIDTH, type: VariationParamType.VP_FLOAT, initialValue: 5.0 },
            { name: this.PARAM_XTILESIZE, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_XMOD1, type: VariationParamType.VP_FLOAT, initialValue: 0.3 },
            { name: this.PARAM_XMOD2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_XHEIGHT, type: VariationParamType.VP_FLOAT, initialValue: 0.5},
            { name: this.PARAM_YHEIGHT, type: VariationParamType.VP_FLOAT, initialValue: 5.0 },
            { name: this.PARAM_YTILESIZE, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_YMOD1, type: VariationParamType.VP_FLOAT, initialValue: 0.3 },
            { name: this.PARAM_YMOD2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_YWIDTH, type: VariationParamType.VP_FLOAT, initialValue: 0.5 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* intersection by Brad Stefanov */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float xwidth = ${variation.params.get(this.PARAM_XWIDTH)!.toWebGl()};
            float xtilesize = ${variation.params.get(this.PARAM_XTILESIZE)!.toWebGl()};
            float xmod1 = ${variation.params.get(this.PARAM_XMOD1)!.toWebGl()};
            float xmod2 = ${variation.params.get(this.PARAM_XMOD2)!.toWebGl()};
            float xheight = ${variation.params.get(this.PARAM_XHEIGHT)!.toWebGl()};
            float yheight = ${variation.params.get(this.PARAM_YHEIGHT)!.toWebGl()};
            float ytilesize = ${variation.params.get(this.PARAM_YTILESIZE)!.toWebGl()};
            float ymod1 = ${variation.params.get(this.PARAM_YMOD1)!.toWebGl()};
            float ymod2 = ${variation.params.get(this.PARAM_YMOD2)!.toWebGl()};
            float ywidth = ${variation.params.get(this.PARAM_YWIDTH)!.toWebGl()};
            float _xr1 = xmod2 * xmod1;
            float  _yr1 = ymod2 * ymod1;
            if (rand8(tex, rngState) < 0.5) {
              float x = -xwidth;
              if (rand8(tex, rngState) < 0.5)
                x = xwidth;
              _vx += xtilesize * (_tx + round(x * log(rand8(tex, rngState))));
              if (_ty > xmod1) {
                _vy += xheight * (-xmod1 + mod(_ty + xmod1, _xr1));
              } else if (_ty < -xmod1) {
                _vy += xheight * (xmod1 - mod(xmod1 - _ty, _xr1));
              } else {
                _vy += xheight * _ty;
              }
            } else {
              float y = -yheight;
              if (rand8(tex, rngState) < 0.5)
                y = yheight;
              _vy += ytilesize * (_ty + round(y * log(rand8(tex, rngState))));
              if (_tx > ymod1) {
                _vx += ywidth * (-ymod1 + mod(_tx + ymod1, _yr1));
              } else if (_tx < -ymod1) {
                _vx += ywidth * (ymod1 - mod(ymod1 - _tx, _yr1));
              } else {
                _vx += ywidth * _tx;
              }
            }
        }`;
    }

    get name(): string {
        return 'intersection';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class InvertedJuliaFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_Y2_MULT = 'y2_mult'
    PARAM_A2X_MULT = 'a2x_mult'
    PARAM_A2Y_MULT = 'a2y_mult'
    PARAM_A2Y_ADD = 'a2y_add'
    PARAM_COS_MULT = 'cos_mult'
    PARAM_Y_MULT = 'y_mult'
    PARAM_CENTER = 'center'
    PARAM_X2Y2_ADD = 'x2y2_add'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_Y2_MULT, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_A2X_MULT, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_A2Y_MULT, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_A2Y_ADD, type: VariationParamType.VP_FLOAT, initialValue: 0.0},
            { name: this.PARAM_COS_MULT, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_Y_MULT, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_CENTER, type: VariationParamType.VP_FLOAT, initialValue: M_PI},
            { name: this.PARAM_X2Y2_ADD, type: VariationParamType.VP_FLOAT, initialValue: 0.0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        //Inverted_Julia by Whittaker Courtney 12-11-2018
        //Based on the Julia variation but with an adjustable inward center and variables.
        return `{
            float amount = ${variation.amount.toWebGl()};
            float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
            float y2_mult = ${variation.params.get(this.PARAM_Y2_MULT)!.toWebGl()};
            float a2x_mult = ${variation.params.get(this.PARAM_A2X_MULT)!.toWebGl()};
            float a2y_mult = ${variation.params.get(this.PARAM_A2Y_MULT)!.toWebGl()};
            float a2y_add = ${variation.params.get(this.PARAM_A2Y_ADD)!.toWebGl()}; 
            float cos_mult = ${variation.params.get(this.PARAM_COS_MULT)!.toWebGl()}; 
            float y_mult = ${variation.params.get(this.PARAM_Y_MULT)!.toWebGl()}; 
            float center = ${variation.params.get(this.PARAM_CENTER)!.toWebGl()}; 
            float x2y2_add = ${variation.params.get(this.PARAM_X2Y2_ADD)!.toWebGl()}; 
            float x = _tx;
            float y = _ty;
            float xs = x * x;
            float ys = y * y;
            float z = pow(xs + (ys * y2_mult), power) + x2y2_add;
            float q = atan2(x * a2x_mult, y * a2y_mult + a2y_add) * 0.5 + M_PI * float(int(2.0 * rand8(tex, rngState)));
            _vx += amount * cos(z * cos_mult) * (sin(q) / z / center);
            _vy += amount * cos(z * cos_mult) * (cos(q) / z / center) * y_mult;
        }`;
    }

    get name(): string {
        return 'inverted_julia';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class InvpolarFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = ${variation.amount.toWebGl()};
           float ny = 1.0 + _ty;
           _vx += amount * ny * (sin(_tx * M_PI));
           _vy += amount * ny * (cos(_tx * M_PI));
        }`;
    }

    get name(): string {
        return 'invpolar';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class InvSquircularFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = ${variation.amount.toWebGl()};
           if (amount != 0.0) {
             float u = _tx;
             float v = _ty;
             float r = u * u + v * v;
             
             float r2 = sqrt(r * (amount * amount * r - 4.0 * u * u * v * v) / amount);
             r = sqrt(r - r2) / 1.414213562;
             _vx += r / u;
             _vy += r / v;
           }
        }`;
    }

    get name(): string {
        return 'invsquircular';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = ${variation.amount.toWebGl()};
           float a = atan2(_tx, _ty) * 0.5 + M_PI * floor(2.0 * rand8(tex, rngState)*rand8(tex, rngState));
           float sina = sin(a);
           float cosa = cos(a);
           float r = amount * sqrt(sqrt(_tx * _tx + _ty * _ty));
           _vx += r * cosa;
           _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'julia';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaCFunc extends VariationShaderFunc2D {
    PARAM_RE = 're'
    PARAM_IM = 'im'
    PARAM_DIST = 'dist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RE, type: VariationParamType.VP_FLOAT, initialValue: 3.5 },
            { name: this.PARAM_IM, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_FLOAT, initialValue: 1.0}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // juliac by David Young, http://sc0t0ma.deviantart.com/
        return `{
          float amount = ${variation.amount.toWebGl()};
          float _re = ${variation.params.get(this.PARAM_RE)!.toWebGl()};
          float _im = ${variation.params.get(this.PARAM_IM)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          float re = 1.0 / (_re + EPSILON);
          float im = _im / 100.0;
          float arg = atan2(_ty, _tx) + mod(rand8(tex, rngState)*32768.0, _re) * 2.0 * M_PI;
          float lnmod = dist * 0.5 * log(_tx * _tx + _ty * _ty);
          float a = arg * re + lnmod * im;
          float s = sin(a);
          float c = cos(a);
          float mod2 = exp(lnmod * re - arg * im);
          _vx += amount * mod2 * c;
          _vy += amount * mod2 * s;
        }`;
    }

    get name(): string {
        return 'juliac';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaNFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_DIST = 'dist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_INT, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_FLOAT, initialValue: 1.0}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
              
          int absPower = power > 0 ? power : -power;
          float cPower = dist / float(power) * 0.5; 

          float a = (atan2(_ty, _tx) + 2.0 * M_PI * floor(float(absPower) * rand8(tex, rngState))) / float(power);
          float sina = sin(a);
          float cosa = cos(a);
          float r = amount * pow(sqr(_tx) + sqr(_ty), cPower);
          _vx = _vx + r * cosa;
          _vy = _vy + r * sina;
        }`;
    }

    get name(): string {
        return 'julian';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaN2Func extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_DIST = 'dist'
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'
    PARAM_E = 'e'
    PARAM_F = 'f'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_INT, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 0.0},
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 0.0},
            { name: this.PARAM_D, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_E, type: VariationParamType.VP_FLOAT, initialValue: 0.0},
            { name: this.PARAM_F, type: VariationParamType.VP_FLOAT, initialValue: 0.0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // julian2 by Xyrus02, http://xyrus02.deviantart.com/art/JuliaN2-Plugin-for-Apophysis-136717838
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float f = ${variation.params.get(this.PARAM_F)!.toWebGl()};
          if (power != 0) {
            int _absN = power < 0 ? -power : power;
            float _cN = dist / float(power) * 0.5;   
            float x = a * _tx + b * _ty + e;
            float y = c * _tx + d * _ty + f;
            int k = modulo(iRand8(tex, 37678, rngState), _absN);
            float angle = (atan2(y, x) + (2.0*M_PI) * float(k)) / float(power);
            float r = amount * pow(sqr(x) + sqr(y), _cN);
            float sina = sin(angle);
            float cosa = cos(angle);
            _vx += r * cosa;
            _vy += r * sina;
          }  
        }`;
    }

    get name(): string {
        return 'julian2';
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaQFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_DIVISOR = 'divisor'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_INT, initialValue: 3 },
            { name: this.PARAM_DIVISOR, type: VariationParamType.VP_INT, initialValue: 2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // juliaq by Zueuk, http://zueuk.deviantart.com/art/juliaq-Apophysis-plugins-340813357
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          int divisor = ${variation.params.get(this.PARAM_DIVISOR)!.toWebGl()};
          float half_inv_power = 0.5 * float(divisor) / float(power);
          float inv_power = float(divisor) / float(power);
          float inv_power_2pi = (2.0*M_PI) / float(power);
          float a = atan2(_ty, _tx) * inv_power + rand8(tex, rngState)*32768.0 * inv_power_2pi;
          float sina = sin(a);
          float cosa = cos(a);
          float r = amount * pow(sqr(_tx) + sqr(_ty), half_inv_power);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'juliaq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliascopeFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_DIST = 'dist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_INT, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_FLOAT, initialValue: 1.0}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
              
          int absPower = power > 0 ? power : -power;
          float cPower = dist / float(power) * 0.5; 

          int rnd = int(rand8(tex, rngState)*float(absPower));
          float a;
          if (modulo(rnd, 2) == 0)
            a = (2.0 * M_PI * float(rnd) + atan2(_ty, _tx)) / float(power);
          else
            a = (2.0 * M_PI * float(rnd) - atan2(_ty, _tx)) / float(power);
          float sina = sin(a);
          float cosa = cos(a);
        
          float r = amount * pow(sqr(_tx) + sqr(_ty), cPower);
          _vx = _vx + r * cosa;
          _vy = _vy + r * sina;
        }`;
    }

    get name(): string {
        return 'juliascope';
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function registerVars_2D_PartG() {
    VariationShaders.registerVar(new GammaFunc())
    VariationShaders.registerVar(new GaussianBlurFunc())
    VariationShaders.registerVar(new GlynniaFunc())
    VariationShaders.registerVar(new GlynnSim1Func())
    VariationShaders.registerVar(new GlynnSim2Func())
    VariationShaders.registerVar(new GlynnSim3Func())
    VariationShaders.registerVar(new HadamardFunc())
    VariationShaders.registerVar(new HeartFunc())
    VariationShaders.registerVar(new HeartWFFunc())
    VariationShaders.registerVar(new HenonFunc())
    VariationShaders.registerVar(new HoleFunc())
    VariationShaders.registerVar(new Hole2Func())
    VariationShaders.registerVar(new HorseshoeFunc())
    VariationShaders.registerVar(new HyperbolicFunc())
    VariationShaders.registerVar(new HypershiftFunc())
    VariationShaders.registerVar(new HypertileFunc())
    VariationShaders.registerVar(new Hypertile1Func())
    VariationShaders.registerVar(new Hypertile2Func())
    VariationShaders.registerVar(new IDiscFunc())
    VariationShaders.registerVar(new IntersectionFunc())
    VariationShaders.registerVar(new InvertedJuliaFunc())
    VariationShaders.registerVar(new InvpolarFunc())
    VariationShaders.registerVar(new InvSquircularFunc())
    VariationShaders.registerVar(new JapaneseMapleLeafFunc())
    VariationShaders.registerVar(new JuliaFunc())
    VariationShaders.registerVar(new JuliaCFunc())
    VariationShaders.registerVar(new JuliaNFunc())
    VariationShaders.registerVar(new JuliaN2Func())
    VariationShaders.registerVar(new JuliaQFunc())
    VariationShaders.registerVar(new JuliascopeFunc())
}
