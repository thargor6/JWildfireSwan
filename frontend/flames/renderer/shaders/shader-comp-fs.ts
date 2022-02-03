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
 Fragment shader for point iteration.
 This is just an example for demonstration/understanding, it is not used in the actual application.
 It is taken from the code originally created by Richard Assar ( https://github.com/richardassar/ElectricSheep_WebGL )
 */
export const shader_comp_fs = `
  #ifdef GL_ES
				precision highp float;
			#endif

			uniform sampler2D uTexSamp;
			uniform float seed;
			uniform float seed2;
			uniform float seed3;
			uniform float time;

			const float PI = 3.141592;
			
			// Rand
			float rand(vec2 co) {
			    float r = fract(sin(dot(co, vec2(12.9898 * seed, 78.233 * seed))) * 43758.5453);
			     if( r < 0.0) return  -r; else return r;
			}

			// COSH Function (Hyperbolic Cosine) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
			float cosh(float val)
			{
				float tmp = exp(val);
				float cosH = (tmp + 1.0 / tmp) / 2.0;
				return cosH;
			}

			// TANH Function (Hyperbolic Tangent) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
			float tanh(float val)
			{
				float tmp = exp(val);
				float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
				return tanH;
			}

			// SINH Function (Hyperbolic Sine) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
			float sinh(float val)
			{
				float tmp = exp(val);
				float sinH = (tmp - 1.0 / tmp) / 2.0;
				return sinH;
			}

			//float r = length(point);
			//float a = atan(point.x/point.y);
			//float b = atan(point.y/point.x);

			//point = vec2(point.x * 0.5 - 0.5, point.y * 0.5 - 0.5);
			//point = 1.0 / (r * r) * point;
			//point = exp(point.x - 1.0) * vec2(cos(3.14 * point.y), sin(3.14 * point.y));
			//point = vec2(cos(3.14 * point.x) * cosh(point.y), -sin(3.14 * point.x) * sinh(point.y));
			//point = vec2(sin(point.x), sin(point.y));
			//point = vec2(point.x * sin(r * r) - point.y * cos(r * r), point.x * cos(r * r) + point.y * sin(r * r));
			//point = 1.0 / r * vec2(cos(a) + sin(r), sin(a) - cos(r));
			//point = r * vec2(sin(a * r), -cos(a * r));
			//point = a / PI * vec2(sin(PI * r), cos(PI * r));
			//point = pow(r, sin(a)) * vec2(cos(a), sin(a));
			//point = 1.0 / r * vec2((point.x - point.y) * (point.x + point.y), 2.0 * point.x * point.y);
			//point = vec2(sin(point.x)/cos(point.y), tan(point.y));

			void main(void) {
				vec2 tex = gl_FragCoord.xy / <%= RESOLUTION %>;

				vec2 point = texture2D(uTexSamp, tex).xy;

				float l = length(point);
				float a = atan(point.x / point.y);
				float b = atan(point.y / point.x);
				float M_PI = 3.141592653;

				float r = rand(tex);

				if(r < 0.25) {
                    point = vec2(point.x * 0.5-0.5, point.y * 0.5  /* + sin(time)*0.25 */);
				} else if(r < 0.45) {
					point = vec2(point.x * 0.5 + 1.0 /* + sin(time)*0.25*/, point.y * 0.5 );
				} 
			   else if(r < 0.75) {
					point = point = 1.0 / (r * r) * point;
				} 
				
				//l = length(point);
				//point = exp(point.x - 1.0) * vec2(cos(l * point.y), sin(l * point.y));

                 point.y += 0.15;


				gl_FragColor = vec4(point, 0.0, 1.0);
			}
			`;