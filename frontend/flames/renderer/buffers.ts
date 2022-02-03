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

import {WebglShaders} from "./shadergen/webgl-shaders";

interface PositionBuffer extends WebGLBuffer {
    itemSize: number;
    numItems: number;
}

export class Buffers {
    pointsVertexPositionBuffer: PositionBuffer;
    quadVertexPositionBuffer: PositionBuffer;

    constructor(gl: WebGLRenderingContext, shaders: WebglShaders, points_size: number) {
        this.pointsVertexPositionBuffer = gl.createBuffer()! as PositionBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.pointsVertexPositionBuffer);
        var vertices = [];
        var N = points_size;
        for(var x = 0; x < N; x++) {
            for(var y = 0; y < N; y++) {
                vertices.push(x / N, y / N, 0.0);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.pointsVertexPositionBuffer!.itemSize = 3;
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