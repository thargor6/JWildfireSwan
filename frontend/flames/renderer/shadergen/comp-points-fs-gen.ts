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

import {RenderFlame, RenderXForm} from "Frontend/flames/model/render-flame";
import {VariationMathFunctions} from "Frontend/flames/renderer/variations/variation-math-functions";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";
import {XFormPartShaderGenerator} from "Frontend/flames/renderer/shadergen/xform-gen";
import {DepFunctionsPartShaderGenerator} from "Frontend/flames/renderer/shadergen/dep-functions-gen";

export class CompPointsFragmentShaderGenerator {
    private xformGen = new XFormPartShaderGenerator();
    private depFuncGen = new DepFunctionsPartShaderGenerator()

    addCalcedWeights(weights: number[]) {
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

    addCalcXFormIndexWithModWeights(flame: RenderFlame, xForm: RenderXForm, xFormIdx: number, xFormCount: number) {
        const weights = new Array<number>()
        let wsum = 0.0
        for (let i = 0; i < xFormCount; i++) {
            const w = flame.xforms[i].weight * xForm.modifiedWeights[i]
            wsum += w
            weights.push(w)
        }
        wsum = Math.max(wsum, 1.0e-06)
        for (let i = 0; i < xFormCount; i++) {
            weights[i] /= wsum;
        }
        return `${xFormIdx == 0 ? 'if' : 'else if'} (xFormIdx==${xFormIdx}) {
              ${this.addCalcedWeights(weights)}
            }
    `;
    }

    addCalcXFormIndexWithoutModWeights(flame: RenderFlame) {
        const weights = new Array<number>()
        let wsum = 0.0
        for (let i = 0; i < flame.xforms.length; i++) {
            const w = flame.xforms[i].weight
            wsum += w
            weights.push(w)
        }
        wsum = Math.max(wsum, 1.0e-06)
        for (let i = 0; i < flame.xforms.length; i++) {
            weights[i] /= wsum;
        }
        return this.addCalcedWeights(weights)
    }

    addXForms(flame: RenderFlame) {
        return `
       float r = rand8(tex, rngState);
       ${flame.hasModifiedWeights
            ? flame.xforms.map(xForm => this.addCalcXFormIndexWithModWeights(flame, xForm, flame.xforms.indexOf(xForm), flame.xforms.length)).join('')
            : this.addCalcXFormIndexWithoutModWeights(flame)
        }
       ${flame.xforms.map(xForm => this.xformGen.addXForm(xForm, flame.xforms.indexOf(xForm))).join('')}  
    `;
    }

    public createShader(flame: RenderFlame) {
        return `
            #ifdef GL_ES
				precision highp float;
			#endif

			uniform sampler2D uTexSamp;
			uniform float seed;
			uniform float seed2;
			uniform float seed3;
			uniform float time;

   
      ${this.depFuncGen.addStandardFunctions()}           
      ${this.depFuncGen.addDepFunctions(flame.xforms)}
           
			void main(void) {
				vec2 tex = gl_FragCoord.xy / <%= RESOLUTION %>;
				vec3 point = texture2D(uTexSamp, tex).xyz;

				float xFormIdxAndColor = texture2D(uTexSamp, tex).w;
				int xFormIdx = int(floor(texture2D(uTexSamp, tex).w));
				float _color = xFormIdxAndColor - float(xFormIdx);
				
				RNGState rngState = RNGState(rand0(tex));
			  float _tx, _ty, _tz;
        float _vx = 0.0, _vy = 0.0, _vz = 0.0;
        _tz = point.z;
				${this.addXForms(flame)}
				point = vec3(_vx, _vy, _vz);
			  // must ensure that color is already in the range [0..1)
				xFormIdxAndColor = float(xFormIdx) + _color;
				gl_FragColor = vec4(point, xFormIdxAndColor);
			}
			`;
    }
}
