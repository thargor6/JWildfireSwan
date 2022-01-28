export const shader_points_vs = `
attribute vec3 aVertexPosition;

uniform sampler2D uTexSamp_Points;
uniform sampler2D uTexSamp_Colors;
			
uniform float time;
			
varying vec4 fragColor;		

void main(void) {
    gl_PointSize = 1.0;

    vec2 tex = aVertexPosition.xy;

    vec2 point = texture2D(uTexSamp_Points, tex).rg;
    vec4 color = texture2D(uTexSamp_Colors, tex);

    fragColor = color;
    // TODO camera here!
    float _px = point.x;
    float _py = point.y;
    
    float alpha = 3.1415 / 6.0 + time * 0.1;
    float zoom = 0.75;
    float _cx = _px * zoom * sin(alpha) + _py * zoom * cos(alpha);
    float _cy = -_px * zoom * cos(alpha) + _py * zoom * sin(alpha);
    
    gl_Position = vec4(_cx, _cy, 0.0, 1.0);
}
`;