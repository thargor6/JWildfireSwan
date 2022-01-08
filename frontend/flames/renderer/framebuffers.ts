import {Textures} from "./textures";

export class Framebuffers {
    FBO0: WebGLFramebuffer;
    FBO1: WebGLFramebuffer;
    _FBO0: WebGLFramebuffer;
    _FBO1: WebGLFramebuffer;
    FBO2: WebGLFramebuffer;

  constructor(gl: WebGLRenderingContext, textures: Textures) {
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
}