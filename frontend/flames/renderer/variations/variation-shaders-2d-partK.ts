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

class LazyJessFunc extends VariationShaderFunc2D {
    PARAM_N = 'n'
    PARAM_SPIN = 'spin'
    PARAM_SPACE = 'space'
    PARAM_CORNER = 'corner'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 4 },
            { name: this.PARAM_SPIN, type: VariationParamType.VP_NUMBER, initialValue: M_PI},
            { name: this.PARAM_SPACE, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_CORNER, type: VariationParamType.VP_NUMBER, initialValue: 1}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* lazyjess by FarDareisMai, http://fardareismai.deviantart.com/art/Apophysis-Plugin-Lazyjess-268929293 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          int n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
          float spin = ${variation.params.get(this.PARAM_SPIN)!.toWebGl()};
          float space = ${variation.params.get(this.PARAM_SPACE)!.toWebGl()};
          int corner = ${variation.params.get(this.PARAM_CORNER)!.toWebGl()};
          float M_SQRT2 = 1.414213562;
          float vertex, sin_vertex, pie_slice, half_slice, corner_rotation;
          if (n < 2) {
            n = 2;
          }
          vertex = M_PI * (float(n) - 2.0) / (2.0 * float(n));
          sin_vertex = sin(vertex);
          pie_slice = (2.0*M_PI) / float(n);
          half_slice = pie_slice / 2.0;
          corner_rotation = float(corner - 1) * pie_slice;
          float theta, sina, cosa;
          float x = _tx;
          float y = _ty;
          float modulus = sqrt(x * x + y * y);       
          if (n == 2) {
            if (abs(x) < amount) {
              theta = atan2(y, x) + spin;
              sina = sin(theta);
              cosa = cos(theta);
              x = amount * modulus * cosa;
              y = amount * modulus * sina;
              if (abs(x) < amount) {
                _vx += x;
                _vy += y;
              } else {
                theta = atan2(y, x) - spin + corner_rotation;
                sina = sin(theta);
                cosa = cos(theta);
                _vx += amount * modulus * cosa;
                _vy -= amount * modulus * sina;
              }
            } else {
              modulus = 1.0 + space / modulus;
              _vx += amount * modulus * x;
              _vy += amount * modulus * y;
            }
          } else {
            theta = atan2(y, x) + (2.0*M_PI);
            float theta_diff = mod(theta + half_slice, pie_slice);
            float r = amount * M_SQRT2 * sin_vertex / sin(M_PI - theta_diff - vertex);
            if (modulus < r) {
              theta = atan2(y, x) + spin + (2.0*M_PI);
              sina = sin(theta);
              cosa = cos(theta);
              x = amount * modulus * cosa;
              y = amount * modulus * sina;
              theta_diff = mod(theta + half_slice, pie_slice);
              r = amount * M_SQRT2 * sin_vertex / sin(M_PI - theta_diff - vertex);
              modulus = sqrt(x * x + y * y);        
              if (modulus < r) {
                _vx += x;
                _vy += y;
              } else {
                theta = atan2(y, x) - spin + corner_rotation + (2.0*M_PI);
                sina = sin(theta);
                cosa = cos(theta);
                _vx += amount * modulus * cosa;
                _vy -= amount * modulus * sina;
              }
            } else {
              modulus = 1.0 + space / modulus;
              _vx += amount * modulus * x;
              _vy += amount * modulus * y;
            }
          }
        }`;
    }

    get name(): string {
        return 'lazyjess';
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

class MobiusNFunc extends VariationShaderFunc2D {
    PARAM_RE_A = 're_a'
    PARAM_RE_B = 're_b'
    PARAM_RE_C = 're_c'
    PARAM_RE_D = 're_d'
    PARAM_IM_A = 'im_a'
    PARAM_IM_B = 'im_b'
    PARAM_IM_C = 'im_c'
    PARAM_IM_D = 'im_d'
    PARAM_POWER = 'power'
    PARAM_DIST = 'dist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RE_A, type: VariationParamType.VP_NUMBER, initialValue: 1.1 },
            { name: this.PARAM_RE_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_RE_C, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_RE_D, type: VariationParamType.VP_NUMBER, initialValue: 0.9 },
            { name: this.PARAM_IM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_IM_B, type: VariationParamType.VP_NUMBER, initialValue: -0.22 },
            { name: this.PARAM_IM_C, type: VariationParamType.VP_NUMBER, initialValue: -0.05 },
            { name: this.PARAM_IM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 1.8 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // MobiusN, by eralex61, transcribed by chronologicaldot, fixed by thargor6
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
          float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          if (abs(power) < 1.0)
            power = 1.0;
          float realU, imagU, realV, imagV, radV, x, y, z, r, alpha, sina, cosa, n;
          z = 4.0 * dist / power;
          r = pow(_r, z);
          alpha = atan2(_ty, _tx) * power;
          sina = sin(alpha);
          cosa = cos(alpha);
          x = r * cosa;
          y = r * sina;
          realU = re_a * x - im_a * y + re_b;
          imagU = re_a * y + im_a * x + im_b;
          realV = re_c * x - im_c * y + re_d;
          imagV = re_c * y + im_c * x + im_d;
          radV = sqr(realV) + sqr(imagV);
          x = (realU * realV + imagU * imagV) / radV;
          y = (imagU * realV - realU * imagV) / radV;
          z = 1.0 / z;
          r = pow(sqrt(sqr(x) + sqr(y)), z);
          n = floor(power * rand8(tex, rngState));
          alpha = (atan2(y, x) + n * (2.0*M_PI)) / floor(power);
          sina = sin(alpha);
          cosa = cos(alpha);
          _vx += amount * r * cosa;
          _vy += amount * r * sina;
        }`;
    }

    get name(): string {
        return 'mobiusN';
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

class MurlFunc extends VariationShaderFunc2D {
    PARAM_C = 'c'
    PARAM_POWER = 'power'
    PARAM_SIDES = 'sides'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /*
           Original function written in C by Peter Sdobnov (Zueuk).
           Transcribed into Java by Nic Anderson (chronologicaldot)
        */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float _c = c;
          if (power != 1) {
            _c /= (float(power - 1));
          }
          float _p2 = float(power) / 2.0;
          float _vp = amount * (_c + 1.0);
        
          float _a = atan2(_ty, _tx) * float(power);
          float _sina = sin(_a);
          float _cosa = cos(_a);
        
          float _r = _c * pow(sqr(_tx) + sqr(_ty), _p2);
        
          float _re = _r * _cosa + 1.0;
          float _im = _r * _sina;
          float _rl = _vp / (sqr(_re) + sqr(_im));
        
          _vx += _rl * (_tx * _re + _ty * _im);
          _vy += _rl * (_ty * _re - _tx * _im);
        }`;
    }

    get name(): string {
        return 'murl';
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

class OrthoFunc extends VariationShaderFunc2D {
    PARAM_IN = 'in'
    PARAM_OUT = 'out'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_IN, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_OUT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* ortho by Michael Faber,  http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float _in = ${variation.params.get(this.PARAM_IN)!.toWebGl()};
          float _out = ${variation.params.get(this.PARAM_OUT)!.toWebGl()};
          float r, a, ta;
          float xo;
          float ro;
          float c, s;
          float x, y, tc, ts;
          float theta;
          r = sqr(_tx) + sqr(_ty);
          if (r < 1.0) { 
            if (_tx >= 0.0) {
              xo = (r + 1.0) / (2.0 * _tx);
              ro = sqrt(sqr(_tx - xo) + sqr(_ty));
              theta = atan2(1.0, ro);
              a = mod(_in * theta + atan2(_ty, xo - _tx) + theta, 2.0 * theta) - theta;
              s = sin(a);
              c = cos(a);
              _vx += amount * (xo - c * ro);
              _vy += amount * s * ro;
            } else {
              xo = -(r + 1.0) / (2.0 * _tx);
              ro = sqrt(sqr(-_tx - xo) + sqr(_ty));
              theta = atan2(1.0, ro);
              a = mod(_in * theta + atan2(_ty, xo + _tx) + theta, 2.0 * theta) - theta;
              s = sin(a);
              c = cos(a);
              _vx -= amount * (xo - c * ro);
              _vy += amount * s * ro;
            }
          } else {
            r = 1.0 / sqrt(r);
            ta = atan2(_ty, _tx);
            ts = sin(ta);
            tc = cos(ta);
            x = r * tc;
            y = r * ts;
            if (x >= 0.0) {
              xo = (sqr(x) + sqr(y) + 1.0) / (2.0 * x);
              ro = sqrt(sqr(x - xo) + sqr(y));
              theta = atan2(1.0, ro);
              a = mod(_out * theta + atan2(y, xo - x) + theta, 2.0 * theta) - theta;
              s = sin(a);
              c = cos(a);
              x = (xo - c * ro);
              y = s * ro;
              ta = atan2(y, x);
              ts = sin(ta);
              tc = cos(ta);
              r = 1.0 / sqrt(sqr(x) + sqr(y));
              _vx += amount * r * tc;
              _vy += amount * r * ts;
            } else {
              xo = -(sqr(x) + sqr(y) + 1.0) / (2.0 * x);
              ro = sqrt(sqr(-x - xo) + sqr(y));
              theta = atan2(1.0, ro);
              a = mod(_out * theta + atan2(y, xo + x) + theta, 2.0 * theta) - theta;
              s = sin(a);
              c = cos(a);
              x = (xo - c * ro);
              y = s * ro;
              ta = atan2(y, x);
              ts = sin(ta);
              tc = cos(ta);
              r = 1.0 / sqrt(sqr(x) + sqr(y));
              _vx -= amount * r * tc;
              _vy += amount * r * ts;
            }
          }
        }`;
    }

    get name(): string {
        return 'ortho';
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

class OvoidFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.94 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.94 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float t = _tx * _tx + _ty * _ty + EPSILON;
          float r = amount / t;
          _vx += _tx * r * x;
          _vy += _ty * r * y;
        }`;
    }

    get name(): string {
        return 'ovoid';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function registerVars_2D_PartK() {
    VariationShaders.registerVar(new KaleidoscopeFunc())
    VariationShaders.registerVar(new LaceJSFunc())
    VariationShaders.registerVar(new LayeredSpiralFunc())
    VariationShaders.registerVar(new LazyJessFunc())
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
    VariationShaders.registerVar(new MobiusNFunc())
    VariationShaders.registerVar(new ModulusFunc())
    VariationShaders.registerVar(new MurlFunc())
    VariationShaders.registerVar(new NGonFunc())
    VariationShaders.registerVar(new NPolarFunc())
    VariationShaders.registerVar(new OrthoFunc())
    VariationShaders.registerVar(new OscilloscopeFunc())
    VariationShaders.registerVar(new Oscilloscope2Func())
    VariationShaders.registerVar(new OvoidFunc())
}
