export const shader_comp_col_fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexSamp;
uniform float seed;
uniform float seed2;
uniform float seed3;

// Rand
float rand(vec2 co) {
return fract(sin(dot(co.xy, vec2(12.9898 * seed, 78.233 * seed))) * 43758.5453);
}

void main(void) {
vec2 tex = gl_FragCoord.xy / <%= RESOLUTION %>;

vec3 col = texture2D(uTexSamp, tex).rgb;

float r = rand(tex);

if(r < 1.0 / 3.0) {
    col = (col + vec3(						
        1, 0.0, 0.0
    )) / 2.0;
} else if(r < 2.0 / 3.0) {
    col = (col + vec3(						
        0.0, 0.5, 0.
    )) / 2.0;
} else {
    col = (col + vec3(						
        0.0, 0.0, 0.1
    )) / 2.0;
}


gl_FragColor = vec4(col, 1.0);
}
`;