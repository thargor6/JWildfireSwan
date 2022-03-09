import {Textures} from "./textures";
import {CloseableBuffers} from "Frontend/flames/renderer/shadergen/webgl-shader-utils";

export class Framebuffers implements CloseableBuffers {
    FBO0: WebGLFramebuffer | null;
    FBO1: WebGLFramebuffer | null;
    _FBO0: WebGLFramebuffer | null;
    _FBO1: WebGLFramebuffer | null;
    FBO2: WebGLFramebuffer | null;

  constructor(private gl: WebGLRenderingContext, textures: Textures) {
        this.FBO0 = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures.texture0, 0);

        this.FBO1 = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO1);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures.texture1, 0);

        this._FBO0 = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._FBO0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures._texture0, 0);

        this._FBO1 = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._FBO1);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures._texture1, 0);

        this.FBO2 = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO2);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures.texture2, 0);
    }

  closeBuffers = ()=> {
    if(this.FBO0) {
      this.gl.deleteFramebuffer(this.FBO0)
      this.FBO0 = null
    }
    if(this.FBO1) {
      this.gl.deleteFramebuffer(this.FBO1)
      this.FBO1 = null
    }
    if(this._FBO0) {
      this.gl.deleteFramebuffer(this._FBO0)
      this._FBO0 = null
    }
    if(this._FBO1) {
      this.gl.deleteFramebuffer(this._FBO1)
      this._FBO1 = null
    }
    if(this.FBO2) {
      this.gl.deleteFramebuffer(this.FBO2)
      this.FBO2 = null
    }
  }
}