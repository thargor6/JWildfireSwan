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
import {
    FUNC_ACOSH,
    FUNC_COSH, FUNC_ERF,
    FUNC_MODULO,
    FUNC_RINT,
    FUNC_ROUND,
    FUNC_SGN,
    FUNC_SINH,
    FUNC_SQRT1PM1
} from 'Frontend/flames/renderer/variations/variation-math-functions';
import {M_PI} from "Frontend/flames/renderer/mathlib";

/*
  be sure to import this class somewhere and call registerVars_2D_PartD()
 */
class DCLinearFunc extends VariationShaderFunc2D {
    PARAM_OFFSET = 'offset'
    PARAM_ANGLE = 'angle'
    PARAM_SCALE = 'scale'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_OFFSET, type: VariationParamType.VP_NUMBER, initialValue: 0.0},
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.30},
            { name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 0.80}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* dc_linear by Xyrus02, http://apophysis-7x.org/extensions */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float offset = ${variation.params.get(this.PARAM_OFFSET)!.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float ldcs = 1.0 / (scale == 0.0 ? 1.0E-5 : scale); 
          _vx += amount * _tx;
          _vy += amount * _ty;
          float s = sin(angle);
          float c = cos(angle);
          _color = mod(abs(0.5 * (ldcs * ((c * _vx + s * _vy + offset)) + 1.0)), 1.0);
        }`;
    }

    get name(): string {
        return 'dc_linear';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_DC];
    }
}

class DevilWarpFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_EFFECT = 'effect'
    PARAM_WARP = 'warp'
    PARAM_RMIN = 'rmin'
    PARAM_RMAX = 'rmax'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 1.00},
            { name: this.PARAM_EFFECT, type: VariationParamType.VP_NUMBER, initialValue: 1.00},
            { name: this.PARAM_WARP, type: VariationParamType.VP_NUMBER, initialValue: 0.50},
            { name: this.PARAM_RMIN, type: VariationParamType.VP_NUMBER, initialValue: -0.24},
            { name: this.PARAM_RMAX, type: VariationParamType.VP_NUMBER, initialValue: 100.00}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* devil_warp by dark-beam */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
            float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
            float effect = ${variation.params.get(this.PARAM_EFFECT)!.toWebGl()};
            float warp = ${variation.params.get(this.PARAM_WARP)!.toWebGl()};
            float rmin = ${variation.params.get(this.PARAM_RMIN)!.toWebGl()}; 
            float rmax = ${variation.params.get(this.PARAM_RMAX)!.toWebGl()}; 
            float xx = _tx;
            float yy = _ty;
            float r2 = 1.0 / (xx * xx + yy * yy);
            float r = pow(xx * xx + r2 * b * yy * yy, warp) - pow(yy * yy + r2 * a * xx * xx, warp);
            if (r > rmax)
              r = rmax;
            else if (r < rmin)
              r = rmin;
            r = effect * (r);
            _vx += xx * (1.0 + r);
            _vy += yy * (1.0 + r);
        }`;
    }

    get name(): string {
        return 'devil_warp';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DiamondFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float sinA = _tx / _r;
                  float cosA = _ty / _r;
                  float sinr = sin(_r);
                  float cosr = cos(_r);
                  _vx += amount * sinA * cosr;
                  _vy += amount * cosA * sinr;
                }`;
    }

    get name(): string {
        return 'diamond';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DiscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float rPI = M_PI * sqrt(_tx * _tx + _ty * _ty);
                  float sinr = sin(rPI);
                  float cosr = cos(rPI);
                  float r = amount * _phi / M_PI;
                  _vx += sinr * r;
                  _vy += cosr * r;
                }`;
    }

    get name(): string {
        return 'disc';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Disc2Func extends VariationShaderFunc2D {
    PARAM_ROT = 'rot'
    PARAM_TWIST = 'twist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ROT, type: VariationParamType.VP_NUMBER, initialValue: 2.0},
                { name: this.PARAM_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.50}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rot = ${variation.params.get(this.PARAM_ROT)!.toWebGl()};
          float twist = ${variation.params.get(this.PARAM_TWIST)!.toWebGl()};
         
          float add = twist;
          float timespi = rot * M_PI;
          float sinadd = sin(add);
          float cosadd = cos(add);
          cosadd -= 1.0;
          float k;
          if (add > 2.0 * M_PI) {
             k = (1.0 + add - 2.0 * M_PI);
             cosadd *= k;
             sinadd *= k;
          }
          else if (add < -2.0 * M_PI) {
             k = (1.0 + add + 2.0 * M_PI);
             cosadd *= k;
             sinadd *= k;
          };
          float t = timespi * (_tx + _ty);
          float sinr = sin(t);
          float cosr = cos(t);
          float r = amount * _phi / M_PI;
        
          _vx += (sinr + cosadd) * r;
          _vy += (cosr + sinadd) * r;
        }`;
    }

    get name(): string {
        return 'disc2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class DustPointFunc extends VariationShaderFunc2D {

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Three Point Pivot/Overlap IFS Triangle
         *
         * @author Jesus Sosa
         * @date November 4, 2017
         * based on a work of Roger Bagula:
         * http://paulbourke.net/fractals/ifs_curved/roger5.c
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x, y, p, r;
          p = (rand8(tex, rngState) < 0.5) ? 1.0 : -1.0;
          r = sqrt(_tx * _tx + _ty * _ty);
          float w = rand8(tex, rngState);
          if (w < 0.50) {
            x = _tx / r - 1.0;
            y = p * _ty / r;
          } else if (w < 0.75) {
            x = _tx / 3.0;
            y = _ty / 3.0;
          } else {
            x = _tx / 3.0 + 2.0 / 3.0;
            y = _ty / 3.0;
          }
          _vx += x * amount;
          _vy += y * amount;
        }`;
    }

    get name(): string {
        return 'dustpoint';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class EclipseFunc extends VariationShaderFunc2D {
    PARAM_SHIFT = 'shift'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.10}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /*
         * eclipse by Michael Faber,
         * http://michaelfaber.deviantart.com/art/Eclipse-268362046
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float shift = ${variation.params.get(this.PARAM_SHIFT)!.toWebGl()};
          if (abs(_ty) <= amount) {
            float c_2 = sqrt(sqr(amount) - sqr(_ty));
            if (abs(_tx) <= c_2) {
              float x = _tx + shift * amount;
              if (abs(x) >= c_2) {
                _vx -= amount * _tx;
              } else {
                _vx += amount * x;
              }
            } else {
              _vx += amount * _tx;
            }
            _vy += amount * _ty;
          } else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'eclipse';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EDiscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Edisc in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float tmp = _r2 + 1.0;
          float tmp2 = 2.0 * _tx;
          float r1 = sqrt(tmp + tmp2);
          float r2 = sqrt(tmp - tmp2);
          float xmax = (r1 + r2) * 0.5;
          float a1 = log(xmax + sqrt(xmax - 1.0));
          float a2 = -acos(_tx / xmax);
          float w = amount / 11.57034632;
        
          float snv = sin(a1);
          float csv = cos(a1);
          float snhu = sinh(a2);
          float cshu = cosh(a2);
        
          if (_ty > 0.0) {
            snv = -snv;
          }
        
          _vx += w * cshu * csv;
          _vy += w * snhu * snv;
        }`;
    }

    get name(): string {
        return 'edisc';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EJuliaFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // eJulia by Michael Faber, http://michaelfaber.deviantart.com/art/eSeries-306044892
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          int _sign = 1;
          if (power < 0)
            _sign = -1;
          float r2 = _ty * _ty + _tx * _tx;
          float tmp2;
          float x;
          if (_sign == 1)
            x = _tx;
          else {
            r2 = 1.0 / r2;
            x = _tx * r2;
          }
          float tmp = r2 + 1.0;
          tmp2 = 2.0 * x;
          float xmax = (sqrt_safe(tmp + tmp2) + sqrt_safe(tmp - tmp2)) * 0.5;
          if (xmax < 1.0)
            xmax = 1.0;
          float sinhmu, coshmu, sinnu, cosnu;
          float mu = acosh(xmax); 
          float t = x / xmax;
          if (t > 1.0)
            t = 1.0;
          else if (t < -1.0)
            t = -1.0;
          float nu = acos(t); 
          if (_ty < 0.0)
            nu *= -1.0;
          nu = nu / float(power) + (2.0*M_PI) / float(power) * floor(rand8(tex, rngState) * float(power));
          mu /= float(power);
          sinhmu = sinh(mu);
          coshmu = cosh(mu);
          sinnu = sin(nu);
          cosnu = cos(nu);
          _vx += amount * coshmu * cosnu;
          _vy += amount * sinhmu * sinnu;
        }`;
    }

    get name(): string {
        return 'eJulia';
    }

    get funcDependencies(): string[] {
        return [FUNC_ACOSH, FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EllipticFunc extends VariationShaderFunc2D {
    //MODE_ORIGINAL = 0; // Original Apophysis plugin
    MODE_MIRRORY = 1; // Mirror y result; legacy JWildfire behavior
    MODE_PRECISION = 2; // Alternate calculation to avoid precision loss by Claude Heiland-Allen; see https://mathr.co.uk/blog/2017-11-01_a_more_accurate_elliptic_variation.html

    PARAM_MODE = 'mode'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.MODE_MIRRORY }]
    }

    get funcDependencies(): string[] {
        return [FUNC_SQRT1PM1]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int mode = ${variation.params.get(this.PARAM_MODE)!.toWebGl()};
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
               sign = (rand8(tex, rngState) < 0.5) ? 1 : -1;
             }
             _vx += _v * atan2(a, b);
             _vy += float(sign) * _v * log(xmax + sqrt_safe(xmax - 1.0));
          }
        }`;
    }

    get name(): string {
        return 'elliptic';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EnnepersFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // ennepers by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx = amount * (_tx - ((sqr(_tx) * _tx) / 3.0)) + _tx * sqr(_ty);
          _vy = amount * (_ty - ((sqr(_ty) * _ty) / 3.0)) + _ty * sqr(_tx);
        }`;
    }

    get name(): string {
        return 'ennepers';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EpispiralFunc extends VariationShaderFunc2D {
    PARAM_N = 'n'
    PARAM_THICKNESS = 'thickness'
    PARAM_HOLES = 'holes'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_NUMBER, initialValue: 6.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // epispiral by cyberxaos, http://cyberxaos.deviantart.com/journal/Epispiral-Plugin-240086108
        return `{
          float amount = ${variation.amount.toWebGl()};
          float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
          float thickness = ${variation.params.get(this.PARAM_THICKNESS)!.toWebGl()};
          float holes = ${variation.params.get(this.PARAM_HOLES)!.toWebGl()};
          float theta = atan2(_ty, _tx);
          float t = -holes;
          if (thickness > EPSILON || thickness < -EPSILON) {
             float d = cos(n * theta);
             if (d != 0.0) {
               t += (rand8(tex, rngState) * thickness) * (1.0 / d);  
             }
          } 
          else {
            float d = cos(n * theta);
            if (d != 0.0) {
              t += 1.0 / d;
            }
          }
          _vx += amount * t * cos(theta);
          _vy += amount * t * sin(theta);   
        }`;
    }

    get name(): string {
        return 'epispiral';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EpispiralWFFunc extends VariationShaderFunc2D {
    PARAM_WAVES = 'waves'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_WAVES, type: VariationParamType.VP_NUMBER, initialValue: 4.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float waves = ${variation.params.get(this.PARAM_WAVES)!.toWebGl()};
          float a = atan2(_tx, _ty);
          float r = sqrt(_tx * _tx + _ty * _ty);
          float d = cos(waves * a);
          if (d != 0.0) {
            r = 0.5 / d;
            float nx = sin(a) * r;
            float ny = cos(a) * r;
        
            _vx += amount * nx;
            _vy += amount * ny;
          }
        }`;
    }

    get name(): string {
        return 'epispiral_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EPushFunc extends VariationShaderFunc2D {
    PARAM_PUSH = 'push'
    PARAM_DIST = 'dist'
    PARAM_ROTATE = 'rotate'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_PUSH, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
                { name: this.PARAM_DIST, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
                { name: this.PARAM_ROTATE, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // ePush by Michael Faber, http://michaelfaber.deviantart.com/art/eSeries-306044892
        return `{
          float amount = ${variation.amount.toWebGl()};
          float push = ${variation.params.get(this.PARAM_PUSH)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          float rotate = ${variation.params.get(this.PARAM_ROTATE)!.toWebGl()};
          float tmp = _ty * _ty + _tx * _tx + 1.0;
          float tmp2 = 2.0 * _tx;
          float xmax = (sqrt_safe(tmp + tmp2) + sqrt_safe(tmp - tmp2)) * 0.5;
          if (xmax < 1.0)
            xmax = 1.0;
          float sinhmu, coshmu;
        
          float mu = acosh(xmax); 
          float t = _tx / xmax;
          if (t > 1.0)
            t = 1.0;
          else if (t < -1.0)
            t = -1.0;
        
          float nu = acos(t); 
          if (_ty < 0.0)
            nu *= -1.0;
          nu += rotate;
        
          mu *= dist;
          mu += push;
        
          sinhmu = sinh(mu);
          coshmu = cosh(mu);
        
          _vx += amount * coshmu * cos(nu);
          _vy += amount * sinhmu * sin(nu);
        }`;
    }

    get name(): string {
        return 'ePush';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_ACOSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ERotateFunc extends VariationShaderFunc2D {
    PARAM_ROTATE = 'rotate'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ROTATE, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // eRotate by Michael Faber, http://michaelfaber.deviantart.com/art/eSeries-306044892
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rotate = ${variation.params.get(this.PARAM_ROTATE)!.toWebGl()};
          float tmp = _ty * _ty + _tx * _tx + 1.0;
          float tmp2 = 2.0 * _tx;
          float xmax = (sqrt_safe(tmp + tmp2) + sqrt_safe(tmp - tmp2)) * 0.5;
          float sinnu, cosnu;
          if (xmax < 1.0)
            xmax = 1.0;
        
          float t = _tx / xmax;
          if (t > 1.0)
            t = 1.0;
          else if (t < -1.0)
            t = -1.0;
          float nu = acos(t); 
          if (_ty < 0.0)
            nu *= -1.0;
        
          nu = mod(nu + rotate + M_PI, (2.0*M_PI)) - M_PI;
        
          sinnu = sin(nu);
          cosnu = cos(nu);
          _vx += amount * xmax * cosnu;
          _vy += amount * sqrt(xmax - 1.0) * sqrt(xmax + 1.0) * sinnu;
        }`;
    }

    get name(): string {
        return 'eRotate';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_ACOSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ErfFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // "erf" variation created by zephyrtronium implemented into JWildfire by darkbeam
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += erf(_tx) * amount;
          _vy += erf(_ty) * amount;
        }`;
    }

    get name(): string {
        return 'erf';
    }

    get funcDependencies(): string[] {
        return [FUNC_ERF];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EscherFunc extends VariationShaderFunc2D {
    PARAM_BETA = 'beta'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_BETA, type: VariationParamType.VP_NUMBER, initialValue: 0.3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Escher in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float beta = ${variation.params.get(this.PARAM_BETA)!.toWebGl()};
          float _theta = atan2(_ty, _tx);
          float a = _theta;
          float lnr = 0.5 * log(_r2);
        
          float seb = sin(beta);
          float ceb = cos(beta);
        
          float vc = 0.5 * (1.0 + ceb);
          float vd = 0.5 * seb;
        
          float m = amount * exp(vc * lnr - vd * a);
          float n = vc * a + vd * lnr;
        
          float sn = sin(n);
          float cn = cos(n);
        
          _vx += m * cn;
          _vy += m * sn;
        }`;
    }

    get name(): string {
        return 'escher';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EScaleFunc extends VariationShaderFunc2D {
    PARAM_SCALE = 'scale'
    PARAM_ANGLE = 'angle'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // eScale by Michael Faber, http://michaelfaber.deviantart.com/art/eSeries-306044892
        return `{
          float amount = ${variation.amount.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float tmp = _ty * _ty + _tx * _tx + 1.0;
          float tmp2 = 2.0 * _tx;
          float xmax = (sqrt_safe(tmp + tmp2) + sqrt_safe(tmp - tmp2)) * 0.5;
          if (xmax < 1.0)
            xmax = 1.0;
          float sinhmu, coshmu;
        
          float mu = acosh(xmax); 
          float t = _tx / xmax;
        
          if (t > 1.0)
            t = 1.0;
          else if (t < -1.0)
            t = -1.0;
        
          float nu = acos(t); 
          if (_ty < 0.0)
            nu *= -1.0;
        
          mu *= scale;
        
          nu = mod(mod(scale * (nu + M_PI + angle), (2.0*M_PI) * scale) - angle - scale * M_PI, (2.0*M_PI));
        
          if (nu > M_PI)
            nu -= (2.0*M_PI);
          if (nu < -M_PI)
            nu += (2.0*M_PI);
        
          sinhmu = sinh(mu);
          coshmu = cosh(mu);
          _vx += amount * coshmu * cos(nu);
          _vy += amount * sinhmu * sin(nu);
        }`;
    }

    get name(): string {
        return 'eScale';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_ACOSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ESwirlFunc extends VariationShaderFunc2D {
    PARAM_IN = 'in'
    PARAM_OUT = 'out'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_IN, type: VariationParamType.VP_NUMBER, initialValue: 1.2 },
            { name: this.PARAM_OUT, type: VariationParamType.VP_NUMBER, initialValue: 0.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // eSwirl by Michael Faber, http://michaelfaber.deviantart.com/art/eSeries-306044892
        return `{
          float amount = ${variation.amount.toWebGl()};
          float _in = ${variation.params.get(this.PARAM_IN)!.toWebGl()};
          float _out = ${variation.params.get(this.PARAM_OUT)!.toWebGl()};
          float tmp = _ty * _ty + _tx * _tx + 1.0;
          float tmp2 = 2.0 * _tx;
          float xmax = (sqrt_safe(tmp + tmp2) + sqrt_safe(tmp - tmp2)) * 0.5;
          if (xmax < 1.0)
            xmax = 1.0;
          float sinhmu, coshmu, sinnu, cosnu;
        
          float mu = acosh(xmax); 
          float t = _tx / xmax;
          if (t > 1.0)
            t = 1.0;
          else if (t < -1.0)
            t = -1.0;
        
          float nu = acos(t); 
          if (_ty < 0.0)
            nu *= -1.0;
        
          nu = nu + mu * _out + _in / mu;
        
          sinhmu = sinh(mu);
          coshmu = cosh(mu);
          sinnu = sin(nu);
          cosnu = cos(nu);
          _vx += amount * coshmu * cosnu;
          _vy += amount * sinhmu * sinnu;
        }`;
    }

    get name(): string {
        return 'eSwirl';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_ACOSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Ex extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = sqrt(_tx * _tx + _ty * _ty);
            float n0 = sin(_phi + r);
            float n1 = cos(_phi - r);
            float m0 = n0 * n0 * n0;
            float m1 = n1 * n1 * n1;
            r = r * amount;
            _vx += r * (m0 + m1);
            _vy += r * (m0 - m1);
        }`;
    }

    get name(): string {
        return 'ex';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ExpFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Exponential EXP
        return `{
            float amount = ${variation.amount.toWebGl()};
            float expe = exp(_tx);
            float expsin = sin(_ty);
            float expcos = cos(_ty);
            _vx += amount * expe * expcos;
            _vy += amount * expe * expsin;
        }`;
    }

    get name(): string {
        return 'exp';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ExponentialFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = M_PI * _ty;
            float sinr = sin(r);
            float cosr = cos(r);
            float d = amount * exp(_tx - 1.0);
            _vx += cosr * d;
            _vy += sinr * d;
        }`;
    }

    get name(): string {
        return 'exponential';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class EyefishFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = 2.0 * amount / (sqrt(_tx * _tx + _ty * _ty) + 1.0);
            _vx += r * _tx;
            _vy += r * _ty;
        }`;
    }

    get name(): string {
        return 'eyefish';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FanFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float dx = M_PI * ${xform.xyC20.toWebGl()} * ${xform.xyC20.toWebGl()} + EPSILON;
            float dx2 = dx / 2.0;
            float a;
            if ((_phi + ${xform.xyC21.toWebGl()} - (floor((_phi + ${xform.xyC21.toWebGl()}) / dx)) * dx) > dx2)
              a = _phi - dx2;
            else
              a = _phi + dx2;
            float sinr = sin(a);
            float cosr = cos(a);
            float r = amount * sqrt(_tx * _tx + _ty * _ty);
            _vx += r * cosr;
            _vy += r * sinr;
        }`;
    }

    get name(): string {
        return 'fan';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Fan2Func extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
            float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
            float r = sqrt(_tx * _tx + _ty * _ty);
            float angle;
            if ((_tx < -EPSILON) || (_tx > EPSILON) || (_ty < -EPSILON) || (_ty > EPSILON)) {
              angle = atan2(_tx, _ty);
            } else {
              angle = 0.0;
            }
        
            float dy = y;
            float dx = M_PI * (x * x) + EPSILON;
            float dx2 = dx * 0.5;
        
            float t = angle + dy - floor((angle + dy) / dx) * dx;
            float a;
            if (t > dx2) {
              a = angle - dx2;
            } else {
              a = angle + dx2;
            }
        
            _vx += amount * r * sin(a);
            _vy += amount * r * cos(a);

        }`;
    }

    get name(): string {
        return 'fan2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FDiscFunc extends VariationShaderFunc2D {
    PARAM_ASHIFT = 'ashift'
    PARAM_RSHIFT = 'rshift'
    PARAM_XSHIFT = 'xshift'
    PARAM_YSHIFT = 'yshift'
    PARAM_TERM1 = 'term1'
    PARAM_TERM2 = 'term2'
    PARAM_TERM3 = 'term3'
    PARAM_TERM4 = 'term4'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ASHIFT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_RSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_XSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_YSHIFT, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TERM1, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_TERM2, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TERM3, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TERM4, type: VariationParamType.VP_NUMBER, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * ported from fdisc plugin for Apophysis7X, author unknown (couldn't find author name for plugin)
         * ported to JWildfire variation by CozyG
         * and enhanced with user-adjustable parameters
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float ashift = ${variation.params.get(this.PARAM_ASHIFT)!.toWebGl()};
          float rshift = ${variation.params.get(this.PARAM_RSHIFT)!.toWebGl()};
          float xshift = ${variation.params.get(this.PARAM_XSHIFT)!.toWebGl()};
          float yshift = ${variation.params.get(this.PARAM_YSHIFT)!.toWebGl()};
          float term1 = ${variation.params.get(this.PARAM_TERM1)!.toWebGl()};
          float term2 = ${variation.params.get(this.PARAM_TERM2)!.toWebGl()};
          float term3 = ${variation.params.get(this.PARAM_TERM3)!.toWebGl()};
          float term4 = ${variation.params.get(this.PARAM_TERM4)!.toWebGl()};
          float afactor = (2.0*M_PI) / (_r + ashift);
          float r = (atan2(_ty, _tx) * (1.0 / M_PI) + rshift) * 0.5;
          float xfactor = cos(afactor + xshift);
          float yfactor = sin(afactor + yshift);
          float pr = amount * r;
          float prx = pr * xfactor;
          float pry = pr * yfactor;
          _vx += (term1 * prx) + (term2 * _tx * prx) + (term3 * _tx * pr) + (term4 * _tx);
          _vy += (term1 * pry) + (term2 * _ty * pry) + (term3 * _ty * pr) + (term4 * _ty);
        }`;
    }

    get name(): string {
        return 'fdisc';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FisheyeFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float r = sqrt(_tx * _tx + _ty * _ty);
            r = 2.0 * r / (r + 1.0);
            _vx += amount * r * _ty / _r;
            _vy += amount * r * _tx / _r;
        }`;
    }

    get name(): string {
        return 'fisheye';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FlipCircleFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // flipcircle by MichaelFaber, http://michaelfaber.deviantart.com/art/Flip-216005432
        return `{
            float amount = ${variation.amount.toWebGl()};
            if (sqr(_tx) + sqr(_ty) > sqr(amount))
              _vy += amount * _ty;
            else
              _vy -= amount * _ty;
            _vx += amount * _tx;
        }`;
    }

    get name(): string {
        return 'flipcircle';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FlipYFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // flipy by MichaelFaber, http://michaelfaber.deviantart.com/art/Flip-216005432
        return `{
            float amount = ${variation.amount.toWebGl()};
            if (_tx > 0.0)
              _vy -= amount * _ty;
            else
              _vy += amount * _ty;
            _vx += amount * _tx;
        }`;
    }

    get name(): string {
        return 'flipy';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FlowerFunc extends VariationShaderFunc2D {
    PARAM_HOLES = 'holes'
    PARAM_PETALS = 'petals'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 0.4 },
            { name: this.PARAM_PETALS, type: VariationParamType.VP_NUMBER, initialValue: 7.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cyberxaos, 4/2007 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float holes = ${variation.params.get(this.PARAM_HOLES)!.toWebGl()};
            float petals = ${variation.params.get(this.PARAM_PETALS)!.toWebGl()};
            float _theta = atan2(_ty, _tx);
            float theta = _theta;
            float d = _r;
            if (d != 0.0) {
              float r = amount * (rand8(tex, rngState) - holes) * cos(petals * theta) / d;
              _vx += r * _tx;
              _vy += r * _ty;
             }
        }`;
    }

    get name(): string {
        return 'flower';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class FluxFunc extends VariationShaderFunc2D {
    PARAM_SPREAD = 'spread'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPREAD, type: VariationParamType.VP_NUMBER, initialValue: 0.3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Flux, by meckie
        return `{
            float amount = ${variation.amount.toWebGl()};
            float spread = ${variation.params.get(this.PARAM_SPREAD)!.toWebGl()};
         
            float xpw = _tx + amount;
            float xmw = _tx - amount;
            float avgr = amount * (2.0 + spread) * sqrt(sqrt(_ty * _ty + xpw * xpw) / sqrt(_ty * _ty + xmw * xmw));
            float avga = (atan2(_ty, xmw) - atan2(_ty, xpw)) * 0.5;
        
            _vx += avgr * cos(avga);
            _vy += avgr * sin(avga);
        }`;
    }

    get name(): string {
        return 'flux';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FociFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Foci in the Apophysis Plugin Pack */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float expx = exp(_tx) * 0.5;
            float expnx = 0.25 / expx;
            if (expx > EPSILON && expnx > EPSILON) {
                float siny = sin(_ty);
                float cosy = cos(_ty);
                float tmp = (expx + expnx - cosy);
                if (tmp != 0.0) {
                    tmp = amount / tmp;   
                    _vx += (expx - expnx) * tmp;
                    _vy += siny * tmp;
                }   
            }
        }`;
    }

    get name(): string {
        return 'foci';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class FourthFunc extends VariationShaderFunc2D {
    PARAM_SPIN = 'spin'
    PARAM_SPACE = 'space'
    PARAM_TWIST = 'twist'
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPIN, type: VariationParamType.VP_NUMBER, initialValue: M_PI },
            { name: this.PARAM_SPACE, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_TWIST, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_X, type: VariationParamType.VP_NUMBER, initialValue: 0.30 },
            { name: this.PARAM_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.12 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* fourth from guagapunyaimel, http://amorinaashton.deviantart.com/art/Fourth-Plugin-175043938?q=favby%3Aamorinaashton%2F1243451&qo=14 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float spin = ${variation.params.get(this.PARAM_SPIN)!.toWebGl()};
          float space = ${variation.params.get(this.PARAM_SPACE)!.toWebGl()};
          float twist = ${variation.params.get(this.PARAM_TWIST)!.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
        
          float sqrvvar = amount * amount;
          if (_tx > 0.0 && _ty > 0.0) {
            float a = atan2(_ty, _tx);
            float r = 1.0 / sqrt(sqr(_tx) + sqr(_ty));
            float s = sin(a);
            float c = cos(a);
            _vx += amount * r * c;
            _vy += amount * r * s;
          } 
          else if (_tx > 0.0 && _ty < 0.0) {
            float r2 = sqr(_tx) + sqr(_ty);
            if (r2 < sqrvvar) {
              float r = amount * sqrt(sqrvvar / r2 - 1.0);
              _vx += r * _tx;
              _vy += r * _ty;
            } else {
              _vx += amount * _tx;
              _vy += amount * _ty;
            }
          } 
          else if (_tx < 0.0 && _ty > 0.0) {
            float r;
            float sina, cosa;
            float x = _tx - x;
            float y = _ty + y;
            r = sqrt(x * x + y * y); 
            if (r < amount) {
              float a = atan2(y, x) + spin + twist * (amount - r);
              sina = sin(a);
              cosa = cos(a);
              r = amount * r;
              _vx += r * cosa + x;
              _vy += r * sina - y;
            } else {
              r = amount * (1.0 + space / r);
              _vx += r * x + x;
              _vy += r * y - y;
            }
          } 
          else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'fourth';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}


export function registerVars_2D_PartD() {
    VariationShaders.registerVar(new DCLinearFunc())
    VariationShaders.registerVar(new DevilWarpFunc())
    VariationShaders.registerVar(new DiamondFunc())
    VariationShaders.registerVar(new DiscFunc())
    VariationShaders.registerVar(new Disc2Func())
    VariationShaders.registerVar(new DustPointFunc())
    VariationShaders.registerVar(new EclipseFunc())
    VariationShaders.registerVar(new EDiscFunc())
    VariationShaders.registerVar(new EJuliaFunc())
    VariationShaders.registerVar(new EllipticFunc())
    VariationShaders.registerVar(new EnnepersFunc())
    VariationShaders.registerVar(new EpispiralFunc())
    VariationShaders.registerVar(new EpispiralWFFunc())
    VariationShaders.registerVar(new EPushFunc())
    VariationShaders.registerVar(new ErfFunc())
    VariationShaders.registerVar(new ERotateFunc())
    VariationShaders.registerVar(new EscherFunc())
    VariationShaders.registerVar(new EScaleFunc())
    VariationShaders.registerVar(new ESwirlFunc())
    VariationShaders.registerVar(new Ex())
    VariationShaders.registerVar(new ExpFunc())
    VariationShaders.registerVar(new ExponentialFunc())
    VariationShaders.registerVar(new EyefishFunc())
    VariationShaders.registerVar(new FanFunc())
    VariationShaders.registerVar(new Fan2Func())
    VariationShaders.registerVar(new FDiscFunc())
    VariationShaders.registerVar(new FisheyeFunc())
    VariationShaders.registerVar(new FlipCircleFunc())
    VariationShaders.registerVar(new FlipYFunc())
    VariationShaders.registerVar(new FlowerFunc())
    VariationShaders.registerVar(new FluxFunc())
    VariationShaders.registerVar(new FociFunc())
    VariationShaders.registerVar(new FourthFunc())
}
