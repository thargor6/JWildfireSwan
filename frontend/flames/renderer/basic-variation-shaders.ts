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

import {
    VariationParam,
    VariationParamType,
    VariationShaderFunc2D,
    VariationShaderFunc3D,
    VariationTypes
} from "./variation-shader-func";
import {VariationShaders} from "Frontend/flames/renderer/variation-shaders";
import {RenderVariation} from "Frontend/flames/model/render-flame";
import {FUNC_COSH, FUNC_SINH, FUNC_SQRT1PM1, FUNC_TANH} from "Frontend/flames/renderer/variation-math-functions";

// https://www.shaderific.com/glsl-functions

// 2D
class ArchFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
              float amount = ${variation.amount};
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

    get dependencies(): string[] {
        return ['rand2'];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BentFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
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

    getCode(variation: RenderVariation): string {
        /* Bent2 in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount};
          float x = ${variation.params.get(this.PARAM_X)};
          float y = ${variation.params.get(this.PARAM_Y)};
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
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
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

    getCode(variation: RenderVariation): string {
        /* Bipolar in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount};
          float x2y2 = (_tx * _tx + _ty * _ty);
          float t = x2y2 + 1.0;
          float x2 = 2.0 * _tx;
          float shift = ${variation.params.get(this.PARAM_SHIFT)};
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
    getCode(variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount};
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

    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float low = ${variation.params.get(this.PARAM_LOW)};
          float high = ${variation.params.get(this.PARAM_HIGH)};
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
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
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

class CellFunc extends VariationShaderFunc2D {
    PARAM_SIZE = "size"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.6 }]
    }

    getCode(variation: RenderVariation): string {
        /* Cell in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount};
          float size = ${variation.params.get(this.PARAM_SIZE)};
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

class CloverLeafWFFunc extends VariationShaderFunc2D {
    PARAM_FILLED = "filled"

    get params(): VariationParam[] {
      return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float a = _phi;

          float r = (sin(2.0 * a) + 0.25 * sin(6.0 * a));

          float filled = ${variation.params.get(this.PARAM_FILLED)};

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

class CrossFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount};
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

class CosFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Cosine COS
        return `{
                  float amount = ${variation.amount};
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

class CotFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Cotangent COT
        return `{
                  float amount = ${variation.amount};
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
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Cotangent COTH
        return `{
                  float amount = ${variation.amount};
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

    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float c1 = ${variation.params.get(this.PARAM_C1)};
          float c2 = ${variation.params.get(this.PARAM_C2)};
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

class CylinderFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount};
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

class DiscFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount};
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

    getCode(variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount};
          float rot = ${variation.params.get(this.PARAM_ROT)};
          float twist = ${variation.params.get(this.PARAM_TWIST)};
         
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

class EllipticFunc extends VariationShaderFunc2D {
    MODE_ORIGINAL = 0; // Original Apophysis plugin
    MODE_MIRRORY = 1; // Mirror y result; legacy JWildfire behavior
    MODE_PRECISION = 2; // Alternate calculation to avoid precision loss by Claude Heiland-Allen; see https://mathr.co.uk/blog/2017-11-01_a_more_accurate_elliptic_variation.html

    PARAM_MODE = "mode"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.MODE_MIRRORY }]
    }

    get funcDependencies(): string[] {
        return [FUNC_SQRT1PM1]
    }

    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
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

class ExpFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Exponential EXP
        return `{
            float amount = ${variation.amount};
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

class EyefishFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount};
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

class FisheyeFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount};
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

class JuliaFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
           float amount = ${variation.amount};
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

class JuliaNFunc extends VariationShaderFunc2D {
    PARAM_POWER = "power"
    PARAM_DIST = "dist"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0}]
    }

    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          int power = int(${variation.params.get(this.PARAM_POWER)});
          float dist = ${variation.params.get(this.PARAM_DIST)};
              
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

class LinearFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
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

class LogFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Natural Logarithm LOG
        // needs precalc_atanyx and precalc_sumsq
        return `{
          float amount = ${variation.amount};
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

class PetalFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        // petal by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount};
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

class PolarFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount =${variation.amount};
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
    getCode(variation: RenderVariation): string {
        /* polar2 from the apophysis plugin pack */
        return `{
          float amount = ${variation.amount};
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

class PowerFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount =${variation.amount};
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

class RadialBlurFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = "angle"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.5 }]
    }

    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};    
          float rndG = rand(tex)+rand2(tex)+rand3(tex)+rand4(tex)-2.0;
          float angle = ${variation.params.get(this.PARAM_ANGLE)};
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
    getCode(variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount};
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
    getCode(variation: RenderVariation): string {
        // rays by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount};
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

class RoseWFFunc extends VariationShaderFunc2D {
    PARAM_AMP = "amp"
    PARAM_WAVES = "waves"
    PARAM_FILLED = "filled"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_AMP, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_WAVES, type: VariationParamType.VP_NUMBER, initialValue: 4 },
            { name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(variation: RenderVariation): string {
         return `{
          float amount = ${variation.amount};
          float a = _phi;
          int waves = int(${variation.params.get(this.PARAM_WAVES)});
          float filled = ${variation.params.get(this.PARAM_FILLED)};
          float amp = ${variation.params.get(this.PARAM_AMP)};
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


class SecFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Secant SEC
        return `{
          float amount = ${variation.amount};
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

class SinFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Sine SIN
        return `{
          float amount = ${variation.amount};
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


class SphericalFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
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
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
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

class SplitFunc extends VariationShaderFunc2D {
    PARAM_XSIZE = "xsize"
    PARAM_YSIZE = "ysize"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XSIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
                { name: this.PARAM_YSIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.6 }]
    }

    getCode(variation: RenderVariation): string {
        /* Split from apo plugins pack */
        return `{
          float amount = ${variation.amount};
         
          float xSize = ${variation.params.get(this.PARAM_XSIZE)};
          if (cos(_tx * xSize * M_PI) >= 0.0) {
            _vy += amount * _ty;
          } else {
            _vy -= amount * _ty;
          }
          float ySize = ${variation.params.get(this.PARAM_YSIZE)};
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

    getCode(variation: RenderVariation): string {
        /* Splits from apo plugins pack; shears added by DarkBeam 2018 to emulate splits.dll */
        return `{
          float amount = ${variation.amount};
          float x = ${variation.params.get(this.PARAM_X)};
          float y = ${variation.params.get(this.PARAM_Y)};
          
          if (_tx >= 0.0) {
            _vx += amount * (_tx + x);
            float rshear = ${variation.params.get(this.PARAM_RSHEAR)};
            _vy += amount * (rshear);
          } else {
            _vx += amount * (_tx - x);
            float lshear = ${variation.params.get(this.PARAM_LSHEAR)};
            _vy -= amount * (lshear);
          }
    
          if (_ty >= 0.0) {
             _vy += amount * (_ty + y);
             float ushear = ${variation.params.get(this.PARAM_USHEAR)};
             _vx += amount * (ushear);
           } else {
             _vy += amount * (_ty - y);
             float dshear = ${variation.params.get(this.PARAM_DSHEAR)};
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

class SwirlFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
         return `{
          float amount = ${variation.amount};
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

class TangentFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
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

class TanFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Tangent TAN
        return `{
          float amount = ${variation.amount};
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
    getCode(variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Tangent TANH
        return `{
          float amount = ${variation.amount};
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

class TanCosFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        // tancos by Raykoid666, http://raykoid666.deviantart.com/art/plugin-pack-3-100510461?q=gallery%3ARaykoid666%2F11060240&qo=16
        return `{
          float amount = ${variation.amount};
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
// 3D
class Blade3DFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount};
          float r = rand2(tex) * amount * sqrt(_tx * _tx + _ty * _ty);
          float sinr = sin(r);
          float cosr = cos(r);
          _vx += amount * _tx * (cosr + sinr);
          _vy += amount * _tx * (cosr - sinr);
          _vz += amount * _ty * (sinr - cosr);
        }`;
    }

    get name(): string {
        return "blade3D";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Blob3DFunc extends VariationShaderFunc2D {
    PARAM_LOW = "low"
    PARAM_HIGH = "high"
    PARAM_WAVES = "waves"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LOW, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_HIGH, type: VariationParamType.VP_NUMBER, initialValue: 1.2 },
            { name: this.PARAM_WAVES, type: VariationParamType.VP_NUMBER, initialValue: 6 }]
    }

    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float low = ${variation.params.get(this.PARAM_LOW)};
          float high = ${variation.params.get(this.PARAM_HIGH)};
          int waves = int(${variation.params.get(this.PARAM_WAVES)});
          float a = atan2(_tx, _ty);
          float r = sqrt(_tx * _tx + _ty * _ty);
          r = r * (low + (high - low) * (0.5 + 0.5 * sin(float(waves) * a)));
          float nx = sin(a) * r;
          float ny = cos(a) * r;
          float nz = sin(float(waves) * a) * r;
          _vx += amount * nx;
          _vy += amount * ny;
          _vz += amount * nz;
        }`;
    }

    get name(): string {
        return "blob3D";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class BubbleFunc extends VariationShaderFunc3D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float r = ((_tx * _tx + _ty * _ty) / 4.0 + 1.0);
          float t = amount / r;
          _vx += t * _tx;
          _vy += t * _ty;
          _vz += amount * (2.0 / r - 1.0);
        }`;
    }

    get name(): string {
        return "bubble";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Bubble2Func extends VariationShaderFunc3D {
    PARAM_X = "x"
    PARAM_Y = "y"
    PARAM_Z = "z"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Z, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(variation: RenderVariation): string {
        /* bubble2 from FracFx, http://fracfx.deviantart.com/art/FracFx-Plugin-Pack-171806681 */
        return `{
          float amount = ${variation.amount};
          float x = ${variation.params.get(this.PARAM_X)};
          float y = ${variation.params.get(this.PARAM_Y)};
          float z = ${variation.params.get(this.PARAM_Z)};
          float T = ((sqr(_tx) + sqr(_ty) + sqr(_tz)) / 4.0 + 1.0);
          float r = amount / T;
          _vx += _tx * r * x;
          _vy += _ty * r * y;
          if (_tz >= 0.0)
            _vz += amount * (_tz + z);
          else
            _vz += amount * (_tz - z);
          _vz += _tz * r * z;    
        }`;
    }

    get name(): string {
        return "bubble2";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class BubbleWFFunc extends VariationShaderFunc3D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float r = ((_tx * _tx + _ty * _ty) / 4.0 + 1.0);
          float t = amount / r;
          _vx += t * _tx;
          _vy += t * _ty;
          if (rand2(tex) < 0.5) {
           _vz -= amount * (2.0 / r - 1.0);
          } else {
           _vz += amount * (2.0 / r - 1.0);
          }
        }`;
    }

    get name(): string {
        return "bubble_wf";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Curl3DFunc extends VariationShaderFunc2D {
    PARAM_CX = "cx"
    PARAM_CY = "cy"
    PARAM_CZ = "cz"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CX, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CY, type: VariationParamType.VP_NUMBER, initialValue: 0.05 },
            { name: this.PARAM_CZ, type: VariationParamType.VP_NUMBER, initialValue: 0.05 }]
    }

    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float cx = ${variation.params.get(this.PARAM_CX)};
          float cy = ${variation.params.get(this.PARAM_CY)};
          float cz = ${variation.params.get(this.PARAM_CZ)};
           
          float c2x = 2.0 * cx;
          float c2y = 2.0 * cy;
          float c2z = 2.0 * cz;
    
          float cx2 = sqr(cx);
          float cy2 = sqr(cy);
          float cz2 = sqr(cz);
          float c2 = cx2 + cy2 + cz2;
          float r2 = sqr(_tx) + sqr(_ty) + sqr(_tz);
          float r = amount / (r2 * c2 + c2x * _tx - c2y * _ty + c2z * _tz + 1.0);
    
          _vx += r * (_tx + cx * r2);
          _vy += r * (_ty - cy * r2);
          _vz += r * (_tz + cz * r2);
        }`;
    }

    get name(): string {
        return "curl3D";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class CylinderApoFunc extends VariationShaderFunc3D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          _vx += amount * sin(_tx);
          _vy += amount * _ty;
          _vz += amount * cos(_tx);
        }`;
    }

    get name(): string {
        return "cylinder_apo";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class HemisphereFunc extends VariationShaderFunc3D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float r = amount / sqrt(_tx * _tx + _ty * _ty + 1.0);
          _vx += _tx * r;
          _vy += _ty * r;
          _vz += r;
        }`;
    }

    get name(): string {
        return "hemisphere";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Linear3DFunc extends VariationShaderFunc3D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          _vx += amount * _tx; 
          _vy += amount * _ty;
          _vz += amount * _tz;
        }`;
    }

    get name(): string {
        return "linear3D";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Spherical3DFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          float lr = amount / (_tx * _tx + _ty * _ty + _tz * _tz + EPSILON);
          _vx += _tx * lr;
          _vy += _ty * lr;
          _vz += _tz * lr;
        }`;
    }

    get name(): string {
        return "spherical3D";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Tangent3DFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount};
          _vx += amount * sin(_tx) / cos(_ty);
          _vy += amount * tan(_ty);
          _vz += amount * tan(_tx);
        }`;
    }

    get name(): string {
        return "tangent3D";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

export function registerVars() {
    // 2D
    VariationShaders.registerVar(new ArchFunc())
    VariationShaders.registerVar(new BentFunc())
    VariationShaders.registerVar(new Bent2Func())
    VariationShaders.registerVar(new BiLinearFunc())
    VariationShaders.registerVar(new BipolarFunc())
    VariationShaders.registerVar(new BladeFunc())
    VariationShaders.registerVar(new BlobFunc())
    VariationShaders.registerVar(new BlurFunc())
    VariationShaders.registerVar(new CellFunc())
    VariationShaders.registerVar(new CloverLeafWFFunc())
    VariationShaders.registerVar(new CosFunc())
    VariationShaders.registerVar(new CotFunc())
    VariationShaders.registerVar(new CothFunc())
    VariationShaders.registerVar(new CrossFunc())
    VariationShaders.registerVar(new CurlFunc())
    VariationShaders.registerVar(new CylinderFunc())
    VariationShaders.registerVar(new DiscFunc())
    VariationShaders.registerVar(new Disc2Func())
    VariationShaders.registerVar(new EllipticFunc())
    VariationShaders.registerVar(new ExpFunc())
    VariationShaders.registerVar(new EyefishFunc())
    VariationShaders.registerVar(new FisheyeFunc())
    VariationShaders.registerVar(new JuliaFunc())
    VariationShaders.registerVar(new JuliaNFunc())
    VariationShaders.registerVar(new LinearFunc())
    VariationShaders.registerVar(new LogFunc())
    VariationShaders.registerVar(new PetalFunc())
    VariationShaders.registerVar(new PolarFunc())
    VariationShaders.registerVar(new Polar2Func())
    VariationShaders.registerVar(new PowerFunc())
    VariationShaders.registerVar(new RadialBlurFunc())
    VariationShaders.registerVar(new RaysFunc())
    VariationShaders.registerVar(new Rays1Func())
    VariationShaders.registerVar(new RoseWFFunc())
    VariationShaders.registerVar(new SecFunc())
    VariationShaders.registerVar(new SinFunc())
    VariationShaders.registerVar(new SphericalFunc())
    VariationShaders.registerVar(new SpiralFunc())
    VariationShaders.registerVar(new SplitFunc())
    VariationShaders.registerVar(new SplitsFunc())
    VariationShaders.registerVar(new SwirlFunc())
    VariationShaders.registerVar(new TanFunc())
    VariationShaders.registerVar(new TanhFunc())
    VariationShaders.registerVar(new TanCosFunc())
    VariationShaders.registerVar(new TangentFunc())
    // 3D
    VariationShaders.registerVar(new Blade3DFunc())
    VariationShaders.registerVar(new Blob3DFunc())
    VariationShaders.registerVar(new BubbleFunc())
    VariationShaders.registerVar(new Bubble2Func())
    VariationShaders.registerVar(new BubbleWFFunc())
    VariationShaders.registerVar(new Curl3DFunc())
    VariationShaders.registerVar(new CylinderApoFunc())
    VariationShaders.registerVar(new HemisphereFunc())
    VariationShaders.registerVar(new Linear3DFunc())
    VariationShaders.registerVar(new Spherical3DFunc())
    VariationShaders.registerVar(new Tangent3DFunc())
}