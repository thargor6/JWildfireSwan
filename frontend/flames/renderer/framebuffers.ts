import {Textures} from "./textures";
import {CloseableBuffers} from "Frontend/flames/renderer/shadergen/webgl-shader-utils";
import {RenderFlame} from "Frontend/flames/model/render-flame";

export class Framebuffers implements CloseableBuffers {
    FBO0_array: Array<WebGLFramebuffer> = []
    FBO1_array: Array<WebGLFramebuffer> = []
    _FBO0_array: Array<WebGLFramebuffer> = []
    _FBO1_array: Array<WebGLFramebuffer> = []
    FBO2: WebGLFramebuffer | null

  constructor(private gl: WebGLRenderingContext, textures: Textures, public flame: RenderFlame) {
    for (let layerIdx = 0; layerIdx < flame.layers.length; layerIdx++) {
      let FBO0 = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, FBO0)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures.texture0_array[layerIdx], 0)
      this.FBO0_array[layerIdx] = FBO0

      let FBO1 = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, FBO1)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures.texture1_array[layerIdx], 0)
      this.FBO1_array[layerIdx] = FBO1

      let _FBO0 = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, _FBO0)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures._texture0_array[layerIdx], 0)
      this._FBO0_array[layerIdx] = _FBO0

      let _FBO1 = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, _FBO1)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures._texture1_array[layerIdx], 0)
      this._FBO1_array[layerIdx] = _FBO1
    }
    this.FBO2 = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO2)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures.texture2, 0)
  }

  closeBuffers = ()=> {
    for(let i=0;i<this.FBO0_array.length;i++) {
      if(this.FBO0_array[i]) {
        this.gl.deleteFramebuffer(this.FBO0_array[i])
      }
    }
    this.FBO0_array = []

    for(let i=0;i<this.FBO1_array.length;i++) {
      if(this.FBO1_array[i]) {
        this.gl.deleteFramebuffer(this.FBO1_array[i])
      }
    }
    this.FBO1_array = []

    for(let i=0;i<this._FBO0_array.length;i++) {
      if(this._FBO0_array[i]) {
        this.gl.deleteFramebuffer(this._FBO0_array[i])
      }
    }
    this._FBO0_array = []

    for(let i=0;i<this._FBO1_array.length;i++) {
      if(this._FBO1_array[i]) {
        this.gl.deleteFramebuffer(this._FBO1_array[i])
      }
    }
    this._FBO1_array = []

    if(this.FBO2) {
      this.gl.deleteFramebuffer(this.FBO2)
      this.FBO2 = null
    }
  }
}