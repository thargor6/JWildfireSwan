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
import {Buffers} from "./buffers";
import {Framebuffers} from "./framebuffers";
import {Textures} from "./textures";

export class FlameRenderContext {
    constructor(
        public gl: WebGLRenderingContext,
        public shaders: WebglShaders,
        public buffers: Buffers,
        public textures: Textures,
        public framebuffers: Framebuffers) {}
}