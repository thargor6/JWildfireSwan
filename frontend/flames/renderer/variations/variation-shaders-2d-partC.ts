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
  be sure to import this class somewhere and call registerVars_2D_PartC()
 */
class CannabisCurveWFFunc extends VariationShaderFunc2D {
    PARAM_FILLED = 'filled'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // cannabis curve (http://mathworld.wolfram.com/CannabisCurve.html)
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = _phi;
          
          float r = (1.0 + 9.0 / 10.0 * cos(8.0 * a)) * (1.0 + 1.0 / 10.0 * cos(24.0 * a)) * (9.0 / 10.0 + 1.0 / 10.0 * cos(200.0 * a)) * (1.0 + sin(a));
          a += M_PI / 2.0;
        
          float filled = ${variation.params.get(this.PARAM_FILLED)!.toWebGl()};
          if (filled > 0.0 && filled > rand8(tex, rngState)) {
            r *= rand8(tex, rngState);
          }
        
          float nx = sin(a) * r;
          float ny = cos(a) * r;
        
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'cannabiscurve_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class CardioidFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // cardioid by Michael Faber
         return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float angle = atan2(_ty, _tx);
          float r = amount * sqrt(sqr(_tx) + sqr(_ty) + sin(a * a) + 1.0);
          float c = cos(angle);
          float s = sin(angle);       
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'cardioid';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ChecksFunc extends VariationShaderFunc2D {
    PARAM_LEFT = 'x'
    PARAM_TOP = 'y'
    PARAM_RIGHT = 'size'
    PARAM_BOTTOM = 'rnd'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LEFT, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_TOP, type: VariationParamType.VP_NUMBER, initialValue: 3.00 },
            { name: this.PARAM_RIGHT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_BOTTOM, type: VariationParamType.VP_NUMBER, initialValue: 0.50 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Fixed checks plugin by Keeps and Xyrus02, http://xyrus02.deviantart.com/art/Checks-The-fixed-version-138967784?q=favby%3Aapophysis-plugins%2F39181234&qo=3
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_LEFT)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_TOP)!.toWebGl()};
          float size = ${variation.params.get(this.PARAM_RIGHT)!.toWebGl()};
          float rnd = ${variation.params.get(this.PARAM_BOTTOM)!.toWebGl()};
          float _cs = 1.0 / (size + EPSILON);
          float _ncx = x * -1.0;
          float _ncy = y * -1.0;
          int isXY = int(rint(_tx * _cs)) + int(rint(_ty * _cs));
          float rnx = rnd * rand8(tex, rngState);
          float rny = rnd * rand8(tex, rngState);
          float dx, dy;
          if((isXY / 2) * isXY == isXY) {    
            dx = _ncx + rnx;
            dy = _ncy;
          } else {
            dx = x;
            dy = y + rny;
          }      
          _vx += amount * (_tx + dx);
          _vy += amount * (_ty + dy);   
        }`;
    }

    get name(): string {
        return 'checks';
    }

    get funcDependencies(): string[] {
        return [FUNC_RINT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_CROP];
    }
}

class CellFunc extends VariationShaderFunc2D {
    PARAM_SIZE = 'size'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SIZE, type: VariationParamType.VP_NUMBER, initialValue: 0.6 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Cell in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float size = ${variation.params.get(this.PARAM_SIZE)!.toWebGl()};
          float inv_cell_size = 1.0 / size;

          /* calculate input cell */
          int x = int(floor(_tx * inv_cell_size));
          int y = int(floor(_ty * inv_cell_size));
    
          /* Offset from cell origin */
          float dx = _tx - float(x) * size;
          float dy = _ty - float(y) * size;
    
          /* interleave cells */
          if (y >= 0) {
            if (x >= 0) {
              y *= 2;
              x *= 2;
            } else {
              y *= 2;
              x = -(2 * x + 1);
            }
          } else {
            if (x >= 0) {
              y = -(2 * y + 1);
              x *= 2;
            } else {
              y = -(2 * y + 1);
              x = -(2 * x + 1);
            }
          }
    
          _vx += amount * (dx + float(x) * size);
          _vy -= amount * (dy + float(y) * size);
        }`;
    }

    get name(): string {
        return 'cell';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ChrysanthemumFunc extends VariationShaderFunc2D {
    // Autor: Jesus Sosa
    // Date: 01/feb/2018
    // Reference:
    // http://paulbourke.net/geometry/chrysanthemum/
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float u = 21.0 * M_PI * rand8(tex, rngState);
          float p4 = sin(17.0 * u / 3.0);
          float p8 = sin(2.0 * cos(3.0 * u) - 28.0 * u);
          float r = 5.0 * (1.0 + sin(11.0 * u / 5.0)) - 4.0 * p4 * p4 * p4 * p4 * p8 * p8 * p8 * p8 * p8 * p8 * p8 * p8;
          r *= amount / 10.0;
          _vx += r * cos(u);
          _vy += r * sin(u);
        }`;
    }

    get name(): string {
        return 'chrysanthemum';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class CirclizeFunc extends VariationShaderFunc2D {
    PARAM_HOLE = 'hole'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_HOLE, type: VariationParamType.VP_NUMBER, initialValue: 0.40 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float hole = ${variation.params.get(this.PARAM_HOLE)!.toWebGl()};
          float var4_PI = amount / (0.25*M_PI);
          float absx = abs(_tx);
          float absy = abs(_ty);
          float perimeter, side;
          if (absx >= absy) {
            if (_tx >= absy) {
              perimeter = absx + _ty;
            } else {
              perimeter = 5.0 * absx - _ty;
            }
            side = absx;
          } else {
            if (_ty >= absx) {
              perimeter = 3.0 * absy - _tx;
            } else {
              perimeter = 7.0 * absy + _tx;
            }
            side = absy;
          }
          float r = var4_PI * side + hole;
          float a = (0.25*M_PI) * perimeter / side - (0.25*M_PI);
          float sina = sin(a);
          float cosa = cos(a);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'circlize';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CircusFunc extends VariationShaderFunc2D {
    PARAM_SCALE = 'scale'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 0.92 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* circus from Michael Faber, http://michaelfaber.deviantart.com/art/The-Lost-Variations-258913970 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float scale = ${variation.params.get(this.PARAM_SCALE)!.toWebGl()};
          float scale_1 = 1.0 / scale;
          float r = sqrt(_tx * _tx + _ty * _ty);
           float a = atan2(_ty, _tx);
           float s = sin(a);
           float c = cos(a);
            if (r <= 1.0)
              r *= scale;
            else
              r *= scale_1;
            _vx += amount * r * c;
            _vy += amount * r * s;
        }`;
    }

    get name(): string {
        return 'circus';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CloverLeafWFFunc extends VariationShaderFunc2D {
    PARAM_FILLED = 'filled'

    get params(): VariationParam[] {
      return [{ name: this.PARAM_FILLED, type: VariationParamType.VP_NUMBER, initialValue: 0.85 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = _phi;

          float r = (sin(2.0 * a) + 0.25 * sin(6.0 * a));

          float filled = ${variation.params.get(this.PARAM_FILLED)!.toWebGl()};

          if (filled > 0.0 && filled > rand8(tex, rngState)) {
            r *= rand8(tex, rngState);
          }

          float nx = sin(a) * r;
          float ny = cos(a) * r;
    
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'cloverleaf_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class CliffordFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: -1.4 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 1.6 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.7 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Reference:
        //		  http://paulbourke.net/fractals/clifford/
        //		  xn+1 = sin(a yn) + c cos(a xn)
        //		  yn+1 = sin(b xn) + d cos(b yn)    // Reference:
        //     //		  http://paulbourke.net/fractals/clifford/
        //     //		  xn+1 = sin(a yn) + c cos(a xn)
        //     //		  yn+1 = sin(b xn) + d cos(b yn)
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float x = sin(a * _ty) + c * cos(a * _tx);
          float y = sin(b * _tx) + d * cos(b * _ty);
          _vx += x * amount;
          _vy += y * amount;
        }`;
    }

    get name(): string {
        return 'clifford_js';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_CROP];
    }
}

class CollideoscopeFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_NUM = 'num'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.20 },
            { name: this.PARAM_NUM, type: VariationParamType.VP_NUMBER, initialValue: 1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* collideoscope by Michael Faber, http://michaelfaber.deviantart.com/art/Collideoscope-251624597 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          int num = ${variation.params.get(this.PARAM_NUM)!.toWebGl()};
          float kn_pi = float(num) * (1.0 / M_PI);
          float pi_kn = M_PI / float(num);
          float ka = M_PI * a;
          float ka_kn = ka / float(num);
          float _theta = atan2(_ty, _tx);
          float r = amount * sqrt(sqr(_tx) + sqr(_ty));
          int alt;  
          if (_theta >= 0.0) {
            alt = int(_theta * kn_pi);
            if (modulo(alt, 2) == 0) {
              a = float(alt) * pi_kn + mod(ka_kn + _theta, pi_kn);
            } else {
              a = float(alt) * pi_kn + mod(-ka_kn + _theta, pi_kn);
            }
          } else {
            alt = int(-_theta * kn_pi);
            if (modulo(alt, 2) != 0) {
              a = -(float(alt) * pi_kn + mod(-ka_kn - _theta, pi_kn));
            } else {
              a = -(float(alt) * pi_kn + mod(ka_kn - _theta, pi_kn));
            }
          }     
          float s = sin(a);
          float c = cos(a);  
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'collideoscope';
    }

    get funcDependencies(): string[] {
        return [FUNC_MODULO];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ConicFunc extends VariationShaderFunc2D {
    PARAM_ECCENTRICITY = 'eccentricity'
    PARAM_HOLES = 'holes'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ECCENTRICITY, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_HOLES, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cyberxaos, 4/2007 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float eccentricity = ${variation.params.get(this.PARAM_ECCENTRICITY)!.toWebGl()};
          float holes = ${variation.params.get(this.PARAM_HOLES)!.toWebGl()};
          float ct = _tx / _r;
          float r = amount * (rand8(tex, rngState) - holes) * eccentricity / (1.0 + eccentricity * ct) / _r;
         _vx += r * _tx;
         _vy += r * _ty;
        }`;
    }

    get name(): string {
        return 'conic';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Cot2_BSFunc extends VariationShaderFunc2D {
    PARAM_X1 = 'x1'
    PARAM_X2 = 'x2'
    PARAM_Y1 = 'y1'
    PARAM_Y2 = 'y2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X1, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_X2, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_Y1, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_Y2, type: VariationParamType.VP_NUMBER, initialValue: 2.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        /* Variables added by Brad Stefanov */
        //Cotangent COT
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
                  float x2 = ${variation.params.get(this.PARAM_X2)!.toWebGl()};
                  float y1 = ${variation.params.get(this.PARAM_Y1)!.toWebGl()};
                  float y2 = ${variation.params.get(this.PARAM_Y2)!.toWebGl()};
                  float cotsin = sin(x1 * _tx);
                  float cotcos = cos(x2 * _tx);
                  float cotsinh = sinh(y1 * _ty);
                  float cotcosh = cosh(y2 * _ty);
                  float cotden = 1.0 / (cotcosh - cotcos);
                  _vx += amount * cotden * cotsin;
                  _vy += amount * cotden * -1.0 * cotsinh;
                }`;
    }


    get name(): string {
        return 'cot2_bs';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Coth2_BSFunc extends VariationShaderFunc2D {
    PARAM_X1 = 'x1'
    PARAM_X2 = 'x2'
    PARAM_Y1 = 'y1'
    PARAM_Y2 = 'y2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X1, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_X2, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_Y1, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_Y2, type: VariationParamType.VP_NUMBER, initialValue: 2.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        /* Variables added by Brad Stefanov */
        //Hyperbolic Cotangent COTH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
                  float x2 = ${variation.params.get(this.PARAM_X2)!.toWebGl()};
                  float y1 = ${variation.params.get(this.PARAM_Y1)!.toWebGl()};
                  float y2 = ${variation.params.get(this.PARAM_Y2)!.toWebGl()};
                  float cothsin = sin(y1 * _ty);
                  float cothcos = cos(y2 * _ty);
                  float cothsinh = sinh(x1 * _tx);
                  float cothcosh = cosh(x2 * _tx);
                  float d = (cothcosh - cothcos);
                  if (d != 0.0) {
                    float cothden = 1.0 / d;
                    _vx += amount * cothden * cothsinh;
                    _vy += amount * cothden * cothsin;
                  } 
                }`;
    }

    get name(): string {
        return 'coth2_bs';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CPowFunc extends VariationShaderFunc2D {
    PARAM_R = 'r'
    PARAM_I = 'i'
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_R, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_I, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_NUMBER, initialValue: 1.5 }]
    }

    /* Cpow in the Apophysis Plugin Pack */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float r = ${variation.params.get(this.PARAM_R)!.toWebGl()};
                  float i = ${variation.params.get(this.PARAM_I)!.toWebGl()};
                  float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
                  float _theta = atan2(_ty, _tx);
                  float a = _theta;
                  float lnr = 0.5 * log(_r2);
                  float va = 2.0 * M_PI / power;
                  float vc = r / power;
                  float vd = i / power;
                  float ang = vc * a + vd * lnr + va * floor(power * rand8(tex, rngState));
                
                  float m = amount * exp(vc * lnr - vd * a);
                  float sa = sin(ang);
                  float ca = cos(ang);
                
                  _vx += m * ca;
                  _vy += m * sa;
                }`;
    }


    get name(): string {
        return 'cpow';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CropFunc extends VariationShaderFunc2D {
    PARAM_LEFT = 'left'
    PARAM_TOP = 'top'
    PARAM_RIGHT = 'right'
    PARAM_BOTTOM = 'bottom'
    PARAM_SCATTER_AREA = 'scatter_area'
    PARAM_ZERO = 'zero'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_LEFT, type: VariationParamType.VP_NUMBER, initialValue: -1.00 },
            { name: this.PARAM_TOP, type: VariationParamType.VP_NUMBER, initialValue: -1.00 },
            { name: this.PARAM_RIGHT, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_BOTTOM, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SCATTER_AREA, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_ZERO, type: VariationParamType.VP_NUMBER, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // crop by Xyrus02, http://xyrus02.deviantart.com/art/Crop-Plugin-Updated-169958881
        return `{
          float amount = ${variation.amount.toWebGl()};
          float left = ${variation.params.get(this.PARAM_LEFT)!.toWebGl()};
          float top = ${variation.params.get(this.PARAM_TOP)!.toWebGl()};
          float right = ${variation.params.get(this.PARAM_RIGHT)!.toWebGl()};
          float bottom = ${variation.params.get(this.PARAM_BOTTOM)!.toWebGl()};
          float scatter_area = ${variation.params.get(this.PARAM_SCATTER_AREA)!.toWebGl()};
          int zero = ${variation.params.get(this.PARAM_ZERO)!.toWebGl()};
          float xmin = min(left, right);
          float ymin = min(top, bottom);
          float xmax = max(left, right);
          float ymax = max(top, bottom);
          float w = (xmax - xmin) * 0.5 * scatter_area;
          float h = (ymax - ymin) * 0.5 * scatter_area;
          float x = _tx;
          float y = _ty;
          if (((x < xmin) || (x > xmax) || (y < ymin) || (y > ymax)) && (zero != 0)) {
            _vx = _vy = 0.0;
          } else {
            if (x < xmin)
              x = xmin + rand8(tex, rngState) * w;
            else if (x > xmax)
              x = xmax - rand8(tex, rngState) * w;
            if (y < ymin)
              y = ymin + rand8(tex, rngState) * h;
            else if (y > ymax)
              y = ymax - rand8(tex, rngState) * h;
            _vx = amount * x;
            _vy = amount * y;
          }
        }`;
    }

    get name(): string {
        return 'crop';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_CROP];
    }
}

class CrossFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float s = _tx * _tx - _ty * _ty;
                  float r = amount * sqrt(1.0 / (s * s + EPSILON));
                  _vx += _tx * r;
                  _vy += _ty * r;
                }`;
    }

    get name(): string {
        return 'cross';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CscFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Cosecant CSC
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cscsin = sin(_tx);
                  float csccos = cos(_tx);
                  float cscsinh = sinh(_ty);
                  float csccosh = cosh(_ty);
                  float d = (cosh(2.0 * _ty) - cos(2.0 * _tx));
                  if (d != 0.0) {
                    float cscden = 2.0 / d;
                    _vx += amount * cscden * cscsin * csccosh;
                    _vy -= amount * cscden * csccos * cscsinh;  
                  }
                }`;
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get name(): string {
        return 'csc';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CscSquaredFunc extends VariationShaderFunc2D {
    PARAM_CSC_DIV = 'csc_div'
    PARAM_COS_DIV = 'cos_div'
    PARAM_TAN_DIV = 'tan_div'
    PARAM_CSC_POW = 'csc_pow'
    PARAM_PI_MULT = 'pi_mult'
    PARAM_CSC_ADD = 'csc_add'
    PARAM_SCALE_Y = 'scale_y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CSC_DIV, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_COS_DIV, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_TAN_DIV, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_CSC_POW, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_PI_MULT, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_CSC_ADD, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_SCALE_Y, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // csc_squared by Whittaker Courtney 8-7-2018
        return `{
          float amount = ${variation.amount.toWebGl()};
          float csc_div = ${variation.params.get(this.PARAM_CSC_DIV)!.toWebGl()};
          float cos_div = ${variation.params.get(this.PARAM_COS_DIV)!.toWebGl()};
          float tan_div = ${variation.params.get(this.PARAM_TAN_DIV)!.toWebGl()};
          float csc_pow = ${variation.params.get(this.PARAM_CSC_POW)!.toWebGl()};
          float pi_mult = ${variation.params.get(this.PARAM_PI_MULT)!.toWebGl()};
          float csc_add = ${variation.params.get(this.PARAM_CSC_ADD)!.toWebGl()};
          float scale_y = ${variation.params.get(this.PARAM_SCALE_Y)!.toWebGl()};
          float x = _tx;
          float y = _ty;
          float csc = csc_div / cos(x / cos_div) / tan(x / tan_div);
          float fx = pow(csc * csc + (M_PI * pi_mult), csc_pow) + csc_add;
          _vx += amount * x * fx;
          _vy += amount * y * fx * scale_y;
        }`;
    }

    get name(): string {
        return 'csc_squared';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CschFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Cosecant CSCH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cschsin = sin(_ty);
                  float cschcos = cos(_ty);
                  float cschsinh = sinh(_tx);
                  float cschcosh = cosh(_tx);
                  float d = (cosh(2.0 * _tx) - cos(2.0 * _ty));
                  if (d != 0.0) {
                    float cschden = 2.0 / d;
                    _vx += amount * cschden * cschsinh * cschcos;
                    _vy -= amount * cschden * cschcosh * cschsin;  
                  }
                }`;
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get name(): string {
        return 'csch';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CosFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Cosine COS
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cossin = sin(_tx);
                  float coscos = cos(_tx);
                  float cossinh = sinh(_ty);
                  float coscosh = cosh(_ty);
                  _vx += amount * coscos * coscosh;
                  _vy -= amount * cossin * cossinh;
                }`;
    }

    get name(): string {
        return 'cos';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CoshFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Cosine COSH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float coshsin = sin(_ty);
                  float coshcos = cos(_ty);
                  float coshsinh = sinh(_tx);
                  float coshcosh = cosh(_tx);
                  _vx += amount * coshcosh * coshcos;
                  _vy += amount * coshsinh * coshsin;
                }`;
    }

    get name(): string {
        return 'cosh';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Cosh2_BSFunc extends VariationShaderFunc2D {
    PARAM_X1 = 'x1'
    PARAM_X2 = 'x2'
    PARAM_Y1 = 'y1'
    PARAM_Y2 = 'y2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_X2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Y1, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_Y2, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        /* Variables added by Brad Stefanov */
        //Hyperbolic Cosine COSH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
                  float x2 = ${variation.params.get(this.PARAM_X2)!.toWebGl()};
                  float y1 = ${variation.params.get(this.PARAM_Y1)!.toWebGl()};
                  float y2 = ${variation.params.get(this.PARAM_Y2)!.toWebGl()};
                  float coshsin = sin(_ty * y1);
                  float coshcos = cos(_ty * y2);
                  float coshsinh = sinh(_tx * x1);
                  float coshcosh = cosh(_tx * x2);
                  _vx += amount * coshcosh * coshcos;
                  _vy += amount * coshsinh * coshsin;
                }`;
    }

    get name(): string {
        return 'cosh2_bs';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CosineFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float r = _tx * M_PI;
                  float sinr = sin(r);
                  float cosr = cos(r);
                  _vx += amount * cosr * cosh(_ty);
                  _vy -= amount * sinr * sinh(_ty);
                }`;
    }

    get name(): string {
        return 'cosine';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CotFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Cotangent COT
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cotsin = sin(2.0 * _tx);
                  float cotcos = cos(2.0 * _tx);
                  float cotsinh = sinh(2.0 * _ty);
                  float cotcosh = cosh(2.0 * _ty);
                  float cotden = 1.0 / (cotcosh - cotcos);
                  _vx += amount * cotden * cotsin;
                  _vy += amount * cotden * -1.0 * cotsinh;
                }`;
    }

    get name(): string {
        return 'cot';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CothFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Cotangent COTH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float cothsin = sin(2.0 * _ty);
                  float cothcos = cos(2.0 * _ty);
                  float cothsinh = sinh(2.0 * _tx);
                  float cothcosh = cosh(2.0 * _tx);
                  float d = (cothcosh - cothcos);
                  if (d != 0.0) {
                    float cothden = 1.0 / d;
                    _vx += amount * cothden * cothsinh;
                    _vy += amount * cothden * cothsin;
                  }     
                }`;
    }

    get name(): string {
        return 'coth';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Csch2_BSFunc extends VariationShaderFunc2D {
    PARAM_X1 = 'x1'
    PARAM_X2 = 'x2'
    PARAM_Y1 = 'y1'
    PARAM_Y2 = 'y2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X1, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_X2, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_Y1, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_Y2, type: VariationParamType.VP_NUMBER, initialValue: 2.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        /* Variables added by Brad Stefanov */
        //Hyperbolic Cosecant CSCH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
                  float x2 = ${variation.params.get(this.PARAM_X2)!.toWebGl()};
                  float y1 = ${variation.params.get(this.PARAM_Y1)!.toWebGl()};
                  float y2 = ${variation.params.get(this.PARAM_Y2)!.toWebGl()};
                  float cschsin = sin(_ty * y1);
                  float cschcos = cos(_ty * y2);
                  float cschsinh = sinh(_tx * x1);
                  float cschcosh = cosh(_tx * x2);
                  float d = (cosh(2.0 * _tx) - cos(2.0 * _ty));
                  if (d != 0.0) {
                    float cschden = 2.0 / d;
                    _vx += amount * cschden * cschsinh * cschcos;
                    _vy -= amount * cschden * cschcosh * cschsin;                  
                  }
                }`;
    }

    get name(): string {
        return 'csch2_bs';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CurlFunc extends VariationShaderFunc2D {
    PARAM_C1 = 'c1'
    PARAM_C2 = 'c2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_C1, type: VariationParamType.VP_NUMBER, initialValue: 0.1 },
                { name: this.PARAM_C2, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float c1 = ${variation.params.get(this.PARAM_C1)!.toWebGl()};
          float c2 = ${variation.params.get(this.PARAM_C2)!.toWebGl()};
          float re = 1.0 + c1 * _tx + c2 * (sqr(_tx) - sqr(_ty));
          float im = c1 * _ty + c2 * 2.0 * _tx * _ty;
          float r = amount / (sqr(re) + sqr(im));
          _vx += (_tx * re + _ty * im) * r;
          _vy += (_ty * re - _tx * im) * r;
        }`;
    }

    get name(): string {
        return 'curl';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CurveFunc extends VariationShaderFunc2D {
    PARAM_XAMP = 'xamp'
    PARAM_YAMP = 'yamp'
    PARAM_XLENGTH = 'xlength'
    PARAM_YLENGTH = 'ylength'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XAMP, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_YAMP, type: VariationParamType.VP_NUMBER, initialValue: 0.50 },
            { name: this.PARAM_XLENGTH, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_YLENGTH, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Curve in the Apophysis Plugin Pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float xamp = ${variation.params.get(this.PARAM_XAMP)!.toWebGl()};
          float yamp = ${variation.params.get(this.PARAM_YAMP)!.toWebGl()};
          float xlength = ${variation.params.get(this.PARAM_XLENGTH)!.toWebGl()};
          float ylength = ${variation.params.get(this.PARAM_YLENGTH)!.toWebGl()};
          float _pc_xlen = xlength * xlength;
          float _pc_ylen = ylength * ylength;
          if (_pc_xlen < EPSILON)
            _pc_xlen = EPSILON;
          if (_pc_ylen < EPSILON)
            _pc_ylen = EPSILON;
          _vx += amount * (_tx + xamp * exp(-_ty * _ty / _pc_xlen));
          _vy += amount * (_ty + yamp * exp(-_tx * _tx / _pc_ylen));
        }`;
    }

    get name(): string {
        return 'curve';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class CylinderFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  _vx += amount * sin(_tx);
                  _vy += amount * _ty;
                }`;
    }

    get name(): string {
        return 'cylinder';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Cylinder2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  _vx += amount * _tx / sqrt(sqr(_tx) + 1.0);
                  _vy += amount * _ty;
                }`;
    }

    get name(): string {
        return 'cylinder2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function registerVars_2D_PartC() {
    VariationShaders.registerVar(new CannabisCurveWFFunc())
    VariationShaders.registerVar(new CardioidFunc())
    VariationShaders.registerVar(new ChecksFunc())
    VariationShaders.registerVar(new CellFunc())
    VariationShaders.registerVar(new ChrysanthemumFunc())
    VariationShaders.registerVar(new CirclizeFunc())
    VariationShaders.registerVar(new CircusFunc())
    VariationShaders.registerVar(new CloverLeafWFFunc())
    VariationShaders.registerVar(new CliffordFunc())
    VariationShaders.registerVar(new CollideoscopeFunc())
    VariationShaders.registerVar(new ConicFunc())
    VariationShaders.registerVar(new CosFunc())
    VariationShaders.registerVar(new CoshFunc())
    VariationShaders.registerVar(new Cosh2_BSFunc())
    VariationShaders.registerVar(new CosineFunc())
    VariationShaders.registerVar(new CotFunc())
    VariationShaders.registerVar(new CothFunc())
    VariationShaders.registerVar(new Cot2_BSFunc())
    VariationShaders.registerVar(new Coth2_BSFunc())
    VariationShaders.registerVar(new CPowFunc())
    VariationShaders.registerVar(new CropFunc())
    VariationShaders.registerVar(new CrossFunc())
    VariationShaders.registerVar(new CscFunc())
    VariationShaders.registerVar(new CscSquaredFunc())
    VariationShaders.registerVar(new CschFunc())
    VariationShaders.registerVar(new Csch2_BSFunc())
    VariationShaders.registerVar(new CurlFunc())
    VariationShaders.registerVar(new CurveFunc())
    VariationShaders.registerVar(new CylinderFunc())
    VariationShaders.registerVar(new Cylinder2Func())
}
