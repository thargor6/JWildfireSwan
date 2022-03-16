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

import {FlameRenderContext} from "./render-context";
import {FlameRenderSettings} from "./render-settings";

export class FlameRendererDisplay {
    constructor(public ctx: FlameRenderContext, public settings: FlameRenderSettings) {}

    public displayFlame() {
        const gl = this.ctx.gl;
        const canvas_size = this.settings.canvas_size;
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, canvas_size, canvas_size);
        gl.useProgram(this.ctx.shaders.prog_show);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture2);
        gl.uniform1i(this.ctx.shaders.prog_show!.uTexSamp, 0);
        gl.uniform1f(this.ctx.shaders.prog_show!.frames, this.settings.frames);
        gl.uniform1f(this.ctx.shaders.prog_show!.brightness, this.settings.brightness);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer);
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp!.vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer!.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer!.numItems);
    }

    public displayPositionIteration() {
        const gl = this.ctx.gl;
        const canvas_size = this.settings.canvas_size;
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, canvas_size, canvas_size);
        gl.useProgram(this.ctx.shaders.prog_show_raw);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture1);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.uTexSamp, 0);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.pTexSamp, 1);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.gradTexSamp,2);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.displayMode, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer);
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp!.vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer!.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer!.numItems);
    }

    public displayColorIteration() {
        const gl = this.ctx.gl;
        const canvas_size = this.settings.canvas_size;
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, canvas_size, canvas_size);
        gl.useProgram(this.ctx.shaders.prog_show_raw);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures._texture1);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.uTexSamp, 0);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.pTexSamp, 1);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.gradTexSamp, 2);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.displayMode, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer);
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp!.vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer!.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer!.numItems);
    }

    public displayGradient() {
        const gl = this.ctx.gl;
        const canvas_size = this.settings.canvas_size;
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, canvas_size, canvas_size);
        gl.useProgram(this.ctx.shaders.prog_show_raw);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures._texture1);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.uTexSamp, 0);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.pTexSamp, 1);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.gradTexSamp, 2);
        gl.uniform1i(this.ctx.shaders.prog_show_raw!.displayMode, 1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer);
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp!.vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer!.itemSize, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer!.numItems);
    }

}