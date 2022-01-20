import {compileShaderDirect} from './shader_utils'
import {shader_points_vs} from '../shaders/shader-points-vs'
import {shader_points_fs} from '../shaders/shader-points-fs'
import {shader_direct_vs} from '../shaders/shader-direct-vs'
import {shader_comp_col_fs} from '../shaders/shader-comp-col-fs'
import {shader_show_fs} from '../shaders/shader-show-fs'
import {shader_show_raw_fs} from '../shaders/shader-show-raw-fs'
import {VariationShaders} from "Frontend/flames/renderer/variation-shaders";
import {registerVars} from "Frontend/flames/renderer/basic-variation-shaders";
import {RenderFlame, RenderXForm, RenderVariation} from "Frontend/flames/model/render-flame";
import {VariationMathFunctions} from "Frontend/flames/renderer/variation-math-functions";

interface ComputePointsProgram extends WebGLProgram {
    vertexPositionAttribute: GLint;
    color: WebGLUniformLocation;
    uTexSamp_Points: WebGLUniformLocation;
    uTexSamp_Colors: WebGLUniformLocation;
}

interface IteratePointsProgram extends WebGLProgram {
    vertexPositionAttribute: GLint;
    uTexSamp: WebGLUniformLocation;
    seed: WebGLUniformLocation;
    seed2: WebGLUniformLocation;
    seed3: WebGLUniformLocation;
    time: WebGLUniformLocation;
}

interface ComputeColorsProgram extends WebGLProgram {
    vertexPositionAttribute: GLint;
    uTexSamp: WebGLUniformLocation;
    seed: WebGLUniformLocation;
    seed2: WebGLUniformLocation;
    seed3: WebGLUniformLocation;
}

interface ShowHistogramProgram extends WebGLProgram {
    uTexSamp: WebGLUniformLocation;
    frames: WebGLUniformLocation;
    brightness: WebGLUniformLocation;
}

interface ShowRawBufferProgram extends WebGLProgram {
    uTexSamp: WebGLUniformLocation;
}

function addVariation(variation: RenderVariation) {
    return VariationShaders.getVariationCode(variation)
}

function addVariations(xForm: RenderXForm, xFormIdx: number) {
    return `{
          ${xForm.variations.map(variation => addVariation(variation)).join('')}
    }`
}

function addAffineTx(xForm: RenderXForm) {
    if(xForm.c00 != 1.0 || xForm.c01 != 0.0 || xForm.c11 != 1.0 || xForm.c10 != 0.0 || xForm.c20 != 0.0 || xForm.c21 != 0.0) {
        return `
              _tx = ${xForm.c00} * point.x + ${xForm.c10} * point.y + ${xForm.c20};
              _ty = ${xForm.c01} * point.x + ${xForm.c11} * point.y + ${xForm.c21};
        `
    }
    else {
        return `
             _tx = point.x;
             _ty = point.y;
         `
    }
}

function addPostAffineTx(xForm: RenderXForm) {
    if(xForm.p00 != 1.0 || xForm.p01 != 0.0 || xForm.p11 != 1.0 || xForm.p10 != 0.0 || xForm.p20 != 0.0 || xForm.p21 != 0.0) {
        return `
               float _px = ${xForm.p00} * _vx + ${xForm.p10} * _vy + ${xForm.p20};
               float _py = ${xForm.p01} * _vx + ${xForm.p11} * _vy + ${xForm.p21};
               _vx = _px;
               _vy = _py;
        `
    }
    else {
        return ``
    }
}

function addXForm(xForm: RenderXForm, xFormIdx: number) {
    return `if(xFormIdx==${xFormIdx}) {
               _vx = _vy = 0.0;
               ${addAffineTx(xForm)}
               float _phi = atan2(_tx, _ty);
               float _r2 = _tx * _tx + _ty * _ty;
               float _r = sqrt(_tx * _tx + _ty * _ty) + EPSILON;                  
               ${addVariations(xForm, xFormIdx)}
               ${addPostAffineTx(xForm)}
			}	
	`;
}

function addCalcedWeights(weights: number[]) {
    let offset = 0
    let expressions = new Array<string>()
    for(let i=0;i<weights.length;i++) {
        const expr = `  ${i==0 ? 'if' : 'else if'} (r<float(${offset+weights[i]})) {
                          xFormIdx = ${i};
                        }`
        offset += weights[i]
        expressions.push(expr)
    }
    return expressions.join('')
}

function addCalcXFormIndexWithModWeights(flame: RenderFlame, xForm: RenderXForm, xFormIdx: number, xFormCount: number) {
    const weights = new Array<number>()
    let wsum = 0.0
    for(let i=0;i<xFormCount;i++) {
        const w = flame.xforms[i].weight * xForm.modifiedWeights[i]
        wsum += w
        weights.push(w)
    }
    wsum = Math.max(wsum, 1.0e-06)
    for(let i=0;i<xFormCount;i++) {
       weights[i] /= wsum;
    }
    return `${xFormIdx==0 ? 'if' : 'else if'} (xFormIdx==${xFormIdx}) {
              ${addCalcedWeights(weights)}
            }
    `;
}

function addCalcXFormIndexWithoutModWeights(flame: RenderFlame) {
    const weights = new Array<number>()
    let wsum = 0.0
    for(let i=0;i<flame.xforms.length;i++) {
        const w = flame.xforms[i].weight
        wsum += w
        weights.push(w)
    }
    wsum = Math.max(wsum, 1.0e-06)
    for(let i=0;i<flame.xforms.length;i++) {
        weights[i] /= wsum;
    }
    return addCalcedWeights(weights)
}

function addXForms(flame: RenderFlame) {
    return `
       float r = rand(tex);
       ${flame.hasModifiedWeights 
         ? flame.xforms.map( xForm => addCalcXFormIndexWithModWeights(flame, xForm, flame.xforms.indexOf(xForm), flame.xforms.length) ).join('') 
         : addCalcXFormIndexWithoutModWeights(flame)               
       }
       ${flame.xforms.map( xForm => addXForm(xForm, flame.xforms.indexOf(xForm)) ).join('')}  
    `;
}

function addDepFunction(func: string) {
    return VariationMathFunctions.getCode(func);
}

function addDepFunctions(flame: RenderFlame) {
  let functions = new Array<string>()
  flame.xforms.forEach(xform=> {
      xform.variations.forEach(variation=>{
          VariationShaders.getVariationDepFunctions(variation).forEach(func=>{
              if(functions.indexOf(func)<0) {
                  functions.push(func)
              }
          })
      })
  })
  return functions.map(func=>addDepFunction(func)).join('')
}

function createCompPointsShader(flame: RenderFlame) {
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

			float sqr(in float x) {
                return x * x;
            }

			float rand(vec2 co) {
			    return fract(sin(dot(co, vec2(12.9898 * seed, 78.233 * seed))) * 43758.5453);
			}

			float rand2(vec2 co) {
			   	return fract(sin(dot(co, vec2(12.9898 * seed2, 78.233 * seed2))) * 43758.5453);
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
                 
           ${addDepFunctions(flame)}
           
			void main(void) {
				vec2 tex = gl_FragCoord.xy / <%= RESOLUTION %>;
				vec3 point = texture2D(uTexSamp, tex).xyz;
	            float _tx, _ty, _tz;
                float _vx = 0.0, _vy = 0.0, _vz = 0.0;
				${addXForms(flame)}
				point = vec3(_vx, _vy, _vz);
				gl_FragColor = vec4(point, 1.0);
			}
			`;
}

export class Shaders {
    prog_points: ComputePointsProgram;
    prog_comp: IteratePointsProgram;
    prog_comp_col: ComputeColorsProgram;
    prog_show: ShowHistogramProgram;
    prog_show_raw: ShowRawBufferProgram;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, points_size: number, flame: RenderFlame) {
        this.prog_points = compileShaderDirect(gl, shader_points_vs, shader_points_fs, {}) as ComputePointsProgram;
        this.prog_points.vertexPositionAttribute = gl.getAttribLocation(this.prog_points, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_points.vertexPositionAttribute);
        this.prog_points.color = gl.getUniformLocation(this.prog_points, "color")!;
        this.prog_points.uTexSamp_Points = gl.getUniformLocation(this.prog_points, "uTexSamp_Points")!;
        this.prog_points.uTexSamp_Colors = gl.getUniformLocation(this.prog_points, "uTexSamp_Colors")!;


        const compPointsShader = createCompPointsShader(flame);
        console.log(compPointsShader);
        this.prog_comp = compileShaderDirect(gl, shader_direct_vs, compPointsShader /*shader_comp_fs*/, {RESOLUTION: points_size}) as IteratePointsProgram;
        this.prog_comp.vertexPositionAttribute = gl.getAttribLocation(this.prog_comp, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_comp.vertexPositionAttribute);
        this.prog_comp.uTexSamp = gl.getUniformLocation(this.prog_comp, "uTexSamp")!;
        this.prog_comp.seed = gl.getUniformLocation(this.prog_comp, "seed")!;
        this.prog_comp.seed2 = gl.getUniformLocation(this.prog_comp, "seed2")!;
        this.prog_comp.seed3 = gl.getUniformLocation(this.prog_comp, "seed3")!;
        this.prog_comp.time = gl.getUniformLocation(this.prog_comp, "time")!;

        this.prog_comp_col = compileShaderDirect(gl, shader_direct_vs, shader_comp_col_fs, {RESOLUTION: points_size}) as ComputeColorsProgram;
        this.prog_comp_col.vertexPositionAttribute = gl.getAttribLocation(this.prog_comp_col, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_comp_col.vertexPositionAttribute);
        this.prog_comp_col.uTexSamp = gl.getUniformLocation(this.prog_comp_col, "uTexSamp")!;
        this.prog_comp_col.seed = gl.getUniformLocation(this.prog_comp_col, "seed")!;
        this.prog_comp_col.seed2 = gl.getUniformLocation(this.prog_comp_col, "seed2")!;
        this.prog_comp_col.seed3 = gl.getUniformLocation(this.prog_comp_col, "seed3")!;

        this.prog_show = compileShaderDirect(gl, shader_direct_vs, shader_show_fs, {RESOLUTION: canvas.width}) as ShowHistogramProgram;
        this.prog_show.uTexSamp = gl.getUniformLocation(this.prog_show, "uTexSamp")!;
        this.prog_show.frames = gl.getUniformLocation(this.prog_show, "frames")!;
        this.prog_show.brightness = gl.getUniformLocation(this.prog_show, "brightness")!;

        this.prog_show_raw = compileShaderDirect(gl, shader_direct_vs, shader_show_raw_fs, {RESOLUTION: canvas.width}) as ShowRawBufferProgram;
        this.prog_show_raw.uTexSamp = gl.getUniformLocation(this.prog_show_raw, "uTexSamp")!;
    }

}

registerVars()