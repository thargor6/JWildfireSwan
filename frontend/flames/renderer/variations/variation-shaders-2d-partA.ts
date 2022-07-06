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
  be sure to import this class somewhere and call registerVars_2D_PartA()
 */
class ApocarpetFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Roger Bagula Function
         *
         * @author Jesus Sosa
         * @date November 4, 2017
         * based on a work of:
         * http://paulbourke.net/fractals/kissingcircles/roger17.c
         */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = 0.0, y = 0.0;
            float r = 0.414213562;
            float denom = _tx * _tx + _ty * _ty;
            int weight = int(6.0 * rand8(tex, rngState));
            if(weight==0) {
              x = 2.0 * _tx * _ty / denom;
              y = (_tx * _tx - _ty * _ty) / denom;
            }
            else if(weight==1) {
              x = _tx * r - r;
              y = _ty * r - r;
            }
            else if(weight==2) {
              x = _tx * r + r;
              y = _ty * r + r;
            }
            else if(weight==3) {
              x = _tx * r + r;
              y = _ty * r - r;
            }
            else if(weight==4){
              x = _tx * r - r;
              y = _ty * r + r;
            }
            else {
              x = (_tx * _tx - _ty * _ty) / denom;
              y = 2.0 * _tx * _ty / denom;
            }
            _vx += x * amount;
            _vy += y * amount;
        }`;
    }

    get name(): string {
        return 'apocarpet_js';
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}


class ApollonyFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Apollony IFS
         *
         * @author Jesus Sosa
         * @date January 22, 2018
         * based on a work of:
         * http://paulbourke.net/fractals/apollony/apollony.c
         */
        return `{
              float amount = ${variation.amount.toWebGl()};
              float x, y, a0, b0, f1x, f1y;
              float r = sqrt(3.0);
              a0 = 3.0 * (1.0 + r - _tx) / (pow(1.0 + r - _tx, 2.0) + _ty * _ty) - (1.0 + r) / (2.0 + r);
              b0 = 3.0 * _ty / (pow(1.0 + r - _tx, 2.0) + _ty * _ty);
              f1x = a0 / (a0 * a0 + b0 * b0);
              f1y = -b0 / (a0 * a0 + b0 * b0);
              int w = int(4.0 * rand8(tex, rngState));
            
              if (modulo(w, 3) == 0) {
                x = a0;
                y = b0;
              } else if (modulo(w, 3) == 1) {
                x = -f1x / 2.0 - f1y * r / 2.0;
                y = f1x * r / 2.0 - f1y / 2.0;
              } else {
                x = -f1x / 2.0 + f1y * r / 2.0;
                y = -f1x * r / 2.0 - f1y / 2.0;
              }
              _vx += x * amount;
              _vy += y * amount;
        }`;
    }

    get name(): string {
        return 'apollony';
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ArchFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
              float amount = ${variation.amount.toWebGl()};
              float ang = rand8(tex, rngState) * amount * M_PI;
              float sinr = sin(ang);
              float cosr = cos(ang);
              if (cosr != 0.0) {
                _vx += amount * sinr;
                _vy += amount * (sinr * sinr) / cosr;
              }
        }`;
    }

    get name(): string {
        return 'arch';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AsteriaFunc extends VariationShaderFunc2D {
    PARAM_ALPHA = 'alpha'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ALPHA, type: VariationParamType.VP_FLOAT, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // asteria by dark-beam, http://jwildfire.org/forum/viewtopic.php?f=23&t=1464
        return `{
          float amount = ${variation.amount.toWebGl()};
          float alpha = ${variation.params.get(this.PARAM_ALPHA)!.toWebGl()};
          float sina = sin(M_PI * alpha);
          float cosa = cos(M_PI * alpha); 
          float x0 = amount * _tx;
          float y0 = amount * _ty;
          float xx = x0;
          float yy = y0;
          float r = sqr(xx) + sqr(yy);
          xx = sqr(abs(xx) - 1.0);
          yy = sqr(abs(yy) - 1.0);
          float r2 = sqrt(yy + xx);
          bool in1 = r < 1.0;
          bool out2 = r2 < 1.0;
          if (in1 && out2)
            in1 = ((rand8(tex, rngState)) > 0.35);
          else
            in1 = !in1;
          if (in1) { 
            _vx += x0;
            _vy += y0;
          } else { 
            xx = x0 * cosa - y0 * sina;
            yy = x0 * sina + y0 * cosa;
            float nx = xx / sqrt(1.0 - yy * yy) * (1.0 - sqrt(1. - sqr(-abs(yy) + 1.0)));
            xx = nx * cosa + yy * sina;
            yy = -nx * sina + yy * cosa;
            _vx += xx;
            _vy += yy;
          }  
        }`;
    }

    get name(): string {
        return 'asteria';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AtanFunc extends VariationShaderFunc2D {
    PARAM_MODE = 'Mode'
    PARAM_STRETCH = 'Stretch'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_MODE, type: VariationParamType.VP_INT, initialValue: 0 },
            { name: this.PARAM_STRETCH, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* atan by FractalDesire http://fractaldesire.deviantart.com/art/atan-Plugin-688802474 converted by Brad Stefanov */
        return `{
          float amount = ${variation.amount.toWebGl()};
          int Mode = ${variation.params.get(this.PARAM_MODE)!.toWebGl()};
          float Stretch = ${variation.params.get(this.PARAM_STRETCH)!.toWebGl()};
          float norm = 1.0 / (M_PI*0.5) * amount;
          if(Mode==0) {
            _vx += amount * _tx;
            _vy += norm * atan(Stretch * _ty);
          }
          else if(Mode==1) {
            _vx += norm * atan(Stretch * _tx);
            _vy += amount * _ty;
          }
          else if(Mode==2) {
            _vx += norm * atan(Stretch * _tx);
            _vy += norm * atan(Stretch * _ty);
          }
        }`;
    }

    get name(): string {
        return 'atan';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class AugerFunc extends VariationShaderFunc2D {
    PARAM_FREQ = 'freq'
    PARAM_WEIGHT = 'weight'
    PARAM_SYM = 'sym'
    PARAM_SCALE = 'scale'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FREQ, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_WEIGHT, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_SYM, type: VariationParamType.VP_FLOAT, initialValue: 0.10 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_FLOAT, initialValue: 0.90 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Auger, by Xyrus02
        return `{
          float amount = ${variation.amount.toWebGl()};
          float freq = ${variation.params.get(this.PARAM_FREQ)!.toWebGl()};
          float weight = ${variation.params.get(this.PARAM_WEIGHT)!.toWebGl()};
          float sym = ${variation.params.get(this.PARAM_SYM)!.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float s = sin(freq * _tx);
          float t = sin(freq * _ty);
          float dy = _ty + weight * (scale * s * 0.5 + abs(_ty) * s);
          float dx = _tx + weight * (scale * t * 0.5 + abs(_tx) * t);
          _vx += amount * (_tx + sym * (dx - _tx));
          _vy += amount * dy;
        }`;
    }

    get name(): string {
        return 'auger';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BarycentroidFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_D, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* barycentroid from Xyrus02, http://xyrusworx.deviantart.com/art/Barycentroid-Plugin-144832371?q=sort%3Atime+favby%3Amistywisp&qo=0&offset=10 */
        // helpers

        /*  The code is supposed to be fast and you all can read it so I dont
            create those aliases for readability in actual code:

            v0x = this.a
            v0y = this.b
            v1x = this.c
            v1y = this.d
            v2x = pAffineTP.x
            v2y = pAffineTP.y
        */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float dot00 = a * a + b * b; 
          float dot01 = a * c + b * d; 
          float dot02 = a * _tx + b * _ty; 
          float dot11 = c * c + d * d; 
          float dot12 = c * _tx + d * _ty;     
          float invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
          /* now we can pull [u,v] as the barycentric coordinates of the point 
             P in the triangle [A, B, C]
          */
          float u = (dot11 * dot02 - dot01 * dot12) * invDenom;
          float v = (dot00 * dot12 - dot01 * dot02) * invDenom;   
          float um = sqrt(sqr(u) + sqr(_tx)) * sgn(u);
          float vm = sqrt(sqr(v) + sqr(_ty)) * sgn(v);
          _vx += amount * um;
          _vy += amount * vm;
        }`;
    }

    get name(): string {
        return 'barycentroid';
    }

    get funcDependencies(): string[] {
        return [FUNC_SGN];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BCollideFunc extends VariationShaderFunc2D {
    PARAM_NUM = 'num'
    PARAM_A = 'a'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_NUM, type: VariationParamType.VP_INT, initialValue: 1 },
            { name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // bCollide by Michael Faber, http://michaelfaber.deviantart.com/art/bSeries-320574477
        return `{
          float amount = ${variation.amount.toWebGl()};
          int num = ${variation.params.get(this.PARAM_NUM)!.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float _bCa, _bCn_pi, _bCa_bCn, _pi_bCn;
          _bCn_pi = float(num) * (1.0 / M_PI);
          _pi_bCn = M_PI / float(num);
          _bCa = M_PI * a;
          _bCa_bCn = _bCa / float(num);
          float tau, sigma;
          float temp;
          float cosht, sinht;
          float sins, coss;
          int alt;
        
          tau = 0.5 * (log(sqr(_tx + 1.0) + sqr(_ty)) - log(sqr(_tx - 1.0) + sqr(_ty)));
          sigma = M_PI - atan2(_ty, _tx + 1.0) - atan2(_ty, 1.0 - _tx);
        
          alt = int(sigma * _bCn_pi);         
          if (modulo(alt, 2) == 0)
            sigma = float(alt) * _pi_bCn + mod(sigma + _bCa_bCn, _pi_bCn);
          else
            sigma = float(alt) * _pi_bCn + mod(sigma - _bCa_bCn, _pi_bCn);
          sinht = sinh(tau);
          cosht = cosh(tau);
          sins = sin(sigma);
          coss = cos(sigma);
          temp = cosht - coss;
          _vx += amount * sinht / temp;
          _vy += amount * sins / temp;
        }`;
    }

    get name(): string {
        return 'bCollide';
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO, FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BentFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
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
        return 'bent';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Bent2Func extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
                { name: this.PARAM_Y, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Bent2 in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float nx = _tx;
          float ny = _ty;
          if (nx < 0.0)
            nx = nx * x;
          if (ny < 0.0)
            ny = ny * y;
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'bent2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BiLinearFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * _ty;
          _vy += amount * _tx;
        }`;
    }

    get name(): string {
        return 'bi_linear';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BipolarFunc extends VariationShaderFunc2D {
    PARAM_SHIFT = 'shift'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Bipolar in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x2y2 = (_tx * _tx + _ty * _ty);
          float t = x2y2 + 1.0;
          float x2 = 2.0 * _tx;
          float shift = ${variation.params.get(this.PARAM_SHIFT)!.toWebGl()};
          float ps = -(M_PI*0.5) * shift;
          float y = 0.5 * atan2(2.0 * _ty, x2y2 - 1.0) + ps;

          if (y > (M_PI*0.5)) {
            y = -(M_PI*0.5) + mod(y + (M_PI*0.5), M_PI);
          } 
          else if (y < -(M_PI*0.5)) {
            y = (M_PI*0.5) - mod((M_PI*0.5) - y, M_PI);
          }

          float f = t + x2;
          float g = t - x2;
        
          if ((g != 0.0) && (f / g > 0.0)) {
            _vx += amount * 0.25 * (2.0 / M_PI) * log((t + x2) / (t - x2));
            _vy += amount * (2.0 / M_PI) * y;
          }  
        }`;
    }

    get name(): string {
        return 'bipolar';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Bipolar2Func extends VariationShaderFunc2D {
    PARAM_SHIFT = 'shift'
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'
    PARAM_E = 'e'
    PARAM_F1 = 'f1'
    PARAM_G1 = 'g1'
    PARAM_H = 'h'

    get params(): VariationParam[] {
        return [
          { name: this.PARAM_SHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
          { name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
          { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
          { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
          { name: this.PARAM_D, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
          { name: this.PARAM_E, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
          { name: this.PARAM_F1, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
          { name: this.PARAM_G1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
          { name: this.PARAM_H, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Bipolar in the Apophysis Plugin Pack with variables added by Brad Stefanov */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float shift = ${variation.params.get(this.PARAM_SHIFT)!.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float f1 = ${variation.params.get(this.PARAM_F1)!.toWebGl()};
          float g1 = ${variation.params.get(this.PARAM_G1)!.toWebGl()};
          float h = ${variation.params.get(this.PARAM_H)!.toWebGl()};
             
          float x2y2 = (_tx * _tx + _ty * _ty) * g1;
          float t = x2y2 + a;
          float x2 = b * _tx;
          float ps = -(M_PI*0.5) * shift;
          float y = c * atan2(e * _ty, x2y2 - d) + ps;
        
          if (y > (M_PI*0.5)) {
            y = -(M_PI*0.5) + mod(y + (M_PI*0.5), M_PI);
          } else if (y < -(M_PI*0.5)) {
            y = (M_PI*0.5) - mod((M_PI*0.5) - y, M_PI);
          }
        
          float f = t + x2;
          float g = t - x2;
        
          if ((g != 0.0) && (f / g > 0.0)) {
            _vx += amount * f1 * (2.0 / M_PI) * log((t + x2) / (t - x2));
            _vy += amount * (2.0 / M_PI) * y * h;
          }
        }`;
    }

    get name(): string {
        return 'bipolar2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BladeFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = rand8(tex, rngState) * amount * sqrt(_tx * _tx + _ty * _ty);
          float sinr = sin(r);
          float cosr = cos(r);
          _vx += amount * _tx * (cosr + sinr);
          _vy += amount * _tx * (cosr - sinr);
        }`;
    }

    get name(): string {
        return 'blade';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BlobFunc extends VariationShaderFunc2D {
    PARAM_LOW = 'low'
    PARAM_HIGH = 'high'
    PARAM_WAVES = 'waves'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LOW, type: VariationParamType.VP_FLOAT, initialValue: 0.3 },
            { name: this.PARAM_HIGH, type: VariationParamType.VP_FLOAT, initialValue: 1.2 },
            { name: this.PARAM_WAVES, type: VariationParamType.VP_FLOAT, initialValue: 6 }]
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
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'blob';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BlockYFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_MP = 'mp'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_MP, type: VariationParamType.VP_FLOAT, initialValue: 4.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* blocky from FracFx, http://fracfx.deviantart.com/art/FracFx-Plugin-Pack-171806681 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float mp = ${variation.params.get(this.PARAM_MP)!.toWebGl()};
          float v = amount / (M_PI*0.5);
          float T = ((cos(_tx) + cos(_ty)) / mp + 1.0);
          float r = amount / T;
          float tmp = sqr(_ty) + sqr(_tx) + 1.0;
          float x2 = 2.0 * _tx;
          float y2 = 2.0 * _ty;
          float xmax = 0.5 * (sqrt(tmp + x2) + sqrt(tmp - x2));
          float ymax = 0.5 * (sqrt(tmp + y2) + sqrt(tmp - y2));
          float a = _tx / xmax;
          float b = sqrt_safe(1.0 - sqr(a));
          _vx += v * atan2(a, b) * r * x;
          a = _ty / ymax;
          b = sqrt_safe(1.0 - sqr(a));
          _vy += v * atan2(a, b) * r * y;
        }`;
    }

    get name(): string {
        return 'blocky';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BlurCircleFunc extends VariationShaderFunc2D {

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = 2.0 * rand8(tex, rngState) - 1.0;
          float y = 2.0 * rand8(tex, rngState) - 1.0;
        
          float absx = x;
          if (absx < 0.0)
            absx = absx * -1.0;
          float absy = y;
          if (absy < 0.0)
            absy = absy * -1.0;
        
          float perimeter, side;
          if (absx >= absy) {
            if (x >= absy) {
              perimeter = absx + y;
            } else {
              perimeter = 5.0 * absx - y;
            }
            side = absx;
          } else {
            if (y >= absx) {
              perimeter = 3.0 * absy - x;
            } else {
              perimeter = 7.0 * absy + x;
            }
            side = absy;
          }
        
          float r = amount * side;
          float a = (0.25*M_PI) * perimeter / side - (0.25*M_PI);
          float sina = sin(a);
          float cosa = cos(a);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'blur_circle';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class BlurLinearFunc extends VariationShaderFunc2D {
    PARAM_LENGTH = 'length'
    PARAM_ANGLE = 'angle'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LENGTH, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_FLOAT, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // made in 2009 by Joel Faber - transcribed by DarkBeam 2017
        return `{
          float amount = ${variation.amount.toWebGl()};
          float length = ${variation.params.get(this.PARAM_LENGTH)!.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float s = sin(angle);
          float c = cos(angle); 
          float r = length * rand8(tex, rngState);
          _vx += amount * (_tx + r * c);
          _vy += amount * (_ty + r * s);
        }`;
    }

    get name(): string {
        return 'blur_linear';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BlurPixelizeFunc extends VariationShaderFunc2D {
    PARAM_SIZE = 'size'
    PARAM_SCALE = 'scale'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SIZE, type: VariationParamType.VP_FLOAT, initialValue: 0.1 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* blur_pixelize from Apo7X15C */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float size = ${variation.params.get(this.PARAM_SIZE)!.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float _inv_size = 1.0 / size;
          float _v = amount * size;   
          float x = floor(_tx * (_inv_size));
          float y = floor(_ty * (_inv_size));
          _vx += _v * (x + (scale) * (rand8(tex, rngState) - 0.5) + 0.5);
          _vy += _v * (y + (scale) * (rand8(tex, rngState) - 0.5) + 0.5);
        }`;
    }

    get name(): string {
        return 'blur_pixelize';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BModFunc extends VariationShaderFunc2D {
    PARAM_RADIUS = 'radius'
    PARAM_DISTANCE = 'distance'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_DISTANCE, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // bMod by Michael Faber, http://michaelfaber.deviantart.com/art/bSeries-320574477
        return `{
          float amount = ${variation.amount.toWebGl()};
          float radius = ${variation.params.get(this.PARAM_RADIUS)!.toWebGl()};
          float distance = ${variation.params.get(this.PARAM_DISTANCE)!.toWebGl()};
          float tau, sigma;
          float temp;
          float cosht, sinht;
          float sins, coss;
        
          tau = 0.5 * (log(sqr(_tx + 1.0) + sqr(_ty)) - log(sqr(_tx - 1.0) + sqr(_ty)));
          sigma = M_PI - atan2(_ty, _tx + 1.0) - atan2(_ty, 1.0 - _tx);
        
          if (tau < radius && -tau < radius) {
            tau = mod(tau + radius + distance * radius, 2.0 * radius) - radius;
          }
        
          sinht = sinh(tau);
          cosht = cosh(tau);
          sins = sin(sigma);
          coss = cos(sigma);
          temp = cosht - coss;
          if (temp != 0.0) {
            _vx += amount * sinht / temp;
            _vy += amount * sins / temp; 
          }
        }`;
    }

    get name(): string {
        return 'bMod';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BoardersFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Boarders in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float roundX = float(int(_tx+0.5));
          float roundY = float(int(_ty+0.5));
          float offsetX = _tx - roundX;
          float offsetY = _ty - roundY;
          if (rand8(tex, rngState) >= 0.75) {
            _vx += amount * (offsetX * 0.5 + roundX);
            _vy += amount * (offsetY * 0.5 + roundY);
          } else {
             if (abs(offsetX) >= abs(offsetY)) {
               if (offsetX >= 0.0) {
                  _vx += amount * (offsetX * 0.5 + roundX + 0.25);
                  _vy += amount * (offsetY * 0.5 + roundY + 0.25 * offsetY / offsetX);
                } else {
                  _vx += amount * (offsetX * 0.5 + roundX - 0.25);
                  _vy += amount * (offsetY * 0.5 + roundY - 0.25 * offsetY / offsetX);
                }
              } else {
                if (offsetY >= 0.0) {
                  _vy += amount * (offsetY * 0.5 + roundY + 0.25);
                  _vx += amount * (offsetX * 0.5 + roundX + offsetX / offsetY * 0.25);
                } else {
                  _vy += amount * (offsetY * 0.5 + roundY - 0.25);
                  _vx += amount * (offsetX * 0.5 + roundX - offsetX / offsetY * 0.25);
                }
              }
            }
        }`;
    }

    get name(): string {
        return 'boarders';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Boarders2Func extends VariationShaderFunc2D {
    PARAM_C = 'c'
    PARAM_LEFT = 'left'
    PARAM_RIGHT = 'right'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 0.40 },
            { name: this.PARAM_LEFT, type: VariationParamType.VP_FLOAT, initialValue: 0.65 },
            { name: this.PARAM_RIGHT, type: VariationParamType.VP_FLOAT, initialValue: 0.35 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // boarders2 by Xyrus02, http://xyrus02.deviantart.com/art/Boarders2-plugin-for-Apophysis-173427128
        return `{
          float amount = ${variation.amount.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float left = ${variation.params.get(this.PARAM_LEFT)!.toWebGl()};
          float right = ${variation.params.get(this.PARAM_RIGHT)!.toWebGl()};
          float roundX = float(int(_tx+0.5));
          float roundY = float(int(_ty+0.5));
          
          float _c = abs(c);
          float _cl = abs(left);
          float _cr = abs(right);
          _c = (_c == 0.0 ? EPSILON : _c);
          _cl = (_cl == 0.0 ? EPSILON : _cl);
          _cr = (_cr == 0.0 ? EPSILON : _cr);
          _cl = _c * _cl;
          _cr = _c + (_c * _cr);
    
          float offsetX = _tx - roundX;
          float offsetY = _ty - roundY;
          if (rand8(tex, rngState) >= _cr) {
            _vx += amount * (offsetX * _c + roundX);
            _vy += amount * (offsetY * _c + roundY);
          } else {
            if (abs(offsetX) >= abs(offsetY)) {
              if (offsetX >= 0.0) {
                _vx += amount * (offsetX * _c + roundX + _cl);
                _vy += amount * (offsetY * _c + roundY + _cl * offsetY / offsetX);
              } else {
                 _vx += amount * (offsetX * _c + roundX - _cl);
                _vy += amount * (offsetY * _c + roundY - _cl * offsetY / offsetX);
              }
            } else {
              if (offsetY >= 0.0) {
                _vy += amount * (offsetY * _c + roundY + _cl);
                _vx += amount * (offsetX * _c + roundX + offsetX / offsetY * _cl);
              } else {
                _vy += amount * (offsetY * _c + roundY - _cl);
                _vx += amount * (offsetX * _c + roundX - offsetX / offsetY * _cl);
              }
            }
          }
        }`;
    }

    get name(): string {
        return 'boarders2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BSplitFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
         // author Raykoid666, transcribed and modded by Nic Anderson, chronologicaldot, date July 19, 2014 (transcribe)
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          if (_tx + x == 0.0 || _tx + x == M_PI) {
            _vx += 10000.0;
            _vy += 10000.0;
          } else {
            _vx += amount / tan(_tx + x) * cos(_ty + y);
            _vy += amount / sin(_tx + x) * (-1.0 * _ty + y);
          }
        }`;
    }

    get name(): string {
        return 'bsplit';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BSwirlFunc extends VariationShaderFunc2D {
    PARAM_IN = 'in'
    PARAM_OUT = 'out'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_IN, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_OUT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // bSwirl by Michael Faber, http://michaelfaber.deviantart.com/art/bSeries-320574477
        return `{
          float amount = ${variation.amount.toWebGl()};
          float _in = ${variation.params.get(this.PARAM_IN)!.toWebGl()};
          float _out = ${variation.params.get(this.PARAM_OUT)!.toWebGl()};
          float tau, sigma;
          float temp;
          float cosht, sinht;
          float sins, coss;
        
          tau = 0.5 * (log(sqr(_tx + 1.0) + sqr(_ty)) - log(sqr(_tx - 1.0) + sqr(_ty)));
          sigma = M_PI - atan2(_ty, _tx + 1.0) - atan2(_ty, 1.0 - _tx);
        
          sigma = sigma + tau * _out + _in / tau;
        
          sinht = sinh(tau);
          cosht = cosh(tau);
          sins = sin(sigma);
          coss = cos(sigma);
          temp = cosht - coss;
          if (temp != 0.0) {
            _vx += amount * sinht / temp;
            _vy += amount * sins / temp;            
          }
        }`;
    }

    get name(): string {
        return 'bSwirl';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BTransformFunc extends VariationShaderFunc2D {
    PARAM_ROTATE = 'rotate'
    PARAM_POWER = 'power'
    PARAM_MOVE = 'move'
    PARAM_SPLIT = 'split'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ROTATE, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
                { name: this.PARAM_POWER, type: VariationParamType.VP_INT, initialValue: 1 },
                { name: this.PARAM_MOVE, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
                { name: this.PARAM_SPLIT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // bTransform by Michael Faber, http://michaelfaber.deviantart.com/art/bSeries-320574477
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rotate = ${variation.params.get(this.PARAM_ROTATE)!.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float move = ${variation.params.get(this.PARAM_MOVE)!.toWebGl()};
          float split = ${variation.params.get(this.PARAM_SPLIT)!.toWebGl()};
       
          float tau, sigma;
          float temp;
          float cosht, sinht;
          float sins, coss;
        
          tau = 0.5 * (log(sqr(_tx + 1.0) + sqr(_ty)) - log(sqr(_tx - 1.0) + sqr(_ty))) / float(power) + move;
          sigma = M_PI - atan2(_ty, _tx + 1.0) - atan2(_ty, 1.0 - _tx) + rotate;
          sigma = sigma / float(power) + (2.0*M_PI) / float(power) * floor(rand8(tex, rngState) * float(power));
        
          if (_tx >= 0.0)
            tau += split;
          else
            tau -= split;
          sinht = sinh(tau);
          cosht = cosh(tau);
          sins = sin(sigma);
          coss = cos(sigma);
          temp = cosht - coss;
          _vx += amount * sinht / temp;
          _vy += amount * sins / temp;
        }`;
    }

    get name(): string {
        return 'bTransform';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ButterflyFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* wx is weight*4/sqrt(3*pi) */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float wx = amount * 1.3029400317411197908970256609023;
          float y2 = _ty * 2.0;
          float r = wx * sqrt(abs(_ty * _tx) / (EPSILON + _tx * _tx + y2 * y2));
          _vx += r * _tx;
          _vy += r * y2;
        }`;
    }

    get name(): string {
        return 'butterfly';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ButterflyFayFunc extends VariationShaderFunc2D {
    PARAM_CYCLES = 'cycles'
    PARAM_OFFSET = 'offset'
    PARAM_UNIFIED_INNER_OUTER = 'unified_inner_outer'
    PARAM_OUTER_MODE = 'outer_mode'
    PARAM_INNER_MODE = 'inner_mode'
    PARAM_OUTER_SPREAD = 'outer_spread'
    PARAM_INNER_SPREAD = 'inner_spread'
    PARAM_OUTER_SPREAD_RATIO = 'outer_spread_ratio'
    PARAM_INNER_SPREAD_RATIO = 'inner_spread_ratio'
    PARAM_SPREAD_SPLIT = 'spread_split'
    PARAM_FILL = 'fill'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CYCLES, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_OFFSET, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_UNIFIED_INNER_OUTER, type: VariationParamType.VP_INT, initialValue: 1 },
            { name: this.PARAM_OUTER_MODE, type: VariationParamType.VP_INT, initialValue: 1 },
            { name: this.PARAM_INNER_MODE, type: VariationParamType.VP_INT, initialValue: 1 },
            { name: this.PARAM_OUTER_SPREAD, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_INNER_SPREAD, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_OUTER_SPREAD_RATIO, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_INNER_SPREAD_RATIO, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SPREAD_SPLIT, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_FILL, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }
        ]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Bubble Wrap - WIP Plugin by slobo777
        // http://slobo777.deviantart.com/art/Bubble-Wrap-WIP-Plugin-112370125
        return `{
          float amount = ${variation.amount.toWebGl()};
          float cycles = ${variation.params.get(this.PARAM_CYCLES)!.toWebGl()};
          float offset = ${variation.params.get(this.PARAM_OFFSET)!.toWebGl()};
          int unified_inner_outer = ${variation.params.get(this.PARAM_UNIFIED_INNER_OUTER)!.toWebGl()};
          int outer_mode = ${variation.params.get(this.PARAM_OUTER_MODE)!.toWebGl()};
          int inner_mode = ${variation.params.get(this.PARAM_INNER_MODE)!.toWebGl()};
          float outer_spread = ${variation.params.get(this.PARAM_OUTER_SPREAD)!.toWebGl()};
          float inner_spread = ${variation.params.get(this.PARAM_INNER_SPREAD)!.toWebGl()};
          float outer_spread_ratio = ${variation.params.get(this.PARAM_OUTER_SPREAD_RATIO)!.toWebGl()};
          float inner_spread_ratio = ${variation.params.get(this.PARAM_INNER_SPREAD_RATIO)!.toWebGl()};
          float spread_split  = ${variation.params.get(this.PARAM_SPREAD_SPLIT)!.toWebGl()};
          float fill  = ${variation.params.get(this.PARAM_FILL)!.toWebGl()};
          
          float cycle_length = 2.0 * M_PI;
          float radians_to_close = 2.0 * M_PI * M_PI * M_PI; 
          float cycles_to_close = radians_to_close / cycle_length; 
          float number_of_cycles;
          if (cycles == 0.0) {
            number_of_cycles = cycles_to_close;
          } else {
            number_of_cycles = cycles;
          }
          if (outer_mode > 5 || outer_mode < 0) {
            outer_mode = 0;
          }
          if (inner_mode > 5 || inner_mode < 0) {
            inner_mode = 0;
          }
          
          float theta = atan2(_ty, _tx); 
          float t = number_of_cycles * theta;       
          float rin = spread_split * sqrt((_tx * _tx) + (_ty * _ty));
          float r = 0.5 * (exp(cos(t)) - (2.0 * cos(4.0 * t)) - pow(abs(sin(t / 12.0)), 5.0) + offset);
         
          if (fill != 0.0) {
            r = r + (fill * (rand8(tex, rngState) - 0.5));
          }
        
          float x = r * sin(t);
          float y = -1.0 * r * cos(t); 
          float xin, yin;
          float rinx, riny;
          
          if ((abs(rin) > abs(r)) || (unified_inner_outer == 1)) { 
            if(outer_mode==0) { 
              _vx += amount * x;
              _vy += amount * y;
            }
            else if(outer_mode==1) {
              rinx = (rin * outer_spread * outer_spread_ratio) - (outer_spread * outer_spread_ratio) + 1.0;
              riny = (rin * outer_spread) - outer_spread + 1.0;
              _vx += amount * rinx * x;
              _vy += amount * riny * y;
            }
            else if(outer_mode==2) {
              xin = abs(_tx);
              yin = abs(_ty);
              if (x < 0.0) {
                xin = xin * -1.0;
              }
              if (y < 0.0) {
                yin = yin * -1.0;
              }
              _vx += amount * (x + (outer_spread * outer_spread_ratio * (xin - x)));
              _vy += amount * (y + (outer_spread * (yin - y)));
            }
            else if(outer_mode==3) {
              xin = abs(_tx);
              yin = abs(_ty);
              if (x < 0.0) {
                xin = xin * -1.0;
              }
              if (y < 0.0) {
                yin = yin * -1.0;
              }
              _vx += amount * (x + (outer_spread * outer_spread_ratio * xin));
              _vy += amount * (y + (outer_spread * yin));
            }
            else if(outer_mode==4) {
              rinx = (0.5 * rin) + (outer_spread * outer_spread_ratio);
              riny = (0.5 * rin) + outer_spread;
              _vx += amount * rinx * x;
              _vy += amount * riny * y;
            }
            else if(outer_mode==5) { 
              _vx += amount * (x + (outer_spread * outer_spread_ratio * _tx));
              _vy += amount * (y + (outer_spread * _ty));
            }
            else {
              _vx += amount * x;
              _vy += amount * y;
            }
          } else {        
            if(inner_mode==0) { 
              _vx += amount * x;
              _vy += amount * y;
            }
            else if(inner_mode==1) {
              rinx = (rin * inner_spread * inner_spread_ratio) - (inner_spread * inner_spread_ratio) + 1.0;
              riny = (rin * inner_spread) - inner_spread + 1.0;
              _vx += amount * rinx * x;
              _vy += amount * riny * y;
            }
            else if(inner_mode==2) {
              xin = abs(_tx);
              yin = abs(_ty);
              if (x < 0.0) {
                xin = xin * -1.0;
              }
              if (y < 0.0) {
                yin = yin * -1.0;
              }
              _vx += amount * (x - (inner_spread * inner_spread_ratio * (x - xin)));
              _vy += amount * (y - (inner_spread * (y - yin)));
            }
            else if(inner_mode==3) {
              xin = abs(_tx);
              yin = abs(_ty);
              if (x < 0.0) {
                xin = xin * -1.0;
              }
              if (y < 0.0) {
                yin = yin * -1.0;
              }
              _vx += amount * (x - (inner_spread * inner_spread_ratio * xin));
              _vy += amount * (y - (inner_spread * yin));
            }
            else if(inner_mode==4) {
              rinx = (0.5 * rin) + (inner_spread * inner_spread_ratio);
              riny = (0.5 * rin) + inner_spread;
              _vx += amount * rinx * x;
              _vy += amount * riny * y;
            }
            else if(inner_mode==5) { 
              _vx += amount * (x + (inner_spread * inner_spread_ratio * _tx));
              _vy += amount * (y + (inner_spread * _ty));
            }
            else {
              _vx += amount * x;
              _vy += amount * y;
            }
          }
        }`;
    }

    get name(): string {
        return 'butterfly_fay';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class BWraps7Func extends VariationShaderFunc2D {
    PARAM_CELLSIZE = 'cellsize'
    PARAM_SPACE = 'space'
    PARAM_GAIN = 'gain'
    PARAM_INNER_TWIST = 'inner_twist'
    PARAM_OUTER_TWIST = 'outer_twist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CELLSIZE, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_SPACE, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_GAIN, type: VariationParamType.VP_FLOAT, initialValue: 2.00 },
            { name: this.PARAM_INNER_TWIST, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_OUTER_TWIST, type: VariationParamType.VP_FLOAT, initialValue: 0.00 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Bubble Wrap - WIP Plugin by slobo777
        // http://slobo777.deviantart.com/art/Bubble-Wrap-WIP-Plugin-112370125
        return `{
          float amount = ${variation.amount.toWebGl()};
          float cellsize = ${variation.params.get(this.PARAM_CELLSIZE)!.toWebGl()};
          float space = ${variation.params.get(this.PARAM_SPACE)!.toWebGl()};
          float gain = ${variation.params.get(this.PARAM_GAIN)!.toWebGl()};
          float inner_twist = ${variation.params.get(this.PARAM_INNER_TWIST)!.toWebGl()};
          float outer_twist = ${variation.params.get(this.PARAM_OUTER_TWIST)!.toWebGl()};
          float radius = 0.5 * (cellsize / (1.0 + space * space));
          float _g2 = gain * gain + 1.0e-6;
          float max_bubble = _g2 * radius;    
          if (max_bubble > 2.0) {
            max_bubble = 1.0;
          } else {    
            max_bubble *= 1.0 / ((max_bubble * max_bubble) / 4.0 + 1.0);
          }
          float _r2 = radius * radius;
          float _rfactor = radius / max_bubble;            
          float Vx = _tx;
          float Vy = _ty;
          if (abs(cellsize) < EPSILON) {    
            _vx += amount * Vx;
            _vy += amount * Vy;
          }
          else {
            float Cx = (floor(Vx / cellsize) + 0.5) * cellsize;
            float Cy = (floor(Vy / cellsize) + 0.5) * cellsize;
            float Lx = Vx - Cx;
            float Ly = Vy - Cy;
            if ((Lx * Lx + Ly * Ly) > _r2) {
              _vx += amount * Vx;
              _vy += amount * Vy;
            }
            else {
              Lx *= _g2;
              Ly *= _g2;
              float r = _rfactor / ((Lx * Lx + Ly * Ly) / 4.0 + 1.0);
              Lx *= r;
              Ly *= r;
              r = (Lx * Lx + Ly * Ly) / _r2; 
              float theta = inner_twist * (1.0 - r) + outer_twist * r;
              float s = sin(theta);
              float c = cos(theta);  
              Vx = Cx + c * Lx + s * Ly;
              Vy = Cy - s * Lx + c * Ly;
              _vx += amount * Vx;
              _vy += amount * Vy;
            }
          }
        }`;
    }

    get name(): string {
        return 'bwraps7';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function registerVars_2D_PartA() {
    VariationShaders.registerVar(new ApocarpetFunc())
    VariationShaders.registerVar(new ApollonyFunc())
    VariationShaders.registerVar(new ArchFunc())
    VariationShaders.registerVar(new AsteriaFunc())
    VariationShaders.registerVar(new AtanFunc())
    VariationShaders.registerVar(new AugerFunc())
    VariationShaders.registerVar(new BarycentroidFunc())
    VariationShaders.registerVar(new BCollideFunc())
    VariationShaders.registerVar(new BentFunc())
    VariationShaders.registerVar(new Bent2Func())
    VariationShaders.registerVar(new BiLinearFunc())
    VariationShaders.registerVar(new BipolarFunc())
    VariationShaders.registerVar(new Bipolar2Func())
    VariationShaders.registerVar(new BladeFunc())
    VariationShaders.registerVar(new BlobFunc())
    VariationShaders.registerVar(new BlockYFunc())
    VariationShaders.registerVar(new BlurCircleFunc())
    VariationShaders.registerVar(new BlurLinearFunc())
    VariationShaders.registerVar(new BlurPixelizeFunc())
    VariationShaders.registerVar(new BModFunc())
    VariationShaders.registerVar(new BoardersFunc())
    VariationShaders.registerVar(new Boarders2Func())
    VariationShaders.registerVar(new BSplitFunc())
    VariationShaders.registerVar(new BSwirlFunc())
    VariationShaders.registerVar(new BTransformFunc())
    VariationShaders.registerVar(new ButterflyFunc())
    VariationShaders.registerVar(new ButterflyFayFunc())
    VariationShaders.registerVar(new BWraps7Func())
}
