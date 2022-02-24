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
    FUNC_MODULO,
    FUNC_SINH,
    FUNC_SQRT1PM1
} from "Frontend/flames/renderer/variations/variation-math-functions";
import {M_PI} from "Frontend/flames/renderer/mathlib";

/*
  be sure to import this class somewhere and call register2DPartAVars()
 */
class ArchFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = float(${variation.amount});
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
        return "arch";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AsteriaFunc extends VariationShaderFunc2D {
    PARAM_ALPHA = "alpha"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ALPHA, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // asteria by dark-beam, http://jwildfire.org/forum/viewtopic.php?f=23&t=1464
        return `{
          float amount = float(${variation.amount});
          float alpha = float(${variation.params.get(this.PARAM_ALPHA)});
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
        return "asteria";
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
          float r = rand8(tex, rngState) * amount * sqrt(_tx * _tx + _ty * _ty);
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
          float r = rand8(tex, rngState) * (M_PI + M_PI);
          float sina = sin(r);
          float cosa = cos(r);
          float r2 = amount * rand8(tex, rngState);
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
          float r = amount * (rand8(tex, rngState) - holes) * eccentricity / (1.0 + eccentricity * ct) / _r;
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
                  float ang = vc * a + vd * lnr + va * floor(power * rand8(tex, rngState));
                
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
               sign = (rand8(tex, rngState) < 0.5) ? 1 : -1;
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
              float r = amount * (rand8(tex, rngState) - holes) * cos(petals * theta) / d;
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
          float r = rand8(tex, rngState) * 2.0 * M_PI;
          float sina = sin(r);
          float cosa = cos(r);
          r = amount * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0);
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
           float a = atan2(_tx, _ty) * 0.5 + M_PI * floor(2.0 * rand8(tex, rngState)*rand8(tex, rngState));
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

          float a = (atan2(_ty, _tx) + 2.0 * M_PI * floor(float(absPower) * rand8(tex, rngState))) / float(power);
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
          float a = atan2(_ty, _tx) * inv_power + rand8(tex, rngState)*32768.0 * inv_power_2pi;
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
        return "juliascope";
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function register2DPartAVars() {
    VariationShaders.registerVar(new ArchFunc())
    VariationShaders.registerVar(new AsteriaFunc())
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
}