export const shader_show_raw_fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexSamp;

void main(void) {
    vec3 texel = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgb;

    gl_FragColor = vec4(texel, 1.0);
}
`;