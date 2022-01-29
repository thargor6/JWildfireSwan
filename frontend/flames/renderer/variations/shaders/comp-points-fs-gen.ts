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
       float r = rand(tex);
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
               ${this.addVariations(xForm, xFormIdx)}
               ${this.addPostAffineTx(xForm)}
			}	
	`;
    }

    addVariation(xform: RenderXForm, variation: RenderVariation) {
        return VariationShaders.getVariationCode(xform, variation)
    }

    addVariations(xform: RenderXForm, xformIdx: number) {
        return `{
          ${xform.variations.map(variation => this.addVariation(xform, variation)).join('')}
    }`
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

			// https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
			// Gold Noise ©2015 dcerisano@standard3d.com
			// - based on the Golden Ratio
			// - uniform normalized distribution
			// - fastest static noise generator function (also runs at low precision)
			// - use with indicated seeding method. 
			
			float PHI = 1.61803398874989484820459;  // Φ = Golden Ratio   
			int xFormIdx = 0;
			
			float gold_noise(in vec2 xy, in float seed){
				   return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
			}

            float evalP(float startValue, float amp, float freq, float phase) {
              return startValue + amp*sin(time*freq+phase);
            }
			
			// Rand
			float atan2(in float y, in float x) {
                return x == 0.0 ? sign(y)*M_PI * 0.5 : atan(y, x);
            }


// https://www.dsprelated.com/showarticle/1052.php
float ApproxAtan(float z)
{
    const float n1 = 0.97239411;
    const float n2 = -0.19194795;
    return (n1 + n2 * z * z) * z;
}


float atan2f(float y, float x)
{
    if (x != 0.0)
    {
        if (abs(x) > abs(y))
        {
            float z = y / x;
            if (x > 0.0)
            {
                // atan2(y,x) = atan(y/x) if x > 0
                return ApproxAtan(z);
            }
            else if (y >= 0.0)
            {
                // atan2(y,x) = atan(y/x) + PI if x < 0, y >= 0
                return ApproxAtan(z) + M_PI;
            }
            else
            {
                // atan2(y,x) = atan(y/x) - PI if x < 0, y < 0
                return ApproxAtan(z) - M_PI;
            }
        }
        else // Use property atan(y/x) = M_PI/2 - atan(x/y) if |y/x| > 1.
        {
             float z = x / y;
            if (y > 0.0)
            {
                // atan2(y,x) = PI/2 - atan(x/y) if |y/x| > 1, y > 0
                return -ApproxAtan(z) + M_PI / 2.0;
            }
            else
            {
                // atan2(y,x) = -PI/2 - atan(x/y) if |y/x| > 1, y < 0
                return -ApproxAtan(z) - M_PI / 2.0;
            }
        }
    }
    else
    {
        if (y > 0.0) // x = 0, y > 0
        {
            return M_PI / 2.0;
        }
        else if (y < 0.0) // x = 0, y < 0
        {
            return -M_PI/2.0;
        }
    }
    return 0.0; // x,y = 0. Could return NaN instead.
}

			float sqr(in float x) {
                return x * x;
            }

			float rand(vec2 co) {
			    return fract(sin(dot(co, vec2(12.9898 * seed, 78.233 * seed))) * 43758.5453);
			}

			float rand2(vec2 co) {
			   	return fract(sin(dot(co, vec2(12.9898 * seed2, 78.233 * seed2))) * 43758.5453);
			}
			
		    int iRand2(vec2 co, int maxValue) {
			   	return int(floor(float(maxValue) * fract(sin(dot(co, vec2(12.9898 * seed2 + 345.6, 78.233 * seed2))) * 43758.5453)));
			}

			float rand3(vec2 co) {
		     	return fract(sin(dot(co, vec2(12.9898 * seed3, 78.233 * seed3))) * 43758.5453);
			}
			
			float rand4(vec2 co) {
		     	return fract(sin(dot(co, vec2(12.9798 * (seed3*seed2), 78.231 * (seed+seed2)))) * 33758.5453);
			}
           
             float sqrt_safe(in float x) {
                return (x < EPSILON) ? 0.0 : sqrt(x);
             }
                 
           ${this.addDepFunctions(flame)}
           
			void main(void) {
				vec2 tex = gl_FragCoord.xy / <%= RESOLUTION %>;
				vec3 point = texture2D(uTexSamp, tex).xyz;
	            float _tx, _ty, _tz;
                float _vx = 0.0, _vy = 0.0, _vz = 0.0;
				${this.addXForms(flame)}
				
				point = vec3(_vx, _vy, _vz);
				gl_FragColor = vec4(point, 1.0);
			}
			`;
    }
}
