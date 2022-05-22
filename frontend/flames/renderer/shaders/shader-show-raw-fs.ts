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
 Fragment shader to display raw texture information.
 Based on the code originally created by Richard Assar ( https://github.com/richardassar/ElectricSheep_WebGL )
 */
export const shader_show_raw_fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexSamp;
uniform sampler2D pTexSamp;
uniform sampler2D gradTexSamp;
uniform sampler2D motionBlurTimeSamp;
uniform int displayMode;

void main(void) {
  // raw coordinates
  if(displayMode==0) {
    vec3 texel = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgb;
    gl_FragColor = vec4(texel, 1.0);
  }
  // gradient
  else if(displayMode==1) {
    vec2 tex = vec2(gl_FragCoord.x / <%= RESOLUTION %>, 0.5);
    vec3 clr = texture2D(gradTexSamp, tex).rgb;
    gl_FragColor = vec4(clr, 1.0);
  }
  // motion blur time
  else if(displayMode==2) {
    vec2 tex = vec2(gl_FragCoord.xy / <%= RESOLUTION %>);
    vec3 clr = texture2D(motionBlurTimeSamp, tex).rrr;
    gl_FragColor = vec4(clr, 1.0);
  }  
   // float a = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).a;
   //  gl_FragColor = vec4(a, a, a, 1.0);
   // gl_FragColor = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgba;
}
`;