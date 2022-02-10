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
 Fragment shader to calculate the final colors.
 Based on the code originally created by Richard Assar ( https://github.com/richardassar/ElectricSheep_WebGL )
 */
export const shader_show_fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexSamp;
uniform float frames;
uniform float brightness;

void main(void) {
  float swarmSizeScl = float( <%= RESOLUTION %> * <%= RESOLUTION %> ) / (512.0 * 512.0);  
  vec3 colorTexel = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgb;
  float alpha = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).a;
  vec3 col = colorTexel * log(alpha) / (log(alpha) * frames);
  float brightnessScl = 1.0 / brightness / swarmSizeScl;
  col = vec3(pow(col.r, brightnessScl), pow(col.g, brightnessScl), pow(col.b, brightnessScl)); // Brightness correction
  gl_FragColor = vec4(col, 1.0);
}
`;