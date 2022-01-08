import {Shaders} from "./shaders";

interface PositionBuffer extends WebGLBuffer {
    itemSize: number;
    numItems: number;
}

export class Buffers {
    pointsVertexPositionBuffer: PositionBuffer;
    quadVertexPositionBuffer: PositionBuffer;

    constructor(gl: WebGLRenderingContext, shaders: Shaders, points_size: number) {
        this.pointsVertexPositionBuffer = gl.createBuffer()! as PositionBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsVertexPositionBuffer);
        var vertices = [];
        var N = points_size;
        for(var x = 0; x < N; x++) {
            for(var y = 0; y < N; y++) {
                vertices.push(x / N, y / N);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.pointsVertexPositionBuffer!.itemSize = 2;
        this.pointsVertexPositionBuffer!.numItems = N * N;
        gl.vertexAttribPointer(shaders.prog_points.vertexPositionAttribute, this.pointsVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        this.quadVertexPositionBuffer = gl.createBuffer()! as PositionBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVertexPositionBuffer);
        var squareData = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]);
        this.quadVertexPositionBuffer!.itemSize = 2;
        this.quadVertexPositionBuffer!.numItems = 4;
        gl.bufferData(gl.ARRAY_BUFFER, squareData, gl.STATIC_DRAW);
        gl.vertexAttribPointer(shaders.prog_comp.vertexPositionAttribute, this.quadVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    }
}