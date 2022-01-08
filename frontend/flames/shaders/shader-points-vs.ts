export const shader_points_vs = `
attribute vec3 aVertexPosition;

uniform sampler2D uTexSamp_Points;
uniform sampler2D uTexSamp_Colors;

varying vec4 fragColor;		

void main(void) {
    gl_PointSize = 1.0;

    vec2 tex = aVertexPosition.xy;

    vec2 point = texture2D(uTexSamp_Points, tex).rg;
    vec4 color = texture2D(uTexSamp_Colors, tex);

    fragColor = color;
    gl_Position = vec4(point.xy, 0.0, 1.0);
}
`;