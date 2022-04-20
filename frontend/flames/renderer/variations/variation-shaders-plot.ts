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
    VariationPreset,
    VariationShaderFunc3D,
    VariationTypes
} from './variation-shader-func';
import {VariationShaders} from 'Frontend/flames/renderer/variations/variation-shaders';
import {RenderVariation, RenderXForm} from 'Frontend/flames/model/render-flame';
import {M_PI} from "Frontend/flames/renderer/mathlib";
import {FUNC_COSH, FUNC_SINH, FUNC_TANH} from "Frontend/flames/renderer/variations/variation-math-functions";

/*
  be sure to import this class somewhere and call registerVars_Plot()
 */

const rewriteFormula = (formula: string): string => {
  let newFormula
  if(!formula || formula==='') {
    newFormula = '0'
  }
  else {
    newFormula = formula
  }

  // add decimal point to whole numbers
  newFormula = newFormula.replace(/(\d+)[\.]?(\d*)([*\/+-\?\)]?)/g, '$1.$3')
  // fabs -> abs
  newFormula = newFormula.replace(/fabs\(/g, 'abs(')

  console.log(formula, '->', newFormula)
  return newFormula
}


interface PolarPlot2DWFFuncPreset extends VariationPreset {
  formula?: string
  caption?: string
  tmin: number
  tmax: number
  param_a?: number
  param_b?: number
  param_c?: number
  param_d?: number
  param_e?: number
  param_f?: number
}

class PolarPlot2DWFFunc extends VariationShaderFunc3D {
  PARAM_TMIN = 'tmin'
  PARAM_TMAX = 'tmax'
  PARAM_RMIN = 'rmin'
  PARAM_RMAX = 'rmax'
  PARAM_ZMIN = 'zmin'
  PARAM_ZMAX = 'zmax'
  PARAM_DIRECT_COLOR = 'direct_color'
  PARAM_COLOR_MODE = 'color_mode'
  PARAM_A = 'param_a'
  PARAM_B = 'param_b'
  PARAM_C = 'param_c'
  PARAM_D = 'param_d'
  PARAM_E = 'param_e'
  PARAM_F = 'param_f'

  RESOURCE_FORMULA = 'formula'

  CM_COLORMAP = 0
  CM_T = 1
  CM_R = 2

  get params(): VariationParam[] {
    return [{ name: this.PARAM_TMIN, type: VariationParamType.VP_NUMBER, initialValue: -3.0 },
      { name: this.PARAM_TMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
      { name: this.PARAM_RMIN, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_RMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
      { name: this.PARAM_ZMIN, type: VariationParamType.VP_NUMBER, initialValue: -2.0 },
      { name: this.PARAM_ZMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
      { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_NUMBER, initialValue: 1 },
      { name: this.PARAM_COLOR_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.CM_T },
      { name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }
    ]
  }

  get presets(): PolarPlot2DWFFuncPreset[] {
    return [
      // Formulas provided by Rick Sidwell
      {id: 0, formula: 't*param_a', tmin: 0.0, tmax: 6.0 * M_PI, caption: 'Archimedes\' spiral', param_a: 0.25},
      {id: 1, formula: 'param_a / t', tmin: 0.0, tmax: 5.0 * M_PI, caption: 'Hyperbolic spiral', param_a: 1.0},
      {id: 2, formula: 'cos(t*param_a/param_b) + param_c', tmin: 0.0, tmax: 3.0 * M_PI, caption: 'Rose curve', param_a: 5, param_b: 3, param_c: 0},
      {id: 3, formula: 'param_b + param_a*cos(t)', tmin: -M_PI, tmax: M_PI, caption: 'Limacon', param_a: 1, param_b: 0.5},
      {id: 4, formula: 'sqrt(sqr(param_a) * sin(2*t))', tmin: -M_PI, tmax: M_PI, caption: 'Lemniscate', param_a: 1.5},
      {id: 5, formula: 'sqrt((sqr(param_a)*sqr(sin(t)) - sqr(param_b)*sqr(cos(t))) / (sqr(sin(t)) - sqr(cos(t))))', tmin: -M_PI, tmax: M_PI, caption: 'Devil\'s curve', param_a: 1.5, param_b: 2},
      {id: 6, formula: 't * cos(param_a*t)', tmin: -2.0 * M_PI, tmax: 2.0 * M_PI, caption: 'Garfield curve', param_a: 1},
      {id: 7, formula: 'sqrt(sqr(param_a)/t)', tmin: 0.01, tmax: 8.0 * M_PI, caption: 'Lituus', param_a: 1.0},
      {id: 8, formula: 'sqrt(4*param_b*(param_a - param_b*sqr(sin(t))))', tmin: -M_PI, tmax: M_PI, caption: 'Hippopede', param_a: 4.0/3.0, param_b: 1},
      {id: 9, formula: 'param_a * t + param_b', tmin: -4.0 * M_PI, tmax: 4.0 * M_PI, caption: 'Neoid', param_a: 0.25, param_b: 0.5},
      {id: 10, formula: 'cos(t) * (4*param_a*sqr(sin(t)) - param_b)', tmin: 0.0, tmax: M_PI, caption: 'Folium', param_a: 1, param_b: 2},
      {id: 11, formula: 'param_a * exp(param_b * t)', tmin: -6.0 * M_PI, tmax: 1.5 * M_PI, caption: 'Logarithmic spiral', param_a: 3, param_b: 0.2},
      {id: 12, formula: 'sqrt(sqr(param_a)*t)', tmin: 0.0, tmax: 6.0 * M_PI, caption: 'Parabolic spiral', param_a: 1},
      {id: 13, formula: 'pow(sin(t),param_a) + pow(cos(t),param_b)', tmin: 0.0, tmax: M_PI, caption: 'Generalized bean curve', param_a: 3, param_b: 3},
      {id: 14, formula: 'param_a * sin(t) / t', tmin: -3.0 * M_PI, tmax: 3.0 * M_PI, caption: 'Cochleoid', param_a: 1},
      {id: 15, formula: 'param_a + tanh(param_b * sin(param_c*t))/param_b', tmin: -M_PI, tmax: M_PI, caption: 'Gear curve', param_a: 1, param_b: 5, param_c: 9}
    ]
  }

  getCode(xform: RenderXForm, variation: RenderVariation): string {
    const formula = rewriteFormula(variation.resources.get(this.RESOURCE_FORMULA)!.decodedHexStringValue)
    return `{
          float amount = ${variation.amount.toWebGl()};
          float tmin = ${variation.params.get(this.PARAM_TMIN)!.toWebGl()};
          float tmax = ${variation.params.get(this.PARAM_TMAX)!.toWebGl()};
          float rmin = ${variation.params.get(this.PARAM_RMIN)!.toWebGl()};
          float rmax = ${variation.params.get(this.PARAM_RMAX)!.toWebGl()};
          float zmin = ${variation.params.get(this.PARAM_ZMIN)!.toWebGl()};
          float zmax = ${variation.params.get(this.PARAM_ZMAX)!.toWebGl()};
          float param_a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float param_b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float param_c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float param_d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float param_e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float param_f = ${variation.params.get(this.PARAM_F)!.toWebGl()};
          int direct_color = ${variation.params.get(this.PARAM_DIRECT_COLOR)!.toWebGl()};
          int color_mode = ${variation.params.get(this.PARAM_COLOR_MODE)!.toWebGl()};
       
          float _tmin, _tmax, _dt;
          float _rmin, _rmax, _dr;
          float _zmin, _zmax, _dz;
          
          _tmin = tmin;
          _tmax = tmax;
          if (_tmin > _tmax) {
            float t = _tmin;
            _tmin = _tmax;
            _tmax = t;
          }
          _dt = _tmax - _tmin;
        
          _rmin = rmin;
          _rmax = rmax;
          if (_rmin > _rmax) {
            float t = _rmin;
            _rmin = _rmax;
            _rmax = t;
          }
          _dr = _rmax - _rmin;
        
          _zmin = zmin;
          _zmax = zmax;
          if (_zmin > _zmax) {
            float t = _zmin;
            _zmin = _zmax;
            _zmax = t;
          }
          _dz = _zmax - _zmin;
          float randU = rand8(tex, rngState);
          float randV = rand8(tex, rngState);
          float t = _tmin + randU * _dt;
          float z = _zmin + randV * _dz;
          float r = ${formula};
          float x = r * cos(t);
          float y = r * sin(t);
          if(direct_color>0) {
            if(color_mode==${this.CM_COLORMAP}) {
              // not supported
            }
            else if(color_mode==${this.CM_R}) {
              _color = (r - _rmin) / _dr;
            }
            else { // CM_T
              _color = (t - _tmin) / _dt;
            };
            if (_color < 0.0) _color = 0.0;
            else if (_color > 1.0) _color = 1.0;
          }
          _vx += amount * x;
          _vy += amount * y;
          _vz += amount * z;
        }`;
  }

  get name(): string {
    return 'polarplot2d_wf';
  }

  get funcDependencies(): string[] {
    return [FUNC_SINH, FUNC_COSH, FUNC_TANH];
  }

  get variationTypes(): VariationTypes[] {
    return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE, VariationTypes.VARTYPE_EDIT_FORMULA, VariationTypes.VARTYPE_DC];
  }

}

interface YPlot2DWFFuncPreset extends VariationPreset {
  formula?: string
  xmin: number
  xmax: number
  param_a?: number
  param_b?: number
  param_c?: number
  param_d?: number
  param_e?: number
  param_f?: number
}

class YPlot2DWFFunc extends VariationShaderFunc3D {
    PARAM_XMIN = 'xmin'
    PARAM_XMAX = 'xmax'
    PARAM_YMIN = 'ymin'
    PARAM_YMAX = 'ymax'
    PARAM_ZMIN = 'zmin'
    PARAM_ZMAX = 'zmax'
    PARAM_DIRECT_COLOR = 'direct_color'
    PARAM_COLOR_MODE = 'color_mode'
    PARAM_A = 'param_a'
    PARAM_B = 'param_b'
    PARAM_C = 'param_c'
    PARAM_D = 'param_d'
    PARAM_E = 'param_e'
    PARAM_F = 'param_f'

    RESOURCE_FORMULA = 'formula'

    CM_COLORMAP = 0;
    CM_X = 1;
    CM_Y = 2;

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XMIN, type: VariationParamType.VP_NUMBER, initialValue: -3.0 },
            { name: this.PARAM_XMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_YMIN, type: VariationParamType.VP_NUMBER, initialValue: -4.0 },
            { name: this.PARAM_YMAX, type: VariationParamType.VP_NUMBER, initialValue: 4.0 },
            { name: this.PARAM_ZMIN, type: VariationParamType.VP_NUMBER, initialValue: -2.0 },
            { name: this.PARAM_ZMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
            { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_COLOR_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.CM_X },
            { name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }
        ]
    }

    get presets(): YPlot2DWFFuncPreset[] {
      return [
        // Formulas provided by Andreas Maschke
        {id: 0, formula: '(sin(x)+2*sin(2*x)+1*sin(4*x))', xmin: -3.0, xmax: 2.0},
        {id: 1, formula: 'sin(x)*cos(x)', xmin: -3.0, xmax: 2.0},
        {id: 2, formula: 'sin(2*x*x)', xmin: -3.0, xmax: 2.0},
        // Formulas by Rick Sidwell
        {id: 3, formula: 'sin(param_a*x)/cos(x*x)', param_a: 3, xmin: -3.315, xmax: 3.315},
        {id: 4, formula: 'sin(x+sin(x)/param_a)', param_a: 1, xmin: -5.0, xmax: 5.0},
        {id: 5, formula: 'log(fabs(x))', xmin: -4.0, xmax: 4.0},
        {id: 6, formula: 'fabs(sin(x)*param_a) + fabs(cos(x)*param_b)', param_a: 0.5, param_b: 1.0,
            xmin: -3.0, xmax: 3.0},
        {id: 7, formula: 'x>0?pow(x,param_a):-pow(-x,param_a)', param_a: 2.5, xmin: -5.0, xmax: 5.0},
        // Some standard functions
        {id: 8, caption: 'Line', formula: 'param_a*x + param_b', param_a: -1, param_b: 0,
            xmin: -3.0, xmax: 3.0},
        {id: 9, caption: 'Power', formula: 'pow(x, param_a)', param_a: 3.0, xmin: -1.5, xmax: 1.5},
        {id: 10, caption: 'Sine wave', formula: 'param_a*sin(param_b*x)',
            param_a: 2.0, param_b: 4.0, xmin: -M_PI, xmax: M_PI},
        {id: 11, caption: 'Square wave', formula: 'param_a*pow(-1, floor(x*param_b))',
            param_a: 1.0, param_b: 1.0, xmin: -3.0, xmax: 3.0},
        {id: 12, caption: 'Triangle wave', formula: '2*param_a/param_b*fabs(fabs(x)%param_b - param_b/2) - 2*param_a/4',
            param_a: 2.0, param_b: 1.0, xmin: -3.0, xmax: 3.0},
        {id: 13, caption: 'Floor', formula: 'floor(param_a*x)/param_b', param_a: 1.0, param_b: 3.0,
            xmin: -3, xmax: 3}]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        const formula = rewriteFormula(variation.resources.get(this.RESOURCE_FORMULA)!.decodedHexStringValue)
        return `{
          float amount = ${variation.amount.toWebGl()};
          float xmin = ${variation.params.get(this.PARAM_XMIN)!.toWebGl()};
          float xmax = ${variation.params.get(this.PARAM_XMAX)!.toWebGl()};
          float ymin = ${variation.params.get(this.PARAM_YMIN)!.toWebGl()};
          float ymax = ${variation.params.get(this.PARAM_YMAX)!.toWebGl()};
          float zmin = ${variation.params.get(this.PARAM_ZMIN)!.toWebGl()};
          float zmax = ${variation.params.get(this.PARAM_ZMAX)!.toWebGl()};
          float param_a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float param_b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float param_c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float param_d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float param_e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float param_f = ${variation.params.get(this.PARAM_F)!.toWebGl()};
          int direct_color = ${variation.params.get(this.PARAM_DIRECT_COLOR)!.toWebGl()};
          int color_mode = ${variation.params.get(this.PARAM_COLOR_MODE)!.toWebGl()};
       
          float _xmin, _xmax, _dx;
          float _ymin, _ymax, _dy;
          float _zmin, _zmax, _dz;
          
          _xmin = xmin;
          _xmax = xmax;
          if (_xmin > _xmax) {
            float t = _xmin;
            _xmin = _xmax;
            _xmax = t;
          }
          _dx = _xmax - _xmin;
        
          _ymin = ymin;
          _ymax = ymax;
          if (_ymin > _ymax) {
            float t = _ymin;
            _ymin = _ymax;
            _ymax = t;
          }
          _dy = _ymax - _ymin;
        
          _zmin = zmin;
          _zmax = zmax;
          if (_zmin > _zmax) {
            float t = _zmin;
            _zmin = _zmax;
            _zmax = t;
          }
          _dz = _zmax - _zmin;
        
          float randU = rand8(tex, rngState);
          float randV = rand8(tex, rngState);
          float x = _xmin + randU * _dx;
          float z = _zmin + randV * _dz;
          float y = ${formula};
          if(direct_color>0) {
            if(color_mode==${this.CM_COLORMAP}) {
              // not supported
            }
            else if(color_mode==${this.CM_Y}) {
              _color = (y - _ymin) / _dy;
            }
            else {
              _color = (x - _xmin) / _dx;
            }
            if (_color < 0.0) _color = 0.0;
            else if (_color > 1.0) _color = 1.0;
          }
          _vx += amount * x;
          _vy += amount * y;
          _vz += amount * z;
        }`;
    }

    get name(): string {
        return 'yplot2d_wf';
    }

    get funcDependencies(): string[] {
      return [FUNC_SINH, FUNC_COSH, FUNC_TANH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE, VariationTypes.VARTYPE_EDIT_FORMULA, VariationTypes.VARTYPE_DC];
    }
}

interface YPlot3DWFFuncPreset extends VariationPreset {
  formula?: string
  xmin: number
  xmax: number
  zmin: number
  zmax: number
  param_a?: number
  param_b?: number
  param_c?: number
  param_d?: number
  param_e?: number
  param_f?: number
}

class YPlot3DWFFunc extends VariationShaderFunc3D {
  PARAM_XMIN = 'xmin'
  PARAM_XMAX = 'xmax'
  PARAM_YMIN = 'ymin'
  PARAM_YMAX = 'ymax'
  PARAM_ZMIN = 'zmin'
  PARAM_ZMAX = 'zmax'
  PARAM_DIRECT_COLOR = 'direct_color'
  PARAM_COLOR_MODE = 'color_mode'
  PARAM_A = 'param_a'
  PARAM_B = 'param_b'
  PARAM_C = 'param_c'
  PARAM_D = 'param_d'
  PARAM_E = 'param_e'
  PARAM_F = 'param_f'

  RESOURCE_FORMULA = 'formula'

  CM_COLORMAP = 0
  CM_X = 1
  CM_Y = 2
  CM_Z = 3
  CM_XZ = 4

  get params(): VariationParam[] {
    return [{ name: this.PARAM_XMIN, type: VariationParamType.VP_NUMBER, initialValue: -3.0 },
      { name: this.PARAM_XMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
      { name: this.PARAM_YMIN, type: VariationParamType.VP_NUMBER, initialValue: -4.0 },
      { name: this.PARAM_YMAX, type: VariationParamType.VP_NUMBER, initialValue: 4.0 },
      { name: this.PARAM_ZMIN, type: VariationParamType.VP_NUMBER, initialValue: -2.0 },
      { name: this.PARAM_ZMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
      { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_NUMBER, initialValue: 1 },
      { name: this.PARAM_COLOR_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.CM_Z },
      { name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }
    ]
  }

  get presets(): YPlot3DWFFuncPreset[] {
    return [
      // Formulas provided by Andreas Maschke
      {id: 0, formula: 'sin(2*exp(-4*(x*x+z*z)))', xmin: -3.0, xmax: 2.0, zmin: -2.0, zmax: 2.0},
      {id: 1, formula: 'cos(x*z*12)/6', xmin: -3.0, xmax: 2.0, zmin: -2.0, zmax: 2.0},
      {id: 2, formula: 'cos(sqrt(x*x+z*z)*14)*exp(-2*(x*x+z*z))', xmin: -3.0, xmax: 2.0, zmin: -2.0, zmax: 2.0},
      {id: 3, formula: 'cos(atan(x/z)*8)/4*sin(sqrt(x*x+z*z)*3)', xmin: -3.0, xmax: 2.0, zmin: -2.0, zmax: 2.0},
      {id: 4, formula: '(sin(x)*sin(x)+cos(z)*cos(z))/(5+x*x+z*z)', xmin: -3.0, xmax: 2.0, zmin: -2.0, zmax: 2.0},
      {id: 5, formula: 'cos(2*pi*(x+z))*(1-sqrt(x*x+z*z))', xmin: -3.0, xmax: 2.0, zmin: -2.0, zmax: 2.0},
      {id: 6, formula: 'sin(x*x+z*z)', xmin: -3.0, xmax: 2.0, zmin: -2.0, zmax: 2.0}
    ]
  }

  getCode(xform: RenderXForm, variation: RenderVariation): string {
    const formula = rewriteFormula(variation.resources.get(this.RESOURCE_FORMULA)!.decodedHexStringValue)
    return `{
          float amount = ${variation.amount.toWebGl()};
          float xmin = ${variation.params.get(this.PARAM_XMIN)!.toWebGl()};
          float xmax = ${variation.params.get(this.PARAM_XMAX)!.toWebGl()};
          float ymin = ${variation.params.get(this.PARAM_YMIN)!.toWebGl()};
          float ymax = ${variation.params.get(this.PARAM_YMAX)!.toWebGl()};
          float zmin = ${variation.params.get(this.PARAM_ZMIN)!.toWebGl()};
          float zmax = ${variation.params.get(this.PARAM_ZMAX)!.toWebGl()};
          float param_a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float param_b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float param_c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float param_d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float param_e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float param_f = ${variation.params.get(this.PARAM_F)!.toWebGl()};
          int direct_color = ${variation.params.get(this.PARAM_DIRECT_COLOR)!.toWebGl()};
          int color_mode = ${variation.params.get(this.PARAM_COLOR_MODE)!.toWebGl()};
       
          float _xmin, _xmax, _dx;
          float _ymin, _ymax, _dy;
          float _zmin, _zmax, _dz;
          
          _xmin = xmin;
          _xmax = xmax;
          if (_xmin > _xmax) {
            float t = _xmin;
            _xmin = _xmax;
            _xmax = t;
          }
          _dx = _xmax - _xmin;
        
          _ymin = ymin;
          _ymax = ymax;
          if (_ymin > _ymax) {
            float t = _ymin;
            _ymin = _ymax;
            _ymax = t;
          }
          _dy = _ymax - _ymin;
        
          _zmin = zmin;
          _zmax = zmax;
          if (_zmin > _zmax) {
            float t = _zmin;
            _zmin = _zmax;
            _zmax = t;
          }
          _dz = _zmax - _zmin;
          
          float randU = rand8(tex, rngState);
          float randV = rand8(tex, rngState);
          float x = _xmin + randU * _dx;
          float z = _zmin + randV * _dz;
          float y = ${formula};
          if(direct_color>0) {
            if(color_mode==${this.CM_COLORMAP}) {
              // not supported
            }
            else if(color_mode==${this.CM_Y}) {
              _color = (y - _ymin) / _dy;
            }
            else if(color_mode==${this.CM_X}) {
              _color = (x - _xmin) / _dx;
            } 
            else if(color_mode==${this.CM_XZ}) {
              _color = (x - _xmin) / _dx * (z - _zmin) / _dz;
            }
            else { // CM_Z
              _color = (z - _zmin) / _dz;
            }
            if (_color < 0.0) _color = 0.0;
            else if (_color > 1.0) _color = 1.0;
          }
          _vx += amount * x;
          _vy += amount * y;
          _vz += amount * z;
        }`;
  }

  get name(): string {
    return 'yplot3d_wf';
  }

  get funcDependencies(): string[] {
    return [FUNC_SINH, FUNC_COSH, FUNC_TANH];
  }

  get variationTypes(): VariationTypes[] {
    return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE, VariationTypes.VARTYPE_EDIT_FORMULA, VariationTypes.VARTYPE_DC];
  }

}

export function registerVars_Plot() {
    VariationShaders.registerVar(new PolarPlot2DWFFunc())
    VariationShaders.registerVar(new YPlot2DWFFunc())
    VariationShaders.registerVar(new YPlot3DWFFunc())
}
