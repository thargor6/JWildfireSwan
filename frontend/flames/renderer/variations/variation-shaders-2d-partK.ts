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
    FUNC_MODULO, FUNC_SGN
} from 'Frontend/flames/renderer/variations/variation-math-functions';
import {M_PI} from 'Frontend/flames/renderer/mathlib';

/*
  be sure to import this class somewhere and call registerVars_2D_PartK()
 */
class KaleidoscopeFunc extends VariationShaderFunc2D {
    PARAM_PULL = 'pull'
    PARAM_ROTATE = 'rotate'
    PARAM_LINE_UP = 'line_up'
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_PULL, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_ROTATE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_LINE_UP, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Kaleidoscope by Will Evans, http://eevans1.deviantart.com/art/kaleidoscope-plugin-122185469  */
        return `{
          float amount = float(${variation.amount});
          float pull = float(${variation.params.get(this.PARAM_PULL)});
          float rotate = float(${variation.params.get(this.PARAM_ROTATE)});
          float line_up = float(${variation.params.get(this.PARAM_LINE_UP)});
          float x = float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)});
          float _q = pull; 
          float _w = rotate; 
          float _e = line_up;
          float _r = x; 
          float _t = y; 
          if (_ty > 0.0) {
            _vy += ((_w * _ty) * cos(45.0) + _tx * sin(45.0) + _q + _e) + _t;
          } else {
            _vy += (_w * _ty) * cos(45.0) + _tx * sin(45.0) - _q - _e;
          }
        }`;
    }

    get name(): string {
        return 'kaleidoscope';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LaceJSFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Lace variation
         *
         * @author Jesus Sosa
         * @date November 4, 2017
         * based on a work of:
         * http://paulbourke.net/fractals/lace/lace.c
         */
        return `{
          float amount = float(${variation.amount});
          float x = 0.5, y = 0.75;
          float w = 0.0;
          float r = 2.0;
          float r0 = sqrt(_tx * _tx + _ty * _ty);
          float weight = rand8(tex, rngState);
          if (weight > 0.75) {
            w = atan2(_ty, _tx - 1.0);
            y = -r0 * cos(w) / r + 1.0;
            x = -r0 * sin(w) / r;
          } else if (weight > 0.50) {
             w = atan2(_ty - sqrt(3.0) / 2.0, _tx + 0.5);
             y = -r0 * cos(w) / r - 0.5;
             x = -r0 * sin(w) / r + sqrt(3.0) / 2.0;
          } else if (weight > 0.25) {
             w = atan2(_ty + sqrt(3.0) / 2.0, _tx + 0.5);
             y = -r0 * cos(w) / r - 0.5;
             x = -r0 * sin(w) / r - sqrt(3.0) / 2.0;
          } else {
             w = atan2(_ty, _tx);
             y = -r0 * cos(w) / r;
             x = -r0 * sin(w) / r;
          }
          _vx += x * amount;
          _vy += y * amount;
        }`;
    }

    get name(): string {
        return 'lace_js';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LayeredSpiralFunc extends VariationShaderFunc2D {
    PARAM_RADIUS = 'radius'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* layered_spiral by Will Evans, http://eevans1.deviantart.com/art/kaleidoscope-plugin-122185469  */
        return `{
          float amount = float(${variation.amount});
          float radius = float(${variation.params.get(this.PARAM_RADIUS)});
          float a = _tx * radius; 
          float t = sqr(_tx) + sqr(_ty) + EPSILON;
          _vx += amount * a * cos(t);
          _vy += amount * a * sin(t);
        }`;
    }

    get name(): string {
        return 'layered_spiral';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LazySusanFunc extends VariationShaderFunc2D {
    PARAM_SPACE = 'space'
    PARAM_TWIST = 'twist'
    PARAM_SPIN = 'spin'
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPACE, type: VariationParamType.VP_NUMBER, initialValue: 0.40 },
            { name: this.PARAM_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.20},
            { name: this.PARAM_SPIN, type: VariationParamType.VP_NUMBER, initialValue: 0.10},
            { name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.10},
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.20}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Lazysusan in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
          float space = float(${variation.params.get(this.PARAM_SPACE)});
          float twist = float(${variation.params.get(this.PARAM_TWIST)});
          float spin = float(${variation.params.get(this.PARAM_SPIN)});
          float x = float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)}); 
          float xx = _tx - x;
          float yy = _ty + y;
          float rr = sqrt(xx * xx + yy * yy);
          if (rr < amount) {
            float a = atan2(yy, xx) + spin + twist * (amount - rr);
            float sina = sin(a);
            float cosa = cos(a);
            rr = amount * rr;      
            _vx += rr * cosa + x;
            _vy += rr * sina - y;
          } else {
            rr = amount * (1.0 + space / rr);
            _vx += rr * xx + x;
            _vy += rr * yy - y;
          }
        }`;
    }

    get name(): string {
        return 'lazysusan';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LinearFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          _vx += amount * _tx; 
          _vy += amount * _ty;
        }`;
    }

    get name(): string {
        return 'linear';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LinearTFunc extends VariationShaderFunc2D {
    PARAM_POW_X = 'powX'
    PARAM_POW_Y= 'powY'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POW_X, type: VariationParamType.VP_NUMBER, initialValue: 1.2 },
            { name: this.PARAM_POW_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.9}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // linearT by FractalDesire, http://fractaldesire.deviantart.com/journal/linearT-plugin-219864320
        return `{
          float amount = float(${variation.amount});
          float powX = float(${variation.params.get(this.PARAM_POW_X)});
          float powY = float(${variation.params.get(this.PARAM_POW_Y)});
          _vx += sgn(_tx) * pow(abs(_tx), powX) * amount;
          _vy += sgn(_ty) * pow(abs(_ty), powY) * amount;
        }`;
    }

    get name(): string {
        return 'linearT';
    }

    get funcDependencies(): string[] {
        return [FUNC_SGN];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LogFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Natural Logarithm LOG
        // needs precalc_atanyx and precalc_sumsq
        return `{
          float amount = float(${variation.amount});
          float _theta = atan2(_ty, _tx);
          _vx += amount * 0.5 * log(_r2);
          _vy += amount * _theta;
        }`;
    }

    get name(): string {
        return 'log';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LoonieFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Loonie in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
          float r2 = _r2;
          float w2 = amount * amount;
          if (r2 < w2 && r2 != 0.0) {
            float r = amount * sqrt(w2 / r2 - 1.0);
            _vx += r * _tx;
            _vy += r * _ty;
          } else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'loonie';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Loonie2Func extends VariationShaderFunc2D {
    PARAM_RE_A = 'sides'
    PARAM_RE_B = 'star'
    PARAM_RE_C = 'circle'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RE_A, type: VariationParamType.VP_NUMBER, initialValue: 4 },
            { name: this.PARAM_RE_B, type: VariationParamType.VP_NUMBER, initialValue: 0.15 },
            { name: this.PARAM_RE_C, type: VariationParamType.VP_NUMBER, initialValue: 0.25 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* loonie2 by dark-beam, http://dark-beam.deviantart.com/art/Loonie2-update-2-Loonie3-457414891 */
        return `{
          float amount = float(${variation.amount});
          int sides = int(${variation.params.get(this.PARAM_RE_A)});
          float star = float(${variation.params.get(this.PARAM_RE_B)});
          float circle = float(${variation.params.get(this.PARAM_RE_C)});
          float _sqrvvar = amount * amount;
          float a = (2.0*M_PI) / float(sides);
          float _sina = sin(a);
          float _cosa = cos(a);
          a = -(M_PI*0.5) * star;
          float _sins = sin(a);
          float _coss = cos(a);
          a = (M_PI*0.5) * circle;
          float _sinc = sin(a);
          float _cosc = cos(a);
          float xrt = _tx, yrt = _ty, swp;
          float r2 = xrt * _coss + abs(yrt) * _sins; 
          float _circle = sqrt(sqr(xrt) + sqr(yrt));  
          int i = 0;
          if(sides>1) {   
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;           
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins);
            i++; 
          }
          if(sides>2) {   
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;           
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins);
            i++; 
          }
          if(sides>3) {   
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;           
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins);
            i++; 
          }
          if(sides>4) {   
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;           
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins);
            i++; 
          }
          if(sides>5) {   
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;           
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins);
            i++; 
          }
          if(sides>6) {   
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;           
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins);
            i++; 
          }
          if(sides>7) {   
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;           
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins);
            i++; 
          }
          if(sides>8) {   
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;           
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins);
            i++; 
          }
          r2 = r2 * _cosc + _circle * _sinc; 
          if (i > 1) {
            r2 = sqr(r2); 
          } else {
            r2 = abs(r2) * r2; 
          }
          if (r2 > 0.0 && (r2 < _sqrvvar)) {
            float r = amount * sqrt(abs(_sqrvvar / r2 - 1.0));
            _vx += r * _tx;
            _vy += r * _ty;
          } else if (r2 < 0.0) {
            float r = amount / sqrt(abs(_sqrvvar / r2) - 1.0);
            _vx += r * _tx;
            _vy += r * _ty;
          } else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'loonie2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class MCarpetFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_TWIST = 'twist'
    PARAM_TILT = 'tilt'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.75 },
            { name: this.PARAM_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_TILT, type: VariationParamType.VP_NUMBER, initialValue: -0.25 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* mcarpet from FracFx, http://fracfx.deviantart.com/art/FracFx-Plugin-Pack-171806681 */
        return `{
          float amount = float(${variation.amount});
          float x = float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)});   
          float twist = float(${variation.params.get(this.PARAM_TWIST)});
          float tilt = float(${variation.params.get(this.PARAM_TILT)});
          float T = ((sqr(_tx) + sqr(_ty)) / 4.0 + 1.0);
          float r = amount / T;
          _vx += _tx * r * x;
          _vy += _ty * r * y;
          _vx += (1.0 - (twist * sqr(_tx)) + _ty) * amount;
          _vy += tilt * _tx * amount;   
        }`;
    }

    get name(): string {
        return 'mcarpet';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class MobiusFunc extends VariationShaderFunc2D {
    PARAM_RE_A = 're_a'
    PARAM_RE_B = 're_b'
    PARAM_RE_C = 're_c'
    PARAM_RE_D = 're_d'
    PARAM_IM_A = 'im_a'
    PARAM_IM_B = 'im_b'
    PARAM_IM_C = 'im_c'
    PARAM_IM_D = 'im_d'
    get params(): VariationParam[] {
        return [{ name: this.PARAM_RE_A, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_RE_B, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_RE_C, type: VariationParamType.VP_NUMBER, initialValue: -0.15 },
            { name: this.PARAM_RE_C, type: VariationParamType.VP_NUMBER, initialValue: 0.21 },
            { name: this.PARAM_IM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_IM_B, type: VariationParamType.VP_NUMBER, initialValue: -0.12 },
            { name: this.PARAM_IM_C, type: VariationParamType.VP_NUMBER, initialValue: -0.15 },
            { name: this.PARAM_IM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.10 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Mobius, by eralex
        return `{
          float amount = float(${variation.amount});
          float re_a = float(${variation.params.get(this.PARAM_RE_A)});
          float re_b = float(${variation.params.get(this.PARAM_RE_B)});
          float re_c = float(${variation.params.get(this.PARAM_RE_C)});
          float re_d = float(${variation.params.get(this.PARAM_RE_D)});
          float im_a = float(${variation.params.get(this.PARAM_IM_A)});
          float im_b = float(${variation.params.get(this.PARAM_IM_B)});
          float im_c = float(${variation.params.get(this.PARAM_IM_C)});
          float im_d = float(${variation.params.get(this.PARAM_IM_D)});
          float re_u = re_a * _tx - im_a * _ty + re_b;
          float im_u = re_a * _ty + im_a * _tx + im_b;
          float re_v = re_c * _tx - im_c * _ty + re_d;
          float im_v = re_c * _ty + im_c * _tx + im_d;
          float d = (re_v * re_v + im_v * im_v);
          if (d != 0.0) {
            float rad_v = amount / d;
            _vx += rad_v * (re_u * re_v + im_u * im_v);
            _vy += rad_v * (im_u * re_v - re_u * im_v);       
          }
        }`;
    }

    get name(): string {
        return 'mobius';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ModulusFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.50 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Modulus in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
          float x = float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)});
          float _xr = 2.0 * x;
          float _yr = 2.0 * y;
          if (_tx > x) {
            _vx += amount * (-x + mod(_tx + x, _xr));
          } else if (_tx < -x) {
            _vx += amount * (x - mod(x - _tx, _xr));
          } else {
            _vx += amount * _tx;
          }        
          if (_ty > y) {
            _vy += amount * (-y + mod(_ty + y, _yr));
          } else if (_ty < -y) {
            _vy += amount * (y - mod(y - _ty, _yr));
          } else {
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'modulus';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class NGonFunc extends VariationShaderFunc2D {
    PARAM_CIRCLE = 'circle'
    PARAM_CORNERS = 'corners'
    PARAM_POWER = 'power'
    PARAM_SIDES = 'sides'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CIRCLE, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CORNERS, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3.0 },
            { name: this.PARAM_SIDES, type: VariationParamType.VP_NUMBER, initialValue: 5.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* ngon by Joel Faber (09/06) */
        return `{
          float amount = float(${variation.amount});
          float circle = float(${variation.params.get(this.PARAM_CIRCLE)});
          float corners = float(${variation.params.get(this.PARAM_CORNERS)});
          float power = float(${variation.params.get(this.PARAM_POWER)});
          float sides = float(${variation.params.get(this.PARAM_SIDES)});

          float r_factor = pow(_r2, power / 2.0);
          float theta = atan2(_ty, _tx);
          float b = 2.0 * M_PI / sides;
          float phi = theta - (b * floor(theta / b));
          if (phi > b / 2.0)
            phi -= b;
        
          float amp = corners * (1.0 / (cos(phi) + EPSILON) - 1.0) + circle;
          amp /= (r_factor + EPSILON);
        
          _vx += amount * _tx * amp;
          _vy += amount * _ty * amp;
        }`;
    }

    get name(): string {
        return 'ngon';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class NPolarFunc extends VariationShaderFunc2D {
    PARAM_PARITY = 'parity'
    PARAM_N = 'n'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_PARITY, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          int parity = int(${variation.params.get(this.PARAM_PARITY)});
          int n = int(${variation.params.get(this.PARAM_N)});

          int _nnz = (n == 0) ? 1 : n;
          float _vvar = amount / M_PI;
          float _vvar_2 = _vvar * 0.5;
          float _absn = abs(float(_nnz));
          float _cn = 1.0 / float(_nnz) / 2.0;
          int _isodd = modulo((parity > 0 ? parity: -parity), 2); 
          float x = (_isodd != 0) ? _tx : _vvar * atan2(_tx, _ty);
          float y = (_isodd != 0) ? _ty : _vvar_2 * log(_tx * _tx + _ty * _ty);
          float angle = (atan2(y, x) + (2.0*M_PI) * float(modulo( int(rand8(tex, rngState)*32768.0), int(_absn)))) / float(_nnz);
          float r = amount * pow(sqr(x) + sqr(y), _cn) * ((_isodd == 0) ? 1.0 : float(parity));
          float sina = sin(angle);
          float cosa = cos(angle);
          cosa *= r;
          sina *= r;
          x = (_isodd != 0) ? cosa : (_vvar_2 * log(cosa * cosa + sina * sina));
          y = (_isodd != 0) ? sina : (_vvar * atan2(cosa, sina));
          _vx += x;
          _vy += y;
        }`;
    }

    get name(): string {
        return 'npolar';
    }


    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class OscilloscopeFunc extends VariationShaderFunc2D {
    PARAM_SEPARATION = 'separation'
    PARAM_FREQUENCY = 'frequency'
    PARAM_AMPLITUDE = 'amplitude'
    PARAM_DAMPING = 'damping'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SEPARATION, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_FREQUENCY, type: VariationParamType.VP_NUMBER, initialValue: M_PI },
            { name: this.PARAM_AMPLITUDE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_DAMPING, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* oscilloscope from the apophysis plugin pack */
        return `{
          float amount = float(${variation.amount});
          float separation = float(${variation.params.get(this.PARAM_SEPARATION)});
          float frequency = float(${variation.params.get(this.PARAM_FREQUENCY)});
          float amplitude = float(${variation.params.get(this.PARAM_AMPLITUDE)});
          float damping = float(${variation.params.get(this.PARAM_DAMPING)});
          float _tpf = 2.0 * M_PI * frequency;
          bool _noDamping = abs(damping) <= EPSILON;
          float t;
          if (_noDamping) {
            t = amplitude * cos(_tpf * _tx) + separation;
          } else {
            t = amplitude * exp(-abs(_tx) * damping) * cos(_tpf * _tx) + separation;
          }        
          if (abs(_ty) <= t) {
            _vx += amount * _tx;
            _vy -= amount * _ty;
          } else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'oscilloscope';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Oscilloscope2Func extends VariationShaderFunc2D {
    PARAM_SEPARATION = 'separation'
    PARAM_FREQUENCYX = 'frequencyx'
    PARAM_FREQUENCYY = 'frequencyy'
    PARAM_AMPLITUDE = 'amplitude'
    PARAM_PERTUBATION = 'perturbation'
    PARAM_DAMPING = 'damping'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SEPARATION, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_FREQUENCYX, type: VariationParamType.VP_NUMBER, initialValue: M_PI },
            { name: this.PARAM_FREQUENCYY, type: VariationParamType.VP_NUMBER, initialValue: M_PI },
            { name: this.PARAM_AMPLITUDE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_PERTUBATION, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_DAMPING, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* oscilloscope from the apophysis plugin pack tweak darkbeam */
        return `{
          float amount = float(${variation.amount});
          float separation = float(${variation.params.get(this.PARAM_SEPARATION)});
          float frequencyx = float(${variation.params.get(this.PARAM_FREQUENCYX)});
          float frequencyy = float(${variation.params.get(this.PARAM_FREQUENCYY)});
          float amplitude = float(${variation.params.get(this.PARAM_AMPLITUDE)});
          float perturbation = float(${variation.params.get(this.PARAM_PERTUBATION)});
          float damping = float(${variation.params.get(this.PARAM_DAMPING)});
          float _tpf = 2.0 * M_PI * frequencyx;
          float _tpf2 = 2.0 * M_PI * frequencyy;
          bool _noDamping = abs(damping) <= EPSILON;
          float t;
          float pt = perturbation * sin(_tpf2 * _ty);
          if (_noDamping) {
            t = amplitude * (cos(_tpf * _tx + pt)) + separation;
          } else {
            t = amplitude * exp(-abs(_tx) * damping) * (cos(_tpf * _tx + pt)) + separation;
          }
          if (abs(_ty) <= t) {
            _vx -= amount * _tx;
            _vy -= amount * _ty;
          } else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'oscilloscope2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Panorama1Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // author Tatyana Zabanova 2017. Implemented by DarkBeam 2017
        return `{
          float amount = float(${variation.amount});
          float aux = 1.0 / sqrt(_tx * _tx + _ty * _ty + 1.0);
          float x1 = _tx * aux;
          float y1 = _ty * aux;
          aux = sqrt(x1 * x1 + y1 * y1);
          _vx += amount * (atan2(x1, y1)) * (1.0 / M_PI);
          _vy += amount * (aux - 0.5);       
        }`;
    }

    get name(): string {
        return 'panorama1';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ParabolaFunc extends VariationShaderFunc2D {
    PARAM_WIDTH = 'width'
    PARAM_HEIGHT = 'height'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_WIDTH, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_HEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cyberxaos, 4/2007 */
         return `{
          float amount = float(${variation.amount});
          float width = float(${variation.params.get(this.PARAM_WIDTH)});
          float height = float(${variation.params.get(this.PARAM_HEIGHT)});
          float r = _r;
          float sr = sin(r);
          float cr = cos(r);
          _vx += height * amount * sr * sr * rand8(tex, rngState);
          _vy += width * amount * cr * rand8(tex, rngState);
        }`;
    }

    get name(): string {
        return 'parabola';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PDJFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 3.5 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 4.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float a = float(${variation.params.get(this.PARAM_A)});
          float b = float(${variation.params.get(this.PARAM_B)});
          float c = float(${variation.params.get(this.PARAM_C)});
          float d = float(${variation.params.get(this.PARAM_D)});
          _vx += amount * (sin(a * _ty) - cos(b * _tx));
          _vy += amount * (sin(c * _tx) - cos(d * _ty));
        }`;
    }

    get name(): string {
        return 'pdj';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PerspectiveFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = 'angle'
    PARAM_DIST = 'dist'
    PARAM_C = 'c'
    PARAM_D = 'd'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.62 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 2.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float angle = float(${variation.params.get(this.PARAM_ANGLE)});
          float dist = float(${variation.params.get(this.PARAM_DIST)});
          float ang = angle * M_PI / 2.0;
          float vsin = sin(ang);
          float vfcos = dist * cos(ang);
          float d = (dist - _ty * vsin);
          if (d != 0.0) {
            float t = 1.0 / d;
            _vx += amount * dist * _tx * t;
            _vy += amount * vfcos * _ty * t;   
          }
        }`;
    }

    get name(): string {
        return 'perspective';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PetalFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // petal by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = float(${variation.amount});
          float a = cos(_tx);
          float bx = (cos(_tx) * cos(_ty)) * (cos(_tx) * cos(_ty)) * (cos(_tx) * cos(_ty));
          float by = (sin(_tx) * cos(_ty)) * (sin(_tx) * cos(_ty)) * (sin(_tx) * cos(_ty));
          _vx += amount * a * bx;
          _vy += amount * a * by;          
        }`;
    }

    get name(): string {
        return 'petal';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PieFunc extends VariationShaderFunc2D {
    PARAM_SLICES = 'slices'
    PARAM_ROTATION = 'rotation'
    PARAM_THICKNESS = 'thickness'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SLICES, type: VariationParamType.VP_NUMBER, initialValue: 6.0 },
            { name: this.PARAM_ROTATION, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
          return `{
          float amount = float(${variation.amount});
          float slices = float(${variation.params.get(this.PARAM_SLICES)});
          float rotation = float(${variation.params.get(this.PARAM_ROTATION)});
          float thickness = float(${variation.params.get(this.PARAM_THICKNESS)});
          int sl = int(rand8(tex, rngState) * slices + 0.5);
          float a = rotation + 2.0 * M_PI * (float(sl) + rand8(tex, rngState) * thickness) / slices;
          float r = amount * rand8(tex, rngState);
          float sina = sin(a);
          float cosa = cos(a);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'pie';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PolarFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount =float(${variation.amount});
          float R_PI = 0.31830989;
          float ny = sqrt(_tx * _tx + _ty * _ty) - 1.0;
          _vx += amount * (_phi * R_PI);
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'polar';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Polar2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* polar2 from the apophysis plugin pack */
        return `{
          float amount = float(${variation.amount});
          float R_PI = 0.31830989;
          float p2v = amount / M_PI;
          _vx += p2v * _phi;
          _vy += p2v / 2.0 * log(_r2);
        }`;
    }

    get name(): string {
        return 'polar2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PopcornFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float dx = tan(3.0 * _ty);
          if (dx != dx)
            dx = 0.0;
          float dy = tan(3.0 * _tx);
          if (dy != dy)
            dy = 0.0;
          float nx = _tx + float(${xform.c20}) * sin(dx);
          float ny = _ty + float(${xform.c21}) * sin(dy);
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'popcorn';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Popcorn2Func extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_C = 'c'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 1.5 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* popcorn2 from the apophysis plugin pack */
        return `{
          float amount = float(${variation.amount});
          float x = float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)});
          float c = float(${variation.params.get(this.PARAM_C)});
          _vx += amount * (_tx + x * sin(tan(_ty * c)));
          _vy += amount * (_ty + y * sin(tan(_tx * c)));
        }`;
    }

    get name(): string {
        return 'popcorn2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PowerFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount =float(${variation.amount});
          float r = amount * pow(_r, _tx / _r);
          _vx += r * _ty / _r;
          _vy += r * _tx / _r;
        }`;
    }

    get name(): string {
        return 'power';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PyramidFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // pyramid by Zueuk (transcribed into jwf by Dark)
        return `{
          float amount =float(${variation.amount});
          float x = _tx;
          x = x * x * x;
          float y = _ty;
          y = y * y * y;
          float z = _tz;
          z = abs(z * z * z);
          float r = amount / (abs(x) + abs(y) + z + 0.000000001);
          _vx += x * r;
          _vy += y * r;
          _vz += z * r;
        }`;
    }

    get name(): string {
        return 'pyramid';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RaysFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = float(${variation.amount});
          float ang = amount * rand8(tex, rngState) * M_PI;
          float r = amount / (_r2 + EPSILON);
          float tanr = amount * tan(ang) * r;
          _vx += tanr * cos(_tx);
          _vy += tanr * sin(_ty);
        }`;
    }

    get name(): string {
        return 'rays';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rays1Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // rays by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = float(${variation.amount});
          float t = sqr(_tx) + sqr(_ty);
          float u = 1.0 / tan(sqrt(t)) + (amount * sqr((2.0 / M_PI)));
          _vx = amount * u * t / _tx;
          _vy = amount * u * t / _ty;
        }`;
    }

    get name(): string {
        return 'rays1';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rays2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // rays2 by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = float(${variation.amount});
          float t = sqr(_tx) + sqr(_ty);
          float u = 1.0 / cos((t + EPSILON) * tan(1.0 / t + EPSILON)); 
          _vx = (amount / 10.0) * u * t / _tx;
          _vy = (amount / 10.0) * u * t / _ty;
        }`;
    }

    get name(): string {
        return 'rays2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rays3Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // rays3 by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = float(${variation.amount});
          float t = sqr(_tx) + sqr(_ty);
          float u = 1.0 / sqrt(cos(sin(sqr(t) + EPSILON) * sin(1.0 / sqr(t) + EPSILON)));
          _vx = (amount / 10.0) * u * cos(t) * t / _tx;
          _vy = (amount / 10.0) * u * tan(t) * t / _ty;
        }`;
    }

    get name(): string {
        return 'rays3';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RectanglesFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float x =float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)});
          if (abs(x) < EPSILON) {
            _vx += amount * _tx;
          } else {
            _vx += amount * ((2.0 * floor(_tx / x) + 1.0) * x - _tx);
          }
          if (abs(y) < EPSILON) {
            _vy += amount * _ty;
          } else {
            _vy += amount * ((2.0 * floor(_ty / y) + 1.0) * y - _ty);
          }
        }`;
    }

    get name(): string {
        return 'rectangles';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RingsFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float dx = float(${xform.c20 * xform.c21}) + EPSILON;
          float r = _r;
          r = r + dx - float(int((r + dx) / (2.0 * dx))) * 2.0 * dx - dx + r * (1.0 - dx);
          _vx += r * _ty / _r;
          _vy += r * _tx / _r;
        }`;
    }

    get name(): string {
        return 'rings';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rings2Func extends VariationShaderFunc2D {
    PARAM_VAL = 'val'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_VAL, type: VariationParamType.VP_NUMBER, initialValue: 0.01 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float val =float(${variation.params.get(this.PARAM_VAL)});
          float _dx = val * val + EPSILON;
          float l = _r;
          if (_dx != 0.0 && l != 0.0) {
            float r = amount * (2.0 - _dx * float(int(((l / _dx + 1.0) / 2.0) * 2.0 / l + 1.0)));
            _vx += r * _tx;
            _vy += r * _ty;
          }
        }`;
    }

    get name(): string {
        return 'rings2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RoseWFFunc extends VariationShaderFunc2D {
    PARAM_AMP = 'amp'
    PARAM_WAVES = 'waves'
    PARAM_FILLED = 'filled'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_AMP, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_WAVES, type: VariationParamType.VP_NUMBER, initialValue: 4 },
            { name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
         return `{
          float amount = float(${variation.amount});
          float a = _phi;
          int waves = int(${variation.params.get(this.PARAM_WAVES)});
          float filled = float(${variation.params.get(this.PARAM_FILLED)});
          float amp = float(${variation.params.get(this.PARAM_AMP)});
          float r = amp * cos(float(waves) * a);
        
          if (filled > 0.0 && filled > rand8(tex, rngState)) {
             r *= rand8(tex, rngState);
          }
        
          float nx = sin(a) * r;
          float ny = cos(a) * r;
        
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'rose_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

export function registerVars_2D_PartK() {
    VariationShaders.registerVar(new KaleidoscopeFunc())
    VariationShaders.registerVar(new LaceJSFunc())
    VariationShaders.registerVar(new LayeredSpiralFunc())
    VariationShaders.registerVar(new LazySusanFunc())
    VariationShaders.registerVar(new LinearFunc())
    VariationShaders.registerVar(new LinearTFunc())
    VariationShaders.registerVar(new LogFunc())
    VariationShaders.registerVar(new LoonieFunc())
    VariationShaders.registerVar(new Loonie2Func())
    VariationShaders.registerVar(new MCarpetFunc())
    VariationShaders.registerVar(new MobiusFunc())
    VariationShaders.registerVar(new ModulusFunc())
    VariationShaders.registerVar(new NGonFunc())
    VariationShaders.registerVar(new NPolarFunc())
    VariationShaders.registerVar(new OscilloscopeFunc())
    VariationShaders.registerVar(new Oscilloscope2Func())
    VariationShaders.registerVar(new Panorama1Func())
    VariationShaders.registerVar(new ParabolaFunc())
    VariationShaders.registerVar(new PDJFunc())
    VariationShaders.registerVar(new PerspectiveFunc())
    VariationShaders.registerVar(new PetalFunc())
    VariationShaders.registerVar(new PieFunc())
    VariationShaders.registerVar(new PolarFunc())
    VariationShaders.registerVar(new Polar2Func())
    VariationShaders.registerVar(new PopcornFunc())
    VariationShaders.registerVar(new Popcorn2Func())
    VariationShaders.registerVar(new PowerFunc())
    VariationShaders.registerVar(new PyramidFunc())
    VariationShaders.registerVar(new RaysFunc())
    VariationShaders.registerVar(new Rays1Func())
    VariationShaders.registerVar(new Rays2Func())
    VariationShaders.registerVar(new Rays3Func())
    VariationShaders.registerVar(new RectanglesFunc())
    VariationShaders.registerVar(new RingsFunc())
    VariationShaders.registerVar(new Rings2Func())
    VariationShaders.registerVar(new RoseWFFunc())
}
