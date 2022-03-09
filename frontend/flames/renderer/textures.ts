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

import {RenderFlame} from "Frontend/flames/model/render-flame";
import {CloseableBuffers} from "Frontend/flames/renderer/shadergen/webgl-shader-utils";

export class Textures implements CloseableBuffers {
    texture0: WebGLTexture | null
    texture1: WebGLTexture | null
    _texture0: WebGLTexture | null
    _texture1: WebGLTexture | null
    texture2: WebGLTexture | null
    gradient: WebGLTexture | null

    constructor(public flame: RenderFlame,  public gl: WebGLRenderingContext, public swarm_size: number, public canvas_size: number) {
        //
        this.gradient = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.gradient);
        let grad = [], gradSize = 256
        for(var i = 0; i < gradSize; i++) {
            for(var j = 0; j < gradSize; j++) {
                grad.push(
                    flame.layers[0].gradient[j].r,
                    flame.layers[0].gradient[j].g,
                    flame.layers[0].gradient[j].b,
                    0
                );
            }
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gradSize, gradSize, 0, gl.RGBA, gl.FLOAT, new Float32Array(grad));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //

        this.texture0 = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.texture0);
        var pixels = [], tSize = swarm_size;
        for(var i = 0; i < tSize; i++) {
            for(var j = 0; j < tSize; j++) {
                pixels.push(
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    0
                );
            }
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, new Float32Array(pixels));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //
        this.texture1 = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.texture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //
        this._texture0 = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this._texture0);
        pixels = [];
        for(var i = 0; i < tSize; i++) {
            for(var j = 0; j < tSize; j++) {
                pixels.push(
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    0
                );
            }
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, new Float32Array(pixels));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //
        this._texture1 = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this._texture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //
        this.texture2 = gl.createTexture()!;
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.texture2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas_size, canvas_size, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    clearHistogram() {
        const gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.canvas_size, this.canvas_size, 0, gl.RGBA, gl.FLOAT, null);
    }

    closeBuffers = ()=> {
      if(this.texture0) {
          this.gl.deleteTexture(this.texture0)
          this.texture0 = null
      }
      if(this.texture1) {
        this.gl.deleteTexture(this.texture1)
        this.texture1 = null
      }
      if(this._texture0) {
        this.gl.deleteTexture(this._texture0)
        this._texture0 = null
      }
      if(this._texture1) {
        this.gl.deleteTexture(this._texture1)
        this._texture1 = null
      }
      if(this.texture2) {
        this.gl.deleteTexture(this.texture2)
        this.texture2 = null
      }
      if(this.gradient) {
        this.gl.deleteTexture(this.gradient)
        this.gradient = null
      }
    }
}