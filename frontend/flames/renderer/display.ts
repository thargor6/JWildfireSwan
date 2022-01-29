
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


        // @ts-ignore
        gl.uniform1i(this.ctx.shaders.prog_show.uTexSamp, 0);
        // @ts-ignore
        gl.uniform1f(this.ctx.shaders.prog_show.frames, this.settings.frames);

        // @ts-ignore
        gl.uniform1f(this.ctx.shaders.prog_show.brightness, this.settings.brightness);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer);
        // @ts-ignore
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp.vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // @ts-ignore
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer.numItems);
    }

    public displayPosition() {
        const gl = this.ctx.gl;
        const canvas_size = this.settings.canvas_size;

        gl.disable(gl.BLEND);

        gl.viewport(0, 0, canvas_size, canvas_size);

        gl.useProgram(this.ctx.shaders.prog_show_raw);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures.texture1);

        // @ts-ignore
        gl.uniform1i(this.ctx.shaders.prog_show_raw.uTexSamp, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer);
        // @ts-ignore
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp.vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // @ts-ignore
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer.numItems);
    }

    public displayColour() {
        const gl = this.ctx.gl;
        const canvas_size = this.settings.canvas_size;

        gl.disable(gl.BLEND);

        gl.viewport(0, 0, canvas_size, canvas_size);

        gl.useProgram(this.ctx.shaders.prog_show_raw);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ctx.textures._texture1);

        // @ts-ignore
        gl.uniform1i(this.ctx.shaders.prog_show_raw.uTexSamp, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.ctx.buffers.quadVertexPositionBuffer);
        // @ts-ignore
        gl.vertexAttribPointer(this.ctx.shaders.prog_comp.vertexPositionAttribute, this.ctx.buffers.quadVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // @ts-ignore
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.ctx.buffers.quadVertexPositionBuffer.numItems);
    }

}