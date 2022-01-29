export const shader_show_fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexSamp;
uniform float frames;
uniform float brightness;

void main(void) {
vec3 colorTexel = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgb;
float alpha = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).a;

vec3 col = colorTexel * log(alpha) / (log(alpha) * frames);

col = vec3(pow(col.r, 1.0 / brightness), pow(col.g, 1.0 / brightness * 0.5), pow(col.b, 1.0 / brightness)); // Brightness correction

gl_FragColor = vec4(col, 1.0);
}
`;