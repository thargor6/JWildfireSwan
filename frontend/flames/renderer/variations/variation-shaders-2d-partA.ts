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
    FUNC_COSH,
    FUNC_MODULO,
    FUNC_RINT, FUNC_ROUND,
    FUNC_SGN,
    FUNC_SINH,
    FUNC_SQRT1PM1
} from 'Frontend/flames/renderer/variations/variation-math-functions';
import {M_PI} from "Frontend/flames/renderer/mathlib";

/*
  be sure to import this class somewhere and call registerVars_2D_PartA()
 */
class ArchFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = ${variation.amount.toWebGl()};
              float ang = rand8(tex, rngState) * amount * M_PI;
              float sinr = sin(ang);
              float cosr = cos(ang);
              if (cosr != 0.0) {
                _vx += amount * sinr;
                _vy += amount * (sinr * sinr) / cosr;
              }
        }`;
    }

    get name(): string {
        return 'arch';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AsteriaFunc extends VariationShaderFunc2D {
    PARAM_ALPHA = 'alpha'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ALPHA, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // asteria by dark-beam, http://jwildfire.org/forum/viewtopic.php?f=23&t=1464
        return `{
          float amount = ${variation.amount.toWebGl()};
          float alpha = ${variation.params.get(this.PARAM_ALPHA)!.toWebGl()};
          float sina = sin(M_PI * alpha);
          float cosa = cos(M_PI * alpha); 
          float x0 = amount * _tx;
          float y0 = amount * _ty;
          float xx = x0;
          float yy = y0;
          float r = sqr(xx) + sqr(yy);
          xx = sqr(abs(xx) - 1.0);
          yy = sqr(abs(yy) - 1.0);
          float r2 = sqrt(yy + xx);
          bool in1 = r < 1.0;
          bool out2 = r2 < 1.0;
          if (in1 && out2)
            in1 = ((rand8(tex, rngState)) > 0.35);
          else
            in1 = !in1;
          if (in1) { 
            _vx += x0;
            _vy += y0;
          } else { 
            xx = x0 * cosa - y0 * sina;
            yy = x0 * sina + y0 * cosa;
            float nx = xx / sqrt(1.0 - yy * yy) * (1.0 - sqrt(1. - sqr(-abs(yy) + 1.0)));
            xx = nx * cosa + yy * sina;
            yy = -nx * sina + yy * cosa;
            _vx += xx;
            _vy += yy;
          }  
        }`;
    }

    get name(): string {
        return 'asteria';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AugerFunc extends VariationShaderFunc2D {
    PARAM_FREQ = 'freq'
    PARAM_WEIGHT = 'weight'
    PARAM_SYM = 'sym'
    PARAM_SCALE = 'scale'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FREQ, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_WEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_SYM, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 0.90 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Auger, by Xyrus02
        return `{
          float amount = ${variation.amount.toWebGl()};
          float freq = ${variation.params.get(this.PARAM_FREQ)!.toWebGl()};
          float weight = ${variation.params.get(this.PARAM_WEIGHT)!.toWebGl()};
          float sym = ${variation.params.get(this.PARAM_SYM)!.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float s = sin(freq * _tx);
          float t = sin(freq * _ty);
          float dy = _ty + weight * (scale * s * 0.5 + abs(_ty) * s);
          float dx = _tx + weight * (scale * t * 0.5 + abs(_tx) * t);
          _vx += amount * (_tx + sym * (dx - _tx));
          _vy += amount * dy;
        }`;
    }

    get name(): string {
        return 'auger';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BarycentroidFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* barycentroid from Xyrus02, http://xyrusworx.deviantart.com/art/Barycentroid-Plugin-144832371?q=sort%3Atime+favby%3Amistywisp&qo=0&offset=10 */
        // helpers

        /*  The code is supposed to be fast and you all can read it so I dont
            create those aliases for readability in actual code:

            v0x = this.a
            v0y = this.b
            v1x = this.c
            v1y = this.d
            v2x = pAffineTP.x
            v2y = pAffineTP.y
        */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float dot00 = a * a + b * b; 
          float dot01 = a * c + b * d; 
          float dot02 = a * _tx + b * _ty; 
          float dot11 = c * c + d * d; 
          float dot12 = c * _tx + d * _ty;     
          float invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
          /* now we can pull [u,v] as the barycentric coordinates of the point 
             P in the triangle [A, B, C]
          */
          float u = (dot11 * dot02 - dot01 * dot12) * invDenom;
          float v = (dot00 * dot12 - dot01 * dot02) * invDenom;   
          float um = sqrt(sqr(u) + sqr(_tx)) * sgn(u);
          float vm = sqrt(sqr(v) + sqr(_ty)) * sgn(v);
          _vx += amount * um;
          _vy += amount * vm;
        }`;
    }

    get name(): string {
        return 'barycentroid';
    }

    get funcDependencies(): string[] {
        return [FUNC_SGN];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BentFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float nx = _tx;
          float ny = _ty;
          if (nx < 0.0)
            nx = nx + nx;
          if (ny < 0.0)
            ny = ny * 0.5;
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'bent';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Bent2Func extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
                { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Bent2 in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float nx = _tx;
          float ny = _ty;
          if (nx < 0.0)
            nx = nx * x;
          if (ny < 0.0)
            ny = ny * y;
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'bent2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BiLinearFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * _ty;
          _vy += amount * _tx;
        }`;
    }

    get name(): string {
        return 'bi_linear';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BipolarFunc extends VariationShaderFunc2D {
    PARAM_SHIFT = 'shift'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Bipolar in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x2y2 = (_tx * _tx + _ty * _ty);
          float t = x2y2 + 1.0;
          float x2 = 2.0 * _tx;
          float shift = ${variation.params.get(this.PARAM_SHIFT)!.toWebGl()};
          float ps = -(M_PI*0.5) * shift;
          float y = 0.5 * atan2(2.0 * _ty, x2y2 - 1.0) + ps;

          if (y > (M_PI*0.5)) {
            y = -(M_PI*0.5) + mod(y + (M_PI*0.5), M_PI);
          } 
          else if (y < -(M_PI*0.5)) {
            y = (M_PI*0.5) - mod((M_PI*0.5) - y, M_PI);
          }

          float f = t + x2;
          float g = t - x2;
        
          if ((g != 0.0) && (f / g > 0.0)) {
            _vx += amount * 0.25 * (2.0 / M_PI) * log((t + x2) / (t - x2));
            _vy += amount * (2.0 / M_PI) * y;
          }  
        }`;
    }

    get name(): string {
        return 'bipolar';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BladeFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = rand8(tex, rngState) * amount * sqrt(_tx * _tx + _ty * _ty);
          float sinr = sin(r);
          float cosr = cos(r);
          _vx += amount * _tx * (cosr + sinr);
          _vy += amount * _tx * (cosr - sinr);
        }`;
    }

    get name(): string {
        return 'blade';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BlobFunc extends VariationShaderFunc2D {
    PARAM_LOW = 'low'
    PARAM_HIGH = 'high'
    PARAM_WAVES = 'waves'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LOW, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_HIGH, type: VariationParamType.VP_NUMBER, initialValue: 1.2 },
            { name: this.PARAM_WAVES, type: VariationParamType.VP_NUMBER, initialValue: 6 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float low = ${variation.params.get(this.PARAM_LOW)!.toWebGl()};
          float high = ${variation.params.get(this.PARAM_HIGH)!.toWebGl()};
          float waves = ${variation.params.get(this.PARAM_WAVES)!.toWebGl()};
          float a = atan2(_tx, _ty);
          float r = sqrt(_tx * _tx + _ty * _ty);
          r = r * (low + (high - low) * (0.5 + 0.5 * sin(waves * a)));
          float nx = sin(a) * r;
          float ny = cos(a) * r;
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'blob';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BlockYFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_MP = 'mp'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_MP, type: VariationParamType.VP_NUMBER, initialValue: 4.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* blocky from FracFx, http://fracfx.deviantart.com/art/FracFx-Plugin-Pack-171806681 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float mp = ${variation.params.get(this.PARAM_MP)!.toWebGl()};
          float v = amount / (M_PI*0.5);
          float T = ((cos(_tx) + cos(_ty)) / mp + 1.0);
          float r = amount / T;
          float tmp = sqr(_ty) + sqr(_tx) + 1.0;
          float x2 = 2.0 * _tx;
          float y2 = 2.0 * _ty;
          float xmax = 0.5 * (sqrt(tmp + x2) + sqrt(tmp - x2));
          float ymax = 0.5 * (sqrt(tmp + y2) + sqrt(tmp - y2));
          float a = _tx / xmax;
          float b = sqrt_safe(1.0 - sqr(a));
          _vx += v * atan2(a, b) * r * x;
          a = _ty / ymax;
          b = sqrt_safe(1.0 - sqr(a));
          _vy += v * atan2(a, b) * r * y;
        }`;
    }

    get name(): string {
        return 'blocky';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BoardersFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Boarders in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float roundX = float(int(_tx+0.5));
          float roundY = float(int(_ty+0.5));
          float offsetX = _tx - roundX;
          float offsetY = _ty - roundY;
          if (rand8(tex, rngState) >= 0.75) {
            _vx += amount * (offsetX * 0.5 + roundX);
            _vy += amount * (offsetY * 0.5 + roundY);
          } else {
             if (abs(offsetX) >= abs(offsetY)) {
               if (offsetX >= 0.0) {
                  _vx += amount * (offsetX * 0.5 + roundX + 0.25);
                  _vy += amount * (offsetY * 0.5 + roundY + 0.25 * offsetY / offsetX);
                } else {
                  _vx += amount * (offsetX * 0.5 + roundX - 0.25);
                  _vy += amount * (offsetY * 0.5 + roundY - 0.25 * offsetY / offsetX);
                }
              } else {
                if (offsetY >= 0.0) {
                  _vy += amount * (offsetY * 0.5 + roundY + 0.25);
                  _vx += amount * (offsetX * 0.5 + roundX + offsetX / offsetY * 0.25);
                } else {
                  _vy += amount * (offsetY * 0.5 + roundY - 0.25);
                  _vx += amount * (offsetX * 0.5 + roundX - offsetX / offsetY * 0.25);
                }
              }
            }
        }`;
    }

    get name(): string {
        return 'boarders';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Boarders2Func extends VariationShaderFunc2D {
    PARAM_C = 'c'
    PARAM_LEFT = 'left'
    PARAM_RIGHT = 'right'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.40 },
            { name: this.PARAM_LEFT, type: VariationParamType.VP_NUMBER, initialValue: 0.65 },
            { name: this.PARAM_RIGHT, type: VariationParamType.VP_NUMBER, initialValue: 0.35 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // boarders2 by Xyrus02, http://xyrus02.deviantart.com/art/Boarders2-plugin-for-Apophysis-173427128
        return `{
          float amount = ${variation.amount.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float left = ${variation.params.get(this.PARAM_LEFT)!.toWebGl()};
          float right = ${variation.params.get(this.PARAM_RIGHT)!.toWebGl()};
          float roundX = float(int(_tx+0.5));
          float roundY = float(int(_ty+0.5));
          
          float _c = abs(c);
          float _cl = abs(left);
          float _cr = abs(right);
          _c = (_c == 0.0 ? EPSILON : _c);
          _cl = (_cl == 0.0 ? EPSILON : _cl);
          _cr = (_cr == 0.0 ? EPSILON : _cr);
          _cl = _c * _cl;
          _cr = _c + (_c * _cr);
    
          float offsetX = _tx - roundX;
          float offsetY = _ty - roundY;
          if (rand8(tex, rngState) >= _cr) {
            _vx += amount * (offsetX * _c + roundX);
            _vy += amount * (offsetY * _c + roundY);
          } else {
            if (abs(offsetX) >= abs(offsetY)) {
              if (offsetX >= 0.0) {
                _vx += amount * (offsetX * _c + roundX + _cl);
                _vy += amount * (offsetY * _c + roundY + _cl * offsetY / offsetX);
              } else {
                 _vx += amount * (offsetX * _c + roundX - _cl);
                _vy += amount * (offsetY * _c + roundY - _cl * offsetY / offsetX);
              }
            } else {
              if (offsetY >= 0.0) {
                _vy += amount * (offsetY * _c + roundY + _cl);
                _vx += amount * (offsetX * _c + roundX + offsetX / offsetY * _cl);
              } else {
                _vy += amount * (offsetY * _c + roundY - _cl);
                _vx += amount * (offsetX * _c + roundX - offsetX / offsetY * _cl);
              }
            }
          }
        }`;
    }

    get name(): string {
        return 'boarders2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ButterflyFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* wx is weight*4/sqrt(3*pi) */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float wx = amount * 1.3029400317411197908970256609023;
          float y2 = _ty * 2.0;
          float r = wx * sqrt(abs(_ty * _tx) / (EPSILON + _tx * _tx + y2 * y2));
          _vx += r * _tx;
          _vy += r * y2;
        }`;
    }

    get name(): string {
        return 'butterfly';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BWraps7Func extends VariationShaderFunc2D {
    PARAM_CELLSIZE = 'cellsize'
    PARAM_SPACE = 'space'
    PARAM_GAIN = 'gain'
    PARAM_INNER_TWIST = 'inner_twist'
    PARAM_OUTER_TWIST = 'outer_twist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CELLSIZE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SPACE, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_GAIN, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_INNER_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_OUTER_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Bubble Wrap - WIP Plugin by slobo777
        // http://slobo777.deviantart.com/art/Bubble-Wrap-WIP-Plugin-112370125
        return `{
          float amount = ${variation.amount.toWebGl()};
          float cellsize = ${variation.params.get(this.PARAM_CELLSIZE)!.toWebGl()};
          float space = ${variation.params.get(this.PARAM_SPACE)!.toWebGl()};
          float gain = ${variation.params.get(this.PARAM_GAIN)!.toWebGl()};
          float inner_twist = ${variation.params.get(this.PARAM_INNER_TWIST)!.toWebGl()};
          float outer_twist = ${variation.params.get(this.PARAM_OUTER_TWIST)!.toWebGl()};
          float radius = 0.5 * (cellsize / (1.0 + space * space));
          float _g2 = gain * gain + 1.0e-6;
          float max_bubble = _g2 * radius;    
          if (max_bubble > 2.0) {
            max_bubble = 1.0;
          } else {    
            max_bubble *= 1.0 / ((max_bubble * max_bubble) / 4.0 + 1.0);
          }
          float _r2 = radius * radius;
          float _rfactor = radius / max_bubble;            
          float Vx = _tx;
          float Vy = _ty;
          if (abs(cellsize) < EPSILON) {    
            _vx += amount * Vx;
            _vy += amount * Vy;
          }
          else {
            float Cx = (floor(Vx / cellsize) + 0.5) * cellsize;
            float Cy = (floor(Vy / cellsize) + 0.5) * cellsize;
            float Lx = Vx - Cx;
            float Ly = Vy - Cy;
            if ((Lx * Lx + Ly * Ly) > _r2) {
              _vx += amount * Vx;
              _vy += amount * Vy;
            }
            else {
              Lx *= _g2;
              Ly *= _g2;
              float r = _rfactor / ((Lx * Lx + Ly * Ly) / 4.0 + 1.0);
              Lx *= r;
              Ly *= r;
              r = (Lx * Lx + Ly * Ly) / _r2; 
              float theta = inner_twist * (1.0 - r) + outer_twist * r;
              float s = sin(theta);
              float c = cos(theta);  
              Vx = Cx + c * Lx + s * Ly;
              Vy = Cy - s * Lx + c * Ly;
              _vx += amount * Vx;
              _vy += amount * Vy;
            }
          }
        }`;
    }

    get name(): string {
        return 'bwraps7';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CannabisCurveWFFunc extends VariationShaderFunc2D {
    PARAM_FILLED = 'filled'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // cannabis curve (http://mathworld.wolfram.com/CannabisCurve.html)
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = _phi;
          
          float r = (1.0 + 9.0 / 10.0 * cos(8.0 * a)) * (1.0 + 1.0 / 10.0 * cos(24.0 * a)) * (9.0 / 10.0 + 1.0 / 10.0 * cos(200.0 * a)) * (1.0 + sin(a));
          a += M_PI / 2.0;
        
          float filled = ${variation.params.get(this.PARAM_FILLED)!.toWebGl()};
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
        return 'cannabiscurve_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class ChecksFunc extends VariationShaderFunc2D {
    PARAM_LEFT = 'x'
    PARAM_TOP = 'y'
    PARAM_RIGHT = 'size'
    PARAM_BOTTOM = 'rnd'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LEFT, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_TOP, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_RIGHT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_BOTTOM, type: VariationParamType.VP_NUMBER, initialValue: 0.50 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Fixed checks plugin by Keeps and Xyrus02, http://xyrus02.deviantart.com/art/Checks-The-fixed-version-138967784?q=favby%3Aapophysis-plugins%2F39181234&qo=3
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_LEFT)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_TOP)!.toWebGl()};
          float size = ${variation.params.get(this.PARAM_RIGHT)!.toWebGl()};
          float rnd = ${variation.params.get(this.PARAM_BOTTOM)!.toWebGl()};
          float _cs = 1.0 / (size + EPSILON);
          float _ncx = x * -1.0;
          float _ncy = y * -1.0;
          int isXY = int(rint(_tx * _cs)) + int(rint(_ty * _cs));
          float rnx = rnd * rand8(tex, rngState);
          float rny = rnd * rand8(tex, rngState);
          float dx, dy;
          if((isXY / 2) * isXY == isXY) {    
            dx = _ncx + rnx;
            dy = _ncy;
          } else {
            dx = x;
            dy = y + rny;
          }      
          _vx += amount * (_tx + dx);
          _vy += amount * (_ty + dy);   
        }`;
    }

    get name(): string {
        return 'checks';
    }

    get funcDependencies(): string[] {
        return [FUNC_RINT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_CROP];
    }
}

class CellFunc extends VariationShaderFunc2D {
    PARAM_SIZE = 'size'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.6 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Cell in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float size = ${variation.params.get(this.PARAM_SIZE)!.toWebGl()};
          float inv_cell_size = 1.0 / size;

          /* calculate input cell */
          int x = int(floor(_tx * inv_cell_size));
          int y = int(floor(_ty * inv_cell_size));
    
          /* Offset from cell origin */
          float dx = _tx - float(x) * size;
          float dy = _ty - float(y) * size;
    
          /* interleave cells */
          if (y >= 0) {
            if (x >= 0) {
              y *= 2;
              x *= 2;
            } else {
              y *= 2;
              x = -(2 * x + 1);
            }
          } else {
            if (x >= 0) {
              y = -(2 * y + 1);
              x *= 2;
            } else {
              y = -(2 * y + 1);
              x = -(2 * x + 1);
            }
          }
    
          _vx += amount * (dx + float(x) * size);
          _vy -= amount * (dy + float(y) * size);
        }`;
    }

    get name(): string {
        return 'cell';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CirclizeFunc extends VariationShaderFunc2D {
    PARAM_HOLE = 'hole'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HOLE, type: VariationParamType.VP_NUMBER, initialValue: 0.40 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float hole = ${variation.params.get(this.PARAM_HOLE)!.toWebGl()};
          float var4_PI = amount / (0.25*M_PI);
          float absx = abs(_tx);
          float absy = abs(_ty);
          float perimeter, side;
          if (absx >= absy) {
            if (_tx >= absy) {
              perimeter = absx + _ty;
            } else {
              perimeter = 5.0 * absx - _ty;
            }
            side = absx;
          } else {
            if (_ty >= absx) {
              perimeter = 3.0 * absy - _tx;
            } else {
              perimeter = 7.0 * absy + _tx;
            }
            side = absy;
          }
          float r = var4_PI * side + hole;
          float a = (0.25*M_PI) * perimeter / side - (0.25*M_PI);
          float sina = sin(a);
          float cosa = cos(a);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'circlize';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CircusFunc extends VariationShaderFunc2D {
    PARAM_SCALE = 'scale'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 0.92 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* circus from Michael Faber, http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float scale_1 = 1.0 / scale;
          float r = sqrt(_tx * _tx + _ty * _ty);
           float a = atan2(_ty, _tx);
           float s = sin(a);
           float c = cos(a);
            if (r <= 1.0)
              r *= scale;
            else
              r *= scale_1;
            _vx += amount * r * c;
            _vy += amount * r * s;
        }`;
    }

    get name(): string {
        return 'circus';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CloverLeafWFFunc extends VariationShaderFunc2D {
    PARAM_FILLED = 'filled'

    get params(): VariationParam[] {
      return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = _phi;

          float r = (sin(2.0 * a) + 0.25 * sin(6.0 * a));

          float filled = ${variation.params.get(this.PARAM_FILLED)!.toWebGl()};

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
        return 'cloverleaf_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class CollideoscopeFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_NUM = 'num'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_NUM, type: VariationParamType.VP_NUMBER, initialValue: 1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* collideoscope by Michael Faber, http://michaelfaber.deviantart.com/art/Collideoscope-251624597 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          int num = ${variation.params.get(this.PARAM_NUM)!.toWebGl()};
          float kn_pi = float(num) * (1.0 / M_PI);
          float pi_kn = M_PI / float(num);
          float ka = M_PI * a;
          float ka_kn = ka / float(num);
          float _theta = atan2(_ty, _tx);
          float r = amount * sqrt(sqr(_tx) + sqr(_ty));
          int alt;  
          if (_theta >= 0.0) {
            alt = int(_theta * kn_pi);
            if (modulo(alt, 2) == 0) {
              a = float(alt) * pi_kn + mod(ka_kn + _theta, pi_kn);
            } else {
              a = float(alt) * pi_kn + mod(-ka_kn + _theta, pi_kn);
            }
          } else {
            alt = int(-_theta * kn_pi);
            if (modulo(alt, 2) != 0) {
              a = -(float(alt) * pi_kn + mod(-ka_kn - _theta, pi_kn));
            } else {
              a = -(float(alt) * pi_kn + mod(ka_kn - _theta, pi_kn));
            }
          }     
          float s = sin(a);
          float c = cos(a);  
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'collideoscope';
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ConicFunc extends VariationShaderFunc2D {
    PARAM_ECCENTRICITY = 'eccentricity'
    PARAM_HOLES = 'holes'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ECCENTRICITY, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cyberxaos, 4/2007 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float eccentricity = ${variation.params.get(this.PARAM_ECCENTRICITY)!.toWebGl()};
          float holes = ${variation.params.get(this.PARAM_HOLES)!.toWebGl()};
          float ct = _tx / _r;
          float r = amount * (rand8(tex, rngState) - holes) * eccentricity / (1.0 + eccentricity * ct) / _r;
         _vx += r * _tx;
         _vy += r * _ty;
        }`;
    }

    get name(): string {
        return 'conic';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CPowFunc extends VariationShaderFunc2D {
    PARAM_R = 'r'
    PARAM_I = 'i'
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_R, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_I, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 1.5 }]
    }

    /* Cpow in the Apophysis Plugin Pack */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float r = ${variation.params.get(this.PARAM_R)!.toWebGl()};
                  float i = ${variation.params.get(this.PARAM_I)!.toWebGl()};
                  float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
                  float _theta = atan2(_ty, _tx);
                  float a = _theta;
                  float lnr = 0.5 * log(_r2);
                  float va = 2.0 * M_PI / power;
                  float vc = r / power;
                  float vd = i / power;
                  float ang = vc * a + vd * lnr + va * floor(power * rand8(tex, rngState));
                
                  float m = amount * exp(vc * lnr - vd * a);
                  float sa = sin(ang);
                  float ca = cos(ang);
                
                  _vx += m * ca;
                  _vy += m * sa;
                }`;
    }


    get name(): string {
        return 'cpow';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CropFunc extends VariationShaderFunc2D {
    PARAM_LEFT = 'left'
    PARAM_TOP = 'top'
    PARAM_RIGHT = 'right'
    PARAM_BOTTOM = 'bottom'
    PARAM_SCATTER_AREA = 'scatter_area'
    PARAM_ZERO = 'zero'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LEFT, type: VariationParamType.VP_NUMBER, initialValue: -1.00 },
            { name: this.PARAM_TOP, type: VariationParamType.VP_NUMBER, initialValue: -1.00 },
            { name: this.PARAM_RIGHT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_BOTTOM, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SCATTER_AREA, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_ZERO, type: VariationParamType.VP_NUMBER, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // crop by Xyrus02, http://xyrus02.deviantart.com/art/Crop-Plugin-Updated-169958881
        return `{
          float amount = ${variation.amount.toWebGl()};
          float left = ${variation.params.get(this.PARAM_LEFT)!.toWebGl()};
          float top = ${variation.params.get(this.PARAM_TOP)!.toWebGl()};
          float right = ${variation.params.get(this.PARAM_RIGHT)!.toWebGl()};
          float bottom = ${variation.params.get(this.PARAM_BOTTOM)!.toWebGl()};
          float scatter_area = ${variation.params.get(this.PARAM_SCATTER_AREA)!.toWebGl()};
          int zero = ${variation.params.get(this.PARAM_ZERO)!.toWebGl()};
          float xmin = min(left, right);
          float ymin = min(top, bottom);
          float xmax = max(left, right);
          float ymax = max(top, bottom);
          float w = (xmax - xmin) * 0.5 * scatter_area;
          float h = (ymax - ymin) * 0.5 * scatter_area;
          float x = _tx;
          float y = _ty;
          if (((x < xmin) || (x > xmax) || (y < ymin) || (y > ymax)) && (zero != 0)) {
            _vx = _vy = 0.0;
          } else {
            if (x < xmin)
              x = xmin + rand8(tex, rngState) * w;
            else if (x > xmax)
              x = xmax - rand8(tex, rngState) * w;
            if (y < ymin)
              y = ymin + rand8(tex, rngState) * h;
            else if (y > ymax)
              y = ymax - rand8(tex, rngState) * h;
            _vx = amount * x;
            _vy = amount * y;
          }
        }`;
    }

    get name(): string {
        return 'crop';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_CROP];
    }
}

class CrossFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float s = _tx * _tx - _ty * _ty;
                  float r = amount * sqrt(1.0 / (s * s + EPSILON));
                  _vx += _tx * r;
                  _vy += _ty * r;
                }`;
    }

    get name(): string {
        return 'cross';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Cosecant CSC
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cscsin = sin(_tx);
                  float csccos = cos(_tx);
                  float cscsinh = sinh(_ty);
                  float csccosh = cosh(_ty);
                  float d = (cosh(2.0 * _ty) - cos(2.0 * _tx));
                  if (d != 0.0) {
                    float cscden = 2.0 / d;
                    _vx += amount * cscden * cscsin * csccosh;
                    _vy -= amount * cscden * csccos * cscsinh;  
                  }
                }`;
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get name(): string {
        return 'csc';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CschFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Cosecant CSCH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cschsin = sin(_ty);
                  float cschcos = cos(_ty);
                  float cschsinh = sinh(_tx);
                  float cschcosh = cosh(_tx);
                  float d = (cosh(2.0 * _tx) - cos(2.0 * _ty));
                  if (d != 0.0) {
                    float cschden = 2.0 / d;
                    _vx += amount * cschden * cschsinh * cschcos;
                    _vy -= amount * cschden * cschcosh * cschsin;  
                  }
                }`;
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get name(): string {
        return 'csch';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CosFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Cosine COS
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cossin = sin(_tx);
                  float coscos = cos(_tx);
                  float cossinh = sinh(_ty);
                  float coscosh = cosh(_ty);
                  _vx += amount * coscos * coscosh;
                  _vy -= amount * cossin * cossinh;
                }`;
    }

    get name(): string {
        return 'cos';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CoshFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Cosine COSH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float coshsin = sin(_ty);
                  float coshcos = cos(_ty);
                  float coshsinh = sinh(_tx);
                  float coshcosh = cosh(_tx);
                  _vx += amount * coshcosh * coshcos;
                  _vy += amount * coshsinh * coshsin;
                }`;
    }

    get name(): string {
        return 'cosh';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CosineFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float r = _tx * M_PI;
                  float sinr = sin(r);
                  float cosr = cos(r);
                  _vx += amount * cosr * cosh(_ty);
                  _vy -= amount * sinr * sinh(_ty);
                }`;
    }

    get name(): string {
        return 'cosine';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CotFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Cotangent COT
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cotsin = sin(2.0 * _tx);
                  float cotcos = cos(2.0 * _tx);
                  float cotsinh = sinh(2.0 * _ty);
                  float cotcosh = cosh(2.0 * _ty);
                  float cotden = 1.0 / (cotcosh - cotcos);
                  _vx += amount * cotden * cotsin;
                  _vy += amount * cotden * -1.0 * cotsinh;
                }`;
    }

    get name(): string {
        return 'cot';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CothFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Cotangent COTH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cothsin = sin(2.0 * _ty);
                  float cothcos = cos(2.0 * _ty);
                  float cothsinh = sinh(2.0 * _tx);
                  float cothcosh = cosh(2.0 * _tx);
                  float d = (cothcosh - cothcos);
                  if (d != 0.0) {
                    float cothden = 1.0 / d;
                    _vx += amount * cothden * cothsinh;
                    _vy += amount * cothden * cothsin;
                  }     
                }`;
    }

    get name(): string {
        return 'coth';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CurlFunc extends VariationShaderFunc2D {
    PARAM_C1 = 'c1'
    PARAM_C2 = 'c2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_C1, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
                { name: this.PARAM_C2, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float c1 = ${variation.params.get(this.PARAM_C1)!.toWebGl()};
          float c2 = ${variation.params.get(this.PARAM_C2)!.toWebGl()};
          float re = 1.0 + c1 * _tx + c2 * (sqr(_tx) - sqr(_ty));
          float im = c1 * _ty + c2 * 2.0 * _tx * _ty;
          float r = amount / (sqr(re) + sqr(im));
          _vx += (_tx * re + _ty * im) * r;
          _vy += (_ty * re - _tx * im) * r;
        }`;
    }

    get name(): string {
        return 'curl';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CurveFunc extends VariationShaderFunc2D {
    PARAM_XAMP = 'xamp'
    PARAM_YAMP = 'yamp'
    PARAM_XLENGTH = 'xlength'
    PARAM_YLENGTH = 'ylength'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XAMP, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_YAMP, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_XLENGTH, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_YLENGTH, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Curve in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float xamp = ${variation.params.get(this.PARAM_XAMP)!.toWebGl()};
          float yamp = ${variation.params.get(this.PARAM_YAMP)!.toWebGl()};
          float xlength = ${variation.params.get(this.PARAM_XLENGTH)!.toWebGl()};
          float ylength = ${variation.params.get(this.PARAM_YLENGTH)!.toWebGl()};
          float _pc_xlen = xlength * xlength;
          float _pc_ylen = ylength * ylength;
          if (_pc_xlen < EPSILON)
            _pc_xlen = EPSILON;
          if (_pc_ylen < EPSILON)
            _pc_ylen = EPSILON;
          _vx += amount * (_tx + xamp * exp(-_ty * _ty / _pc_xlen));
          _vy += amount * (_ty + yamp * exp(-_tx * _tx / _pc_ylen));
        }`;
    }

    get name(): string {
        return 'curve';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CylinderFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                   _vx += amount * sin(_tx);
                   _vy += amount * _ty;
                }`;
    }

    get name(): string {
        return 'cylinder';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DCLinearFunc extends VariationShaderFunc2D {
    PARAM_OFFSET = 'offset'
    PARAM_ANGLE = 'angle'
    PARAM_SCALE = 'scale'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_OFFSET, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.30},
            { name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 0.80}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* dc_linear by Xyrus02, http://apophysis-7x.org/extensions */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float offset = ${variation.params.get(this.PARAM_OFFSET)!.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float ldcs = 1.0 / (scale == 0.0 ? 1.0E-5 : scale); 
          _vx += amount * _tx;
          _vy += amount * _ty;
          float s = sin(angle);
          float c = cos(angle);
          _color = mod(abs(0.5 * (ldcs * ((c * _vx + s * _vy + offset)) + 1.0)), 1.0);
        }`;
    }

    get name(): string {
        return 'dc_linear';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_DC];
    }
}

class DevilWarpFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_EFFECT = 'effect'
    PARAM_WARP = 'warp'
    PARAM_RMIN = 'rmin'
    PARAM_RMAX = 'rmax'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 1.00},
            { name: this.PARAM_EFFECT, type: VariationParamType.VP_NUMBER, initialValue: 1.00},
            { name: this.PARAM_WARP, type: VariationParamType.VP_NUMBER, initialValue: 0.50},
            { name: this.PARAM_RMIN, type: VariationParamType.VP_NUMBER, initialValue: -0.24},
            { name: this.PARAM_RMAX, type: VariationParamType.VP_NUMBER, initialValue: 100.00}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* devil_warp by dark-beam */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
            float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
            float effect = ${variation.params.get(this.PARAM_EFFECT)!.toWebGl()};
            float warp = ${variation.params.get(this.PARAM_WARP)!.toWebGl()};
            float rmin = ${variation.params.get(this.PARAM_RMIN)!.toWebGl()}; 
            float rmax = ${variation.params.get(this.PARAM_RMAX)!.toWebGl()}; 
            float xx = _tx;
            float yy = _ty;
            float r2 = 1.0 / (xx * xx + yy * yy);
            float r = pow(xx * xx + r2 * b * yy * yy, warp) - pow(yy * yy + r2 * a * xx * xx, warp);
            if (r > rmax)
              r = rmax;
            else if (r < rmin)
              r = rmin;
            r = effect * (r);
            _vx += xx * (1.0 + r);
            _vy += yy * (1.0 + r);
        }`;
    }

    get name(): string {
        return 'devil_warp';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DiamondFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float sinA = _tx / _r;
                  float cosA = _ty / _r;
                  float sinr = sin(_r);
                  float cosr = cos(_r);
                  _vx += amount * sinA * cosr;
                  _vy += amount * cosA * sinr;
                }`;
    }

    get name(): string {
        return 'diamond';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DiscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float rPI = M_PI * sqrt(_tx * _tx + _ty * _ty);
                  float sinr = sin(rPI);
                  float cosr = cos(rPI);
                  float r = amount * _phi / M_PI;
                  _vx += sinr * r;
                  _vy += cosr * r;
                }`;
    }

    get name(): string {
        return 'disc';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Disc2Func extends VariationShaderFunc2D {
    PARAM_ROT = 'rot'
    PARAM_TWIST = 'twist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ROT, type: VariationParamType.VP_NUMBER, initialValue: 2.0},
                { name: this.PARAM_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.50}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rot = ${variation.params.get(this.PARAM_ROT)!.toWebGl()};
          float twist = ${variation.params.get(this.PARAM_TWIST)!.toWebGl()};
         
          float add = twist;
          float timespi = rot * M_PI;
          float sinadd = sin(add);
          float cosadd = cos(add);
          cosadd -= 1.0;
          float k;
          if (add > 2.0 * M_PI) {
             k = (1.0 + add - 2.0 * M_PI);
             cosadd *= k;
             sinadd *= k;
          }
          else if (add < -2.0 * M_PI) {
             k = (1.0 + add + 2.0 * M_PI);
             cosadd *= k;
             sinadd *= k;
          };
          float t = timespi * (_tx + _ty);
          float sinr = sin(t);
          float cosr = cos(t);
          float r = amount * _phi / M_PI;
        
          _vx += (sinr + cosadd) * r;
          _vy += (cosr + sinadd) * r;
        }`;
    }

    get name(): string {
        return 'disc2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DustPointFunc extends VariationShaderFunc2D {

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Three Point Pivot/Overlap IFS Triangle
         *
         * @author Jesus Sosa
         * @date November 4, 2017
         * based on a work of Roger Bagula:
         * http://paulbourke.net/fractals/ifs_curved/roger5.c
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x, y, p, r;
          p = (rand8(tex, rngState) < 0.5) ? 1.0 : -1.0;
          r = sqrt(_tx * _tx + _ty * _ty);
          float w = rand8(tex, rngState);
          if (w < 0.50) {
            x = _tx / r - 1.0;
            y = p * _ty / r;
          } else if (w < 0.75) {
            x = _tx / 3.0;
            y = _ty / 3.0;
          } else {
            x = _tx / 3.0 + 2.0 / 3.0;
            y = _ty / 3.0;
          }
          _vx += x * amount;
          _vy += y * amount;
        }`;
    }

    get name(): string {
        return 'dustpoint';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class EclipseFunc extends VariationShaderFunc2D {
    PARAM_SHIFT = 'shift'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.10}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /*
         * eclipse by Michael Faber,
         * http://michaelfaber.deviantart.com/art/Eclipse-268362046
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float shift = ${variation.params.get(this.PARAM_SHIFT)!.toWebGl()};
          if (abs(_ty) <= amount) {
            float c_2 = sqrt(sqr(amount) - sqr(_ty));
            if (abs(_tx) <= c_2) {
              float x = _tx + shift * amount;
              if (abs(x) >= c_2) {
                _vx -= amount * _tx;
              } else {
                _vx += amount * x;
              }
            } else {
              _vx += amount * _tx;
            }
            _vy += amount * _ty;
          } else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'eclipse';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EDiscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Edisc in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float tmp = _r2 + 1.0;
          float tmp2 = 2.0 * _tx;
          float r1 = sqrt(tmp + tmp2);
          float r2 = sqrt(tmp - tmp2);
          float xmax = (r1 + r2) * 0.5;
          float a1 = log(xmax + sqrt(xmax - 1.0));
          float a2 = -acos(_tx / xmax);
          float w = amount / 11.57034632;
        
          float snv = sin(a1);
          float csv = cos(a1);
          float snhu = sinh(a2);
          float cshu = cosh(a2);
        
          if (_ty > 0.0) {
            snv = -snv;
          }
        
          _vx += w * cshu * csv;
          _vy += w * snhu * snv;
        }`;
    }

    get name(): string {
        return 'edisc';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EJuliaFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // eJulia by Michael Faber, http://michaelfaber.deviantart.com/art/eSeries-306044892
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          int _sign = 1;
          if (power < 0)
            _sign = -1;
          float r2 = _ty * _ty + _tx * _tx;
          float tmp2;
          float x;
          if (_sign == 1)
            x = _tx;
          else {
            r2 = 1.0 / r2;
            x = _tx * r2;
          }
          float tmp = r2 + 1.0;
          tmp2 = 2.0 * x;
          float xmax = (sqrt_safe(tmp + tmp2) + sqrt_safe(tmp - tmp2)) * 0.5;
          if (xmax < 1.0)
            xmax = 1.0;
          float sinhmu, coshmu, sinnu, cosnu;
          float mu = acosh(xmax); 
          float t = x / xmax;
          if (t > 1.0)
            t = 1.0;
          else if (t < -1.0)
            t = -1.0;
          float nu = acos(t); 
          if (_ty < 0.0)
            nu *= -1.0;
          nu = nu / float(power) + (2.0*M_PI) / float(power) * floor(rand8(tex, rngState) * float(power));
          mu /= float(power);
          sinhmu = sinh(mu);
          coshmu = cosh(mu);
          sinnu = sin(nu);
          cosnu = cos(nu);
          _vx += amount * coshmu * cosnu;
          _vy += amount * sinhmu * sinnu;
        }`;
    }

    get name(): string {
        return 'eJulia';
    }

    get funcDependencies(): string[] {
        return [FUNC_ACOSH, FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EllipticFunc extends VariationShaderFunc2D {
    //MODE_ORIGINAL = 0; // Original Apophysis plugin
    MODE_MIRRORY = 1; // Mirror y result; legacy JWildfire behavior
    MODE_PRECISION = 2; // Alternate calculation to avoid precision loss by Claude Heiland-Allen; see https://mathr.co.uk/blog/2017-11-01_a_more_accurate_elliptic_variation.html

    PARAM_MODE = 'mode'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.MODE_MIRRORY }]
    }

    get funcDependencies(): string[] {
        return [FUNC_SQRT1PM1]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int mode = ${variation.params.get(this.PARAM_MODE)!.toWebGl()};
          float _v = amount * 2.0 / M_PI;
          
          if (mode == ${this.MODE_PRECISION}) {
             float sq = _ty * _ty + _tx * _tx;
             float x2 = 2.0 * _tx;
             float xmaxm1 = 0.5 * (sqrt1pm1(sq + x2) + sqrt1pm1(sq - x2));
             float ssx = (xmaxm1 < 0.0) ? 0.0 : sqrt(xmaxm1);
             float a = _tx / (1.0 + xmaxm1);
              
             int sign = (_ty > 0.0) ? 1 : -1;
             _vx += _v * asin(max(-1.0, min(1.0, a)));  
             _vy += float(sign) * _v * log(xmaxm1 + ssx+1.0);
          } else {  
             float tmp = _ty * _ty + _tx * _tx + 1.0;
             float x2 = 2.0 * _tx;
             float xmax = 0.5 * (sqrt(tmp + x2) + sqrt(tmp - x2));
          
             float a = _tx / xmax;
             float b = sqrt_safe(1.0 - a * a);
             
             int sign = (_ty > 0.0) ? 1 : -1;
             if (mode == ${this.MODE_MIRRORY}) {
               sign = (rand8(tex, rngState) < 0.5) ? 1 : -1;
             }
             _vx += _v * atan2(a, b);
             _vy += float(sign) * _v * log(xmax + sqrt_safe(xmax - 1.0));
          }
        }`;
    }

    get name(): string {
        return 'elliptic';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EpispiralFunc extends VariationShaderFunc2D {
    PARAM_N = 'n'
    PARAM_THICKNESS = 'thickness'
    PARAM_HOLES = 'holes'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 6.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // epispiral by cyberxaos, http://cyberxaos.deviantart.com/journal/Epispiral-Plugin-240086108
        return `{
          float amount = ${variation.amount.toWebGl()};
          float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
          float thickness = ${variation.params.get(this.PARAM_THICKNESS)!.toWebGl()};
          float holes = ${variation.params.get(this.PARAM_HOLES)!.toWebGl()};
          float theta = atan2(_ty, _tx);
          float t = -holes;
          if (thickness > EPSILON || thickness < -EPSILON) {
             float d = cos(n * theta);
             if (d != 0.0) {
               t += (rand8(tex, rngState) * thickness) * (1.0 / d);  
             }
          } 
          else {
            float d = cos(n * theta);
            if (d != 0.0) {
              t += 1.0 / d;
            }
          }
          _vx += amount * t * cos(theta);
          _vy += amount * t * sin(theta);   
        }`;
    }

    get name(): string {
        return 'epispiral';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EpispiralWFFunc extends VariationShaderFunc2D {
    PARAM_WAVES = 'waves'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_WAVES, type: VariationParamType.VP_NUMBER, initialValue: 4.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float waves = ${variation.params.get(this.PARAM_WAVES)!.toWebGl()};
          float a = atan2(_tx, _ty);
          float r = sqrt(_tx * _tx + _ty * _ty);
          float d = cos(waves * a);
          if (d != 0.0) {
            r = 0.5 / d;
            float nx = sin(a) * r;
            float ny = cos(a) * r;
        
            _vx += amount * nx;
            _vy += amount * ny;
          }
        }`;
    }

    get name(): string {
        return 'epispiral_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EscherFunc extends VariationShaderFunc2D {
    PARAM_BETA = 'beta'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_BETA, type: VariationParamType.VP_NUMBER, initialValue: 0.3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Escher in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float beta = ${variation.params.get(this.PARAM_BETA)!.toWebGl()};
          float _theta = atan2(_ty, _tx);
          float a = _theta;
          float lnr = 0.5 * log(_r2);
        
          float seb = sin(beta);
          float ceb = cos(beta);
        
          float vc = 0.5 * (1.0 + ceb);
          float vd = 0.5 * seb;
        
          float m = amount * exp(vc * lnr - vd * a);
          float n = vc * a + vd * lnr;
        
          float sn = sin(n);
          float cn = cos(n);
        
          _vx += m * cn;
          _vy += m * sn;
        }`;
    }

    get name(): string {
        return 'escher';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Ex extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = sqrt(_tx * _tx + _ty * _ty);
            float n0 = sin(_phi + r);
            float n1 = cos(_phi - r);
            float m0 = n0 * n0 * n0;
            float m1 = n1 * n1 * n1;
            r = r * amount;
            _vx += r * (m0 + m1);
            _vy += r * (m0 - m1);
        }`;
    }

    get name(): string {
        return 'ex';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ExpFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Exponential EXP
        return `{
            float amount = ${variation.amount.toWebGl()};
            float expe = exp(_tx);
            float expsin = sin(_ty);
            float expcos = cos(_ty);
            _vx += amount * expe * expcos;
            _vy += amount * expe * expsin;
        }`;
    }

    get name(): string {
        return 'exp';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ExponentialFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = M_PI * _ty;
            float sinr = sin(r);
            float cosr = cos(r);
            float d = amount * exp(_tx - 1.0);
            _vx += cosr * d;
            _vy += sinr * d;
        }`;
    }

    get name(): string {
        return 'exponential';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EyefishFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = 2.0 * amount / (sqrt(_tx * _tx + _ty * _ty) + 1.0);
            _vx += r * _tx;
            _vy += r * _ty;
        }`;
    }

    get name(): string {
        return 'eyefish';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FanFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float dx = M_PI * ${xform.xyC20.toWebGl()} * ${xform.xyC20.toWebGl()} + EPSILON;
            float dx2 = dx / 2.0;
            float a;
            if ((_phi + ${xform.xyC21.toWebGl()} - (floor((_phi + ${xform.xyC21.toWebGl()}) / dx)) * dx) > dx2)
              a = _phi - dx2;
            else
              a = _phi + dx2;
            float sinr = sin(a);
            float cosr = cos(a);
            float r = amount * sqrt(_tx * _tx + _ty * _ty);
            _vx += r * cosr;
            _vy += r * sinr;
        }`;
    }

    get name(): string {
        return 'fan';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Fan2Func extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
            float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
            float r = sqrt(_tx * _tx + _ty * _ty);
            float angle;
            if ((_tx < -EPSILON) || (_tx > EPSILON) || (_ty < -EPSILON) || (_ty > EPSILON)) {
              angle = atan2(_tx, _ty);
            } else {
              angle = 0.0;
            }
        
            float dy = y;
            float dx = M_PI * (x * x) + EPSILON;
            float dx2 = dx * 0.5;
        
            float t = angle + dy - floor((angle + dy) / dx) * dx;
            float a;
            if (t > dx2) {
              a = angle - dx2;
            } else {
              a = angle + dx2;
            }
        
            _vx += amount * r * sin(a);
            _vy += amount * r * cos(a);

        }`;
    }

    get name(): string {
        return 'fan2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FDiscFunc extends VariationShaderFunc2D {
    PARAM_ASHIFT = 'ashift'
    PARAM_RSHIFT = 'rshift'
    PARAM_XSHIFT = 'xshift'
    PARAM_YSHIFT = 'yshift'
    PARAM_TERM1 = 'term1'
    PARAM_TERM2 = 'term2'
    PARAM_TERM3 = 'term3'
    PARAM_TERM4 = 'term4'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ASHIFT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_RSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_XSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_YSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TERM1, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_TERM2, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TERM3, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TERM4, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * ported from fdisc plugin for Apophysis7X, author unknown (couldn't find author name for plugin)
         * ported to JWildfire variation by CozyG
         * and enhanced with user-adjustable parameters
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float ashift = ${variation.params.get(this.PARAM_ASHIFT)!.toWebGl()};
          float rshift = ${variation.params.get(this.PARAM_RSHIFT)!.toWebGl()};
          float xshift = ${variation.params.get(this.PARAM_XSHIFT)!.toWebGl()};
          float yshift = ${variation.params.get(this.PARAM_YSHIFT)!.toWebGl()};
          float term1 = ${variation.params.get(this.PARAM_TERM1)!.toWebGl()};
          float term2 = ${variation.params.get(this.PARAM_TERM2)!.toWebGl()};
          float term3 = ${variation.params.get(this.PARAM_TERM3)!.toWebGl()};
          float term4 = ${variation.params.get(this.PARAM_TERM4)!.toWebGl()};
          float afactor = (2.0*M_PI) / (_r + ashift);
          float r = (atan2(_ty, _tx) * (1.0 / M_PI) + rshift) * 0.5;
          float xfactor = cos(afactor + xshift);
          float yfactor = sin(afactor + yshift);
          float pr = amount * r;
          float prx = pr * xfactor;
          float pry = pr * yfactor;
          _vx += (term1 * prx) + (term2 * _tx * prx) + (term3 * _tx * pr) + (term4 * _tx);
          _vy += (term1 * pry) + (term2 * _ty * pry) + (term3 * _ty * pr) + (term4 * _ty);
        }`;
    }

    get name(): string {
        return 'fdisc';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FisheyeFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = sqrt(_tx * _tx + _ty * _ty);
            r = 2.0 * r / (r + 1.0);
            _vx += amount * r * _ty / _r;
            _vy += amount * r * _tx / _r;
        }`;
    }

    get name(): string {
        return 'fisheye';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FlipCircleFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // flipcircle by MichaelFaber, http://michaelfaber.deviantart.com/art/Flip-216005432
        return `{
            float amount = ${variation.amount.toWebGl()};
            if (sqr(_tx) + sqr(_ty) > sqr(amount))
              _vy += amount * _ty;
            else
              _vy -= amount * _ty;
            _vx += amount * _tx;
        }`;
    }

    get name(): string {
        return 'flipcircle';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FlipYFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // flipy by MichaelFaber, http://michaelfaber.deviantart.com/art/Flip-216005432
        return `{
            float amount = ${variation.amount.toWebGl()};
            if (_tx > 0.0)
              _vy -= amount * _ty;
            else
              _vy += amount * _ty;
            _vx += amount * _tx;
        }`;
    }

    get name(): string {
        return 'flipy';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FlowerFunc extends VariationShaderFunc2D {
    PARAM_HOLES = 'holes'
    PARAM_PETALS = 'petals'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
            { name: this.PARAM_PETALS, type: VariationParamType.VP_NUMBER, initialValue: 7.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cyberxaos, 4/2007 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float holes = ${variation.params.get(this.PARAM_HOLES)!.toWebGl()};
            float petals = ${variation.params.get(this.PARAM_PETALS)!.toWebGl()};
            float _theta = atan2(_ty, _tx);
            float theta = _theta;
            float d = _r;
            if (d != 0.0) {
              float r = amount * (rand8(tex, rngState) - holes) * cos(petals * theta) / d;
              _vx += r * _tx;
              _vy += r * _ty;
             }
        }`;
    }

    get name(): string {
        return 'flower';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class FluxFunc extends VariationShaderFunc2D {
    PARAM_SPREAD = 'spread'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPREAD, type: VariationParamType.VP_NUMBER, initialValue: 0.3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Flux, by meckie
        return `{
            float amount = ${variation.amount.toWebGl()};
            float spread = ${variation.params.get(this.PARAM_SPREAD)!.toWebGl()};
         
            float xpw = _tx + amount;
            float xmw = _tx - amount;
            float avgr = amount * (2.0 + spread) * sqrt(sqrt(_ty * _ty + xpw * xpw) / sqrt(_ty * _ty + xmw * xmw));
            float avga = (atan2(_ty, xmw) - atan2(_ty, xpw)) * 0.5;
        
            _vx += avgr * cos(avga);
            _vy += avgr * sin(avga);
        }`;
    }

    get name(): string {
        return 'flux';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FociFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Foci in the Apophysis Plugin Pack */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float expx = exp(_tx) * 0.5;
            float expnx = 0.25 / expx;
            if (expx > EPSILON && expnx > EPSILON) {
                float siny = sin(_ty);
                float cosy = cos(_ty);
                float tmp = (expx + expnx - cosy);
                if (tmp != 0.0) {
                    tmp = amount / tmp;   
                    _vx += (expx - expnx) * tmp;
                    _vy += siny * tmp;
                }   
            }
        }`;
    }

    get name(): string {
        return 'foci';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

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
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_RADIUS1, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_PHI1, type: VariationParamType.VP_NUMBER, initialValue: 110.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_POW, type: VariationParamType.VP_NUMBER, initialValue: 1.5 },
            { name: this.PARAM_CONTRAST, type: VariationParamType.VP_NUMBER, initialValue: 0.50 }]
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
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_CONTRAST, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_POW, type: VariationParamType.VP_NUMBER, initialValue: 1.5 },
            { name: this.PARAM_PHI1, type: VariationParamType.VP_NUMBER, initialValue: 110.0 },
            { name: this.PARAM_PHI2, type: VariationParamType.VP_NUMBER, initialValue: 150.0 }           ]
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
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_CONTRAST, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_POW, type: VariationParamType.VP_NUMBER, initialValue: 1.5 }
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

class FourthFunc extends VariationShaderFunc2D {
    PARAM_SPIN = 'spin'
    PARAM_SPACE = 'space'
    PARAM_TWIST = 'twist'
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPIN, type: VariationParamType.VP_NUMBER, initialValue: M_PI },
            { name: this.PARAM_SPACE, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.30 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.12 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* fourth from guagapunyaimel, http://amorinaashton.deviantart.com/art/Fourth-Plugin-175043938?q=favby%3Aamorinaashton%2F1243451&qo=14 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float spin = ${variation.params.get(this.PARAM_SPIN)!.toWebGl()};
          float space = ${variation.params.get(this.PARAM_SPACE)!.toWebGl()};
          float twist = ${variation.params.get(this.PARAM_TWIST)!.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
        
          float sqrvvar = amount * amount;
          if (_tx > 0.0 && _ty > 0.0) {
            float a = atan2(_ty, _tx);
            float r = 1.0 / sqrt(sqr(_tx) + sqr(_ty));
            float s = sin(a);
            float c = cos(a);
            _vx += amount * r * c;
            _vy += amount * r * s;
          } 
          else if (_tx > 0.0 && _ty < 0.0) {
            float r2 = sqr(_tx) + sqr(_ty);
            if (r2 < sqrvvar) {
              float r = amount * sqrt(sqrvvar / r2 - 1.0);
              _vx += r * _tx;
              _vy += r * _ty;
            } else {
              _vx += amount * _tx;
              _vy += amount * _ty;
            }
          } 
          else if (_tx < 0.0 && _ty > 0.0) {
            float r;
            float sina, cosa;
            float x = _tx - x;
            float y = _ty + y;
            r = sqrt(x * x + y * y); 
            if (r < amount) {
              float a = atan2(y, x) + spin + twist * (amount - r);
              sina = sin(a);
              cosa = cos(a);
              r = amount * r;
              _vx += r * cosa + x;
              _vy += r * sina - y;
            } else {
              r = amount * (1.0 + space / r);
              _vx += r * x + x;
              _vy += r * y - y;
            }
          } 
          else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'fourth';
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
        return [{ name: this.PARAM_SCALE_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SCALE_T, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_SHIFT_T, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_SCALE_R_LEFT, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_SCALE_R_RIGHT, type: VariationParamType.VP_NUMBER, initialValue: 1.0}
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
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 1.0}
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
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_INSIDE, type: VariationParamType.VP_NUMBER, initialValue: 0}
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
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_INSIDE, type: VariationParamType.VP_NUMBER, initialValue: 0},
            { name: this.PARAM_SHAPE, type: VariationParamType.VP_NUMBER, initialValue: 0 }
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

class HypertileFunc extends VariationShaderFunc2D {
    PARAM_P = 'p'
    PARAM_Q = 'q'
    PARAM_N = 'n'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_P, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_NUMBER, initialValue: 7 },
            { name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 1 }
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
        return [{ name: this.PARAM_P, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_NUMBER, initialValue: 7 }
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
        return [{ name: this.PARAM_P, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_NUMBER, initialValue: 7 }
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
        return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.15 }]
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
        return [{ name: this.PARAM_XWIDTH, type: VariationParamType.VP_NUMBER, initialValue: 5.0 },
            { name: this.PARAM_XTILESIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_XMOD1, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_XMOD2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_XHEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 0.5},
            { name: this.PARAM_YHEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 5.0 },
            { name: this.PARAM_YTILESIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_YMOD1, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_YMOD2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_YWIDTH, type: VariationParamType.VP_NUMBER, initialValue: 0.5 }
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
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_Y2_MULT, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_A2X_MULT, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_A2Y_MULT, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_A2Y_ADD, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_COS_MULT, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_Y_MULT, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_CENTER, type: VariationParamType.VP_NUMBER, initialValue: M_PI},
            { name: this.PARAM_X2Y2_ADD, type: VariationParamType.VP_NUMBER, initialValue: 0.0}
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
        return [{ name: this.PARAM_RE, type: VariationParamType.VP_NUMBER, initialValue: 3.5 },
            { name: this.PARAM_IM, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0}]
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
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0}]
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
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.0}
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
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_DIVISOR, type: VariationParamType.VP_NUMBER, initialValue: 2 }]
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
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0}]
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

export function registerVars_2D_PartA() {
    VariationShaders.registerVar(new ArchFunc())
    VariationShaders.registerVar(new AsteriaFunc())
    VariationShaders.registerVar(new AugerFunc())
    VariationShaders.registerVar(new BarycentroidFunc())
    VariationShaders.registerVar(new BentFunc())
    VariationShaders.registerVar(new Bent2Func())
    VariationShaders.registerVar(new BiLinearFunc())
    VariationShaders.registerVar(new BipolarFunc())
    VariationShaders.registerVar(new BladeFunc())
    VariationShaders.registerVar(new BlobFunc())
    VariationShaders.registerVar(new BlockYFunc())
    VariationShaders.registerVar(new BoardersFunc())
    VariationShaders.registerVar(new Boarders2Func())
    VariationShaders.registerVar(new ButterflyFunc())
    VariationShaders.registerVar(new BWraps7Func())
    VariationShaders.registerVar(new CannabisCurveWFFunc())
    VariationShaders.registerVar(new ChecksFunc())
    VariationShaders.registerVar(new CellFunc())
    VariationShaders.registerVar(new CirclizeFunc())
    VariationShaders.registerVar(new CircusFunc())
    VariationShaders.registerVar(new CloverLeafWFFunc())
    VariationShaders.registerVar(new CollideoscopeFunc())
    VariationShaders.registerVar(new ConicFunc())
    VariationShaders.registerVar(new CosFunc())
    VariationShaders.registerVar(new CoshFunc())
    VariationShaders.registerVar(new CosineFunc())
    VariationShaders.registerVar(new CotFunc())
    VariationShaders.registerVar(new CothFunc())
    VariationShaders.registerVar(new CPowFunc())
    VariationShaders.registerVar(new CropFunc())
    VariationShaders.registerVar(new CrossFunc())
    VariationShaders.registerVar(new CscFunc())
    VariationShaders.registerVar(new CschFunc())
    VariationShaders.registerVar(new CurlFunc())
    VariationShaders.registerVar(new CurveFunc())
    VariationShaders.registerVar(new CylinderFunc())
    VariationShaders.registerVar(new DCLinearFunc())
    VariationShaders.registerVar(new DevilWarpFunc())
    VariationShaders.registerVar(new DiamondFunc())
    VariationShaders.registerVar(new DiscFunc())
    VariationShaders.registerVar(new Disc2Func())
    VariationShaders.registerVar(new DustPointFunc())
    VariationShaders.registerVar(new EclipseFunc())
    VariationShaders.registerVar(new EDiscFunc())
    VariationShaders.registerVar(new EJuliaFunc())
    VariationShaders.registerVar(new EllipticFunc())
    VariationShaders.registerVar(new EpispiralFunc())
    VariationShaders.registerVar(new EpispiralWFFunc())
    VariationShaders.registerVar(new EscherFunc())
    VariationShaders.registerVar(new Ex())
    VariationShaders.registerVar(new ExpFunc())
    VariationShaders.registerVar(new ExponentialFunc())
    VariationShaders.registerVar(new EyefishFunc())
    VariationShaders.registerVar(new FanFunc())
    VariationShaders.registerVar(new Fan2Func())
    VariationShaders.registerVar(new FDiscFunc())
    VariationShaders.registerVar(new FisheyeFunc())
    VariationShaders.registerVar(new FlipCircleFunc())
    VariationShaders.registerVar(new FlipYFunc())
    VariationShaders.registerVar(new FlowerFunc())
    VariationShaders.registerVar(new FluxFunc())
    VariationShaders.registerVar(new FociFunc())
    VariationShaders.registerVar(new FourthFunc())
    VariationShaders.registerVar(new GaussianBlurFunc())
    VariationShaders.registerVar(new GlynniaFunc())
    VariationShaders.registerVar(new GlynnSim1Func())
    VariationShaders.registerVar(new GlynnSim2Func())
    VariationShaders.registerVar(new GlynnSim3Func())
    VariationShaders.registerVar(new HeartFunc())
    VariationShaders.registerVar(new HeartWFFunc())
    VariationShaders.registerVar(new HenonFunc())
    VariationShaders.registerVar(new HoleFunc())
    VariationShaders.registerVar(new Hole2Func())
    VariationShaders.registerVar(new HorseshoeFunc())
    VariationShaders.registerVar(new HyperbolicFunc())
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
