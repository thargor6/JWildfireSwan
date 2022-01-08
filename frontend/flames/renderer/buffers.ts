import {Shaders} from "./shaders";

export class Buffers {
    pointsVertexPositionBuffer: WebGLBuffer | null = null;
    quadVertexPositionBuffer: WebGLBuffer | null = null;

    initBuffers(gl: WebGLRenderingContext, shaders: Shaders, points_size: number) {
        //
        let pointsVertexPositionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, pointsVertexPositionBuffer);

        var vertices = [];

        var N = points_size;

        for(var x = 0; x < N; x++) {
            for(var y = 0; y < N; y++) {
                vertices.push(x / N, y / N);
            }
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // @ts-ignore
        pointsVertexPositionBuffer!.itemSize = 2;
        // @ts-ignore
        pointsVertexPositionBuffer!.numItems = N * N;

        // @ts-ignore
        gl.vertexAttribPointer(shaders.prog_points.vertexPositionAttribute, pointsVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //
        let quadVertexPositionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexPositionBuffer);

        var squareData = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]);

        // @ts-ignore
        quadVertexPositionBuffer!.itemSize = 2;
        // @ts-ignore
        quadVertexPositionBuffer!.numItems = 4;

        gl.bufferData(gl.ARRAY_BUFFER, squareData, gl.STATIC_DRAW);

        // @ts-ignore
        gl.vertexAttribPointer(shaders.prog_comp.vertexPositionAttribute, quadVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

      this.quadVertexPositionBuffer = quadVertexPositionBuffer;
      this.pointsVertexPositionBuffer = pointsVertexPositionBuffer;
    }
}