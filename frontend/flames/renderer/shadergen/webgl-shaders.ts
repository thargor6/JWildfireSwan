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

import {CloseableBuffers, compileShaderDirect} from './webgl-shader-utils'
import {shader_points_fs} from '../shaders/shader-points-fs'
import {shader_direct_vs} from '../shaders/shader-direct-vs'
import {shader_comp_col_fs} from '../shaders/shader-comp-col-fs'
import {shader_show_fs} from '../shaders/shader-show-fs'
import {shader_show_raw_fs} from '../shaders/shader-show-raw-fs'
import {RenderFlame} from "Frontend/flames/model/render-flame";
import {CompPointsFragmentShaderGenerator} from "Frontend/flames/renderer/shadergen/comp-points-fs-gen";
import {ProgPointsVertexShaderGenerator} from "Frontend/flames/renderer/shadergen/prog-points-vs.gen";
import {DenoiserType} from "Frontend/flames/model/flame";
import {shader_show_with_denoiser_fs} from "Frontend/flames/renderer/shaders/shader-show-denoise-fs";
import {SharedRenderContext} from "Frontend/flames/renderer/shared-render-context";

interface ComputePointsProgram extends WebGLProgram {
    vertexPositionAttribute: GLint;
    color: WebGLUniformLocation;
    uTexSamp_Points: WebGLUniformLocation;
    uTexSamp_Colors: WebGLUniformLocation;
    motionBlurTimeStamp: WebGLUniformLocation;
    seed: WebGLUniformLocation;
    currChangeParamId: WebGLUniformLocation;
    currChangeRefValue: WebGLUniformLocation;
    currChangeNewValue: WebGLUniformLocation;
}

interface IteratePointsProgram extends WebGLProgram {
    vertexPositionAttribute: GLint;
    uTexSamp: WebGLUniformLocation;
    motionBlurTimeStamp: WebGLUniformLocation;
    seed: WebGLUniformLocation;
    currChangeParamId: WebGLUniformLocation;
    currChangeRefValue: WebGLUniformLocation;
    currChangeNewValue: WebGLUniformLocation;
}

interface ComputeColorsProgram extends WebGLProgram {
    vertexPositionAttribute: GLint;
    uTexSamp: WebGLUniformLocation;
    pTexSamp: WebGLUniformLocation;
    gradTexSamp: WebGLUniformLocation;
    motionBlurTimeStamp: WebGLUniformLocation;
    layerCoord: WebGLUniformLocation;
    layerBrightness: WebGLUniformLocation;
}

interface ShowHistogramProgram extends WebGLProgram {
    uTexSamp: WebGLUniformLocation;
    frames: WebGLUniformLocation;
}

interface ShowRawBufferProgram extends WebGLProgram {
    uTexSamp: WebGLUniformLocation;
    pTexSamp: WebGLUniformLocation;
    gradTexSamp: WebGLUniformLocation;
    motionBlurTimeStamp: WebGLUniformLocation;
    displayMode: WebGLUniformLocation;
}

export class WebglShaders implements CloseableBuffers{
    prog_points_array: Array<ComputePointsProgram> = []
    prog_comp_array: Array<IteratePointsProgram> = []
    prog_comp_col: ComputeColorsProgram | null
    prog_show: ShowHistogramProgram | null
    prog_show_raw: ShowRawBufferProgram | null
    progPointsVertexShader_array: string[] = []
    compPointsFragmentShader_array: string[] = []

    constructor(private sharedRenderCtx: SharedRenderContext, private gl: WebGLRenderingContext, canvas: HTMLCanvasElement, canvas_size: number, swarm_size: number, private flame: RenderFlame) {
        //console.log("RENDER", flame)
        for(let layerIdx=0;layerIdx<flame.layers.length;layerIdx++) {
            const progPointsVertexShader = new ProgPointsVertexShaderGenerator().createShader(flame, flame.layers[layerIdx], canvas_size);
            sharedRenderCtx.currProgPointsVertexShader = progPointsVertexShader
            let prog_points = compileShaderDirect(gl, progPointsVertexShader, shader_points_fs, {}) as ComputePointsProgram;
            prog_points.vertexPositionAttribute = gl.getAttribLocation(prog_points, "aVertexPosition");
            gl.enableVertexAttribArray(prog_points.vertexPositionAttribute);
            prog_points.color = gl.getUniformLocation(prog_points, "color")!;
            prog_points.uTexSamp_Points = gl.getUniformLocation(prog_points, "uTexSamp_Points")!;
            prog_points.uTexSamp_Colors = gl.getUniformLocation(prog_points, "uTexSamp_Colors")!;
            prog_points.motionBlurTimeStamp = gl.getUniformLocation(prog_points, "motionBlurTimeStamp")!;
            prog_points.seed = gl.getUniformLocation(prog_points, "seed")!;
            prog_points.currChangeParamId = gl.getUniformLocation(prog_points, "currChangeParamId")!;
            prog_points.currChangeRefValue = gl.getUniformLocation(prog_points, "currChangeRefValue")!;
            prog_points.currChangeNewValue = gl.getUniformLocation(prog_points, "currChangeNewValue")!;
            this.prog_points_array[layerIdx] = prog_points
            this.compPointsFragmentShader_array[layerIdx] = progPointsVertexShader

            const compPointsFragmentShader = new CompPointsFragmentShaderGenerator().createShader(flame, flame.layers[layerIdx]);
            sharedRenderCtx.currCompPointsFragmentShader = compPointsFragmentShader
            let prog_comp = compileShaderDirect(gl, shader_direct_vs, compPointsFragmentShader, {RESOLUTION: swarm_size}) as IteratePointsProgram;
            prog_comp.vertexPositionAttribute = gl.getAttribLocation(prog_comp, "aVertexPosition");
            gl.enableVertexAttribArray(prog_comp.vertexPositionAttribute);
            prog_comp.uTexSamp = gl.getUniformLocation(prog_comp, "uTexSamp")!;
            prog_comp.motionBlurTimeStamp = gl.getUniformLocation(prog_comp, "motionBlurTimeStamp")!;
            prog_comp.seed = gl.getUniformLocation(prog_comp, "seed")!;
            prog_comp.currChangeParamId = gl.getUniformLocation(prog_comp, "currChangeParamId")!;
            prog_comp.currChangeRefValue = gl.getUniformLocation(prog_comp, "currChangeRefValue")!;
            prog_comp.currChangeNewValue = gl.getUniformLocation(prog_comp, "currChangeNewValue")!;
            this.compPointsFragmentShader_array[layerIdx] = compPointsFragmentShader
            this.prog_comp_array[layerIdx] = prog_comp
        }

        this.prog_comp_col = compileShaderDirect(gl, shader_direct_vs, shader_comp_col_fs, {RESOLUTION: swarm_size}) as ComputeColorsProgram;
        this.prog_comp_col.vertexPositionAttribute = gl.getAttribLocation(this.prog_comp_col, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_comp_col.vertexPositionAttribute);
        this.prog_comp_col.uTexSamp = gl.getUniformLocation(this.prog_comp_col, "uTexSamp")!;
        this.prog_comp_col.pTexSamp = gl.getUniformLocation(this.prog_comp_col, "pTexSamp")!;
        this.prog_comp_col.gradTexSamp = gl.getUniformLocation(this.prog_comp_col, "gradTexSamp")!;
        this.prog_comp_col.motionBlurTimeStamp = gl.getUniformLocation(this.prog_comp_col, "motionBlurTimeStamp")!;
        this.prog_comp_col.layerCoord = gl.getUniformLocation(this.prog_comp_col, "layerCoord")!;
        this.prog_comp_col.layerBrightness = gl.getUniformLocation(this.prog_comp_col, "layerBrightness")!;
        {
            const k1 =  this.flame.contrast * this.flame.brightness * 1.5
            const pixelsPerUnit =  this.flame.pixelsPerUnit *  this.flame.camZoom
            const area = (this.flame.width *  this.flame.height) / (pixelsPerUnit * pixelsPerUnit);
            const k2 = 1.0 / ( this.flame.contrast * area *  this.flame.sampleDensity ) * 0.75
            const bgGlow = this.flame.lowDensityBrightness * k2 * area * 0.75
            const alphaAdjust = 1.0 - Math.atan(3.0 * (this.flame.foregroundOpacity - 1.0)) / 1.25;
            const params = {
                BRIGHTNESS: this.flame.brightness,
                CONTRAST: this.flame.contrast,
                GAMMA: this.flame.gamma,
                GAMMA_THRESHOLD: this.flame.gammaThreshold,
                SWARM_SIZE: swarm_size,
                BALANCE_RED: this.flame.balanceRed,
                BALANCE_GREEN: this.flame.balanceGreen,
                BALANCE_BLUE: this.flame.balanceBlue,
                K1: k1,
                K2: k2,
                BG_GLOW: bgGlow,
                ALPHA_ADJUST: alphaAdjust,
                WITH_ALPHA: this.flame.bgTransparency,
                VIBRANCY: this.flame.vibrancy,
                WHITE_LEVEL: this.flame.whiteLevel,
                RESOLUTION: canvas.width}
            if(this.flame.dnType === DenoiserType.OFF) {
                this.prog_show = compileShaderDirect(gl, shader_direct_vs, shader_show_fs, params) as ShowHistogramProgram;
            }
            else {
                const extParams = {
                  ...params,
                  DN_TYPE: this.flame.dnType,
                  DN_SPLITTER: this.flame.dnSplitter,
                  DN_SIGMA: this.flame.dnSigma,
                  DN_KSIGMA: this.flame.dnKSigma,
                  DN_THRESHOLD: this.flame.dnThreshold,
                  DN_MIX: this.flame.dnMix,
                  DN_INV_GAMMA: 1.0 / this.flame.dnGamma
                }
                this.prog_show = compileShaderDirect(gl, shader_direct_vs, shader_show_with_denoiser_fs, extParams) as ShowHistogramProgram;
            }

            this.prog_show.uTexSamp = gl.getUniformLocation(this.prog_show, "uTexSamp")!
            this.prog_show.frames = gl.getUniformLocation(this.prog_show, "frames")!
        }
        this.prog_show_raw = compileShaderDirect(gl, shader_direct_vs, shader_show_raw_fs, {RESOLUTION: canvas.width}) as ShowRawBufferProgram;
        this.prog_show_raw.uTexSamp = gl.getUniformLocation(this.prog_show_raw, "uTexSamp")!;
        this.prog_show_raw.pTexSamp = gl.getUniformLocation(this.prog_show_raw, "pTexSamp")!;
        this.prog_show_raw.gradTexSamp = gl.getUniformLocation(this.prog_show_raw, "gradTexSamp")!;
        this.prog_show_raw.motionBlurTimeStamp = gl.getUniformLocation(this.prog_show_raw, "motionBlurTimeSamp")!;
        this.prog_show_raw.displayMode = gl.getUniformLocation(this.prog_show_raw, "displayMode")!;
    }

    closeBuffers = ()=> {
        for(let i=0;i<this.prog_points_array.length;i++) {
            if(this.prog_points_array[i]) {
                this.gl.deleteProgram(this.prog_points_array[i])
            }
        }
        this.prog_points_array = []
        this.compPointsFragmentShader_array = []

        for(let i=0;i<this.compPointsFragmentShader_array.length;i++) {
            if(this.prog_comp_array[0]) {
                this.gl.deleteProgram(this.prog_comp_array[i])
            }
        }
        this.compPointsFragmentShader_array = []
        this.progPointsVertexShader_array = []

        if(this.prog_comp_col) {
            this.gl.deleteProgram(this.prog_comp_col)
            this.prog_comp_col = null
        }
        if(this.prog_show) {
            this.gl.deleteProgram(this.prog_show)
            this.prog_show = null
        }
        if(this.prog_show_raw) {
            this.gl.deleteProgram(this.prog_show_raw)
            this.prog_show_raw = null
        }
    }
}
