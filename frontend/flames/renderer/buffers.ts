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
import {CloseableBuffers} from "Frontend/flames/renderer/shadergen/webgl-shader-utils";
import {RenderFlame} from "Frontend/flames/model/render-flame";

interface PositionBuffer extends WebGLBuffer {
    itemSize: number;
    numItems: number;
}

export class Buffers implements CloseableBuffers {
    pointsVertexPositionBuffer_array: Array<PositionBuffer> = []
    quadVertexPositionBuffer_array: Array<PositionBuffer> = []

    constructor(private gl: WebGLRenderingContext, shaders: WebglShaders, swarm_size: number, private flame: RenderFlame) {
        for(let layerIdx=0;layerIdx<flame.layers.length;layerIdx++) {
            let pointsVertexPositionBuffer = gl.createBuffer() as PositionBuffer
            gl.bindBuffer(gl.ARRAY_BUFFER, pointsVertexPositionBuffer)
            var vertices = []
            var N = swarm_size
            for (var x = 0; x < N; x++) {
                for (var y = 0; y < N; y++) {
                    vertices.push(x / N, y / N, 0.0)
                }
            }
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
            pointsVertexPositionBuffer!.itemSize = 3
            pointsVertexPositionBuffer!.numItems = N * N
            gl.vertexAttribPointer(shaders.prog_points_array[layerIdx].vertexPositionAttribute, pointsVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
            this.pointsVertexPositionBuffer_array[layerIdx] = pointsVertexPositionBuffer

            let quadVertexPositionBuffer = gl.createBuffer() as PositionBuffer
            gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexPositionBuffer)
            var squareData = new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                1, 1
            ])
            quadVertexPositionBuffer!.itemSize = 2
            quadVertexPositionBuffer!.numItems = 4
            gl.bufferData(gl.ARRAY_BUFFER, squareData, gl.STATIC_DRAW)
            gl.vertexAttribPointer(shaders.prog_comp_array[layerIdx].vertexPositionAttribute, quadVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0)
            this.quadVertexPositionBuffer_array[layerIdx] = quadVertexPositionBuffer
        }
    }

    closeBuffers = ()=> {
        for(let i=0;i<this.pointsVertexPositionBuffer_array.length;i++) {
            if(this.pointsVertexPositionBuffer_array[i]) {
                this.gl.deleteBuffer(this.pointsVertexPositionBuffer_array[i])

            }
        }
        this.pointsVertexPositionBuffer_array = []

        for(let i=0;i<this.quadVertexPositionBuffer_array.length;i++) {
            if(this.quadVertexPositionBuffer_array[i]) {
                this.gl.deleteBuffer(this.quadVertexPositionBuffer_array[i])
            }
        }
        this.quadVertexPositionBuffer_array = []
    }
}