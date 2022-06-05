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

import {VariationParam, VariationParamType, VariationShaderFunc3D, VariationTypes} from './variation-shader-func';
import {VariationShaders} from 'Frontend/flames/renderer/variations/variation-shaders';
import {RenderVariation, RenderXForm} from 'Frontend/flames/model/render-flame';
import {
    FUNC_COSH,
    FUNC_ERF,
    FUNC_HYPOT,
    FUNC_MODULO,
    FUNC_ROUND,
    FUNC_SGN,
    FUNC_SINH,
    LIB_FAST_NOISE_BASE,
    LIB_FAST_NOISE_VALUE_NOISE
} from 'Frontend/flames/renderer/variations/variation-math-functions';
import {M_PI} from "Frontend/flames/renderer/mathlib";

/*
  be sure to import this class somewhere and call registerVars_3D_PartA()
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

class CoshqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Coshq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(abs_v);
                  float c = cos(abs_v);
                  float sh = sinh(_tx);
                  float ch = cosh(_tx);
                  float C = amount * sh * s / abs_v;
                  _vx += amount * ch * c;
                  _vy += C * _ty;
                  _vz += C * _tz;
                }`;
    }

    get name(): string {
        return 'coshq';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class CosqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Cosq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(_tx);
                  float c = cos(_tx);
                  float sh = sinh(abs_v);
                  float ch = cosh(abs_v);
                  float C = -amount * s * sh / abs_v;
                  _vx += amount * c * ch;
                  _vy += C * _ty;
                  _vz += C * _tz;
                }`;
    }

    get name(): string {
        return 'cosq';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class CschqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Cschq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(abs_v);
                  float c = cos(abs_v);
                  float sh = sinh(_tx);
                  float ch = cosh(_tx);
                  float ni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
                  float C = ni * ch * s / abs_v;
                  _vx += sh * c * ni;
                  _vy -= C * _ty;
                  _vz -= C * _tz;
                 }`;
    }

    get name(): string {
        return 'cschq';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class CscqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Cscq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(_tx);
                  float c = cos(_tx);
                  float sh = sinh(abs_v);
                  float ch = cosh(abs_v);
                  float ni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
                  float C = ni * c * sh / abs_v;
                  _vx += s * ch * ni;
                  _vy -= C * _ty;
                  _vz -= C * _tz;
                }`;
    }

    get name(): string {
        return 'cscq';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class CothqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Cothq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(abs_v);
                  float c = cos(abs_v);
                  float sh = sinh(_tx);
                  float ch = cosh(_tx);
                  float sysz = sqr(_ty) + sqr(_tz);
                  float ni = amount / (sqr(_tx) + sysz);
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
        return 'cothq';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
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

class DCCubeFunc extends VariationShaderFunc3D {
    PARAM_C1 = 'c1'
    PARAM_C2 = 'c2'
    PARAM_C3 = 'c3'
    PARAM_C4 = 'c4'
    PARAM_C5 = 'c5'
    PARAM_C6 = 'c6'
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_Z = 'z'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_C1, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_C2, type: VariationParamType.VP_NUMBER, initialValue: 0.2 },
            { name: this.PARAM_C3, type: VariationParamType.VP_NUMBER, initialValue: 0.3 },
            { name: this.PARAM_C4, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
            { name: this.PARAM_C5, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_C6, type: VariationParamType.VP_NUMBER, initialValue: 0.6 },
            { name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Z, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
         /* dc_cube by Xyrus02, http://xyrus02.deviantart.com/art/DC-Cube-plugin-update-170465423 */
         return `{
          float amount = ${variation.amount.toWebGl()};
          float c1 = ${variation.params.get(this.PARAM_C1)!.toWebGl()};
          float c2 = ${variation.params.get(this.PARAM_C2)!.toWebGl()};
          float c3 = ${variation.params.get(this.PARAM_C3)!.toWebGl()};
          float c4 = ${variation.params.get(this.PARAM_C4)!.toWebGl()};
          float c5 = ${variation.params.get(this.PARAM_C5)!.toWebGl()};
          float c6 = ${variation.params.get(this.PARAM_C6)!.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float z = ${variation.params.get(this.PARAM_Z)!.toWebGl()};
          float p = 2.0 * rand8(tex, rngState) - 1.0;
          float q = 2.0 * rand8(tex, rngState) - 1.0;
          int i = iRand8(tex, 4, rngState) ;
          bool j = rand8(tex, rngState) < 0.5;
          float cx = 0.0, cy = 0.0, cz = 0.0;
          if(i==0) {
            cx = amount * (j ? -1.0 : 1.0);
            cy = amount * p;
            cz = amount * q;
            if (j)
              _color = c1;
            else
              _color = c2;
          }
          else if(i==1) {
            cx = amount * p;
            cy = amount * (j ? -1.0 : 1.0);
            cz = amount * q;
            if (j)
              _color = c3;
            else
              _color = c4;
          }
          else {  // if(i==2) 
            cx = amount * p;
            cy = amount * q;
            cz = amount * (j ? -1.0 : 1.0);
            if (j)
              _color = c5;
            else
              _color = c6;
          }
          _vx += cx * x;
          _vy += cy * y;
          _vz += cz * z;
        }`;
    }

    get name(): string {
        return 'dc_cube';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE, VariationTypes.VARTYPE_DC];
    }
}

class DCZTranslFunc extends VariationShaderFunc3D {
    PARAM_X0 = 'x0'
    PARAM_X1 = 'x1'
    PARAM_FACTOR = 'factor'
    PARAM_OVERWRITE = 'overwrite'
    PARAM_CLAMP = 'clamp'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X0, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_X1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_FACTOR, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_OVERWRITE, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_CLAMP, type: VariationParamType.VP_NUMBER, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* dc_ztransl by Xyrus02, http://xyrus02.deviantart.com/art/DC-ZTransl-plugins-for-Apo7X-210719008?q=gallery%3Afractal-resources%2F24660058&qo=32 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x0 = ${variation.params.get(this.PARAM_X0)!.toWebGl()};
          float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
          float factor = ${variation.params.get(this.PARAM_FACTOR)!.toWebGl()};
          int overwrite = ${variation.params.get(this.PARAM_OVERWRITE)!.toWebGl()};
          int clamp = ${variation.params.get(this.PARAM_CLAMP)!.toWebGl()};
          float _x0 = x0 < x1 ? x0 : x1;
          float _x1 = x0 > x1 ? x0 : x1;
          float _x1_m_x0 = _x1 - _x0 == 0.0 ? EPSILON : _x1 - _x0;
          float zf = factor * (_color - _x0) / _x1_m_x0;
          if (clamp != 0)
            zf = zf < 0.0 ? 0.0 : zf > 1.0 ? 1.0 : zf;
          _vx += amount * _tx;
          _vy += amount * _ty; 
          if (overwrite == 0)
            _vz += amount * _tz * zf;
          else
            _vz += amount * zf;
        }`;
    }

    get name(): string {
        return 'dc_ztransl';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_ZTRANSFORM];
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

class Disc3DFunc extends VariationShaderFunc3D {
    PARAM_PI = 'pi'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_PI, type: VariationParamType.VP_NUMBER, initialValue: M_PI }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* disc3D by Larry Berlin, http://aporev.deviantart.com/art/3D-Plugins-Collection-One-138514007?q=gallery%3Aaporev%2F8229210&qo=15 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float pi = ${variation.params.get(this.PARAM_PI)!.toWebGl()};
          float r = sqrt(_ty * _ty + _tx * _tx + EPSILON);
          float a = pi * r;
          float sr = sin(a);
          float cr = cos(a);
          float vv = amount * atan2(_tx, _ty) / (pi + EPSILON);
          _vx += vv * sr;
          _vy += vv * cr;
          _vz += vv * (r * cos(_tz));
        }`;
    }

    get name(): string {
        return 'disc3d';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Ennepers2Func extends VariationShaderFunc3D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.3333 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.075 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* ennepers2 by dark-beam */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float xx = _tx;
          float yy = _ty;
          float r2 = 1.0 / (sqr(xx) + sqr(yy));
          float dxy = (sqr(a * xx) - sqr(b * yy));
          _vx += amount * xx * (sqr(a) - dxy * r2 - c * sqrt(abs(xx)));
          _vy += amount * yy * (sqr(b) - dxy * r2 - c * sqrt(abs(yy)));
          _vz += amount * dxy * 0.5 * sqrt(r2);
        }`;
    }

    get name(): string {
        return 'ennepers2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Erf3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // "erf3D" variation created by zephyrtronium implemented into JWildfire by darkbeam
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += erf(_tx) * amount;
          _vy += erf(_ty) * amount;
          _vz += erf(_tz) * amount;
        }`;
    }

    get name(): string {
        return 'erf3D';
    }

    get funcDependencies(): string[] {
        return [FUNC_ERF];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class EstiqFunc extends VariationShaderFunc3D {
    /* Estiq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
     getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
           float e = exp(_tx);
           float abs_v = hypot(_ty, _tz);
            float s = sin(abs_v);
            float c = cos(abs_v);
            float a = e * s / abs_v;
            _vx += amount * e * c;
            _vy += amount * a * _ty;
            _vz += amount * a * _tz;
        }`;
    }

    get name(): string {
        return 'estiq';
    }

    get funcDependencies(): string[] {
        return [FUNC_HYPOT];
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

export function registerVars_3D_PartA() {
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
    VariationShaders.registerVar(new CoshqFunc())
    VariationShaders.registerVar(new CosqFunc())
    VariationShaders.registerVar(new CschqFunc())
    VariationShaders.registerVar(new CscqFunc())
    VariationShaders.registerVar(new CothqFunc())
    VariationShaders.registerVar(new Cubic_3DFunc())
    VariationShaders.registerVar(new Curl3DFunc())
    VariationShaders.registerVar(new CylinderApoFunc())
    VariationShaders.registerVar(new DCCubeFunc())
    VariationShaders.registerVar(new DCZTranslFunc())
    VariationShaders.registerVar(new DinisSurfaceWFFunc())
    VariationShaders.registerVar(new Disc3DFunc())
    VariationShaders.registerVar(new Ennepers2Func())
    VariationShaders.registerVar(new Erf3DFunc())
    VariationShaders.registerVar(new EstiqFunc())
    VariationShaders.registerVar(new Foci3DFunc())
}
