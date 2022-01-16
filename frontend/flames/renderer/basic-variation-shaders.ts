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
import {VariationShaderFunc2D, VariationShaderFunc3D} from "./variation-shader-func";
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
}

class ExpFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
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
}

class PetalFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
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
}

class PolarFunc extends VariationShaderFunc2D {
    getCode(variation: Variation): string {
        return `{
          float R_PI = 0.31830989;
          float amount = ${this.evalP(variation.amount)};
          float ny = sqrt(_tx * _tx + _ty * _ty) - 1.0;
          _vx += amount * (_phi * R_PI);
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return "polar";
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
}

// 3D
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
}

export function registerVars() {
    VariationShaders.registerVar(new ArchFunc())
    VariationShaders.registerVar(new BentFunc())
    VariationShaders.registerVar(new BiLinearFunc())
    VariationShaders.registerVar(new CrossFunc())
    VariationShaders.registerVar(new ExpFunc())
    VariationShaders.registerVar(new JuliaFunc())
    VariationShaders.registerVar(new LinearFunc())
    VariationShaders.registerVar(new PetalFunc())
    VariationShaders.registerVar(new PolarFunc())
    VariationShaders.registerVar(new SphericalFunc())

    VariationShaders.registerVar(new Linear3DFunc())
    VariationShaders.registerVar(new Spherical3DFunc())
}