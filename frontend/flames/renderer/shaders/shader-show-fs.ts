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
 */
export const shader_show_fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexSamp;
uniform float frames;
uniform float brightness;

void main(void) {
  vec3 colorTexel = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgb;
  float x = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).a;
  float swarmSizeScl = float(256 * 256) / (<%= SWARM_SIZE %> * <%= SWARM_SIZE %>);
  float resolutionScl = float(512 * 512) / (<%= RESOLUTION %> * <%= RESOLUTION %>);
  
  float _brightness = <%= BRIGHTNESS %>;
  float _contrast =  <%= CONTRAST %>;
  
  float _gamma = <%= GAMMA %>;
  float _gammaThreshold = <%= GAMMA_THRESHOLD %> * 10.0 + 0.1;
  float gammaInv = 1.0 / _gamma;
   
  float logScale = 2.0 * swarmSizeScl / resolutionScl * _brightness * _contrast * log(x * _contrast) / (log(x) * frames);

  float r = (pow(colorTexel.r, gammaInv)+colorTexel.r * _gammaThreshold) * logScale * <%= BALANCE_RED %>;
  float g = (pow(colorTexel.g, gammaInv)+colorTexel.g * _gammaThreshold) * logScale * <%= BALANCE_GREEN %>;
  float b = (pow(colorTexel.b, gammaInv)+colorTexel.b * _gammaThreshold) * logScale * <%= BALANCE_BLUE %>;

  vec3 col = vec3(r, g, b);  
  gl_FragColor = vec4(col, 1.0);  
}
`;