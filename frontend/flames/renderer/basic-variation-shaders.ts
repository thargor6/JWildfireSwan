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

import {Variation} from '../model/flame';
import {VariationShaderFunc2D, VariationShaderFunc3D, VariationTypes} from "./variation-shader-func";
import {VariationShaders} from "Frontend/flames/renderer/variation-shaders";

// https://www.shaderific.com/glsl-functions

// 2D
class ArchFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
        return `{
              float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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

class BlurFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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

class CrossFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
        return `{
                  float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
                  float amount = ${this.evalP(variation.amount)};
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

class ExpFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Exponential EXP
        return `{
            float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
           float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        // petal by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        /* polar2 from the apophysis plugin pack */
        return `{
          float amount = ${this.evalP(variation.amount)};
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

class RaysFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        // rays by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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

class SwirlFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
         return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
class CylinderApoFunc extends VariationShaderFunc3D {
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
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
    VariationShaders.registerVar(new BlurFunc())
    VariationShaders.registerVar(new CrossFunc())
    VariationShaders.registerVar(new CylinderFunc())
    VariationShaders.registerVar(new ExpFunc())
    VariationShaders.registerVar(new JuliaFunc())
    VariationShaders.registerVar(new LinearFunc())
    VariationShaders.registerVar(new PetalFunc())
    VariationShaders.registerVar(new PolarFunc())
    VariationShaders.registerVar(new Polar2Func())
    VariationShaders.registerVar(new RaysFunc())
    VariationShaders.registerVar(new Rays1Func())
    VariationShaders.registerVar(new SphericalFunc())
    VariationShaders.registerVar(new SpiralFunc())
    VariationShaders.registerVar(new SwirlFunc())
    VariationShaders.registerVar(new TangentFunc())
    // 3D
    VariationShaders.registerVar(new CylinderApoFunc())
    VariationShaders.registerVar(new Linear3DFunc())
    VariationShaders.registerVar(new Spherical3DFunc())
    VariationShaders.registerVar(new Tangent3DFunc())
}