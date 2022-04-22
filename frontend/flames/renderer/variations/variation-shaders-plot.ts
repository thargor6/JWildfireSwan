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

interface ParPlot2DWFFuncPreset extends VariationPreset {
  id: number
  xformula: string
  yformula: string
  zformula: string
  caption?: string
  umin: number
  umax: number
  vmin: number
  vmax: number
  param_a?: number
  param_b?: number
  param_c?: number
  param_d?: number
  param_e?: number
  param_f?: number
}

class ParPlot2DWFFunc extends VariationShaderFunc3D {
  PARAM_UMIN = 'umin'
  PARAM_UMAX = 'umax'
  PARAM_VMIN = 'vmin'
  PARAM_VMAX = 'vmax'
  PARAM_DIRECT_COLOR = 'direct_color'
  PARAM_COLOR_MODE = 'color_mode'
  PARAM_SOLID = 'solid'
  PARAM_A = 'param_a'
  PARAM_B = 'param_b'
  PARAM_C = 'param_c'
  PARAM_D = 'param_d'
  PARAM_E = 'param_e'
  PARAM_F = 'param_f'

  RESOURCE_XFORMULA = 'xformula'
  RESOURCE_YFORMULA = 'yformula'
  RESOURCE_ZFORMULA = 'zformula'

  CM_COLORMAP = 0;
  CM_U = 1;
  CM_V = 2;
  CM_UV = 3;

  get params(): VariationParam[] {
    return [
      { name: this.PARAM_UMIN, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_UMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 * M_PI },
      { name: this.PARAM_VMIN, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_VMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 * M_PI },
      { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_NUMBER, initialValue: 1 },
      { name: this.PARAM_COLOR_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.CM_UV },
      { name: this.PARAM_SOLID, type: VariationParamType.VP_NUMBER, initialValue: 1 },
      { name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }
    ]
  }

  get presets(): ParPlot2DWFFuncPreset[] {
    return [
      // Formulas provided by Andreas Maschke
      { id: 0, xformula: 'cos(u)*(4.0+cos(v))', yformula: 'sin(u)*(4.0+cos(v))', zformula: '4.0*sin(2.0*u)+sin(v)*(1.2-sin(v))', umin: 0.0, umax: 2.0 * M_PI, vmin: 0.0, vmax: 2.0 * M_PI},
      { id: 1, xformula: 'cos(v)*sin(2*u)', yformula: 'sin(v)*sin(2*u)', zformula: 'sin(2*v)*sqr((cos(u)))', umin: 0.0, umax: M_PI, vmin: 0.0, vmax: M_PI},
      { id: 2, xformula: 'cos(u)*(exp(u/10.0)-1)*(cos(v)+0.8)', yformula: 'sin(u)*(exp(u/10.0)-1)*(cos(v)+0.8)', zformula: '(exp(u/10.0)-1)*sin(v)', umin: 0.0, umax: 5 * M_PI, vmin: 0.0, vmax: 2 * M_PI},
      { id: 3, xformula: 'cos(v)*(2.0+sin(u+v/3.0))', yformula: 'sin(v)*(2.0+sin(u+v/3.0))', zformula: 'cos(u+v/3.0)', umin: 0.0, umax: 2 * M_PI, vmin: 0.0, vmax: 2 * M_PI},
      { id: 4, xformula: 'cos(u)*(2.0+cos(v))', yformula: 'sin(u)*(2.0+cos(v))', zformula: '(u-2.0*pi)+sin(v)', umin: 0.0, umax: 4.0 * M_PI, vmin: 0.0, vmax: 2.0 * M_PI},
      { id: 5, xformula: 'u*cos(v)', yformula: 'u*sin(v)', zformula: 'sqr(cos(4.0*u))*exp(0-u)', umin: 0.0, umax: M_PI, vmin: 0.0, vmax: 2.0 * M_PI},
      { id: 6, xformula: 'cos(u)*(2.0+sqr(cos(u/2.0))*sin(v))', yformula: 'sin(u)*(2.0+sqr(cos(u/2.0))*sin(v))', zformula: 'sqr(cos(u/2.0))*cos(v)', umin: 0.0 - M_PI, umax: M_PI, vmin: 0.0 - M_PI, vmax: 2.0 * M_PI},
      { id: 7, xformula: 'cos(u)*(4.0+cos(v))', yformula: 'sin(u)*(4.0+cos(v))', zformula: '3.0*sin(u)+(sin(3.0*v)*(1.2+sin(3.0*v)))', umin: 0.0, umax: 2.0 * M_PI, vmin: 0.0, vmax: 2.0 * M_PI},
      { id: 8, xformula: 'u*cos(v)', yformula: 'v*cos(u)', zformula: 'u*v*sin(u)*sin(v)', umin: 0.0 - M_PI, umax: M_PI, vmin: 0.0 - M_PI, vmax: M_PI},
      { id: 9, xformula: 'cos(u)*sin(v*v*v/(pi*pi))', yformula: 'sin(u)*sin(v)', zformula: 'cos(v)', umin: 0.0, umax: 2.0 * M_PI, vmin: 0.0, vmax: M_PI},
      { id: 10, xformula: 'cos(u)*((cos(3.0*u)+2.0)*sin(v)+0.5)', yformula: 'sin(u)*((cos(3.0*u)+2)*sin(v)+0.5)', zformula: '(cos(3.0*u)+2.0)*cos(v)', umin: 0.0, umax: 2.0 * M_PI, vmin: 0.0, vmax: 2.0 * M_PI},
      { id: 11, caption: 'source: https://reference.wolfram.com/language/tutorial/ParametricPlots.html', xformula: 'sin(u)*sin(v)+0.05*cos(20.0*v)', yformula: 'cos(u)*sin(v)+0.05*cos(20.0*u)', zformula: 'cos(v)', umin: -M_PI, umax: M_PI, vmin: -M_PI, vmax: M_PI},
      { id: 12, caption: 'Shell, provided by Dimitri Augusto Rocha, source: https://renklisheyler.wordpress.com/2012/04/27/algebraic-surfaces/', xformula: '2.0*(1.0-exp(u/(6.0*pi)))*cos(u)*sqr(cos(v/2.0))', yformula: '2.0*(-1.0+exp(u/(6.0*pi)))*sin(u)*sqr(cos(v/2.0))', zformula: '1.0-exp(u/(3.0*pi))-sin(v)+exp(u/(6.0*pi))*sin(v)', umin: 0, umax: 6 * M_PI, vmin: 0, vmax: 2 * M_PI},

      // Formulas, provided by Frank Baumann
      { id: 13, caption: 'Slinky attempt info provided by Don Town found at http://mathworld.wolfram.com/Slinky.html', xformula: '(6.0+2.0*cos(u*v))*cos(u)', yformula: '(6.0+2.0*cos(u*v))*sin(u)', zformula: '(2.0*u+2.0*sin(u*v))', umin: 0, umax: 6 * M_PI, vmin: 0, vmax: 6 * M_PI},
      { id: 14, caption: 'Real slinky for Don Town (very thin wire - still trying to find a way to thicken the wire)', xformula: '(1.0+0.25*cos(75.0*u))*cos(u)', yformula: '(1.0+0.25*cos(75.0*u))*sin(u)', zformula: 'u+sin(75.0*u)', umin: -2 * M_PI, umax: 2 * M_PI, vmin: -2 * M_PI, vmax: 2 * M_PI},
      { id: 15, caption: 'Spherical spiral (very thin wire - still trying to find a way to thicken the wire)', xformula: '7.83*cos((v-pi)/2.0)*(cos(16.4*v))', yformula: '7.83*cos((v-pi)/2.0)*(sin(16.4*v))', zformula: '7.83*sin((v-pi)/2.0)', umin: 0, umax: 2 * M_PI, vmin: 0, vmax: 2 * M_PI},
      { id: 16, caption: 'Spherical rose shape', xformula: '(2.0 + sin(7.0*u + 5.0*v))*cos(u)*sin(v)', yformula: '(2.0 + sin(7.0*u + 5.0*v))*sin(u)*sin(v)', zformula: '(2.0 + sin(7.0*u + 5.0*v))*cos(v)', umin: -M_PI, umax: M_PI, vmin: -M_PI, vmax: M_PI},
      { id: 17, caption: 'Folded box shape', xformula: 'sin(u)*sin(v)', yformula: 'cos(v)*cos(u)', zformula: 'sin(sin(u)+cos(v))', umin: -M_PI, umax: M_PI, vmin: -M_PI, vmax: M_PI},
      { id: 18, caption: 'Wavy Heart', xformula: '(2.0*v*cos(u))', yformula: '2.0*v*(sin(u))+v*fabs(cos(u))', zformula: 'cos(3.0*v)*sin(3.0*v)', umin: 0, umax: 6, vmin: 0, vmax: 6},
      { id: 19, caption: 'Nameless#1 (interesting shape)', xformula: 'v*sin(fabs(u))', yformula: 'u*sin(fabs(v))', zformula: 'u+fabs(sin(v*u))', umin: -M_PI, umax: M_PI, vmin: -M_PI, vmax: M_PI},
      { id: 20, caption: 'Bubble gum', xformula: 'cos(u)*(6.0-(5.0/4.0+sin(3.0-v))*sin(v-3.0-u))', yformula: '(6.0-(5.0/4.0+sin(3.0*v))*sin(v-3.0*u))*sin(u)', zformula: '-cos(v-3.0*u)*(5.0/4.0+sin(3.0*v))', umin: -M_PI, umax: M_PI, vmin: -M_PI, vmax: M_PI},
      { id: 21, caption: 'Twisted Torus', xformula: '(4.0+(sin(4.0*(v+2.0*u))+1.25)*cos(v))*cos(u)', yformula: '(4.0+(sin(4.0*(v+2.0*u))+1.25)*cos(v))*sin(u)', zformula: '((sin(4*(v+2.0*u))+1.25)*sin(v))', umin: -M_PI, umax: M_PI, vmin: -M_PI, vmax: M_PI},
      { id: 22, caption: 'Vase', xformula: 'u', yformula: 'sin(v)*(u*u*u+2.0*u*u-2.0*u+2.0)/5.0', zformula: 'cos(v)*(u*u*u+2.0*u*u-2.0*u+2.0)/5.0', umin: -2.3, umax: 1.3, vmin: 0, vmax: 2 * M_PI},
      { id: 23, caption: 'Breather --- (This one can be slow depending on your computer capabilities)', xformula: '-0.8*u+(2*0.75*cosh(0.5*u)*sinh(0.5*u))/(0.5*((sqrt(0.75)*sqr(cosh(0.5*u))) +sqr(0.5*sin(sqrt(0.75)*v))))', yformula: '(2.0*sqrt(0.75)*cosh(0.5*u)*(-(sqrt(0.75)*cos(v)*cos(sqrt(0.75)*v))-sin(v)*sin(sqrt(0.75)*v)))/(0.5*sqr((sqrt(0.75)*cosh(0.5*u)) +sqr(0.5*sin(sqrt(0.75)*v))))', zformula: '(2.0*sqrt(0.75)*cosh(0.5*u)*(-(sqrt(0.75)*sin(v)*cos(sqrt(0.75)*v))+cos(v)*sin(sqrt(0.75)*v)))/(0.5*sqr((sqrt(0.75)*cosh(0.5*u)) +sqr(0.5*sin(sqrt(0.75)*v))))', umin: -15, umax: 15, vmin: -24.55, vmax: 22},
      { id: 24, caption: 'Lissajous 3D', xformula: 'cos(u+0)+0.06*sin(1*v)', yformula: 'cos(15.0*u+0)-0.6*cos(1*v)', zformula: 'sin(12.0*u+0)+0.06*sin(1*v)', umin: 0, umax: 2 * M_PI, vmin: -0.5, vmax: 0.5},
      { id: 25, caption: 'Double Mushroom (set pitch close to 90 degrees to see mushroom)', xformula: '(cos(2.0*u))/(sqrt(2.0)+sin(2.0*v))', yformula: 'sin(2.0*u)/(sqrt(2.0)+sin(2.0*v))', zformula: 'v/(sqrt(5.0)+cos(2.0*v))', umin: -M_PI, umax: M_PI, vmin: -3, vmax: 8},
      { id: 26, caption: 'Trangluoid trefoil', xformula: '2.0*sin(3.0*u)/(2.0+cos(v))', yformula: '2.0*(sin(u)+2.0*sin(2.0*u))/(2.0+cos(v+2.0*pi/3.0))', zformula: '(cos(u)-2.0*cos(2.0*u))*(2.0+cos(v))*(2.0+cos(v+2.0*pi/3.0))/4.0', umin: -M_PI, umax: M_PI, vmin: -M_PI, vmax: M_PI},
      { id: 27, caption: 'Shell #1', xformula: 'pow(1.2,u)*(1+cos(v))*cos(u)', yformula: 'pow(1.2,u)*(1+cos(v))*sin(u)', zformula: 'pow(1.2,u)*sin(v)-1.5*pow(1.2,u)', umin: -12, umax: 6, vmin: -M_PI, vmax: M_PI},
      { id: 28, caption: 'Shell #2', xformula: 'u*cos(u)*(cos(v)+1)', yformula: 'u*sin(u)*(cos(v)+1)', zformula: 'u*sin(v)-((u+3.0)/8.0*pi)*u/3.0', umin: 0, umax: 20, vmin: -M_PI, vmax: M_PI},
      { id: 29, caption: 'Trefoil Knot', xformula: 'cos(u)*cos(v)+3.0*cos(u)*(1.5+sin(u*5.0/3.0)/2.0)', yformula: 'sin(u)*cos(v)+3.0*sin(u)*(1.5+sin(u*5.0/3.0)/2.0)', zformula: 'sin(v)+2*cos(u*5/3)', umin: 0, umax: 20, vmin: -M_PI, vmax: M_PI},
      //PASTA

          { id: 30, caption: 'Penne Rigate', xformula: '0.1*cos(u)', yformula: '-0.1*sin(u)', zformula: 'v+0.1*sin(u)', umin: 0, umax: 2 * M_PI, vmin: -0.5, vmax: 0.5},
          { id: 31, caption: 'Conchiglie Rigate', xformula: '(u/(pi+pi))*(1.0-2.0*v*v)*cos(u)', yformula: '(u/(pi+pi))*(1.0-2.0*v*v)*sin(u)', zformula: 'v', umin: 0.5235988, umax: 6.8067841, vmin: -0.5, vmax: 0.5},
          { id: 32, caption: 'Cavatappi', xformula: '(3.0+2.0*cos(v))*cos(u)', yformula: '(3.0+2.0*cos(v))*sin(u)', zformula: 'u+2.0*sin(v)', umin: -12.5663706, umax: 2 * M_PI, vmin: 0, vmax: 2 * M_PI},
          { id: 33, caption: 'Farfalle', xformula: 'u+(1.0/10.0)*sin(10.0*v)', yformula: '((2.0*v)/3.0)*(1.2-(1.0/(1.0+u*u)))', zformula: 'sin(pi*v)/(2.0*pi*v)', umin: -3, umax: 3, vmin: -M_PI, vmax: M_PI},
          { id: 34, caption: 'Fusilli', xformula: '(v/3.0)*cos(u-(pi+pi)/3.0)', yformula: '(v/3.0)*sin(u-(pi+pi)/3.0)', zformula: 'u/10.0+(v*v)/2', umin: -2 * M_PI, umax: 2 * M_PI, vmin: 0, vmax: 0.5},
          { id: 35, caption: 'Under the sea Formula, supplied by Don Town, M=2,N=5', xformula: 'u*cos(v)', yformula: 'u*sin(v)', zformula: 'exp(-u*u)*(sin(param_a*pi*(u))-u*cos(param_b*v))', param_a: 2, param_b: 5, umin: 0.0, umax: 2.0, vmin: 0.0, vmax: 2*M_PI},
          // Parplot equations by Sarah Griffin,
          // The elliptic cone and ellipsoid came from a highschool math cheatsheet, originally from a book of math tables. The crossbar twist is derived from parplot2d_wf#8. The rest are from my imagination and prayer. , { id: 36, caption: 'Parallelogram' , xformula: 'u*param_a', yformula: 'v*param_b', zformula: 'u*param_c+v*param_d', param_a: 1, param_b: 1, param_c: 1, param_d: 1, umin: -9.42477796, umax: 9.42477796, vmin: -9.42477796, vmax: 9.42477796},
          { id: 37, caption: 'Sine wave Surface', xformula: 'u*param_a', yformula: 'v*param_b', zformula: 'sin(v*param_c)* param_d', param_a: 1, param_b: 1, param_c: 1, param_d: 1, umin: -9.42477796, umax: 9.42477796, vmin: -9.42477796, vmax: 9.42477796},
          { id: 38, caption: 'Elliptic Cone', xformula: 'cos(u*param_a)*sin(v*param_b)', yformula: 'sin(u*param_c)*sin(v*param_d)', zformula: 'sin(v*param_e)', param_a: 1, param_b: 1, param_c: 1, param_d: 1, param_e: 1, umin: -3.1415927, umax: 3.1415927, vmin: -3.1415927, vmax: 3.1415927},
          { id: 39, caption: 'Ellipsoid ( Change (0,0) to create ovoid)', xformula: 'cos(u*param_a)*sin(v*param_b)', yformula: 'sin(u*param_c)*sin(v*param_d)', zformula: 'cos(v*param_e)', param_a: 1, param_b: 1, param_c: 1, param_d: 1, param_e: 1, umin: -3.1415927, umax: 3.1415927, vmin: -3.1415927, vmax: 3.1415927},
          { id: 40, caption: 'CrossBar Twist', xformula: 'u*cos(v*param_a)-u*param_b', yformula: 'v*cos(u*param_c)-v*param_d', zformula: 'u*v*sin(u*param_e)*sin(v*param_f)-u/v', param_a: 1, param_b: 1, param_c: 1, param_d: 1, param_e: 1, param_f: 1, umin: -3.1415927, umax: 3.1415927, vmin: -3.1415927, vmax: 3.1415927},
          { id: 41, caption: 'Rippled Ribbon', xformula: 'cos(u*param_a)*sin(u*param_b)-u*param_c', yformula: 'sin(u*param_d)*cos(v*param_e)-u*param_f', zformula: 'cos(u)*sin(u)', param_a: 1, param_b: 1, param_c: 1, param_d: 1, param_e: 1, param_f: 1, umin: -9.42477796, umax: 9.42477796, vmin: -9.42477796, vmax: 9.42477796},
          { id: 42, caption: 'Channel Surface', xformula: 'cos(u*param_a)*sin(u*param_b)-u*param_c', yformula: '(v/param_d)*cos(u*param_e)-v*param_f', zformula: 'cos(u)*sin(u)', param_a: 1, param_b: 1, param_c: 1, param_d: 3, param_e: 1, param_f: 1, umin: -9.42477796, umax: 9.42477796, vmin: -9.42477796, vmax: 9.42477796},
          { id: 43, caption: 'Wavy Surface', xformula: 'cos(v*param_a)+sin(v*param_b)-u*param_c', yformula: '(v/param_d)*cos(u*param_e)-v*param_f', zformula: 'cos(u)-sin(u)', param_a: 1, param_b: 1, param_c: 1, param_d: 3, param_e: 1, param_f: 1, umin: -9.42477796, umax: 9.42477796, vmin: -9.42477796, vmax: 9.42477796},
          { id: 44, caption: 'Rippled Surface', xformula: 'cos(u*param_a)*sin(v*param_b)-u-v', yformula: 'sin(v*param_c)*cos(v*param_d)-u*param_e', zformula: 'cos(u*param_f)*sin(u*param_f)', param_a: 1, param_b: 1, param_c: 1, param_d: 1, param_e: 1, param_f: 1, umin: -9.42477796, umax: 9.42477796, vmin: -9.42477796, vmax: 9.42477796},
          { id: 45, caption: 'Furled Surface', xformula: 'cos(u)*sin(u)-v', yformula: '(v/3)*cos(u)-v', zformula: 'cos(u)*sin(u)', umin: -6.2831853, umax: 6.2831853, vmin: -6.2831853, vmax: 6.2831853},
          { id: 46, caption: 'Accordion Surface', xformula: 'cos(u)*sin(v)+(u*v)', yformula: 'sin(v)*cos(v)*(u+v)', zformula: 'cos(u)*sin(u)', umin: -6.2831853, umax: 6.2831853, vmin: -6.2831853, vmax: 6.2831853}
                  ]
  }

  getCode(xform: RenderXForm, variation: RenderVariation): string {
    const xformula = rewriteFormula(variation.resources.get(this.RESOURCE_XFORMULA)!.decodedHexStringValue)
    const yformula = rewriteFormula(variation.resources.get(this.RESOURCE_YFORMULA)!.decodedHexStringValue)
    const zformula = rewriteFormula(variation.resources.get(this.RESOURCE_ZFORMULA)!.decodedHexStringValue)
    return `{
          float amount = ${variation.amount.toWebGl()};
          float umin = ${variation.params.get(this.PARAM_UMIN)!.toWebGl()};
          float umax = ${variation.params.get(this.PARAM_UMAX)!.toWebGl()};
          float vmin = ${variation.params.get(this.PARAM_VMIN)!.toWebGl()};
          float vmax = ${variation.params.get(this.PARAM_VMAX)!.toWebGl()};
          float param_a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float param_b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float param_c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float param_d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float param_e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float param_f = ${variation.params.get(this.PARAM_F)!.toWebGl()};
          int solid = ${variation.params.get(this.PARAM_SOLID)!.toWebGl()};
          int direct_color = ${variation.params.get(this.PARAM_DIRECT_COLOR)!.toWebGl()};
          int color_mode = ${variation.params.get(this.PARAM_COLOR_MODE)!.toWebGl()};
       
          float pi = M_PI;
          float _umin, _umax, _du;
          float _vmin, _vmax, _dv;
       
          _umin = umin;
          _umax = umax;
          if (_umin > _umax) {
            float t = _umin;
            _umin = _umax;
            _umax = t;
          }
          _du = _umax - _umin;
          
          _vmin = vmin;
          _vmax = vmax;
          if (_vmin > _vmax) {
            float t = _vmin;
            _vmin = _vmax;
            _vmax = t;
          }
          _dv = _vmax - _vmin;
          float randU, randV;
          if(solid==0) {
            randU = _tx;
            randV = _ty;
          }
          else {
            randU = rand8(tex, rngState);
            randV = rand8(tex, rngState);
          }
          float u = _umin + randU * _du;
          float v = _vmin + randV * _dv;
          float x = ${xformula};
          float y = ${yformula}; 
          float z = ${zformula};
          if(direct_color>0) {
            if(color_mode==${this.CM_COLORMAP}) {
              // not supported
            }
            else if(color_mode==${this.CM_V}) {
              _color = (v - _vmin) / _dv;
            }
            else if(color_mode==${this.CM_U}) { 
              _color = (u - _umin) / _du;
            }
            else { // CM_UV
              _color = (v - _vmin) / _dv * (u - _umin) / _du;
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
    return 'parplot2d_wf';
  }

  get funcDependencies(): string[] {
    return [FUNC_SINH, FUNC_COSH, FUNC_TANH];
  }

  get variationTypes(): VariationTypes[] {
    return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE, VariationTypes.VARTYPE_EDIT_FORMULA, VariationTypes.VARTYPE_DC];
  }

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
       
          float pi = M_PI;
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

interface PolarPlot3DWFFuncPreset extends VariationPreset {
  formula: string
  cylindrical: number
  tmin: number
  tmax: number
  umin: number
  umax: number
  param_a?: number
  param_b?: number
  param_c?: number
  param_d?: number
  param_e?: number
  param_f?: number
}

class PolarPlot3DWFFunc extends VariationShaderFunc3D {
  PARAM_TMIN = 'tmin'
  PARAM_TMAX = 'tmax'
  PARAM_UMIN = 'umin'
  PARAM_UMAX = 'umax'
  PARAM_RMIN = 'rmin'
  PARAM_RMAX = 'rmax'
  PARAM_CYLINDRICAL = 'cylindrical'
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
  CM_U = 2
  CM_R = 3
  CM_TU = 4

  get params(): VariationParam[] {
    return [{ name: this.PARAM_TMIN, type: VariationParamType.VP_NUMBER, initialValue: -M_PI },
      { name: this.PARAM_TMAX, type: VariationParamType.VP_NUMBER, initialValue: M_PI },
      { name: this.PARAM_UMIN, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_UMAX, type: VariationParamType.VP_NUMBER, initialValue: M_PI },
      { name: this.PARAM_RMIN, type: VariationParamType.VP_NUMBER, initialValue: -2.0 },
      { name: this.PARAM_RMAX, type: VariationParamType.VP_NUMBER, initialValue: 2.0 },
      { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_NUMBER, initialValue: 1 },
      { name: this.PARAM_CYLINDRICAL, type: VariationParamType.VP_NUMBER, initialValue: 0 },
      { name: this.PARAM_COLOR_MODE, type: VariationParamType.VP_NUMBER, initialValue: this.CM_U },
      { name: this.PARAM_A, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_B, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_C, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_D, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_E, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
      { name: this.PARAM_F, type: VariationParamType.VP_NUMBER, initialValue: 0.0 }
    ]
  }

  get presets(): PolarPlot3DWFFuncPreset[] {
    return [
      // Formulas provided by Rick Sidwell
      {id: 0, formula: 'sin(param_a*u) + param_b', cylindrical: 0, tmin: -M_PI, tmax: M_PI, umin: -M_PI, umax: M_PI, param_a: 5, param_b: 2},
      {id: 1, formula: 'sin(param_a*u) + param_b', cylindrical: 1, tmin: -M_PI, tmax: M_PI, umin: -M_PI, umax: M_PI, param_a: 5, param_b: 2},
      {id: 2, formula: 'u', cylindrical: 0, tmin: -M_PI, tmax: M_PI, umin: 0.0, umax: 4.7},
      {id: 3, formula: '(sin(param_a*t) + cos(param_b*u)) + param_c', cylindrical: 0, tmin: -M_PI, tmax: M_PI, umin: -1.570796, umax: 1.570796, param_a: 5, param_b: 6, param_c: 0.25},
      {id: 4, formula: '(sin(param_a*t + param_b*u)) + param_c', cylindrical: 0, tmin: -M_PI, tmax: M_PI, umin: -1.570796, umax: 1.570796, param_a: 5, param_b: 7, param_c: 0},
      {id: 5, formula: '(sin(param_a*t + param_b*u)) + param_c', cylindrical: 1, tmin: -M_PI, tmax: M_PI, umin: -3.0, umax: 3.0, param_a: 4, param_b: 4, param_c: 1},
      {id: 6, formula: 'sin(param_a*t)+param_b*u', cylindrical: 1, tmin: -M_PI, tmax: M_PI, umin: -2.0, umax: 2.0, param_a: 4, param_b: 1.25},
      {id: 7, formula: 't / (param_a + u) + param_b', cylindrical: 1, tmin: -4.712389, tmax: 4.712389, umin: 0.0, umax: 2.5, param_a: 1, param_b: 0},
      {id: 8, formula: 'sqr(u) + param_a', cylindrical: 1, tmin: -M_PI, tmax: M_PI, umin: -1.5, umax: 1.5},
      {id: 9, formula: 'cos(param_a*t + sin(param_b*u)) + param_c', cylindrical: 0, tmin: -M_PI, tmax: M_PI, umin: -M_PI, umax: M_PI, param_a: 2, param_b: 3, param_c: 0}]
  }

  getCode(xform: RenderXForm, variation: RenderVariation): string {
    const formula = rewriteFormula(variation.resources.get(this.RESOURCE_FORMULA)!.decodedHexStringValue)
    return `{
          float amount = ${variation.amount.toWebGl()};
          float tmin = ${variation.params.get(this.PARAM_TMIN)!.toWebGl()};
          float tmax = ${variation.params.get(this.PARAM_TMAX)!.toWebGl()};
          float umin = ${variation.params.get(this.PARAM_UMIN)!.toWebGl()};
          float umax = ${variation.params.get(this.PARAM_UMAX)!.toWebGl()};
          float rmin = ${variation.params.get(this.PARAM_RMIN)!.toWebGl()};
          float rmax = ${variation.params.get(this.PARAM_RMAX)!.toWebGl()};
          float param_a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float param_b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float param_c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float param_d = ${variation.params.get(this.PARAM_D)!.toWebGl()};
          float param_e = ${variation.params.get(this.PARAM_E)!.toWebGl()};
          float param_f = ${variation.params.get(this.PARAM_F)!.toWebGl()};
          int cylindrical = ${variation.params.get(this.PARAM_CYLINDRICAL)!.toWebGl()};
          int direct_color = ${variation.params.get(this.PARAM_DIRECT_COLOR)!.toWebGl()};
          int color_mode = ${variation.params.get(this.PARAM_COLOR_MODE)!.toWebGl()};
       
          float pi = M_PI;
          float _tmin, _tmax, _dt;
          float _umin, _umax, _du;
          float _rmin, _rmax, _dr;
          
          _tmin = tmin;
          _tmax = tmax;
          if (_tmin > _tmax) {
            float t = _tmin;
            _tmin = _tmax;
            _tmax = t;
          }
          _dt = _tmax - _tmin;
        
          _umin = umin;
          _umax = umax;
          if (_umin > _umax) {
            float t = _umin;
            _umin = _umax;
            _umax = t;
          }
          _du = _umax - _umin;
          
          _rmin = rmin;
          _rmax = rmax;
          if (_rmin > _rmax) {
            float t = _rmin;
            _rmin = _rmax;
            _rmax = t;
          }
          _dr = _rmax - _rmin;

          float randT = rand8(tex, rngState);
          float randU = rand8(tex, rngState);
          float t = _tmin + randT * _dt;
          float u = _umin + randU * _du;
          float r = ${formula};
          float x, y, z;
          if(cylindrical == 0) {
            x = r * sin(u) * cos(t);
            y = r * sin(u) * sin(t);
            z = r * cos(u);
          }
          else {
            x = r * cos(t);
            y = r * sin(t);
            z = u;
          }
          if(direct_color>0) {
            if(color_mode==${this.CM_COLORMAP}) {
              // not supported
            }
            else if(color_mode==${this.CM_T}) {
              _color = (t - _tmin) / _dt;
            }
            else if(color_mode==${this.CM_U}) {
              _color = (u - _umin) / _du;
            }
            else if(color_mode==${this.CM_R}) {
              _color = (r - _rmin) / _dr;
            }
            else if(color_mode==${this.CM_TU}) { 
              _color = (t - _tmin) / _dt * (u - _umin) / _du;
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
    return 'polarplot3d_wf';
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
       
          float pi = M_PI;
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
  umin: number
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
      {id: 0, formula: 'sin(2*exp(-4*(x*x+z*z)))', xmin: -3.0, xmax: 2.0, umin: -2.0, zmax: 2.0},
      {id: 1, formula: 'cos(x*z*12)/6', xmin: -3.0, xmax: 2.0, umin: -2.0, zmax: 2.0},
      {id: 2, formula: 'cos(sqrt(x*x+z*z)*14)*exp(-2*(x*x+z*z))', xmin: -3.0, xmax: 2.0, umin: -2.0, zmax: 2.0},
      {id: 3, formula: 'cos(atan(x/z)*8)/4*sin(sqrt(x*x+z*z)*3)', xmin: -3.0, xmax: 2.0, umin: -2.0, zmax: 2.0},
      {id: 4, formula: '(sin(x)*sin(x)+cos(z)*cos(z))/(5+x*x+z*z)', xmin: -3.0, xmax: 2.0, umin: -2.0, zmax: 2.0},
      {id: 5, formula: 'cos(2*pi*(x+z))*(1-sqrt(x*x+z*z))', xmin: -3.0, xmax: 2.0, umin: -2.0, zmax: 2.0},
      {id: 6, formula: 'sin(x*x+z*z)', xmin: -3.0, xmax: 2.0, umin: -2.0, zmax: 2.0}
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
       
          float pi = M_PI;
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
    VariationShaders.registerVar(new ParPlot2DWFFunc())
    VariationShaders.registerVar(new PolarPlot2DWFFunc())
    VariationShaders.registerVar(new PolarPlot3DWFFunc())
    VariationShaders.registerVar(new YPlot2DWFFunc())
    VariationShaders.registerVar(new YPlot3DWFFunc())
}
