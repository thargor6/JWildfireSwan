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
import {FUNC_SQRT1PM1} from "Frontend/flames/renderer/variation-math-functions";

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
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
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
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
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

class JuliaFunc extends VariationShaderFunc2D {
    getCode(variation: RenderVariation): string {
        return `{
           float amount = ${variation.amount};
           float a = atan2(_tx, _ty) * 0.5 + M_PI * floor(2.0 * rand2(tex));
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

    get dependencies(): string[] {
        return ['atan2', 'rand2'];
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
// 3D
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
    VariationShaders.registerVar(new BiLinearFunc())
    VariationShaders.registerVar(new BladeFunc())
    VariationShaders.registerVar(new BlurFunc())
    VariationShaders.registerVar(new CloverLeafWFFunc())
    VariationShaders.registerVar(new CrossFunc())
    VariationShaders.registerVar(new CylinderFunc())
    VariationShaders.registerVar(new EllipticFunc())
    VariationShaders.registerVar(new ExpFunc())
    VariationShaders.registerVar(new JuliaFunc())
    VariationShaders.registerVar(new LinearFunc())
    VariationShaders.registerVar(new PetalFunc())
    VariationShaders.registerVar(new PolarFunc())
    VariationShaders.registerVar(new Polar2Func())
    VariationShaders.registerVar(new PowerFunc())
    VariationShaders.registerVar(new RaysFunc())
    VariationShaders.registerVar(new Rays1Func())
    VariationShaders.registerVar(new SphericalFunc())
    VariationShaders.registerVar(new SpiralFunc())
    VariationShaders.registerVar(new SplitFunc())
    VariationShaders.registerVar(new SplitsFunc())
    VariationShaders.registerVar(new SwirlFunc())
    VariationShaders.registerVar(new TangentFunc())
    // 3D
    VariationShaders.registerVar(new BubbleFunc())
    VariationShaders.registerVar(new BubbleWFFunc())
    VariationShaders.registerVar(new CylinderApoFunc())
    VariationShaders.registerVar(new Linear3DFunc())
    VariationShaders.registerVar(new Spherical3DFunc())
    VariationShaders.registerVar(new Tangent3DFunc())
}