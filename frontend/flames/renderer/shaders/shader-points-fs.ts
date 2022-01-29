export const shader_points_fs = `
#ifdef GL_ES
precision highp float;
#endif

varying vec4 fragColor;

void main(void) {
gl_FragColor = fragColor;
}
`;