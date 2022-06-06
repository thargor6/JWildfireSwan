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

/*
  be sure to import this class somewhere and call registerVars_3D_PartH()
 */
class HelicoidFunc extends VariationShaderFunc3D {
    PARAM_FREQUENCY = 'frequency'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FREQUENCY, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* helicoid by zy0rg, http://zy0rg.deviantart.com/art/Helix-Helicoid-687956099 converted by Brad Stefanov */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float frequency = ${variation.params.get(this.PARAM_FREQUENCY)!.toWebGl()};
            float range = sqrt(_tx * _tx + _ty * _ty);
            float s = sin(_tz * (2.0*M_PI) * frequency + atan2(_ty, _tx));
            float c = cos(_tz * (2.0*M_PI) * frequency + atan2(_ty, _tx));      
            _vx += amount * c * range;
            _vy += amount * s * range;
            _vz += amount * _tz;
        }`;
    }

    get name(): string {
        return 'helicoid';
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

class Hypershift2Func extends VariationShaderFunc3D {
    PARAM_P = 'p'
    PARAM_Q = 'q'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_P, type: VariationParamType.VP_NUMBER, initialValue: 3 },
            { name: this.PARAM_Q, type: VariationParamType.VP_NUMBER, initialValue: 7 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // "Hypershift2" variation created by tatasz implemented into JWildfire by Brad Stefanov https://www.deviantart.com/tatasz/art/Hyperstuff-721510796
        return `{
            float amount = ${variation.amount.toWebGl()};
            int p = ${variation.params.get(this.PARAM_P)!.toWebGl()};
            int q = ${variation.params.get(this.PARAM_Q)!.toWebGl()};
            float pq = M_PI / float(q);
            float pp = M_PI / float(p);
            float spq = sin(pq);
            float spp = sin(pp);
            float shift = sin(M_PI * 0.5 - pq - pp);
            shift = shift / sqrt(1.0 - sqr(spq) - sqr(spp));
            float scale2 = (1.0 / sqrt(sqr(sin(M_PI / 2.0 + pp)) / sqr(spq) - 1.0));
            scale2 = scale2 * (sin(M_PI / 2.0 + pp) / spq - 1.0);
            float scale = 1.0 - shift * shift;
        
            float FX = _tx * scale2;
            float FY = _ty * scale2;
        
            float rad = 1.0 / (FX * FX + FY * FY);
            float x = rad * FX + shift;
            float y = rad * FY;
            rad = amount * scale / (x * x + y * y);
            float angle = (float(modulo(iRand8(tex, 32768, rngState), p)) * 2.0 + 1.0) * M_PI / float(p);
            float X = rad * x + shift;
            float Y = rad * y;
            float cosa = cos(angle);
            float sina = sin(angle);
            _vx = cosa * X - sina * Y;
            _vy = sina * X + cosa * Y;
            _vz = _tz * rad;
          }`;
    }

    get name(): string {
        return 'hypershift2';
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
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

class LazySensenFunc extends VariationShaderFunc3D {
    PARAM_SCALE_X = 'scale_x'
    PARAM_SCALE_Y = 'scale_y'
    PARAM_SCALE_Z = 'scale_z'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALE_X, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SCALE_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SCALE_Z, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /*
         * lazysensen by bezo97,
         * https://bezo97.tk/plugins.html
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float scale_x = ${variation.params.get(this.PARAM_SCALE_X)!.toWebGl()};
          float scale_y = ${variation.params.get(this.PARAM_SCALE_Y)!.toWebGl()};
          float scale_z = ${variation.params.get(this.PARAM_SCALE_Z)!.toWebGl()};
           if (scale_x != 0.0) {
            int nr = int(floor(_tx * scale_x));
            if (nr >= 0) {
              if (modulo(nr, 2) == 1)
                _tx = -_tx;
            } else {
              if (modulo(nr, 2) == 0)
                _tx = -_tx;
            }
          }
          if (scale_y != 0.0) {
            int nr = int(floor(_ty * scale_y));
            if (nr >= 0) {
              if (modulo(nr, 2) == 1)
                _ty = -_ty;
            } else {
              if (modulo(nr, 2) == 0)
                _ty = -_ty;
            }
          }
          if (scale_z != 0.0) {
            int nr = int(floor(_tz * scale_z));
            if (nr >= 0) {
              if (modulo(nr, 2) == 1)
                _tz = -_tz;
            } else {
              if (modulo(nr, 2) == 0)
                _tz = -_tz;
            }
          }
          _vx += amount * _tx;
          _vy += amount * _ty;
          _vz += amount * _tz;
        }`;
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get name(): string {
        return 'lazysensen';
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
          FastNoise n = initFastNoiseStruct();
          _vx += amount * _tx + singleValue(n, 123, _tx, _ty, _tz)*0.5; 
          _vy += amount * _ty + singleValue(n, 1234, _tx, _ty, _tz)*0.5;
          _vz += amount * _tz + singleValue(n, 12345, _tx, _ty, _tz)*0.5;
        }`;
    }

    get name(): string {
        return 'linear3D';
    }

    // TODO remove
    get funcDependencies(): string[] {
        return [LIB_FAST_NOISE_BASE, LIB_FAST_NOISE_VALUE_NOISE];
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

class Petal3DFunc extends VariationShaderFunc3D {
    PARAM_MODE = 'mode'
    PARAM_X1 = 'x1'
    PARAM_X2 = 'x2'
    PARAM_X3 = 'x3'
    PARAM_X4 = 'x4'
    PARAM_X5 = 'x5'
    PARAM_X6 = 'x6'
    PARAM_Y1 = 'y1'
    PARAM_Y2 = 'y2'
    PARAM_Y3 = 'y3'
    PARAM_Y4 = 'y4'
    PARAM_Y5 = 'y5'
    PARAM_Y6 = 'y6'
    PARAM_Z1 = 'z1'
    PARAM_Z2 = 'z2'
    PARAM_Z3 = 'z3'
    PARAM_Z4 = 'z4'
    PARAM_Z5 = 'z5'
    PARAM_Z6 = 'z6'
    PARAM_WARP = 'warp'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_MODE, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_X1, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_X2, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_X3, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_X4, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_X5, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_X6, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y1, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y2, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y3, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y4, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y5, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Y6, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z1, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z2, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z3, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z4, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z5, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_Z6, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_WARP, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // petal by Raykoid666,
        // http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        // Added variables by Brad Stefanov
        return `{
          float amount = ${variation.amount.toWebGl()};
          int mode = ${variation.params.get(this.PARAM_MODE)!.toWebGl()};
          float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
          float x2 = ${variation.params.get(this.PARAM_X2)!.toWebGl()};
          float x3 = ${variation.params.get(this.PARAM_X3)!.toWebGl()};
          float x4 = ${variation.params.get(this.PARAM_X4)!.toWebGl()};
          float x5 = ${variation.params.get(this.PARAM_X5)!.toWebGl()};
          float x6 = ${variation.params.get(this.PARAM_X6)!.toWebGl()};
          float y1 = ${variation.params.get(this.PARAM_Y1)!.toWebGl()};
          float y2 = ${variation.params.get(this.PARAM_Y2)!.toWebGl()};
          float y3 = ${variation.params.get(this.PARAM_Y3)!.toWebGl()};
          float y4 = ${variation.params.get(this.PARAM_Y4)!.toWebGl()};
          float y5 = ${variation.params.get(this.PARAM_Y5)!.toWebGl()};
          float y6 = ${variation.params.get(this.PARAM_Y6)!.toWebGl()};
          float z1 = ${variation.params.get(this.PARAM_Z1)!.toWebGl()};
          float z2 = ${variation.params.get(this.PARAM_Z2)!.toWebGl()};
          float z3 = ${variation.params.get(this.PARAM_Z3)!.toWebGl()};
          float z4 = ${variation.params.get(this.PARAM_Z4)!.toWebGl()};
          float z5 = ${variation.params.get(this.PARAM_Z5)!.toWebGl()};
          float z6 = ${variation.params.get(this.PARAM_Z6)!.toWebGl()};
          float warp = ${variation.params.get(this.PARAM_WARP)!.toWebGl()};
          float ax = cos(_tx * warp); 
          float bx = (cos(_tx + x1) * cos(_ty + x2)) * (cos(_tx + x3) * cos(_ty + x4)) * (cos(_tx + x5) * cos(_ty + x6));
          float by = (sin(_tx + y1) * cos(_ty + y2)) * (sin(_tx + y3) * cos(_ty + y4)) * (sin(_tx + y5) * cos(_ty + y6));
          float zy = (sin(_tz + z1) * cos(_ty + z2)) * (sin(_tz + z3) * cos(_ty + z4)) * (sin(_tz + z5) * cos(_ty + z6));
          float zx = (sin(_tz + z1) * cos(_tx + z2)) * (sin(_tz + z3) * cos(_tx + z4)) * (sin(_tz + z5) * cos(_tx + z6));
          float yz = (sin(_ty + z1) * cos(_tz + z2)) * (sin(_ty + z3) * cos(_tz + z4)) * (sin(_ty + z5) * cos(_tz + z6));
          float xz = (sin(_tx + z1) * cos(_tz + z2)) * (sin(_tx + z3) * cos(_tz + z4)) * (sin(_tx + z5) * cos(_tz + z6));
          _vx += amount * ax * bx;
          _vy += amount * ax * by;
          if (mode <= 0) {
           _vz += amount * _tz;
          } else if (mode == 1) {
           _vz += amount * ax * zx;
          } else if (mode == 2) {
           _vz += amount * ax * zy;
          } else if (mode == 3) {
           _vz += amount * ax * yz;
          } else if (mode >= 4) {
           _vz += amount * ax * xz;
          }
        }`;
    }

    get name(): string {
        return 'petal3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Petal3DApoFunc extends VariationShaderFunc3D {
    PARAM_WIDTH = 'width'
    PARAM_ZSHAPE = 'Zshape'
    PARAM_SCALE1 = 'scale1'
    PARAM_SCALE2 = 'scale2'
    PARAM_STYLE = 'style'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_WIDTH, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_ZSHAPE, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_SCALE1, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_SCALE2, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_STYLE, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // petal3D by Larry Berlin (aporev)
        // https://www.deviantart.com/aporev/art/petal3D-plugin-139564066
        return `{
          float amount = ${variation.amount.toWebGl()};
          float width = ${variation.params.get(this.PARAM_WIDTH)!.toWebGl()};
          float Zshape = ${variation.params.get(this.PARAM_ZSHAPE)!.toWebGl()};
          float scale1 = ${variation.params.get(this.PARAM_SCALE1)!.toWebGl()};
          float scale2 = ${variation.params.get(this.PARAM_SCALE2)!.toWebGl()};
          float style = ${variation.params.get(this.PARAM_STYLE)!.toWebGl()};
          float shaper, shaper2, tmpPY, tmpPZ, tmpSmth;
          float squeeze;
          int posNeg = 1;
          if(rand8(tex, rngState) < 0.5) {
              posNeg = -1;
          }
          float styleSign = style >= 0.0 ? 1.0 : -1.0; 
          float a = cos(_tx);
          float bx = (cos(_tx)*cos(_ty))*(cos(_tx)*cos(_ty))*(cos(_tx)*cos(_ty)); 
          float by = (sin(_tx)*cos(_ty))*(sin(_tx)*cos(_ty))*(sin(_tx)*cos(_ty));         
          _vx += amount * a * bx;
          tmpPY = amount * a * by * width;
          _vy += tmpPY;      
          if(abs(scale1)>1.0) {
              squeeze = abs(scale1)-1.0;  
              shaper  = (-sin(_tx*scale1*M_PI))*0.5+(_tx*squeeze*0.5)+sin(abs(_ty*scale2*M_PI)); 
              shaper2 = (-sin(_tx*scale1*M_PI))*0.5+(_tx*squeeze*0.5)+tmpPY*scale2*0.5;
          }
          else {
              squeeze = 0.0;
              shaper  = (-sin(_tx*scale1*M_PI))*0.5+sin(abs(_ty*scale2*M_PI));
              shaper2 = (-sin(_tx*scale1*M_PI))*0.5+tmpPY*scale2*0.5;
          }
          tmpSmth=0.5-sqr(style);
          tmpPZ = shaper;
          if(abs(style)>0.707106781) {
            tmpPZ = shaper2*styleSign;
          }
          else if(style<0.0) {
            tmpPZ = tmpSmth*2.0*shaper - (1.0-tmpSmth*2.0)*shaper2;
          }
          else if(style>0.0) {
            tmpPZ = tmpSmth*2.0*shaper + (1.0-tmpSmth*2.0)*shaper2;
          }
          _vz += amount*tmpPZ* Zshape;  
        }`;
    }

    get name(): string {
        return 'petal3D_apo';
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

export function registerVars_3D_PartH() {
    VariationShaders.registerVar(new HelicoidFunc())
    VariationShaders.registerVar(new HemisphereFunc())
    VariationShaders.registerVar(new HOFunc())
    VariationShaders.registerVar(new Hypershift2Func())
    VariationShaders.registerVar(new Hypertile3DFunc())
    VariationShaders.registerVar(new Hypertile3D1Func())
    VariationShaders.registerVar(new Hypertile3D2Func())
    VariationShaders.registerVar(new Julia3DFunc())
    VariationShaders.registerVar(new Julia3DZFunc())
    VariationShaders.registerVar(new LazySensenFunc())
    VariationShaders.registerVar(new LineFunc())
    VariationShaders.registerVar(new Linear3DFunc())
    VariationShaders.registerVar(new LinearT3DFunc())
    VariationShaders.registerVar(new Loonie_3DFunc())
    VariationShaders.registerVar(new OctagonFunc())
    VariationShaders.registerVar(new Ovoid3DFunc())
    VariationShaders.registerVar(new PDJ3DFunc())
    VariationShaders.registerVar(new Petal3DFunc())
    VariationShaders.registerVar(new Petal3DApoFunc())
    VariationShaders.registerVar(new Pie3DFunc())
    VariationShaders.registerVar(new Poincare3DFunc())
    VariationShaders.registerVar(new PointGrid3DWFFunc())
    VariationShaders.registerVar(new Popcorn2_3DFunc())
    VariationShaders.registerVar(new PostMirrorWFFunc())
}
