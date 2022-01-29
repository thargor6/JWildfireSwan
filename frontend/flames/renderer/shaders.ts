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
import {FlameRenderView} from "Frontend/flames/renderer/flame-render-view";

interface ComputePointsProgram extends WebGLProgram {
    vertexPositionAttribute: GLint;
    color: WebGLUniformLocation;
    uTexSamp_Points: WebGLUniformLocation;
    uTexSamp_Colors: WebGLUniformLocation;
    time: WebGLUniformLocation;
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

function addVariation(xform: RenderXForm, variation: RenderVariation) {
    return VariationShaders.getVariationCode(xform, variation)
}

function addVariations(xform: RenderXForm, xformIdx: number) {
    return `{
          ${xform.variations.map(variation => addVariation(xform, variation)).join('')}
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

function addCamera(view: FlameRenderView) {
    if (!view.doProject3D) {
        return `
          float _px = point.x;
          float _py = point.y;
          float _pz = point.z;
             
          float _cx = float(${view.m[0][0]}) * _px + float(${view.m[1][0]}) * _py + float(${view.m[2][0]}) * _pz;
          float _cy = float(${view.m[0][1]}) * _px + float(${view.m[1][1]}) * _py + float(${view.m[2][1]}) * _pz;
          float _cz = float(${view.m[0][2]}) * _px + float(${view.m[1][2]}) * _py + float(${view.m[2][2]}) * _pz;
          _cx += float(${view.flame.camPosX});
          _cy += float(${view.flame.camPosY});
          _cz += float(${view.flame.camPosZ});

          float zr = 1.0 - float(${view.flame.camPerspective}) * _cz + float(${view.flame.camPosZ});
          if (zr < 1.0e-6) {
              zr = 1.0e-6;
          }
          
          float prjZ = _cz;
          float prjIntensity = 1.0;
          if (float(${view.flame.diminishZ}) > 1.0e-6) {
            float zdist = (float(${view.flame.dimZDistance}) - _cz);
            if (zdist > 0.0) {
                prjIntensity = exp(-zdist * zdist * float(${view.flame.diminishZ}));
            }
          }
        
          if (${view.useDOF}) {
            if (${view.legacyDOF}) {
              float zdist = float(${view.flame.camZ}) - _cz;
              if (zdist > 0.0) {
                  //    dofBlurShape.applyDOFAndCamera(camPoint, pPoint, zdist, zr);
              }
              else {
                 // dofBlurShape.applyOnlyCamera(camPoint, pPoint, zdist, zr);
              }
            }
            else {
               float xdist = (_cx - float(${view.flame.focusX}));
               float ydist = (_cy - float(${view.flame.focusY}));
               float zdist = (_cz - float(${view.flame.focusZ}));
    
               float dist = pow(xdist * xdist + ydist * ydist + zdist * zdist, 1.0 / float(${view.flame.camDOFExponent}));
               if (dist > float(${view.area})) {
                  //  dofBlurShape.applyDOFAndCamera(camPoint, pPoint, dist, zr);
               }
               else if (dist > float(${view.areaMinusFade})) {
                 // float scl = GfxMathLib.smootherstep(0.0, 1.0, (dist - areaMinusFade) / fade);
                 // float sclDist = scl * dist;
                 // dofBlurShape.applyDOFAndCamera(camPoint, pPoint, sclDist, zr);
               }
               else {
                  // dofBlurShape.applyOnlyCamera(camPoint, pPoint, zdist, zr);
               }
            }
          }  
          else {
            _px = _cx / zr;
            _py = _cy / zr;
          }
    
          float prjX = _px * float(${view.cosa}) + _py * float(${view.sina}) + float(${view.rcX});
          float prjY = _py * float(${view.cosa}) - _px * float(${view.sina}) + float(${view.rcY});
          gl_Position = vec4(prjX, prjY, 0.0, 1.0);
    `
    }
    else {
        return ` 
            float prjX =  point.x * float(${view.cosa})+ point.y * float(${view.sina}) + float(${view.rcX});
            float prjY = point.y * float(${view.cosa}) -  point.x * float(${view.sina}) + float(${view.rcY});
            gl_Position = vec4(prjX, prjY, 0.0, 1.0);
        
        `
    }

}

function createProgPointsVsShader(flame: RenderFlame, points_size: number) {
    const view = new FlameRenderView(flame, points_size, points_size)

    return  `
attribute vec3 aVertexPosition;

uniform sampler2D uTexSamp_Points;
uniform sampler2D uTexSamp_Colors;
			
uniform float time;
			
varying vec4 fragColor;		

void main(void) {
    gl_PointSize = 1.0;

    vec2 tex = aVertexPosition.xy;

    vec3 point = texture2D(uTexSamp_Points, tex).rgb;
    vec4 color = texture2D(uTexSamp_Colors, tex);

    fragColor = color;
  /*
    // TODO camera here!
    float _px = point.x;
    float _py = point.y;
    
    float alpha = 3.1415 / 6.0 ;
    float zoom = 0.75;
    float _cx = _px * zoom * sin(alpha) + _py * zoom * cos(alpha);
    float _cy = -_px * zoom * cos(alpha) + _py * zoom * sin(alpha);
    
    gl_Position = vec4(_cx, _cy, 0.0, 1.0);
    */
    
    ${addCamera(view)}
}
`
}

export class Shaders {
    prog_points: ComputePointsProgram;
    prog_comp: IteratePointsProgram;
    prog_comp_col: ComputeColorsProgram;
    prog_show: ShowHistogramProgram;
    prog_show_raw: ShowRawBufferProgram;

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, points_size: number, flame: RenderFlame) {
        const progPointsVsShader = createProgPointsVsShader(flame, points_size);

        console.log(progPointsVsShader)

        this.prog_points = compileShaderDirect(gl, progPointsVsShader, shader_points_fs, {}) as ComputePointsProgram;
        this.prog_points.vertexPositionAttribute = gl.getAttribLocation(this.prog_points, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_points.vertexPositionAttribute);
        this.prog_points.color = gl.getUniformLocation(this.prog_points, "color")!;
        this.prog_points.uTexSamp_Points = gl.getUniformLocation(this.prog_points, "uTexSamp_Points")!;
        this.prog_points.uTexSamp_Colors = gl.getUniformLocation(this.prog_points, "uTexSamp_Colors")!;
        this.prog_points.time = gl.getUniformLocation(this.prog_points, "time")!;

        const compPointsShader = createCompPointsShader(flame);
      //  console.log(compPointsShader);
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