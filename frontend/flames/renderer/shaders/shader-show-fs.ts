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

float log10(float val) {
   return log(val) / 2.30258509299; // log(10)
}

void main(void) {
  vec3 colorTexel = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).rgb;
  float x = texture2D(uTexSamp, gl_FragCoord.xy / <%= RESOLUTION %>).a;
  float swarmSizeScl = float(256 * 256) / (<%= SWARM_SIZE %> * <%= SWARM_SIZE %>);
  float resolutionScl = float(512) / (<%= RESOLUTION %>);
  
  float _whiteLevel = <%= WHITE_LEVEL %>;
  
  // log scale
  float _r, _g, _b, _intensity;
  { 
    float _k1 = float( <%= K1 %> );
    float _k2 = float( <%= K2 %> );
    float _bgGlow = float( <%= BG_GLOW %> );
    float _logScale = swarmSizeScl * (_k1 * log10(1.0 + x * _k2) + _bgGlow / (x + 1.0)) / (_whiteLevel * x) / resolutionScl;
    _r = _logScale * colorTexel.r * float( <%= BALANCE_RED %> );
    _g = _logScale * colorTexel.g * float( <%= BALANCE_GREEN %> );
    _b = _logScale * colorTexel.b * float( <%= BALANCE_BLUE %> );
    _intensity = _logScale * x * _whiteLevel;
  }
  
  float r, g, b, alpha;
  // gamma correction
  {
    float _gammaParam = float( <%= GAMMA %> );
    float _gammaThreshold = float( <%= GAMMA_THRESHOLD %> );
    float _alphaAdjust = float( <%= ALPHA_ADJUST %> );
    
    float _gamma = (_gammaParam == 0.0) ? 0.0 : 1.0 / _gammaParam;
    float _vibrancy = float( <%= VIBRANCY %> );
    float _inverseVib = (1.0 - _vibrancy);
  
    float _sclGamma = 0.0;
    if (_gammaThreshold != 0.0) {
      _sclGamma = pow(_gammaThreshold, _gamma - 1.0);
    }
  
    if (_intensity <= _gammaThreshold) {
      float frac = _intensity / _gammaThreshold;
      alpha = (1.0 - frac) * _intensity * _sclGamma + frac * pow(_intensity, _gamma);
    }
    else {
      alpha = pow(_intensity, _gamma);
    }
    float _alphaScl = _vibrancy * alpha / _intensity * _alphaAdjust;  
  
    if (_inverseVib > 0.0) {
      r = _alphaScl * _r + _inverseVib * pow(_r, _gamma) / 256.0;
      g = _alphaScl * _g + _inverseVib * pow(_g, _gamma) / 256.0;
      b = _alphaScl * _b + _inverseVib * pow(_b, _gamma) / 256.0;
    }
    else {
      r = _alphaScl * _r;
      g = _alphaScl * _g;
      b = _alphaScl * _b;
    }
    alpha = _alphaScl;
  }
  
  bool _withAlpha = <%= WITH_ALPHA %>;

  vec3 col = vec3(r, g, b);  
  gl_FragColor = vec4(col, _withAlpha ? alpha : 1.0) * 256.0;  
}
`;