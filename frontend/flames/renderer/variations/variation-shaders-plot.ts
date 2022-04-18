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

/*
  be sure to import this class somewhere and call registerVars_Plot()
 */
interface YPlot2DWFFuncPreset extends VariationPreset {
  formula?: string
  xmin: number
  xmax: number
  param_a?: number
  param_b?: number
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
        const formula = this.rewriteFormula(variation.resources.get(this.RESOURCE_FORMULA)!.decodedHexStringValue)

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
            if(color_mode==${this.CM_Y}) {
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

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE, VariationTypes.VARTYPE_EDIT_FORMULA, VariationTypes.VARTYPE_DC];
    }

    rewriteFormula = (formula: string): string => {
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
}

export function registerVars_Plot() {
    VariationShaders.registerVar(new YPlot2DWFFunc())
}
