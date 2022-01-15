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
import {VariationShaderFunc} from "./variation-shader-func";
import {VariationShaders} from "Frontend/flames/renderer/variation-shaders";

// https://www.shaderific.com/glsl-functions

// 2D
class ArchFunc extends VariationShaderFunc {
    getCode(variation: Variation): string {
        return `{
              float amount = ${this.evalP(variation.amount)};
              float ang = rand2(tex) * amount * M_PI;
              float sinr = sin(ang);
              float cosr = cos(ang);
              if (cosr != 0.0) {
                vx += amount * sinr;
                vy += amount * (sinr * sinr) / cosr;
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

class CrossFunc extends VariationShaderFunc {
    getCode(variation: Variation): string {
        return `{
                  float amount = ${this.evalP(variation.amount)};
                  float s = tx * tx - ty * ty;
                  float r = amount * sqrt(1.0 / (s * s + EPSILON));
                  vx += tx * r;
                  vy += ty * r;
                }`;
    }

    get name(): string {
        return "cross";
    }

}

class ExpFunc extends VariationShaderFunc {
    getCode(variation: Variation): string {
        return `{
            float amount = ${this.evalP(variation.amount)};
            float expe = exp(tx);
            float expsin = sin(ty);
            float expcos = cos(ty);
            vx += amount * expe * expcos;
            vy += amount * expe * expsin;
        }`;
    }

    get name(): string {
        return "exp";
    }

}

class JuliaFunc extends VariationShaderFunc {
    getCode(variation: Variation): string {
        return `{
           float amount = ${this.evalP(variation.amount)};
           float a = atan2(tx, ty) * 0.5 + M_PI * floor(2.0 * rand2(tex));
           float sina = sin(a);
           float cosa = cos(a);
           float r = amount * sqrt(sqrt(tx * tx + ty * ty));
           vx += r * cosa;
           vy += r * sina;
        }`;
    }

    get name(): string {
        return "julia";
    }

    get dependencies(): string[] {
        return ['atan2', 'rand2'];
    }
}

class LinearFunc extends VariationShaderFunc {
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
          vx += amount * tx; 
          vy += amount * ty;
        }`;
    }

    get name(): string {
        return "linear";
    }

}

class SphericalFunc extends VariationShaderFunc {
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
          float lr = amount / (tx*tx + ty * ty + EPSILON);
          vx += tx * lr;
          vy += ty * lr;
        }`;
    }

    get name(): string {
        return "spherical";
    }

}


// 3D
class Linear3DFunc extends VariationShaderFunc {
    getCode(variation: Variation): string {
        return `{
          float amount = ${this.evalP(variation.amount)};
          vx += amount * tx; 
          vy += amount * ty;
        }`;
    }

    get name(): string {
        return "linear3D";
    }
}

export function registerVars() {
    VariationShaders.registerVar(new ArchFunc())
    VariationShaders.registerVar(new CrossFunc())
    VariationShaders.registerVar(new ExpFunc())
    VariationShaders.registerVar(new JuliaFunc())
    VariationShaders.registerVar(new LinearFunc())
    VariationShaders.registerVar(new SphericalFunc())
    VariationShaders.registerVar(new Linear3DFunc())
}