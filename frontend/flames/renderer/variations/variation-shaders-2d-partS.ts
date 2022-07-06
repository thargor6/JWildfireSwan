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
  be sure to import this class somewhere and call registerVars_2D_PartS()
 */
class ScryFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* scry from the apophysis plugin pack */
        return `{
           float amount = ${variation.amount.toWebGl()};
           float t = _tx * _tx + _ty * _ty;
           float d = (sqrt(t) * (t + 1.0 / amount));
           if (d != 0.0) {
             float r = 1.0 / d;
             _vx += _tx * r;
             _vy += _ty * r;            
           }
        }`;
    }

    get name(): string {
        return 'scry';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class Scry2Func extends VariationShaderFunc2D {
    PARAM_SIDES = 'sides'
    PARAM_STAR = 'star'
    PARAM_CIRCLE = 'circle'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SIDES, type: VariationParamType.VP_INT, initialValue: 4 },
            { name: this.PARAM_STAR, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_CIRCLE, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* scry2 by dark-beam */
        return `{
          float amount = ${variation.amount.toWebGl()};
          int sides = ${variation.params.get(this.PARAM_SIDES)!.toWebGl()};
          float star = ${variation.params.get(this.PARAM_STAR)!.toWebGl()};
          float circle = ${variation.params.get(this.PARAM_CIRCLE)!.toWebGl()};
          float _sina, _cosa, _sins, _coss, _sinc, _cosc;
          float a = (2.0*M_PI) / float(sides);
          _sina = sin(a);
          _cosa = cos(a);
          a = -(M_PI*0.5) * star;
          _sins = sin(a);
          _coss = cos(a); 
          a = (M_PI*0.5) * circle;
          _sinc = sin(a);
          _cosc = cos(a);
          float xrt = _tx, yrt = _ty, swp;        
          float r2 = xrt * _coss + abs(yrt) * _sins; 
          float r1 = 0.0; 
          float _circle = sqrt(sqr(xrt) + sqr(yrt));
          int i = 0;
        
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          if(i++ < sides - 1) {
            swp = xrt * _cosa - yrt * _sina;
            yrt = xrt * _sina + yrt * _cosa;
            xrt = swp;                    
            r2 = max(r2, xrt * _coss + abs(yrt) * _sins); 
          }
          
          r2 = r2 * _cosc + _circle * _sinc; 
          r1 = r2;
          if (i > 1) {
            r2 = sqr(r2); 
          } else {
            r2 = abs(r2) * r2; 
          }
            
          float d = (r1 * (r2 + 1.0 / amount));
          if (d != 0.0) {
            float r = 1.0 / d;
            _vx += _tx * r;
            _vy += _ty * r;            
          }
        }`;
    }

    get name(): string {
        return 'scry2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

}

class SecFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Secant SEC
        return `{
           float amount = ${variation.amount.toWebGl()};
           float secsin = sin(_tx);
           float seccos = cos(_tx);
           float secsinh = sinh(_ty);
           float seccosh = cosh(_ty);
           float d = (cos(2.0 * _tx) + cosh(2.0 * _ty));
           if (d != 0.0) {
             float secden = 2.0 / d;
             _vx += amount * secden * seccos * seccosh;
             _vy += amount * secden * secsin * secsinh;
           }
        }`;
    }

    get name(): string {
        return 'sec';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class Sec2_BSFunc extends VariationShaderFunc2D {
    PARAM_X1 = 'x1'
    PARAM_X2 = 'x2'
    PARAM_Y1 = 'y1'
    PARAM_Y2 = 'y2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X1, type: VariationParamType.VP_FLOAT, initialValue: 1.25 },
            { name: this.PARAM_X2, type: VariationParamType.VP_FLOAT, initialValue: 0.75 },
            { name: this.PARAM_Y1, type: VariationParamType.VP_FLOAT, initialValue: 1.5 },
            { name: this.PARAM_Y2, type: VariationParamType.VP_FLOAT, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        /* Variables added by Brad Stefanov */
        //Secant SEC
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
          float x2 = ${variation.params.get(this.PARAM_X2)!.toWebGl()};
          float y1 = ${variation.params.get(this.PARAM_Y1)!.toWebGl()};
          float y2 = ${variation.params.get(this.PARAM_Y2)!.toWebGl()};
          float secsin = sin(_tx * x1);
          float seccos = cos(_tx * x2);
          float secsinh = sinh(_ty * y1);
          float seccosh = cosh(_ty * y2);
          float d = (cos(2.0 * _tx) + cosh(2.0 * _ty));
          if (d != 0.0) {
            float secden = 2.0 / d;
            _vx += amount * secden * seccos * seccosh;
            _vy += amount * secden * secsin * secsinh;              
          }
        }`;
    }

    get name(): string {
        return 'sec2_bs';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class Secant2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Intended as a 'fixed' version of secant */
        return `{
           float amount = ${variation.amount.toWebGl()};
           float r = amount * _r;
           float cr = cos(r);
           if (cr != 0.0) {
             float icr = 1.0 / cr;
             _vx += amount * _tx;
             if (cr < 0.0) {
               _vy += amount * (icr + 1.0);
             } else {
               _vy += amount * (icr - 1.0);
             } 
           }
        }`;
    }

    get name(): string {
        return 'secant2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SechFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Secant SECH
        return `{
          float amount = ${variation.amount.toWebGl()};
          float sechsin = sin(_ty);
          float sechcos = cos(_ty);
          float sechsinh = sinh(_tx);
          float sechcosh = cosh(_tx);
          float d = (cos(2.0 * _ty) + cosh(2.0 * _tx));
          if (d != 0.0) {
            float sechden = 2.0 / d;
            _vx += amount * sechden * sechcos * sechcosh;
            _vy -= amount * sechden * sechsin * sechsinh; 
          }
        }`;
    }

    get name(): string {
        return 'sech';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class Sech2_BSFunc extends VariationShaderFunc2D {
    PARAM_X1 = 'x1'
    PARAM_X2 = 'x2'
    PARAM_Y1 = 'y1'
    PARAM_Y2 = 'y2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X1, type: VariationParamType.VP_FLOAT, initialValue: 1.25 },
            { name: this.PARAM_X2, type: VariationParamType.VP_FLOAT, initialValue: 0.75 },
            { name: this.PARAM_Y1, type: VariationParamType.VP_FLOAT, initialValue: 1.5 },
            { name: this.PARAM_Y2, type: VariationParamType.VP_FLOAT, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        /* Variables added by Brad Stefanov */
        //Hyperbolic Secant SECH
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
          float x2 = ${variation.params.get(this.PARAM_X2)!.toWebGl()};
          float y1 = ${variation.params.get(this.PARAM_Y1)!.toWebGl()};
          float y2 = ${variation.params.get(this.PARAM_Y2)!.toWebGl()};
          float sechsin = sin(_ty * y1);
          float sechcos = cos(_ty * y2);
          float sechsinh = sinh(_tx * x1);
          float sechcosh = cosh(_tx * x2);
          float d = (cos(2.0 * _ty) + cosh(2.0 * _tx));
          if (d != 0.0) {
            float sechden = 2.0 / d;
            _vx += amount * sechden * sechcos * sechcosh;
            _vy -= amount * sechden * sechsin * sechsinh;          
          }
        }`;
    }

    get name(): string {
        return 'sech2_bs';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class SeparationFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_XINSIDE = 'xinside'
    PARAM_Y = 'y'
    PARAM_YINSIDE = 'yinside'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_XINSIDE, type: VariationParamType.VP_FLOAT, initialValue: 0.05 },
            { name: this.PARAM_Y, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_YINSIDE, type: VariationParamType.VP_FLOAT, initialValue: 0.025 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* separation from the apophysis plugin pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float xinside = ${variation.params.get(this.PARAM_XINSIDE)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float yinside = ${variation.params.get(this.PARAM_YINSIDE)!.toWebGl()};
          float sx2 = x * x;
          float sy2 = y * y;

          if (_tx > 0.0) {
            _vx += amount * (sqrt(_tx * _tx + sx2) - _tx * xinside);
          } else {
            _vx -= amount * (sqrt(_tx * _tx + sx2) + _tx * xinside);
          }
        
          if (_ty > 0.0) {
            _vy += amount * (sqrt(_ty * _ty + sy2) - _ty * yinside);
          } else {
            _vy -= amount * (sqrt(_ty * _ty + sy2) + _ty * yinside);
          }
        }`;
    }

    get name(): string {
        return 'separation';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class ShiftFunc extends VariationShaderFunc2D {
    PARAM_SHIFT_X = 'shift_x'
    PARAM_SHIFT_Y = 'shift_y'
    PARAM_ANGLE = 'angle'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT_X, type: VariationParamType.VP_FLOAT, initialValue: 0.20 },
            { name: this.PARAM_SHIFT_Y, type: VariationParamType.VP_FLOAT, initialValue: 0.06 },
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_FLOAT, initialValue: 12.25 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
         // 'shift' variation created by Tatyana Zabanova implemented into JWildfire by Brad Stefanov
         return `{
          float amount = ${variation.amount.toWebGl()};
          float shift_x = ${variation.params.get(this.PARAM_SHIFT_X)!.toWebGl()};
          float shift_y = ${variation.params.get(this.PARAM_SHIFT_Y)!.toWebGl()};   
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float ang = angle / 180.0 * M_PI;   
          float sn = sin(ang);
          float cs = cos(ang);
          _vx += amount * (_tx + cs * shift_x - sn * shift_y);
          _vy += amount * (_ty - cs * shift_y - sn * shift_x);
        }`;
    }

    get name(): string {
        return 'shift';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ShredlinFunc extends VariationShaderFunc2D {
    PARAM_XDISTANCE = 'xdistance'
    PARAM_XWIDTH = 'xwidth'
    PARAM_YDISTANCE = 'ydistance'
    PARAM_YWIDTH = 'ywidth'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XDISTANCE, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_XWIDTH, type: VariationParamType.VP_FLOAT, initialValue: 0.50 },
            { name: this.PARAM_YDISTANCE, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_YWIDTH, type: VariationParamType.VP_FLOAT, initialValue: 0.50 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Shredlin by Zy0rg
        return `{
          float amount = ${variation.amount.toWebGl()};
          float xdistance = ${variation.params.get(this.PARAM_XDISTANCE)!.toWebGl()};
          float xwidth = ${variation.params.get(this.PARAM_XWIDTH)!.toWebGl()};   
          float ydistance = ${variation.params.get(this.PARAM_YDISTANCE)!.toWebGl()};
          float ywidth = ${variation.params.get(this.PARAM_YWIDTH)!.toWebGl()};          
          float sxd = xdistance;
          float sxw = xwidth;
          float syd = ydistance;
          float syw = ywidth;
          float vv = amount;
          int xpos = _tx < 0.0 ? 1 : 0;
          int ypos = _ty < 0.0 ? 1 : 0;
          float xrng = _tx / sxd;
          float yrng = _ty / syd;
          _vx = vv * sxd * ((xrng - float(int(xrng))) * sxw + float(int(xrng)) + (0.5 - float(xpos)) * (1.0 - sxw));
          _vy = vv * syd * ((yrng - float(int(yrng))) * syw + float(int(yrng)) + (0.5 - float(ypos)) * (1.0 - syw)); 
        }`;
    }

    get name(): string {
        return 'shredlin';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ShredradFunc extends VariationShaderFunc2D {
    PARAM_N = 'n'
    PARAM_WIDTH = 'width'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_FLOAT, initialValue: 4.00 },
            { name: this.PARAM_WIDTH, type: VariationParamType.VP_FLOAT, initialValue: 0.50 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* shredrad by zy0rg */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
          float width = ${variation.params.get(this.PARAM_WIDTH)!.toWebGl()};   
          if(n==0.0) n=EPSILON;
          float alpha = (2.0*M_PI) / n;
          float sa = alpha;
          float sw = width;
          float ang = atan2(_ty, _tx); // _theta 
          float rad = _r;
          float xang = (ang + 3.0 * M_PI + sa / 2.0) / sa;
          float zang = ((xang - float(int(xang))) * sw + float(int(xang))) * sa - M_PI - sa / 2.0 * sw;
          float s = sin(zang);
          float c = cos(zang);
          _vx += amount * rad * c;
          _vy += amount * rad * s;
        }`;
    }

    get name(): string {
        return 'shredrad';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SigmoidFunc extends VariationShaderFunc2D {
    PARAM_SHIFTX = 'shiftx'
    PARAM_SHIFTY = 'shifty'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFTX, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_SHIFTY, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // author Xyrus. Implemented by Brad Stefanov
        return `{
          float amount = ${variation.amount.toWebGl()};
          float shiftx = ${variation.params.get(this.PARAM_SHIFTX)!.toWebGl()};
          float shifty = ${variation.params.get(this.PARAM_SHIFTY)!.toWebGl()};
          float ax = 1.0;
          float ay = 1.0;
          float sx = shiftx;
          float sy = shifty;
          if (sx < 1.0 && sx > -1.0) {
            if (sx == 0.0) {
              sx = EPSILON;
              ax = 1.0;
            } else {
              ax = (sx < 0.0 ? -1.0 : 1.0);
              sx = 1.0 / sx;
            }
          }
          if (sy < 1.0 && sy > -1.0) {
            if (sy == 0.0) {
              sy = EPSILON;
              ay = 1.0;
            } else {
              ay = (sy < 0.0 ? -1.0 : 1.0);
              sy = 1.0 / sy;
            }
          }
          sx *= -5.0;
          sy *= -5.0;
          float vv = abs(amount);
          float c0 = ax / (1.0 + exp(sx * _tx));
          float c1 = ay / (1.0 + exp(sy * _ty));
          float x = (2.0 * (c0 - 0.5));
          float y = (2.0 * (c1 - 0.5));
          _vx += vv * x;
          _vy += vv * y; 
        }`;
    }

    get name(): string {
        return 'sigmoid';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SinFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Sine SIN
        return `{
          float amount = ${variation.amount.toWebGl()};
          float sinsin = sin(_tx);
          float sincos = cos(_tx);
          float sinsinh = sinh(_ty);
          float sincosh = cosh(_ty);
          _vx += amount * sinsin * sincosh;
          _vy += amount * sincos * sinsinh;
        }`;
    }

    get name(): string {
        return 'sin';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class SineBlurFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // sineblur by Zyorg, http://zy0rg.deviantart.com/art/Blur-Package-347648919
        return `{
          float amount = ${variation.amount.toWebGl()};
          float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          if (power < 0.0)
            power = 0.0;
          float ang = rand8(tex, rngState) * (2.0*M_PI);
          float r = amount * (power == 1.0 ? acos(rand8(tex, rngState) * 2.0 - 1.0) / M_PI : acos(exp(log(rand8(tex, rngState)) * power) * 2.0 - 1.0) / M_PI);
          float s = sin(ang);
          float c = cos(ang);
          _vx += r * c;
          _vy += r * s;
        }`;
    }

    get name(): string {
        return 'sineblur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BLUR];
    }
}

class SinhFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* complex vars by cothe */
        /* exp log sin cos tan sec csc cot sinh cosh tanh sech csch coth */
        //Hyperbolic Sine SINH
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float sinhsin = sin(_ty);
                  float sinhcos = cos(_ty);
                  float sinhsinh = sinh(_tx);
                  float sinhcosh = cosh(_tx);
                  _vx += amount * sinhsinh * sinhcos;
                  _vy += amount * sinhcosh * sinhsin;
                }`;
    }

    get name(): string {
        return 'sinh';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH];
    }
}

class SinqFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Sinq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(_tx);
                  float c = cos(_tx);
                  float sh = sinh(abs_v);
                  float ch = cosh(abs_v);
                  float C = amount * c * sh / abs_v;
                  _vx += amount * s * ch;
                  _vy += C * _ty;
                  _vz += C * _tz;
                }`;
    }

    get name(): string {
        return 'sinq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }
}

class SintrangeFunc extends VariationShaderFunc2D {
    PARAM_W = 'w'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_W, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Sintrange from Ffey, http://ffey.deviantart.com/art/apoplugin-Sintrange-245146228 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float w = ${variation.params.get(this.PARAM_W)!.toWebGl()};
          float v = ((sqr(_tx) + sqr(_ty)) * w);
          _vx = amount * (sin(_tx)) * (_tx * _tx + w - v);
          _vy = amount * (sin(_ty)) * (_ty * _ty + w - v);
        }`;
    }

    get name(): string {
        return 'sintrange';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SinhqFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Sinhq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
                  float amount = ${variation.amount.toWebGl()};
                  float abs_v = hypot(_ty, _tz);
                  float s = sin(abs_v);
                  float c = cos(abs_v);
                  float sh = sinh(_tx);
                  float ch = cosh(_tx);
                  float C = amount * ch * s / abs_v;
                  _vx += amount * sh * c;
                  _vy += C * _ty;
                  _vz += C * _tz;
                }`;
    }

    get name(): string {
        return 'sinhq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }
}

class SinusoidalFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * sin(_tx);
          _vy += amount * sin(_ty);
        }`;
    }

    get name(): string {
        return 'sinusoidal';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }

}

class SphericalFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float lr = amount / (_tx * _tx + _ty * _ty + EPSILON);
          _vx += _tx * lr;
          _vy += _ty * lr;
        }`;
    }

    get name(): string {
        return 'spherical';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SphericalNFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_DIST = 'dist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_FLOAT, initialValue: 3.00 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // SphericalN by eralex61, http://eralex61.deviantart.com/art/SphericalN-plugin-166218657?q=gallery%3Aapophysis-plugins%2F24607713&qo=36
        //R=sqrt(sqr(pAffineTP.x)+sqr(pAffineTP.y));
        return `{
          float amount = ${variation.amount.toWebGl()};
          float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};   
          float R = pow(sqrt(sqr(_tx) + sqr(_ty)), dist);
          if (R > EPSILON) {
            int N = int(floor(power * rand8(tex, rngState)));
            float alpha = atan2(_ty, _tx) + float(N) * (2.0*M_PI) / floor(power);
            float sina = sin(alpha);
            float cosa = cos(alpha);
            _vx += amount * cosa / R;
            _vy += amount * sina / R;
          }
        }`;
    }

    get name(): string {
        return 'sphericalN';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SpiralFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float sinA = _tx / _r;
          float cosA = _ty / _r;
          float r = _r;
          float sinr = sin(r);
          float cosr = cos(r);
          r = amount / r;
          _vx += (cosA + sinr) * r;
          _vy += (sinA - cosr) * r;
        }`;
    }

    get name(): string {
        return 'spiral';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SpiralwingFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // spiralwing by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount.toWebGl()};
          float c1 = sqr(_tx);
          float c2 = sqr(_ty);
          float d = amount / (c1 + c2 + EPSILON);
          c2 = sin(c2); 
          _vx += d * cos(c1) * c2;
          _vy += d * sin(c1) * c2;
        }`;
    }

    get name(): string {
        return 'spiralwing';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SpirographFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_D = 'd'
    PARAM_C1 = 'c1'
    PARAM_C2 = 'c2'
    PARAM_TMIN = 'tmin'
    PARAM_TMAX = 'tmax'
    PARAM_YMIN = 'ymin'
    PARAM_YMAX = 'ymax'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 3.00 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 2.00 },
            { name: this.PARAM_D, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_C1, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_C2, type: VariationParamType.VP_FLOAT, initialValue: 0.00 },
            { name: this.PARAM_TMIN, type: VariationParamType.VP_FLOAT, initialValue: -1.00 },
            { name: this.PARAM_TMAX, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_YMIN, type: VariationParamType.VP_FLOAT, initialValue: -1.00 },
            { name: this.PARAM_YMAX, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float c1 = ${variation.params.get(this.PARAM_C1)!.toWebGl()};
          float c2 = ${variation.params.get(this.PARAM_C2)!.toWebGl()};
          float tmin = ${variation.params.get(this.PARAM_TMIN)!.toWebGl()};
          float tmax = ${variation.params.get(this.PARAM_TMAX)!.toWebGl()};
          float ymin = ${variation.params.get(this.PARAM_YMIN)!.toWebGl()};
          float ymax = ${variation.params.get(this.PARAM_YMAX)!.toWebGl()};
          float t = (tmax - tmin) * rand8(tex, rngState) + tmin;
          float y = (ymax - ymin) * rand8(tex, rngState) + ymin;
          float x1 = (a + b) * cos(t) - c1 * cos((a + b) / b * t);
          float y1 = (a + b) * sin(t) - c2 * sin((a + b) / b * t);
          _vx += amount * (x1 + d * cos(t) + y);
          _vy += amount * (y1 + d * sin(t) + y);
        }`;
    }

    get name(): string {
        return 'spirograph';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SpligonFunc extends VariationShaderFunc2D {
    PARAM_SIDES = 'sides'
    PARAM_R = 'r'
    PARAM_I = 'i'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SIDES, type: VariationParamType.VP_FLOAT, initialValue: 3.0 },
            { name: this.PARAM_R, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_I, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // spligon by DarkBeam
        return `{
          float amount = ${variation.amount.toWebGl()};
          float sides = ${variation.params.get(this.PARAM_SIDES)!.toWebGl()};
          float r = ${variation.params.get(this.PARAM_R)!.toWebGl()};
          float i = ${variation.params.get(this.PARAM_I)!.toWebGl()};
          float _theta = atan2(_ty, _tx);
          float th = sides * (1.0 / (M_PI + M_PI));
          float thi = 1.0 / th;
          float j = 3.14159265358979323846 * i / (-2.0 * sides) ;  
          float dx,dy;
          float t = thi * floor(_theta * th ) + j;
          dx = sin(t); 
          dy = cos(t);
          _vx += amount * (_tx + dy * r);
          _vy += amount * (_ty + dx * r);
        }`;
    }

    get name(): string {
        return 'spligon';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SplitFunc extends VariationShaderFunc2D {
    PARAM_XSIZE = 'xsize'
    PARAM_YSIZE = 'ysize'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XSIZE, type: VariationParamType.VP_FLOAT, initialValue: 0.4 },
                { name: this.PARAM_YSIZE, type: VariationParamType.VP_FLOAT, initialValue: 0.6 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Split from apo plugins pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
         
          float xSize = ${variation.params.get(this.PARAM_XSIZE)!.toWebGl()};
          if (cos(_tx * xSize * M_PI) >= 0.0) {
            _vy += amount * _ty;
          } else {
            _vy -= amount * _ty;
          }
          float ySize = ${variation.params.get(this.PARAM_YSIZE)!.toWebGl()};
          if (cos(_ty * ySize * M_PI) >= 0.0) {
            _vx += amount * _tx;
          } else {
            _vx -= amount * _tx;
          };
        }`;
    }

    get name(): string {
        return 'split';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SplitsFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_LSHEAR = 'lshear'
    PARAM_RSHEAR = 'rshear'
    PARAM_USHEAR = 'ushear'
    PARAM_DSHEAR = 'dshear'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_FLOAT, initialValue: 0.4 },
                { name: this.PARAM_Y, type: VariationParamType.VP_FLOAT, initialValue: 0.6 },
                { name: this.PARAM_LSHEAR, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
                { name: this.PARAM_RSHEAR, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
                { name: this.PARAM_USHEAR, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
                { name: this.PARAM_DSHEAR, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Splits from apo plugins pack; shears added by DarkBeam 2018 to emulate splits.dll */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          
          if (_tx >= 0.0) {
            _vx += amount * (_tx + x);
            float rshear = ${variation.params.get(this.PARAM_RSHEAR)!.toWebGl()};
            _vy += amount * (rshear);
          } else {
            _vx += amount * (_tx - x);
            float lshear = ${variation.params.get(this.PARAM_LSHEAR)!.toWebGl()};
            _vy -= amount * (lshear);
          }
    
          if (_ty >= 0.0) {
             _vy += amount * (_ty + y);
             float ushear = ${variation.params.get(this.PARAM_USHEAR)!.toWebGl()};
             _vx += amount * (ushear);
           } else {
             _vy += amount * (_ty - y);
             float dshear = ${variation.params.get(this.PARAM_DSHEAR)!.toWebGl()};
             _vx -= amount * (dshear);
           }
        }`;
    }

    get name(): string {
        return 'splits';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SquareFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * (rand8(tex, rngState) - 0.5);
          _vy += amount * (rand8(tex, rngState) - 0.5);    
        }`;
    }

    get name(): string {
        return 'square';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class SquarizeFunc extends VariationShaderFunc2D {
    // squarize by MichaelFaber - The angle pack: http://michaelfaber.deviantart.com/art/The-Angle-Pack-277718538
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
            float s = sqrt(sqr(_tx) + sqr(_ty));
            float a = atan2(_ty, _tx);
            if (a < 0.0)
              a += (2.0*M_PI);
            float p = 4.0 * s * a / M_PI;
            if (p <= 1.0 * s) {
              _vx += amount * s;
              _vy += amount * p;
            } else if (p <= 3.0 * s) {
              _vx += amount * (2.0 * s - p);
              _vy += amount * (s);
            } else if (p <= 5.0 * s) {
              _vx -= amount * (s);
              _vy += amount * (4.0 * s - p);
            } else if (p <= 7.0 * s) {
              _vx -= amount * (6.0 * s - p);
              _vy -= amount * (s);
            } else {
              _vx += amount * (s);
              _vy -= amount * (8.0 * s - p);
            }   
        }`;
    }

    get name(): string {
        return 'squarize';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SquircularFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float u = _tx;
          float v = _ty;
          float r = u * u + v * v;
          float rs = sqrt(r);
          float xs = u > 0.0 ? 1.0 : -1.0;
    
          r = sqrt(amount * amount * r - 4.0* u * u * v * v);
          r = sqrt(1.0 + u * u / (v * v) - rs / (amount * v * v) * r);
          r = r / sqrt(2.0);
    
          _vx += xs * r;
          _vy += v / u * r;
        }`;
    }

    get name(): string {
        return 'squircular';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SquirrelFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.00 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // squirrel by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};   
          float u = (a + EPSILON) * sqr(_tx) + (b + EPSILON) * sqr(_ty);
          _vx = cos(sqrt(u)) * tan(_tx) * amount;
          _vy = sin(sqrt(u)) * tan(_ty) * amount;
        }`;
    }

    get name(): string {
        return 'squirrel';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SquishFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_INT, initialValue: 2 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // squish by MichaelFaber - The angle pack: http://michaelfaber.deviantart.com/art/The-Angle-Pack-277718538
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float _inv_power = 1.0 / float(power); 
          float x = abs(_tx);
          float y = abs(_ty);
          float s;
          float p;
        
          if (x > y) {
            s = x;
            if (_tx > 0.0) {
              p = _ty;
            } else {
              p = 4.0 * s - _ty;
            }
          } else {
            s = y;
            if (_ty > 0.0) {
              p = 2.0 * s - _tx;
            } else {
              p = 6.0 * s + _tx;
            }
          }
        
          p = _inv_power * (p + 8.0 * s * floor(float(power) * rand8(tex, rngState)));
        
          if (p <= 1.0 * s) {
            _vx += amount * s;
            _vy += amount * p;
          } else if (p <= 3.0 * s) {
            _vx += amount * (2.0 * s - p);
            _vy += amount * (s);
          } else if (p <= 5.0 * s) {
            _vx -= amount * (s);
            _vy += amount * (4.0 * s - p);
          } else if (p <= 7.0 * s) {
            _vx -= amount * (6.0 * s - p);
            _vy -= amount * (s);
          } else {
            _vx += amount * (s);
            _vy -= amount * (8.0 * s - p);
          }
        }`;
    }

    get name(): string {
        return 'squish';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class StarBlurFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_RANGE = 'range'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_INT, initialValue: 5 },
            { name: this.PARAM_RANGE, type: VariationParamType.VP_FLOAT, initialValue: 0.40162283177245455973959534526548 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // starblur by Zyorg, http://zy0rg.deviantart.com/art/Blur-Package-347648919
        return `{
          float amount = ${variation.amount.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float range = ${variation.params.get(this.PARAM_RANGE)!.toWebGl()};
          float starblur_alpha = M_PI / float(power);
          float starblur_length = sqrt(1.0 + range*range - 2.0 * range * cos(starblur_alpha));
          starblur_alpha = asin(sin(starblur_alpha) * range / starblur_length);
          float f = rand8(tex, rngState) * float(power) * 2.0;
          float angle = trunc(f);
          f = f - angle;
          float x = f * starblur_length;
          float z = sqrt(1.0 + x*x - 2.0 * x * cos(starblur_alpha));
          int iangle = int(angle);
          if ((iangle/2)*2==iangle)
            angle = 2.0*M_PI / float(power) * float((iangle) / 2) + asin(sin(starblur_alpha) * x / z);
          else
            angle = 2.0*M_PI / float(power) * float((iangle) / 2) - asin(sin(starblur_alpha) * x / z);
          z = z * sqrt(rand8(tex, rngState));
        
          float ang = angle - PI*0.5;
          float s = sin(ang);
          float c = cos(ang);
        
          _vx += amount * z * c;
          _vy += amount * z * s;

        }`;
    }

    get name(): string {
        return 'starblur';
    }

    get funcDependencies(): string[] {
        return [FUNC_TRUNC];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class StripesFunc extends VariationShaderFunc2D {
    PARAM_SPACE = 'space'
    PARAM_WARP = 'warp'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPACE, type: VariationParamType.VP_FLOAT, initialValue: 0.20 },
            { name: this.PARAM_WARP, type: VariationParamType.VP_FLOAT, initialValue: 0.60 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Stripes from apo plugins pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float space = ${variation.params.get(this.PARAM_SPACE)!.toWebGl()};
          float warp = ${variation.params.get(this.PARAM_WARP)!.toWebGl()};   
          float roundx = floor(_tx + 0.5);
          float offsetx = _tx - roundx;
          _vx += amount * (offsetx * (1.0 - space) + roundx);
          _vy += amount * (_ty + offsetx * offsetx * warp);
        }`;
    }

    get name(): string {
        return 'stripes';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class StripfitFunc extends VariationShaderFunc2D {
    PARAM_DX = 'dx'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_DX, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }]
    }


    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* stripfit by dark-beam
         * https://www.deviantart.com/dark-beam/art/Stripfit-764742549
         * converted for JWF by dark_beam and Brad Stefanov		 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float dx = ${variation.params.get(this.PARAM_DX)!.toWebGl()};
          float fity;
          float dxp = -0.5 * dx;
          if (amount != 0.) {
            _vx += amount * _tx;
            if (_ty > 1.0) {
              fity = mod(_ty + 1.0, 2.0);
              _vy += amount * (-1.0 + fity);
              _vx += (_ty - fity + 1.0) * dxp;
            } else if (_ty < -1.0) {
              fity = mod(1.0 - _ty, 2.0);
              _vy += amount * (1.0 - fity);
              _vx += (_ty + fity - 1.0) * dxp;
            } else {
              _vy += amount * _ty;
            }
          }
        }`;
    }

    get name(): string {
        return 'stripfit';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class STwinFunc extends VariationShaderFunc2D {
    PARAM_DISTORT = 'distort'
    PARAM_OFFSET_XY = 'offset_xy'
    PARAM_OFFNET_X2 = 'offset_x2'
    PARAM_OFFSET_Y2 = 'offset_y2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_DISTORT, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_OFFSET_XY, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_OFFNET_X2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_OFFSET_Y2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /*
         *  STwinFunc: JWildfire variation,
         *  JWildfire variation, ported from "stwin" Apophysis7X plugin, plus added extra user-configurable parameters
         *  original Apophysis7X plugin author xyrus02 ?
         *  ported to JWildfire varation by CozyG
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float distort = ${variation.params.get(this.PARAM_DISTORT)!.toWebGl()};
          float offset_xy = ${variation.params.get(this.PARAM_OFFSET_XY)!.toWebGl()};
          float offset_x2 = ${variation.params.get(this.PARAM_OFFNET_X2)!.toWebGl()};
          float offset_y2 = ${variation.params.get(this.PARAM_OFFSET_Y2)!.toWebGl()};
          float multiplier = 0.05;
          float multiplier2 = 0.0001;
          float multiplier3 = 0.1;
          float x = _tx * amount * multiplier;
          float y = _ty * amount * multiplier;
          float x2 = x * x + (offset_x2 * multiplier2);
          float y2 = y * y + (offset_y2 * multiplier2);
          float result = (x2 - y2) * sin((2.0*M_PI) * distort * (x + y + (offset_xy * multiplier3)));
          float divident = x2 + y2;
          if (divident == 0.0) {
            divident = 1.0;
          }
          result = result / divident;
          _vx += (amount * _tx) + result;
          _vy += (amount * _ty) + result;
        }`;
    }

    get name(): string {
        return 'stwin';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class SuperShapeFunc extends VariationShaderFunc2D {
    PARAM_RND = 'rnd'
    PARAM_M = 'm'
    PARAM_N1 = 'n1'
    PARAM_N2 = 'n2'
    PARAM_N3 = 'n3'
    PARAM_HOLES = 'holes'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RND, type: VariationParamType.VP_FLOAT, initialValue: 3.0 },
            { name: this.PARAM_M, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N3, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_HOLES, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rnd = ${variation.params.get(this.PARAM_RND)!.toWebGl()};
          float m = ${variation.params.get(this.PARAM_M)!.toWebGl()};
          float n1 = ${variation.params.get(this.PARAM_N1)!.toWebGl()};
          float n2 = ${variation.params.get(this.PARAM_N2)!.toWebGl()};
          float n3 = ${variation.params.get(this.PARAM_N3)!.toWebGl()};
          float holes = ${variation.params.get(this.PARAM_HOLES)!.toWebGl()};
          float pm_4 = m / 4.0;
          float pneg1_n1 = -1.0 / n1;   
          float _theta = atan2(_ty, _tx);
          float theta = pm_4 * _theta + (0.25*M_PI);
          float st = sin(theta);
          float ct = cos(theta);
          float t1 = abs(ct);
          t1 = pow(t1, n2);
          float t2 = abs(st);
          t2 = pow(t2, n3);    
          float myrnd = rnd;
          float r = amount * ((myrnd * rand8(tex, rngState) + (1.0 - myrnd) * _r) - holes)
                    * pow(t1 + t2, pneg1_n1) / _r;
          _vx += r * _tx;
          _vy += r * _ty;
        }`;
    }

    get name(): string {
        return 'super_shape';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class SwirlFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
         return `{
          float amount = ${variation.amount.toWebGl()};
          float r2 = _tx * _tx + _ty * _ty;
          float c1 = sin(r2);
          float c2 = cos(r2);
          _vx += amount * (c1 * _tx - c2 * _ty);
          _vy += amount * (c2 * _tx + c1 * _ty);
        }`;
    }

    get name(): string {
        return 'swirl';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Swirl3Func extends VariationShaderFunc2D {
    PARAM_SHIFT = 'shift'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.50 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float shift = ${variation.params.get(this.PARAM_SHIFT)!.toWebGl()};
          float rad = _r;
          float _theta = atan2(_ty, _tx);
          float ang = _theta + log(rad) * shift;
          float s = sin(ang);
          float c = cos(ang);
          _vx += amount * rad * c;
          _vy += amount * rad * s;
        }`;
    }

    get name(): string {
        return 'swirl3';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function registerVars_2D_PartS() {
    VariationShaders.registerVar(new ScryFunc())
    VariationShaders.registerVar(new Scry2Func())
    VariationShaders.registerVar(new SecFunc())
    VariationShaders.registerVar(new Sec2_BSFunc())
    VariationShaders.registerVar(new Secant2Func())
    VariationShaders.registerVar(new SechFunc())
    VariationShaders.registerVar(new Sech2_BSFunc())
    VariationShaders.registerVar(new SeparationFunc())
    VariationShaders.registerVar(new ShiftFunc())
    VariationShaders.registerVar(new ShredlinFunc())
    VariationShaders.registerVar(new ShredradFunc())
    VariationShaders.registerVar(new SigmoidFunc())
    VariationShaders.registerVar(new SinFunc())
    VariationShaders.registerVar(new SineBlurFunc())
    VariationShaders.registerVar(new SinhFunc())
    VariationShaders.registerVar(new SinhqFunc())
    VariationShaders.registerVar(new SinqFunc())
    VariationShaders.registerVar(new SintrangeFunc())
    VariationShaders.registerVar(new SinusoidalFunc())
    VariationShaders.registerVar(new SphericalFunc())
    VariationShaders.registerVar(new SphericalNFunc())
    VariationShaders.registerVar(new SpiralFunc())
    VariationShaders.registerVar(new SpiralwingFunc())
    VariationShaders.registerVar(new SpirographFunc())
    VariationShaders.registerVar(new SpligonFunc())
    VariationShaders.registerVar(new SplitFunc())
    VariationShaders.registerVar(new SplitsFunc())
    VariationShaders.registerVar(new SquareFunc())
    VariationShaders.registerVar(new SquarizeFunc())
    VariationShaders.registerVar(new SquircularFunc())
    VariationShaders.registerVar(new SquirrelFunc())
    VariationShaders.registerVar(new SquishFunc())
    VariationShaders.registerVar(new StarBlurFunc())
    VariationShaders.registerVar(new StripesFunc())
    VariationShaders.registerVar(new StripfitFunc())
    VariationShaders.registerVar(new STwinFunc())
    VariationShaders.registerVar(new SuperShapeFunc())
    VariationShaders.registerVar(new SwirlFunc())
    VariationShaders.registerVar(new Swirl3Func())
}
