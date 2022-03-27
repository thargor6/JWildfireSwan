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

import {VariationParam, VariationParamType, VariationShaderFunc2D, VariationTypes} from './variation-shader-func';
import {VariationShaders} from 'Frontend/flames/renderer/variations/variation-shaders';
import {RenderVariation, RenderXForm} from 'Frontend/flames/model/render-flame';

/*
  be sure to import this class somewhere and call registerVars_Blur()
 */

class BlurFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = rand8(tex, rngState) * (M_PI + M_PI);
          float sina = sin(r);
          float cosa = cos(r);
          float r2 = amount * rand8(tex, rngState);
          _vx += r2 * cosa;
          _vy += r2 * sina;
        }`;
    }

    get name(): string {
        return 'blur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class BlurZoomFunc extends VariationShaderFunc2D {
    PARAM_LENGTH = 'length'
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LENGTH, type: VariationParamType.VP_NUMBER, initialValue: 0.24 },
            { name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.20 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: -0.10 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* blur_zoom from Apo7X15C */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float length = ${variation.params.get(this.PARAM_LENGTH)!.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float z = 1.0 + length * rand8(tex, rngState);
          _vx += amount * ((_tx - x) * z + x);
          _vy += amount * ((_ty + y) * z - y);
        }`;
    }

    get name(): string {
        return 'blur_zoom';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class CircleBlurFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // circleblur by Zyorg, http://zy0rg.deviantart.com/art/Blur-Package-347648919
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rad = sqrt(rand8(tex, rngState));
          float a = rand8(tex, rngState) * (2.0*M_PI);
          float s = sin(a);
          float c = cos(a);
          _vx += amount * c * rad;
          _vy += amount * s * rad;
        }`;
    }

    get name(): string {
        return 'circleblur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class ExBlurFunc extends VariationShaderFunc2D {
    PARAM_DIST = 'dist'
    PARAM_R = 'r'
    PARAM_X_ORIGIN = 'x_origin'
    PARAM_Y_ORIGIN = 'y_origin'
    PARAM_Z_ORIGIN = 'z_origin'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_R, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_X_ORIGIN, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_Y_ORIGIN, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_Z_ORIGIN, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Zephyrtronium ExBlur Apophysis Plugin (11-07-2010), Java translation by DarkBeam, 2014 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          float r = ${variation.params.get(this.PARAM_R)!.toWebGl()};
          float x_origin = ${variation.params.get(this.PARAM_X_ORIGIN)!.toWebGl()};
          float y_origin = ${variation.params.get(this.PARAM_Y_ORIGIN)!.toWebGl()};
          float z_origin = ${variation.params.get(this.PARAM_Z_ORIGIN)!.toWebGl()};
          float rr, theta, phi, su, cu, sv, cv, sru, cru, srv, crv, n, rsrv;
          float ox, oy, oz;
          ox = _tx - x_origin;
          oy = _ty + y_origin;
          oz = _tz - z_origin;
          n = sqr(ox) + sqr(oy) + sqr(oz);
          rr = amount * pow(n, dist) *
                    (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0);
          theta = atan2(oy, ox);
          phi = acos(oz / sqrt(n));
          su = sin(theta);
          cu = cos(theta);
          sv = sin(phi);
          cv = cos(phi);
          theta = rand8(tex, rngState) * (2.0*M_PI); 
          sru = sin(theta);
          cru = cos(theta);
          theta = rand8(tex, rngState) * (2.0*M_PI); 
          srv = sin(theta);
          crv = cos(theta);
          rsrv = r * srv;
          _vx += rr * (sv * cu + rsrv * cru);
          _vy += rr * (sv * su + rsrv * sru);
          _vz += rr * (cv + r * crv);
        }`;
    }

    get name(): string {
        return 'exblur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class FarBlurFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_Z = 'z'
    PARAM_X_ORIGIN = 'x_origin'
    PARAM_Y_ORIGIN = 'y_origin'
    PARAM_Z_ORIGIN = 'z_origin'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_Z, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_X_ORIGIN, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_Y_ORIGIN, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_Z_ORIGIN, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* farblur by zephyrtronium, http://zephyrtronium.deviantart.com/art/Farblur-Apophysis-Plugin-170718419?q=gallery%3Afractal-resources%2F24660058&qo=10 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float z = ${variation.params.get(this.PARAM_Z)!.toWebGl()};
          float x_origin = ${variation.params.get(this.PARAM_X_ORIGIN)!.toWebGl()};
          float y_origin = ${variation.params.get(this.PARAM_Y_ORIGIN)!.toWebGl()};
          float z_origin = ${variation.params.get(this.PARAM_Z_ORIGIN)!.toWebGl()};
          float r = amount * (sqr(_vx - x_origin) +
                    sqr(_vy - y_origin) +
                    sqr(_vz - z_origin)) *
                    (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0);
          float u = rand8(tex, rngState) * (2.0*M_PI);
          float su = sin(u);
          float cu = cos(u);
          float v = rand8(tex, rngState) * (2.0*M_PI);
          float sv = sin(v);
          float cv = cos(v);  
          _vx += x * r * sv * cu;
          _vy += y * r * sv * su;
          _vz += z * r * cv;
        }`;
    }

    get name(): string {
        return 'farblur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class NoiseFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = rand8(tex, rngState) * 2.0 * M_PI;
          float sinr = sin(r);
          float cosr = cos(r);
          r = amount * rand8(tex, rngState);
          _vx += _tx * r * cosr;
          _vy += _ty * r * sinr;
        }`;
    }

    get name(): string {
        return 'noise';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class PreBlurFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = rand8(tex, rngState) * 2.0 * M_PI;
          float sina = sin(r);
          float cosa = cos(r);
          r =  amount * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 3.0);
          _tx += r * cosa;
          _ty += r * sina;
        }`;
    }

    get name(): string {
        return 'pre_blur'
    }


    get priority(): number {
        return -1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR, VariationTypes.VARTYPE_PRE];
    }
}

class RadialBlurFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = 'angle'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};    
          float rndG = rand8(tex, rngState)+rand8(tex, rngState)+rand8(tex, rngState)+rand8(tex, rngState)-2.0;
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
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
        return 'radial_blur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

export function registerVars_Blur() {
    VariationShaders.registerVar(new BlurFunc())
    VariationShaders.registerVar(new BlurZoomFunc())
    VariationShaders.registerVar(new CircleBlurFunc())
    VariationShaders.registerVar(new ExBlurFunc())
    VariationShaders.registerVar(new FarBlurFunc())
    VariationShaders.registerVar(new NoiseFunc())
    VariationShaders.registerVar(new PreBlurFunc())
    VariationShaders.registerVar(new RadialBlurFunc())
}
