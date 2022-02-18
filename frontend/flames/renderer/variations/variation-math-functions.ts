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

export const FUNC_COSH = 'cosh'
export const FUNC_HYPOT = 'hypot'
export const FUNC_LOG10 = 'log10'
export const FUNC_MODULO = 'modulo'
export const FUNC_SGN = 'sgn'
export const FUNC_SINH = 'sinh'
export const FUNC_SQRT1PM1 = 'sqrt1pm1'
export const FUNC_TANH = 'tanh'

// https://www.shaderific.com/glsl-functions

export class VariationMathFunctions {
    static functions = new Map<string, string>()

    static registerFunction(name: string, code: string) {
        this.functions.set(name, code)
    }

    static getCode(name: string): string {
        return this.functions.get(name)!
    }

    static init() {
         this.registerFunction(FUNC_COSH,
             // COSH Function (Hyperbolic Cosine) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
             `
            float cosh(float val) {
			  float tmp = exp(val);
		   	  float cosH = (tmp + 1.0 / tmp) / 2.0;
		       return cosH;
			}`);
        this.registerFunction(FUNC_HYPOT,
            // most simple form for now:
            `
            float hypot(float x, float y) {
              return sqrt(x * x + y * y);
			}`);

        this.registerFunction(FUNC_LOG10,
            // COSH Function (Hyperbolic Cosine) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
            `            
            float log10(float val) {
		       return log(val) / 2.30258509299; // log(10)
			}`);

        this.registerFunction(FUNC_MODULO,
            // https://stackoverflow.com/questions/33908644/get-accurate-integer-modulo-in-webgl-shader
            `int modulo(int a,int b) {
                     float m=float(a)-floor((float(a)+0.5)/float(b))*float(b);
                     return int(floor(m+0.5));
                   }`)

        this.registerFunction(FUNC_SGN,
            `float sgn(float arg) {
                      if (arg > 0.0)
                        return 1.0;
                      else
                        return -1.0;
                    }`)

        this.registerFunction(FUNC_SINH,
            // SINH Function (Hyperbolic Sine) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
            `
           	float sinh(float val) {
				float tmp = exp(val);
				float sinH = (tmp - 1.0 / tmp) / 2.0;
				return sinH;
			}`);
        this.registerFunction(FUNC_SQRT1PM1,
            `
               float sqrt1pm1(in float x) {
                 if (-0.0625 < x && x < 0.0625)  {
                  // [4,4] Pade approximant to degree 8 truncated Taylor series of sqrt(x+1)-1 about 0
                  // computed with a Wolfram Alpha Open Code notebook
                  // accurate to machine precision within this range?
                  float num = 0.0;
                  float den = 0.0;
                  num += 1.0 / 32.0;
                  den += 1.0 / 256.0;
                  num *= x;
                  den *= x;
                  num += 5.0 / 16.0;
                  den += 5.0 / 32.0;
                  num *= x;
                  den *= x;
                  num += 3.0 / 4.0;
                  den += 15.0 / 16.0;
                  num *= x;
                  den *= x;
                  num += 1.0 / 2.0;
                  den += 7.0 / 4.0;
                  num *= x;
                  den *= x;
                  den += 1.0;
                  return num / den;
                }
                return sqrt(1.0 + x) - 1.0;
             }`)
        this.registerFunction(FUNC_TANH,
            // TANH Function (Hyperbolic Tangent) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
            `
            float tanh(float val) {
				float tmp = exp(val);
				float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
				return tanH;
			}`);
    }
}

VariationMathFunctions.init()