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

export class FlameIterator {

    constructor(public ctx: FlameRenderContext, public settings: FlameRenderSettings) {
    }

    private flag = true;

    public iterateIFS() {
        const gl = this.ctx.gl;
        const canvas_size = this.settings.canvas_size;

        gl.viewport(0, 0, this.settings.swarm_size, this.settings.swarm_size);

        gl.disable(gl.BLEND);

        var seed = Math.random();
        var seed2 = Math.random();
        var seed3 = Math.random();

        // P = fi(P)
        gl.useProgram(this.ctx.shaders.prog_comp_array[0]);


        gl.uniform1f(this.ctx.shaders.prog_comp_array[0].seed, seed);
        gl.uniform1f(this.ctx.shaders.prog_comp_array[0].seed2, seed2);
        gl.uniform1f(this.ctx.shaders.prog_comp_array[0].seed3, seed3);
        gl.uniform1f(this.ctx.shaders.prog_comp_array[0].time, this.settings.time );
        gl.uniform1i(this.ctx.shaders.prog_comp_array[0].uTexSamp, 0);
        gl.uniform1i(this.ctx.shaders.prog_comp_array[0].motionBlurTimeSamp, 1);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.motionBlurTime);

        gl.activeTexture(gl.TEXTURE0);
        if(this.flag) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.ctx.framebuffers.FBO1_array[0]);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture0_array[0]);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.ctx.framebuffers.FBO0_array[0]);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture1_array[0]);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer_array[0]);
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp_array[0].vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer_array[0].itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer_array[0].numItems);

        // C += Ci
        gl.useProgram(this.ctx.shaders.prog_comp_col);

        // TODO remove seed
        gl.uniform1f(this.ctx.shaders.prog_comp_col!.seed, seed);
        gl.uniform1f(this.ctx.shaders.prog_comp_col!.seed2, seed2);
        gl.uniform1f(this.ctx.shaders.prog_comp_col!.seed3, seed3);
        gl.uniform1i(this.ctx.shaders.prog_comp_col!.uTexSamp, 0);
        gl.uniform1i(this.ctx.shaders.prog_comp_col!.pTexSamp, 1);
        gl.uniform1i(this.ctx.shaders.prog_comp_col!.gradTexSamp, 2);
        gl.uniform1i(this.ctx.shaders.prog_comp_col!.motionBlurTimeSamp, 3);

        if(this.flag) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.ctx.framebuffers._FBO1_array[0]);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures._texture0_array[0]);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture0_array[0]);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.ctx.framebuffers._FBO0_array[0]);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures._texture1_array[0]);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture1_array[0]);
        }
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.gradient);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.motionBlurTime);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer_array[0]);
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp_col!.vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer_array[0].itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer_array[0].numItems);

        this.flag = !this.flag
    }

    public plotHistogram() {
        const gl = this.ctx.gl;
        const canvas_size = this.settings.canvas_size;

        // Plot points into "histogram"
        gl.viewport(0, 0, canvas_size, canvas_size);

        gl.useProgram(this.ctx.shaders.prog_points_array[0]);

        gl.uniform1i(this.ctx.shaders.prog_points_array[0].uTexSamp_Points, 0);
        gl.uniform1i(this.ctx.shaders.prog_points_array[0].uTexSamp_Colors, 1);
        gl.uniform1i(this.ctx.shaders.prog_points_array[0].motionBlurTimeSamp, 2);
        gl.uniform1f(this.ctx.shaders.prog_points_array[0].time, this.settings.time );
        gl.uniform1f(this.ctx.shaders.prog_points_array[0].seed, Math.random());

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.gradient);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.motionBlurTime);

        if(this.flag) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture1_array[0]);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures._texture1_array[0]);
        } else {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture0_array[0]);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures._texture0_array[0]);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.pointsVertexPositionBuffer_array[0]);
        gl.vertexAttribPointer(this.ctx.shaders.prog_points_array[0].vertexPositionAttribute, this.ctx.buffers.pointsVertexPositionBuffer_array[0].itemSize, gl.FLOAT, false, 0, 0);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.ctx.framebuffers.FBO2);

        gl.drawArrays(gl.POINTS, 0, this.ctx.buffers.pointsVertexPositionBuffer_array[0].numItems);

        gl.disable(gl.BLEND);
    }

}