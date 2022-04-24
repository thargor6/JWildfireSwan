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

/**
 Fragment shader to calculate inside an iteration.
 Based on the code originally created by Richard Assar ( https://github.com/richardassar/ElectricSheep_WebGL )
 */
export const shader_comp_col_fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexSamp;
uniform sampler2D pTexSamp;
uniform sampler2D gradTexSamp;
uniform sampler2D motionBlurTimeSamp;
uniform float seed;
uniform float seed2;
uniform float seed3;

// Rand
/*
float rand(vec2 co) {
return fract(sin(dot(co.xy, vec2(12.9898 * seed, 78.233 * seed))) * 43758.5453);
}
*/

void main(void) {
  vec2 tex = gl_FragCoord.xy / <%= RESOLUTION %>;
  vec3 col = texture2D(uTexSamp, tex).rgb;
  float color = fract(texture2D(pTexSamp, tex).w);
  float lDiminish = texture2D(motionBlurTimeSamp, tex).y;  
  vec2 gradPos = vec2(color, 0.5);
  vec3 clr = texture2D(gradTexSamp, gradPos).rgb * lDiminish;
  gl_FragColor = vec4(clr, 1.0);
}
`;