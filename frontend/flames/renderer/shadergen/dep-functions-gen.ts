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

import {VariationMathFunctions} from "Frontend/flames/renderer/variations/variation-math-functions";
import {RenderFlame, RenderXForm} from "Frontend/flames/model/render-flame";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";

export class DepFunctionsPartShaderGenerator {

  collectFunctions(xforms: Array<RenderXForm>) {
    let functions = new Array<string>()
    xforms.forEach(xform => {
      xform.variations.forEach(variation => {
        VariationShaders.getVariationDepFunctions(variation).forEach(func => {
          if (functions.indexOf(func) < 0) {
            functions.push(func)
          }
        })
      })
    })
    return functions
  }

  addDepFunctions(xforms: Array<RenderXForm>) {
    return this.collectFunctions(xforms).map(func => VariationMathFunctions.getCode(func)).join('')
  }

  addDepFunctionsInit(xforms: Array<RenderXForm>) {
    return this.collectFunctions(xforms).map(func => VariationMathFunctions.getInitCode(func)).join('')
  }

  addStandardFunctions() {
    return `
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
          return fract(sin(dot(coordinate*seed+seed, vec2(PHI, PI)))*SRT);
      }

			float rand0(vec2 co) {
		    return random_0t1(co, seed);
			}
			
			float rand8(vec2 co, inout RNGState state) {
			  state.seed = random_0t1(co, state.seed);
		    return state.seed;
			}
		
		  int iRand8(vec2 co, int maxValue, inout RNGState state) {
			   	return int( floor( float(maxValue) * rand8(co, state) ) );
			}

      float sqrt_safe(in float x) {
        return (x < EPSILON) ? 0.0 : sqrt(x);
      }
      
      float lerp(float a, float b, float p) {
        return a + p * (b - a);
      }
      
      int ilerp(float a, float b, float p) {
        float v = a + p * (b - a);
        return v < 0.0 ? int(v-0.5) : int(v+0.5);
      }
    `
  }

}