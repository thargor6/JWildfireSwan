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

/* 
  vec3 colorTexel = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgb;
  float alpha = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).a;
  vec3 col = colorTexel * log(alpha) / (log(alpha) * frames);
  float brightnessScl = 1.0 / brightness;
  col = vec3(pow(col.r, brightnessScl), pow(col.g, brightnessScl), pow(col.b, brightnessScl)); // Brightness correction
  gl_FragColor = vec4(col, 1.0);
*/

void main(void) {
  vec3 colorTexel = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgb;
  float x = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).a;
  float swarmSizeScl = float(256 * 256) / (<%= SWARM_SIZE %> * <%= SWARM_SIZE %>);
  float resolutionScl = float(512 * 512) / (<%= RESOLUTION %> * <%= RESOLUTION %>);
  
  float _brightness = <%= BRIGHTNESS %>;
  float _contrast = <%= CONTRAST %>;
   
  float logScale = 2.0 * swarmSizeScl / resolutionScl * _brightness * _contrast * log(x / _contrast) / (log(x) * frames);
 
  float r = colorTexel.r * logScale * <%= BALANCE_RED %>;
  float g = colorTexel.g * logScale * <%= BALANCE_GREEN %>;
  float b = colorTexel.b * logScale * <%= BALANCE_BLUE %>;

  float foregroundOpacity = <%= FOREGROUND_OPACITY %>;
  float gamma = <%= GAMMA %>;
  float vibrancy = <%= VIBRANCY %>;
  float gammaThreshold = <%= GAMMA_THRESHOLD %>;
  float _alphaScale = 1.0 - atan(3.0 * (foregroundOpacity - 1.0)) / 1.25;
  float _gamma = (gamma == 0.0) ? gamma : 1.0 / gamma;
  float _vib = (vibrancy < 0.0 ? 0.0 : vibrancy > 1.0 ? 1.0 : vibrancy);
  float _inverseVib = 1.0 - _vib;
  float _sclGamma = 0.0;
  if (gammaThreshold != 0.0) {
    _sclGamma = pow(gammaThreshold, _gamma - 1.0);
  }
  float _intensity = logScale / <%= WHITE_LEVEL %>;

  float _alpha;
  if (_intensity <= gammaThreshold) {
    float _frac = _intensity / gammaThreshold;
    _alpha = (1.0 - _frac) * _intensity * _sclGamma + _frac * pow(_intensity, _gamma);
  }
  else {
    _alpha = pow(_intensity, _gamma);
  }
  _alpha *= _alphaScale;
  
  float _gammaLogScl = _vib * _alpha;
  float br = colorTexel.r * <%= BALANCE_RED %>;
  float bg = colorTexel.g * <%= BALANCE_GREEN %>;
  float bb = colorTexel.b * <%= BALANCE_BLUE %>;
  float finalRed = _gammaLogScl * br + _inverseVib * pow(colorTexel.r, _gamma);
  float finalGreen = _gammaLogScl * bg + _inverseVib * pow(bg, _gamma);
  float finalBlue = _gammaLogScl * bb + _inverseVib * pow(bb, _gamma);
  vec3 col = vec3(finalRed, finalGreen, finalBlue);
  
   //vec3 col = vec3(r, g, b);
  gl_FragColor = vec4(col, 1.0);
}
`;