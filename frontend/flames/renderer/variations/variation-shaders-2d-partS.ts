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
    FUNC_COSH,
    FUNC_HYPOT,
    FUNC_LOG10,
    FUNC_ROUND,
    FUNC_SINH,
    FUNC_TANH, FUNC_TRUNC
} from 'Frontend/flames/renderer/variations/variation-math-functions';
import {M_PI} from 'Frontend/flames/renderer/mathlib';

/*
  be sure to import this class somewhere and call registerVars_2D_PartS()
 */
class ScryFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* scry from the apophysis plugin pack */
        return `{
           float amount = float(${variation.amount});
           float t = _tx * _tx + _ty * _ty;
           float d = (sqrt(t) * (t + 1.0 / amount));
           if (d != 0.0) {
             float r = 1.0 / d;
             _vx += _tx * r;
             _vy += _ty * r;            
           }
        }`;
    }

    get name(): string {
        return 'scry';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}


class SecFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Secant SEC
        return `{
           float amount = float(${variation.amount});
           float secsin = sin(_tx);
           float seccos = cos(_tx);
           float secsinh = sinh(_ty);
           float seccosh = cosh(_ty);
           float d = (cos(2.0 * _tx) + cosh(2.0 * _ty));
           if (d != 0.0) {
             float secden = 2.0 / d;
             _vx += amount * secden * seccos * seccosh;
             _vy += amount * secden * secsin * secsinh;
           }
        }`;
    }

    get name(): string {
        return 'sec';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class Secant2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Intended as a 'fixed' version of secant */
        return `{
           float amount = float(${variation.amount});
           float r = amount * _r;
           float cr = cos(r);
           if (cr != 0.0) {
             float icr = 1.0 / cr;
             _vx += amount * _tx;
             if (cr < 0.0) {
               _vy += amount * (icr + 1.0);
             } else {
               _vy += amount * (icr - 1.0);
             } 
           }
        }`;
    }

    get name(): string {
        return 'secant2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SechFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Secant SECH
        return `{
          float amount = float(${variation.amount});
          float sechsin = sin(_ty);
          float sechcos = cos(_ty);
          float sechsinh = sinh(_tx);
          float sechcosh = cosh(_tx);
          float d = (cos(2.0 * _ty) + cosh(2.0 * _tx));
          if (d != 0.0) {
            float sechden = 2.0 / d;
            _vx += amount * sechden * sechcos * sechcosh;
            _vy -= amount * sechden * sechsin * sechsinh; 
          }
        }`;
    }

    get name(): string {
        return 'sech';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class SeparationFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_XINSIDE = 'xinside'
    PARAM_Y = 'y'
    PARAM_YINSIDE = 'yinside'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_XINSIDE, type: VariationParamType.VP_NUMBER, initialValue: 0.05 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_YINSIDE, type: VariationParamType.VP_NUMBER, initialValue: 0.025 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* separation from the apophysis plugin pack */
        return `{
          float amount = float(${variation.amount});
          float x = float(${variation.params.get(this.PARAM_X)});
          float xinside = float(${variation.params.get(this.PARAM_XINSIDE)});
          float y = float(${variation.params.get(this.PARAM_Y)});
          float yinside = float(${variation.params.get(this.PARAM_YINSIDE)});
          float sx2 = x * x;
          float sy2 = y * y;

          if (_tx > 0.0) {
            _vx += amount * (sqrt(_tx * _tx + sx2) - _tx * xinside);
          } else {
            _vx -= amount * (sqrt(_tx * _tx + sx2) + _tx * xinside);
          }
        
          if (_ty > 0.0) {
            _vy += amount * (sqrt(_ty * _ty + sy2) - _ty * yinside);
          } else {
            _vy -= amount * (sqrt(_ty * _ty + sy2) + _ty * yinside);
          }
        }`;
    }

    get name(): string {
        return 'separation';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class ShiftFunc extends VariationShaderFunc2D {
    PARAM_SHIFT_X = 'shift_x'
    PARAM_SHIFT_Y = 'shift_y'
    PARAM_ANGLE = 'angle'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT_X, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_SHIFT_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.06 },
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 12.25 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
         // 'shift' variation created by Tatyana Zabanova implemented into JWildfire by Brad Stefanov
         return `{
          float amount = float(${variation.amount});
          float shift_x = float(${variation.params.get(this.PARAM_SHIFT_X)});
          float shift_y = float(${variation.params.get(this.PARAM_SHIFT_Y)});   
          float angle = float(${variation.params.get(this.PARAM_ANGLE)});
          float ang = angle / 180.0 * M_PI;   
          float sn = sin(ang);
          float cs = cos(ang);
          _vx += amount * (_tx + cs * shift_x - sn * shift_y);
          _vy += amount * (_ty - cs * shift_y - sn * shift_x);
        }`;
    }

    get name(): string {
        return 'shift';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ShredlinFunc extends VariationShaderFunc2D {
    PARAM_XDISTANCE = 'xdistance'
    PARAM_XWIDTH = 'xwidth'
    PARAM_YDISTANCE = 'ydistance'
    PARAM_YWIDTH = 'ywidth'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XDISTANCE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_XWIDTH, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_YDISTANCE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_YWIDTH, type: VariationParamType.VP_NUMBER, initialValue: 0.50 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Shredlin by Zy0rg
        return `{
          float amount = float(${variation.amount});
          float xdistance = float(${variation.params.get(this.PARAM_XDISTANCE)});
          float xwidth = float(${variation.params.get(this.PARAM_XWIDTH)});   
          float ydistance = float(${variation.params.get(this.PARAM_YDISTANCE)});
          float ywidth = float(${variation.params.get(this.PARAM_YWIDTH)});          
          float sxd = xdistance;
          float sxw = xwidth;
          float syd = ydistance;
          float syw = ywidth;
          float vv = amount;
          int xpos = _tx < 0.0 ? 1 : 0;
          int ypos = _ty < 0.0 ? 1 : 0;
          float xrng = _tx / sxd;
          float yrng = _ty / syd;
          _vx = vv * sxd * ((xrng - float(int(xrng))) * sxw + float(int(xrng)) + (0.5 - float(xpos)) * (1.0 - sxw));
          _vy = vv * syd * ((yrng - float(int(yrng))) * syw + float(int(yrng)) + (0.5 - float(ypos)) * (1.0 - syw)); 
        }`;
    }

    get name(): string {
        return 'shredlin';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ShredradFunc extends VariationShaderFunc2D {
    PARAM_N = 'n'
    PARAM_WIDTH = 'width'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 4.00 },
            { name: this.PARAM_WIDTH, type: VariationParamType.VP_NUMBER, initialValue: 0.50 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* shredrad by zy0rg */
        return `{
          float amount = float(${variation.amount});
          float n = float(${variation.params.get(this.PARAM_N)});
          float width = float(${variation.params.get(this.PARAM_WIDTH)});   
          if(n==0.0) n=EPSILON;
          float alpha = (2.0*M_PI) / n;
          float sa = alpha;
          float sw = width;
          float ang = atan2(_ty, _tx); // _theta 
          float rad = _r;
          float xang = (ang + 3.0 * M_PI + sa / 2.0) / sa;
          float zang = ((xang - float(int(xang))) * sw + float(int(xang))) * sa - M_PI - sa / 2.0 * sw;
          float s = sin(zang);
          float c = cos(zang);
          _vx += amount * rad * c;
          _vy += amount * rad * s;
        }`;
    }

    get name(): string {
        return 'shredrad';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SigmoidFunc extends VariationShaderFunc2D {
    PARAM_SHIFTX = 'shiftx'
    PARAM_SHIFTY = 'shifty'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFTX, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SHIFTY, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // author Xyrus. Implemented by Brad Stefanov
        return `{
          float amount = float(${variation.amount});
          float shiftx = float(${variation.params.get(this.PARAM_SHIFTX)});
          float shifty = float(${variation.params.get(this.PARAM_SHIFTY)});
          float ax = 1.0;
          float ay = 1.0;
          float sx = shiftx;
          float sy = shifty;
          if (sx < 1.0 && sx > -1.0) {
            if (sx == 0.0) {
              sx = EPSILON;
              ax = 1.0;
            } else {
              ax = (sx < 0.0 ? -1.0 : 1.0);
              sx = 1.0 / sx;
            }
          }
          if (sy < 1.0 && sy > -1.0) {
            if (sy == 0.0) {
              sy = EPSILON;
              ay = 1.0;
            } else {
              ay = (sy < 0.0 ? -1.0 : 1.0);
              sy = 1.0 / sy;
            }
          }
          sx *= -5.0;
          sy *= -5.0;
          float vv = abs(amount);
          float c0 = ax / (1.0 + exp(sx * _tx));
          float c1 = ay / (1.0 + exp(sy * _ty));
          float x = (2.0 * (c0 - 0.5));
          float y = (2.0 * (c1 - 0.5));
          _vx += vv * x;
          _vy += vv * y; 
        }`;
    }

    get name(): string {
        return 'sigmoid';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SinFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Sine SIN
        return `{
          float amount = float(${variation.amount});
          float sinsin = sin(_tx);
          float sincos = cos(_tx);
          float sinsinh = sinh(_ty);
          float sincosh = cosh(_ty);
          _vx += amount * sinsin * sincosh;
          _vy += amount * sincos * sinsinh;
        }`;
    }

    get name(): string {
        return 'sin';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class SineBlurFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // sineblur by Zyorg, http://zy0rg.deviantart.com/art/Blur-Package-347648919
        return `{
          float amount = float(${variation.amount});
          float power = float(${variation.params.get(this.PARAM_POWER)});
          if (power < 0.0)
            power = 0.0;
          float ang = rand8(tex, rngState) * (2.0*M_PI);
          float r = amount * (power == 1.0 ? acos(rand8(tex, rngState) * 2.0 - 1.0) / M_PI : acos(exp(log(rand8(tex, rngState)) * power) * 2.0 - 1.0) / M_PI);
          float s = sin(ang);
          float c = cos(ang);
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'sineblur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class SinhFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Sine SINH
        return `{
                  float amount = float(${variation.amount});
                  float sinhsin = sin(_ty);
                  float sinhcos = cos(_ty);
                  float sinhsinh = sinh(_tx);
                  float sinhcosh = cosh(_tx);
                  _vx += amount * sinhsinh * sinhcos;
                  _vy += amount * sinhcosh * sinhsin;
                }`;
    }

    get name(): string {
        return 'sinh';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class SinqFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Sinq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = float(${variation.amount});
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(_tx);
                  float c = cos(_tx);
                  float sh = sinh(abs_v);
                  float ch = cosh(abs_v);
                  float C = amount * c * sh / abs_v;
                  _vx += amount * s * ch;
                  _vy += C * _ty;
                  _vz += C * _tz;
                }`;
    }

    get name(): string {
        return 'sinq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }
}

class SintrangeFunc extends VariationShaderFunc2D {
    PARAM_W = 'w'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_W, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Sintrange from Ffey, http://ffey.deviantart.com/art/apoplugin-Sintrange-245146228 */
        return `{
          float amount = float(${variation.amount});
          float w = float(${variation.params.get(this.PARAM_W)});
          float v = ((sqr(_tx) + sqr(_ty)) * w);
          _vx = amount * (sin(_tx)) * (_tx * _tx + w - v);
          _vy = amount * (sin(_ty)) * (_ty * _ty + w - v);
        }`;
    }

    get name(): string {
        return 'sintrange';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SinhqFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Sinhq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = float(${variation.amount});
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(abs_v);
                  float c = cos(abs_v);
                  float sh = sinh(_tx);
                  float ch = cosh(_tx);
                  float C = amount * ch * s / abs_v;
                  _vx += amount * sh * c;
                  _vy += C * _ty;
                  _vz += C * _tz;
                }`;
    }

    get name(): string {
        return 'sinhq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }
}

class SinusoidalFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          _vx += amount * sin(_tx);
          _vy += amount * sin(_ty);
        }`;
    }

    get name(): string {
        return 'sinusoidal';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

}

class SphericalFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float lr = amount / (_tx * _tx + _ty * _ty + EPSILON);
          _vx += _tx * lr;
          _vy += _ty * lr;
        }`;
    }

    get name(): string {
        return 'spherical';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SphericalNFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_DIST = 'dist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // SphericalN by eralex61, http://eralex61.deviantart.com/art/SphericalN-plugin-166218657?q=gallery%3Aapophysis-plugins%2F24607713&qo=36
        //R=sqrt(sqr(pAffineTP.x)+sqr(pAffineTP.y));
        return `{
          float amount = float(${variation.amount});
          float power = float(${variation.params.get(this.PARAM_POWER)});
          float dist = float(${variation.params.get(this.PARAM_DIST)});   
          float R = pow(sqrt(sqr(_tx) + sqr(_ty)), dist);
          if (R > EPSILON) {
            int N = int(floor(power * rand8(tex, rngState)));
            float alpha = atan2(_ty, _tx) + float(N) * (2.0*M_PI) / floor(power);
            float sina = sin(alpha);
            float cosa = cos(alpha);
            _vx += amount * cosa / R;
            _vy += amount * sina / R;
          }
        }`;
    }

    get name(): string {
        return 'sphericalN';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SpiralFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float sinA = _tx / _r;
          float cosA = _ty / _r;
          float r = _r;
          float sinr = sin(r);
          float cosr = cos(r);
          r = amount / r;
          _vx += (cosA + sinr) * r;
          _vy += (sinA - cosr) * r;
        }`;
    }

    get name(): string {
        return 'spiral';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SpirographFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_D = 'd'
    PARAM_C1 = 'c1'
    PARAM_C2 = 'c2'
    PARAM_TMIN = 'tmin'
    PARAM_TMAX = 'tmax'
    PARAM_YMIN = 'ymin'
    PARAM_YMAX = 'ymax'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_C1, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_C2, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TMIN, type: VariationParamType.VP_NUMBER, initialValue: -1.00 },
            { name: this.PARAM_TMAX, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_YMIN, type: VariationParamType.VP_NUMBER, initialValue: -1.00 },
            { name: this.PARAM_YMAX, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float a = float(${variation.params.get(this.PARAM_A)});
          float b = float(${variation.params.get(this.PARAM_B)});
          float d = float(${variation.params.get(this.PARAM_D)});
          float c1 = float(${variation.params.get(this.PARAM_C1)});
          float c2 = float(${variation.params.get(this.PARAM_C2)});
          float tmin = float(${variation.params.get(this.PARAM_TMIN)});
          float tmax = float(${variation.params.get(this.PARAM_TMAX)});
          float ymin = float(${variation.params.get(this.PARAM_YMIN)});
          float ymax = float(${variation.params.get(this.PARAM_YMAX)});
          float t = (tmax - tmin) * rand8(tex, rngState) + tmin;
          float y = (ymax - ymin) * rand8(tex, rngState) + ymin;
          float x1 = (a + b) * cos(t) - c1 * cos((a + b) / b * t);
          float y1 = (a + b) * sin(t) - c2 * sin((a + b) / b * t);
          _vx += amount * (x1 + d * cos(t) + y);
          _vy += amount * (y1 + d * sin(t) + y);
        }`;
    }

    get name(): string {
        return 'spirograph';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SplitFunc extends VariationShaderFunc2D {
    PARAM_XSIZE = 'xsize'
    PARAM_YSIZE = 'ysize'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XSIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
                { name: this.PARAM_YSIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.6 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Split from apo plugins pack */
        return `{
          float amount = float(${variation.amount});
         
          float xSize = float(${variation.params.get(this.PARAM_XSIZE)});
          if (cos(_tx * xSize * M_PI) >= 0.0) {
            _vy += amount * _ty;
          } else {
            _vy -= amount * _ty;
          }
          float ySize = float(${variation.params.get(this.PARAM_YSIZE)});
          if (cos(_ty * ySize * M_PI) >= 0.0) {
            _vx += amount * _tx;
          } else {
            _vx -= amount * _tx;
          };
        }`;
    }

    get name(): string {
        return 'split';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SplitsFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_LSHEAR = 'lshear'
    PARAM_RSHEAR = 'rshear'
    PARAM_USHEAR = 'ushear'
    PARAM_DSHEAR = 'dshear'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
                { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.6 },
                { name: this.PARAM_LSHEAR, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
                { name: this.PARAM_RSHEAR, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
                { name: this.PARAM_USHEAR, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
                { name: this.PARAM_DSHEAR, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Splits from apo plugins pack; shears added by DarkBeam 2018 to emulate splits.dll */
        return `{
          float amount = float(${variation.amount});
          float x = float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)});
          
          if (_tx >= 0.0) {
            _vx += amount * (_tx + x);
            float rshear = float(${variation.params.get(this.PARAM_RSHEAR)});
            _vy += amount * (rshear);
          } else {
            _vx += amount * (_tx - x);
            float lshear = float(${variation.params.get(this.PARAM_LSHEAR)});
            _vy -= amount * (lshear);
          }
    
          if (_ty >= 0.0) {
             _vy += amount * (_ty + y);
             float ushear = float(${variation.params.get(this.PARAM_USHEAR)});
             _vx += amount * (ushear);
           } else {
             _vy += amount * (_ty - y);
             float dshear = float(${variation.params.get(this.PARAM_DSHEAR)});
             _vx -= amount * (dshear);
           }
        }`;
    }

    get name(): string {
        return 'splits';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SquareFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          _vx += amount * (rand8(tex, rngState) - 0.5);
          _vy += amount * (rand8(tex, rngState) - 0.5);    
        }`;
    }

    get name(): string {
        return 'square';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class SquarizeFunc extends VariationShaderFunc2D {
    // squarize by MichaelFaber - The angle pack: http://michaelfaber.deviantart.com/art/The-Angle-Pack-277718538
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
            float s = sqrt(sqr(_tx) + sqr(_ty));
            float a = atan2(_ty, _tx);
            if (a < 0.0)
              a += (2.0*M_PI);
            float p = 4.0 * s * a / M_PI;
            if (p <= 1.0 * s) {
              _vx += amount * s;
              _vy += amount * p;
            } else if (p <= 3.0 * s) {
              _vx += amount * (2.0 * s - p);
              _vy += amount * (s);
            } else if (p <= 5.0 * s) {
              _vx -= amount * (s);
              _vy += amount * (4.0 * s - p);
            } else if (p <= 7.0 * s) {
              _vx -= amount * (6.0 * s - p);
              _vy -= amount * (s);
            } else {
              _vx += amount * (s);
              _vy -= amount * (8.0 * s - p);
            }   
        }`;
    }

    get name(): string {
        return 'squarize';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SquirrelFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // squirrel by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = float(${variation.amount});
          float a = float(${variation.params.get(this.PARAM_A)});
          float b = float(${variation.params.get(this.PARAM_B)});   
          float u = (a + EPSILON) * sqr(_tx) + (b + EPSILON) * sqr(_ty);
          _vx = cos(sqrt(u)) * tan(_tx) * amount;
          _vy = sin(sqrt(u)) * tan(_ty) * amount;
        }`;
    }

    get name(): string {
        return 'squirrel';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SquishFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 2 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // squish by MichaelFaber - The angle pack: http://michaelfaber.deviantart.com/art/The-Angle-Pack-277718538
        return `{
          float amount = float(${variation.amount});
          int power = int(${variation.params.get(this.PARAM_POWER)});
          float _inv_power = 1.0 / float(power); 
          float x = abs(_tx);
          float y = abs(_ty);
          float s;
          float p;
        
          if (x > y) {
            s = x;
            if (_tx > 0.0) {
              p = _ty;
            } else {
              p = 4.0 * s - _ty;
            }
          } else {
            s = y;
            if (_ty > 0.0) {
              p = 2.0 * s - _tx;
            } else {
              p = 6.0 * s + _tx;
            }
          }
        
          p = _inv_power * (p + 8.0 * s * floor(float(power) * rand8(tex, rngState)));
        
          if (p <= 1.0 * s) {
            _vx += amount * s;
            _vy += amount * p;
          } else if (p <= 3.0 * s) {
            _vx += amount * (2.0 * s - p);
            _vy += amount * (s);
          } else if (p <= 5.0 * s) {
            _vx -= amount * (s);
            _vy += amount * (4.0 * s - p);
          } else if (p <= 7.0 * s) {
            _vx -= amount * (6.0 * s - p);
            _vy -= amount * (s);
          } else {
            _vx += amount * (s);
            _vy -= amount * (8.0 * s - p);
          }
        }`;
    }

    get name(): string {
        return 'squish';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class StarBlurFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_RANGE = 'range'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 5 },
            { name: this.PARAM_RANGE, type: VariationParamType.VP_NUMBER, initialValue: 0.40162283177245455973959534526548 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // starblur by Zyorg, http://zy0rg.deviantart.com/art/Blur-Package-347648919
        return `{
          float amount = float(${variation.amount});
          int power = int(${variation.params.get(this.PARAM_POWER)});
          float range = float(${variation.params.get(this.PARAM_RANGE)});
          float starblur_alpha = M_PI / float(power);
          float starblur_length = sqrt(1.0 + range*range - 2.0 * range * cos(starblur_alpha));
          starblur_alpha = asin(sin(starblur_alpha) * range / starblur_length);
          float f = rand8(tex, rngState) * float(power) * 2.0;
          float angle = trunc(f);
          f = f - angle;
          float x = f * starblur_length;
          float z = sqrt(1.0 + x*x - 2.0 * x * cos(starblur_alpha));
          int iangle = int(angle);
          if ((iangle/2)*2==iangle)
            angle = 2.0*M_PI / float(power) * float((iangle) / 2) + asin(sin(starblur_alpha) * x / z);
          else
            angle = 2.0*M_PI / float(power) * float((iangle) / 2) - asin(sin(starblur_alpha) * x / z);
          z = z * sqrt(rand8(tex, rngState));
        
          float ang = angle - PI*0.5;
          float s = sin(ang);
          float c = cos(ang);
        
          _vx += amount * z * c;
          _vy += amount * z * s;

        }`;
    }

    get name(): string {
        return 'starblur';
    }

    get funcDependencies(): string[] {
        return [FUNC_TRUNC];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class StripesFunc extends VariationShaderFunc2D {
    PARAM_SPACE = 'space'
    PARAM_WARP = 'warp'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPACE, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_WARP, type: VariationParamType.VP_NUMBER, initialValue: 0.60 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Stripes from apo plugins pack */
        return `{
          float amount = float(${variation.amount});
          float space = float(${variation.params.get(this.PARAM_SPACE)});
          float warp = float(${variation.params.get(this.PARAM_WARP)});   
          float roundx = floor(_tx + 0.5);
          float offsetx = _tx - roundx;
          _vx += amount * (offsetx * (1.0 - space) + roundx);
          _vy += amount * (_ty + offsetx * offsetx * warp);
        }`;
    }

    get name(): string {
        return 'stripes';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SwirlFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
         return `{
          float amount = float(${variation.amount});
          float r2 = _tx * _tx + _ty * _ty;
          float c1 = sin(r2);
          float c2 = cos(r2);
          _vx += amount * (c1 * _tx - c2 * _ty);
          _vy += amount * (c2 * _tx + c1 * _ty);
        }`;
    }

    get name(): string {
        return 'swirl';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TanFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Tangent TAN
        return `{
          float amount = float(${variation.amount});
          float tansin = sin(2.0 * _tx);
          float tancos = cos(2.0 * _tx);
          float tansinh = sinh(2.0 * _ty);
          float tancosh = cosh(2.0 * _ty);
          float d = (tancos + tancosh);
          if (d != 0.0) {
            float tanden = 1.0 / d;
            _vx += amount * tanden * tansin;
            _vy += amount * tanden * tansinh;       
          }
        }`;
    }

    get name(): string {
        return 'tan';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TanhFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Tangent TANH
        return `{
          float amount = float(${variation.amount});
          float tanhsin = sin(2.0 * _ty);
          float tanhcos = cos(2.0 * _ty);
          float tanhsinh = sinh(2.0 * _tx);
          float tanhcosh = cosh(2.0 * _tx);
          float d = (tanhcos + tanhcosh);
          if (d != 0.0) {
            float tanhden = 1.0 / d;
            _vx += amount * tanhden * tanhsinh;
            _vy += amount * tanhden * tanhsin;
          }
        }`;
    }

    get name(): string {
        return 'tanh';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TanhqFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Tanhq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
          float amount = float(${variation.amount});
          float abs_v = hypot(_ty, _tz);
          float sysz = sqr(_ty) + sqr(_tz);
          float ni = amount / (sqr(_tx) + sysz);
          float s = sin(abs_v);
          float c = cos(abs_v);
          float sh = sinh(_tx);
          float ch = cosh(_tx);
          float C = ch * s / abs_v;
          float B = sh * s / abs_v;
          float stcv = sh * c;
          float nstcv = -stcv;
          float ctcv = ch * c;
          _vx += (stcv * ctcv + C * B * sysz) * ni;
          _vy += (nstcv * B * _ty + C * _ty * ctcv) * ni;
          _vz += (nstcv * B * _tz + C * _tz * ctcv) * ni;
        }`;
    }

    get name(): string {
        return 'tanhq';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TanCosFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // tancos by Raykoid666, http://raykoid666.deviantart.com/art/plugin-pack-3-100510461?q=gallery%3ARaykoid666%2F11060240&qo=16
        return `{
          float amount = float(${variation.amount});
          float d1 = EPSILON + sqr(_tx) + sqr(_ty);
          float d2 = amount / d1;
          _vx += d2 * (tanh(d1) * (2.0 * _tx));
          _vy += d2 * (cos(d1) * (2.0 * _ty));
        }`;
    }

    get name(): string {
        return 'tancos';
    }

    get funcDependencies(): string[] {
        return [FUNC_TANH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TangentFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float d = cos(_ty);
          if (d != 0.0) {
            _vx += amount * sin(_tx) / d;
            _vy += amount * tan(_ty);  
          }
        }`;
    }

    get name(): string {
        return 'tangent';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TargetFunc extends VariationShaderFunc2D {
    PARAM_EVEN = 'even'
    PARAM_ODD = 'odd'
    PARAM_SIZE = 'size'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_EVEN, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_ODD, type: VariationParamType.VP_NUMBER, initialValue: 0.6 },
            { name: this.PARAM_SIZE, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2.0 }
        ]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* target by Michael Faber, http://michaelfaber.deviantart.com/art/Target-362520023?q=gallery%3Afractal-resources%2F24660058&qo=0 */
        return `{
          float amount = float(${variation.amount});
          float even = float(${variation.params.get(this.PARAM_EVEN)});
          float odd = float(${variation.params.get(this.PARAM_ODD)});   
          float size = float(${variation.params.get(this.PARAM_SIZE)});
          float t_size_2 = 0.5 * size;
          float a = atan2(_ty, _tx);
          float r = sqrt(sqr(_tx) + sqr(_ty));
          float t = log(r);
          if (t < 0.0)
            t -= t_size_2;
          t = mod(abs(t), size);
          if (t < t_size_2)
            a += even;
          else
            a += odd;
          float s = sin(a);
          float c = cos(a);
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'target';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TargetSpFunc extends VariationShaderFunc2D {
    PARAM_TWIST = 'twist'
    PARAM_N_OF_SP = 'n_of_sp'
    PARAM_SIZE = 'size'
    PARAM_TIGHTNESS = 'tightness'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_N_OF_SP, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_SIZE, type: VariationParamType.VP_NUMBER, initialValue: 1.25 },
            { name: this.PARAM_TIGHTNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.55 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* target by Michael Faber,log spiral tweak by Dark-Beam */
        return `{
          float amount = float(${variation.amount});
          float twist = float(${variation.params.get(this.PARAM_TWIST)});
          int n_of_sp = int(${variation.params.get(this.PARAM_N_OF_SP)});   
          float size = float(${variation.params.get(this.PARAM_SIZE)});
          float tightness = float(${variation.params.get(this.PARAM_TIGHTNESS)});
          float t_size_2 = 0.5 * size;
          float _rota = M_PI * twist;
          float _rotb = -M_PI + _rota;
          float a = atan2(_ty, _tx);
          float r = sqrt(sqr(_tx) + sqr(_ty));
          float t = tightness * log(r) + float(n_of_sp) * (1.0 / M_PI) * (a + M_PI);
          if (t < 0.0)
            t -= t_size_2;
          t = mod(abs(t), size);
          if (t < t_size_2)
            a += _rota;
          else
            a += _rotb;    
          float s = sin(a);
          float c = cos(a);  
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'target_sp';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TradeFunc extends VariationShaderFunc2D {
    PARAM_R1 = 'r1'
    PARAM_D1 = 'd1'
    PARAM_R2 = 'r2'
    PARAM_D2 = 'd2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_R1, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_D1, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_R2, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_D2, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* trade by Michael Faber,  http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = float(${variation.amount});
          float r1 = float(${variation.params.get(this.PARAM_R1)});
          float d1 = float(${variation.params.get(this.PARAM_D1)});   
          float r2 = float(${variation.params.get(this.PARAM_R2)});
          float d2 = float(${variation.params.get(this.PARAM_D2)});
          float _c1 = r1 + d1;
          float _c2 = r2 + d2;    
         
          if (_tx > 0.0) {
            float r = sqrt(sqr(_c1 - _tx) + sqr(_ty));
            if (r <= r1) {
                r *= r2 / r1;
                float a = atan2(_ty, _c1 - _tx);
                float s = sin(a);
                float c = cos(a);
                _vx += amount * (r * c - _c2);
                _vy += amount * r * s;
            } else {
              _vx += amount * _tx;
              _vy += amount * _ty;
            }
          }
          
          else {
            float r = sqrt(sqr(-_c2 - _tx) + sqr(_ty));  
            if (r <= r2) {
              r *= r1 / r2;
              float a = atan2(_ty, -_c2 - _tx);
              float s = sin(a);
              float c = cos(a);
              _vx += amount * (r * c + _c1);
              _vy += amount * r * s;
            } else {
              _vx += amount * _tx;
              _vy += amount * _ty;
            }
          }
        }`;
    }

    get name(): string {
        return 'trade';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TruchetFunc extends VariationShaderFunc2D {
    PARAM_EXTENDED = 'extended'
    PARAM_EXPONENT = 'exponent'
    PARAM_ARC_WIDTH = 'arc_width'
    PARAM_ROTATION = 'rotation'
    PARAM_SIZE = 'size'
    PARAM_SEED = 'seed'
    PARAM_DIRECT_COLOR = 'direct_color'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_EXTENDED, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_EXPONENT, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_ARC_WIDTH, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_ROTATION, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SIZE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SEED, type: VariationParamType.VP_NUMBER, initialValue: 50.00 },
            { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_NUMBER, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          int extended = int(${variation.params.get(this.PARAM_EXTENDED)});
          float exponent = float(${variation.params.get(this.PARAM_EXPONENT)});
          float arc_width = float(${variation.params.get(this.PARAM_ARC_WIDTH)});
          float rotation = float(${variation.params.get(this.PARAM_ROTATION)});
          float size = float(${variation.params.get(this.PARAM_SIZE)});
          float seed = float(${variation.params.get(this.PARAM_SEED)});
          int direct_color = int(${variation.params.get(this.PARAM_DIRECT_COLOR)});

          if (extended < 0) {
            extended = 0;
          } else if (extended > 1) {
            extended = 1;
          }
          if (exponent < 0.001) {
            exponent = 0.001;
          } else if (exponent > 2.0) {
            exponent = 2.0;
          }
          if (arc_width < 0.001) {
            arc_width = 0.001;
          } else if (arc_width > 1.0) {
            arc_width = 1.0;
          }
          if (size < 0.001) {
            size = 0.001;
          } else if (size > 10.0) {
            size = 10.0;
          }
          
          float n = exponent;
          float onen = 1.0 / exponent;
          float tdeg = rotation;
          float width = arc_width;
          seed = abs(seed);
          float seed2 = sqrt(seed + (seed / 2.0) + EPSILON) / ((seed * 0.5) + EPSILON) * 0.25;
        
          float x, y;
          int intx = 0;
          int inty = 0;
          float r = -tdeg;
          float r0 = 0.0;
          float r1 = 0.0;
          float rmax = 0.5 * (pow(2.0, 1.0 / n) - 1.0) * width;
          float scale = (cos(r) - sin(r)) / amount;
          float tiletype = 0.0;
          float randint = 0.0;
          float modbase = 65535.0;
          float multiplier = 32747.0;
          float offset = 12345.0;
          int randiter = 0;
       
          x = _tx * scale;
          y = _ty * scale;
          intx = int(round(x));
          inty = int(round(y));
    
          r = x - float(intx);
          if (r < 0.0) {
            x = 1.0 + r;
          } else {
            x = r;
          }
    
          r = y - float(inty);
          if (r < 0.0) {
            y = 1.0 + r;
          } else {
            y = r;
          }
        
          if (seed == 0.0) {
            tiletype = 0.0;
          } else if (seed == 1.0) {
            tiletype = 1.0;
          } else {
            if (extended == 0) {
              float xrand = round(_tx);
              float yrand = round(_ty);
              xrand = xrand * seed2;
              yrand = yrand * seed2;
              float niter = xrand + yrand + xrand * yrand;
              randint = (niter + seed) * seed2 / 2.0;
              randint = mod((randint * multiplier + offset), modbase);
            } else {
              seed = floor(seed);
              int xrand = int(round(_tx));
              int yrand = int(round(_ty));
              int niter = xrand + yrand + xrand * yrand;              
              if (niter > 12)
                niter = 12;
              randiter = 0;
              if(randiter < niter) {
                randiter += 1;
                randint = mod((randint * multiplier + offset), modbase);
                if(randiter < niter) {
                  randiter += 1;
                  randint = mod((randint * multiplier + offset), modbase);
                  if(randiter < niter) {
                    randiter += 1;
                    randint = mod((randint * multiplier + offset), modbase);
                    if(randiter < niter) {
                      randiter += 1;
                      randint = mod((randint * multiplier + offset), modbase);
                      if(randiter < niter) {
                        randiter += 1;
                        randint = mod((randint * multiplier + offset), modbase);
                        if(randiter < niter) {
                          randiter += 1;
                          randint = mod((randint * multiplier + offset), modbase);
                          if(randiter < niter) {
                            randiter += 1;
                            randint = mod((randint * multiplier + offset), modbase);
                            if(randiter < niter) {
                              randiter += 1;
                              randint = mod((randint * multiplier + offset), modbase);
                              if(randiter < niter) {
                                randiter += 1;
                                randint = mod((randint * multiplier + offset), modbase);
                                if(randiter < niter) {
                                  randiter += 1;
                                  randint = mod((randint * multiplier + offset), modbase);
                                  if(randiter < niter) {
                                    randiter += 1;
                                    randint = mod((randint * multiplier + offset), modbase);
                                    if(randiter < niter) {
                                      randiter += 1;
                                      randint = mod((randint * multiplier + offset), modbase);
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            tiletype = mod(randint, 2.0);
          }
        
          if (extended == 0) { 
            if (tiletype < 1.0) {
              r0 = pow((pow(abs(x), n) + pow(abs(y), n)), onen);
              r1 = pow((pow(abs(x - 1.0), n) + pow(abs(y - 1.0), n)), onen);
            } else {
              r0 = pow((pow(abs(x - 1.0), n) + pow(abs(y), n)), onen);
              r1 = pow((pow(abs(x), n) + pow(abs(y - 1.0), n)), onen);
            }
          } else {
            if (tiletype == 1.0) { 
              r0 = pow((pow(abs(x), n) + pow(abs(y), n)), onen);
              r1 = pow((pow(abs(x - 1.0), n) + pow(abs(y - 1.0), n)), onen);
            } else {
              r0 = pow((pow(abs(x - 1.0), n) + pow(abs(y), n)), onen);
              r1 = pow((pow(abs(x), n) + pow(abs(y - 1.0), n)), onen);
            }
          }
    
          r = abs(r0 - 0.5) / rmax;
          if (r < 1.0) {
            if (direct_color == 1) {
              _color = r0;
              if(_color<0.0) {
                _color = 0.0;
              }
              else if(_color>1.0) {
                _color = 1.0;
              }
            }
            _vx += size * (x + floor(_tx));
            _vy += size * (y + floor(_ty));
          }
    
          r = abs(r1 - 0.5) / rmax;
          if (r < 1.0) {
            if (direct_color == 1) {
              _color = 1.0 - r1;
              if(_color<0.0) {
                _color = 0.0;
              }
              else if(_color>1.0) {
                _color = 1.0;
              }
            }
            _vx += size * (x + floor(_tx));
            _vy += size * (y + floor(_ty));
          }
          
        }`;
    }

    get name(): string {
        return 'truchet';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_DC];
    }
}

class Truchet2Func extends VariationShaderFunc2D {
    PARAM_EXPONENT1 = 'exponent1'
    PARAM_EXPONENT2 = 'exponent2'
    PARAM_WIDTH1 = 'width1'
    PARAM_WIDTH2 = 'width2'
    PARAM_SCALE = 'scale'
    PARAM_SEED = 'seed'
    PARAM_INVERSE = 'inverse'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_EXPONENT1, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_EXPONENT2, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_WIDTH1, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_WIDTH2, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 10.00 },
            { name: this.PARAM_SEED, type: VariationParamType.VP_NUMBER, initialValue: 50.00 },
            { name: this.PARAM_INVERSE, type: VariationParamType.VP_NUMBER, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // truchet2 by tatasz
        // https://www.deviantart.com/tatasz/art/Truchet2-plugin-730170455 converted to JWF by Brad Stefanov and Jesus Sosa
        return `{
          float amount = float(${variation.amount});
          float exponent1 = float(${variation.params.get(this.PARAM_EXPONENT1)});
          float exponent2 = float(${variation.params.get(this.PARAM_EXPONENT2)});
          float width1 = float(${variation.params.get(this.PARAM_WIDTH1)});
          float width2 = float(${variation.params.get(this.PARAM_WIDTH2)});
          float scale = float(${variation.params.get(this.PARAM_SCALE)});
          float seed = float(${variation.params.get(this.PARAM_SEED)});
          int inverse = int(${variation.params.get(this.PARAM_INVERSE)});
          
          float xp = abs((_tx / scale - floor(_tx / scale)) - 0.5) * 2.0;
          float width = width1 * (1.0 - xp) + xp * width2;
          width = (width < 1.0) ? width : 1.0;
          if (width <= 0.0) {
            _vx += (_tx) * amount;
            _vy += (_ty) * amount;
          } else {
            float xp2 = exponent1 * (1.0 - xp) + xp * exponent2;
            float n = xp2;
            n = (n < 2.0) ? n : 2.0;
            if (n <= 0.0) {
              _vx += (_tx) * amount;
              _vy += (_ty) * amount;
            } else {
              float onen = 1.0 / xp2;
              seed = abs(seed);
              float seed2 = sqrt(seed + (seed / 2.0) + EPSILON) / ((seed * 0.5) + EPSILON) * 0.25;
                      
              float r0 = 0.0;
              float r1 = 0.0;
        
              float x = _tx;
              float y = _ty;
              float intx = round(x);
              float inty = round(y);
        
              float r = x - float(intx);
              if (r < 0.0)
                x = 1.0 + r;
              else
                x = r;
        
              r = y - float(inty);
              if (r < 0.0)
                y = 1.0 + r;
              else
                y = r;
                        
              float tiletype = 0.0;
              if (seed == 0.0)
                tiletype = 0.0;
              else if (seed == 1.0)
                tiletype = 1.0;
              else {
                float xrand = round(_tx);
                float yrand = round(_ty);
                xrand = xrand * seed2;
                yrand = yrand * seed2;
                float niter = xrand + yrand + xrand * yrand;
                float randint = (niter + seed) * seed2 / 2.0;
                randint = mod((randint * 32747.0 + 12345.0), 65535.0);
                tiletype = mod(randint, 2.0);
              }
                      
              if (tiletype < 1.0) {
                r0 = pow((pow(abs(x), n) + pow(abs(y), n)), onen);
                r1 = pow((pow(abs(x - 1.0), n) + pow(abs(y - 1.0), n)), onen);
              } else {
                r0 = pow((pow(abs(x - 1.0), n) + pow(abs(y), n)), onen);
                r1 = pow((pow(abs(x), n) + pow(abs(y - 1.0), n)), onen);
              }
        
              float rmax = 0.5 * (pow(2.0, onen) - 1.0) * width;
              float r00 = abs(r0 - 0.5) / rmax;
              float r11 = abs(r1 - 0.5) / rmax;
           
              if (inverse == 0) {
                if (r00 < 1.0 || r11 < 1.0) {
                  _vx += (x + floor(_tx)) * amount;
                  _vy += (y + floor(_ty)) * amount;
                } else {  
                  _vx += 100.0;
                  _vy += 100.0;
                }
              } else {
                if (r00 > 1.0 && r11 > 1.0) {
                  _vx += (x + floor(_tx)) * amount;
                  _vy += (y + floor(_ty)) * amount;
                } else {
                  _vx += 10000.0;
                  _vy += 10000.0;
                }
              }
            }
          }
        }`;
    }

    get name(): string {
        return 'truchet2';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TwintrianFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = float(${variation.amount});
          float r = rand8(tex, rngState) * amount * _r;
        
          float sinr = sin(r);
          float cosr = cos(r);
          float diff = log10(sinr * sinr) + cosr;
        
          if (abs(diff) < EPSILON) {
            diff = -30.0;
          }
                  
          _vx += amount * _tx * diff;
          _vy += amount * _tx * (diff - sinr * M_PI);
        }`;
    }

    get funcDependencies(): string[] {
        return [FUNC_LOG10];
    }

    get name(): string {
        return 'twintrian';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TwoFaceFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = float(${variation.amount});
          float r = amount;
          if (_tx > 0.0) {
            r /= sqr(_tx) + sqr(_ty);
          }
          _vx += r * _tx;
          _vy += r * _ty;
        }`;
    }

    get name(): string {
        return 'twoface';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class UnpolarFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float vvar = amount / M_PI;
          float vvar_2 = vvar * 0.5;
          float r = exp(_ty);
          float s = sin(_tx);
          float c = cos(_tx);
          _vy += vvar_2 * r * c;
          _vx += vvar_2 * r * s;  
        }`;
    }

    get name(): string {
        return 'unpolar';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WaffleFunc extends VariationShaderFunc2D {
    PARAM_SLICES = 'slices'
    PARAM_XTHICKNESS = 'xthickness'
    PARAM_YTHICKNESS = 'ythickness'
    PARAM_ROTATION = 'rotation'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SLICES, type: VariationParamType.VP_NUMBER, initialValue: 6 },
            { name: this.PARAM_XTHICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_YTHICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_ROTATION, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Waffle plugin by Jed Kelsey, http://lu-kout.deviantart.com/art/Apophysis-Plugin-Pack-1-v0-4-59907275
        return `{
          float amount = float(${variation.amount});
          int slices = int(${variation.params.get(this.PARAM_SLICES)});
          float xthickness = float(${variation.params.get(this.PARAM_XTHICKNESS)});
          float ythickness = float(${variation.params.get(this.PARAM_YTHICKNESS)});
          float rotation = float(${variation.params.get(this.PARAM_ROTATION)});
          float a = 0.0, r = 0.0;
          int mode = iRand8(tex, 5, rngState);
          float vcosr = amount * cos(rotation);
          float vsinr = amount * sin(rotation);
          if(mode==0) {
            a = (float(iRand8(tex, slices, rngState)) + rand8(tex, rngState) * xthickness) / float(slices);
            r = (float(iRand8(tex, slices, rngState)) + rand8(tex, rngState) * ythickness) / float(slices);
          }
          else if(mode==1) {
            a = (float(iRand8(tex, slices, rngState)) + rand8(tex, rngState)) / float(slices);
            r = (float(iRand8(tex, slices, rngState)) + ythickness) / float(slices);
          }
          else if(mode==2) {
            a = (float(iRand8(tex, slices, rngState)) + xthickness) / float(slices);
            r = (float(iRand8(tex, slices, rngState)) + rand8(tex, rngState)) / float(slices);
          }
          else if(mode==3) {
             a = rand8(tex, rngState);
             r = (float(iRand8(tex, slices, rngState)) + ythickness + rand8(tex, rngState) * (1.0 - ythickness)) / float(slices);
          }
          else { // mode = 4
            a = (float(iRand8(tex, slices, rngState)) + xthickness + rand8(tex, rngState) * (1.0 - xthickness)) / float(slices);
            r = rand8(tex, rngState);
          }
          _vx += (vcosr * a + vsinr * r); 
          _vy += (-vsinr * a + vcosr * r);
        }`;
    }

    get name(): string {
        return 'waffle';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WedgeFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = 'angle'
    PARAM_HOLE = 'hole'
    PARAM_COUNT= 'count'
    PARAM_SWIRL = 'swirl'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: M_PI * 0.5 },
            { name: this.PARAM_HOLE, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_COUNT, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_SWIRL, type: VariationParamType.VP_NUMBER, initialValue: 0.1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Wedge from apo plugins pack */
        return `{
          float amount = float(${variation.amount});
          float angle = float(${variation.params.get(this.PARAM_ANGLE)});
          float hole = float(${variation.params.get(this.PARAM_HOLE)});
          int count = int(${variation.params.get(this.PARAM_COUNT)});
          float swirl = float(${variation.params.get(this.PARAM_SWIRL)});
          
          float r = _r;
          float _theta = atan2(_ty, _tx);
          float a = _theta + swirl * r;
          float c = floor((float(count) * a + M_PI) * (1.0 / M_PI) * 0.5);
        
          float comp_fac = 1.0 - angle * float(count) * (1.0 / M_PI) * 0.5;
        
          a = a * comp_fac + c * angle;
        
          float sa = sin(a);
          float ca = cos(a);
        
          r = amount * (r + hole);
        
          _vx += r * ca;
          _vy += r * sa;
          
        }`;
    }

    get name(): string {
        return 'wedge';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class VogelFunc extends VariationShaderFunc2D {
    PARAM_N = 'n'
    PARAM_SCALE = 'scale'

    M_PHI = 1.61803398874989484820
    M_2PI = 2.0 * M_PI
    M_2PI_PHI2 = this.M_2PI / (this.M_PHI * this.M_PHI)

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue:20 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Vogel function by Victor Ganora
        return `{
          float amount = float(${variation.amount});
          int n = int(${variation.params.get(this.PARAM_N)});
          float scale = float(${variation.params.get(this.PARAM_SCALE)});
          int i = iRand8(tex, n, rngState) + 1;
          float a = float(i) * float(${this.M_2PI_PHI2});
          float sina = sin(a);
          float cosa = cos(a);
          float r = amount * (_r + sqrt(float(i)));
          _vx += r * (cosa + (scale * _tx));
          _vy += r * (sina + (scale * _ty));
        }`;
    }

    get name(): string {
        return 'vogel';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WhorlFunc extends VariationShaderFunc2D {
    PARAM_INSIDE = 'inside'
    PARAM_OUTSIDE = 'outside'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_INSIDE, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_OUTSIDE, type: VariationParamType.VP_NUMBER, initialValue: 0.20 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* whorl from apo plugins pack */
        return `{
          float amount = float(${variation.amount});
          float inside = float(${variation.params.get(this.PARAM_INSIDE)});
          float outside = float(${variation.params.get(this.PARAM_OUTSIDE)});
          float r = _r;
          float a;
          float _theta = atan2(_ty, _tx);
          if (r < amount)
            a = _theta + inside / (amount - r);
          else
            a = _theta + outside / (amount - r);
          float sa = sin(a);
          float ca = cos(a);    
          _vx += amount * r * ca;
          _vy += amount * r * sa;
        }`;
    }

    get name(): string {
        return 'whorl';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class YinYangFunc extends VariationShaderFunc2D {
    PARAM_RADIUS = 'radius'
    PARAM_ANG1 = 'ang1'
    PARAM_ANG2 = 'ang2'
    PARAM_DUAL_T = 'dual_t'
    PARAM_OUTSIDE = 'outside'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_ANG1, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_ANG2, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_DUAL_T, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_OUTSIDE, type: VariationParamType.VP_NUMBER, initialValue: 0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* yin_yang by dark-beam */
        return `{
          float amount = float(${variation.amount});
          float radius = float(${variation.params.get(this.PARAM_RADIUS)});
          float ang1 = float(${variation.params.get(this.PARAM_ANG1)});
          float ang2 = float(${variation.params.get(this.PARAM_ANG2)});
          int dual_t = int(${variation.params.get(this.PARAM_DUAL_T)});
          int outside = int(${variation.params.get(this.PARAM_OUTSIDE)});
          float sina = sin(M_PI * ang1);
          float cosa = cos(M_PI * ang1);
          float sinb = sin(M_PI * ang2);
          float cosb = cos(M_PI * ang2);  
          float xx = _tx;
          float yy = _ty;
          float inv = 1.0;
          float RR = radius;
          float R2 = (xx * xx + yy * yy);
          if (R2 < 1.0) {
            float nx = xx * cosa - yy * sina;
            float ny = xx * sina + yy * cosa;
            if (dual_t == 1 && rand8(tex, rngState) > 0.5) {
              inv = -1.0;
              RR = 1.0 - radius;
              nx = xx * cosb - yy * sinb;
              ny = xx * sinb + yy * cosb;
            }
            xx = nx;
            yy = ny;
            if (yy > 0.0) {
              float t = sqrt(1.0 - yy * yy);
              float k = xx / t;
              float t1 = (t - 0.5) * 2.0;
              float alfa = (1.0 - k) * 0.5;
              float beta = (1.0 - alfa);
              float dx = alfa * (RR - 1.0);
              float k1 = alfa * (RR) + beta;
              _vx += amount * (t1 * k1 + dx) * inv;
              _vy += amount * sqrt(1.0 - t1 * t1) * k1 * inv;
            } else {
              _vx += amount * (xx * (1.0 - RR) + RR) * inv;
              _vy += amount * (yy * (1.0 - RR)) * inv;
            }
          } else if (outside == 1) {
            _vx += amount * _tx;
            _vy += amount * _ty;
          } else {
            _vx += 0.0; 
            _vy += 0.0; 
          }
        }`;
    }

    get name(): string {
        return 'yin_yang';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function registerVars_2D_PartS() {
    VariationShaders.registerVar(new ScryFunc())
    VariationShaders.registerVar(new SecFunc())
    VariationShaders.registerVar(new Secant2Func())
    VariationShaders.registerVar(new SechFunc())
    VariationShaders.registerVar(new SeparationFunc())
    VariationShaders.registerVar(new ShiftFunc())
    VariationShaders.registerVar(new ShredlinFunc())
    VariationShaders.registerVar(new ShredradFunc())
    VariationShaders.registerVar(new SigmoidFunc())
    VariationShaders.registerVar(new SinFunc())
    VariationShaders.registerVar(new SineBlurFunc())
    VariationShaders.registerVar(new SinhFunc())
    VariationShaders.registerVar(new SinhqFunc())
    VariationShaders.registerVar(new SinqFunc())
    VariationShaders.registerVar(new SintrangeFunc())
    VariationShaders.registerVar(new SinusoidalFunc())
    VariationShaders.registerVar(new SphericalFunc())
    VariationShaders.registerVar(new SphericalNFunc())
    VariationShaders.registerVar(new SpiralFunc())
    VariationShaders.registerVar(new SpirographFunc())
    VariationShaders.registerVar(new SplitFunc())
    VariationShaders.registerVar(new SplitsFunc())
    VariationShaders.registerVar(new SquareFunc())
    VariationShaders.registerVar(new SquarizeFunc())
    VariationShaders.registerVar(new SquirrelFunc())
    VariationShaders.registerVar(new SquishFunc())
    VariationShaders.registerVar(new StarBlurFunc())
    VariationShaders.registerVar(new StripesFunc())
    VariationShaders.registerVar(new SwirlFunc())
    VariationShaders.registerVar(new TanFunc())
    VariationShaders.registerVar(new TanhFunc())
    VariationShaders.registerVar(new TanhqFunc())
    VariationShaders.registerVar(new TanCosFunc())
    VariationShaders.registerVar(new TangentFunc())
    VariationShaders.registerVar(new TargetFunc())
    VariationShaders.registerVar(new TargetSpFunc())
    VariationShaders.registerVar(new TradeFunc())
    VariationShaders.registerVar(new TruchetFunc())
    VariationShaders.registerVar(new Truchet2Func())
    VariationShaders.registerVar(new TwintrianFunc())
    VariationShaders.registerVar(new TwoFaceFunc())
    VariationShaders.registerVar(new UnpolarFunc())
    VariationShaders.registerVar(new VogelFunc())
    VariationShaders.registerVar(new WaffleFunc())
    VariationShaders.registerVar(new WedgeFunc())
    VariationShaders.registerVar(new WhorlFunc())
    VariationShaders.registerVar(new YinYangFunc())
}