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

			// https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
			// Gold Noise ©2015 dcerisano@standard3d.com
			// - based on the Golden Ratio
			// - uniform normalized distribution
			// - fastest static noise generator function (also runs at low precision)
			// - use with indicated seeding method. 
			
			float PHI = 1.61803398874989484820459;  // Φ = Golden Ratio   
			
			float gold_noise(in vec2 xy, in float seed){
				   float r = fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
				   if( r < 0.0) return  -r; else return r;
			}

			
			// Rand
			float rand(vec2 co) {
			    float r = fract(sin(dot(co, vec2(12.9898 * seed, 78.233 * seed))) * 43758.5453);
			     if( r < 0.0) return  -r; else return r;
			}

			float rand2(vec2 co) {
			    float r = fract(sin(dot(co, vec2(12.9898 * seed, 78.233 * seed2))) * 43758.5453);
			     if( r < 0.0) return  -r; else return r;
			}
			
			float rand3(vec2 co) {
			    float r = fract(sin(dot(co, vec2(12.9898 * seed, 78.233 * seed3))) * 43758.5453);
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
				
				else  {		
                  //  point = vec2(point.x * 0.5, point.y * 0.5 - 1.0);
                    
                    float amount = 0.25 + time * 0.1;
                  
                       
                     float r = (gold_noise(tex, seed) + rand2(tex)) * (PI + PI);
                     float sina = sin(r);
                     float cosa = cos(r);
                     float r2 = amount * gold_noise(tex, seed3);
                     point.x = r2 * cosa + 0.5;
                     point.y = r2 * sina - 0.5;

				} 


				//l = length(point);
				//point = exp(point.x - 1.0) * vec2(cos(l * point.y), sin(l * point.y));

                 point.y += 0.15;


				gl_FragColor = vec4(point, 0.0, 1.0);
			}
			`;