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

class Cubic_3DFunc extends VariationShaderFunc3D {
    PARAM_XPAND = 'xpand'
    PARAM_STYLE = 'style'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XPAND, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_STYLE, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cubic3D by Larry Berlin, http://aporev.deviantart.com/art/3D-Plugins-Collection-One-138514007?q=gallery%3Aaporev%2F8229210&qo=15 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float xpand = ${variation.params.get(this.PARAM_XPAND)!.toWebGl()};
          float style = ${variation.params.get(this.PARAM_STYLE)!.toWebGl()};
          float fill, exnze, wynze, znxy;
          float smooth = 1.0;
          float smoothStyle = 1.0;
          int useNode = 0;
          int rchoice = iRand8(tex, 8, rngState);
          float lattd = amount * 0.5;
          if (abs(xpand) <= 1.0) {
            fill = xpand * 0.5; 
          } else {
            fill = sqrt(xpand) * 0.5; 
          }
          if (abs(amount) <= 0.5) {
            smooth = amount * 2.0; 
          } else {
            smooth = 1.0;
          }
          if (abs(style) <= 1.0) {
            smoothStyle = style;
          } else {
            if (style > 1.0) {
              smoothStyle = 1.0 + (style - 1.0) * 0.25;
            } else {
              smoothStyle = (style + 1.0) * 0.25 - 1.0;
            }
          }
          exnze = 1.0 - (smoothStyle * (1.0 - (cos(atan2(_tx, _tz)))));
          wynze = 1.0 - (smoothStyle * (1.0 - (sin(atan2(_ty, _tz)))));
          if (smoothStyle > 1.0) {
            znxy = 1.0 - (smoothStyle * (1.0 - ((exnze + wynze) / 2.0 * smoothStyle)));
          } else {
            znxy = 1.0 - (smoothStyle * (1.0 - ((exnze + wynze) / 2.0)));
          }
        
          useNode = rchoice;
          if (useNode == 0) {
            _vx = ((_vx - (smooth * (1.0 - fill) * _vx * exnze)) + (_tx * smooth * fill * exnze)) + lattd;
            _vy = ((_vy - (smooth * (1.0 - fill) * _vy * wynze)) + (_ty * smooth * fill * wynze)) + lattd;
            _vz = ((_vz - (smooth * (1.0 - fill) * _vz * znxy)) + (_tz * smooth * fill * znxy)) + lattd;
          }
          else if (useNode == 1) {
            _vx = ((_vx - (smooth * (1.0 - fill) * _vx * exnze)) + (_tx * smooth * fill * exnze)) + lattd;
            _vy = ((_vy - (smooth * (1.0 - fill) * _vy * wynze)) + (_ty * smooth * fill * wynze)) - lattd;
            _vz = ((_vz - (smooth * (1.0 - fill) * _vz * znxy)) + (_tz * smooth * fill * znxy)) + lattd;
          }
          else if (useNode == 2) {
            _vx = ((_vx - (smooth * (1.0 - fill) * _vx * exnze)) + (_tx * smooth * fill * exnze)) + lattd;
            _vy = ((_vy - (smooth * (1.0 - fill) * _vy * wynze)) + (_ty * smooth * fill * wynze)) + lattd;
            _vz = ((_vz - (smooth * (1.0 - fill) * _vz * znxy)) + (_tz * smooth * fill * znxy)) - lattd;
          }
          else if (useNode == 3) {
            _vx = ((_vx - (smooth * (1.0 - fill) * _vx * exnze)) + (_tx * smooth * fill * exnze)) + lattd;
            _vy = ((_vy - (smooth * (1.0 - fill) * _vy * wynze)) + (_ty * smooth * fill * wynze)) - lattd;
            _vz = ((_vz - (smooth * (1.0 - fill) * _vz * znxy)) + (_tz * smooth * fill * znxy)) - lattd;
          }
          else if (useNode == 4) {
            _vx = ((_vx - (smooth * (1.0 - fill) * _vx * exnze)) + (_tx * smooth * fill * exnze)) - lattd;
            _vy = ((_vy - (smooth * (1.0 - fill) * _vy * wynze)) + (_ty * smooth * fill * wynze)) + lattd;
            _vz = ((_vz - (smooth * (1.0 - fill) * _vz * znxy)) + (_tz * smooth * fill * znxy)) + lattd;
          }
          else if (useNode == 5) {
            _vx = ((_vx - (smooth * (1.0 - fill) * _vx * exnze)) + (_tx * smooth * fill * exnze)) - lattd;
            _vy = ((_vy - (smooth * (1.0 - fill) * _vy * wynze)) + (_ty * smooth * fill * wynze)) - lattd;
            _vz = ((_vz - (smooth * (1.0 - fill) * _vz * znxy)) + (_tz * smooth * fill * znxy)) + lattd;
          }
          else if (useNode == 6) {
            _vx = ((_vx - (smooth * (1.0 - fill) * _vx * exnze)) + (_tx * smooth * fill * exnze)) - lattd;
            _vy = ((_vy - (smooth * (1.0 - fill) * _vy * wynze)) + (_ty * smooth * fill * wynze)) + lattd;
            _vz = ((_vz - (smooth * (1.0 - fill) * _vz * znxy)) + (_tz * smooth * fill * znxy)) - lattd;
          }
          else if (useNode == 7) {
            _vx = ((_vx - (smooth * (1.0 - fill) * _vx * exnze)) + (_tx * smooth * fill * exnze)) - lattd;
            _vy = ((_vy - (smooth * (1.0 - fill) * _vy * wynze)) + (_ty * smooth * fill * wynze)) - lattd;
            _vz = ((_vz - (smooth * (1.0 - fill) * _vz * znxy)) + (_tz * smooth * fill * znxy)) - lattd;
          }
        }`;
    }

    get name(): string {
        return 'cubic3D';
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

class DinisSurfaceWFFunc extends VariationShaderFunc3D {
    PARAM_A = 'a'
    PARAM_B = 'b'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.80 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.20 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Dini's Surface, http://mathworld.wolfram.com/DinisSurface.html  */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float u = _tx;
          float v = _ty;
          float sinv = sin(v);
          if (abs(v) > EPSILON) {
            _vx += amount * a * cos(u) * sinv;
            _vy += amount * a * sin(u) * sinv;
            _vz += -amount * (a * (cos(v) + log(tan(abs(v) / 2.0))) + b * u);
          }
        }`;
    }

    get name(): string {
        return 'dinis_surface_wf';
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

class Ovoid3DFunc extends VariationShaderFunc3D {
    PARAM_XPOW = 'x'
    PARAM_YPOW = 'y'
    PARAM_ZPOW = 'z'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.92 },
            { name: this.PARAM_YPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.92},
            { name: this.PARAM_ZPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.92}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // ovoid3d by Larry Berlin, http://aporev.deviantart.com/gallery/#/d2blmhg
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = ${variation.params.get(this.PARAM_XPOW)!.toWebGl()};
            float y = ${variation.params.get(this.PARAM_YPOW)!.toWebGl()};
            float z = ${variation.params.get(this.PARAM_ZPOW)!.toWebGl()};
            float t = _tx * _tx + _ty * _ty + _tz * _tz + EPSILON;
            float r = amount / t;
            _vx += _tx * r * x;
            _vy += _ty * r * y;
            _vz += _tz * r * z;
        }`;
    }

    get name(): string {
        return 'ovoid3d';
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

class PointGrid3DWFFunc extends VariationShaderFunc3D {
    PARAM_XMIN = 'xmin'
    PARAM_XMAX = 'xmax'
    PARAM_XCOUNT = 'xcount'
    PARAM_YMIN = 'ymin'
    PARAM_YMAX = 'ymax'
    PARAM_YCOUNT = 'ycount'
    PARAM_ZMIN = 'zmin'
    PARAM_ZMAX = 'zmax'
    PARAM_ZCOUNT = 'zcount'
    PARAM_DISTORTION = 'distortion'
    PARAM_SEED = 'seed'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XMIN, type: VariationParamType.VP_NUMBER, initialValue: -3.0 },
            { name: this.PARAM_XMAX, type: VariationParamType.VP_NUMBER, initialValue: 3.0 },
            { name: this.PARAM_XCOUNT, type: VariationParamType.VP_NUMBER, initialValue: 10 },
            { name: this.PARAM_YMIN, type: VariationParamType.VP_NUMBER, initialValue: -3.0 },
            { name: this.PARAM_YMAX, type: VariationParamType.VP_NUMBER, initialValue: 3.0 },
            { name: this.PARAM_YCOUNT, type: VariationParamType.VP_NUMBER, initialValue: 10 },
            { name: this.PARAM_ZMIN, type: VariationParamType.VP_NUMBER, initialValue: -1.0 },
            { name: this.PARAM_ZMAX, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_ZCOUNT, type: VariationParamType.VP_NUMBER, initialValue: 10 },
            { name: this.PARAM_DISTORTION, type: VariationParamType.VP_NUMBER, initialValue: 2.3 },
            { name: this.PARAM_SEED, type: VariationParamType.VP_NUMBER, initialValue: 1234 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // pointgrid3d_wf by Andreas Maschke
        return `{
          float amount = ${variation.amount.toWebGl()};
          float xmin = ${variation.params.get(this.PARAM_XMIN)!.toWebGl()};
          float xmax = ${variation.params.get(this.PARAM_XMAX)!.toWebGl()};
          int xcount = ${variation.params.get(this.PARAM_XCOUNT)!.toWebGl()};
          float ymin = ${variation.params.get(this.PARAM_YMIN)!.toWebGl()};
          float ymax = ${variation.params.get(this.PARAM_YMAX)!.toWebGl()};
          int ycount = ${variation.params.get(this.PARAM_YCOUNT)!.toWebGl()};
          float zmin = ${variation.params.get(this.PARAM_ZMIN)!.toWebGl()};
          float zmax = ${variation.params.get(this.PARAM_ZMAX)!.toWebGl()};
          int zcount = ${variation.params.get(this.PARAM_ZCOUNT)!.toWebGl()};
          float distortion = ${variation.params.get(this.PARAM_DISTORTION)!.toWebGl()};
          int seed = ${variation.params.get(this.PARAM_SEED)!.toWebGl()};
          int xIdx = iRand8(tex, xcount, rngState);
          int yIdx = iRand8(tex, ycount, rngState);
          int zIdx = iRand8(tex, ycount, rngState);
          float _dx = (xmax - xmin) / float(xcount);
          float _dy = (ymax - ymin) / float(ycount);
          float _dz = (zmax - zmin) / float(zcount);
          float x = xmin + _dx * float(xIdx);
          float y = ymin + _dy * float(yIdx);
          float z = zmin + _dz * float(zIdx);
          if (distortion > 0.0) {
            RNGState lRngState = RNGState(float(0.137));
            vec2 ltex = vec2(float(xIdx*yIdx+zIdx), float(xIdx+yIdx*zIdx));
            float distx = (0.5 - rand8(ltex, lRngState)) * distortion;
            float disty = (0.5 - rand8(ltex, lRngState)) * distortion;
            float distz = (0.5 - rand8(ltex, lRngState)) * distortion;
            x += distx;
            y += disty;
            z += distz;
          }
          _vx += x * amount;
          _vy += y * amount;
          _vz += z * amount;
        }`;
    }

    get name(): string {
        return 'pointgrid3d_wf';
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

class PostMirrorWFFunc extends VariationShaderFunc3D {
    PARAM_XAXIS = 'xaxis'
    PARAM_YAXIS = 'yaxis'
    PARAM_ZAXIS = 'zaxis'
    PARAM_XSHIFT = 'xshift'
    PARAM_YSHIFT = 'yshift'
    PARAM_ZSHIFT = 'zshift'
    PARAM_XSCALE = 'xscale'
    PARAM_YSCALE = 'yscale'
    PARAM_XCOLORSHIFT = 'xcolorshift'
    PARAM_YCOLORSHIFT = 'ycolorshift'
    PARAM_ZCOLORSHIFT = 'zcolorshift'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XAXIS, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_YAXIS, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_ZAXIS, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_XSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_YSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_ZSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_XSCALE, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_YSCALE, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_XCOLORSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_YCOLORSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_ZCOLORSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int xaxis = ${variation.params.get(this.PARAM_XAXIS)!.toWebGl()};
          int yaxis = ${variation.params.get(this.PARAM_YAXIS)!.toWebGl()};
          int zaxis = ${variation.params.get(this.PARAM_ZAXIS)!.toWebGl()};
          float xshift = ${variation.params.get(this.PARAM_XSHIFT)!.toWebGl()};
          float yshift = ${variation.params.get(this.PARAM_YSHIFT)!.toWebGl()};
          float zshift = ${variation.params.get(this.PARAM_ZSHIFT)!.toWebGl()};
          float xscale = ${variation.params.get(this.PARAM_XSCALE)!.toWebGl()};
          float yscale = ${variation.params.get(this.PARAM_YSCALE)!.toWebGl()};
          float xcolorshift = ${variation.params.get(this.PARAM_XCOLORSHIFT)!.toWebGl()};
          float ycolorshift = ${variation.params.get(this.PARAM_YCOLORSHIFT)!.toWebGl()};
          float zcolorshift = ${variation.params.get(this.PARAM_ZCOLORSHIFT)!.toWebGl()};
          if(abs(amount)>EPSILON) {
            if (xaxis > 0 && rand8(tex, rngState) < 0.5) {
              _vx = xscale * (-_vx - xshift);
              _vy = yscale * _vy;
              _color = mod(_color + xcolorshift, 1.0);
            }
            if (yaxis > 0 && rand8(tex, rngState) < 0.5) {
              _vx = xscale * _vx;
              _vy = yscale * (-_vy - yshift);
              _color = mod(_color + ycolorshift, 1.0);
            }
            if (zaxis > 0 && rand8(tex, rngState) < 0.5) {
              _vz = -_vz - zshift;
              _color = mod(_color + zcolorshift, 1.0);
            }
          }
        }`;
    }

    get name(): string {
        return 'post_mirror_wf';
    }

    get priority(): number {
        return 1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_DC, VariationTypes.VARTYPE_POST];
    }
}

class QuaternionFunc extends VariationShaderFunc3D {
    PARAM_COSQPOW = 'cosqpow'
    PARAM_COSQX1 = 'cosqx1'
    PARAM_COSQX2 = 'cosqx2'
    PARAM_COSQY1 = 'cosqy1'
    PARAM_COSQY2 = 'cosqy2'
    PARAM_COSQZ1 = 'cosqz1'
    PARAM_COSQZ2 = 'cosqz2'

    PARAM_COSHQPOW = 'coshqpow'
    PARAM_COSHQX1 = 'coshqx1'
    PARAM_COSHQX2 = 'coshqx2'
    PARAM_COSHQY1 = 'coshqy1'
    PARAM_COSHQY2 = 'coshqy2'
    PARAM_COSHQZ1 = 'coshqz1'
    PARAM_COSHQZ2 = 'coshqz2'

    PARAM_COTQPOW = 'cotqpow'
    PARAM_COTQX1 = 'cotqx1'
    PARAM_COTQX2 = 'cotqx2'
    PARAM_COTQY1 = 'cotqy1'
    PARAM_COTQY2 = 'cotqy2'
    PARAM_COTQZ1 = 'cotqz1'
    PARAM_COTQZ2 = 'cotqz2'

    PARAM_COTHQPOW = 'cothqpow'
    PARAM_COTHQX1 = 'cothqx1'
    PARAM_COTHQX2 = 'cothqx2'
    PARAM_COTHQY1 = 'cothqy1'
    PARAM_COTHQY2 = 'cothqy2'
    PARAM_COTHQZ1 = 'cothqz1'
    PARAM_COTHQZ2 = 'cothqz2'

    PARAM_CSCQPOW = 'cscqpow'
    PARAM_CSCQX1 = 'cscqx1'
    PARAM_CSCQX2 = 'cscqx2'
    PARAM_CSCQY1 = 'cscqy1'
    PARAM_CSCQY2 = 'cscqy2'
    PARAM_CSCQZ1 = 'cscqz1'
    PARAM_CSCQZ2 = 'cscqz2'

    PARAM_CSCHQPOW = 'cschqpow'
    PARAM_CSCHQX1 = 'cschqx1'
    PARAM_CSCHQX2 = 'cschqx2'
    PARAM_CSCHQY1 = 'cschqy1'
    PARAM_CSCHQY2 = 'cschqy2'
    PARAM_CSCHQZ1 = 'cschqz1'
    PARAM_CSCHQZ2 = 'cschqz2'

    PARAM_ESTIQPOW = 'estiqpow'
    PARAM_ESTIQX1 = 'estiqx1'
    PARAM_ESTIQY1 = 'estiqy1'
    PARAM_ESTIQY2 = 'estiqy2'
    PARAM_ESTIQZ1 = 'estiqz1'
    PARAM_ESTIQZ2 = 'estiqz2'

    PARAM_LOGQPOW = 'logqpow'
    PARAM_LOGQBASE = 'logqbase'

    PARAM_SECQPOW = 'secqpow'
    PARAM_SECQX1 = 'secqx1'
    PARAM_SECQX2 = 'secqx2'
    PARAM_SECQY1 = 'secqy1'
    PARAM_SECQY2 = 'secqy2'
    PARAM_SECQZ1 = 'secqz1'
    PARAM_SECQZ2 = 'secqz2'

    PARAM_SECHQPOW = 'sechqpow'
    PARAM_SECHQX1 = 'sechqx1'
    PARAM_SECHQX2 = 'sechqx2'
    PARAM_SECHQY1 = 'sechqy1'
    PARAM_SECHQY2 = 'sechqy2'
    PARAM_SECHQZ1 = 'sechqz1'
    PARAM_SECHQZ2 = 'sechqz2'

    PARAM_SINQPOW = 'sinqpow'
    PARAM_SINQX1 = 'sinqx1'
    PARAM_SINQX2 = 'sinqx2'
    PARAM_SINQY1 = 'sinqy1'
    PARAM_SINQY2 = 'sinqy2'
    PARAM_SINQZ1 = 'sinqz1'
    PARAM_SINQZ2 = 'sinqz2'

    PARAM_SINHQPOW = 'sinhqpow'
    PARAM_SINHQX1 = 'sinhqx1'
    PARAM_SINHQX2 = 'sinhqx2'
    PARAM_SINHQY1 = 'sinhqy1'
    PARAM_SINHQY2 = 'sinhqy2'
    PARAM_SINHQZ1 = 'sinhqz1'
    PARAM_SINHQZ2 = 'sinhqz2'

    PARAM_TANQPOW = 'tanqpow'
    PARAM_TANQX1 = 'tanqx1'
    PARAM_TANQX2 = 'tanqx2'
    PARAM_TANQY1 = 'tanqy1'
    PARAM_TANQY2 = 'tanqy2'
    PARAM_TANQZ1 = 'tanqz1'
    PARAM_TANQZ2 = 'tanqz2'

    PARAM_TANHQPOW = 'tanhqpow'
    PARAM_TANHQX1 = 'tanhqx1'
    PARAM_TANHQX2 = 'tanhqx2'
    PARAM_TANHQY1 = 'tanhqy1'
    PARAM_TANHQY2 = 'tanhqy2'
    PARAM_TANHQZ1 = 'tanhqz1'
    PARAM_TANHQZ2 = 'tanhqz2'

    M_E = 2.7182818284590452354;

    get params(): VariationParam[] {
        return [{ name: this.PARAM_COSQPOW, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_COSHQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_COSHQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSHQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSHQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSHQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSHQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COSHQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_COTQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_COTQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_COTHQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_COTHQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTHQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTHQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTHQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTHQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COTHQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_CSCQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CSCQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_CSCHQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CSCHQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCHQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCHQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCHQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCHQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSCHQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_ESTIQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_ESTIQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_ESTIQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_ESTIQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_ESTIQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_ESTIQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_LOGQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_LOGQBASE, type: VariationParamType.VP_NUMBER, initialValue: this.M_E },

            { name: this.PARAM_SECQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_SECQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_SECHQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_SECHQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECHQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECHQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECHQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECHQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SECHQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_SINQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_SINQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_SINHQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_SINHQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINHQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINHQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINHQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINHQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SINHQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_TANQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_TANQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },

            { name: this.PARAM_TANHQPOW, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_TANHQX1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANHQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANHQY1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANHQY2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANHQZ1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TANHQZ2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /*
         * Quaternion vars by zephyrtronium
         * http://zephyrtronium.deviantart.com/art
         * /Quaternion-Apo-Plugin-Pack-165451482
         */
        /* Variables and combination by Brad Stefanov */
        return `{
          float amount = ${variation.amount.toWebGl()};
          
          float cosqpow = ${variation.params.get(this.PARAM_COSQPOW)!.toWebGl()};
          float cosqx1 = ${variation.params.get(this.PARAM_COSQX1)!.toWebGl()};
          float cosqx2 = ${variation.params.get(this.PARAM_COSQX2)!.toWebGl()};
          float cosqy1 = ${variation.params.get(this.PARAM_COSQY1)!.toWebGl()};
          float cosqy2 = ${variation.params.get(this.PARAM_COSQY2)!.toWebGl()};
          float cosqz1 = ${variation.params.get(this.PARAM_COSQZ1)!.toWebGl()};
          float cosqz2 = ${variation.params.get(this.PARAM_COSQZ2)!.toWebGl()};

          float coshqpow = ${variation.params.get(this.PARAM_COSHQPOW)!.toWebGl()};
          float coshqx1 = ${variation.params.get(this.PARAM_COSHQX1)!.toWebGl()};
          float coshqx2 = ${variation.params.get(this.PARAM_COSHQX2)!.toWebGl()};
          float coshqy1 = ${variation.params.get(this.PARAM_COSHQY1)!.toWebGl()};
          float coshqy2 = ${variation.params.get(this.PARAM_COSHQY2)!.toWebGl()};
          float coshqz1 = ${variation.params.get(this.PARAM_COSHQZ1)!.toWebGl()};
          float coshqz2 = ${variation.params.get(this.PARAM_COSHQZ2)!.toWebGl()};
          
          float cotqpow = ${variation.params.get(this.PARAM_COTQPOW)!.toWebGl()};
          float cotqx1 = ${variation.params.get(this.PARAM_COTQX1)!.toWebGl()};
          float cotqx2 = ${variation.params.get(this.PARAM_COTQX2)!.toWebGl()};
          float cotqy1 = ${variation.params.get(this.PARAM_COTQY1)!.toWebGl()};
          float cotqy2 = ${variation.params.get(this.PARAM_COTQY2)!.toWebGl()};
          float cotqz1 = ${variation.params.get(this.PARAM_COTQZ1)!.toWebGl()};
          float cotqz2 = ${variation.params.get(this.PARAM_COTQZ2)!.toWebGl()};

          float cothqpow = ${variation.params.get(this.PARAM_COTHQPOW)!.toWebGl()};
          float cothqx1 = ${variation.params.get(this.PARAM_COTHQX1)!.toWebGl()};
          float cothqx2 = ${variation.params.get(this.PARAM_COTHQX2)!.toWebGl()};
          float cothqy1 = ${variation.params.get(this.PARAM_COTHQY1)!.toWebGl()};
          float cothqy2 = ${variation.params.get(this.PARAM_COTHQY2)!.toWebGl()};
          float cothqz1 = ${variation.params.get(this.PARAM_COTHQZ1)!.toWebGl()};
          float cothqz2 = ${variation.params.get(this.PARAM_COTHQZ2)!.toWebGl()};
          
          float cscqpow = ${variation.params.get(this.PARAM_CSCQPOW)!.toWebGl()};
          float cscqx1 = ${variation.params.get(this.PARAM_CSCQX1)!.toWebGl()};
          float cscqx2 = ${variation.params.get(this.PARAM_CSCQX2)!.toWebGl()};
          float cscqy1 = ${variation.params.get(this.PARAM_CSCQY1)!.toWebGl()};
          float cscqy2 = ${variation.params.get(this.PARAM_CSCQY2)!.toWebGl()};
          float cscqz1 = ${variation.params.get(this.PARAM_CSCQZ1)!.toWebGl()};
          float cscqz2 = ${variation.params.get(this.PARAM_CSCQZ2)!.toWebGl()};
          
          float cschqpow = ${variation.params.get(this.PARAM_CSCHQPOW)!.toWebGl()};
          float cschqx1 = ${variation.params.get(this.PARAM_CSCHQX1)!.toWebGl()};
          float cschqx2 = ${variation.params.get(this.PARAM_CSCHQX2)!.toWebGl()};
          float cschqy1 = ${variation.params.get(this.PARAM_CSCHQY1)!.toWebGl()};
          float cschqy2 = ${variation.params.get(this.PARAM_CSCHQY2)!.toWebGl()};
          float cschqz1 = ${variation.params.get(this.PARAM_CSCHQZ1)!.toWebGl()};
          float cschqz2 = ${variation.params.get(this.PARAM_CSCHQZ2)!.toWebGl()};
          
          float estiqpow = ${variation.params.get(this.PARAM_ESTIQPOW)!.toWebGl()};
          float estiqx1 = ${variation.params.get(this.PARAM_ESTIQX1)!.toWebGl()};
          float estiqy1 = ${variation.params.get(this.PARAM_ESTIQY1)!.toWebGl()};
          float estiqy2 = ${variation.params.get(this.PARAM_ESTIQY2)!.toWebGl()};
          float estiqz1 = ${variation.params.get(this.PARAM_ESTIQZ1)!.toWebGl()};
          float estiqz2 = ${variation.params.get(this.PARAM_ESTIQZ2)!.toWebGl()};                    
                    
          float logqpow = ${variation.params.get(this.PARAM_LOGQPOW)!.toWebGl()};
          float logqbase = ${variation.params.get(this.PARAM_LOGQBASE)!.toWebGl()};
          
          float secqpow = ${variation.params.get(this.PARAM_SECQPOW)!.toWebGl()};
          float secqx1 = ${variation.params.get(this.PARAM_SECQX1)!.toWebGl()};
          float secqx2 = ${variation.params.get(this.PARAM_SECQX2)!.toWebGl()};
          float secqy1 = ${variation.params.get(this.PARAM_SECQY1)!.toWebGl()};
          float secqy2 = ${variation.params.get(this.PARAM_SECQY2)!.toWebGl()};
          float secqz1 = ${variation.params.get(this.PARAM_SECQZ1)!.toWebGl()};
          float secqz2 = ${variation.params.get(this.PARAM_SECQZ2)!.toWebGl()};
          
          float sechqpow = ${variation.params.get(this.PARAM_SECHQPOW)!.toWebGl()};
          float sechqx1 = ${variation.params.get(this.PARAM_SECHQX1)!.toWebGl()};
          float sechqx2 = ${variation.params.get(this.PARAM_SECHQX2)!.toWebGl()};
          float sechqy1 = ${variation.params.get(this.PARAM_SECHQY1)!.toWebGl()};
          float sechqy2 = ${variation.params.get(this.PARAM_SECHQY2)!.toWebGl()};
          float sechqz1 = ${variation.params.get(this.PARAM_SECHQZ1)!.toWebGl()};
          float sechqz2 = ${variation.params.get(this.PARAM_SECHQZ2)!.toWebGl()};
         
          float sinqpow = ${variation.params.get(this.PARAM_SINQPOW)!.toWebGl()};
          float sinqx1 = ${variation.params.get(this.PARAM_SINQX1)!.toWebGl()};
          float sinqx2 = ${variation.params.get(this.PARAM_SINQX2)!.toWebGl()};
          float sinqy1 = ${variation.params.get(this.PARAM_SINQY1)!.toWebGl()};
          float sinqy2 = ${variation.params.get(this.PARAM_SINQY2)!.toWebGl()};
          float sinqz1 = ${variation.params.get(this.PARAM_SINQZ1)!.toWebGl()};
          float sinqz2 = ${variation.params.get(this.PARAM_SINQZ2)!.toWebGl()};

          float sinhqpow = ${variation.params.get(this.PARAM_SINHQPOW)!.toWebGl()};
          float sinhqx1 = ${variation.params.get(this.PARAM_SINHQX1)!.toWebGl()};
          float sinhqx2 = ${variation.params.get(this.PARAM_SINHQX2)!.toWebGl()};
          float sinhqy1 = ${variation.params.get(this.PARAM_SINHQY1)!.toWebGl()};
          float sinhqy2 = ${variation.params.get(this.PARAM_SINHQY2)!.toWebGl()};
          float sinhqz1 = ${variation.params.get(this.PARAM_SINHQZ1)!.toWebGl()};
          float sinhqz2 = ${variation.params.get(this.PARAM_SINHQZ2)!.toWebGl()};

          float tanqpow = ${variation.params.get(this.PARAM_TANQPOW)!.toWebGl()};
          float tanqx1 = ${variation.params.get(this.PARAM_TANQX1)!.toWebGl()};
          float tanqx2 = ${variation.params.get(this.PARAM_TANQX2)!.toWebGl()};
          float tanqy1 = ${variation.params.get(this.PARAM_TANQY1)!.toWebGl()};
          float tanqy2 = ${variation.params.get(this.PARAM_TANQY2)!.toWebGl()};
          float tanqz1 = ${variation.params.get(this.PARAM_TANQZ1)!.toWebGl()};
          float tanqz2 = ${variation.params.get(this.PARAM_TANQZ2)!.toWebGl()};

          float tanhqpow = ${variation.params.get(this.PARAM_TANHQPOW)!.toWebGl()};
          float tanhqx1 = ${variation.params.get(this.PARAM_TANHQX1)!.toWebGl()};
          float tanhqx2 = ${variation.params.get(this.PARAM_TANHQX2)!.toWebGl()};
          float tanhqy1 = ${variation.params.get(this.PARAM_TANHQY1)!.toWebGl()};
          float tanhqy2 = ${variation.params.get(this.PARAM_TANHQY2)!.toWebGl()};
          float tanhqz1 = ${variation.params.get(this.PARAM_TANHQZ1)!.toWebGl()};
          float tanhqz2 = ${variation.params.get(this.PARAM_TANHQZ2)!.toWebGl()};

          float x = 0.0, y = 0.0, z = 0.0;
          if (cosqpow != 0.0) {
            float cosqabs_v = hypot(_ty, _tz) * cosqz1;
            float cosqs = sin(_tx * cosqx1);
            float cosqc = cos(_tx * cosqx2);
            float cosqsh = sinh(cosqabs_v * cosqy1);
            float cosqch = cosh(cosqabs_v * cosqy2);
            float cosqC = amount * cosqs * cosqsh / cosqabs_v * cosqz2;
            x += cosqpow * amount * cosqc * cosqch;
            y += cosqpow * cosqC * _ty;
            z += cosqpow * cosqC * _tz;
          }
          if (coshqpow != 0.0) {
            float coshqabs_v = hypot(_ty, _tz) * coshqz1;
            float coshqs = sin(coshqabs_v * coshqy1);
            float coshqc = cos(coshqabs_v * coshqy2);
            float coshqsh = sinh(_tx * coshqx1);
            float coshqch = cosh(_tx * coshqx2);
            float coshqC = amount * coshqsh * coshqs / coshqabs_v * coshqz2;
            x += coshqpow * amount * coshqch * coshqc;
            y += coshqpow * coshqC * _ty;
            z += coshqpow * coshqC * _tz;
          }
          if (cotqpow != 0.0) {
            float cotqabs_v = hypot(_ty, _tz) * cotqz1;
            float cotqs = sin(_tx * cotqx1);
            float cotqc = cos(_tx * cotqx2);
            float cotqsh = sinh(cotqabs_v * cotqy1);
            float cotqch = cosh(cotqabs_v * cotqy2);
            float cotqsysz = sqr(_ty) + sqr(_tz);
            float cotqni = amount / (sqr(_tx) + cotqsysz);
            float cotqC = cotqc * cotqsh / cotqabs_v * cotqz2;
            float cotqB = -cotqs * cotqsh / cotqabs_v;
            float cotqstcv = cotqs * cotqch;
            float cotqnstcv = -cotqstcv;
            float cotqctcv = cotqc * cotqch;
            x += cotqpow * (cotqstcv * cotqctcv + cotqC * cotqB * cotqsysz) * cotqni;
            y -= cotqpow * (cotqnstcv * cotqB * _ty + cotqC * _ty * cotqctcv) * cotqni;
            z -= cotqpow * (cotqnstcv * cotqB * _tz + cotqC * _tz * cotqctcv) * cotqni;
          }
          if (cothqpow != 0.0) {
            float cothqabs_v = hypot(_ty, _tz) * cothqz1;
            float cothqs = sin(cothqabs_v * cothqy1);
            float cothqc = cos(cothqabs_v * cothqy2);
            float cothqsh = sinh(_tx * cothqx1);
            float cothqch = cosh(_tx * cothqx2);
            float cothqsysz = sqr(_ty) + sqr(_tz);
            float cothqni = amount / (sqr(_tx) + cothqsysz);
            float cothqC = cothqch * cothqs / cothqabs_v * cothqz2;
            float cothqB = cothqsh * cothqs / cothqabs_v;
            float cothqstcv = cothqsh * cothqc;
            float cothqnstcv = -cothqstcv;
            float cothqctcv = cothqch * cothqc;
            x += cothqpow * (cothqstcv * cothqctcv + cothqC * cothqB * cothqsysz) * cothqni;
            y += cothqpow * (cothqnstcv * cothqB * _ty + cothqC * _ty * cothqctcv) * cothqni;
            z += cothqpow * (cothqnstcv * cothqB * _tz + cothqC * _tz * cothqctcv) * cothqni;
          }
          if (cscqpow != 0.0) {
            float cscqabs_v = hypot(_ty, _tz) * cscqz1;
            float cscqs = sin(_tx * cscqx1);
            float cscqc = cos(_tx * cscqx2);
            float cscqsh = sinh(cscqabs_v * cscqy1);
            float cscqch = cosh(cscqabs_v * cscqy2);
            float cscqni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
            float cscqC = cscqni * cscqc * cscqsh / cscqabs_v * cscqz2;
            x += cscqpow * cscqs * cscqch * cscqni;
            y -= cscqpow * cscqC * _ty;
            z -= cscqpow * cscqC * _tz;
          }
          if (cschqpow != 0.0) {
            float cschqabs_v = hypot(_ty, _tz) * cschqz1;
            float cschqs = sin(cschqabs_v * cschqy1);
            float cschqc = cos(cschqabs_v * cschqy2);
            float cschqsh = sinh(_tx * cschqx1);
            float cschqch = cosh(_tx * cschqx2);
            float cschqni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
            float cschqC = cschqni * cschqch * cschqs / cschqabs_v * cschqz2;
            x += cschqpow * cschqsh * cschqc * cschqni;
            y -= cschqpow * cschqC * _ty;
            z -= cschqpow * cschqC * _tz;
          }
          if (estiqpow != 0.0) {
            float estiqe = exp(_tx * estiqx1);
            float estiqabs_v = hypot(_ty, _tz) * estiqz1;
            float estiqs = sin(estiqabs_v * estiqy1);
            float estiqc = cos(estiqabs_v * estiqy2);
            float estiqa = estiqe * estiqs / estiqabs_v * estiqz2;
            x += estiqpow * amount * estiqe * estiqc;
            y += estiqpow * amount * estiqa * _ty;
            z += estiqpow * amount * estiqa * _tz;
          }
          if (logqpow != 0.0) {
            float denom = 0.5 * amount / log(logqbase);
            float logqabs_v = hypot(_ty, _tz);
            float logqC = amount * atan2(logqabs_v, _tx) / logqabs_v;
            x += logqpow * log(sqr(_tx) + sqr(logqabs_v)) * denom;
            y += logqpow * logqC * _ty;
            z += logqpow * logqC * _tz;
          }
          if (secqpow != 0.0) {
            float secqabs_v = hypot(_ty, _tz) * secqz1;
            float secqs = sin(-_tx * secqx1);
            float secqc = cos(-_tx * secqx2);
            float secqsh = sinh(secqabs_v * secqy1);
            float secqch = cosh(secqabs_v * secqy2);
            float secqni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
            float secqC = secqni * secqs * secqsh / secqabs_v * secqz2;
            x += secqpow * secqc * secqch * secqni;
            y -= secqpow * secqC * _ty;
            z -= secqpow * secqC * _tz;
          }
          if (sechqpow != 0.0) {
            float sechqabs_v = hypot(_ty, _tz) * sechqz1;
            float sechqs = sin(sechqabs_v * sechqy1);
            float sechqc = cos(sechqabs_v * sechqy2);
            float sechqsh = sinh(_tx * sechqx1);
            float sechqch = cosh(_tx * sechqx2);
            float sechqni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
            float sechqC = sechqni * sechqsh * sechqs / sechqabs_v * sechqz2;
            x += sechqpow * sechqch * sechqc * sechqni;
            y -= sechqpow * sechqC * _ty;
            z -= sechqpow * sechqC * _tz;
          }
          if (tanqpow != 0.0) {
            float tanqabs_v = hypot(_ty, _tz) * tanqz1;
            float tanqs = sin(_tx * tanqx1);
            float tanqc = cos(_tx * tanqx2);
            float tanqsh = sinh(tanqabs_v * tanqy1);
            float tanqch = cosh(tanqabs_v * tanqy2);
            float tanqsysz = sqr(_ty) + sqr(_tz);
            float tanqni = amount / (sqr(_tx) + tanqsysz);
            float tanqC = tanqc * tanqsh / tanqabs_v * tanqz2;
            float tanqB = -tanqs * tanqsh / tanqabs_v;
            float tanqstcv = tanqs * tanqch;
            float tanqnstcv = -tanqstcv;
            float tanqctcv = tanqc * tanqch;
            x += tanqpow * (tanqstcv * tanqctcv + tanqC * tanqB * tanqsysz) * tanqni;
            y += tanqpow * (tanqnstcv * tanqB * _ty + tanqC * _ty * tanqctcv) * tanqni;
            z += tanqpow * (tanqnstcv * tanqB * _tz + tanqC * _tz * tanqctcv) * tanqni;
          }
          if (tanhqpow != 0.0) {
            float tanhqabs_v = hypot(_ty, _tz) * tanhqz1;
            float tanhqs = sin(tanhqabs_v * tanhqy1);
            float tanhqc = cos(tanhqabs_v * tanhqy2);
            float tanhqsh = sinh(_tx * tanhqx1);
            float tanhqch = cosh(_tx * tanhqx2);
            float tanhqsysz = sqr(_ty) + sqr(_tz);
            float tanhqni = amount / (sqr(_tx) + tanhqsysz);
            float tanhqC = tanhqch * tanhqs / tanhqabs_v * tanhqz2;
            float tanhqB = tanhqsh * tanhqs / tanhqabs_v;
            float tanhqstcv = tanhqsh * tanhqc;
            float tanhqnstcv = -tanhqstcv;
            float tanhqctcv = tanhqc * tanhqch;
            x += tanhqpow * (tanhqstcv * tanhqctcv + tanhqC * tanhqB * tanhqsysz) * tanhqni;
            y += tanhqpow * (tanhqnstcv * tanhqB * _ty + tanhqC * _ty * tanhqctcv) * tanhqni;
            z += tanhqpow * (tanhqnstcv * tanhqB * _tz + tanhqC * _tz * tanhqctcv) * tanhqni;
          }
          if (sinqpow != 0.0) {
            float sinqabs_v = hypot(_ty, _tz) * sinqz1;
            float sinqs = sin(_tx * sinqx1);
            float sinqc = cos(_tx * sinqx2);
            float sinqsh = sinh(sinqabs_v * sinqy1);
            float sinqch = cosh(sinqabs_v * sinqy2);
            float sinqC = amount * sinqc * sinqsh / sinqabs_v * sinqz2;
            x += sinqpow * amount * sinqs * sinqch;
            y += sinqpow * sinqC * _ty;
            z += sinqpow * sinqC * _tz;
          }
          if (sinhqpow != 0.0) {
            float sinhqabs_v = hypot(_ty, _tz) * sinhqz1;
            float sinhqs = sin(sinhqabs_v * sinhqy1);
            float sinhqc = cos(sinhqabs_v * sinhqy2);
            float sinhqsh = sinh(_tx * sinhqx1);
            float sinhqch = cosh(_tx * sinhqx2);
            float sinhqC = amount * sinhqch * sinhqs / sinhqabs_v * sinhqz2;
            x += sinhqpow * amount * sinhqsh * sinhqc;
            y += sinhqpow * sinhqC * _ty;
            z += sinhqpow * sinhqC * _tz;
          }
          _vx += x;
          _vy += y;
          _vz += z;
        }`;
    }

    get name(): string {
        return 'quaternion';
    }

    get funcDependencies(): string[] {
        return [FUNC_HYPOT, FUNC_COSH, FUNC_SINH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class SeaShell3DFunc extends VariationShaderFunc3D {
    PARAM_FINAL_RADIUS = 'final_radius'
    PARAM_HEIGHT = 'height'
    PARAM_INNER_RADIUS = 'inner_radius'
    PARAM_N_SPIRALS = 'nSpirals'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FINAL_RADIUS, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_HEIGHT, type: VariationParamType.VP_NUMBER, initialValue: 3.5 },
            { name: this.PARAM_INNER_RADIUS, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
            { name: this.PARAM_N_SPIRALS, type: VariationParamType.VP_NUMBER, initialValue: 3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Sea Shell
         * Reference
         * http://paulbourke.net/geometry/shell/
         * parameters
         * n: number of Spirals
         * a: final Shell Radius
         * b: height
         * c: inner shell radius
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float final_radius = ${variation.params.get(this.PARAM_FINAL_RADIUS)!.toWebGl()};
          float height = ${variation.params.get(this.PARAM_HEIGHT)!.toWebGl()};
          float inner_radius = ${variation.params.get(this.PARAM_INNER_RADIUS)!.toWebGl()};
          int nSpirals = ${variation.params.get(this.PARAM_N_SPIRALS)!.toWebGl()};    
          float t;
          float s;
          t = (2.0*M_PI) * rand8(tex, rngState);
          s = (2.0*M_PI) * rand8(tex, rngState);
          float x = final_radius * (1.0 - t / (2.0*M_PI)) * cos(float(nSpirals) * t) * (1.0 + cos(s)) + inner_radius * cos(float(nSpirals) * t);
          float y = final_radius * (1.0 - t / (2.0*M_PI)) * sin(float(nSpirals) * t) * (1.0 + cos(s)) + inner_radius * sin(float(nSpirals) * t);
          float z = height * t / (2.0*M_PI) + final_radius * (1.0 - t / (2.0*M_PI)) * sin(s);
          _vx += x * amount;
          _vy += y * amount;
          _vz += z * amount;
        }`;
    }

    get name(): string {
        return 'seashell3D';
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

class Sph3DFunc extends VariationShaderFunc3D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_Z = 'z'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.75 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0},
            { name: this.PARAM_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.5}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* sph3D by xyrus02, http://xyrus-02.deviantart.com/art/sph3D-Plugin-for-Apophysis-476688377 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
            float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
            float z = ${variation.params.get(this.PARAM_Z)!.toWebGl()};
            float tx = _tx;
            float ty = _ty;
            float tz = _tz;
        
            float xx = x * tx;
            float yy = y * ty;
            float zz = x * tz;
        
            float r = amount / (xx * xx + yy * yy + zz * zz + EPSILON);
        
            _vx += tx * r;
            _vy += ty * r;
            _vz += tz * r;
        }`;
    }

    get name(): string {
        return 'sph3D';
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

class Spirograph3DFunc extends VariationShaderFunc3D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_TMIN = 'tmin'
    PARAM_TMAX = 'tmax'
    PARAM_WIDTH = 'width'
    PARAM_MODE = 'mode'
    PARAM_DIRECT_COLOR = 'direct_color'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: -0.3 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
            { name: this.PARAM_TMIN, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_TMAX, type: VariationParamType.VP_NUMBER, initialValue: 1000.0 },
            { name: this.PARAM_WIDTH, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_MODE, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_NUMBER, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // based on 'affine3D' of Flamelet
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float tmin = ${variation.params.get(this.PARAM_TMIN)!.toWebGl()};
          float tmax = ${variation.params.get(this.PARAM_TMAX)!.toWebGl()};
          float width = ${variation.params.get(this.PARAM_WIDTH)!.toWebGl()};
          int mode = ${variation.params.get(this.PARAM_MODE)!.toWebGl()};
          int direct_color = ${variation.params.get(this.PARAM_DIRECT_COLOR)!.toWebGl()};
          float t = (tmax - tmin) * rand8(tex, rngState) + tmin;
          float w1, w2, w3;
          if(mode==0) {
            w1 = w2 = w3 = width * rand8(tex, rngState) - width / 2.0;
          }
          else if(mode==1) {
            w1 = width * rand8(tex, rngState) - width / 2.0;
            w2 = w1 * sin(36.0 * t + (2.0 * M_PI) / 3.0);
            w3 = w1 * sin(36.0 * t + 2.0 * (2.0 * M_PI) / 3.0);
            w1 = w1 * sin(36.0 * t);
          }
          else if(mode==2) {
            w1 = width * rand8(tex, rngState) - width / 2.0;
            w2 = width * rand8(tex, rngState) - width / 2.0;
            w3 = width * rand8(tex, rngState) - width / 2.0;
          }
          else if(mode==3) {
            w1 = width * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0) / 2.0;
            w2 = width * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0) / 2.0;
            w3 = width * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0) / 2.0;
          }
          else if(mode==4) {
            w1 = (rand8(tex, rngState) < 0.5) ? width : -width;
            w2 = w3 = 0.0;
          }
          else {
            w1 = w2 = w3 = 0.0;
          }
          float x1 = (a + b) * cos(t) - c * cos((a + b) / b * t);
          float y1 = (a + b) * sin(t) - c * sin((a + b) / b * t);
          float z1 = c * sin((a + b) / b * t);
          _vx += amount * (x1 + w1);
          _vy += amount * (y1 + w2);
          _vz += amount * (z1 + w3);
          if (direct_color != 0) {
            _color = mod(t / (2.0*M_PI), 1.0);
          }
        }`;
    }

    get name(): string {
        return 'spirograph3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_DC];
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
    VariationShaders.registerVar(new Cubic_3DFunc())
    VariationShaders.registerVar(new Curl3DFunc())
    VariationShaders.registerVar(new CylinderApoFunc())
    VariationShaders.registerVar(new DinisSurfaceWFFunc())
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
    VariationShaders.registerVar(new Ovoid3DFunc())
    VariationShaders.registerVar(new PDJ3DFunc())
    VariationShaders.registerVar(new Pie3DFunc())
    VariationShaders.registerVar(new Poincare3DFunc())
    VariationShaders.registerVar(new PointGrid3DWFFunc())
    VariationShaders.registerVar(new Popcorn2_3DFunc())
    VariationShaders.registerVar(new PostMirrorWFFunc())
    VariationShaders.registerVar(new QuaternionFunc())
    VariationShaders.registerVar(new SeaShell3DFunc())
    VariationShaders.registerVar(new SecqFunc())
    VariationShaders.registerVar(new SechqFunc())
    VariationShaders.registerVar(new Scry3DFunc())
    VariationShaders.registerVar(new Sinusoidal3DFunc())
    VariationShaders.registerVar(new Spherical3DFunc())
    VariationShaders.registerVar(new Sph3DFunc())
    VariationShaders.registerVar(new Spherical3DWFFunc())
    VariationShaders.registerVar(new Spirograph3DFunc())
    VariationShaders.registerVar(new Splits3DFunc())
    VariationShaders.registerVar(new Square3DFunc())
    VariationShaders.registerVar(new SVFFunc())
    VariationShaders.registerVar(new Tangent3DFunc())
    VariationShaders.registerVar(new TaurusFunc())
    VariationShaders.registerVar(new Tile_LogFunc())
}
