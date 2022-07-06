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
    FUNC_LOG10,
    FUNC_ROUND,
    FUNC_SINH,
    FUNC_TANH,
    FUNC_TRUNC
} from 'Frontend/flames/renderer/variations/variation-math-functions';
import {M_PI} from 'Frontend/flames/renderer/mathlib';

/*
  be sure to import this class somewhere and call registerVars_2D_PartT()
 */
class TanFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Tangent TAN
        return `{
          float amount = ${variation.amount.toWebGl()};
          float tansin = sin(2.0 * _tx);
          float tancos = cos(2.0 * _tx);
          float tansinh = sinh(2.0 * _ty);
          float tancosh = cosh(2.0 * _ty);
          float d = (tancos + tancosh);
          if (d != 0.0) {
            float tanden = 1.0 / d;
            _vx += amount * tanden * tansin;
            _vy += amount * tanden * tansinh;       
          }
        }`;
    }

    get name(): string {
        return 'tan';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TanhFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Tangent TANH
        return `{
          float amount = ${variation.amount.toWebGl()};
          float tanhsin = sin(2.0 * _ty);
          float tanhcos = cos(2.0 * _ty);
          float tanhsinh = sinh(2.0 * _tx);
          float tanhcosh = cosh(2.0 * _tx);
          float d = (tanhcos + tanhcosh);
          if (d != 0.0) {
            float tanhden = 1.0 / d;
            _vx += amount * tanhden * tanhsinh;
            _vy += amount * tanhden * tanhsin;
          }
        }`;
    }

    get name(): string {
        return 'tanh';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TanhqFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Tanhq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float abs_v = hypot(_ty, _tz);
          float sysz = sqr(_ty) + sqr(_tz);
          float ni = amount / (sqr(_tx) + sysz);
          float s = sin(abs_v);
          float c = cos(abs_v);
          float sh = sinh(_tx);
          float ch = cosh(_tx);
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
        return 'tanhq';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TanCosFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // tancos by Raykoid666, http://raykoid666.deviantart.com/art/plugin-pack-3-100510461?q=gallery%3ARaykoid666%2F11060240&qo=16
        return `{
          float amount = ${variation.amount.toWebGl()};
          float d1 = EPSILON + sqr(_tx) + sqr(_ty);
          float d2 = amount / d1;
          _vx += d2 * (tanh(d1) * (2.0 * _tx));
          _vy += d2 * (cos(d1) * (2.0 * _ty));
        }`;
    }

    get name(): string {
        return 'tancos';
    }

    get funcDependencies(): string[] {
        return [FUNC_TANH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TangentFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float d = cos(_ty);
          if (d != 0.0) {
            _vx += amount * sin(_tx) / d;
            _vy += amount * tan(_ty);  
          }
        }`;
    }

    get name(): string {
        return 'tangent';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TargetFunc extends VariationShaderFunc2D {
    PARAM_EVEN = 'even'
    PARAM_ODD = 'odd'
    PARAM_SIZE = 'size'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_EVEN, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_ODD, type: VariationParamType.VP_FLOAT, initialValue: 0.6 },
            { name: this.PARAM_SIZE, type: VariationParamType.VP_FLOAT, initialValue: M_PI / 2.0 }
        ]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* target by Michael Faber, http://michaelfaber.deviantart.com/art/Target-362520023?q=gallery%3Afractal-resources%2F24660058&qo=0 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float even = ${variation.params.get(this.PARAM_EVEN)!.toWebGl()};
          float odd = ${variation.params.get(this.PARAM_ODD)!.toWebGl()};   
          float size = ${variation.params.get(this.PARAM_SIZE)!.toWebGl()};
          float t_size_2 = 0.5 * size;
          float a = atan2(_ty, _tx);
          float r = sqrt(sqr(_tx) + sqr(_ty));
          float t = log(r);
          if (t < 0.0)
            t -= t_size_2;
          t = mod(abs(t), size);
          if (t < t_size_2)
            a += even;
          else
            a += odd;
          float s = sin(a);
          float c = cos(a);
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'target';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TargetSpFunc extends VariationShaderFunc2D {
    PARAM_TWIST = 'twist'
    PARAM_N_OF_SP = 'n_of_sp'
    PARAM_SIZE = 'size'
    PARAM_TIGHTNESS = 'tightness'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_TWIST, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_N_OF_SP, type: VariationParamType.VP_INT, initialValue: 1 },
            { name: this.PARAM_SIZE, type: VariationParamType.VP_FLOAT, initialValue: 1.25 },
            { name: this.PARAM_TIGHTNESS, type: VariationParamType.VP_FLOAT, initialValue: 0.55 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* target by Michael Faber,log spiral tweak by Dark-Beam */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float twist = ${variation.params.get(this.PARAM_TWIST)!.toWebGl()};
          int n_of_sp = ${variation.params.get(this.PARAM_N_OF_SP)!.toWebGl()};   
          float size = ${variation.params.get(this.PARAM_SIZE)!.toWebGl()};
          float tightness = ${variation.params.get(this.PARAM_TIGHTNESS)!.toWebGl()};
          float t_size_2 = 0.5 * size;
          float _rota = M_PI * twist;
          float _rotb = -M_PI + _rota;
          float a = atan2(_ty, _tx);
          float r = sqrt(sqr(_tx) + sqr(_ty));
          float t = tightness * log(r) + float(n_of_sp) * (1.0 / M_PI) * (a + M_PI);
          if (t < 0.0)
            t -= t_size_2;
          t = mod(abs(t), size);
          if (t < t_size_2)
            a += _rota;
          else
            a += _rotb;    
          float s = sin(a);
          float c = cos(a);  
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'target_sp';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TradeFunc extends VariationShaderFunc2D {
    PARAM_R1 = 'r1'
    PARAM_D1 = 'd1'
    PARAM_R2 = 'r2'
    PARAM_D2 = 'd2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_R1, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_D1, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_R2, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_D2, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* trade by Michael Faber,  http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r1 = ${variation.params.get(this.PARAM_R1)!.toWebGl()};
          float d1 = ${variation.params.get(this.PARAM_D1)!.toWebGl()};   
          float r2 = ${variation.params.get(this.PARAM_R2)!.toWebGl()};
          float d2 = ${variation.params.get(this.PARAM_D2)!.toWebGl()};
          float _c1 = r1 + d1;
          float _c2 = r2 + d2;    
         
          if (_tx > 0.0) {
            float r = sqrt(sqr(_c1 - _tx) + sqr(_ty));
            if (r <= r1) {
                r *= r2 / r1;
                float a = atan2(_ty, _c1 - _tx);
                float s = sin(a);
                float c = cos(a);
                _vx += amount * (r * c - _c2);
                _vy += amount * r * s;
            } else {
              _vx += amount * _tx;
              _vy += amount * _ty;
            }
          }
          
          else {
            float r = sqrt(sqr(-_c2 - _tx) + sqr(_ty));  
            if (r <= r2) {
              r *= r1 / r2;
              float a = atan2(_ty, -_c2 - _tx);
              float s = sin(a);
              float c = cos(a);
              _vx += amount * (r * c + _c1);
              _vy += amount * r * s;
            } else {
              _vx += amount * _tx;
              _vy += amount * _ty;
            }
          }
        }`;
    }

    get name(): string {
        return 'trade';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TruchetFunc extends VariationShaderFunc2D {
    PARAM_EXTENDED = 'extended'
    PARAM_EXPONENT = 'exponent'
    PARAM_ARC_WIDTH = 'arc_width'
    PARAM_ROTATION = 'rotation'
    PARAM_SIZE = 'size'
    PARAM_SEED = 'seed'
    PARAM_DIRECT_COLOR = 'direct_color'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_EXTENDED, type: VariationParamType.VP_INT, initialValue: 0 },
            { name: this.PARAM_EXPONENT, type: VariationParamType.VP_FLOAT, initialValue: 2.00 },
            { name: this.PARAM_ARC_WIDTH, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_ROTATION, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_SIZE, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_SEED, type: VariationParamType.VP_FLOAT, initialValue: 50.00 },
            { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_INT, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int extended = ${variation.params.get(this.PARAM_EXTENDED)!.toWebGl()};
          float exponent = ${variation.params.get(this.PARAM_EXPONENT)!.toWebGl()};
          float arc_width = ${variation.params.get(this.PARAM_ARC_WIDTH)!.toWebGl()};
          float rotation = ${variation.params.get(this.PARAM_ROTATION)!.toWebGl()};
          float size = ${variation.params.get(this.PARAM_SIZE)!.toWebGl()};
          float seed = ${variation.params.get(this.PARAM_SEED)!.toWebGl()};
          int direct_color = ${variation.params.get(this.PARAM_DIRECT_COLOR)!.toWebGl()};

          if (extended < 0) {
            extended = 0;
          } else if (extended > 1) {
            extended = 1;
          }
          if (exponent < 0.001) {
            exponent = 0.001;
          } else if (exponent > 2.0) {
            exponent = 2.0;
          }
          if (arc_width < 0.001) {
            arc_width = 0.001;
          } else if (arc_width > 1.0) {
            arc_width = 1.0;
          }
          if (size < 0.001) {
            size = 0.001;
          } else if (size > 10.0) {
            size = 10.0;
          }
          
          float n = exponent;
          float onen = 1.0 / exponent;
          float tdeg = rotation;
          float width = arc_width;
          seed = abs(seed);
          float seed2 = sqrt(seed + (seed / 2.0) + EPSILON) / ((seed * 0.5) + EPSILON) * 0.25;
        
          float x, y;
          int intx = 0;
          int inty = 0;
          float r = -tdeg;
          float r0 = 0.0;
          float r1 = 0.0;
          float rmax = 0.5 * (pow(2.0, 1.0 / n) - 1.0) * width;
          float scale = (cos(r) - sin(r)) / amount;
          float tiletype = 0.0;
          float randint = 0.0;
          float modbase = 65535.0;
          float multiplier = 32747.0;
          float offset = 12345.0;
          int randiter = 0;
       
          x = _tx * scale;
          y = _ty * scale;
          intx = int(round(x));
          inty = int(round(y));
    
          r = x - float(intx);
          if (r < 0.0) {
            x = 1.0 + r;
          } else {
            x = r;
          }
    
          r = y - float(inty);
          if (r < 0.0) {
            y = 1.0 + r;
          } else {
            y = r;
          }
        
          if (seed == 0.0) {
            tiletype = 0.0;
          } else if (seed == 1.0) {
            tiletype = 1.0;
          } else {
            if (extended == 0) {
              float xrand = round(_tx);
              float yrand = round(_ty);
              xrand = xrand * seed2;
              yrand = yrand * seed2;
              float niter = xrand + yrand + xrand * yrand;
              randint = (niter + seed) * seed2 / 2.0;
              randint = mod((randint * multiplier + offset), modbase);
            } else {
              seed = floor(seed);
              int xrand = int(round(_tx));
              int yrand = int(round(_ty));
              int niter = xrand + yrand + xrand * yrand;              
              if (niter > 12)
                niter = 12;
              randiter = 0;
              if(randiter < niter) {
                randiter += 1;
                randint = mod((randint * multiplier + offset), modbase);
                if(randiter < niter) {
                  randiter += 1;
                  randint = mod((randint * multiplier + offset), modbase);
                  if(randiter < niter) {
                    randiter += 1;
                    randint = mod((randint * multiplier + offset), modbase);
                    if(randiter < niter) {
                      randiter += 1;
                      randint = mod((randint * multiplier + offset), modbase);
                      if(randiter < niter) {
                        randiter += 1;
                        randint = mod((randint * multiplier + offset), modbase);
                        if(randiter < niter) {
                          randiter += 1;
                          randint = mod((randint * multiplier + offset), modbase);
                          if(randiter < niter) {
                            randiter += 1;
                            randint = mod((randint * multiplier + offset), modbase);
                            if(randiter < niter) {
                              randiter += 1;
                              randint = mod((randint * multiplier + offset), modbase);
                              if(randiter < niter) {
                                randiter += 1;
                                randint = mod((randint * multiplier + offset), modbase);
                                if(randiter < niter) {
                                  randiter += 1;
                                  randint = mod((randint * multiplier + offset), modbase);
                                  if(randiter < niter) {
                                    randiter += 1;
                                    randint = mod((randint * multiplier + offset), modbase);
                                    if(randiter < niter) {
                                      randiter += 1;
                                      randint = mod((randint * multiplier + offset), modbase);
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            tiletype = mod(randint, 2.0);
          }
        
          if (extended == 0) { 
            if (tiletype < 1.0) {
              r0 = pow((pow(abs(x), n) + pow(abs(y), n)), onen);
              r1 = pow((pow(abs(x - 1.0), n) + pow(abs(y - 1.0), n)), onen);
            } else {
              r0 = pow((pow(abs(x - 1.0), n) + pow(abs(y), n)), onen);
              r1 = pow((pow(abs(x), n) + pow(abs(y - 1.0), n)), onen);
            }
          } else {
            if (tiletype == 1.0) { 
              r0 = pow((pow(abs(x), n) + pow(abs(y), n)), onen);
              r1 = pow((pow(abs(x - 1.0), n) + pow(abs(y - 1.0), n)), onen);
            } else {
              r0 = pow((pow(abs(x - 1.0), n) + pow(abs(y), n)), onen);
              r1 = pow((pow(abs(x), n) + pow(abs(y - 1.0), n)), onen);
            }
          }
    
          r = abs(r0 - 0.5) / rmax;
          if (r < 1.0) {
            if (direct_color == 1) {
              _color = r0;
              if(_color<0.0) {
                _color = 0.0;
              }
              else if(_color>1.0) {
                _color = 1.0;
              }
            }
            _vx += size * (x + floor(_tx));
            _vy += size * (y + floor(_ty));
          }
    
          r = abs(r1 - 0.5) / rmax;
          if (r < 1.0) {
            if (direct_color == 1) {
              _color = 1.0 - r1;
              if(_color<0.0) {
                _color = 0.0;
              }
              else if(_color>1.0) {
                _color = 1.0;
              }
            }
            _vx += size * (x + floor(_tx));
            _vy += size * (y + floor(_ty));
          }
          
        }`;
    }

    get name(): string {
        return 'truchet';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_DC];
    }
}

class Truchet2Func extends VariationShaderFunc2D {
    PARAM_EXPONENT1 = 'exponent1'
    PARAM_EXPONENT2 = 'exponent2'
    PARAM_WIDTH1 = 'width1'
    PARAM_WIDTH2 = 'width2'
    PARAM_SCALE = 'scale'
    PARAM_SEED = 'seed'
    PARAM_INVERSE = 'inverse'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_EXPONENT1, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_EXPONENT2, type: VariationParamType.VP_FLOAT, initialValue: 2.00 },
            { name: this.PARAM_WIDTH1, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_WIDTH2, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_FLOAT, initialValue: 10.00 },
            { name: this.PARAM_SEED, type: VariationParamType.VP_FLOAT, initialValue: 50.00 },
            { name: this.PARAM_INVERSE, type: VariationParamType.VP_INT, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // truchet2 by tatasz
        // https://www.deviantart.com/tatasz/art/Truchet2-plugin-730170455 converted to JWF by Brad Stefanov and Jesus Sosa
        return `{
          float amount = ${variation.amount.toWebGl()};
          float exponent1 = ${variation.params.get(this.PARAM_EXPONENT1)!.toWebGl()};
          float exponent2 = ${variation.params.get(this.PARAM_EXPONENT2)!.toWebGl()};
          float width1 = ${variation.params.get(this.PARAM_WIDTH1)!.toWebGl()};
          float width2 = ${variation.params.get(this.PARAM_WIDTH2)!.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float seed = ${variation.params.get(this.PARAM_SEED)!.toWebGl()};
          int inverse = ${variation.params.get(this.PARAM_INVERSE)!.toWebGl()};
          
          float xp = abs((_tx / scale - floor(_tx / scale)) - 0.5) * 2.0;
          float width = width1 * (1.0 - xp) + xp * width2;
          width = (width < 1.0) ? width : 1.0;
          if (width <= 0.0) {
            _vx += (_tx) * amount;
            _vy += (_ty) * amount;
          } else {
            float xp2 = exponent1 * (1.0 - xp) + xp * exponent2;
            float n = xp2;
            n = (n < 2.0) ? n : 2.0;
            if (n <= 0.0) {
              _vx += (_tx) * amount;
              _vy += (_ty) * amount;
            } else {
              float onen = 1.0 / xp2;
              seed = abs(seed);
              float seed2 = sqrt(seed + (seed / 2.0) + EPSILON) / ((seed * 0.5) + EPSILON) * 0.25;
                      
              float r0 = 0.0;
              float r1 = 0.0;
        
              float x = _tx;
              float y = _ty;
              float intx = round(x);
              float inty = round(y);
        
              float r = x - float(intx);
              if (r < 0.0)
                x = 1.0 + r;
              else
                x = r;
        
              r = y - float(inty);
              if (r < 0.0)
                y = 1.0 + r;
              else
                y = r;
                        
              float tiletype = 0.0;
              if (seed == 0.0)
                tiletype = 0.0;
              else if (seed == 1.0)
                tiletype = 1.0;
              else {
                float xrand = round(_tx);
                float yrand = round(_ty);
                xrand = xrand * seed2;
                yrand = yrand * seed2;
                float niter = xrand + yrand + xrand * yrand;
                float randint = (niter + seed) * seed2 / 2.0;
                randint = mod((randint * 32747.0 + 12345.0), 65535.0);
                tiletype = mod(randint, 2.0);
              }
                      
              if (tiletype < 1.0) {
                r0 = pow((pow(abs(x), n) + pow(abs(y), n)), onen);
                r1 = pow((pow(abs(x - 1.0), n) + pow(abs(y - 1.0), n)), onen);
              } else {
                r0 = pow((pow(abs(x - 1.0), n) + pow(abs(y), n)), onen);
                r1 = pow((pow(abs(x), n) + pow(abs(y - 1.0), n)), onen);
              }
        
              float rmax = 0.5 * (pow(2.0, onen) - 1.0) * width;
              float r00 = abs(r0 - 0.5) / rmax;
              float r11 = abs(r1 - 0.5) / rmax;
           
              if (inverse == 0) {
                if (r00 < 1.0 || r11 < 1.0) {
                  _vx += (x + floor(_tx)) * amount;
                  _vy += (y + floor(_ty)) * amount;
                } else {  
                  _vx += 100.0;
                  _vy += 100.0;
                }
              } else {
                if (r00 > 1.0 && r11 > 1.0) {
                  _vx += (x + floor(_tx)) * amount;
                  _vy += (y + floor(_ty)) * amount;
                } else {
                  _vx += 10000.0;
                  _vy += 10000.0;
                }
              }
            }
          }
        }`;
    }

    get name(): string {
        return 'truchet2';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TwintrianFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = rand8(tex, rngState) * amount * _r;
        
          float sinr = sin(r);
          float cosr = cos(r);
          float diff = log10(sinr * sinr) + cosr;
        
          if (abs(diff) < EPSILON) {
            diff = -30.0;
          }
                  
          _vx += amount * _tx * diff;
          _vy += amount * _tx * (diff - sinr * M_PI);
        }`;
    }

    get funcDependencies(): string[] {
        return [FUNC_LOG10];
    }

    get name(): string {
        return 'twintrian';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class TwoFaceFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = amount;
          if (_tx > 0.0) {
            r /= sqr(_tx) + sqr(_ty);
          }
          _vx += r * _tx;
          _vy += r * _ty;
        }`;
    }

    get name(): string {
        return 'twoface';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class UnpolarFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float vvar = amount / M_PI;
          float vvar_2 = vvar * 0.5;
          float r = exp(_ty);
          float s = sin(_tx);
          float c = cos(_tx);
          _vy += vvar_2 * r * c;
          _vx += vvar_2 * r * s;  
        }`;
    }

    get name(): string {
        return 'unpolar';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = 'angle'
    PARAM_HYPERGON = 'hypergon'
    PARAM_HYPERGON_N = 'hypergon_n'
    PARAM_HYPERGON_R = 'hypergon_r'
    PARAM_STAR = 'star'
    PARAM_STAR_N = 'star_n'
    PARAM_STAR_SLOPE = 'star_slope'
    PARAM_LITUUS = 'lituus'
    PARAM_LITUUS_A = 'lituus_a'
    PARAM_SUPER = 'super'
    PARAM_SUPER_M = 'super_m'
    PARAM_SUPER_N1 = 'super_n1'
    PARAM_SUPER_N2 = 'super_n2'
    PARAM_SUPER_N3 = 'super_n3'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_FLOAT, initialValue: 0.42 },
            { name: this.PARAM_HYPERGON, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_HYPERGON_N, type: VariationParamType.VP_INT, initialValue: 4 },
            { name: this.PARAM_HYPERGON_R, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_STAR, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_STAR_N, type: VariationParamType.VP_INT, initialValue: 5 },
            { name: this.PARAM_STAR_SLOPE, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
            { name: this.PARAM_LITUUS, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_LITUUS_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_SUPER_M, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N3, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* w by Michael Faber,  http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float hypergon = ${variation.params.get(this.PARAM_HYPERGON)!.toWebGl()};
          int hypergon_n = ${variation.params.get(this.PARAM_HYPERGON_N)!.toWebGl()};
          float hypergon_r = ${variation.params.get(this.PARAM_HYPERGON_R)!.toWebGl()};
          float star = ${variation.params.get(this.PARAM_STAR)!.toWebGl()};
          int star_n = ${variation.params.get(this.PARAM_STAR_N)!.toWebGl()};
          float star_slope = ${variation.params.get(this.PARAM_STAR_SLOPE)!.toWebGl()};
          float lituus = ${variation.params.get(this.PARAM_LITUUS)!.toWebGl()};
          float lituus_a = ${variation.params.get(this.PARAM_LITUUS_A)!.toWebGl()};
          float _super = ${variation.params.get(this.PARAM_SUPER)!.toWebGl()};
          float super_m = ${variation.params.get(this.PARAM_SUPER_M)!.toWebGl()};
          float super_n1 = ${variation.params.get(this.PARAM_SUPER_N1)!.toWebGl()};
          float super_n2 = ${variation.params.get(this.PARAM_SUPER_N2)!.toWebGl()};
          float super_n3 = ${variation.params.get(this.PARAM_SUPER_N3)!.toWebGl()};
          float _hypergon_d, _hypergon_n, _lituus_a, _star_n, _star_slope, _super_m, _super_n1; _hypergon_d = sqrt(1.0 + sqr(hypergon_r));
          _hypergon_n = float(hypergon_n);
          _lituus_a = -lituus_a;
          _star_n = float(star_n);
          _star_slope = tan(star_slope);
          _super_m = super_m / 4.0;
          _super_n1 = -1.0 / (super_n1 + EPSILON);    float a = atan2(_ty, _tx);
          float r = sqrt(sqr(_tx) + sqr(_ty));
          float a2 = a + angle;
          if (a2 < -M_PI)
            a2 += (2.0*M_PI);
          if (a2 > M_PI)
            a2 -= (2.0*M_PI);
          float s, c;
          float total = 0.0;
          float total2 = 0.0;
          float temp1, temp2;
          if (hypergon != 0.0) {
            temp1 = mod(abs(a), (2.0*M_PI) / _hypergon_n) - M_PI / _hypergon_n;
            temp2 = sqr(tan(temp1)) + 1.0;
            if (temp2 >= sqr(_hypergon_d)) {
              total += hypergon;
            } else {
              total += hypergon * (_hypergon_d - sqrt(sqr(_hypergon_d) - temp2)) / sqrt(temp2);
            }
          }
          if (star != 0.0) {
            temp1 = tan(abs(mod(abs(a), (2.0*M_PI) / _star_n) - M_PI / _star_n));
            total += star * sqrt(sqr(_star_slope) * (1.0 + sqr(temp1)) / sqr(temp1 + _star_slope));
          }
          if (lituus != 0.0) {
            total += lituus * pow(a / M_PI + 1.0, _lituus_a);
          }
          if (_super != 0.0) {
            float ang = a * _super_m;
            s = sin(ang);
            c = cos(ang);
            total += _super * pow(pow(abs(c), super_n2) + pow(abs(s), super_n3), _super_n1);
          }
          if (r <= total) {
            if (hypergon != 0.0) {
              temp1 = mod(abs(a2), (2.0*M_PI) / _hypergon_n) - M_PI / _hypergon_n;
              temp2 = sqr(tan(temp1)) + 1.0;
              if (temp2 >= sqr(_hypergon_d)) {
                total2 += hypergon;
              } else {
                total2 += hypergon * (_hypergon_d - sqrt(sqr(_hypergon_d) - temp2)) / sqrt(temp2);
              }
            }
            if (star != 0.0) {
              temp1 = tan(abs(mod(abs(a2), (2.0*M_PI) / _star_n) - M_PI / _star_n));
              total2 += star * sqrt(sqr(_star_slope) * (1.0 + sqr(temp1)) / sqr(temp1 + _star_slope));
            }
            if (lituus != 0.0) {
              total2 += lituus * pow(a2 / M_PI + 1.0, _lituus_a);
            }
            if (_super != 0.0) {
              float ang = a2 * _super_m;
              s = sin(ang);
              c = cos(ang);
              total2 += _super * pow(pow(abs(c), super_n2) + pow(abs(s), super_n3), _super_n1);
            }
            r = amount * total2 * r / total;
            s = sin(a2);
            c = cos(a2);
            _vx += r * c;
            _vy += r * s;
          } else {
            _vx += amount * _tx;
            _vy += amount * _ty;
          }
        }`;
    }

    get name(): string {
        return 'w';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WaffleFunc extends VariationShaderFunc2D {
    PARAM_SLICES = 'slices'
    PARAM_XTHICKNESS = 'xthickness'
    PARAM_YTHICKNESS = 'ythickness'
    PARAM_ROTATION = 'rotation'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SLICES, type: VariationParamType.VP_INT, initialValue: 6 },
            { name: this.PARAM_XTHICKNESS, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_YTHICKNESS, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_ROTATION, type: VariationParamType.VP_FLOAT, initialValue: 0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Waffle plugin by Jed Kelsey, http://lu-kout.deviantart.com/art/Apophysis-Plugin-Pack-1-v0-4-59907275
        return `{
          float amount = ${variation.amount.toWebGl()};
          int slices = ${variation.params.get(this.PARAM_SLICES)!.toWebGl()};
          float xthickness = ${variation.params.get(this.PARAM_XTHICKNESS)!.toWebGl()};
          float ythickness = ${variation.params.get(this.PARAM_YTHICKNESS)!.toWebGl()};
          float rotation = ${variation.params.get(this.PARAM_ROTATION)!.toWebGl()};
          float a = 0.0, r = 0.0;
          int mode = iRand8(tex, 5, rngState);
          float vcosr = amount * cos(rotation);
          float vsinr = amount * sin(rotation);
          if(mode==0) {
            a = (float(iRand8(tex, slices, rngState)) + rand8(tex, rngState) * xthickness) / float(slices);
            r = (float(iRand8(tex, slices, rngState)) + rand8(tex, rngState) * ythickness) / float(slices);
          }
          else if(mode==1) {
            a = (float(iRand8(tex, slices, rngState)) + rand8(tex, rngState)) / float(slices);
            r = (float(iRand8(tex, slices, rngState)) + ythickness) / float(slices);
          }
          else if(mode==2) {
            a = (float(iRand8(tex, slices, rngState)) + xthickness) / float(slices);
            r = (float(iRand8(tex, slices, rngState)) + rand8(tex, rngState)) / float(slices);
          }
          else if(mode==3) {
             a = rand8(tex, rngState);
             r = (float(iRand8(tex, slices, rngState)) + ythickness + rand8(tex, rngState) * (1.0 - ythickness)) / float(slices);
          }
          else { // mode = 4
            a = (float(iRand8(tex, slices, rngState)) + xthickness + rand8(tex, rngState) * (1.0 - xthickness)) / float(slices);
            r = rand8(tex, rngState);
          }
          _vx += (vcosr * a + vsinr * r); 
          _vy += (-vsinr * a + vcosr * r);
        }`;
    }

    get name(): string {
        return 'waffle';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WallPaperFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C= 'c'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.156 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: -0.28 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 21.288 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * WallPaper
         *
         * @author Jesus Sosa
         * @date November 4, 2017
         * based on a work of:
         * http://paulbourke.net/fractals/wallpaper/
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          if (rand8(tex, rngState) < 0.5) {
            _vx += _ty - (int(_tx)<0 ? -1.0 : 1.0) * sqrt(abs(b * _tx - c));
            _vy += a - _tx;
          } else {
            _vx = _tx;
            _vy = _ty;
          }
        }`;
    }

    get name(): string {
        return 'wallpaper_js';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WedgeFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = 'angle'
    PARAM_HOLE = 'hole'
    PARAM_COUNT= 'count'
    PARAM_SWIRL = 'swirl'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_FLOAT, initialValue: M_PI * 0.5 },
            { name: this.PARAM_HOLE, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_COUNT, type: VariationParamType.VP_INT, initialValue: 1 },
            { name: this.PARAM_SWIRL, type: VariationParamType.VP_FLOAT, initialValue: 0.1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Wedge from apo plugins pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float hole = ${variation.params.get(this.PARAM_HOLE)!.toWebGl()};
          int count = ${variation.params.get(this.PARAM_COUNT)!.toWebGl()};
          float swirl = ${variation.params.get(this.PARAM_SWIRL)!.toWebGl()};
          
          float r = _r;
          float _theta = atan2(_ty, _tx);
          float a = _theta + swirl * r;
          float c = floor((float(count) * a + M_PI) * (1.0 / M_PI) * 0.5);
        
          float comp_fac = 1.0 - angle * float(count) * (1.0 / M_PI) * 0.5;
        
          a = a * comp_fac + c * angle;
        
          float sa = sin(a);
          float ca = cos(a);
        
          r = amount * (r + hole);
        
          _vx += r * ca;
          _vy += r * sa;
          
        }`;
    }

    get name(): string {
        return 'wedge';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class VogelFunc extends VariationShaderFunc2D {
    PARAM_N = 'n'
    PARAM_SCALE = 'scale'

    M_PHI = 1.61803398874989484820
    M_2PI = 2.0 * M_PI
    M_2PI_PHI2 = this.M_2PI / (this.M_PHI * this.M_PHI)

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_INT, initialValue:20 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Vogel function by Victor Ganora
        return `{
          float amount = ${variation.amount.toWebGl()};
          int n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          int i = iRand8(tex, n, rngState) + 1;
          float a = float(i) * float(${this.M_2PI_PHI2});
          float sina = sin(a);
          float cosa = cos(a);
          float r = amount * (_r + sqrt(float(i)));
          _vx += r * (cosa + (scale * _tx));
          _vy += r * (sina + (scale * _ty));
        }`;
    }

    get name(): string {
        return 'vogel';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WedgeJuliaFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_DIST = 'dist'
    PARAM_COUNT = 'count'
    PARAM_ANGLE = 'angle'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_FLOAT, initialValue: 7.0 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_FLOAT, initialValue: 0.2 },
            { name: this.PARAM_COUNT, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_FLOAT, initialValue: 0.3 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* wedge_julia from apo plugin pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          float count = ${variation.params.get(this.PARAM_COUNT)!.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float _theta = atan2(_ty, _tx);
          float wedgeJulia_cf = 1.0 - angle * count * (1.0 / M_PI) * 0.5;
          float wedgeJulia_rN = abs(power);
          float wedgeJulia_cn = dist / power / 2.0;       
          float r = amount * pow(_r2, wedgeJulia_cn);
          int t_rnd = int(floor(wedgeJulia_rN * rand8(tex, rngState)));
          float a = (_theta + 2.0 * M_PI * float(t_rnd)) / power;
          float c = floor((count * a + M_PI) * (1.0 / M_PI) * 0.5);
          a = a * wedgeJulia_cf + c * angle;
          float sa = sin(a);
          float ca = cos(a);
          _vx += r * ca;
          _vy += r * sa;
        }`;
    }

    get name(): string {
        return 'wedge_julia';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WedgeSphFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = 'angle'
    PARAM_HOLE = 'hole'
    PARAM_COUNT = 'count'
    PARAM_SWIRL = 'swirl'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_FLOAT, initialValue: 0.20 },
            { name: this.PARAM_HOLE, type: VariationParamType.VP_FLOAT, initialValue: 0.20 },
            { name: this.PARAM_COUNT, type: VariationParamType.VP_FLOAT, initialValue: 2.00 },
            { name: this.PARAM_SWIRL, type: VariationParamType.VP_FLOAT, initialValue: 0.30 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Wedge_sph from apo plugins pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float hole = ${variation.params.get(this.PARAM_HOLE)!.toWebGl()};
          float count = ${variation.params.get(this.PARAM_COUNT)!.toWebGl()};
          float swirl = ${variation.params.get(this.PARAM_SWIRL)!.toWebGl()};
          float r = 1.0 / (_r + EPSILON);
          float _theta = atan2(_ty, _tx);
          float a = _theta + swirl * r;
          float c = floor((count * a + M_PI) * (1.0 / M_PI) * 0.5);
          float comp_fac = 1.0 - angle * count * (1.0 / M_PI) * 0.5; 
          a = a * comp_fac + c * angle;
          float sa = sin(a);
          float ca = cos(a);
          r = amount * (r + hole);   
          _vx += r * ca;
          _vy += r * sa;
        }`;
    }

    get name(): string {
        return 'wedge_sph';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WhorlFunc extends VariationShaderFunc2D {
    PARAM_INSIDE = 'inside'
    PARAM_OUTSIDE = 'outside'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_INSIDE, type: VariationParamType.VP_FLOAT, initialValue: 0.10 },
            { name: this.PARAM_OUTSIDE, type: VariationParamType.VP_FLOAT, initialValue: 0.20 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* whorl from apo plugins pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float inside = ${variation.params.get(this.PARAM_INSIDE)!.toWebGl()};
          float outside = ${variation.params.get(this.PARAM_OUTSIDE)!.toWebGl()};
          float r = _r;
          float a;
          float _theta = atan2(_ty, _tx);
          if (r < amount)
            a = _theta + inside / (amount - r);
          else
            a = _theta + outside / (amount - r);
          float sa = sin(a);
          float ca = cos(a);    
          _vx += amount * r * ca;
          _vy += amount * r * sa;
        }`;
    }

    get name(): string {
        return 'whorl';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class XFunc extends VariationShaderFunc2D {
    PARAM_HYPERGON = 'hypergon'
    PARAM_HYPERGON_N = 'hypergon_n'
    PARAM_HYPERGON_R = 'hypergon_r'
    PARAM_STAR = 'star'
    PARAM_STAR_N = 'star_n'
    PARAM_STAR_SLOPE = 'star_slope'
    PARAM_LITUUS = 'lituus'
    PARAM_LITUUS_A = 'lituus_a'
    PARAM_SUPER = 'super'
    PARAM_SUPER_M = 'super_m'
    PARAM_SUPER_N1 = 'super_n1'
    PARAM_SUPER_N2 = 'super_n2'
    PARAM_SUPER_N3 = 'super_n3'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HYPERGON, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_HYPERGON_N, type: VariationParamType.VP_INT, initialValue: 4 },
            { name: this.PARAM_HYPERGON_R, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_STAR, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_STAR_N, type: VariationParamType.VP_INT, initialValue: 5 },
            { name: this.PARAM_STAR_SLOPE, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
            { name: this.PARAM_LITUUS, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_LITUUS_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_SUPER_M, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N3, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* x by Michael Faber,  http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float hypergon = ${variation.params.get(this.PARAM_HYPERGON)!.toWebGl()};
          int hypergon_n = ${variation.params.get(this.PARAM_HYPERGON_N)!.toWebGl()};
          float hypergon_r = ${variation.params.get(this.PARAM_HYPERGON_R)!.toWebGl()};
          float star = ${variation.params.get(this.PARAM_STAR)!.toWebGl()};
          int star_n = ${variation.params.get(this.PARAM_STAR_N)!.toWebGl()};
          float star_slope = ${variation.params.get(this.PARAM_STAR_SLOPE)!.toWebGl()};
          float lituus = ${variation.params.get(this.PARAM_LITUUS)!.toWebGl()};
          float lituus_a = ${variation.params.get(this.PARAM_LITUUS_A)!.toWebGl()};
          float _super = ${variation.params.get(this.PARAM_SUPER)!.toWebGl()};
          float super_m = ${variation.params.get(this.PARAM_SUPER_M)!.toWebGl()};
          float super_n1 = ${variation.params.get(this.PARAM_SUPER_N1)!.toWebGl()};
          float super_n2 = ${variation.params.get(this.PARAM_SUPER_N2)!.toWebGl()};
          float super_n3 = ${variation.params.get(this.PARAM_SUPER_N3)!.toWebGl()};
         
          float _hypergon_d, _hypergon_n, _lituus_a, _star_n, _star_slope, _super_m, _super_n1;_hypergon_d = sqrt(1.0 + sqr(hypergon_r));
          _hypergon_n = float(hypergon_n);
          _lituus_a = -lituus_a;
          _star_n = float(star_n);
          _star_slope = tan(star_slope);
          _super_m = super_m / 4.0;
          _super_n1 = -1.0 / (super_n1 + EPSILON);
          float a = atan2(_ty, _tx);
          float r;
          float s, c;
          float total = 0.0;
          float temp1, temp2;
        
          if (hypergon != 0.0) {
            temp1 = mod(abs(a), (2.0*M_PI) / _hypergon_n) - M_PI / _hypergon_n;
            temp2 = sqr(tan(temp1)) + 1.0;
            if (temp2 >= sqr(_hypergon_d)) {
              total += hypergon;
            } else {
              total += hypergon * (_hypergon_d - sqrt(sqr(_hypergon_d) - temp2)) / sqrt(temp2);
            }
          }
          if (star != 0.0) {
            temp1 = tan(abs(mod(abs(a), (2.0*M_PI) / _star_n) - M_PI / _star_n));
            total += star * sqrt(sqr(_star_slope) * (1.0 + sqr(temp1)) / sqr(temp1 + _star_slope));
          }
          if (lituus != 0.0) {
            total += lituus * pow(a / M_PI + 1.0, _lituus_a);
          }
          if (_super != 0.0) {
            float ang = a * _super_m;
            s = sin(ang);
            c = cos(ang);
            total += _super * pow(pow(abs(c), super_n2) + pow(abs(s), super_n3), _super_n1);
          }
          r = amount * sqrt(sqr(_tx) + sqr(_ty) + sqr(total));
          s = sin(a);
          c = cos(a);
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'x';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class XHeartFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = 'angle'
    PARAM_RATIO = 'ratio'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_RATIO, type: VariationParamType.VP_FLOAT, initialValue: 0.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // xheart by xyrus02, http://xyrus02.deviantart.com/art/XHeart-Plugin-139866412
        return `{
          float amount = ${variation.amount.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float ratio = ${variation.params.get(this.PARAM_RATIO)!.toWebGl()};
          float ang = (0.25*M_PI) + (0.5 * (0.25*M_PI) * angle);
          float sina = sin(ang);
          float cosa = cos(ang);
          float rat = 6.0 + 2.0 * ratio; 
          float r2_4 = _tx * _tx + _ty * _ty + 4.0;
          if (r2_4 == 0.0)
            r2_4 = 1.0;
          float bx = 4.0 / r2_4, by = rat / r2_4;
          float x = cosa * (bx * _tx) - sina * (by * _ty);
          float y = sina * (bx * _tx) + cosa * (by * _ty);
          if (x > 0.0) {
            _vx += amount * x;
            _vy += amount * y;
          } else {
            _vx += amount * x;
            _vy += -amount * y;
          }
        }`;
    }

    get name(): string {
        return 'xheart';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class YFunc extends VariationShaderFunc2D {
    PARAM_HYPERGON = 'hypergon'
    PARAM_HYPERGON_N = 'hypergon_n'
    PARAM_HYPERGON_R = 'hypergon_r'
    PARAM_STAR = 'star'
    PARAM_STAR_N = 'star_n'
    PARAM_STAR_SLOPE = 'star_slope'
    PARAM_LITUUS = 'lituus'
    PARAM_LITUUS_A = 'lituus_a'
    PARAM_SUPER = 'super'
    PARAM_SUPER_M = 'super_m'
    PARAM_SUPER_N1 = 'super_n1'
    PARAM_SUPER_N2 = 'super_n2'
    PARAM_SUPER_N3 = 'super_n3'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HYPERGON, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_HYPERGON_N, type: VariationParamType.VP_INT, initialValue: 4 },
            { name: this.PARAM_HYPERGON_R, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_STAR, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_STAR_N, type: VariationParamType.VP_INT, initialValue: 5 },
            { name: this.PARAM_STAR_SLOPE, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
            { name: this.PARAM_LITUUS, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_LITUUS_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_SUPER_M, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N3, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* y by Michael Faber,  http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float hypergon = ${variation.params.get(this.PARAM_HYPERGON)!.toWebGl()};
          int hypergon_n = ${variation.params.get(this.PARAM_HYPERGON_N)!.toWebGl()};
          float hypergon_r = ${variation.params.get(this.PARAM_HYPERGON_R)!.toWebGl()};
          float star = ${variation.params.get(this.PARAM_STAR)!.toWebGl()};
          int star_n = ${variation.params.get(this.PARAM_STAR_N)!.toWebGl()};
          float star_slope = ${variation.params.get(this.PARAM_STAR_SLOPE)!.toWebGl()};
          float lituus = ${variation.params.get(this.PARAM_LITUUS)!.toWebGl()};
          float lituus_a = ${variation.params.get(this.PARAM_LITUUS_A)!.toWebGl()};
          float _super = ${variation.params.get(this.PARAM_SUPER)!.toWebGl()};
          float super_m = ${variation.params.get(this.PARAM_SUPER_M)!.toWebGl()};
          float super_n1 = ${variation.params.get(this.PARAM_SUPER_N1)!.toWebGl()};
          float super_n2 = ${variation.params.get(this.PARAM_SUPER_N2)!.toWebGl()};
          float super_n3 = ${variation.params.get(this.PARAM_SUPER_N3)!.toWebGl()};
         
          float _hypergon_d, _hypergon_n, _lituus_a, _star_n, _star_slope, _super_m, _super_n1; _hypergon_d = sqrt(1.0 + sqr(hypergon_r));
          _hypergon_n = float(hypergon_n);
          _lituus_a = -lituus_a;
          _star_n = float(star_n);
          _star_slope = tan(star_slope);
          _super_m = super_m / 4.0;
          _super_n1 = -1.0 / (super_n1 + EPSILON);
          float a = atan2(_ty, _tx);
          float r;
          float s, c;
          float total = 0.0;
          float temp1, temp2;
          if (hypergon != 0.0) {
            temp1 = mod(abs(a), (2.0*M_PI) / _hypergon_n) - M_PI / _hypergon_n;
            temp2 = sqr(tan(temp1)) + 1.0;
            if (temp2 >= sqr(_hypergon_d)) {
              total += hypergon;
            } else {
              total += hypergon * (_hypergon_d - sqrt(sqr(_hypergon_d) - temp2)) / sqrt(temp2);
            }
          }
          if (star != 0.0) {
            temp1 = tan(abs(mod(abs(a), (2.0*M_PI) / _star_n) - M_PI / _star_n));
            total += star * sqrt(sqr(_star_slope) * (1.0 + sqr(temp1)) / sqr(temp1 + _star_slope));
          }
          if (lituus != 0.0) {
            total += lituus * pow(a / M_PI + 1.0, _lituus_a);
          }
          if (_super != 0.0) {
            float ang = a * _super_m;
            s = sin(ang);
            c = cos(ang);
            total += _super * pow(pow(abs(c), super_n2) + pow(abs(s), super_n3), _super_n1);
          }
          r = amount * sqr(total) / sqrt(sqr(_tx) + sqr(_ty));
          s = sin(a);
          c = cos(a);
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'y';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class YinYangFunc extends VariationShaderFunc2D {
    PARAM_RADIUS = 'radius'
    PARAM_ANG1 = 'ang1'
    PARAM_ANG2 = 'ang2'
    PARAM_DUAL_T = 'dual_t'
    PARAM_OUTSIDE = 'outside'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RADIUS, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_ANG1, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_ANG2, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_DUAL_T, type: VariationParamType.VP_INT, initialValue: 1 },
            { name: this.PARAM_OUTSIDE, type: VariationParamType.VP_INT, initialValue: 0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* yin_yang by dark-beam */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float radius = ${variation.params.get(this.PARAM_RADIUS)!.toWebGl()};
          float ang1 = ${variation.params.get(this.PARAM_ANG1)!.toWebGl()};
          float ang2 = ${variation.params.get(this.PARAM_ANG2)!.toWebGl()};
          int dual_t = ${variation.params.get(this.PARAM_DUAL_T)!.toWebGl()};
          int outside = ${variation.params.get(this.PARAM_OUTSIDE)!.toWebGl()};
          float sina = sin(M_PI * ang1);
          float cosa = cos(M_PI * ang1);
          float sinb = sin(M_PI * ang2);
          float cosb = cos(M_PI * ang2);  
          float xx = _tx;
          float yy = _ty;
          float inv = 1.0;
          float RR = radius;
          float R2 = (xx * xx + yy * yy);
          if (R2 < 1.0) {
            float nx = xx * cosa - yy * sina;
            float ny = xx * sina + yy * cosa;
            if (dual_t == 1 && rand8(tex, rngState) > 0.5) {
              inv = -1.0;
              RR = 1.0 - radius;
              nx = xx * cosb - yy * sinb;
              ny = xx * sinb + yy * cosb;
            }
            xx = nx;
            yy = ny;
            if (yy > 0.0) {
              float t = sqrt(1.0 - yy * yy);
              float k = xx / t;
              float t1 = (t - 0.5) * 2.0;
              float alfa = (1.0 - k) * 0.5;
              float beta = (1.0 - alfa);
              float dx = alfa * (RR - 1.0);
              float k1 = alfa * (RR) + beta;
              _vx += amount * (t1 * k1 + dx) * inv;
              _vy += amount * sqrt(1.0 - t1 * t1) * k1 * inv;
            } else {
              _vx += amount * (xx * (1.0 - RR) + RR) * inv;
              _vy += amount * (yy * (1.0 - RR)) * inv;
            }
          } else if (outside == 1) {
            _vx += amount * _tx;
            _vy += amount * _ty;
          } else {
            _vx += 0.0; 
            _vy += 0.0; 
          }
        }`;
    }

    get name(): string {
        return 'yin_yang';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ZFunc extends VariationShaderFunc2D {
    PARAM_HYPERGON = 'hypergon'
    PARAM_HYPERGON_N = 'hypergon_n'
    PARAM_HYPERGON_R = 'hypergon_r'
    PARAM_STAR = 'star'
    PARAM_STAR_N = 'star_n'
    PARAM_STAR_SLOPE = 'star_slope'
    PARAM_LITUUS = 'lituus'
    PARAM_LITUUS_A = 'lituus_a'
    PARAM_SUPER = 'super'
    PARAM_SUPER_M = 'super_m'
    PARAM_SUPER_N1 = 'super_n1'
    PARAM_SUPER_N2 = 'super_n2'
    PARAM_SUPER_N3 = 'super_n3'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HYPERGON, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_HYPERGON_N, type: VariationParamType.VP_INT, initialValue: 4 },
            { name: this.PARAM_HYPERGON_R, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_STAR, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_STAR_N, type: VariationParamType.VP_INT, initialValue: 5 },
            { name: this.PARAM_STAR_SLOPE, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
            { name: this.PARAM_LITUUS, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_LITUUS_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_SUPER_M, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SUPER_N3, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* z by Michael Faber,  http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float hypergon = ${variation.params.get(this.PARAM_HYPERGON)!.toWebGl()};
          int hypergon_n = ${variation.params.get(this.PARAM_HYPERGON_N)!.toWebGl()};
          float hypergon_r = ${variation.params.get(this.PARAM_HYPERGON_R)!.toWebGl()};
          float star = ${variation.params.get(this.PARAM_STAR)!.toWebGl()};
          int star_n = ${variation.params.get(this.PARAM_STAR_N)!.toWebGl()};
          float star_slope = ${variation.params.get(this.PARAM_STAR_SLOPE)!.toWebGl()};
          float lituus = ${variation.params.get(this.PARAM_LITUUS)!.toWebGl()};
          float lituus_a = ${variation.params.get(this.PARAM_LITUUS_A)!.toWebGl()};
          float _super = ${variation.params.get(this.PARAM_SUPER)!.toWebGl()};
          float super_m = ${variation.params.get(this.PARAM_SUPER_M)!.toWebGl()};
          float super_n1 = ${variation.params.get(this.PARAM_SUPER_N1)!.toWebGl()};
          float super_n2 = ${variation.params.get(this.PARAM_SUPER_N2)!.toWebGl()};
          float super_n3 = ${variation.params.get(this.PARAM_SUPER_N3)!.toWebGl()};
         
          float _hypergon_d, _hypergon_n, _lituus_a, _star_n, _star_slope, _super_m, _super_n1;_hypergon_d = sqrt(1.0 + sqr(hypergon_r));
          _hypergon_n = float(hypergon_n);
          _lituus_a = -lituus_a;
          _star_n = float(star_n);
          _star_slope = tan(star_slope);
          _super_m = super_m / 4.0;
          _super_n1 = -1.0 / (super_n1 + EPSILON);   
          float a = atan2(_ty, _tx);
          float r;
          float s, c;
          float total = 0.0;
          float temp1, temp2;
          if (hypergon != 0.0) {
            temp1 = mod(abs(a), (2.0*M_PI) / _hypergon_n) - M_PI / _hypergon_n;
            temp2 = sqr(tan(temp1)) + 1.0;
            if (temp2 >= sqr(_hypergon_d)) {
              total += hypergon;
            } else {
              total += hypergon * (_hypergon_d - sqrt(sqr(_hypergon_d) - temp2)) / sqrt(temp2);
            }
          }
          if (star != 0.0) {
            temp1 = tan(abs(mod(abs(a), (2.0*M_PI) / _star_n) - M_PI / _star_n));
            total += star * sqrt(sqr(_star_slope) * (1.0 + sqr(temp1)) / sqr(temp1 + _star_slope));
          }
          if (lituus != 0.0) {
            total += lituus * pow(a / M_PI + 1.0, _lituus_a);
          }
          if (_super != 0.0) {
            float ang = a * _super_m;
            s = sin(ang);
            c = cos(ang);
            total += _super * pow(pow(abs(c), super_n2) + pow(abs(s), super_n3), _super_n1);
          }
          r = amount * (sqrt(sqr(_tx) + sqr(_ty)) + total);   
          s = sin(a);
          c = cos(a);
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'z';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function registerVars_2D_PartT() {
    VariationShaders.registerVar(new TanFunc())
    VariationShaders.registerVar(new TanhFunc())
    VariationShaders.registerVar(new TanhqFunc())
    VariationShaders.registerVar(new TanCosFunc())
    VariationShaders.registerVar(new TangentFunc())
    VariationShaders.registerVar(new TargetFunc())
    VariationShaders.registerVar(new TargetSpFunc())
    VariationShaders.registerVar(new TradeFunc())
    VariationShaders.registerVar(new TruchetFunc())
    VariationShaders.registerVar(new Truchet2Func())
    VariationShaders.registerVar(new TwintrianFunc())
    VariationShaders.registerVar(new TwoFaceFunc())
    VariationShaders.registerVar(new UnpolarFunc())
    VariationShaders.registerVar(new VogelFunc())
    VariationShaders.registerVar(new WFunc())
    VariationShaders.registerVar(new WaffleFunc())
    VariationShaders.registerVar(new WallPaperFunc())
    VariationShaders.registerVar(new WedgeFunc())
    VariationShaders.registerVar(new WedgeJuliaFunc())
    VariationShaders.registerVar(new WedgeSphFunc())
    VariationShaders.registerVar(new WhorlFunc())
    VariationShaders.registerVar(new XFunc())
    VariationShaders.registerVar(new XHeartFunc())
    VariationShaders.registerVar(new YFunc())
    VariationShaders.registerVar(new YinYangFunc())
    VariationShaders.registerVar(new ZFunc())
}
