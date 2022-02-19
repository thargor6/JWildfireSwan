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

// TODO: does not work
class AcoshFunc extends VariationShaderFunc2D {
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

class ArchFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
              float ang = rand2(tex) * amount * M_PI;
              float sinr = sin(ang);
              float cosr = cos(ang);
              if (cosr != 0.0) {
                _vx += amount * sinr;
                _vy += amount * (sinr * sinr) / cosr;
              }
        }`;
    }

    get name(): string {
        return "arch";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AugerFunc extends VariationShaderFunc2D {
    PARAM_FREQ = "freq"
    PARAM_WEIGHT = "weight"
    PARAM_SYM = "sym"
    PARAM_SCALE = "scale"

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
          float amount = float(${variation.amount});
          float freq = float(${variation.params.get(this.PARAM_FREQ)});
          float weight = float(${variation.params.get(this.PARAM_WEIGHT)});
          float sym = float(${variation.params.get(this.PARAM_SYM)});
          float scale = float(${variation.params.get(this.PARAM_SCALE)});
          float s = sin(freq * _tx);
          float t = sin(freq * _ty);
          float dy = _ty + weight * (scale * s * 0.5 + abs(_ty) * s);
          float dx = _tx + weight * (scale * t * 0.5 + abs(_tx) * t);
          _vx += amount * (_tx + sym * (dx - _tx));
          _vy += amount * dy;
        }`;
    }

    get name(): string {
        return "auger";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BentFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
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
        return "bent";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Bent2Func extends VariationShaderFunc2D {
    PARAM_X = "x"
    PARAM_Y = "y"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
                { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Bent2 in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
          float x = float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)});
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
        return "bent2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BiLinearFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          _vx += amount * _ty;
          _vy += amount * _tx;
        }`;
    }

    get name(): string {
        return "bi_linear";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BipolarFunc extends VariationShaderFunc2D {
    PARAM_SHIFT = "shift"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Bipolar in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
          float x2y2 = (_tx * _tx + _ty * _ty);
          float t = x2y2 + 1.0;
          float x2 = 2.0 * _tx;
          float shift = float(${variation.params.get(this.PARAM_SHIFT)});
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
        return "bipolar";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BladeFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = float(${variation.amount});
          float r = rand2(tex) * amount * sqrt(_tx * _tx + _ty * _ty);
          float sinr = sin(r);
          float cosr = cos(r);
          _vx += amount * _tx * (cosr + sinr);
          _vy += amount * _tx * (cosr - sinr);
        }`;
    }

    get name(): string {
        return "blade";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BlobFunc extends VariationShaderFunc2D {
    PARAM_LOW = "low"
    PARAM_HIGH = "high"
    PARAM_WAVES = "waves"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LOW, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_HIGH, type: VariationParamType.VP_NUMBER, initialValue: 1.2 },
            { name: this.PARAM_WAVES, type: VariationParamType.VP_NUMBER, initialValue: 6 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float low = float(${variation.params.get(this.PARAM_LOW)});
          float high = float(${variation.params.get(this.PARAM_HIGH)});
          int waves = int(${variation.params.get(this.PARAM_WAVES)});
          float a = atan2(_tx, _ty);
          float r = sqrt(_tx * _tx + _ty * _ty);
          r = r * (low + (high - low) * (0.5 + 0.5 * sin(float(waves) * a)));
          float nx = sin(a) * r;
          float ny = cos(a) * r;
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return "blob";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BlurFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float r = rand2(tex) * (M_PI + M_PI);
          float sina = sin(r);
          float cosa = cos(r);
          float r2 = amount * rand3(tex);
          _vx += r2 * cosa;
          _vy += r2 * sina;
        }`;
    }

    get name(): string {
        return "blur";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class BoardersFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Boarders in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
          float roundX = float(int(_tx+0.5));
          float roundY = float(int(_ty+0.5));
          float offsetX = _tx - roundX;
          float offsetY = _ty - roundY;
          if (rand2(tex) >= 0.75) {
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
        return "boarders";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Boarders2Func extends VariationShaderFunc2D {
    PARAM_C = "c"
    PARAM_LEFT = "left"
    PARAM_RIGHT = "right"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.40 },
            { name: this.PARAM_LEFT, type: VariationParamType.VP_NUMBER, initialValue: 0.65 },
            { name: this.PARAM_RIGHT, type: VariationParamType.VP_NUMBER, initialValue: 0.35 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // boarders2 by Xyrus02, http://xyrus02.deviantart.com/art/Boarders2-plugin-for-Apophysis-173427128
        return `{
          float amount = float(${variation.amount});
          float c = float(${variation.params.get(this.PARAM_C)});
          float left = float(${variation.params.get(this.PARAM_LEFT)});
          float right = float(${variation.params.get(this.PARAM_RIGHT)});
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
          if (rand2(tex) >= _cr) {
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
        return "boarders2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ButterflyFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* wx is weight*4/sqrt(3*pi) */
        return `{
          float amount = float(${variation.amount});
          float wx = amount * 1.3029400317411197908970256609023;
          float y2 = _ty * 2.0;
          float r = wx * sqrt(abs(_ty * _tx) / (EPSILON + _tx * _tx + y2 * y2));
          _vx += r * _tx;
          _vy += r * y2;
        }`;
    }

    get name(): string {
        return "butterfly";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BWraps7Func extends VariationShaderFunc2D {
    PARAM_CELLSIZE = "cellsize"
    PARAM_SPACE = "space"
    PARAM_GAIN = "gain"
    PARAM_INNER_TWIST = "inner_twist"
    PARAM_OUTER_TWIST = "outer_twist"

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
          float amount = float(${variation.amount});
          float cellsize = float(${variation.params.get(this.PARAM_CELLSIZE)});
          float space = float(${variation.params.get(this.PARAM_SPACE)});
          float gain = float(${variation.params.get(this.PARAM_GAIN)});
          float inner_twist = float(${variation.params.get(this.PARAM_INNER_TWIST)});
          float outer_twist = float(${variation.params.get(this.PARAM_OUTER_TWIST)});
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
        return "bwraps7";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CannabisCurveWFFunc extends VariationShaderFunc2D {
    PARAM_FILLED = "filled"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // cannabis curve (http://mathworld.wolfram.com/CannabisCurve.html)
        return `{
          float amount = float(${variation.amount});
          float a = _phi;
          
          float r = (1.0 + 9.0 / 10.0 * cos(8.0 * a)) * (1.0 + 1.0 / 10.0 * cos(24.0 * a)) * (9.0 / 10.0 + 1.0 / 10.0 * cos(200.0 * a)) * (1.0 + sin(a));
          a += M_PI / 2.0;
        
          float filled = float(${variation.params.get(this.PARAM_FILLED)});
          if (filled > 0.0 && filled > rand2(tex)) {
            r *= rand3(tex);
          }
        
          float nx = sin(a) * r;
          float ny = cos(a) * r;
        
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return "cannabiscurve_wf";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class CellFunc extends VariationShaderFunc2D {
    PARAM_SIZE = "size"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.6 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Cell in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
          float size = float(${variation.params.get(this.PARAM_SIZE)});
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
        return "cell";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CirclizeFunc extends VariationShaderFunc2D {
    PARAM_HOLE = "hole"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HOLE, type: VariationParamType.VP_NUMBER, initialValue: 0.40 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float hole = float(${variation.params.get(this.PARAM_HOLE)});
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
        return "circlize";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CloverLeafWFFunc extends VariationShaderFunc2D {
    PARAM_FILLED = "filled"

    get params(): VariationParam[] {
      return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float a = _phi;

          float r = (sin(2.0 * a) + 0.25 * sin(6.0 * a));

          float filled = float(${variation.params.get(this.PARAM_FILLED)});

          if (filled > 0.0 && filled > rand2(tex)) {
            r *= rand3(tex);
          }

          float nx = sin(a) * r;
          float ny = cos(a) * r;
    
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return "cloverleaf_wf";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class CollideoscopeFunc extends VariationShaderFunc2D {
    PARAM_A = "a"
    PARAM_NUM = "num"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_NUM, type: VariationParamType.VP_NUMBER, initialValue: 1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* collideoscope by Michael Faber, http://michaelfaber.deviantart.com/art/Collideoscope-251624597 */
        return `{
          float amount = float(${variation.amount});
          float a = float(${variation.params.get(this.PARAM_A)});
          int num = int(${variation.params.get(this.PARAM_NUM)});
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
        return "collideoscope";
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ConicFunc extends VariationShaderFunc2D {
    PARAM_ECCENTRICITY = "eccentricity"
    PARAM_HOLES = "holes"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ECCENTRICITY, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cyberxaos, 4/2007 */
        return `{
          float amount = float(${variation.amount});
          float eccentricity = float(${variation.params.get(this.PARAM_ECCENTRICITY)});
          float holes = float(${variation.params.get(this.PARAM_HOLES)});
          float ct = _tx / _r;
          float r = amount * (rand2(tex) - holes) * eccentricity / (1.0 + eccentricity * ct) / _r;
         _vx += r * _tx;
         _vy += r * _ty;
        }`;
    }

    get name(): string {
        return "conic";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CPowFunc extends VariationShaderFunc2D {
    PARAM_R = "r"
    PARAM_I = "i"
    PARAM_POWER = "power"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_R, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_I, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 1.5 }]
    }

    /* Cpow in the Apophysis Plugin Pack */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = float(${variation.amount});
                  float r = float(${variation.params.get(this.PARAM_R)});
                  float i = float(${variation.params.get(this.PARAM_I)});
                  float power = float(${variation.params.get(this.PARAM_POWER)});
                  float _theta = atan2(_ty, _tx);
                  float a = _theta;
                  float lnr = 0.5 * log(_r2);
                  float va = 2.0 * M_PI / power;
                  float vc = r / power;
                  float vd = i / power;
                  float ang = vc * a + vd * lnr + va * floor(power * rand2(tex));
                
                  float m = amount * exp(vc * lnr - vd * a);
                  float sa = sin(ang);
                  float ca = cos(ang);
                
                  _vx += m * ca;
                  _vy += m * sa;
                }`;
    }


    get name(): string {
        return "cpow";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CropFunc extends VariationShaderFunc2D {
    PARAM_LEFT = "left"
    PARAM_TOP = "top"
    PARAM_RIGHT = "right"
    PARAM_BOTTOM = "bottom"
    PARAM_SCATTER_AREA = "scatter_area"
    PARAM_ZERO = "zero"

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
          float amount = float(${variation.amount});
          float left = float(${variation.params.get(this.PARAM_LEFT)});
          float top = float(${variation.params.get(this.PARAM_TOP)});
          float right = float(${variation.params.get(this.PARAM_RIGHT)});
          float bottom = float(${variation.params.get(this.PARAM_BOTTOM)});
          float scatter_area = float(${variation.params.get(this.PARAM_SCATTER_AREA)});
          int zero = int(${variation.params.get(this.PARAM_ZERO)});
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
              x = xmin + rand2(tex) * w;
            else if (x > xmax)
              x = xmax - rand2(tex) * w;
            if (y < ymin)
              y = ymin + rand3(tex) * h;
            else if (y > ymax)
              y = ymax - rand3(tex) * h;
            _vx = amount * x;
            _vy = amount * y;
          }
        }`;
    }

    get name(): string {
        return "crop";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_CROP];
    }
}

class CrossFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = float(${variation.amount});
                  float s = _tx * _tx - _ty * _ty;
                  float r = amount * sqrt(1.0 / (s * s + EPSILON));
                  _vx += _tx * r;
                  _vy += _ty * r;
                }`;
    }

    get name(): string {
        return "cross";
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
                  float amount = float(${variation.amount});
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
        return "csc";
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
                  float amount = float(${variation.amount});
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
        return "csch";
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
                  float amount = float(${variation.amount});
                  float cossin = sin(_tx);
                  float coscos = cos(_tx);
                  float cossinh = sinh(_ty);
                  float coscosh = cosh(_ty);
                  _vx += amount * coscos * coscosh;
                  _vy -= amount * cossin * cossinh;
                }`;
    }

    get name(): string {
        return "cos";
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
                  float amount = float(${variation.amount});
                  float coshsin = sin(_ty);
                  float coshcos = cos(_ty);
                  float coshsinh = sinh(_tx);
                  float coshcosh = cosh(_tx);
                  _vx += amount * coshcosh * coshcos;
                  _vy += amount * coshsinh * coshsin;
                }`;
    }

    get name(): string {
        return "cosh";
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
                  float amount = float(${variation.amount});
                  float r = _tx * M_PI;
                  float sinr = sin(r);
                  float cosr = cos(r);
                  _vx += amount * cosr * cosh(_ty);
                  _vy -= amount * sinr * sinh(_ty);
                }`;
    }

    get name(): string {
        return "cosine";
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
                  float amount = float(${variation.amount});
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
        return "cot";
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
                  float amount = float(${variation.amount});
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
        return "coth";
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CurlFunc extends VariationShaderFunc2D {
    PARAM_C1 = "c1"
    PARAM_C2 = "c2"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_C1, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
                { name: this.PARAM_C2, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float c1 = float(${variation.params.get(this.PARAM_C1)});
          float c2 = float(${variation.params.get(this.PARAM_C2)});
          float re = 1.0 + c1 * _tx + c2 * (sqr(_tx) - sqr(_ty));
          float im = c1 * _ty + c2 * 2.0 * _tx * _ty;
          float r = amount / (sqr(re) + sqr(im));
          _vx += (_tx * re + _ty * im) * r;
          _vy += (_ty * re - _tx * im) * r;
        }`;
    }

    get name(): string {
        return "curl";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CurveFunc extends VariationShaderFunc2D {
    PARAM_XAMP = "xamp"
    PARAM_YAMP = "yamp"
    PARAM_XLENGTH = "xlength"
    PARAM_YLENGTH = "ylength"

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
          float amount = float(${variation.amount});
          float xamp = float(${variation.params.get(this.PARAM_XAMP)});
          float yamp = float(${variation.params.get(this.PARAM_YAMP)});
          float xlength = float(${variation.params.get(this.PARAM_XLENGTH)});
          float ylength = float(${variation.params.get(this.PARAM_YLENGTH)});
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
        return "curve";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CylinderFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = float(${variation.amount});
                   _vx += amount * sin(_tx);
                   _vy += amount * _ty;
                }`;
    }

    get name(): string {
        return "cylinder";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DCLinearFunc extends VariationShaderFunc2D {
    PARAM_OFFSET = "offset"
    PARAM_ANGLE = "angle"
    PARAM_SCALE = "scale"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_OFFSET, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.30},
            { name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 0.80}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* dc_linear by Xyrus02, http://apophysis-7x.org/extensions */
        return `{
          float amount = float(${variation.amount});
          float offset = float(${variation.params.get(this.PARAM_OFFSET)});
          float angle = float(${variation.params.get(this.PARAM_ANGLE)});
          float scale = float(${variation.params.get(this.PARAM_SCALE)});
          float ldcs = 1.0 / (scale == 0.0 ? 1.0E-5 : scale); 
          _vx += amount * _tx;
          _vy += amount * _ty;
          float s = sin(angle);
          float c = cos(angle);
          _color = mod(abs(0.5 * (ldcs * ((c * _vx + s * _vy + offset)) + 1.0)), 1.0);
        }`;
    }

    get name(): string {
        return "dc_linear";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_DC];
    }
}

class DiamondFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = float(${variation.amount});
                  float sinA = _tx / _r;
                  float cosA = _ty / _r;
                  float sinr = sin(_r);
                  float cosr = cos(_r);
                  _vx += amount * sinA * cosr;
                  _vy += amount * cosA * sinr;
                }`;
    }

    get name(): string {
        return "diamond";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DiscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = float(${variation.amount});
                  float rPI = M_PI * sqrt(_tx * _tx + _ty * _ty);
                  float sinr = sin(rPI);
                  float cosr = cos(rPI);
                  float r = amount * _phi / M_PI;
                  _vx += sinr * r;
                  _vy += cosr * r;
                }`;
    }

    get name(): string {
        return "disc";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Disc2Func extends VariationShaderFunc2D {
    PARAM_ROT = "rot"
    PARAM_TWIST = "twist"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ROT, type: VariationParamType.VP_NUMBER, initialValue: 2.0},
                { name: this.PARAM_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.50}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = float(${variation.amount});
          float rot = float(${variation.params.get(this.PARAM_ROT)});
          float twist = float(${variation.params.get(this.PARAM_TWIST)});
         
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
        return "disc2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EDiscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Edisc in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
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
        return "edisc";
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EllipticFunc extends VariationShaderFunc2D {
    //MODE_ORIGINAL = 0; // Original Apophysis plugin
    MODE_MIRRORY = 1; // Mirror y result; legacy JWildfire behavior
    MODE_PRECISION = 2; // Alternate calculation to avoid precision loss by Claude Heiland-Allen; see https://mathr.co.uk/blog/2017-11-01_a_more_accurate_elliptic_variation.html

    PARAM_MODE = "mode"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.MODE_MIRRORY }]
    }

    get funcDependencies(): string[] {
        return [FUNC_SQRT1PM1]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          int mode = int(${variation.params.get(this.PARAM_MODE)});
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
               sign = (rand2(tex) < 0.5) ? 1 : -1;
             }
             _vx += _v * atan2(a, b);
             _vy += float(sign) * _v * log(xmax + sqrt_safe(xmax - 1.0));
          }
        }`;
    }

    get name(): string {
        return "elliptic";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EpispiralFunc extends VariationShaderFunc2D {
    PARAM_N = "n"
    PARAM_THICKNESS = "thickness"
    PARAM_HOLES = "holes"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 6.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // epispiral by cyberxaos, http://cyberxaos.deviantart.com/journal/Epispiral-Plugin-240086108
        return `{
          float amount = float(${variation.amount});
          float n = float(${variation.params.get(this.PARAM_N)});
          float thickness = float(${variation.params.get(this.PARAM_THICKNESS)});
          float holes = float(${variation.params.get(this.PARAM_HOLES)});
          float theta = atan2(_ty, _tx);
          float t = -holes;
          if (thickness > EPSILON || thickness < -EPSILON) {
             float d = cos(n * theta);
             if (d != 0.0) {
               t += (rand2(tex) * thickness) * (1.0 / d);  
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
        return "epispiral";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EpispiralWFFunc extends VariationShaderFunc2D {
    PARAM_WAVES = "waves"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_WAVES, type: VariationParamType.VP_NUMBER, initialValue: 4.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float waves = float(${variation.params.get(this.PARAM_WAVES)});
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
        return "epispiral_wf";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EscherFunc extends VariationShaderFunc2D {
    PARAM_BETA = "beta"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_BETA, type: VariationParamType.VP_NUMBER, initialValue: 0.3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Escher in the Apophysis Plugin Pack */
        return `{
          float amount = float(${variation.amount});
          float beta = float(${variation.params.get(this.PARAM_BETA)});
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
        return "escher";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Ex extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = float(${variation.amount});
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
        return "ex";
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
            float amount = float(${variation.amount});
            float expe = exp(_tx);
            float expsin = sin(_ty);
            float expcos = cos(_ty);
            _vx += amount * expe * expcos;
            _vy += amount * expe * expsin;
        }`;
    }

    get name(): string {
        return "exp";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ExponentialFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = float(${variation.amount});
            float r = M_PI * _ty;
            float sinr = sin(r);
            float cosr = cos(r);
            float d = amount * exp(_tx - 1.0);
            _vx += cosr * d;
            _vy += sinr * d;
        }`;
    }

    get name(): string {
        return "exponential";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EyefishFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = float(${variation.amount});
            float r = 2.0 * amount / (sqrt(_tx * _tx + _ty * _ty) + 1.0);
            _vx += r * _tx;
            _vy += r * _ty;
        }`;
    }

    get name(): string {
        return "eyefish";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FanFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = float(${variation.amount});
            float dx = M_PI * float(${xform.c20}) * float(${xform.c20}) + EPSILON;
            float dx2 = dx / 2.0;
            float a;
            if ((_phi + float(${xform.c21}) - (floor((_phi + float(${xform.c21})) / dx)) * dx) > dx2)
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
        return "fan";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Fan2Func extends VariationShaderFunc2D {
    PARAM_X = "x"
    PARAM_Y = "y"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = float(${variation.amount});
            float x = float(${variation.params.get(this.PARAM_X)});
            float y = float(${variation.params.get(this.PARAM_Y)});
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
        return "fan2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FisheyeFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = float(${variation.amount});
            float r = sqrt(_tx * _tx + _ty * _ty);
            r = 2.0 * r / (r + 1.0);
            _vx += amount * r * _ty / _r;
            _vy += amount * r * _tx / _r;
        }`;
    }

    get name(): string {
        return "fisheye";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FlipCircleFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // flipcircle by MichaelFaber, http://michaelfaber.deviantart.com/art/Flip-216005432
        return `{
            float amount = float(${variation.amount});
            if (sqr(_tx) + sqr(_ty) > sqr(amount))
              _vy += amount * _ty;
            else
              _vy -= amount * _ty;
            _vx += amount * _tx;
        }`;
    }

    get name(): string {
        return "flipcircle";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FlowerFunc extends VariationShaderFunc2D {
    PARAM_HOLES = "holes"
    PARAM_PETALS = "petals"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
            { name: this.PARAM_PETALS, type: VariationParamType.VP_NUMBER, initialValue: 7.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cyberxaos, 4/2007 */
        return `{
            float amount = float(${variation.amount});
            float holes = float(${variation.params.get(this.PARAM_HOLES)});
            float petals = float(${variation.params.get(this.PARAM_PETALS)});
            float _theta = atan2(_ty, _tx);
            float theta = _theta;
            float d = _r;
            if (d != 0.0) {
              float r = amount * (rand2(tex) - holes) * cos(petals * theta) / d;
              _vx += r * _tx;
              _vy += r * _ty;
             }
        }`;
    }

    get name(): string {
        return "flower";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class FluxFunc extends VariationShaderFunc2D {
    PARAM_SPREAD = "spread"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPREAD, type: VariationParamType.VP_NUMBER, initialValue: 0.3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Flux, by meckie
        return `{
            float amount = float(${variation.amount});
            float spread = float(${variation.params.get(this.PARAM_SPREAD)});
         
            float xpw = _tx + amount;
            float xmw = _tx - amount;
            float avgr = amount * (2.0 + spread) * sqrt(sqrt(_ty * _ty + xpw * xpw) / sqrt(_ty * _ty + xmw * xmw));
            float avga = (atan2(_ty, xmw) - atan2(_ty, xpw)) * 0.5;
        
            _vx += avgr * cos(avga);
            _vy += avgr * sin(avga);
        }`;
    }

    get name(): string {
        return "flux";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FociFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Foci in the Apophysis Plugin Pack */
        return `{
            float amount = float(${variation.amount});
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
        return "foci";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class GlynniaFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // glynnia my Michael Faber, http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970
        return `{
            float amount = float(${variation.amount});
            float _vvar2 = amount * sqrt(2.0) / 2.0; 
            float r = sqrt(sqr(_tx) + sqr(_ty));
            float d;
            if (r >= 1.0) {
              if (rand2(tex) > 0.5) {
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
              if (rand2(tex) > 0.5) {
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
        return "glynnia";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HeartFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = float(${variation.amount});
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
        return "heart";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class GaussianBlurFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float r = rand2(tex) * 2.0 * M_PI;
          float sina = sin(r);
          float cosa = cos(r);
          r = amount * (rand3(tex) + rand4(tex) + rand5(tex) + rand6(tex) - 2.0);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return "gaussian_blur";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class HeartWFFunc extends VariationShaderFunc2D {
    PARAM_SCALE_X = "scale_x"
    PARAM_SCALE_T = "scale_t"
    PARAM_SHIFT_T = "shift_t"
    PARAM_SCALE_R_LEFT = "scale_r_left"
    PARAM_SCALE_R_RIGHT = "scale_r_right"

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
            float amount = float(${variation.amount});
            float scale_x = float(${variation.params.get(this.PARAM_SCALE_X)});
            float scale_t = float(${variation.params.get(this.PARAM_SCALE_T)});
            float shift_t = float(${variation.params.get(this.PARAM_SHIFT_T)});
            float scale_r_left = float(${variation.params.get(this.PARAM_SCALE_R_LEFT)});
            float scale_r_right = float(${variation.params.get(this.PARAM_SCALE_R_RIGHT)}); 
          
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
        return "heart_wf";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HorseshoeFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
           float sinA = _tx / _r;
           float cosA = _ty / _r;
           _vx += amount * (sinA * _tx - cosA * _ty);
           _vy += amount * (cosA * _tx + sinA * _ty);
        }`;
    }

    get name(): string {
        return "horseshoe";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class HyperbolicFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
           _vx += amount * _tx / _r2;
           _vy += amount * _ty;
        }`;
    }

    get name(): string {
        return "hyperbolic";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
           float a = atan2(_tx, _ty) * 0.5 + M_PI * floor(2.0 * rand2(tex)*rand3(tex));
           float sina = sin(a);
           float cosa = cos(a);
           float r = amount * sqrt(sqrt(_tx * _tx + _ty * _ty));
           _vx += r * cosa;
           _vy += r * sina;
        }`;
    }

    get name(): string {
        return "julia";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaCFunc extends VariationShaderFunc2D {
    PARAM_RE = "re"
    PARAM_IM = "im"
    PARAM_DIST = "dist"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RE, type: VariationParamType.VP_NUMBER, initialValue: 3.5 },
            { name: this.PARAM_IM, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // juliac by David Young, http://sc0t0ma.deviantart.com/
        return `{
          float amount = float(${variation.amount});
          float _re = float(${variation.params.get(this.PARAM_RE)});
          float _im = float(${variation.params.get(this.PARAM_IM)});
          float dist = float(${variation.params.get(this.PARAM_DIST)});
          float re = 1.0 / (_re + EPSILON);
          float im = _im / 100.0;
          float arg = atan2(_ty, _tx) + mod(rand2(tex)*32768.0, _re) * 2.0 * M_PI;
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
        return "juliac";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaNFunc extends VariationShaderFunc2D {
    PARAM_POWER = "power"
    PARAM_DIST = "dist"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          int power = int(${variation.params.get(this.PARAM_POWER)});
          float dist = float(${variation.params.get(this.PARAM_DIST)});
              
          int absPower = power > 0 ? power : -power;
          float cPower = dist / float(power) * 0.5; 

          float a = (atan2(_ty, _tx) + 2.0 * M_PI * floor(float(absPower) * rand2(tex))) / float(power);
          float sina = sin(a);
          float cosa = cos(a);
          float r = amount * pow(sqr(_tx) + sqr(_ty), cPower);
          _vx = _vx + r * cosa;
          _vy = _vy + r * sina;
        }`;
    }

    get name(): string {
        return "julian";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliaQFunc extends VariationShaderFunc2D {
    PARAM_POWER = "power"
    PARAM_DIVISOR = "divisor"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_DIVISOR, type: VariationParamType.VP_NUMBER, initialValue: 2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // juliaq by Zueuk, http://zueuk.deviantart.com/art/juliaq-Apophysis-plugins-340813357
        return `{
          float amount = float(${variation.amount});
          int power = int(${variation.params.get(this.PARAM_POWER)});
          int divisor = int(${variation.params.get(this.PARAM_DIVISOR)});
          float half_inv_power = 0.5 * float(divisor) / float(power);
          float inv_power = float(divisor) / float(power);
          float inv_power_2pi = (2.0*M_PI) / float(power);
          float a = atan2(_ty, _tx) * inv_power + rand2(tex)*32768.0 * inv_power_2pi;
          float sina = sin(a);
          float cosa = cos(a);
          float r = amount * pow(sqr(_tx) + sqr(_ty), half_inv_power);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return "juliaq";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class JuliascopeFunc extends VariationShaderFunc2D {
    PARAM_POWER = "power"
    PARAM_DIST = "dist"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          int power = int(${variation.params.get(this.PARAM_POWER)});
          float dist = float(${variation.params.get(this.PARAM_DIST)});
              
          int absPower = power > 0 ? power : -power;
          float cPower = dist / float(power) * 0.5; 

          int rnd = int(rand2(tex)*float(absPower));
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
        return "juliascope";
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class KaleidoscopeFunc extends VariationShaderFunc2D {
    PARAM_PULL = "pull"
    PARAM_ROTATE = "rotate"
    PARAM_LINE_UP = "line_up"
    PARAM_X = "x"
    PARAM_Y = "y"

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
        return "kaleidoscope";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LayeredSpiralFunc extends VariationShaderFunc2D {
    PARAM_RADIUS = "radius"


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
        return "layered_spiral";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LazySusanFunc extends VariationShaderFunc2D {
    PARAM_SPACE = "space"
    PARAM_TWIST = "twist"
    PARAM_SPIN = "spin"
    PARAM_X = "x"
    PARAM_Y = "y"

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
        return "lazysusan";
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
        return "linear";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class LinearTFunc extends VariationShaderFunc2D {
    PARAM_POW_X = "powX"
    PARAM_POW_Y= "powY"

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
        return "linearT";
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
        return "log";
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
        return "loonie";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}


class Loonie2Func extends VariationShaderFunc2D {
    PARAM_RE_A = "sides"
    PARAM_RE_B = "star"
    PARAM_RE_C = "circle"

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
        return "loonie2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class MobiusFunc extends VariationShaderFunc2D {
    PARAM_RE_A = "re_a"
    PARAM_RE_B = "re_b"
    PARAM_RE_C = "re_c"
    PARAM_RE_D = "re_d"
    PARAM_IM_A = "im_a"
    PARAM_IM_B = "im_b"
    PARAM_IM_C = "im_c"
    PARAM_IM_D = "im_d"
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
        return "mobius";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class NGonFunc extends VariationShaderFunc2D {
    PARAM_CIRCLE = "circle"
    PARAM_CORNERS = "corners"
    PARAM_POWER = "power"
    PARAM_SIDES = "sides"

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
        return "ngon";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class NoiseFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float r = rand2(tex) * 2.0 * M_PI;
          float sinr = sin(r);
          float cosr = cos(r);
          r = amount * rand3(tex);
          _vx += _tx * r * cosr;
          _vy += _ty * r * sinr;
        }`;
    }

    get name(): string {
        return "noise";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class NPolarFunc extends VariationShaderFunc2D {
    PARAM_PARITY = "parity"
    PARAM_N = "n"

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
          float angle = (atan2(y, x) + (2.0*M_PI) * float(modulo( int(rand3(tex)*32768.0), int(_absn)))) / float(_nnz);
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
        return "npolar";
    }


    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class OscilloscopeFunc extends VariationShaderFunc2D {
    PARAM_SEPARATION = "separation"
    PARAM_FREQUENCY = "frequency"
    PARAM_AMPLITUDE = "amplitude"
    PARAM_DAMPING = "damping"

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
        return "oscilloscope";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Oscilloscope2Func extends VariationShaderFunc2D {
    PARAM_SEPARATION = "separation"
    PARAM_FREQUENCYX = "frequencyx"
    PARAM_FREQUENCYY = "frequencyy"
    PARAM_AMPLITUDE = "amplitude"
    PARAM_PERTUBATION = "perturbation"
    PARAM_DAMPING = "damping"

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
        return "oscilloscope2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ParabolaFunc extends VariationShaderFunc2D {
    PARAM_WIDTH = "width"
    PARAM_HEIGHT = "height"

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
          _vx += height * amount * sr * sr * rand2(tex);
          _vy += width * amount * cr * rand2(tex);
        }`;
    }

    get name(): string {
        return "parabola";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PDJFunc extends VariationShaderFunc2D {
    PARAM_A = "a"
    PARAM_B = "b"
    PARAM_C = "c"
    PARAM_D = "d"

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
        return "pdj";
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
        return "petal";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PieFunc extends VariationShaderFunc2D {
    PARAM_SLICES = "slices"
    PARAM_ROTATION = "rotation"
    PARAM_THICKNESS = "thickness"

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
          int sl = int(rand2(tex) * slices + 0.5);
          float a = rotation + 2.0 * M_PI * (float(sl) + rand3(tex) * thickness) / slices;
          float r = amount * rand4(tex);
          float sina = sin(a);
          float cosa = cos(a);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return "pie";
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
        return "polar";
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
        return "polar2";
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
        return "popcorn";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Popcorn2Func extends VariationShaderFunc2D {
    PARAM_X = "x"
    PARAM_Y = "y"
    PARAM_C = "c"

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
        return "popcorn2";
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
        return "power";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PreBlurFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float r = rand3(tex) * 2.0 * M_PI;
          float sina = sin(r);
          float cosa = cos(r);
          r =  amount * (rand2(tex) + rand3(tex) + rand4(tex) + rand5(tex) + rand6(tex) + rand7(tex) - 3.0);
          _tx += r * cosa;
          _ty += r * sina;
        }`;
    }

    get name(): string {
        return "pre_blur"
    }


    get priority(): number {
        return -1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR, VariationTypes.VARTYPE_PRE];
    }
}

class RadialBlurFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = "angle"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});    
          float rndG = rand5(tex)+rand2(tex)+rand3(tex)+rand4(tex)-2.0;
          float angle = float(${variation.params.get(this.PARAM_ANGLE)});
          float a = angle * M_PI * 0.5;
          float sina = sin(a);
          float cosa = cos(a);
          float spin = amount * sina;
          float zoom = amount * cosa;
          float  alpha = atan2(_ty, _tx) + spin * rndG;
          sina = sin(alpha);
          cosa = cos(alpha);
          float rz = zoom * rndG - 1.0;
          _vx += _r * cosa + rz * _tx;
          _vy += _r * sina + rz * _ty;
        }`;
    }

    get name(): string {
        return "radial_blur";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class RaysFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = float(${variation.amount});
          float ang = amount * rand2(tex) * M_PI;
          float r = amount / (_r2 + EPSILON);
          float tanr = amount * tan(ang) * r;
          _vx += tanr * cos(_tx);
          _vy += tanr * sin(_ty);
        }`;
    }

    get name(): string {
        return "rays";
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
        return "rays1";
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
        return "rays2";
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
        return "rays3";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RectanglesFunc extends VariationShaderFunc2D {
    PARAM_X = "x"
    PARAM_Y = "y"

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
        return "rectangles";
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
        return "rings";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rings2Func extends VariationShaderFunc2D {
    PARAM_VAL = "val"

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
        return "rings2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RoseWFFunc extends VariationShaderFunc2D {
    PARAM_AMP = "amp"
    PARAM_WAVES = "waves"
    PARAM_FILLED = "filled"

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
        
          if (filled > 0.0 && filled > rand2(tex)) {
             r *= rand3(tex);
          }
        
          float nx = sin(a) * r;
          float ny = cos(a) * r;
        
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return "rose_wf";
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
        return "scry";
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
        return "sec";
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
        return "secant2";
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
        return "sech";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class SeparationFunc extends VariationShaderFunc2D {
    PARAM_X = "x"
    PARAM_XINSIDE = "xinside"
    PARAM_Y = "y"
    PARAM_YINSIDE = "yinside"

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
        return "separation";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
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
        return "sin";
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
        return "sinh";
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
        return "sinq";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
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
        return "sinhq";
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
        return "sinusoidal";
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
        return "spherical";
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
        return "spiral";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SpirographFunc extends VariationShaderFunc2D {
    PARAM_A = "a"
    PARAM_B = "b"
    PARAM_D = "d"
    PARAM_C1 = "c1"
    PARAM_C2 = "c2"
    PARAM_TMIN = "tmin"
    PARAM_TMAX = "tmax"
    PARAM_YMIN = "ymin"
    PARAM_YMAX = "ymax"

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
          float t = (tmax - tmin) * rand2(tex) + tmin;
          float y = (ymax - ymin) * rand3(tex) + ymin;
          float x1 = (a + b) * cos(t) - c1 * cos((a + b) / b * t);
          float y1 = (a + b) * sin(t) - c2 * sin((a + b) / b * t);
          _vx += amount * (x1 + d * cos(t) + y);
          _vy += amount * (y1 + d * sin(t) + y);
        }`;
    }

    get name(): string {
        return "spirograph";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SplitFunc extends VariationShaderFunc2D {
    PARAM_XSIZE = "xsize"
    PARAM_YSIZE = "ysize"

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
        return "split";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SplitsFunc extends VariationShaderFunc2D {
    PARAM_X = "x"
    PARAM_Y = "y"
    PARAM_LSHEAR = "lshear"
    PARAM_RSHEAR = "rshear"
    PARAM_USHEAR = "ushear"
    PARAM_DSHEAR = "dshear"

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
        return "splits";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SquareFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          _vx += amount * (rand2(tex) - 0.5);
          _vy += amount * (rand3(tex) - 0.5);    
        }`;
    }

    get name(): string {
        return "square";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
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
        return "swirl";
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
        return "tan";
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
        return "tanh";
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
        return "tanhq";
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
        return "tancos";
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
        return "tangent";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TargetFunc extends VariationShaderFunc2D {
    PARAM_EVEN = "even"
    PARAM_ODD = "odd"
    PARAM_SIZE = "size"

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
        return "target";
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
          float r = rand2(tex) * amount * _r;
        
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
        return "twintrian";
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
        return "twoface";
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
        return "unpolar";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WavesFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          _vx += amount * (_tx + float(${xform.c10}) * sin(_ty / (float(${xform.c20}) * float(${xform.c20}) + EPSILON)));
          _vy += amount * (_ty + float(${xform.c11}) * sin(_tx / (float(${xform.c21}) * float(${xform.c21}) + EPSILON)));
        }`;
    }

    get name(): string {
        return "waves";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves2Func extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 4 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves2 from Joel F */
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          _vx += amount * (_tx + scalex * sin(_ty * freqx));
          _vy += amount * (_ty + scaley * sin(_tx * freqy));
        }`;
    }

    get name(): string {
        return "waves2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves22Func extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"
    PARAM_MODEX = "modex"
    PARAM_MODEY = "modey"
    PARAM_POWERX = "powerx"
    PARAM_POWERY = "powery"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_MODEX, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_MODEY, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_POWERX, type: VariationParamType.VP_NUMBER, initialValue:  2.00 },
            { name: this.PARAM_POWERY, type: VariationParamType.VP_NUMBER, initialValue:  2.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* weird waves22 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int modex = int(${variation.params.get(this.PARAM_MODEX)});
          int modey = int(${variation.params.get(this.PARAM_MODEY)});
          float powerx = float(${variation.params.get(this.PARAM_POWERX)});
          float powery = float(${variation.params.get(this.PARAM_POWERY)});
          float x0 = _tx;
          float y0 = _ty;
          float sinx;
          float siny;
          int px =  int(powerx);
          int py =  int(powery);  
          if (modex < 1) {
            sinx = sin(y0 * freqx);
          } else {
            sinx = 0.5 * (1.0 + sin(y0 * freqx));
          }
          float offsetx = pow(sinx, float(px)) * scalex;
          if (modey < 1) {
            siny = sin(x0 * freqy);
          } else {
            siny = 0.5 * (1.0 + sin(x0 * freqy));
          }
          float offsety = pow(siny, float(py)) * scaley; 
          _vx += amount * (x0 + offsetx);
          _vy += amount * (y0 + offsety);
        }`;
    }

    get name(): string {
        return "waves22";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves23Func extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves23 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          float x0 = _tx;
          float y0 = _ty;
          float mx = y0 * freqx * (1.0 / (M_PI + M_PI));
          float fx = mx - floor(mx);
          if (fx > 0.5) fx = 0.5 - fx;
          float my = x0 * freqy * (1.0 / (M_PI + M_PI));
          float fy = my - floor(my);
          if (fy > 0.5) fy = 0.5 - fy;
          _vx += amount * (x0 + fx * scalex);
          _vy += amount * (y0 + fy * scaley);
        }`;
    }

    get name(): string {
        return "waves23";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves2WFFunc extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"
    PARAM_USE_COS_X = "use_cos_x"
    PARAM_USE_COS_Y = "use_cos_y"
    PARAM_DAMPX = "dampx"
    PARAM_DAMPY = "dampy"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.25 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.50 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2.0 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 4.0 },
            { name: this.PARAM_USE_COS_X, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_USE_COS_Y, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_DAMPX, type: VariationParamType.VP_NUMBER, initialValue:  0.00 },
            { name: this.PARAM_DAMPY, type: VariationParamType.VP_NUMBER, initialValue:  0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Modified version of waves2 from Joel F */
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int use_cos_x = int(${variation.params.get(this.PARAM_USE_COS_X)});
          int use_cos_y = int(${variation.params.get(this.PARAM_USE_COS_Y)});
          float dampx = float(${variation.params.get(this.PARAM_DAMPX)});
          float dampy = float(${variation.params.get(this.PARAM_DAMPY)});
          float _dampingX = abs(dampx) < EPSILON ? 1.0 : exp(dampx);
          float _dampingY = abs(dampy) < EPSILON ? 1.0 : exp(dampy);
          if (use_cos_x == 1) {
            _vx += amount * (_tx + _dampingX * scalex * cos(_ty * freqx)) * _dampingX;
          } else {
            _vx += amount * (_tx + _dampingX * scalex * sin(_ty * freqx)) * _dampingX;
          }
          if (use_cos_y == 1) {
            _vy += amount * (_ty + _dampingY * scaley * cos(_tx * freqy)) * _dampingY;
          } else {
            _vy += amount * (_ty + _dampingY * scaley * sin(_tx * freqy)) * _dampingY;
          }
        }`;
    }

    get name(): string {
        return "waves2_wf";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves3Func extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"
    PARAM_SX_FREQ = "sx_freq"
    PARAM_SY_FREQ = "sy_freq"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_SX_FREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SY_FREQ, type: VariationParamType.VP_NUMBER, initialValue: 2.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves3 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          float sx_freq = float(${variation.params.get(this.PARAM_SX_FREQ)});
          float sy_freq = float(${variation.params.get(this.PARAM_SY_FREQ)});
          float x0 = _tx;
          float y0 = _ty;
          float scalexx = 0.5 * scalex * (1.0 + sin(y0 * sx_freq));
          float scaleyy = 0.5 * scaley * (1.0 + sin(x0 * sy_freq));
          _vx += amount * (x0 + sin(y0 * freqx) * scalexx);
          _vy += amount * (y0 + sin(x0 * freqy) * scaleyy);
        }`;
    }

    get name(): string {
        return "waves3";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves3WFFunc extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"
    PARAM_USE_COS_X = "use_cos_x"
    PARAM_USE_COS_Y = "use_cos_y"
    PARAM_DAMPX = "dampx"
    PARAM_DAMPY = "dampy"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.25 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.50 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2.0 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 4.0 },
            { name: this.PARAM_USE_COS_X, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_USE_COS_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_DAMPX, type: VariationParamType.VP_NUMBER, initialValue:  0.00 },
            { name: this.PARAM_DAMPY, type: VariationParamType.VP_NUMBER, initialValue:  0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Modified version of waves2 from Joel F */
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int use_cos_x = int(${variation.params.get(this.PARAM_USE_COS_X)});
          int use_cos_y = int(${variation.params.get(this.PARAM_USE_COS_Y)});
          float dampx = float(${variation.params.get(this.PARAM_DAMPX)});
          float dampy = float(${variation.params.get(this.PARAM_DAMPY)});
          float _dampingX = abs(dampx) < EPSILON ? 1.0 : exp(dampx);
          float _dampingY = abs(dampy) < EPSILON ? 1.0 : exp(dampy);
          if (use_cos_x == 1) {
            _vx += amount * (_tx + _dampingX * scalex * cos(_ty * freqx) * cos(_ty * freqx)) * _dampingX;
          } else {
            _vx += amount * (_tx + _dampingX * scalex * sin(_ty * freqx) * sin(_ty * freqx)) * _dampingX;
          }
          if (use_cos_y == 1) {
            _vy += amount * (_ty + _dampingY * scaley * cos(_tx * freqy) * cos(_tx * freqy)) * _dampingY;
          } else {
            _vy += amount * (_ty + _dampingY * scaley * sin(_tx * freqy) * sin(_tx * freqy)) * _dampingY;
          }
        }`;
    }

    get name(): string {
        return "waves3_wf";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves4Func extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"
    PARAM_CONT = "cont"
    PARAM_YFACT = "yfact"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_CONT, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_YFACT, type: VariationParamType.VP_NUMBER, initialValue: 0.10 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves4 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int cont = int(${variation.params.get(this.PARAM_CONT)});
          float yfact = float(${variation.params.get(this.PARAM_YFACT)});
          float x0 = _tx;
          float y0 = _ty;
          float ax = floor(y0 * freqx / (2.0*M_PI));

          ax = sin(ax * 12.9898 + ax * 78.233 + 1.0 + y0 * 0.001 * yfact) * 43758.5453;
          ax = ax - float(int(ax));
          if (cont == 1) ax = (ax > 0.5) ? 1.0 : 0.0;
          
          _vx += amount * (x0 + sin(y0 * freqx) * ax * ax * scalex);
          _vy += amount * (y0 + sin(x0 * freqy) * scaley);
        }`;
    }

    get name(): string {
        return "waves4";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves42Func extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"
    PARAM_CONT = "cont"
    PARAM_YFACT = "yfact"
    PARAM_FREQX2 = "freqx2"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_CONT, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_YFACT, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_FREQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves42 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int cont = int(${variation.params.get(this.PARAM_CONT)});
          float yfact = float(${variation.params.get(this.PARAM_YFACT)});
          float freqx2 = float(${variation.params.get(this.PARAM_FREQX2)});
          float x0 = _tx;
          float y0 = _ty;
          float ax = floor(y0 * freqx2);   
          ax = sin(ax * 12.9898 + ax * 78.233 + 1.0 + y0 * 0.001 * yfact) * 43758.5453;
          ax = ax - float(int(ax));
          if (cont == 1) {
            ax = (ax > 0.5) ? 1.0 : 0.0;
          }
          _vx += amount * (x0 + sin(y0 * freqx) * ax * ax * scalex);
          _vy += amount * (y0 + sin(x0 * freqy) * scaley);
        }`;
    }

    get name(): string {
        return "waves42";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves4WFFunc extends VariationShaderFunc2D {
    PARAM_SCALEX = "scalex"
    PARAM_SCALEY = "scaley"
    PARAM_FREQX = "freqx"
    PARAM_FREQY = "freqy"
    PARAM_USE_COS_X = "use_cos_x"
    PARAM_USE_COS_Y = "use_cos_y"
    PARAM_DAMPX = "dampx"
    PARAM_DAMPY = "dampy"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.25 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.50 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2.0 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 4.0 },
            { name: this.PARAM_USE_COS_X, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_USE_COS_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_DAMPX, type: VariationParamType.VP_NUMBER, initialValue:  0.00 },
            { name: this.PARAM_DAMPY, type: VariationParamType.VP_NUMBER, initialValue:  0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Modified version of waves2 from Joel F */
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int use_cos_x = int(${variation.params.get(this.PARAM_USE_COS_X)});
          int use_cos_y = int(${variation.params.get(this.PARAM_USE_COS_Y)});
          float dampx = float(${variation.params.get(this.PARAM_DAMPX)});
          float dampy = float(${variation.params.get(this.PARAM_DAMPY)});
          float _dampingX = abs(dampx) < EPSILON ? 1.0 : exp(dampx);
          float _dampingY = abs(dampy) < EPSILON ? 1.0 : exp(dampy);
          if (use_cos_x == 1) {
            _vx += amount * (_tx + _dampingX * scalex * cos(_ty * freqx) * sin(_ty * freqx) * cos(_ty * freqx)) * _dampingX;
          } else {
            _vx += amount * (_tx + _dampingX * scalex * sin(_ty * freqx) * cos(_ty * freqx) * sin(_ty * freqx)) * _dampingX;
          }
          if (use_cos_y == 1) {
            _vy += amount * (_ty + _dampingY * scaley * cos(_tx * freqy) * sin(_tx * freqy) * cos(_tx * freqy)) * _dampingY;
          } else {
            _vy += amount * (_ty + _dampingY * scaley * sin(_tx * freqy) * cos(_tx * freqy) * sin(_tx * freqy)) * _dampingY;
          }
        }`;
    }

    get name(): string {
        return "waves4_wf";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WedgeFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = "angle"
    PARAM_HOLE = "hole"
    PARAM_COUNT= "count"
    PARAM_SWIRL = "swirl"

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
        return "wedge";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WhorlFunc extends VariationShaderFunc2D {
    PARAM_INSIDE = "inside"
    PARAM_OUTSIDE = "outside"

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
        return "whorl";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class YinYangFunc extends VariationShaderFunc2D {
    PARAM_RADIUS = "radius"
    PARAM_ANG1 = "ang1"
    PARAM_ANG2 = "ang2"
    PARAM_DUAL_T = "dual_t"
    PARAM_OUTSIDE = "outside"

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
            if (dual_t == 1 && rand2(tex) > 0.5) {
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
        return "yin_yang";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function register2DVars() {
    VariationShaders.registerVar(new AcoshFunc())
    VariationShaders.registerVar(new ArchFunc())
    VariationShaders.registerVar(new AugerFunc())
    VariationShaders.registerVar(new BentFunc())
    VariationShaders.registerVar(new Bent2Func())
    VariationShaders.registerVar(new BiLinearFunc())
    VariationShaders.registerVar(new BipolarFunc())
    VariationShaders.registerVar(new BladeFunc())
    VariationShaders.registerVar(new BlobFunc())
    VariationShaders.registerVar(new BlurFunc())
    VariationShaders.registerVar(new BoardersFunc())
    VariationShaders.registerVar(new Boarders2Func())
    VariationShaders.registerVar(new ButterflyFunc())
    VariationShaders.registerVar(new BWraps7Func())
    VariationShaders.registerVar(new CannabisCurveWFFunc())
    VariationShaders.registerVar(new CellFunc())
    VariationShaders.registerVar(new CirclizeFunc())
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
    VariationShaders.registerVar(new DiamondFunc())
    VariationShaders.registerVar(new DiscFunc())
    VariationShaders.registerVar(new Disc2Func())
    VariationShaders.registerVar(new EDiscFunc())
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
    VariationShaders.registerVar(new FisheyeFunc())
    VariationShaders.registerVar(new FlipCircleFunc())
    VariationShaders.registerVar(new FlowerFunc())
    VariationShaders.registerVar(new FluxFunc())
    VariationShaders.registerVar(new FociFunc())
    VariationShaders.registerVar(new GaussianBlurFunc())
    VariationShaders.registerVar(new GlynniaFunc())
    VariationShaders.registerVar(new HeartFunc())
    VariationShaders.registerVar(new HeartWFFunc())
    VariationShaders.registerVar(new HorseshoeFunc())
    VariationShaders.registerVar(new HyperbolicFunc())
    VariationShaders.registerVar(new JuliaFunc())
    VariationShaders.registerVar(new JuliaCFunc())
    VariationShaders.registerVar(new JuliaNFunc())
    VariationShaders.registerVar(new JuliaQFunc())
    VariationShaders.registerVar(new JuliascopeFunc())
    VariationShaders.registerVar(new KaleidoscopeFunc())
    VariationShaders.registerVar(new LayeredSpiralFunc())
    VariationShaders.registerVar(new LazySusanFunc())
    VariationShaders.registerVar(new LinearFunc())
    VariationShaders.registerVar(new LinearTFunc())
    VariationShaders.registerVar(new LogFunc())
    VariationShaders.registerVar(new LoonieFunc())
    VariationShaders.registerVar(new Loonie2Func())
    VariationShaders.registerVar(new MobiusFunc())
    VariationShaders.registerVar(new NGonFunc())
    VariationShaders.registerVar(new NoiseFunc())
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
    VariationShaders.registerVar(new PreBlurFunc())
    VariationShaders.registerVar(new RadialBlurFunc())
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
    VariationShaders.registerVar(new SinFunc())
    VariationShaders.registerVar(new SinhFunc())
    VariationShaders.registerVar(new SinhqFunc())
    VariationShaders.registerVar(new SinqFunc())
    VariationShaders.registerVar(new SinusoidalFunc())
    VariationShaders.registerVar(new SphericalFunc())
    VariationShaders.registerVar(new SpiralFunc())
    VariationShaders.registerVar(new SpirographFunc())
    VariationShaders.registerVar(new SplitFunc())
    VariationShaders.registerVar(new SplitsFunc())
    VariationShaders.registerVar(new SquareFunc())
    VariationShaders.registerVar(new SwirlFunc())
    VariationShaders.registerVar(new TanFunc())
    VariationShaders.registerVar(new TanhFunc())
    VariationShaders.registerVar(new TanhqFunc())
    VariationShaders.registerVar(new TanCosFunc())
    VariationShaders.registerVar(new TangentFunc())
    VariationShaders.registerVar(new TargetFunc())
    VariationShaders.registerVar(new TwintrianFunc())
    VariationShaders.registerVar(new TwoFaceFunc())
    VariationShaders.registerVar(new UnpolarFunc())
    VariationShaders.registerVar(new WavesFunc())
    VariationShaders.registerVar(new Waves2Func())
    VariationShaders.registerVar(new Waves22Func())
    VariationShaders.registerVar(new Waves23Func())
    VariationShaders.registerVar(new Waves2WFFunc())
    VariationShaders.registerVar(new Waves3Func())
    VariationShaders.registerVar(new Waves3WFFunc())
    VariationShaders.registerVar(new Waves4Func())
    VariationShaders.registerVar(new Waves42Func())
    VariationShaders.registerVar(new Waves4WFFunc())
    VariationShaders.registerVar(new WedgeFunc())
    VariationShaders.registerVar(new WhorlFunc())
    VariationShaders.registerVar(new YinYangFunc())
}
