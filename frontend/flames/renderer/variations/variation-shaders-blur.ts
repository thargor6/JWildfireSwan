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
import {FUNC_ROUND, FUNC_TRUNC} from "Frontend/flames/renderer/variations/variation-math-functions";

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

class Falloff2Func extends VariationShaderFunc3D {
    PARAM_SCATTER = 'scatter'
    PARAM_MINDIST = 'mindist'
    PARAM_MUL_X = 'mul_x'
    PARAM_MUL_Y = 'mul_y'
    PARAM_MUL_Z = 'mul_z'
    PARAM_MUL_C = 'mul_c'
    PARAM_X0 = 'x0'
    PARAM_Y0 = 'y0'
    PARAM_Z0 = 'z0'
    PARAM_INVERT = 'invert'
    PARAM_TYPE = 'type'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCATTER, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_MINDIST, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_MUL_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_MUL_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_MUL_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_MUL_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_X0, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y0, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z0, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_INVERT, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_TYPE, type: VariationParamType.VP_NUMBER, initialValue: 0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* falloff2 by Xyrus02 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float scatter = ${variation.params.get(this.PARAM_SCATTER)!.toWebGl()};
          float mindist = ${variation.params.get(this.PARAM_MINDIST)!.toWebGl()};
          float mul_x = ${variation.params.get(this.PARAM_MUL_X)!.toWebGl()};
          float mul_y = ${variation.params.get(this.PARAM_MUL_Y)!.toWebGl()};
          float mul_z = ${variation.params.get(this.PARAM_MUL_Z)!.toWebGl()};
          float mul_c = ${variation.params.get(this.PARAM_MUL_C)!.toWebGl()};
          float x0 = ${variation.params.get(this.PARAM_X0)!.toWebGl()};
          float y0 = ${variation.params.get(this.PARAM_Y0)!.toWebGl()};
          float z0 = ${variation.params.get(this.PARAM_Z0)!.toWebGl()};
          int invert = ${variation.params.get(this.PARAM_INVERT)!.toWebGl()};
          int type = ${variation.params.get(this.PARAM_TYPE)!.toWebGl()};
          
          float _rmax = 0.04 * scatter;
          float pIn_x = _tx;
          float pIn_y = _ty;
          float pIn_z = _tz;
          if (type == 1) {            
            float r_in = sqrt(pIn_x*pIn_x + pIn_y*pIn_y + pIn_z*pIn_z) + 1e-6;
            float d = sqrt(sqr(pIn_x - x0) + sqr(pIn_y - y0) + sqr(pIn_z - z0));
            if (invert != 0)
              d = 1.0 - d;
            if (d < 0.0)
              d = 0.0;
            d = (d - mindist) * _rmax;
            if (d < 0.0)
              d = 0.0;
            float sigma = asin(pIn_z / r_in) + mul_z * rand8(tex, rngState) * d;
            float phi = atan2(pIn_y, pIn_x) + mul_y * rand8(tex, rngState) * d;
            float r = r_in + mul_x * rand8(tex, rngState) * d;
            float sins = sin(sigma);
            float coss = cos(sigma);
            float sinp = sin(phi);
            float cosp = cos(phi);
            _vx += amount * (r * coss * cosp);
            _vy += amount * (r * coss * sinp);
            _vz += amount * (sins);
            _color = abs(fract(_color + mul_c * rand8(tex, rngState) * d));
          }
          else if(type==2) {
            float d = sqrt(sqr(pIn_x - x0) + sqr(pIn_y - y0) + sqr(pIn_z - z0));
            if (invert != 0)
              d = 1.0 - d;
            if (d < 0.0)
              d = 0.0;
            d = (d - mindist) * _rmax;
            if (d < 0.0)
              d = 0.0;
            
            float sigma = d * rand8(tex, rngState) * 2.0 * M_PI;
            float phi = d * rand8(tex, rngState) * M_PI;
            float r = d * rand8(tex, rngState);
            
            float sins = sin(sigma);
            float coss = cos(sigma);
            
            float sinp = sin(phi);
            float cosp = cos(phi);
            
            _vx += amount * (pIn_x + mul_x * r * coss * cosp);
            _vy += amount * (pIn_y + mul_y * r * coss * sinp);
            _vz += amount * (pIn_z + mul_z * r * sins);
            _color = abs(fract(_color + mul_c * rand8(tex, rngState) * d));
          }
          else {
            float d = sqrt(sqr(pIn_x - x0) + sqr(pIn_y - y0) + sqr(pIn_z - z0));
            if (invert != 0)
              d = 1.0 - d;
            if (d < 0.0)
              d = 0.0;
            d = (d - mindist) * _rmax;
            if (d < 0.0)
              d = 0.0;
            
            _vx += amount * (pIn_x + mul_x * rand8(tex, rngState) * d);
            _vy += amount * (pIn_y + mul_y * rand8(tex, rngState) * d);
            _vz += amount * (pIn_z + mul_z * rand8(tex, rngState) * d);
            _color = abs(fract(_color + mul_c * rand8(tex, rngState) * d));
          }   
        }`;
    }

    get name(): string {
        return 'falloff2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BLUR, VariationTypes.VARTYPE_DC];
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

class PostFalloff2Func extends VariationShaderFunc3D {
    PARAM_SCATTER = 'scatter'
    PARAM_MINDIST = 'mindist'
    PARAM_MUL_X = 'mul_x'
    PARAM_MUL_Y = 'mul_y'
    PARAM_MUL_Z = 'mul_z'
    PARAM_MUL_C = 'mul_c'
    PARAM_X0 = 'x0'
    PARAM_Y0 = 'y0'
    PARAM_Z0 = 'z0'
    PARAM_INVERT = 'invert'
    PARAM_TYPE = 'type'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCATTER, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_MINDIST, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_MUL_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_MUL_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_MUL_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_MUL_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_X0, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y0, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z0, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_INVERT, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_TYPE, type: VariationParamType.VP_NUMBER, initialValue: 0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* post_falloff2 by Xyrus02 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float scatter = ${variation.params.get(this.PARAM_SCATTER)!.toWebGl()};
          float mindist = ${variation.params.get(this.PARAM_MINDIST)!.toWebGl()};
          float mul_x = ${variation.params.get(this.PARAM_MUL_X)!.toWebGl()};
          float mul_y = ${variation.params.get(this.PARAM_MUL_Y)!.toWebGl()};
          float mul_z = ${variation.params.get(this.PARAM_MUL_Z)!.toWebGl()};
          float mul_c = ${variation.params.get(this.PARAM_MUL_C)!.toWebGl()};
          float x0 = ${variation.params.get(this.PARAM_X0)!.toWebGl()};
          float y0 = ${variation.params.get(this.PARAM_Y0)!.toWebGl()};
          float z0 = ${variation.params.get(this.PARAM_Z0)!.toWebGl()};
          int invert = ${variation.params.get(this.PARAM_INVERT)!.toWebGl()};
          int type = ${variation.params.get(this.PARAM_TYPE)!.toWebGl()};
          
          float _rmax = 0.04 * scatter;
          float pIn_x = _vx;
          float pIn_y = _vy;
          float pIn_z = _vz;
          if (type == 1) {            
            float r_in = sqrt(pIn_x*pIn_x + pIn_y*pIn_y + pIn_z*pIn_z) + 1e-6;
            float d = sqrt(sqr(pIn_x - x0) + sqr(pIn_y - y0) + sqr(pIn_z - z0));
            if (invert != 0)
              d = 1.0 - d;
            if (d < 0.0)
              d = 0.0;
            d = (d - mindist) * _rmax;
            if (d < 0.0)
              d = 0.0;
            float sigma = asin(pIn_z / r_in) + mul_z * rand8(tex, rngState) * d;
            float phi = atan2(pIn_y, pIn_x) + mul_y * rand8(tex, rngState) * d;
            float r = r_in + mul_x * rand8(tex, rngState) * d;
            float sins = sin(sigma);
            float coss = cos(sigma);
            float sinp = sin(phi);
            float cosp = cos(phi);
            _vx += amount * (r * coss * cosp);
            _vy += amount * (r * coss * sinp);
            _vz += amount * (sins);
            _color = abs(fract(_color + mul_c * rand8(tex, rngState) * d));
          }
          else if(type==2) {
            float d = sqrt(sqr(pIn_x - x0) + sqr(pIn_y - y0) + sqr(pIn_z - z0));
            if (invert != 0)
              d = 1.0 - d;
            if (d < 0.0)
              d = 0.0;
            d = (d - mindist) * _rmax;
            if (d < 0.0)
              d = 0.0;
            
            float sigma = d * rand8(tex, rngState) * 2.0 * M_PI;
            float phi = d * rand8(tex, rngState) * M_PI;
            float r = d * rand8(tex, rngState);
            
            float sins = sin(sigma);
            float coss = cos(sigma);
            
            float sinp = sin(phi);
            float cosp = cos(phi);
            
            _vx += amount * (pIn_x + mul_x * r * coss * cosp);
            _vy += amount * (pIn_y + mul_y * r * coss * sinp);
            _vz += amount * (pIn_z + mul_z * r * sins);
            _color = abs(fract(_color + mul_c * rand8(tex, rngState) * d));
          }
          else {
            float d = sqrt(sqr(pIn_x - x0) + sqr(pIn_y - y0) + sqr(pIn_z - z0));
            if (invert != 0)
              d = 1.0 - d;
            if (d < 0.0)
              d = 0.0;
            d = (d - mindist) * _rmax;
            if (d < 0.0)
              d = 0.0;
            
            _vx += amount * (pIn_x + mul_x * rand8(tex, rngState) * d);
            _vy += amount * (pIn_y + mul_y * rand8(tex, rngState) * d);
            _vz += amount * (pIn_z + mul_z * rand8(tex, rngState) * d);
            _color = abs(fract(_color + mul_c * rand8(tex, rngState) * d));
          }   
        }`;
    }

    get name(): string {
        return 'post_falloff2';
    }

    get priority(): number {
        return 1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BLUR, VariationTypes.VARTYPE_POST, VariationTypes.VARTYPE_DC];
    }
}

class PostRBlurFunc extends VariationShaderFunc2D {
    PARAM_STRENGTH = 'strength'
    PARAM_OFFSET = 'offset'
    PARAM_CENTER_X = 'center_x'
    PARAM_CENTER_Y = 'center_y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_STRENGTH, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_OFFSET, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CENTER_X, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CENTER_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // post_rblur by Xyrus02, http://xyrus-02.deviantart.com/art/post-rblur-Plugin-for-Apo-171185576
        return `{
          float amount = ${variation.amount.toWebGl()};
          float strength = ${variation.params.get(this.PARAM_STRENGTH)!.toWebGl()};
          float offset = ${variation.params.get(this.PARAM_OFFSET)!.toWebGl()};
          float center_x = ${variation.params.get(this.PARAM_CENTER_X)!.toWebGl()};
          float center_y = ${variation.params.get(this.PARAM_CENTER_Y)!.toWebGl()};
          float s2 = 2.0 * strength;
          float r = sqrt(sqr(_vx - center_x) + sqr(_vy - center_y)) - offset;
          r = r < 0.0 ? 0.0 : r;
          r *= s2;
          _vx = amount * (_vx + (rand8(tex, rngState) - 0.5) * r);
          _vy = amount * (_vy + (rand8(tex, rngState) - 0.5) * r);
        }`;
    }

    get name(): string {
        return 'post_rblur';
    }

    get priority(): number {
        return 1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR, VariationTypes.VARTYPE_POST];
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

class R_CircleblurFunc extends VariationShaderFunc2D {
    PARAM_N = 'n'
    PARAM_SEED = 'seed'
    PARAM_DIST = 'dist'
    PARAM_MIN = 'min'
    PARAM_MAX = 'max'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SEED, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_MIN, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_MAX, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // "r_circleblur" variation created by Tatyana Zabanova http://tatasz.deviantart.com/art/R-Circular-plugin-697158578 implemented into JWildfire by Brad Stefanov
        return `{
          float amount = ${variation.amount.toWebGl()};
          float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
          float seed = ${variation.params.get(this.PARAM_SEED)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          float _min = ${variation.params.get(this.PARAM_MIN)!.toWebGl()};
          float _max = ${variation.params.get(this.PARAM_MAX)!.toWebGl()};
          float rcn = abs(n);
          float angle = atan2(_ty, _tx);
          float rad = sqrt(sqr(_tx) + sqr(_ty));
          rad = mod(rad, rcn);
          float by = sin(angle + rad);
          float bx = cos(angle + rad);
          by = round(by * rad);
          bx = round(bx * rad);
          float rad2 = sqrt(rand8(tex, rngState)) * 0.5;
          float angle2 = rand8(tex, rngState) * (2.0*M_PI);
          float a1 = sin(bx * 127.1 + by * 311.7 + seed) * 43758.5453;
          a1 = a1 - trunc(a1);
          float a2 = sin(bx * 269.5 + by * 183.3 + seed) * 43758.5453;
          a2 = a2 - trunc(a2);
          float a3 = sin(by * 12.9898 + bx * 78.233 + seed) * 43758.5453;
          a3 = a3 - trunc(a3);
          a3 = a3 * (_max - _min) + _min;
          rad2 *= a3;
          by = by + rad2 * sin(angle2) + a1 * dist;
          bx = bx + rad2 * cos(angle2) + a2 * dist;
          _vx += amount * (bx);
          _vy += amount * (by);
        }`;
    }

    get name(): string {
        return 'r_circleblur';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND, FUNC_TRUNC];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

export function registerVars_Blur() {
    VariationShaders.registerVar(new BlurFunc())
    VariationShaders.registerVar(new BlurZoomFunc())
    VariationShaders.registerVar(new CircleBlurFunc())
    VariationShaders.registerVar(new ExBlurFunc())
    VariationShaders.registerVar(new Falloff2Func())
    VariationShaders.registerVar(new FarBlurFunc())
    VariationShaders.registerVar(new NoiseFunc())
    VariationShaders.registerVar(new PostFalloff2Func())
    VariationShaders.registerVar(new PostRBlurFunc())
    VariationShaders.registerVar(new PreBlurFunc())
    VariationShaders.registerVar(new RadialBlurFunc())
    VariationShaders.registerVar(new R_CircleblurFunc())
}
