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

import {RenderFlame, RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";
import {VariationMathFunctions} from "Frontend/flames/renderer/variations/variation-math-functions";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";

export class CompPointsFragmentShaderGenerator {

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
       ${flame.xforms.map(xForm => this.addXForm(xForm, flame.xforms.indexOf(xForm))).join('')}  
    `;
    }

    addDepFunction(func: string) {
        return VariationMathFunctions.getCode(func);
    }

    addDepFunctions(flame: RenderFlame) {
        let functions = new Array<string>()
        flame.xforms.forEach(xform => {
            xform.variations.forEach(variation => {
                VariationShaders.getVariationDepFunctions(variation).forEach(func => {
                    if (functions.indexOf(func) < 0) {
                        functions.push(func)
                    }
                })
            })
        })
        return functions.map(func => this.addDepFunction(func)).join('')
    }

    addXForm(xForm: RenderXForm, xFormIdx: number) {
        return `if(xFormIdx==${xFormIdx}) {
               _vx = _vy = 0.0;
               ${this.addAffineTx(xForm)}
               float _phi = atan2(_tx, _ty);
               float _r2 = _tx * _tx + _ty * _ty;
               float _r = sqrt(_tx * _tx + _ty * _ty) + EPSILON;    
               
               _color = _color * float(${xForm.c1}) + float(${xForm.c2});   
               ${this.hasPreVariations(xForm) ? `
                 ${this.addVariations(xForm, xFormIdx, -1)}    
                 _phi = atan2(_tx, _ty);
                 _r2 = _tx * _tx + _ty * _ty;
                 _r = sqrt(_tx * _tx + _ty * _ty) + EPSILON;
                 `
               : '' }     
               ${this.addVariations(xForm, xFormIdx, 0)}
               ${this.addVariations(xForm, xFormIdx, 1)}
               ${this.addPostAffineTx(xForm)}
		       if(_color<0.0) {
				 _color = 0.0;
			   }
			   else if(_color>1.0 - 1.0e-06) {
				 _color = 1.0 - 1.0e-06; 
			   }
			}	
	`;
    }

    addVariation(xform: RenderXForm, variation: RenderVariation) {
        return VariationShaders.getVariationCode(xform, variation)
    }

    addVariations(xform: RenderXForm, xformIdx: number, priority: number) {
        return `{
          ${xform.variations.filter(variation => VariationShaders.getVariationPriority(variation)===priority).map(variation => this.addVariation(xform, variation)).join('')}
          }`
    }

    hasPreVariations(xform: RenderXForm) {
       return xform.variations.filter(variation => VariationShaders.getVariationPriority(variation)===-1).length > 0;
    }

    addAffineTx(xForm: RenderXForm) {
        if (xForm.c00 != 1.0 || xForm.c01 != 0.0 || xForm.c11 != 1.0 || xForm.c10 != 0.0 || xForm.c20 != 0.0 || xForm.c21 != 0.0) {
            return `
              _tx = float(${xForm.c00}) * point.x + float(${xForm.c10}) * point.y + float(${xForm.c20});
              _ty = float(${xForm.c01}) * point.x + float(${xForm.c11}) * point.y + float(${xForm.c21});
        `
        } else {
            return `
             _tx = point.x;
             _ty = point.y;
         `
        }
    }

    addPostAffineTx(xForm: RenderXForm) {
        if (xForm.p00 != 1.0 || xForm.p01 != 0.0 || xForm.p11 != 1.0 || xForm.p10 != 0.0 || xForm.p20 != 0.0 || xForm.p21 != 0.0) {
            return `
               float _px = float(${xForm.p00}) * _vx + float(${xForm.p10}) * _vy + float(${xForm.p20});
               float _py = float(${xForm.p01}) * _vx + float(${xForm.p11}) * _vy + float(${xForm.p21});
               _vx = _px;
               _vy = _py;
        `
        } else {
            return ``
        }
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

			const float M_PI = 3.141592;
			const float EPSILON = 0.000001;

      float evalP(float startValue, float amp, float freq, float phase) {
        return startValue + amp*sin(time*freq+phase);
      }
      
			float atan2(in float y, in float x) {
        return x == 0.0 ? sign(y)*M_PI * 0.5 : atan(y, x);
      }

			float sqr(in float x) {
        return x * x;
      }

      struct RNGState {
        float seed;
      };

      // Gold Noise function: https://www.shadertoy.com/view/XdGczW
      float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio   
      float PI  = 3.14159265358979323846264 * 00000.1; // PI
      float SRT = 1.41421356237309504880169 * 10000.0; // Square Root of Two
    
      float random_0t1(in vec2 coordinate, in float seed) {
          return fract(sin(dot(coordinate*seed, vec2(PHI, PI)))*SRT);
      }

			float rand0(vec2 co) {
			  //return fract(sin(dot(co, vec2(12.9898 * (seed+3.0), 78.233 * (seed+5.0)))) * 43758.5453);
		    return random_0t1(co, seed);
			}
			
			float rand8(vec2 co, inout RNGState state) {
			  state.seed = random_0t1(co, state.seed);
			  //state.seed=fract(sin(dot(co, vec2(12.9898 * (state.seed+29.0), 78.233 * (state.seed+7.0)))) * 43758.5453) + gold_noise(co, state.seed);
		    return state.seed;
			}
		
		  int iRand8(vec2 co, int maxValue, inout RNGState state) {
			   	return int( floor( float(maxValue) * rand8(co, state) ) );
			}

      float sqrt_safe(in float x) {
        return (x < EPSILON) ? 0.0 : sqrt(x);
      }
                 
           ${this.addDepFunctions(flame)}
           
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
