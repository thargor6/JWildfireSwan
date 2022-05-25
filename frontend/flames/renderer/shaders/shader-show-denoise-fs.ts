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
 Applies a denoising filter which is based on glslSmartDeNoise
 by BrutPitt: https://github.com/BrutPitt/glslSmartDeNoise/blob/master/Shaders/frag.glsl
 */
export const shader_show_with_denoiser_fs = `
#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uTexSamp;
uniform float frames;
uniform float brightness;


float log10(float val) {
   return log(val) / 2.30258509299; // log(10)
}

vec4 getColor(vec2 uv) {
  float swarmSizeScl = float(256 * 256) / (<%= SWARM_SIZE %> * <%= SWARM_SIZE %>);
  float resolutionScl = float(512 * 512) / (<%= RESOLUTION %> * <%= RESOLUTION %>);
  float _whiteLevel = <%= WHITE_LEVEL %>;
    
  vec3 colorTexel = texture2D(uTexSamp, uv).rgb;
  float x = texture2D(uTexSamp, uv).a;

  
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
  r = min(max(r, 0.0), 1.0);
  g = min(max(g, 0.0), 1.0);
  b = min(max(b, 0.0), 1.0);
  alpha = min(max(alpha, 0.0), 1.0);
    
  vec3 col = vec3(r, g, b);  
    
  bool _withAlpha = <%= WITH_ALPHA %>;

  return vec4(col, _withAlpha ? alpha : 1.0);  
}

#define INV_SQRT_OF_2PI 0.39894228040143267793994605993439  // 1.0/SQRT_OF_2PI
#define INV_PI          0.31830988618379067153776752674503
#define MAX_LOOP 256

float round(float v) {
 return v<0.0 ? float(int(v-0.5)) : float(int(v+0.5));
}

// adopted glslSmartDeNoise by BrutPitt
// https://github.com/BrutPitt/glslSmartDeNoise/blob/master/Shaders/frag.glsl               
vec4 smartDeNoise(vec2 uv, float sigma, float kSigma, float threshold, vec4 centrPx) {
  float radius = round(kSigma*sigma);
  float radQ = radius * radius;

  float invSigmaQx2 = .5 / (sigma * sigma);      // 1.0 / (sigma^2 * 2.0)
  float invSigmaQx2PI = INV_PI * invSigmaQx2;    // // 1/(2 * PI * sigma^2)

  float invThresholdSqx2 = .5 / (threshold * threshold);     // 1.0 / (sigma^2 * 2.0)
  float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold;   // 1.0 / (sqrt(2*PI) * sigma)

  float zBuff = 0.0;
  vec4 aBuff = vec4(0.0);
  vec2 d;
  
  d.x=-radius;
  for(int x=0;x<MAX_LOOP;x++) {
    if(d.x <= radius) {
      float pt = sqrt(radQ-d.x*d.x);       // pt = yRadius: have circular trend
      d.y=-pt;
      for(int y=0;y<MAX_LOOP;y++) { 
        if(d.y <= pt) {
          float blurFactor = exp( -dot(d , d) * invSigmaQx2 ) * invSigmaQx2PI;
          vec4 walkPx = getColor(uv + d/float(<%= RESOLUTION %>));  
          vec4 dC = walkPx-centrPx;
          float deltaFactor = exp( -dot(dC.rgb, dC.rgb) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor; 
          zBuff += deltaFactor;
          aBuff += deltaFactor*walkPx;    
          d.y++;
        }   
        else {
          break;
        }
      }  
      d.x++;
    }
    else {
      break;
    }
  } 
  return aBuff/zBuff;
}

vec4 smartDeNoise_sRGB(vec2 uv, float sigma, float kSigma, float threshold, float invGamma, vec4 rawCentrPx) {
  float radius = round(kSigma*sigma);
  float radQ = radius * radius;

  float invSigmaQx2 = .5 / (sigma * sigma);      // 1.0 / (sigma^2 * 2.0)
  float invSigmaQx2PI = INV_PI * invSigmaQx2;    // // 1/(2 * PI * sigma^2)

  float invThresholdSqx2 = .5 / (threshold * threshold);     // 1.0 / (sigma^2 * 2.0)
  float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold;   // 1.0 / (sqrt(2*PI) * sigma)

  float zBuff = 0.0;
  vec4 aBuff = vec4(0.0);
  vec2 d;
  vec4 centrPx = pow(rawCentrPx, vec4(invGamma));
  
  d.x=-radius;
  for(int x=0;x<MAX_LOOP;x++) {
    if(d.x <= radius) {
      float pt = sqrt(radQ-d.x*d.x);       // pt = yRadius: have circular trend
      d.y=-pt;
      for(int y=0;y<MAX_LOOP;y++) { 
        if(d.y <= pt) {         
          float blurFactor = exp( -dot(d , d) * invSigmaQx2 ) * invSigmaQx2PI;
          vec4 walkPx = getColor(uv + d/float(<%= RESOLUTION %>)); 
          vec4 dC = pow(walkPx, vec4(invGamma))-centrPx;
          float deltaFactor = exp( -dot(dC, dC) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor;
          zBuff += deltaFactor;
          aBuff += deltaFactor*walkPx;    
          d.y++;
        }   
        else {
          break;
        }
      }  
      d.x++;
    }
    else {
      break;
    }
  } 
  return aBuff/zBuff;
}

vec4 rgb2hsl( in vec4 c ){
  float h = 0.0;
  float s = 0.0;
  float l = 0.0;
  float r = c.r;
  float g = c.g;
  float b = c.b;
  float cMin = min( r, min( g, b ) );
  float cMax = max( r, max( g, b ) );

  l = ( cMax + cMin ) / 2.0;
  if ( cMax > cMin ) {
    float cDelta = cMax - cMin;
        
        //s = l < .05 ? cDelta / ( cMax + cMin ) : cDelta / ( 2.0 - ( cMax + cMin ) ); Original
    s = l < .0 ? cDelta / ( cMax + cMin ) : cDelta / ( 2.0 - ( cMax + cMin ) );
        
    if ( r == cMax ) {
      h = ( g - b ) / cDelta;
    } else if ( g == cMax ) {
      h = 2.0 + ( b - r ) / cDelta;
    } else {
      h = 4.0 + ( r - g ) / cDelta;
    }

    if ( h < 0.0) {
      h += 6.0;
    }
    h = h / 6.0;
  }
  return vec4( h, s, l, c.a );
}

vec4 smartDeNoise_HSL(vec2 uv, float sigma, float kSigma, float threshold, vec4 rawCentrPx) {
  float radius = round(kSigma*sigma);
  float radQ = radius * radius;

  float invSigmaQx2 = .5 / (sigma * sigma);      // 1.0 / (sigma^2 * 2.0)
  float invSigmaQx2PI = INV_PI * invSigmaQx2;    // // 1/(2 * PI * sigma^2)

  float invThresholdSqx2 = .5 / (threshold * threshold);     // 1.0 / (sigma^2 * 2.0)
  float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold;   // 1.0 / (sqrt(2*PI) * sigma)

  float zBuff = 0.0;
  vec4 aBuff = vec4(0.0);
  vec4 centrHSL = rgb2hsl(rawCentrPx);
  vec2 d;  
  d.x=-radius;
  for(int x=0;x<MAX_LOOP;x++) {
    if(d.x <= radius) {
      float pt = sqrt(radQ-d.x*d.x);       // pt = yRadius: have circular trend
      d.y=-pt;
      for(int y=0;y<MAX_LOOP;y++) { 
        if(d.y <= pt) {         
          float blurFactor = exp( -dot(d , d) * invSigmaQx2 ) * invSigmaQx2PI;
          vec4 walkPx = getColor(uv + d/float(<%= RESOLUTION %>)); 
          vec4 walkPxHSL = rgb2hsl(walkPx);
          vec4 dC = walkPxHSL - centrHSL;
          float deltaFactor = exp( -dot(dC.xz, dC.xz) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor;
          zBuff += deltaFactor;
          aBuff += deltaFactor*walkPx;    
          d.y++;
        }   
        else {
          break;
        }
      }  
      d.x++;
    }
    else {
      break;
    }
  } 
  return aBuff/zBuff;
}

float luminance(vec4 col) {
  return 0.2126*col.r + 0.7152*col.g + 0.0722*col.b;
}

vec4 smartDeNoise_lum(vec2 uv, float sigma, float kSigma, float threshold, vec4 rawCentrPx) {
  float radius = round(kSigma*sigma);
  float radQ = radius * radius;

  float invSigmaQx2 = .5 / (sigma * sigma);      // 1.0 / (sigma^2 * 2.0)
  float invSigmaQx2PI = INV_PI * invSigmaQx2;    // // 1/(2 * PI * sigma^2)

  float invThresholdSqx2 = .5 / (threshold * threshold);     // 1.0 / (sigma^2 * 2.0)
  float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold;   // 1.0 / (sqrt(2*PI) * sigma)

  float zBuff = 0.0;
  vec4 aBuff = vec4(0.0);
  float centrLum = luminance(rawCentrPx);
  vec2 d;  
  d.x=-radius;
  for(int x=0;x<MAX_LOOP;x++) {
    if(d.x <= radius) {
      float pt = sqrt(radQ-d.x*d.x);       // pt = yRadius: have circular trend
      d.y=-pt;
      for(int y=0;y<MAX_LOOP;y++) { 
        if(d.y <= pt) {         
          float blurFactor = exp( -dot(d , d) * invSigmaQx2 ) * invSigmaQx2PI;
          vec4 walkPx = getColor(uv + d/float(<%= RESOLUTION %>)); 
          float dC = luminance(walkPx) - centrLum;
          float deltaFactor = exp( -(dC * dC) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor;
          zBuff += deltaFactor;
          aBuff += deltaFactor*walkPx;    
          d.y++;
        }   
        else {
          break;
        }
      }  
      d.x++;
    }
    else {
      break;
    }
  } 
  return aBuff/zBuff;
}

float linearLuminance(vec4 col) {
  return (col.r + col.g + col.b) / 3.0;   
}

vec4 smartDeNoise_linearLum(vec2 uv, float sigma, float kSigma, float threshold, vec4 rawCentrPx) {
  float radius = round(kSigma*sigma);
 
  float radQ = radius * radius;

  float invSigmaQx2 = .5 / (sigma * sigma);      // 1.0 / (sigma^2 * 2.0)
  float invSigmaQx2PI = INV_PI * invSigmaQx2;    // // 1/(2 * PI * sigma^2)

  float invThresholdSqx2 = .5 / (threshold * threshold);     // 1.0 / (sigma^2 * 2.0)
  float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold;   // 1.0 / (sqrt(2*PI) * sigma)

  float zBuff = 0.0;
  vec4 aBuff = vec4(0.0);
  float centrLum = linearLuminance(rawCentrPx);
  vec2 d;  
  d.x=-radius;
  for(int x=0;x<MAX_LOOP;x++) {
    if(d.x <= radius) {
      float pt = sqrt(radQ-d.x*d.x);       // pt = yRadius: have circular trend
      d.y=-pt;
      for(int y=0;y<MAX_LOOP;y++) { 
        if(d.y <= pt) {         
          float blurFactor = exp( -dot(d , d) * invSigmaQx2 ) * invSigmaQx2PI;
          vec4 walkPx = getColor(uv + d/float(<%= RESOLUTION %>)); 
          float dC = linearLuminance(walkPx) - centrLum;
          float deltaFactor = exp( -(dC * dC) * invThresholdSqx2) * invThresholdSqrt2PI * blurFactor;
          zBuff += deltaFactor;
          aBuff += deltaFactor*walkPx;    
          d.y++;
        }   
        else {
          break;
        }
      }  
      d.x++;
    }
    else {
      break;
    }
  } 
  return aBuff/zBuff;
}

#define SMART_DENOISE 1
#define SMART_DENOISE_SRGB 2
#define SMART_DENOISE_HSL 3 
#define SMART_DENOISE_LUM 4
#define SMART_DENOISE_LUM_LINEAR 5

void main(void) {
  float uSlider = float( <%= DN_SPLITTER %> );
  float uSigma = float( <%= DN_SIGMA %> );
  float uKSigma = float( <%= DN_KSIGMA %> );
  float uThreshold = float( <%= DN_THRESHOLD %> );
  float uMix = float( <%= DN_MIX %> );
  float uInvGamma = float( <%= DN_INV_GAMMA %> );
  int dnType = int(<%= DN_TYPE %>);
  
  float slide = uSlider <= -1.0 ? -1.0 : uSlider *.5 + .5;
  float szSlide = 0.0025;
  vec2 uv = gl_FragCoord.xy / float(<%= RESOLUTION %>);
  
  vec4 centrPx = getColor(uv);
   
  vec4 c;
  if(dnType==SMART_DENOISE_LUM_LINEAR) {
    c = smartDeNoise_linearLum(uv, uSigma, uKSigma, uThreshold, centrPx);
  }
  else if(dnType==SMART_DENOISE_LUM) {
    c = smartDeNoise_lum(uv, uSigma, uKSigma, uThreshold, centrPx);
  }
  else if(dnType==SMART_DENOISE_HSL) {
    c = smartDeNoise_HSL(uv, uSigma, uKSigma, uThreshold, centrPx);
  }
  else if(dnType==SMART_DENOISE_SRGB) {
    c = smartDeNoise_sRGB(uv, uSigma, uKSigma, uThreshold, uInvGamma, centrPx);
  }
  else {  // SMART_DENOISE
    c = smartDeNoise(uv, uSigma, uKSigma, uThreshold, centrPx);
  }
  
  float mix = min(max(0.0, uMix), 1.0);
  if(mix>0.0) {
    c = max(min(c, 1.0),0.0);
    c = ( 1.0 - mix ) * c + mix * centrPx;
  }
  if(!  <%= WITH_ALPHA %> ) {
    c.w = 1.0;
  }
  gl_FragColor = ( uv.x < slide-szSlide ? centrPx : (uv.x > slide+szSlide ? c : vec4(1.0)) ) * 256.0;        
}
`;