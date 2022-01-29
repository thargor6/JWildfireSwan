import {compileShaderDirect} from './shader_utils'
import {shader_points_fs} from '../shaders/shader-points-fs'
import {shader_direct_vs} from '../shaders/shader-direct-vs'
import {shader_comp_col_fs} from '../shaders/shader-comp-col-fs'
import {shader_show_fs} from '../shaders/shader-show-fs'
import {shader_show_raw_fs} from '../shaders/shader-show-raw-fs'
import {register2DVars} from "Frontend/flames/renderer/variations/variation-shaders-2d";
import {RenderFlame, RenderXForm, RenderVariation} from "Frontend/flames/model/render-flame";
import {FlameRenderView} from "Frontend/flames/renderer/flame-render-view";
import {register3DVars} from "Frontend/flames/renderer/variations/variation-shaders-3d";
import {CompPointsFragmentShaderGenerator} from "Frontend/flames/renderer/variations/shaders/comp-points-fs-gen";

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

function addCamera(view: FlameRenderView) {
    if (view.doProject3D) {
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
          gl_Position = vec4(prjX * float(${view.bws}), prjY * float(${view.bhs}), 0.0, 1.0);
    `
    }
    else {
        return ` 
            float prjX =  point.x * float(${view.cosa})+ point.y * float(${view.sina}) + float(${view.rcX});
            float prjY = point.y * float(${view.cosa}) -  point.x * float(${view.sina}) + float(${view.rcY});
            gl_Position = vec4(prjX * float(${view.bws}), prjY * float(${view.bhs}), 0.0, 1.0);
        
        `
    }

}

function createProgPointsVsShader(flame: RenderFlame, points_size: number) {
    const view = new FlameRenderView(flame, points_size, points_size)
console.log("VIEW:", view);
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
    prog_points: ComputePointsProgram
    prog_comp: IteratePointsProgram
    prog_comp_col: ComputeColorsProgram
    prog_show: ShowHistogramProgram
    prog_show_raw: ShowRawBufferProgram
    progPointsVertexShader: string
    compPointsFragmentShader: string

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, points_size: number, flame: RenderFlame) {
        this.progPointsVertexShader = createProgPointsVsShader(flame, points_size);
        this.prog_points = compileShaderDirect(gl, this.progPointsVertexShader, shader_points_fs, {}) as ComputePointsProgram;
        this.prog_points.vertexPositionAttribute = gl.getAttribLocation(this.prog_points, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_points.vertexPositionAttribute);
        this.prog_points.color = gl.getUniformLocation(this.prog_points, "color")!;
        this.prog_points.uTexSamp_Points = gl.getUniformLocation(this.prog_points, "uTexSamp_Points")!;
        this.prog_points.uTexSamp_Colors = gl.getUniformLocation(this.prog_points, "uTexSamp_Colors")!;
        this.prog_points.time = gl.getUniformLocation(this.prog_points, "time")!;

        this.compPointsFragmentShader = new CompPointsFragmentShaderGenerator().createShader(flame);
        this.prog_comp = compileShaderDirect(gl, shader_direct_vs, this.compPointsFragmentShader, {RESOLUTION: points_size}) as IteratePointsProgram;
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

register2DVars()
register3DVars()