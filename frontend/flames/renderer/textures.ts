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
    texture0_array: Array<WebGLTexture> = []
    texture1_array: Array<WebGLTexture> = []
    _texture0_array: Array<WebGLTexture> = []
    _texture1_array: Array<WebGLTexture> = []
    texture2: WebGLTexture | null
    gradient: WebGLTexture | null
    motionBlurTime: WebGLTexture | null

    constructor(public gl: WebGLRenderingContext, public swarm_size: number, public canvas_size: number, public flame: RenderFlame) {
        {
          this.gradient = gl.createTexture()!
          gl.bindTexture(gl.TEXTURE_2D, this.gradient)
          let grad = [], gradSize = 256
          for (var i = 0; i < gradSize; i++) {
            for (var j = 0; j < gradSize; j++) {
              let r,g,b;
              if(i<flame.layers.length) {
                r = flame.layers[i].gradient[j].r
                g = flame.layers[i].gradient[j].g
                b = flame.layers[i].gradient[j].b
              }
              else {
                r = flame.layers[flame.layers.length-1].gradient[j].r
                g = flame.layers[flame.layers.length-1].gradient[j].g
                b = flame.layers[flame.layers.length-1].gradient[j].b
              }
              grad.push(r, g, b, 0)
            }
          }
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gradSize, gradSize, 0, gl.RGBA, gl.FLOAT, new Float32Array(grad))
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        }
        {
          this.motionBlurTime = gl.createTexture()!
          gl.bindTexture(gl.TEXTURE_2D, this.motionBlurTime)
          var pixels = [], tSize = swarm_size
          const maxBlurAmount = flame.motionBlurLength * flame.motionBlurTimeStep
          for(var i = 0; i < tSize; i++) {
            for(var j = 0; j < tSize; j++) {
              const rnd = (0.5 - (Math.random()+Math.random()+Math.random()+Math.random())*0.25)
              const blurLength = rnd * maxBlurAmount
              let blurFade = (1.0 - blurLength * blurLength * flame.motionBlurDecay * flame.motionBlurLength * 0.07  / maxBlurAmount);
              if (blurFade < 0.01) {
                blurFade = 0.01
              }
              pixels.push(
                flame.motionBlurLength > 0 ? blurLength : 0.0,
                flame.motionBlurLength > 0 ? blurFade : 1.0,
                0,
                0
              )
            }
          }

          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, new Float32Array(pixels))
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        }

        let texture0 = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, texture0)
        var pixels = [], tSize = swarm_size
        for(var i = 0; i < tSize; i++) {
            for(var j = 0; j < tSize; j++) {
                pixels.push(
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    0
                )
            }
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, new Float32Array(pixels))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        this.texture0_array[0] = texture0
        //
        let texture1 = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, texture1)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        this.texture1_array[0] = texture1
        //
        let _texture0 = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, _texture0)
        pixels = []
        for(var i = 0; i < tSize; i++) {
            for(var j = 0; j < tSize; j++) {
                pixels.push(
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    0
                )
            }
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, new Float32Array(pixels))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        this._texture0_array[0] = _texture0
        //
        let _texture1 = gl.createTexture()!
        gl.bindTexture(gl.TEXTURE_2D, _texture1)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        this._texture1_array[0] = _texture1
        //
        this.texture2 = gl.createTexture()!
        gl.activeTexture(gl.TEXTURE2)
        gl.bindTexture(gl.TEXTURE_2D, this.texture2)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas_size, canvas_size, 0, gl.RGBA, gl.FLOAT, null)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    }

    clearHistogram() {
        const gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.canvas_size, this.canvas_size, 0, gl.RGBA, gl.FLOAT, null)
    }

    closeBuffers = ()=> {
      if(this.motionBlurTime) {
        this.gl.deleteTexture(this.motionBlurTime)
        this.motionBlurTime = null
      }

      for(let i=0;i<this.texture0_array.length;i++) {
        if(this.texture0_array[0]) {
          this.gl.deleteTexture(this.texture0_array[i])
        }
      }
      this.texture0_array = []

      for(let i=0;i<this.texture1_array.length;i++) {
        if(this.texture1_array[i]) {
          this.gl.deleteTexture(this.texture1_array[i])
        }
      }
      this.texture1_array = []

      for(let i=0;i<this._texture0_array.length;i++) {
        if(this._texture0_array[i]) {
          this.gl.deleteTexture(this._texture0_array[i])
        }
      }
      this._texture0_array = []

      for(let i=0;i<this._texture1_array.length;i++) {
        if(this._texture1_array[i]) {
          this.gl.deleteTexture(this._texture1_array[i])
        }
      }
      this._texture1_array = []

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