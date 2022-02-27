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
    FUNC_MODULO,
    FUNC_SGN,
    FUNC_SINH,
    FUNC_TANH
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

export function registerVars_2D_PartK() {
    VariationShaders.registerVar(new KaleidoscopeFunc())
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
    VariationShaders.registerVar(new ParabolaFunc())
    VariationShaders.registerVar(new PDJFunc())
    VariationShaders.registerVar(new PetalFunc())
    VariationShaders.registerVar(new PieFunc())
    VariationShaders.registerVar(new PolarFunc())
    VariationShaders.registerVar(new Polar2Func())
    VariationShaders.registerVar(new PopcornFunc())
    VariationShaders.registerVar(new Popcorn2Func())
    VariationShaders.registerVar(new PowerFunc())
    VariationShaders.registerVar(new RaysFunc())
    VariationShaders.registerVar(new Rays1Func())
    VariationShaders.registerVar(new Rays2Func())
    VariationShaders.registerVar(new Rays3Func())
    VariationShaders.registerVar(new RectanglesFunc())
    VariationShaders.registerVar(new RingsFunc())
    VariationShaders.registerVar(new Rings2Func())
    VariationShaders.registerVar(new RoseWFFunc())
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
    VariationShaders.registerVar(new TwintrianFunc())
    VariationShaders.registerVar(new TwoFaceFunc())
    VariationShaders.registerVar(new UnpolarFunc())
    VariationShaders.registerVar(new WedgeFunc())
    VariationShaders.registerVar(new WhorlFunc())
    VariationShaders.registerVar(new VogelFunc())
    VariationShaders.registerVar(new YinYangFunc())
}
