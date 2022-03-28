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
} from './variation-shader-func';
import {VariationShaders} from 'Frontend/flames/renderer/variations/variation-shaders';
import {RenderVariation, RenderXForm} from 'Frontend/flames/model/render-flame';
import {
    FUNC_COSH,
    FUNC_HYPOT,
    FUNC_ROUND,
    FUNC_SGN,
    FUNC_SINH
} from 'Frontend/flames/renderer/variations/variation-math-functions';

/*
  be sure to import this class somewhere and call registerVars_3D()
 */
class Affine3DFunc extends VariationShaderFunc3D {
    PARAM_TRANSLATE_X = 'translateX'
    PARAM_TRANSLATE_Y = 'translateY'
    PARAM_TRANSLATE_Z = 'translateZ'
    PARAM_SCALE_X = 'scaleX'
    PARAM_SCALE_Y = 'scaleY'
    PARAM_SCALE_Z = 'scaleZ'
    PARAM_ROTATE_X = 'rotateX'
    PARAM_ROTATE_Y = 'rotateY'
    PARAM_ROTATE_Z = 'rotateZ'
    PARAM_SHEAR_XY = 'shearXY'
    PARAM_SHEAR_XZ = 'shearXZ'
    PARAM_SHEAR_YX = 'shearYX'
    PARAM_SHEAR_YZ = 'shearYZ'
    PARAM_SHEAR_ZX = 'shearZX'
    PARAM_SHEAR_ZY = 'shearZY'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_TRANSLATE_X, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_TRANSLATE_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TRANSLATE_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SCALE_X, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SCALE_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SCALE_Z, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_ROTATE_X, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_ROTATE_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_ROTATE_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SHEAR_XY, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SHEAR_XZ, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SHEAR_YX, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SHEAR_YZ, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SHEAR_ZX, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SHEAR_ZY, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // based on 'affine3D' of Flamelet
        return `{
          float amount = ${variation.amount.toWebGl()};
          float translateX = ${variation.params.get(this.PARAM_TRANSLATE_X)!.toWebGl()};
          float translateY = ${variation.params.get(this.PARAM_TRANSLATE_Y)!.toWebGl()};
          float translateZ = ${variation.params.get(this.PARAM_TRANSLATE_Z)!.toWebGl()};
          float scaleX = ${variation.params.get(this.PARAM_SCALE_X)!.toWebGl()};
          float scaleY = ${variation.params.get(this.PARAM_SCALE_Y)!.toWebGl()};
          float scaleZ = ${variation.params.get(this.PARAM_SCALE_Z)!.toWebGl()};
          float rotateX = ${variation.params.get(this.PARAM_ROTATE_X)!.toWebGl()};
          float rotateY = ${variation.params.get(this.PARAM_ROTATE_Y)!.toWebGl()};
          float rotateZ = ${variation.params.get(this.PARAM_ROTATE_Z)!.toWebGl()};
          float shearXY = ${variation.params.get(this.PARAM_SHEAR_XY)!.toWebGl()};
          float shearXZ = ${variation.params.get(this.PARAM_SHEAR_XZ)!.toWebGl()};
          float shearYX = ${variation.params.get(this.PARAM_SHEAR_YX)!.toWebGl()};
          float shearYZ = ${variation.params.get(this.PARAM_SHEAR_YZ)!.toWebGl()};
          float shearZX = ${variation.params.get(this.PARAM_SHEAR_ZX)!.toWebGl()};
          float shearZY = ${variation.params.get(this.PARAM_SHEAR_ZY)!.toWebGl()};
          float xa = rotateX * M_PI / 180.0;
          float _sinX = sin(xa);
          float _cosX = cos(xa);
          float ya = rotateY * M_PI / 180.0;
          float _sinY = sin(ya);
          float _cosY = cos(ya);
          float za = rotateZ * M_PI / 180.0;
          float _sinZ = sin(za);
          float _cosZ = cos(za);
          bool _hasShear = abs(shearXY) > EPSILON || abs(shearXZ) > EPSILON || abs(shearYX) > EPSILON ||
                    abs(shearYZ) > EPSILON || abs(shearZX) > EPSILON || abs(shearZY) > EPSILON; 
          if (_hasShear) {
            _vx += amount * (_cosZ * (_cosY * (shearXY * scaleY * _ty + shearXZ * scaleZ * _tz + scaleX * _tx) + _sinY * (_sinX * (shearYX * scaleX * _tx + shearYZ * scaleZ * _tz + scaleY * _ty) + _cosX * (shearZX * scaleX * _tx + shearZY * scaleY * _ty + scaleZ * _tz))) - _sinZ * (_cosX * (shearYX * scaleX * _tx + shearYZ * scaleZ * _tz + scaleY * _ty) - _sinX * (shearZX * scaleX * _tx + shearZY * scaleY * _ty + scaleZ * _tz)) + translateX);
            _vy += amount * (_sinZ * (_cosY * (shearXY * scaleY * _ty + shearXZ * scaleZ * _tz + scaleX * _tx) + _sinY * (_sinX * (shearYX * scaleX * _tx + shearYZ * scaleZ * _tz + scaleY * _ty) + _cosX * (shearZX * scaleX * _tx + shearZY * scaleY * _ty + scaleZ * _tz))) + _cosZ * (_cosX * (shearYX * scaleX * _tx + shearYZ * scaleZ * _tz + scaleY * _ty) - _sinX * (shearZX * scaleX * _tx + shearZY * scaleY * _ty + scaleZ * _tz)) + translateY);
            _vz += amount * (-_sinY * (shearXY * scaleY * _ty + shearXZ * scaleZ * _tz + scaleX * _tx) + _cosY * (_sinX * (shearYX * scaleX * _tx + shearYZ * scaleZ * _tz + scaleY * _ty) + _cosX * (shearZX * scaleX * _tx + shearZY * scaleY * _ty + scaleZ * _tz)) + translateZ);
          } else {
            _vx += amount * (_cosZ * (_cosY * scaleX * _tx + _sinY * (_cosX * scaleZ * _tz + _sinX * scaleY * _ty)) - _sinZ * (_cosX * scaleY * _ty - _sinX * scaleZ * _tz) + translateX);
            _vy += amount * (_sinZ * (_cosY * scaleX * _tx + _sinY * (_cosX * scaleZ * _tz + _sinX * scaleY * _ty)) + _cosZ * (_cosX * scaleY * _ty - _sinX * scaleZ * _tz) + translateY);
            _vz += amount * (-_sinY * scaleX * _tx + _cosY * (_cosX * scaleZ * _tz + _sinX * scaleY * _ty) + translateZ);
          }
        }`;
    }

    get name(): string {
        return 'affine3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Blade3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = rand8(tex, rngState) * amount * sqrt(_tx * _tx + _ty * _ty);
          float sinr = sin(r);
          float cosr = cos(r);
          _vx += amount * _tx * (cosr + sinr);
          _vy += amount * _tx * (cosr - sinr);
          _vz += amount * _ty * (sinr - cosr);
        }`;
    }

    get name(): string {
        return 'blade3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Blob3DFunc extends VariationShaderFunc3D {
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
          float nz = sin(waves * a) * r;
          _vx += amount * nx;
          _vy += amount * ny;
          _vz += amount * nz;
        }`;
    }

    get name(): string {
        return 'blob3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BLUR];
    }
}

class Blur3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float angle = rand8(tex, rngState) * 2.0 * M_PI;
          float sina = sin(angle);
          float cosa = cos(angle);
     
          float r = amount * (rand8(tex, rngState)+rand8(tex, rngState)+rand8(tex, rngState)+rand8(tex, rngState)-2.0);
           
          angle = rand8(tex, rngState) * M_PI;
          float sinb = sin(angle);
          float cosb = cos(angle);
          
          _vx += r * sinb * cosa;
          _vy += r * sinb * sina;
          _vz += r * cosb;
        }`;
    }

    get name(): string {
        return 'blur3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BLUR];
    }
}

class BubbleFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = ((_tx * _tx + _ty * _ty) / 4.0 + 1.0);
          float t = amount / r;
          _vx += t * _tx;
          _vy += t * _ty;
          _vz += amount * (2.0 / r - 1.0);
        }`;
    }

    get name(): string {
        return 'bubble';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Bubble2Func extends VariationShaderFunc3D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_Z = 'z'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Z, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* bubble2 from FracFx, http://fracfx.deviantart.com/art/FracFx-Plugin-Pack-171806681 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float z = ${variation.params.get(this.PARAM_Z)!.toWebGl()};
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
        return 'bubble2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class BubbleWFFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = ((_tx * _tx + _ty * _ty) / 4.0 + 1.0);
          float t = amount / r;
          _vx += t * _tx;
          _vy += t * _ty;
          if (rand8(tex, rngState) < 0.5) {
           _vz -= amount * (2.0 / r - 1.0);
          } else {
           _vz += amount * (2.0 / r - 1.0);
          }
        }`;
    }

    get name(): string {
        return 'bubble_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Curl3DFunc extends VariationShaderFunc3D {
    PARAM_CX = 'cx'
    PARAM_CY = 'cy'
    PARAM_CZ = 'cz'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CX, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CY, type: VariationParamType.VP_NUMBER, initialValue: 0.05 },
            { name: this.PARAM_CZ, type: VariationParamType.VP_NUMBER, initialValue: 0.05 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float cx = ${variation.params.get(this.PARAM_CX)!.toWebGl()};
          float cy = ${variation.params.get(this.PARAM_CY)!.toWebGl()};
          float cz = ${variation.params.get(this.PARAM_CZ)!.toWebGl()};
           
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
        return 'curl3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Butterfly3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float wx = amount * 1.3029400317411197908970256609023;
          float y2 = _ty * 2.0;
          float r = wx * sqrt(abs(_ty * _tx) / (EPSILON + _tx * _tx + y2 * y2));
          _vx += r * _tx;
          _vy += r * y2;
          _vz += r * abs(y2) * sqrt(_tx * _tx + _ty * _ty) / 4.0;
        }`;
    }

    get name(): string {
        return 'butterfly3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class ColorscaleWFFunc extends VariationShaderFunc3D {
    PARAM_CX = 'scale_x'
    PARAM_CY = 'scale_y'
    PARAM_CZ = 'scale_z'
    PARAM_OFFSET_Z = 'offset_z'
    PARAM_RESET_Z = 'reset_z'
    PARAM_SIDES = 'sides'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CX, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CY, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_CZ, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_OFFSET_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_RESET_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SIDES, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float scale_x = ${variation.params.get(this.PARAM_CX)!.toWebGl()};
          float scale_y = ${variation.params.get(this.PARAM_CY)!.toWebGl()};
          float scale_z = ${variation.params.get(this.PARAM_CZ)!.toWebGl()};
          float offset_z = ${variation.params.get(this.PARAM_OFFSET_Z)!.toWebGl()};
          float reset_z = ${variation.params.get(this.PARAM_RESET_Z)!.toWebGl()};
          float sides = ${variation.params.get(this.PARAM_SIDES)!.toWebGl()};
          _vx += amount * scale_x * _tx;
          _vy += amount * scale_y * _ty;
          float dz = _color * scale_z * amount + offset_z;
          if (reset_z > 0.0) {
            _vz = dz;
          } else {
            if (sides > 0.0) {
              _vz += dz * rand8(tex, rngState);
            } else {
              _vz += dz;
            }
          }  
        }`;
    }

    get name(): string {
        return 'colorscale_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_DC];
    }
}

class ConeFunc extends VariationShaderFunc3D {
    PARAM_RADIUS1 = 'radius1'
    PARAM_RADIUS2 = 'radius2'
    PARAM_SIZE1 = 'size1'
    PARAM_SIZE2 = 'size2'
    PARAM_YWAVE = 'ywave'
    PARAM_XWAVE = 'xwave'
    PARAM_HEIGHT = 'height'
    PARAM_WARP = 'warp'
    PARAM_WEIGHT = 'weight'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RADIUS1, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_RADIUS2, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SIZE1, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_SIZE2, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_YWAVE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_XWAVE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_HEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_WARP, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_WEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 2.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        //A mix of julia and hemisphere that creates a cone shape by Brad Stefanov
        return `{
          float amount = ${variation.amount.toWebGl()};
          float radius1 = ${variation.params.get(this.PARAM_RADIUS1)!.toWebGl()};
          float radius2 = ${variation.params.get(this.PARAM_RADIUS2)!.toWebGl()};
          float size1 = ${variation.params.get(this.PARAM_SIZE1)!.toWebGl()};
          float size2 = ${variation.params.get(this.PARAM_SIZE2)!.toWebGl()};
          float ywave = ${variation.params.get(this.PARAM_YWAVE)!.toWebGl()};
          float xwave = ${variation.params.get(this.PARAM_XWAVE)!.toWebGl()};
          float height = ${variation.params.get(this.PARAM_HEIGHT)!.toWebGl()};
          float warp = ${variation.params.get(this.PARAM_WARP)!.toWebGl()};
          float weight = ${variation.params.get(this.PARAM_WEIGHT)!.toWebGl()};
          float r = amount / sqrt(_tx * _tx *warp+ _ty * _ty + size1)*size2;
          float xx = _phi* radius1 + M_PI * float(int(weight * rand8(tex, rngState)*radius2));
          float sina = sin(xx*ywave);
          float cosa = cos(xx*xwave);
          _vx += r * cosa;
          _vy += r * sina;
          _vz += r * height;
        }`;
    }

    get name(): string {
        return 'cone';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class CylinderApoFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * sin(_tx);
          _vy += amount * _ty;
          _vz += amount * cos(_tx);
        }`;
    }

    get name(): string {
        return 'cylinder_apo';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Foci3DFunc extends VariationShaderFunc3D {
    /* foci_3D by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float expx = exp(_tx) * 0.5;
          float expnx = 0.25 / expx;
          float kikr, boot;
          boot = _tz;
          kikr = atan2(_ty, _tx);
          if (boot == 0.0) {
            boot = kikr;
          }
          float siny = sin(_ty);
          float cosy = cos(_ty);
          float sinz = sin(boot);
          float cosz = cos(boot);
          float tmp = amount / (expx + expnx - (cosy * cosz));
          _vx += (expx - expnx) * tmp;
          _vy += siny * tmp;
          _vz += sinz * tmp;
        }`;
    }

    get name(): string {
        return 'foci_3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class HemisphereFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = amount / sqrt(_tx * _tx + _ty * _ty + 1.0);
          _vx += _tx * r;
          _vy += _ty * r;
          _vz += r;
        }`;
    }

    get name(): string {
        return 'hemisphere';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class HOFunc extends VariationShaderFunc3D {
    PARAM_XPOW = 'xpow'
    PARAM_YPOW = 'ypow'
    PARAM_ZPOW = 'zpow'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XPOW, type: VariationParamType.VP_NUMBER, initialValue: 3.0 },
            { name: this.PARAM_YPOW, type: VariationParamType.VP_NUMBER, initialValue: 3.0},
            { name: this.PARAM_ZPOW, type: VariationParamType.VP_NUMBER, initialValue: 3.0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // ho by Larry Berlin, http://aporev.deviantart.com/gallery/#/d2blmhg
        //    A Hyperbolic Octahedra
        //    As described in "CRC Concise Encyclopedia of Mathematics" by Weisstein 2nd ed.
        //
        //    f[u_, v_] = (Cos[u] * Cos[v])^3
        //    g[u_, v_] = (Sin[u] * Cos[v])^3
        //    h[u_, v_] = Sin[v]^3
        return `{
            float amount = ${variation.amount.toWebGl()};
            float xpow = ${variation.params.get(this.PARAM_XPOW)!.toWebGl()};
            float ypow = ${variation.params.get(this.PARAM_YPOW)!.toWebGl()};
            float zpow = ${variation.params.get(this.PARAM_ZPOW)!.toWebGl()};
            float u = _tx;
            float v = _ty;
            float w = _tz;
        
            float at_omega_x = atan2(v * v, w * w);
            float at_omega_y = atan2(u * u, w * w);
            float sv = sin(v);
            float cv = cos(v);
        
            float su = sin(u);
            float cu = cos(u);
        
            float x = pow((cu * cv), xpow) + ((cu * cv) * xpow) + (0.25 * at_omega_x);
            float y = pow((su * cv), ypow) + ((su * cv) * ypow) + (0.25 * at_omega_y);
            float z = pow(sv, zpow) + sv * zpow;
        
            float rr = amount;
        
            _vx += rr * x;
            _vy += rr * y;
            _vz += rr * z;
        }`;
    }

    get name(): string {
        return 'ho';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Hypertile3DFunc extends VariationShaderFunc3D {
    PARAM_P = 'p'
    PARAM_Q = 'q'
    PARAM_N = 'n'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_P, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_NUMBER, initialValue: 7 },
            { name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* hypertile3D by Zueuk, http://zueuk.deviantart.com/art/3D-Hyperbolic-tiling-plugins-169047926 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          int p = ${variation.params.get(this.PARAM_P)!.toWebGl()};
          int q = ${variation.params.get(this.PARAM_Q)!.toWebGl()};
          int n = ${variation.params.get(this.PARAM_N)!.toWebGl()};        
          float c2x, c2y, c2, s2x, s2y, s2z, cx, cy; 
          float pa = 2.0 * M_PI / float(p), qa = 2.0 * M_PI / float(q);
          float r = -(cos(pa) - 1.0) / (cos(pa) + cos(qa));
          if (r > 0.0)
            r = 1.0 / sqrt(1.0 + r);
          else
            r = 1.0;
          float na = float(n) * pa;
          cx = r * cos(na);
          cy = r * sin(na);   
          c2 = sqr(cx) + sqr(cy);  
          c2x = 2.0 * cx;
          c2y = 2.0 * cy;
          s2x = 1.0 + sqr(cx) - sqr(cy);
          s2y = 1.0 + sqr(cy) - sqr(cx);
          s2z = 1.0 - sqr(cy) - sqr(cx);
          float r2 = sqr(_tx) + sqr(_ty) + sqr(_tz);
          float x2cx = c2x * _tx, y2cy = c2y * _ty;
          float d = amount / (c2 * r2 + x2cx - y2cy + 1.0);
          _vx += d * (_tx * s2x - cx * (y2cy - r2 - 1.0));
          _vy += d * (_ty * s2y + cy * (-x2cx - r2 - 1.0));
          _vz += d * (_tz * s2z); 
        }`;
    }

    get name(): string {
        return 'hypertile3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Hypertile3D1Func extends VariationShaderFunc3D {
    PARAM_P = 'p'
    PARAM_Q = 'q'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_P, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_NUMBER, initialValue: 7 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* hypertile3D1 by Zueuk, http://zueuk.deviantart.com/art/3D-Hyperbolic-tiling-plugins-169047926 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          int p = ${variation.params.get(this.PARAM_P)!.toWebGl()};
          int q = ${variation.params.get(this.PARAM_Q)!.toWebGl()};
          float pa, qa, r, c2, s2z; 
          pa = 2.0 * M_PI / float(p);
          qa = 2.0 * M_PI / float(q);
          r = -(cos(pa) - 1.0) / (cos(pa) + cos(qa));
          if (r > 0.0)
            r = 1.0 / sqrt(1.0 + r);
          else
            r = 1.0;
          c2 = sqr(r);
          s2z = 1.0 - c2;
          float a = float(iRand8(tex, 32768, rngState)) * pa;
          float sina = sin(a);
          float cosa = cos(a);
          float cx = r * cosa;
          float cy = r * sina;
          float s2x = 1.0 + sqr(cx) - sqr(cy);
          float s2y = 1.0 + sqr(cy) - sqr(cx);
          float r2 = sqr(_tx) + sqr(_ty) + sqr(_tz);
          float x2cx = 2.0 * cx * _tx, y2cy = 2.0 * cy * _ty;
          float d = amount / (c2 * r2 + x2cx - y2cy + 1.0);
          _vx += d * (_tx * s2x - cx * (y2cy - r2 - 1.0));
          _vy += d * (_ty * s2y + cy * (-x2cx - r2 - 1.0));
          _vz += d * (_tz * s2z);
        }`;
    }

    get name(): string {
        return 'hypertile3D1';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Hypertile3D2Func extends VariationShaderFunc3D {
    PARAM_P = 'p'
    PARAM_Q = 'q'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_P, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_NUMBER, initialValue: 7 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* hypertile3D2 by Zueuk, http://zueuk.deviantart.com/art/3D-Hyperbolic-tiling-plugins-169047926 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          int p = ${variation.params.get(this.PARAM_P)!.toWebGl()};
          int q = ${variation.params.get(this.PARAM_Q)!.toWebGl()};
          float pa, qa, cx, c2, c2x, s2x, s2y, s2z; 
          pa = 2.0 * M_PI / float(p);
          qa = 2.0 * M_PI / float(q);    
          float r = -(cos(pa) - 1.0) / (cos(pa) + cos(qa));
          if (r > 0.0)
            r = 1.0 / sqrt(1.0 + r);
          else
            r = 1.0;    
          cx = r;
          c2 = sqr(cx);
          c2x = 2.0 * cx;
          s2x = 1.0 + sqr(cx);
          s2y = 1.0 - sqr(cx);
          s2z = 1.0 - sqr(cx);
          float r2 = sqr(_tx) + sqr(_ty) + sqr(_tz);
          float x2cx = c2x * _tx;
          float x = _tx * s2x - cx * (-r2 - 1.0);
          float y = _ty * s2y;
          float vr = amount / (c2 * r2 + x2cx + 1.0);
          float a = float(iRand8(tex, 32768, rngState)) * pa;
          float sina = sin(a);
          float cosa = cos(a);
          _vx += vr * (x * cosa + y * sina);
          _vy += vr * (y * cosa - x * sina);
          _vz += vr * (_tz * s2z);
        }`;
    }

    get name(): string {
        return 'hypertile3D2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Julia3DFunc extends VariationShaderFunc3D {
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
         
          float absPower = abs(float(power));
          float cPower = (1.0 / float(power) - 1.0) * 0.5; 
          float z = _tz / absPower;
          float r2d = _tx * _tx + _ty * _ty;
          float r = amount * pow(r2d + z * z, cPower);
          float r2 = r * sqrt(r2d);
          int rnd = int(rand8(tex, rngState) * absPower);
          float angle = (atan2(_ty, _tx) + 2.0 * M_PI * float(rnd)) / float(power);
          float sina = sin(angle);
          float cosa = cos(angle);     
          _vx += r2 * cosa;
          _vy += r2 * sina;
          _vz += r * z;
        }`;
    }

    get name(): string {
        return 'julia3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Julia3DZFunc extends VariationShaderFunc3D {
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
         
          float absPower = abs(float(power));
          float cPower = 1.0 / float(power) * 0.5;
          float r2d = _tx * _tx + _ty * _ty;
          float r = amount * pow(r2d, cPower);
        
          int rnd = int(rand8(tex, rngState) * absPower);
          float angle = (atan2(_ty, _tx) + 2.0 * M_PI * float(rnd)) / float(power);
          float sina = sin(angle);
          float cosa = cos(angle);
          _vx += r * cosa;
          _vy += r * sina;
          _vz += r * _tz / (sqrt(r2d) * absPower);
        }`;
    }

    get name(): string {
        return 'julia3Dz';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class LineFunc extends VariationShaderFunc3D {
    PARAM_DELTA = 'delta'
    PARAM_PHI = 'phi'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_DELTA, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_PHI, type: VariationParamType.VP_NUMBER, initialValue: 0.0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * @author Nic Anderson, chronologicaldot
         * @date March 2, 2013
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float delta = ${variation.params.get(this.PARAM_DELTA)!.toWebGl()};
          float phi = ${variation.params.get(this.PARAM_PHI)!.toWebGl()};
          float ux = cos(delta * M_PI) * cos(phi * M_PI);
          float uy = sin(delta * M_PI) * cos(phi * M_PI);
          float uz = sin(phi * M_PI);
          float r = sqrt(ux * ux + uy * uy + uz * uz);
          ux /= r;
          uy /= r;
          uz /= r;
          float rand = rand8(tex, rngState) * amount;
          _vx += ux * rand;
          _vy += uy * rand;
          _vz += uz * rand;
        }`;
    }

    get name(): string {
        return 'line';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class Linear3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * _tx; 
          _vy += amount * _ty;
          _vz += amount * _tz;
        }`;
    }

    get name(): string {
        return 'linear3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class LinearT3DFunc extends VariationShaderFunc3D {
    PARAM_POW_X = 'powX'
    PARAM_POW_Y= 'powY'
    PARAM_POW_Z= 'powZ'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POW_X, type: VariationParamType.VP_NUMBER, initialValue: 1.35 },
            { name: this.PARAM_POW_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.85},
            { name: this.PARAM_POW_Z, type: VariationParamType.VP_NUMBER, initialValue: 1.15}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // linearT3D by FractalDesire, http://fractaldesire.deviantart.com/journal/linearT-plugin-219864320
        return `{
          float amount = ${variation.amount.toWebGl()};
          float powX = ${variation.params.get(this.PARAM_POW_X)!.toWebGl()};
          float powY = ${variation.params.get(this.PARAM_POW_Y)!.toWebGl()};
          float powZ = ${variation.params.get(this.PARAM_POW_Z)!.toWebGl()};
          _vx += sgn(_tx) * pow(abs(_tx), powX) * amount;
          _vy += sgn(_ty) * pow(abs(_ty), powY) * amount;
          _vz += sgn(_tz) * pow(abs(_tz), powZ) * amount;
        }`;
    }

    get name(): string {
        return 'linearT3D';
    }

    get funcDependencies(): string[] {
        return [FUNC_SGN];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Loonie_3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* loonie_3D by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float sqrvvar = amount * amount;
          float efTez = _tz;
          float kikr;
          kikr = atan2(_ty, _tx);
          if (efTez == 0.0) {
            efTez = kikr;
          }
          float r2 = sqr(_tx) + sqr(_ty) + sqr(efTez); 
          if (r2 >= EPSILON) {
            if (r2 < sqrvvar) {
              float r = amount * sqrt(sqrvvar / r2 - 1.0);
              _vx += r * _tx;
              _vy += r * _ty;
              _vz += r * efTez * 0.5;
            } else {
              _vx += amount * _tx;
              _vy += amount * _ty;
              _vz += amount * efTez * 0.5;
            }       
          }
        }`;
    }

    get name(): string {
        return 'loonie_3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class OctagonFunc extends VariationShaderFunc3D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_Z = 'z'
    PARAM_MODE = 'mode'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_MODE, type: VariationParamType.VP_NUMBER, initialValue: 1 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* octagon from FracFx, http://fracfx.deviantart.com/art/FracFx-Plugin-Pack-171806681 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float z = ${variation.params.get(this.PARAM_Z)!.toWebGl()};
          int mode = ${variation.params.get(this.PARAM_MODE)!.toWebGl()};
          float r = sqr(sqr(_tx)) + sqr(sqr(_ty)) + 2.0 * sqr(_tz);
          if (r == 0.0) r = EPSILON;
          float t = abs(_tx) + abs(_ty) + 2.0 * sqrt((mode > 1) ? abs(_tz) :  _tz);
          if (t == 0.0) t = EPSILON;
            
          float m = 1.0;
          bool splits = false;
          if(mode==0) {  
              if (r <= amount / 2.0) {
                m = 1.0 + 1.0 / t;
                splits = true;
              } else {
                m = 1.0 / r;
                splits = false;
              }
           }
           else if(mode==1) {
              if (r <= amount / 2.0) {
                m = 1.0 + 1.0 / t;
                splits = true;
              } else if (amount >= 0.0) {
                m = 1.0 / r + 1.0 / t;
                splits = true;
              } else {
                m = 1.0 + 1.0 / r;
                splits = true;
              }
           }
           else if(mode==2) {
              if (r <= amount / 2.0) {
                m = 1.0 + 1.0 / t;
                splits = true;
              } else {
                m = 1.0 + 1.0 / r;
                splits = false;
              }
           }
           else if(mode==3) {
              if (r <= amount / 2.0) {
                m = 1.0 / t;
                splits = true;
              } else {
                m = 1.0 / r;
                splits = false;
              }
           }
           else if(mode==4) {
              if (r <= amount / 2.0) {
                m = 1.0 / r;
                splits = true;
              } else {
                m = 1.0 / r;
                splits = false;
              }
           }
           else if(mode==5) {
              if (t <= amount / 2.0) {
                m = 1.0 / t;
                splits = true;
              } else {
                m = 1.0 / r;
                splits = false;
              }
           }
           else { // 6:
              if (t <= amount / 2.0) {
                m = 1.0 + 1.0 / t;
                splits = true;
              } else {
                m = 1.0 + 1.0 / r;
                splits = false;
              }
           }
            
           _vx += amount * m * _tx;
           _vy += amount * m * _ty;
           _vz += amount * m * _tz;
        
           if (splits) {
              if (_tx >= 0.0)
                _vx += amount * (_tx + x);
              else
                _vx += amount * (_tx - x);
          
              if (_ty >= 0.0)
                _vy += amount * (_ty + y);
              else
                _vy += amount * (_ty - y);
          
              if (_tz >= 0.0)
                _vz += amount * (_tz + z);
              else
                _vz += amount * (_tz - z);
            }
        }`;
    }

    get name(): string {
        return 'octagon';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class PDJ3DFunc extends VariationShaderFunc3D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'
    PARAM_E = 'e'
    PARAM_F = 'f'
    PARAM_G = 'g'
    PARAM_H = 'h'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 4.00 },
            { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_G, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_H, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // 3D variables added by Brad Stefanov.
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float f = ${variation.params.get(this.PARAM_F)!.toWebGl()};
          float g = ${variation.params.get(this.PARAM_G)!.toWebGl()};
          float h = ${variation.params.get(this.PARAM_H)!.toWebGl()};
          _vx += amount * (sin(a * _ty) - cos(b * _tx));
          _vy += amount * (sin(c * _tx) - cos(d * _ty));
          _vz += amount * (sin(e * _ty) - cos(f * _tz)) * cos(g * _tx) + sin(h * _tz) ;
        }`;
    }

    get name(): string {
        return 'pdj3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Poincare3DFunc extends VariationShaderFunc3D {
    PARAM_R = 'r'
    PARAM_A = 'a'
    PARAM_B = 'b'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_R, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* poincare3D by Zueuk, http://zueuk.deviantart.com/art/3D-Hyperbolic-tiling-plugins-169047926 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = ${variation.params.get(this.PARAM_R)!.toWebGl()};
            float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
            float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
            float cx = -r * cos(a * (M_PI*0.5)) * cos(b * (M_PI*0.5));
            float cy = r * sin(a * (M_PI*0.5)) * cos(b * (M_PI*0.5));
            float cz = -r * sin(b * (M_PI*0.5));
        
            float c2 = sqr(cx) + sqr(cy) + sqr(cz);
        
            float c2x = 2.0 * cx;
            float c2y = 2.0 * cy;
            float c2z = 2.0 * cz;
        
            float s2x = sqr(cx) - sqr(cy) - sqr(cz) + 1.0;
            float s2y = sqr(cy) - sqr(cx) - sqr(cz) + 1.0;
            float s2z = sqr(cz) - sqr(cy) - sqr(cx) + 1.0;  
            float r2 = sqr(_tx) + sqr(_ty) + sqr(_tz);
        
            float x2cx = c2x * _tx, y2cy = c2y * _ty, z2cz = c2z * _tz;
        
            float d = amount / (c2 * r2 - x2cx - y2cy - z2cz + 1.0);
        
            _vx += d * (_tx * s2x + cx * (y2cy + z2cz - r2 - 1.0));
            _vy += d * (_ty * s2y + cy * (x2cx + z2cz - r2 - 1.0));
            _vz += d * (_tz * s2z + cz * (y2cy + x2cx - r2 - 1.0));
        }`;
    }

    get name(): string {
        return 'poincare3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Popcorn2_3DFunc extends VariationShaderFunc3D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_Z = 'z'
    PARAM_C = 'c'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.1},
            { name: this.PARAM_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.1},
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 3.0}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* popcorn2_3D by Larry Berlin, http://aporev.deviantart.com/art/3D-Plugins-Collection-One-138514007?q=gallery%3Aaporev%2F8229210&qo=15 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
            float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
            float z = ${variation.params.get(this.PARAM_Z)!.toWebGl()};
            float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
            float inZ, otherZ, tempTZ, tempPZ, tmpVV;
            inZ = _tz;
            otherZ = _vz;
        
            if (abs(amount) <= 1.0) {
              tmpVV = abs(amount) * amount; 
            } else {
              tmpVV = amount;
            }
            if (otherZ == 0.0) {
              tempPZ = tmpVV * sin(tan(c)) * atan2(_ty, _tx);
            } else {
              tempPZ = _vz;
            }
            if (inZ == 0.0) {
              tempTZ = tmpVV * sin(tan(c)) * atan2(_ty, _tx);
            } else {
              tempTZ = _tz;
            }
            _vx += amount * 0.5 * (_tx + x * sin(tan(c * _ty)));
            _vy += amount * 0.5 * (_ty + y * sin(tan(c * _tx)));
            _vz = tempPZ + tmpVV * (z * sin(tan(c)) * tempTZ);
        }`;
    }

    get name(): string {
        return 'popcorn2_3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Pie3DFunc extends VariationShaderFunc3D {
    PARAM_SLICES = 'slices'
    PARAM_ROTATION = 'rotation'
    PARAM_THICKNESS = 'thickness'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SLICES, type: VariationParamType.VP_NUMBER, initialValue: 6.0 },
            { name: this.PARAM_ROTATION, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float slices = ${variation.params.get(this.PARAM_SLICES)!.toWebGl()};
          float rotation = ${variation.params.get(this.PARAM_ROTATION)!.toWebGl()};
          float thickness = ${variation.params.get(this.PARAM_THICKNESS)!.toWebGl()};
          int sl = int(rand8(tex, rngState) * slices + 0.5);
          float a = rotation + 2.0 * M_PI * (float(sl) + rand8(tex, rngState) * thickness) / slices;
          float r = amount * rand8(tex, rngState);
          float sina = sin(a);
          float cosa = cos(a);
          _vx += r * cosa;
          _vy += r * sina;
          _vz += r * sin(r);
        }`;
    }

    get name(): string {
        return 'pie3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class SecqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Secq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
           float amount = ${variation.amount.toWebGl()};
           float abs_v = hypot(_ty, _tz);
           float s = sin(-_tx);
           float c = cos(-_tx);
           float sh = sinh(abs_v);
           float ch = cosh(abs_v);
           float ni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
           float C = ni * s * sh / abs_v;
           _vx += c * ch * ni;
           _vy -= C * _ty;
           _vz -= C * _tz;
        }`;
    }

    get name(): string {
        return 'secq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }
}

class SechqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Sechq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
           float amount = ${variation.amount.toWebGl()};
           float abs_v = hypot(_ty, _tz);
           float s = sin(abs_v);
           float c = cos(abs_v);
           float sh = sinh(_tx);
           float ch = cosh(_tx);
           float ni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
           float C = ni * sh * s / abs_v;
           _vx += ch * c * ni;
           _vy -= C * _ty;
           _vz -= C * _tz;
        }`;
    }

    get name(): string {
        return 'sechq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }
}

class Scry3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* scry_3D by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float inv = 1.0 / (amount + EPSILON);
          float t = sqr(_tx) + sqr(_ty) + sqr(_tz);
          float r = 1.0 / (sqrt(t) * (t + inv));
          float Footzee, kikr;
          kikr = atan2(_ty, _tx);
          Footzee = _tz;
          _vx += _tx * r;
          _vy += _ty * r;
          if (Footzee != 0.0) {
            _vz += Footzee * r;
          } else {
            Footzee = kikr;
            _vz += Footzee * r;
          }
        }`;
    }

    get name(): string {
        return 'scry_3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Sinusoidal3DFunc extends VariationShaderFunc3D {

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // sinusoidal3d by gossamer_light
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * sin(_tx);
          _vy += amount * sin(_ty);
          _vz += amount * (atan2(_tx * _tx, _ty * _ty) * cos(_tz));
        }`;
    }

    get name(): string {
        return 'sinusoidal3d';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Spherical3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float lr = amount / (_tx * _tx + _ty * _ty + _tz * _tz + EPSILON);
          _vx += _tx * lr;
          _vy += _ty * lr;
          _vz += _tz * lr;
        }`;
    }

    get name(): string {
        return 'spherical3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Spherical3DWFFunc extends VariationShaderFunc3D {
    PARAM_INVERT = 'invert'
    PARAM_EXPONENT = 'exponent'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_INVERT, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_EXPONENT, type: VariationParamType.VP_NUMBER, initialValue: 2.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int invert = ${variation.params.get(this.PARAM_INVERT)!.toWebGl()};
          float exponent = ${variation.params.get(this.PARAM_EXPONENT)!.toWebGl()};
          
          bool _regularForm = abs(exponent - 2.0) < EPSILON;
          float r;
          if (_regularForm) {
              r = amount / (_tx * _tx + _ty * _ty + _tz * _tz + EPSILON);
            } else {
              r = amount / pow(_tx * _tx + _ty * _ty + _tz * _tz + EPSILON, exponent / 2.0);
            }
            if (invert == 0) {
              _vx += _tx * r;
              _vy += _ty * r;
              _vz += _tz * r;
            } else {
              _vx -= _tx * r;
              _vy -= _ty * r;
              _vz -= _tz * r;
            }
        }`;
    }

    get name(): string {
        return 'spherical3D_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Splits3DFunc extends VariationShaderFunc3D {
    PARAM_XPOW = 'x'
    PARAM_YPOW = 'y'
    PARAM_ZPOW = 'z'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_YPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.30},
            { name: this.PARAM_ZPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.20}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* splits3D by TyrantWave, http://tyrantwave.deviantart.com/art/Splits3D-Plugin-107262795 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = ${variation.params.get(this.PARAM_XPOW)!.toWebGl()};
            float y = ${variation.params.get(this.PARAM_YPOW)!.toWebGl()};
            float z = ${variation.params.get(this.PARAM_ZPOW)!.toWebGl()};
            if (_tx >= 0.0) {
              _vx += amount * (_tx + x);
            } else {
              _vx += amount * (_tx - x);
            }
        
            if (_ty >= 0.0) {
              _vy += amount * (_ty + y);
            } else {
              _vy += amount * (_ty - y);
            }
        
            if (_tz >= 0.0) {
              _vz += amount * (_tz + z);
            } else {
              _vz += amount * (_tz - z);
            }
        }`;
    }

    get name(): string {
        return 'splits3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Square3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * (rand8(tex, rngState) - 0.5);
          _vy += amount * (rand8(tex, rngState) - 0.5);    
          _vz += amount * (rand8(tex, rngState) - 0.5);    
        }`;
    }

    get name(): string {
        return 'square3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class SVFFunc extends VariationShaderFunc3D {
    PARAM_N = 'n'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 2.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* svn (single value function) by gossamer light */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
            float cn = cos(n * _ty);
            float sx = sin(_tx);
            float cx = cos(_tx);
            float sy = sin(_ty);
            float cy = cos(_ty);
            _vx += amount * (cy * (cn * cx));
            _vy += amount * (cy * (cn * sx));
            _vz += amount * (sy * cn);
        }`;
    }

    get name(): string {
        return 'svf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Tangent3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * sin(_tx) / cos(_ty);
          _vy += amount * tan(_ty);
          _vz += amount * tan(_tx);
        }`;
    }

    get name(): string {
        return 'tangent3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class TaurusFunc extends VariationShaderFunc3D {
    PARAM_R = 'r'
    PARAM_N = 'n'
    PARAM_INV = 'inv'
    PARAM_SOR = 'sor'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_R, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 5.00 },
            { name: this.PARAM_INV, type: VariationParamType.VP_NUMBER, initialValue: 1.50 },
            { name: this.PARAM_SOR, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* taurus by gossamer light */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = ${variation.params.get(this.PARAM_R)!.toWebGl()};
          float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
          float inv = ${variation.params.get(this.PARAM_INV)!.toWebGl()};
          float sor = ${variation.params.get(this.PARAM_SOR)!.toWebGl()};
          float sx = sin(_tx);
          float cx = cos(_tx);
          float sy = sin(_ty);
          float cy = cos(_ty);
          float ir = (inv * r) + ((1.0 - inv) * (r * cos(n * _tx)));
          _vx += amount * (cx * (ir + sy));
          _vy += amount * (sx * (ir + sy));
          _vz += amount * (sor * cy) + ((1.0 - sor) * _ty);
        }`;
    }

    get name(): string {
        return 'taurus';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}


class Tile_LogFunc extends VariationShaderFunc3D {
    PARAM_SPREAD = 'spread'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPREAD, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // tile_log by Zy0rg implemented into JWildfire by Brad Stefanov
        return `{
          float amount = ${variation.amount.toWebGl()};
          float spread = ${variation.params.get(this.PARAM_SPREAD)!.toWebGl()};
           float x = -spread;
           if (rand8(tex, rngState) < 0.5)
              x = spread;   
            _vx += amount * (_tx + round(x * log(rand8(tex, rngState))));
            _vy += amount * _ty;
            _vz += amount * _tz;
        }`;
    }

    get name(): string {
        return 'tile_log';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}


export function registerVars_3D() {
    VariationShaders.registerVar(new Affine3DFunc())
    VariationShaders.registerVar(new Blade3DFunc())
    VariationShaders.registerVar(new Blob3DFunc())
    VariationShaders.registerVar(new Blur3DFunc())
    VariationShaders.registerVar(new BubbleFunc())
    VariationShaders.registerVar(new Bubble2Func())
    VariationShaders.registerVar(new BubbleWFFunc())
    VariationShaders.registerVar(new Butterfly3DFunc())
    VariationShaders.registerVar(new ColorscaleWFFunc())
    VariationShaders.registerVar(new ConeFunc())
    VariationShaders.registerVar(new Curl3DFunc())
    VariationShaders.registerVar(new CylinderApoFunc())
    VariationShaders.registerVar(new Foci3DFunc())
    VariationShaders.registerVar(new HemisphereFunc())
    VariationShaders.registerVar(new HOFunc())
    VariationShaders.registerVar(new Hypertile3DFunc())
    VariationShaders.registerVar(new Hypertile3D1Func())
    VariationShaders.registerVar(new Hypertile3D2Func())
    VariationShaders.registerVar(new Julia3DFunc())
    VariationShaders.registerVar(new Julia3DZFunc())
    VariationShaders.registerVar(new LineFunc())
    VariationShaders.registerVar(new Linear3DFunc())
    VariationShaders.registerVar(new LinearT3DFunc())
    VariationShaders.registerVar(new Loonie_3DFunc())
    VariationShaders.registerVar(new OctagonFunc())
    VariationShaders.registerVar(new PDJ3DFunc())
    VariationShaders.registerVar(new Poincare3DFunc())
    VariationShaders.registerVar(new Popcorn2_3DFunc())
    VariationShaders.registerVar(new Pie3DFunc())
    VariationShaders.registerVar(new SecqFunc())
    VariationShaders.registerVar(new SechqFunc())
    VariationShaders.registerVar(new Scry3DFunc())
    VariationShaders.registerVar(new Sinusoidal3DFunc())
    VariationShaders.registerVar(new Spherical3DFunc())
    VariationShaders.registerVar(new Spherical3DWFFunc())
    VariationShaders.registerVar(new Splits3DFunc())
    VariationShaders.registerVar(new Square3DFunc())
    VariationShaders.registerVar(new SVFFunc())
    VariationShaders.registerVar(new Tangent3DFunc())
    VariationShaders.registerVar(new TaurusFunc())
    VariationShaders.registerVar(new Tile_LogFunc())
}
