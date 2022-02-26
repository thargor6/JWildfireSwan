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

import {compileShaderDirect} from './webgl-shader-utils'
import {shader_points_fs} from '../shaders/shader-points-fs'
import {shader_direct_vs} from '../shaders/shader-direct-vs'
import {shader_comp_col_fs} from '../shaders/shader-comp-col-fs'
import {shader_show_fs} from '../shaders/shader-show-fs'
import {shader_show_raw_fs} from '../shaders/shader-show-raw-fs'
import {RenderFlame} from "Frontend/flames/model/render-flame";
import {CompPointsFragmentShaderGenerator} from "Frontend/flames/renderer/shadergen/comp-points-fs-gen";
import {ProgPointsVertexShaderGenerator} from "Frontend/flames/renderer/shadergen/prog-points-vs.gen";

interface ComputePointsProgram extends WebGLProgram {
    vertexPositionAttribute: GLint;
    color: WebGLUniformLocation;
    uTexSamp_Points: WebGLUniformLocation;
    uTexSamp_Colors: WebGLUniformLocation;
    time: WebGLUniformLocation;
    seed: WebGLUniformLocation;
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
    pTexSamp: WebGLUniformLocation;
    gradTexSamp: WebGLUniformLocation;
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
    pTexSamp: WebGLUniformLocation;
    gradTexSamp: WebGLUniformLocation;
    displayMode: WebGLUniformLocation;
}

export class WebglShaders {
    prog_points: ComputePointsProgram
    prog_comp: IteratePointsProgram
    prog_comp_col: ComputeColorsProgram
    prog_show: ShowHistogramProgram
    prog_show_raw: ShowRawBufferProgram
    progPointsVertexShader: string
    compPointsFragmentShader: string

    constructor(gl: WebGLRenderingContext, canvas: HTMLCanvasElement, canvas_size: number, swarm_size: number, private flame: RenderFlame) {
        this.progPointsVertexShader = new ProgPointsVertexShaderGenerator().createShader(flame, canvas_size);
        this.prog_points = compileShaderDirect(gl, this.progPointsVertexShader, shader_points_fs, {}) as ComputePointsProgram;
        this.prog_points.vertexPositionAttribute = gl.getAttribLocation(this.prog_points, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_points.vertexPositionAttribute);
        this.prog_points.color = gl.getUniformLocation(this.prog_points, "color")!;
        this.prog_points.uTexSamp_Points = gl.getUniformLocation(this.prog_points, "uTexSamp_Points")!;
        this.prog_points.uTexSamp_Colors = gl.getUniformLocation(this.prog_points, "uTexSamp_Colors")!;
        this.prog_points.time = gl.getUniformLocation(this.prog_points, "time")!;
        this.prog_points.seed = gl.getUniformLocation(this.prog_points, "seed")!;

        this.compPointsFragmentShader = new CompPointsFragmentShaderGenerator().createShader(flame);
        this.prog_comp = compileShaderDirect(gl, shader_direct_vs, this.compPointsFragmentShader, {RESOLUTION: swarm_size}) as IteratePointsProgram;
        this.prog_comp.vertexPositionAttribute = gl.getAttribLocation(this.prog_comp, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_comp.vertexPositionAttribute);
        this.prog_comp.uTexSamp = gl.getUniformLocation(this.prog_comp, "uTexSamp")!;
        this.prog_comp.seed = gl.getUniformLocation(this.prog_comp, "seed")!;
        this.prog_comp.seed2 = gl.getUniformLocation(this.prog_comp, "seed2")!;
        this.prog_comp.seed3 = gl.getUniformLocation(this.prog_comp, "seed3")!;
        this.prog_comp.time = gl.getUniformLocation(this.prog_comp, "time")!;

        this.prog_comp_col = compileShaderDirect(gl, shader_direct_vs, shader_comp_col_fs, {RESOLUTION: swarm_size}) as ComputeColorsProgram;
        this.prog_comp_col.vertexPositionAttribute = gl.getAttribLocation(this.prog_comp_col, "aVertexPosition");
        gl.enableVertexAttribArray(this.prog_comp_col.vertexPositionAttribute);
        this.prog_comp_col.uTexSamp = gl.getUniformLocation(this.prog_comp_col, "uTexSamp")!;
        this.prog_comp_col.pTexSamp = gl.getUniformLocation(this.prog_comp_col, "pTexSamp")!;
        this.prog_comp_col.gradTexSamp = gl.getUniformLocation(this.prog_comp_col, "gradTexSamp")!;
        this.prog_comp_col.seed = gl.getUniformLocation(this.prog_comp_col, "seed")!;
        this.prog_comp_col.seed2 = gl.getUniformLocation(this.prog_comp_col, "seed2")!;
        this.prog_comp_col.seed3 = gl.getUniformLocation(this.prog_comp_col, "seed3")!;

        {
            const params = {
                BRIGHTNESS: this.flame.brightness,
                CONTRAST: this.flame.contrast,
                GAMMA: this.flame.gamma,
                GAMMA_THRESHOLD: this.flame.gammaThreshold,
                SWARM_SIZE: swarm_size,
                BALANCE_RED: this.flame.balanceRed,
                BALANCE_GREEN: this.flame.balanceGreen,
                BALANCE_BLUE: this.flame.balanceBlue,
                RESOLUTION: canvas.width}

            this.prog_show = compileShaderDirect(gl, shader_direct_vs, shader_show_fs, params) as ShowHistogramProgram;
            this.prog_show.uTexSamp = gl.getUniformLocation(this.prog_show, "uTexSamp")!;
            this.prog_show.frames = gl.getUniformLocation(this.prog_show, "frames")!;
            this.prog_show.brightness = gl.getUniformLocation(this.prog_show, "brightness")!;
        }
        this.prog_show_raw = compileShaderDirect(gl, shader_direct_vs, shader_show_raw_fs, {RESOLUTION: canvas.width}) as ShowRawBufferProgram;
        this.prog_show_raw.uTexSamp = gl.getUniformLocation(this.prog_show_raw, "uTexSamp")!;
        this.prog_show_raw.pTexSamp = gl.getUniformLocation(this.prog_show_raw, "pTexSamp")!;
        this.prog_show_raw.gradTexSamp = gl.getUniformLocation(this.prog_show_raw, "gradTexSamp")!;
        this.prog_show_raw.displayMode = gl.getUniformLocation(this.prog_show_raw, "displayMode")!;
    }

}
