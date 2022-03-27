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
import {FUNC_MODULO, FUNC_ROUND, FUNC_SGN} from 'Frontend/flames/renderer/variations/variation-math-functions';
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
          float amount = ${variation.amount.toWebGl()};
          float pull = ${variation.params.get(this.PARAM_PULL)!.toWebGl()};
          float rotate = ${variation.params.get(this.PARAM_ROTATE)!.toWebGl()};
          float line_up = ${variation.params.get(this.PARAM_LINE_UP)!.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float radius = ${variation.params.get(this.PARAM_RADIUS)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float space = ${variation.params.get(this.PARAM_SPACE)!.toWebGl()};
          float twist = ${variation.params.get(this.PARAM_TWIST)!.toWebGl()};
          float spin = ${variation.params.get(this.PARAM_SPIN)!.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()}; 
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

class LazyTravisFunc extends VariationShaderFunc2D {
    PARAM_SPIN_IN = 'spin_in'
    PARAM_SPIN_OUT = 'spin_out'
    PARAM_SPACE = 'space'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPIN_IN, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SPIN_OUT, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_SPACE, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* lazyTravis by Michael Faber, http://michaelfaber.deviantart.com/art/LazyTravis-270731558 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float spin_in = ${variation.params.get(this.PARAM_SPIN_IN)!.toWebGl()};
          float spin_out = ${variation.params.get(this.PARAM_SPIN_OUT)!.toWebGl()};
          float space = ${variation.params.get(this.PARAM_SPACE)!.toWebGl()};
          float _spin_in = 4.0 * spin_in;
          float _spin_out = 4.0 * spin_out;
          float x = abs(_tx);
          float y = abs(_ty);
          float s;
          float p;
          float x2, y2;
          if (x > amount || y > amount) {
            if (x > y) {
              s = x;
              if (_tx > 0.0) {
                p = s + _ty + s * _spin_out;
              } else {
                p = 5.0 * s - _ty + s * _spin_out;
              }
            } else {
              s = y;
              if (_ty > 0.0) {
                p = 3.0 * s - _tx + s * _spin_out;
              } else {
                p = 7.0 * s + _tx + s * _spin_out;
              }
            }
            p = mod(p, s * 8.0);
        
            if (p <= 2.0 * s) {
              x2 = s + space;
              y2 = -(1.0 * s - p);
              y2 = y2 + y2 / s * space;
            } 
            else if (p <= 4.0 * s) {
              y2 = s + space;
              x2 = (3.0 * s - p);
              x2 = x2 + x2 / s * space;
            } 
            else if (p <= 6.0 * s) {
              x2 = -(s + space);
              y2 = (5.0 * s - p);
              y2 = y2 + y2 / s * space;
            } else {
              y2 = -(s + space);
              x2 = -(7.0 * s - p);
              x2 = x2 + x2 / s * space;
            }
            _vx += amount * x2;
            _vy += amount * y2;
          } else {
            if (x > y) {
              s = x;
              if (_tx > 0.0) {
                p = s + _ty + s * _spin_in;
              } else {
                p = 5.0 * s - _ty + s * _spin_in;
              }
            } else {
              s = y;
              if (_ty > 0.0) {
                p = 3.0 * s - _tx + s * _spin_in;
              } else {
                p = 7.0 * s + _tx + s * _spin_in;
              }
            }
            p = mod(p, s * 8.0);
            if (p <= 2.0 * s) {
              _vx += amount * s;
              _vy -= amount * (s - p);
            } else if (p <= 4.0 * s) {
              _vx += amount * (3.0 * s - p);
              _vy += amount * s;
            } else if (p <= 6.0 * s) {
              _vx -= amount * s;
              _vy += amount * (5.0 * s - p);
            } else {
              _vx -= amount * (7.0 * s - p);
              _vy -= amount * s;
            }
          }
        }`;
    }

    get name(): string {
        return 'lazyTravis';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LinearFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float powX = ${variation.params.get(this.PARAM_POW_X)!.toWebGl()};
          float powY = ${variation.params.get(this.PARAM_POW_Y)!.toWebGl()};
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

class LissajousFunc extends VariationShaderFunc2D {
    PARAM_TMIN = 'tmin'
    PARAM_TMAX = 'tmax'
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'
    PARAM_E = 'e'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_TMIN, type: VariationParamType.VP_NUMBER, initialValue: -M_PI },
            { name: this.PARAM_TMAX, type: VariationParamType.VP_NUMBER, initialValue: M_PI },
            { name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Lissajous plugin by Jed Kelsey, http://lu-kout.deviantart.com/art/Apophysis-Plugin-Pack-1-v0-4-59907275
        return `{
          float amount = ${variation.amount.toWebGl()};
          float tmin = ${variation.params.get(this.PARAM_TMIN)!.toWebGl()};
          float tmax = ${variation.params.get(this.PARAM_TMAX)!.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float t = (tmax - tmin) * rand8(tex, rngState) + tmin;
          float y = rand8(tex, rngState) - 0.5;
          float x1 = sin(a * t + d);
          float y1 = sin(b * t);
          _vx += amount * (x1 + c * t + e * y);
          _vy += amount * (y1 + c * t + e * y);
        }`;
    }

    get name(): string {
        return 'lissajous';
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          int sides = ${variation.params.get(this.PARAM_RE_A)!.toWebGl()};
          float star = ${variation.params.get(this.PARAM_RE_B)!.toWebGl()};
          float circle = ${variation.params.get(this.PARAM_RE_C)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};   
          float twist = ${variation.params.get(this.PARAM_TWIST)!.toWebGl()};
          float tilt = ${variation.params.get(this.PARAM_TILT)!.toWebGl()};
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
            { name: this.PARAM_RE_D, type: VariationParamType.VP_NUMBER, initialValue: 0.21 },
            { name: this.PARAM_IM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_IM_B, type: VariationParamType.VP_NUMBER, initialValue: -0.12 },
            { name: this.PARAM_IM_C, type: VariationParamType.VP_NUMBER, initialValue: -0.15 },
            { name: this.PARAM_IM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.10 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Mobius, by eralex
        return `{
          float amount = ${variation.amount.toWebGl()};
          float re_a = ${variation.params.get(this.PARAM_RE_A)!.toWebGl()};
          float re_b = ${variation.params.get(this.PARAM_RE_B)!.toWebGl()};
          float re_c = ${variation.params.get(this.PARAM_RE_C)!.toWebGl()};
          float re_d = ${variation.params.get(this.PARAM_RE_D)!.toWebGl()};
          float im_a = ${variation.params.get(this.PARAM_IM_A)!.toWebGl()};
          float im_b = ${variation.params.get(this.PARAM_IM_B)!.toWebGl()};
          float im_c = ${variation.params.get(this.PARAM_IM_C)!.toWebGl()};
          float im_d = ${variation.params.get(this.PARAM_IM_D)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float circle = ${variation.params.get(this.PARAM_CIRCLE)!.toWebGl()};
          float corners = ${variation.params.get(this.PARAM_CORNERS)!.toWebGl()};
          float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float sides = ${variation.params.get(this.PARAM_SIDES)!.toWebGl()};

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
          float amount = ${variation.amount.toWebGl()};
          int parity = ${variation.params.get(this.PARAM_PARITY)!.toWebGl()};
          int n = ${variation.params.get(this.PARAM_N)!.toWebGl()};

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
          float amount = ${variation.amount.toWebGl()};
          float separation = ${variation.params.get(this.PARAM_SEPARATION)!.toWebGl()};
          float frequency = ${variation.params.get(this.PARAM_FREQUENCY)!.toWebGl()};
          float amplitude = ${variation.params.get(this.PARAM_AMPLITUDE)!.toWebGl()};
          float damping = ${variation.params.get(this.PARAM_DAMPING)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float separation = ${variation.params.get(this.PARAM_SEPARATION)!.toWebGl()};
          float frequencyx = ${variation.params.get(this.PARAM_FREQUENCYX)!.toWebGl()};
          float frequencyy = ${variation.params.get(this.PARAM_FREQUENCYY)!.toWebGl()};
          float amplitude = ${variation.params.get(this.PARAM_AMPLITUDE)!.toWebGl()};
          float perturbation = ${variation.params.get(this.PARAM_PERTUBATION)!.toWebGl()};
          float damping = ${variation.params.get(this.PARAM_DAMPING)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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

class Panorama2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // author Tatyana Zabanova 2017. Implemented by DarkBeam 2017
        return `{
          float amount = ${variation.amount.toWebGl()};
          float aux = 1.0 / (sqrt(_tx * _tx + _ty * _ty) + 1.0);
          float x1 = _tx * aux;
          float y1 = _ty * aux;
          aux = sqrt(x1 * x1 + y1 * y1);
          _vx += amount * (atan2(x1, y1)) / M_PI;
          _vy += amount * (aux - 0.5);
        }`;
    }

    get name(): string {
        return 'panorama2';
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
          float amount = ${variation.amount.toWebGl()};
          float width = ${variation.params.get(this.PARAM_WIDTH)!.toWebGl()};
          float height = ${variation.params.get(this.PARAM_HEIGHT)!.toWebGl()};
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

class ParallelFunc extends VariationShaderFunc2D {
    PARAM_X1WIDTH = 'x1width'
    PARAM_X1TILESIZE = 'x1tilesize'
    PARAM_X1MOD1 = 'x1mod1'
    PARAM_X1MOD2 = 'x1mod2'
    PARAM_X1HEIGHT = 'x1height'
    PARAM_X1MOVE = 'x1move'
    PARAM_X2WIDTH = 'x2width'
    PARAM_X2TILESIZE = 'x2tilesize'
    PARAM_X2MOD1 = 'x2mod1'
    PARAM_X2MOD2 = 'x2mod2'
    PARAM_X2HEIGHT = 'x2height'
    PARAM_X2MOVE = 'x2move'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X1WIDTH, type: VariationParamType.VP_NUMBER, initialValue: 5.0 },
            { name: this.PARAM_X1TILESIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_X1MOD1, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_X1MOD1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_X1HEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_X1MOVE, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_X2WIDTH, type: VariationParamType.VP_NUMBER, initialValue: 5.0 },
            { name: this.PARAM_X2TILESIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_X2MOD1, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_X2MOD2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_X2HEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_X2MOVE, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* parallel by Brad Stefanov */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x1width = float(${variation.params.get(this.PARAM_X1WIDTH)});
          float x1tilesize = float(${variation.params.get(this.PARAM_X1TILESIZE)});
          float x1mod1 = float(${variation.params.get(this.PARAM_X1MOD1)});
          float x1mod2 = float(${variation.params.get(this.PARAM_X1MOD2)});       
          float x1height = float(${variation.params.get(this.PARAM_X1HEIGHT)});
          float x1move = float(${variation.params.get(this.PARAM_X1MOVE)});
          float x2width = float(${variation.params.get(this.PARAM_X2WIDTH)});
          float x2tilesize = float(${variation.params.get(this.PARAM_X2TILESIZE)});
          float x2mod1 = float(${variation.params.get(this.PARAM_X2MOD1)});
          float x2mod2 = float(${variation.params.get(this.PARAM_X2MOD2)});
          float x2height = float(${variation.params.get(this.PARAM_X2HEIGHT)});
          float x2move = float(${variation.params.get(this.PARAM_X2MOVE)});
          float _xr1 = x1mod2 * x1mod1;
          float _xr2 = x2mod2 * x2mod1; 
          if (rand8(tex, rngState) < 0.5) {
            float x1 = -x1width;
            if (rand8(tex, rngState) < 0.5)
              x1 = x1width; 
            _vx += x1tilesize * (_tx + round(x1 * log(rand8(tex, rngState))));
            
            if (_ty > x1mod1) {
             _vy += x1height * (-x1mod1 + mod(_ty + x1mod1, _xr1)) + amount * x1move;
            } else if (_ty < -x1mod1) {
              _vy += x1height * (x1mod1 - mod(x1mod1 - _ty, _xr1)) + amount * x1move;
            } else {
              _vy += x1height * _ty + amount * x1move;
            }
          } else {    
            float x2 = -x2width;
            if (rand8(tex, rngState) < 0.5)
              x2 = x2width;
            _vx += x2tilesize * (_tx + round(x2 * log(rand8(tex, rngState)))); 
            if (_ty > x2mod1) {
              _vy += x2height * (-x2mod1 + mod(_ty + x2mod1, _xr2)) - amount * x2move;
            } else if (_ty < -x2mod1) {
              _vy += x2height * (x2mod1 - mod(x2mod1 - _ty, _xr2)) - amount * x2move;
            } else {       
              _vy += x2height * _ty - amount * x2move;
            }
          }    
        }`;
    }

    get name(): string {
        return 'parallel';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
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
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
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

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.62 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 2.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float slices = ${variation.params.get(this.PARAM_SLICES)!.toWebGl()};
          float rotation = ${variation.params.get(this.PARAM_ROTATION)!.toWebGl()};
          float thickness = ${variation.params.get(this.PARAM_THICKNESS)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float dx = tan(3.0 * _ty);
          if (dx != dx)
            dx = 0.0;
          float dy = tan(3.0 * _tx);
          if (dy != dy)
            dy = 0.0;
          float nx = _tx + ${xform.xyC20.toWebGl()} * sin(dx);
          float ny = _ty + ${xform.xyC21.toWebGl()} * sin(dy);
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
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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

class ProjectiveFunc extends VariationShaderFunc2D {
    PARAM_A = 'A'
    PARAM_B = 'B'
    PARAM_C = 'C'
    PARAM_A1 = 'A1'
    PARAM_B1 = 'B1'
    PARAM_C1 = 'C1'
    PARAM_A2 = 'A2'
    PARAM_B2 = 'B2'
    PARAM_C2 = 'C2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: -0.4 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_A1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_B1, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_C1, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_A2, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_B2, type: VariationParamType.VP_NUMBER, initialValue: 1.1 },
            { name: this.PARAM_C2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Projective by eralex61
        // https://www.deviantart.com/eralex61/art/Projective-transform-295252418
        return `{
          float amount = ${variation.amount.toWebGl()};
          float A = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float B = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float C = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float A1 = float(${variation.params.get(this.PARAM_A1)});
          float B1 = float(${variation.params.get(this.PARAM_B1)});
          float C1 = float(${variation.params.get(this.PARAM_C1)});
          float A2 = float(${variation.params.get(this.PARAM_A2)});
          float B2 = float(${variation.params.get(this.PARAM_B2)});
          float C2 = float(${variation.params.get(this.PARAM_C2)});
          float U = A * _tx + B * _ty + C;
          _vx += amount * (A1 * _tx + B1 * _ty + C1) / U;
          _vy += amount * (A2 * _tx + B2 * _ty + C2) / U;
        }`;
    }

    get name(): string {
        return 'projective';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PTransformFunc extends VariationShaderFunc2D {
    PARAM_ROTATE = 'rotate'
    PARAM_POWER = 'power'
    PARAM_MOVE = 'move'
    PARAM_SPLIT = 'split'
    PARAM_USE_LOG = 'use_log'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ROTATE, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 2 },
            { name: this.PARAM_MOVE, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
            { name: this.PARAM_SPLIT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_USE_LOG, type: VariationParamType.VP_NUMBER, initialValue: 1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rotate = ${variation.params.get(this.PARAM_ROTATE)!.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float move = ${variation.params.get(this.PARAM_MOVE)!.toWebGl()};
          float split = ${variation.params.get(this.PARAM_SPLIT)!.toWebGl()};
          int use_log = ${variation.params.get(this.PARAM_USE_LOG)!.toWebGl()};
          float rho = (use_log != 0) ? log(_r) / float(power) + move : _r / float(power) + move;
          float _theta = atan2(_ty, _tx);
          float theta = _theta + rotate;
          if (_tx >= 0.0)
            rho += split;
          else
            rho -= split;   
          if (use_log != 0) rho = exp(rho);  
          _vx += amount * rho * cos(theta);
          _vy += amount * rho * sin(theta);
        }`;
    }

    get name(): string {
        return 'pTransform';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PyramidFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // pyramid by Zueuk (transcribed into jwf by Dark)
        return `{
          float amount = ${variation.amount.toWebGl()};
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

class Rational3Func extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'
    PARAM_E = 'e'
    PARAM_F = 'f'
    PARAM_G = 'g'
    PARAM_H = 'h'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.9 },
            { name: this.PARAM_G, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_H, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Ported to JWildfire variation by CozyG
         * from Apophysis7x rational3 plugin by xyrus02 at:
         * http://sourceforge.net/p/apophysis7x/svn/HEAD/tree/trunk/Plugin/rational3.c
         * <p>
         * Explanation from rational3 plugin:
         * Rational3 allows you to customize a rational function
         * involving the complex variable z. It can be represented
         * as the function...
         * az^3 + bz^2 + cz + d
         * ----------------------  division line
         * ez^3 + fz^2 + gz + h
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float f = ${variation.params.get(this.PARAM_F)!.toWebGl()};
          float g = ${variation.params.get(this.PARAM_G)!.toWebGl()};
          float h = ${variation.params.get(this.PARAM_H)!.toWebGl()};
          float xsqr = _tx * _tx;
          float ysqr = _ty * _ty;
          float xcb = xsqr * _tx;
          float ycb = ysqr * _ty;
          float zt3 = xcb - 3.0 * _tx * ysqr;
          float zt2 = xsqr - ysqr;
          float zb3 = 3.0 * xsqr * _ty - ycb;
          float zb2 = 2.0 * _tx * _ty;
          float tr = (a * zt3) + (b * zt2) + (c * _tx) + d;
          float ti = (a * zb3) + (b * zb2) + (c * _ty);
          float br = (e * zt3) + (f * zt2) + (g * _tx) + h;
          float bi = (e * zb3) + (f * zb2) + (g * _ty);     
          float r3den = 1.0 / (br * br + bi * bi);
          _vx += amount * (tr * br + ti * bi) * r3den;
          _vy += amount * (ti * br - tr * bi) * r3den;
        }`;
    }

    get name(): string {
        return 'rational3';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RaysFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float x =${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float dx = ${xform.xyC20.toWebGl()} * ${xform.xyC21.toWebGl()} + EPSILON;
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
          float amount = ${variation.amount.toWebGl()};
          float val =${variation.params.get(this.PARAM_VAL)!.toWebGl()};
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
          float amount = ${variation.amount.toWebGl()};
          float a = _phi;
          int waves = ${variation.params.get(this.PARAM_WAVES)!.toWebGl()};
          float filled = ${variation.params.get(this.PARAM_FILLED)!.toWebGl()};
          float amp = ${variation.params.get(this.PARAM_AMP)!.toWebGl()};
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
    VariationShaders.registerVar(new LazyTravisFunc())
    VariationShaders.registerVar(new LinearFunc())
    VariationShaders.registerVar(new LinearTFunc())
    VariationShaders.registerVar(new LissajousFunc())
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
    VariationShaders.registerVar(new Panorama2Func())
    VariationShaders.registerVar(new ParabolaFunc())
    VariationShaders.registerVar(new ParallelFunc())
    VariationShaders.registerVar(new PDJFunc())
    VariationShaders.registerVar(new PerspectiveFunc())
    VariationShaders.registerVar(new PetalFunc())
    VariationShaders.registerVar(new PieFunc())
    VariationShaders.registerVar(new PolarFunc())
    VariationShaders.registerVar(new Polar2Func())
    VariationShaders.registerVar(new PopcornFunc())
    VariationShaders.registerVar(new Popcorn2Func())
    VariationShaders.registerVar(new PowerFunc())
    VariationShaders.registerVar(new ProjectiveFunc())
    VariationShaders.registerVar(new PTransformFunc())
    VariationShaders.registerVar(new PyramidFunc())
    VariationShaders.registerVar(new Rational3Func())
    VariationShaders.registerVar(new RaysFunc())
    VariationShaders.registerVar(new Rays1Func())
    VariationShaders.registerVar(new Rays2Func())
    VariationShaders.registerVar(new Rays3Func())
    VariationShaders.registerVar(new RectanglesFunc())
    VariationShaders.registerVar(new RingsFunc())
    VariationShaders.registerVar(new Rings2Func())
    VariationShaders.registerVar(new RoseWFFunc())
}
