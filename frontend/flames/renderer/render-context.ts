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