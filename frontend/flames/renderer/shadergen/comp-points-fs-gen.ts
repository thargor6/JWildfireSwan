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

import {RenderFlame, RenderLayer, RenderXForm} from "Frontend/flames/model/render-flame";
import {VariationMathFunctions} from "Frontend/flames/renderer/variations/variation-math-functions";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {XFormPartShaderGenerator} from "Frontend/flames/renderer/shadergen/xform-gen";
import {DepFunctionsPartShaderGenerator} from "Frontend/flames/renderer/shadergen/dep-functions-gen";

export class CompPointsFragmentShaderGenerator {
    private xformGen = new XFormPartShaderGenerator();
    private depFuncGen = new DepFunctionsPartShaderGenerator()

    addCalcedXFormWeights(weights: number[]) {
        let offset = 0
        let expressions = new Array<string>()
        for (let i = 0; i < weights.length; i++) {
            const expr = `  ${i == 0 ? 'if' : 'else if'} (r<float(${offset + weights[i]})) {
                          xFormIdx = ${i};
                        }`
            offset += weights[i]
            expressions.push(expr)
        }
        return expressions.join('')
    }

    addCalcXFormIndexWithModWeights(layer: RenderLayer, xForm: RenderXForm, xFormIdx: number, xFormCount: number) {
        const weights = new Array<number>()
        let wsum = 0.0
        for (let i = 0; i < xFormCount; i++) {
            const w = layer.xforms[i].weight * xForm.modifiedWeights[i]
            wsum += w
            weights.push(w)
        }
        wsum = Math.max(wsum, 1.0e-06)
        for (let i = 0; i < xFormCount; i++) {
            weights[i] /= wsum;
        }
        return `${xFormIdx == 0 ? 'if' : 'else if'} (xFormIdx==${xFormIdx}) {
              ${this.addCalcedXFormWeights(weights)}
            }
    `;
    }

    addCalcXFormIndexWithoutModWeights(layer: RenderLayer) {
        const weights = new Array<number>()
        let wsum = 0.0
        for (let i = 0; i < layer.xforms.length; i++) {
            const w = layer.xforms[i].weight
            wsum += w
            weights.push(w)
        }
        wsum = Math.max(wsum, 1.0e-06)
        for (let i = 0; i < layer.xforms.length; i++) {
            weights[i] /= wsum;
        }
        return this.addCalcedXFormWeights(weights)
    }

    addXForms(layer: RenderLayer) {
        return `
       float r = rand8(tex, rngState);
       ${layer.hasModifiedWeights
            ? layer.xforms.map(xForm => this.addCalcXFormIndexWithModWeights(layer, xForm, layer.xforms.indexOf(xForm), layer.xforms.length)).join('')
            : this.addCalcXFormIndexWithoutModWeights(layer)
        }
       ${layer.xforms.map(xForm => this.xformGen.addXForm(xForm, layer.xforms.indexOf(xForm))).join('')}  
    `;
    }

    public createShader(flame: RenderFlame, layer: RenderLayer) {
        return `
            #ifdef GL_ES
				precision highp float;
			#endif

			uniform sampler2D uTexSamp;
			uniform sampler2D motionBlurTimeSamp;
			uniform float seed;
			uniform float seed2;
			uniform float seed3;
			uniform float time;

   
      ${this.depFuncGen.addStandardFunctions()}           
      ${this.depFuncGen.addDepFunctions(layer.xforms)}
           
			void main(void) {
				vec2 tex = gl_FragCoord.xy / <%= RESOLUTION %>;
				vec4 point = texture2D(uTexSamp, tex).xyzw;
			  float lTime = texture2D(motionBlurTimeSamp, tex).x;
				float xFormIdxAndColor = point.w;
				
				int xFormIdx = int(floor(xFormIdxAndColor));
				float _color = xFormIdxAndColor - float(xFormIdx);
				RNGState rngState = RNGState(rand0(tex));
							
			  float _tx, _ty, _tz;
        float _vx = 0.0, _vy = 0.0, _vz = 0.0;
        _tz = point.z;
				${this.addXForms(layer)}
			  // must ensure that color is already in the range [0..1)		
				xFormIdxAndColor = float(xFormIdx) + _color;
				gl_FragColor = vec4(_vx, _vy, _vz, xFormIdxAndColor);
			}
			`;
    }
}
