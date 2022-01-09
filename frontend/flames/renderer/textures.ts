export class Textures {
    texture0: WebGLTexture;
    texture1: WebGLTexture;
    _texture0: WebGLTexture;
    _texture1: WebGLTexture;
    texture2: WebGLTexture;

    constructor(public gl: WebGLRenderingContext, public points_size: number, public grid_size: number) {
        this.texture0 = gl.createTexture()!;

        gl.bindTexture(gl.TEXTURE_2D, this.texture0);

        var pixels = [], tSize = points_size;

        for(var i = 0; i < tSize; i++) {
            for(var j = 0; j < tSize; j++) {
                pixels.push(
                    -1 + 2 * Math.random(),
                    -1 + 2 * Math.random(),
                    0,
                    0
                );
            }
        }

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, new Float32Array(pixels));

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this.texture1 = gl.createTexture()!;

        gl.bindTexture(gl.TEXTURE_2D, this.texture1);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tSize, tSize, 0, gl.RGBA, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

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

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, grid_size, grid_size, 0, gl.RGBA, gl.FLOAT, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    clearHistogram() {
        const gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.grid_size, this.grid_size, 0, gl.RGBA, gl.FLOAT, null);

    }
}