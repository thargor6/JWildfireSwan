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
    VariationShaderFunc3D,
    VariationTypes
} from "./variation-shader-func";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";
import {M_PI} from "Frontend/flames/renderer/mathlib";

/*
  be sure to import this class somewhere and call register3DVars()
 */
class Blade3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = float(${variation.amount});
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

class Blob3DFunc extends VariationShaderFunc3D {
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

class Blur3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float angle = rand2(tex) * 2.0 * M_PI;
          float sina = sin(angle);
          float cosa = cos(angle);
     
          float r = amount * (rand(tex)+rand2(tex)+rand3(tex)+rand4(tex)-2.0);
           
          angle = rand3(tex) * M_PI;
          float sinb = sin(angle);
          float cosb = cos(angle);
          
          _vx += r * sinb * cosa;
          _vy += r * sinb * sina;
          _vz += r * cosb;
        }`;
    }

    get name(): string {
        return "blur3D";
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class BubbleFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
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

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* bubble2 from FracFx, http://fracfx.deviantart.com/art/FracFx-Plugin-Pack-171806681 */
        return `{
          float amount = float(${variation.amount});
          float x = float(${variation.params.get(this.PARAM_X)});
          float y = float(${variation.params.get(this.PARAM_Y)});
          float z = float(${variation.params.get(this.PARAM_Z)});
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
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
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

class Curl3DFunc extends VariationShaderFunc3D {
    PARAM_CX = "cx"
    PARAM_CY = "cy"
    PARAM_CZ = "cz"

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CX, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CY, type: VariationParamType.VP_NUMBER, initialValue: 0.05 },
            { name: this.PARAM_CZ, type: VariationParamType.VP_NUMBER, initialValue: 0.05 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float cx = float(${variation.params.get(this.PARAM_CX)});
          float cy = float(${variation.params.get(this.PARAM_CY)});
          float cz = float(${variation.params.get(this.PARAM_CZ)});
           
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
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
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
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
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
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
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

class Spherical3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
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

class Tangent3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
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

export function register3DVars() {
    VariationShaders.registerVar(new Blade3DFunc())
    VariationShaders.registerVar(new Blob3DFunc())
    VariationShaders.registerVar(new Blur3DFunc())
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
