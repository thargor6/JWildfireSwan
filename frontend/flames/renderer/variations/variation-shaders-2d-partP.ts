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
import {FUNC_MODULO, FUNC_ROUND, FUNC_SGN} from 'Frontend/flames/renderer/variations/variation-math-functions';
import {M_PI} from 'Frontend/flames/renderer/mathlib';

/*
  be sure to import this class somewhere and call registerVars_2D_PartP()
 */
class Panorama1Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // author Tatyana Zabanova 2017. Implemented by DarkBeam 2017
        return `{
          float amount = ${variation.amount.toWebGl()};
          float aux = 1.0 / sqrt(_tx * _tx + _ty * _ty + 1.0);
          float x1 = _tx * aux;
          float y1 = _ty * aux;
          aux = sqrt(x1 * x1 + y1 * y1);
          _vx += amount * (atan2(x1, y1)) * (1.0 / M_PI);
          _vy += amount * (aux - 0.5);       
        }`;
    }

    get name(): string {
        return 'panorama1';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Panorama2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // author Tatyana Zabanova 2017. Implemented by DarkBeam 2017
        return `{
          float amount = ${variation.amount.toWebGl()};
          float aux = 1.0 / (sqrt(_tx * _tx + _ty * _ty) + 1.0);
          float x1 = _tx * aux;
          float y1 = _ty * aux;
          aux = sqrt(x1 * x1 + y1 * y1);
          _vx += amount * (atan2(x1, y1)) / M_PI;
          _vy += amount * (aux - 0.5);
        }`;
    }

    get name(): string {
        return 'panorama2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ParabolaFunc extends VariationShaderFunc2D {
    PARAM_WIDTH = 'width'
    PARAM_HEIGHT = 'height'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_WIDTH, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_HEIGHT, type: VariationParamType.VP_FLOAT, initialValue: 0.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* cyberxaos, 4/2007 */
         return `{
          float amount = ${variation.amount.toWebGl()};
          float width = ${variation.params.get(this.PARAM_WIDTH)!.toWebGl()};
          float height = ${variation.params.get(this.PARAM_HEIGHT)!.toWebGl()};
          float r = _r;
          float sr = sin(r);
          float cr = cos(r);
          _vx += height * amount * sr * sr * rand8(tex, rngState);
          _vy += width * amount * cr * rand8(tex, rngState);
        }`;
    }

    get name(): string {
        return 'parabola';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ParallelFunc extends VariationShaderFunc2D {
    PARAM_X1WIDTH = 'x1width'
    PARAM_X1TILESIZE = 'x1tilesize'
    PARAM_X1MOD1 = 'x1mod1'
    PARAM_X1MOD2 = 'x1mod2'
    PARAM_X1HEIGHT = 'x1height'
    PARAM_X1MOVE = 'x1move'
    PARAM_X2WIDTH = 'x2width'
    PARAM_X2TILESIZE = 'x2tilesize'
    PARAM_X2MOD1 = 'x2mod1'
    PARAM_X2MOD2 = 'x2mod2'
    PARAM_X2HEIGHT = 'x2height'
    PARAM_X2MOVE = 'x2move'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X1WIDTH, type: VariationParamType.VP_FLOAT, initialValue: 5.0 },
            { name: this.PARAM_X1TILESIZE, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_X1MOD1, type: VariationParamType.VP_FLOAT, initialValue: 0.3 },
            { name: this.PARAM_X1MOD1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_X1HEIGHT, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_X1MOVE, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_X2WIDTH, type: VariationParamType.VP_FLOAT, initialValue: 5.0 },
            { name: this.PARAM_X2TILESIZE, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_X2MOD1, type: VariationParamType.VP_FLOAT, initialValue: 0.3 },
            { name: this.PARAM_X2MOD2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_X2HEIGHT, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_X2MOVE, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* parallel by Brad Stefanov */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x1width = ${variation.params.get(this.PARAM_X1WIDTH)!.toWebGl()};
          float x1tilesize = ${variation.params.get(this.PARAM_X1TILESIZE)!.toWebGl()};
          float x1mod1 = ${variation.params.get(this.PARAM_X1MOD1)!.toWebGl()};
          float x1mod2 = ${variation.params.get(this.PARAM_X1MOD2)!.toWebGl()};
          float x1height = ${variation.params.get(this.PARAM_X1HEIGHT)!.toWebGl()};
          float x1move = ${variation.params.get(this.PARAM_X1MOVE)!.toWebGl()};
          float x2width = ${variation.params.get(this.PARAM_X2WIDTH)!.toWebGl()};
          float x2tilesize = ${variation.params.get(this.PARAM_X2TILESIZE)!.toWebGl()};
          float x2mod1 = ${variation.params.get(this.PARAM_X2MOD1)!.toWebGl()};
          float x2mod2 = ${variation.params.get(this.PARAM_X2MOD2)!.toWebGl()};
          float x2height = ${variation.params.get(this.PARAM_X2HEIGHT)!.toWebGl()};
          float x2move = ${variation.params.get(this.PARAM_X2MOVE)!.toWebGl()};
          float _xr1 = x1mod2 * x1mod1;
          float _xr2 = x2mod2 * x2mod1; 
          if (rand8(tex, rngState) < 0.5) {
            float x1 = -x1width;
            if (rand8(tex, rngState) < 0.5)
              x1 = x1width; 
            _vx += x1tilesize * (_tx + round(x1 * log(rand8(tex, rngState))));
            
            if (_ty > x1mod1) {
             _vy += x1height * (-x1mod1 + mod(_ty + x1mod1, _xr1)) + amount * x1move;
            } else if (_ty < -x1mod1) {
              _vy += x1height * (x1mod1 - mod(x1mod1 - _ty, _xr1)) + amount * x1move;
            } else {
              _vy += x1height * _ty + amount * x1move;
            }
          } else {    
            float x2 = -x2width;
            if (rand8(tex, rngState) < 0.5)
              x2 = x2width;
            _vx += x2tilesize * (_tx + round(x2 * log(rand8(tex, rngState)))); 
            if (_ty > x2mod1) {
              _vy += x2height * (-x2mod1 + mod(_ty + x2mod1, _xr2)) - amount * x2move;
            } else if (_ty < -x2mod1) {
              _vy += x2height * (x2mod1 - mod(x2mod1 - _ty, _xr2)) - amount * x2move;
            } else {       
              _vy += x2height * _ty - amount * x2move;
            }
          }    
        }`;
    }

    get name(): string {
        return 'parallel';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PDJFunc extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 2.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 3.5 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 4.5 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          _vx += amount * (sin(a * _ty) - cos(b * _tx));
          _vy += amount * (sin(c * _tx) - cos(d * _ty));
        }`;
    }

    get name(): string {
        return 'pdj';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PerspectiveFunc extends VariationShaderFunc2D {
    PARAM_ANGLE = 'angle'
    PARAM_DIST = 'dist'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ANGLE, type: VariationParamType.VP_FLOAT, initialValue: 0.62 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_FLOAT, initialValue: 2.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float angle = ${variation.params.get(this.PARAM_ANGLE)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          float ang = angle * M_PI / 2.0;
          float vsin = sin(ang);
          float vfcos = dist * cos(ang);
          float d = (dist - _ty * vsin);
          if (d != 0.0) {
            float t = 1.0 / d;
            _vx += amount * dist * _tx * t;
            _vy += amount * vfcos * _ty * t;   
          }
        }`;
    }

    get name(): string {
        return 'perspective';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PetalFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // petal by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = cos(_tx);
          float bx = (cos(_tx) * cos(_ty)) * (cos(_tx) * cos(_ty)) * (cos(_tx) * cos(_ty));
          float by = (sin(_tx) * cos(_ty)) * (sin(_tx) * cos(_ty)) * (sin(_tx) * cos(_ty));
          _vx += amount * a * bx;
          _vy += amount * a * by;          
        }`;
    }

    get name(): string {
        return 'petal';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PhoenixJuliaFunc extends VariationShaderFunc2D {
    PARAM_POWER = 'power'
    PARAM_DIST = 'dist'
    PARAM_X_DISTORT = 'x_distort'
    PARAM_Y_DISTORT = 'y_distort'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_POWER, type: VariationParamType.VP_FLOAT, initialValue: 3.0 },
            { name: this.PARAM_DIST, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_X_DISTORT, type: VariationParamType.VP_FLOAT, initialValue: -0.5 },
            { name: this.PARAM_Y_DISTORT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // phoenix_julia by TyrantWave, http://tyrantwave.deviantart.com/art/PhoenixJulia-Apophysis-Plugin-121246658
        return `{
          float amount = ${variation.amount.toWebGl()};
          float power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float dist = ${variation.params.get(this.PARAM_DIST)!.toWebGl()};
          float x_distort = ${variation.params.get(this.PARAM_X_DISTORT)!.toWebGl()};
          float y_distort = ${variation.params.get(this.PARAM_Y_DISTORT)!.toWebGl()};
          float _invN = dist / power;
          float _inv2PI_N = (2.0*M_PI) / power;
          float _cN = dist / power / 2.0;
          float preX = _tx * (x_distort + 1.0);
          float preY = _ty * (y_distort + 1.0);
          float a = atan2(preY, preX) * _invN + float(iRand8(tex, 32768, rngState)) * _inv2PI_N;
          float sina = sin(a);
          float cosa = cos(a);
          float r = amount * pow(sqr(_tx) + sqr(_ty), _cN);
          _vx += r * cosa;
          _vy += r * sina;
        }`;
    }

    get name(): string {
        return 'phoenix_julia';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PieFunc extends VariationShaderFunc2D {
    PARAM_SLICES = 'slices'
    PARAM_ROTATION = 'rotation'
    PARAM_THICKNESS = 'thickness'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SLICES, type: VariationParamType.VP_FLOAT, initialValue: 6.0 },
            { name: this.PARAM_ROTATION, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_THICKNESS, type: VariationParamType.VP_FLOAT, initialValue: 0.5 }]
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
        }`;
    }

    get name(): string {
        return 'pie';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PointGridWFFunc extends VariationShaderFunc2D {
    PARAM_XMIN = 'xmin'
    PARAM_XMAX = 'xmax'
    PARAM_XCOUNT = 'xcount'
    PARAM_YMIN = 'ymin'
    PARAM_YMAX = 'ymax'
    PARAM_YCOUNT = 'ycount'
    PARAM_DISTORTION = 'distortion'
    PARAM_SEED = 'seed'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XMIN, type: VariationParamType.VP_FLOAT, initialValue: -3.0 },
            { name: this.PARAM_XMAX, type: VariationParamType.VP_FLOAT, initialValue: 3.0 },
            { name: this.PARAM_XCOUNT, type: VariationParamType.VP_INT, initialValue: 32 },
            { name: this.PARAM_YMIN, type: VariationParamType.VP_FLOAT, initialValue: -3.0 },
            { name: this.PARAM_YMAX, type: VariationParamType.VP_FLOAT, initialValue: 3.0 },
            { name: this.PARAM_YCOUNT, type: VariationParamType.VP_INT, initialValue: 32 },
            { name: this.PARAM_DISTORTION, type: VariationParamType.VP_FLOAT, initialValue: 2.3 },
            { name: this.PARAM_SEED, type: VariationParamType.VP_INT, initialValue: 1234 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // pointgrid_wf by Andreas Maschke
        return `{
          float amount = ${variation.amount.toWebGl()};
          float xmin = ${variation.params.get(this.PARAM_XMIN)!.toWebGl()};
          float xmax = ${variation.params.get(this.PARAM_XMAX)!.toWebGl()};
          int xcount = ${variation.params.get(this.PARAM_XCOUNT)!.toWebGl()};
          float ymin = ${variation.params.get(this.PARAM_YMIN)!.toWebGl()};
          float ymax = ${variation.params.get(this.PARAM_YMAX)!.toWebGl()};
          int ycount = ${variation.params.get(this.PARAM_YCOUNT)!.toWebGl()};
          float distortion = ${variation.params.get(this.PARAM_DISTORTION)!.toWebGl()};
          int seed = ${variation.params.get(this.PARAM_SEED)!.toWebGl()};
          int xIdx = iRand8(tex, xcount, rngState);
          int yIdx = iRand8(tex, ycount, rngState);
          float _dx = (xmax - xmin) / float(xcount);
          float _dy = (ymax - ymin) / float(ycount);
          float x = xmin + _dx * float(xIdx);
          float y = ymin + _dy * float(yIdx);
          if (distortion > 0.0) {
            RNGState lRngState = RNGState(float(0.137));
            vec2 ltex = vec2(float(xIdx), float(yIdx));
            float distx = (0.5 - rand8(ltex, lRngState)) * distortion;
            float disty = (0.5 - rand8(ltex, lRngState)) * distortion;
            x += distx;
            y += disty;
          }
          _vx += x * amount;
          _vy += y * amount;
        }`;
    }

    get name(): string {
        return 'pointgrid_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PolarFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float R_PI = 0.31830989;
          float ny = sqrt(_tx * _tx + _ty * _ty) - 1.0;
          _vx += amount * (_phi * R_PI);
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'polar';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Polar2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* polar2 from the apophysis plugin pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float R_PI = 0.31830989;
          float p2v = amount / M_PI;
          _vx += p2v * _phi;
          _vy += p2v / 2.0 * log(_r2);
        }`;
    }

    get name(): string {
        return 'polar2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PopcornFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float dx = tan(3.0 * _ty);
          if (dx != dx)
            dx = 0.0;
          float dy = tan(3.0 * _tx);
          if (dy != dy)
            dy = 0.0;
          float nx = _tx + ${xform.xyC20.toWebGl()} * sin(dx);
          float ny = _ty + ${xform.xyC21.toWebGl()} * sin(dy);
          _vx += amount * nx;
          _vy += amount * ny;
        }`;
    }

    get name(): string {
        return 'popcorn';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Popcorn2Func extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_C = 'c'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_Y, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 1.5 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* popcorn2 from the apophysis plugin pack */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          _vx += amount * (_tx + x * sin(tan(_ty * c)));
          _vy += amount * (_ty + y * sin(tan(_tx * c)));
        }`;
    }

    get name(): string {
        return 'popcorn2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PowerFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = amount * pow(_r, _tx / _r);
          _vx += r * _ty / _r;
          _vy += r * _tx / _r;
        }`;
    }

    get name(): string {
        return 'power';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PostAxisSymmetryWFFunc extends VariationShaderFunc2D {
    AXIS_X = 0;
    AXIS_Y = 1;
    AXIS_Z = 2;

    PARAM_AXIS = 'axis'
    PARAM_CENTRE_X = 'centre_x'
    PARAM_CENTRE_Y = 'centre_y'
    PARAM_CENTRE_Z = 'centre_z'
    PARAM_ROTATION = 'rotation'
    PARAM_X1COLORSHIFT = 'x1colorshift'
    PARAM_Y1COLORSHIFT = 'y1colorshift'
    PARAM_Z1COLORSHIFT = 'z1colorshift'
    PARAM_X2COLORSHIFT = 'x2colorshift'
    PARAM_Y2COLORSHIFT = 'y2colorshift'
    PARAM_Z2COLORSHIFT = 'z2colorshift'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_AXIS, type: VariationParamType.VP_INT, initialValue: this.AXIS_X },
            { name: this.PARAM_CENTRE_X, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_CENTRE_Y, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_CENTRE_Z, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_ROTATION, type: VariationParamType.VP_FLOAT, initialValue: 30.0 },
            { name: this.PARAM_X1COLORSHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_Y1COLORSHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_Z1COLORSHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_X2COLORSHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_Y2COLORSHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_Z2COLORSHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int axis = ${variation.params.get(this.PARAM_AXIS)!.toWebGl()};
          float centre_x = ${variation.params.get(this.PARAM_CENTRE_X)!.toWebGl()};
          float centre_y = ${variation.params.get(this.PARAM_CENTRE_Y)!.toWebGl()};
          float centre_z = ${variation.params.get(this.PARAM_CENTRE_Z)!.toWebGl()};
          float rotation = ${variation.params.get(this.PARAM_ROTATION)!.toWebGl()};
          float x1colorshift = ${variation.params.get(this.PARAM_X1COLORSHIFT)!.toWebGl()};
          float y1colorshift = ${variation.params.get(this.PARAM_Y1COLORSHIFT)!.toWebGl()};
          float z1colorshift = ${variation.params.get(this.PARAM_Z1COLORSHIFT)!.toWebGl()};
          float x2colorshift = ${variation.params.get(this.PARAM_X2COLORSHIFT)!.toWebGl()};
          float y2colorshift = ${variation.params.get(this.PARAM_Y2COLORSHIFT)!.toWebGl()};
          float z2colorshift = ${variation.params.get(this.PARAM_Z2COLORSHIFT)!.toWebGl()};
          if (abs(amount) > EPSILON) {
            float a = rotation * (2.0*M_PI) / 180.0 / 2.0;
            bool _doRotate = abs(a) > EPSILON;
            float _sina = sin(a);
            float _cosa = cos(a);
            float _halve_dist = amount / 2.0;
            if(axis==${this.AXIS_Y}) {
              float dx, dy;
              dy = _vy - centre_y;
              if (rand8(tex, rngState) < 0.5) {
                float ax = _vx;
                float ay = centre_y + dy + _halve_dist;
                if (_doRotate) {
                  dx = ax - centre_x;
                  dy = ay - centre_y;
                  ax = centre_x + dx * _cosa + dy * _sina;
                  ay = centre_y + dy * _cosa - dx * _sina;
                }
                _vx = ax;
                _vy = ay;
                _color = mod(_color + y1colorshift, 1.0);
              } else {
                float bx = _vx;
                float by = centre_y - dy - _halve_dist;
                if (_doRotate) {
                  dx = bx - centre_x;
                  dy = by - centre_y;
                  bx = centre_x + dx * _cosa - dy * _sina;
                  by = centre_y + dy * _cosa + dx * _sina;
                  _color = mod(_color + y2colorshift, 1.0);
                }
                _vx = bx;
                _vy = by;
              }
            }
            else if(axis==${this.AXIS_Z}) {
              float dx, dz;
              dz = _vz - centre_z;
              if (rand8(tex, rngState) < 0.5) {
                float ax = _vx;
                float az = centre_z + dz + _halve_dist;
                if (_doRotate) {
                  dx = ax - centre_x;
                  dz = az - centre_z;
                  ax = centre_x + dx * _cosa + dz * _sina;
                  az = centre_y + dz * _cosa - dx * _sina;
                }
                _vx = ax;
                _vz = az;
                _color = mod(_color + z1colorshift, 1.0);
              } else {
                float bx = _vx;
                float bz = centre_z - dz - _halve_dist;
                if (_doRotate) {
                  dx = bx - centre_x;
                  dz = bz - centre_z;
                  bx = centre_x + dx * _cosa - dz * _sina;
                  bz = centre_y + dz * _cosa + dx * _sina;
                }
                _vx = bx;
                _vz = bz;
                _color = mod(_color + z2colorshift, 1.0);
              }
            }            
            else { //  AXIS_X
              float dx, dy;
              dx = _vx - centre_x;
              if (rand8(tex, rngState) < 0.5) {
                float ax = centre_x + dx + _halve_dist;
                float ay = _vy;
                if (_doRotate) {
                  dx = ax - centre_x;
                  dy = ay - centre_y;
                  ax = centre_x + dx * _cosa + dy * _sina;
                  ay = centre_y + dy * _cosa - dx * _sina;
                }
                _vx = ax;
                _vy = ay;
                _color = mod(_color + x1colorshift, 1.0);
              } else {
                float bx = centre_x - dx - _halve_dist;
                float by = _vy;
                if (_doRotate) {
                  dx = bx - centre_x;
                  dy = by - centre_y;
                  bx = centre_x + dx * _cosa - dy * _sina;
                  by = centre_y + dy * _cosa + dx * _sina;
                }
                _vx = bx;
                _vy = by;
                _color = mod(_color + x2colorshift, 1.0);
              }
            }
          }  
        }`;
    }

    get name(): string {
        return 'post_axis_symmetry_wf';
    }

    get priority(): number {
        return 1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_POST, VariationTypes.VARTYPE_DC];
    }
}

class PostPointSymmetryWFFunc extends VariationShaderFunc2D {
    PARAM_CENTRE_X = 'centre_x'
    PARAM_CENTRE_Y = 'centre_y'
    PARAM_ORDER = 'order'
    PARAM_COLORSHIFT = 'colorshift'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_CENTRE_X, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_CENTRE_Y, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_ORDER, type: VariationParamType.VP_INT, initialValue: 3 },
            { name: this.PARAM_COLORSHIFT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float centre_x = ${variation.params.get(this.PARAM_CENTRE_X)!.toWebGl()};
          float centre_y = ${variation.params.get(this.PARAM_CENTRE_Y)!.toWebGl()};
          int order = ${variation.params.get(this.PARAM_ORDER)!.toWebGl()};
          float colorshift = ${variation.params.get(this.PARAM_COLORSHIFT)!.toWebGl()};
          float da = (2.0*M_PI) / float(order);
          float dx = (_vx - centre_x) * amount;
          float dy = (_vy - centre_y) * amount;
          int idx = iRand8(tex, order, rngState);
          float angle = float(idx) * da;
          float sina = sin(angle); 
          float cosa = cos(angle);
          _vx = centre_x + dx * cosa + dy * sina;
          _vy = centre_y + dy * cosa - dx * sina;
          _color = mod(_color + float(idx) * colorshift, 1.0);
        }`;
    }

    get name(): string {
        return 'post_point_symmetry_wf';
    }

    get priority(): number {
        return 1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_POST, VariationTypes.VARTYPE_DC];
    }
}

class PowBlockFunc extends VariationShaderFunc2D {
    PARAM_NUMERATOR = 'numerator'
    PARAM_DEMONIATOR = 'denominator'
    PARAM_CORRECTN = 'correctn'
    PARAM_CORRECTD = 'correctd'
    PARAM_ROOT = 'root'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_NUMERATOR, type: VariationParamType.VP_FLOAT, initialValue: 5.0 },
            { name: this.PARAM_DEMONIATOR, type: VariationParamType.VP_FLOAT, initialValue: 2.5 },
            { name: this.PARAM_CORRECTN, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CORRECTD, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_ROOT, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // pow_block optimized version, original by cothe coded by DarkBeam 2014
        return `{
          float amount = ${variation.amount.toWebGl()};
          float numerator = ${variation.params.get(this.PARAM_NUMERATOR)!.toWebGl()};
          float denominator = ${variation.params.get(this.PARAM_DEMONIATOR)!.toWebGl()};
          float correctn = ${variation.params.get(this.PARAM_CORRECTN)!.toWebGl()};
          float correctd = ${variation.params.get(this.PARAM_CORRECTD)!.toWebGl()};
          float root = ${variation.params.get(this.PARAM_ROOT)!.toWebGl()};
          float _power = denominator * correctn * 1.0 / (abs(correctd) + EPSILON);
          if (abs(_power) <= EPSILON)
           _power = EPSILON;
          _power = (numerator * 0.5) / _power;
          float _deneps = denominator;
          if (abs(_deneps) <= EPSILON)
           _deneps = EPSILON;
          _deneps = 1.0 / _deneps;
          float _theta = atan2(_ty, _tx);
          float r2 = pow(_r2, _power) * amount;
          float ran = ((_theta) * _deneps + (root * (2.0*M_PI) * floor(rand8(tex, rngState) * denominator) * _deneps)) * numerator;
          _vx += r2 * cos(ran);
          _vy += r2 * sin(ran);
        }`;
    }

    get name(): string {
        return 'pow_block';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PreRectWFFunc extends VariationShaderFunc2D {
    PARAM_X0 = 'x0'
    PARAM_X1 = 'x1'
    PARAM_Y0 = 'y0'
    PARAM_Y1 = 'y1'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X0, type: VariationParamType.VP_FLOAT, initialValue: -0.5 },
            { name: this.PARAM_X1, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_Y0, type: VariationParamType.VP_FLOAT, initialValue: -0.5 },
            { name: this.PARAM_Y1, type: VariationParamType.VP_FLOAT, initialValue: 0.5 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x0 = ${variation.params.get(this.PARAM_X0)!.toWebGl()};
          float x1 = ${variation.params.get(this.PARAM_X1)!.toWebGl()};
          float y0 = ${variation.params.get(this.PARAM_Y0)!.toWebGl()};
          float y1 = ${variation.params.get(this.PARAM_Y1)!.toWebGl()};
          float dx = x1 - x0;
          float dy = y1 - y0;
          _tx = amount * (x0 + dx * rand8(tex, rngState));
          _ty = amount * (y0 + dy * rand8(tex, rngState));
        }`;
    }

    get name(): string {
        return 'pre_rect_wf';
    }

    get priority(): number {
        return -1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class ProjectiveFunc extends VariationShaderFunc2D {
    PARAM_A = 'A'
    PARAM_B = 'B'
    PARAM_C = 'C'
    PARAM_A1 = 'A1'
    PARAM_B1 = 'B1'
    PARAM_C1 = 'C1'
    PARAM_A2 = 'A2'
    PARAM_B2 = 'B2'
    PARAM_C2 = 'C2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: -0.4 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_A1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_B1, type: VariationParamType.VP_FLOAT, initialValue: 0.1 },
            { name: this.PARAM_C1, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_A2, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_B2, type: VariationParamType.VP_FLOAT, initialValue: 1.1 },
            { name: this.PARAM_C2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Projective by eralex61
        // https://www.deviantart.com/eralex61/art/Projective-transform-295252418
        return `{
          float amount = ${variation.amount.toWebGl()};
          float A = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float B = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float C = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float A1 = ${variation.params.get(this.PARAM_A1)!.toWebGl()};
          float B1 = ${variation.params.get(this.PARAM_B1)!.toWebGl()};
          float C1 = ${variation.params.get(this.PARAM_C1)!.toWebGl()};
          float A2 = ${variation.params.get(this.PARAM_A2)!.toWebGl()};
          float B2 = ${variation.params.get(this.PARAM_B2)!.toWebGl()};
          float C2 = ${variation.params.get(this.PARAM_C2)!.toWebGl()};
          float U = A * _tx + B * _ty + C;
          _vx += amount * (A1 * _tx + B1 * _ty + C1) / U;
          _vy += amount * (A2 * _tx + B2 * _ty + C2) / U;
        }`;
    }

    get name(): string {
        return 'projective';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PTransformFunc extends VariationShaderFunc2D {
    PARAM_ROTATE = 'rotate'
    PARAM_POWER = 'power'
    PARAM_MOVE = 'move'
    PARAM_SPLIT = 'split'
    PARAM_USE_LOG = 'use_log'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_ROTATE, type: VariationParamType.VP_FLOAT, initialValue: 0.3 },
            { name: this.PARAM_POWER, type: VariationParamType.VP_INT, initialValue: 2 },
            { name: this.PARAM_MOVE, type: VariationParamType.VP_FLOAT, initialValue: 0.4 },
            { name: this.PARAM_SPLIT, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_USE_LOG, type: VariationParamType.VP_INT, initialValue: 1 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rotate = ${variation.params.get(this.PARAM_ROTATE)!.toWebGl()};
          int power = ${variation.params.get(this.PARAM_POWER)!.toWebGl()};
          float move = ${variation.params.get(this.PARAM_MOVE)!.toWebGl()};
          float split = ${variation.params.get(this.PARAM_SPLIT)!.toWebGl()};
          int use_log = ${variation.params.get(this.PARAM_USE_LOG)!.toWebGl()};
          float rho = (use_log != 0) ? log(_r) / float(power) + move : _r / float(power) + move;
          float _theta = atan2(_ty, _tx);
          float theta = _theta + rotate;
          if (_tx >= 0.0)
            rho += split;
          else
            rho -= split;   
          if (use_log != 0) rho = exp(rho);  
          _vx += amount * rho * cos(theta);
          _vy += amount * rho * sin(theta);
        }`;
    }

    get name(): string {
        return 'pTransform';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class PyramidFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // pyramid by Zueuk (transcribed into jwf by Dark)
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x = _tx;
          x = x * x * x;
          float y = _ty;
          y = y * y * y;
          float z = _tz;
          z = abs(z * z * z);
          float r = amount / (abs(x) + abs(y) + z + 0.000000001);
          _vx += x * r;
          _vy += y * r;
          _vz += z * r;
        }`;
    }

    get name(): string {
        return 'pyramid';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rational3Func extends VariationShaderFunc2D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_D = 'd'
    PARAM_E = 'e'
    PARAM_F = 'f'
    PARAM_G = 'g'
    PARAM_H = 'h'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_D, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_E, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_F, type: VariationParamType.VP_FLOAT, initialValue: 0.9 },
            { name: this.PARAM_G, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_H, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Ported to JWildfire variation by CozyG
         * from Apophysis7x rational3 plugin by xyrus02 at:
         * http://sourceforge.net/p/apophysis7x/svn/HEAD/tree/trunk/Plugin/rational3.c
         * <p>
         * Explanation from rational3 plugin:
         * Rational3 allows you to customize a rational function
         * involving the complex variable z. It can be represented
         * as the function...
         * az^3 + bz^2 + cz + d
         * ----------------------  division line
         * ez^3 + fz^2 + gz + h
         */
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
          float xsqr = _tx * _tx;
          float ysqr = _ty * _ty;
          float xcb = xsqr * _tx;
          float ycb = ysqr * _ty;
          float zt3 = xcb - 3.0 * _tx * ysqr;
          float zt2 = xsqr - ysqr;
          float zb3 = 3.0 * xsqr * _ty - ycb;
          float zb2 = 2.0 * _tx * _ty;
          float tr = (a * zt3) + (b * zt2) + (c * _tx) + d;
          float ti = (a * zb3) + (b * zb2) + (c * _ty);
          float br = (e * zt3) + (f * zt2) + (g * _tx) + h;
          float bi = (e * zb3) + (f * zb2) + (g * _ty);     
          float r3den = 1.0 / (br * br + bi * bi);
          _vx += amount * (tr * br + ti * bi) * r3den;
          _vy += amount * (ti * br - tr * bi) * r3den;
        }`;
    }

    get name(): string {
        return 'rational3';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RaysFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Z+ variation Jan 07 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float ang = amount * rand8(tex, rngState) * M_PI;
          float r = amount / (_r2 + EPSILON);
          float tanr = amount * tan(ang) * r;
          _vx += tanr * cos(_tx);
          _vy += tanr * sin(_ty);
        }`;
    }

    get name(): string {
        return 'rays';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rays1Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // rays by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount.toWebGl()};
          float t = sqr(_tx) + sqr(_ty);
          float u = 1.0 / tan(sqrt(t)) + (amount * sqr((2.0 / M_PI)));
          _vx = amount * u * t / _tx;
          _vy = amount * u * t / _ty;
        }`;
    }

    get name(): string {
        return 'rays1';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rays2Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // rays2 by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount.toWebGl()};
          float t = sqr(_tx) + sqr(_ty);
          float u = 1.0 / cos((t + EPSILON) * tan(1.0 / t + EPSILON)); 
          _vx = (amount / 10.0) * u * t / _tx;
          _vy = (amount / 10.0) * u * t / _ty;
        }`;
    }

    get name(): string {
        return 'rays2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rays3Func extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // rays3 by Raykoid666, http://raykoid666.deviantart.com/art/re-pack-1-new-plugins-100092186
        return `{
          float amount = ${variation.amount.toWebGl()};
          float t = sqr(_tx) + sqr(_ty);
          float u = 1.0 / sqrt(cos(sin(sqr(t) + EPSILON) * sin(1.0 / sqr(t) + EPSILON)));
          _vx = (amount / 10.0) * u * cos(t) * t / _tx;
          _vy = (amount / 10.0) * u * tan(t) * t / _ty;
        }`;
    }

    get name(): string {
        return 'rays3';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RectanglesFunc extends VariationShaderFunc2D {
    PARAM_X = 'x'
    PARAM_Y = 'y'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_FLOAT, initialValue: 0.3 },
            { name: this.PARAM_Y, type: VariationParamType.VP_FLOAT, initialValue: 0.2 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float x =${variation.params.get(this.PARAM_X)!.toWebGl()};
          float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
          if (abs(x) < EPSILON) {
            _vx += amount * _tx;
          } else {
            _vx += amount * ((2.0 * floor(_tx / x) + 1.0) * x - _tx);
          }
          if (abs(y) < EPSILON) {
            _vy += amount * _ty;
          } else {
            _vy += amount * ((2.0 * floor(_ty / y) + 1.0) * y - _ty);
          }
        }`;
    }

    get name(): string {
        return 'rectangles';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RingsFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float dx = ${xform.xyC20.toWebGl()} * ${xform.xyC21.toWebGl()} + EPSILON;
          float r = _r;
          r = r + dx - float(int((r + dx) / (2.0 * dx))) * 2.0 * dx - dx + r * (1.0 - dx);
          _vx += r * _ty / _r;
          _vy += r * _tx / _r;
        }`;
    }

    get name(): string {
        return 'rings';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Rings2Func extends VariationShaderFunc2D {
    PARAM_VAL = 'val'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_VAL, type: VariationParamType.VP_FLOAT, initialValue: 0.01 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float val =${variation.params.get(this.PARAM_VAL)!.toWebGl()};
          float _dx = val * val + EPSILON;
          float l = _r;
          if (_dx != 0.0 && l != 0.0) {
            float r = amount * (2.0 - _dx * float(int(((l / _dx + 1.0) / 2.0) * 2.0 / l + 1.0)));
            _vx += r * _tx;
            _vy += r * _ty;
          }
        }`;
    }

    get name(): string {
        return 'rings2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RoseWFFunc extends VariationShaderFunc2D {
    PARAM_AMP = 'amp'
    PARAM_WAVES = 'waves'
    PARAM_FILLED = 'filled'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_AMP, type: VariationParamType.VP_FLOAT, initialValue: 0.5 },
            { name: this.PARAM_WAVES, type: VariationParamType.VP_INT, initialValue: 4 },
            { name: this.PARAM_FILLED, type: VariationParamType.VP_FLOAT, initialValue: 0.85 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
         return `{
          float amount = ${variation.amount.toWebGl()};
          float a = _phi;
          int waves = ${variation.params.get(this.PARAM_WAVES)!.toWebGl()};
          float filled = ${variation.params.get(this.PARAM_FILLED)!.toWebGl()};
          float amp = ${variation.params.get(this.PARAM_AMP)!.toWebGl()};
          float r = amp * cos(float(waves) * a);
        
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
        return 'rose_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

export function registerVars_2D_PartP() {
    VariationShaders.registerVar(new Panorama1Func())
    VariationShaders.registerVar(new Panorama2Func())
    VariationShaders.registerVar(new ParabolaFunc())
    VariationShaders.registerVar(new ParallelFunc())
    VariationShaders.registerVar(new PDJFunc())
    VariationShaders.registerVar(new PerspectiveFunc())
    VariationShaders.registerVar(new PetalFunc())
    VariationShaders.registerVar(new PhoenixJuliaFunc())
    VariationShaders.registerVar(new PieFunc())
    VariationShaders.registerVar(new PointGridWFFunc())
    VariationShaders.registerVar(new PolarFunc())
    VariationShaders.registerVar(new Polar2Func())
    VariationShaders.registerVar(new PopcornFunc())
    VariationShaders.registerVar(new Popcorn2Func())
    VariationShaders.registerVar(new PowerFunc())
    VariationShaders.registerVar(new PostAxisSymmetryWFFunc())
    VariationShaders.registerVar(new PostPointSymmetryWFFunc())
    VariationShaders.registerVar(new PowBlockFunc())
    VariationShaders.registerVar(new PreRectWFFunc())
    VariationShaders.registerVar(new ProjectiveFunc())
    VariationShaders.registerVar(new PTransformFunc())
    VariationShaders.registerVar(new PyramidFunc())
    VariationShaders.registerVar(new Rational3Func())
    VariationShaders.registerVar(new RaysFunc())
    VariationShaders.registerVar(new Rays1Func())
    VariationShaders.registerVar(new Rays2Func())
    VariationShaders.registerVar(new Rays3Func())
    VariationShaders.registerVar(new RectanglesFunc())
    VariationShaders.registerVar(new RingsFunc())
    VariationShaders.registerVar(new Rings2Func())
    VariationShaders.registerVar(new RoseWFFunc())
}
