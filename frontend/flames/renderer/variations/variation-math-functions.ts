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

export const FUNC_ACOSH = 'acosh'
export const FUNC_COSH = 'cosh'
export const FUNC_ERF = 'erf'
export const FUNC_HYPOT = 'hypot'
export const FUNC_J1 = 'j1'
export const FUNC_JACOBI_ELLIPTIC = 'jacobi_elliptic'
export const FUNC_LOG10 = 'log10'
export const FUNC_MODULO = 'modulo'
export const FUNC_RINT = 'rint'
export const FUNC_ROUND = 'round'
export const FUNC_SAFEDIV = 'safediv'
export const FUNC_SGN = 'sgn'
export const FUNC_SINH = 'sinh'
export const FUNC_SQRT1PM1 = 'sqrt1pm1'
export const FUNC_TANH = 'tanh'
export const FUNC_TRUNC = 'trunc'
export const LIB_COMPLEX = 'lib_complex'
export const LIB_FAST_NOISE_BASE = 'lib_fast_noise_base'
export const LIB_FAST_NOISE_VALUE_NOISE = 'lib_fast_noise_value_noise'

// https://www.shaderific.com/glsl-functions

export class VariationMathFunctions {
    static functions = new Map<string, string>()

    static registerFunction(name: string, code: string) {
        this.functions.set(name, code)
    }

    static getCode(name: string): string {
        return this.functions.get(name)!
    }

    static init() {
        this.registerFunction(LIB_COMPLEX,
            `
            struct Complex {
              float per_fix;
              float re;
              float im;
              float save_re;
              float save_im;
            };
            
           void Complex_Init(inout Complex c, float Rp, float Ip) {
              c.re = Rp;
              c.im = Ip;
              c.save_re = 0.0;
              c.save_im = 0.0;
              c.per_fix = 0.0;  
            }
            
            float Complex_Mag2(Complex c) {
              return c.re * c.re + c.im * c.im;
            }
  
            float Complex_MagInv(Complex c) {
              float M2 = Complex_Mag2(c);
              return (M2 < EPSILON ? 1.0 : 1.0 / M2);
            }
              
            void Complex_Recip(inout Complex c) {
              float mi = Complex_MagInv(c);
              c.re = c.re * mi;
              c.im = -c.im * mi;
            }
            
            void Complex_Dec(inout Complex c) {
              c.re -= 1.0;
            }
            
            void Complex_Inc(inout Complex c) {
              c.re += 1.0;
            }
            
            void Complex_Neg(inout Complex c) {
              c.re = -c.re;
              c.im = -c.im;
            }
            
            void Complex_Div(inout Complex c, Complex zz) {
              float r2 = c.im * zz.im + c.re * zz.re;
              float i2 = c.im * zz.re - c.re * zz.im;
              float M2 = Complex_MagInv(zz);
              c.re = r2 * M2;
              c.im = i2 * M2;
            }
              
            void Complex_DivR(inout Complex T,Complex zz) {
              float r2 = zz.im * T.im + zz.re * T.re;
              float i2 = zz.im * T.re - zz.re * T.im;
              float M2 = Complex_MagInv(T);
              T.re = r2 * M2;
              T.im = i2 * M2;
            } 
            
            void Complex_Copy(inout Complex c, Complex zz) {
              c.re = zz.re;
              c.im = zz.im;
            }
            
            float Complex_Mag2eps(Complex c) {
               return c.re * c.re + c.im * c.im + EPSILON;
            }
            
            float Complex_Arg(Complex c) {
              return (c.per_fix + atan2(c.im, c.re));
            }
            
            void Complex_Log(inout Complex c) {
              Complex L_eps;
              Complex_Init(L_eps, 0.5 * log(Complex_Mag2eps(c)), Complex_Arg(c));
              Complex_Copy(c, L_eps);
            }
            
            void Complex_Scale(inout Complex c, float mul) {
              c.re = c.re * mul;
              c.im = c.im * mul;
            }
              
            void Complex_AtanH(inout Complex c) {
              Complex D;
              Complex_Init(D, c.re, c.im);
              Complex_Dec(D);
              Complex_Neg(D);
              Complex_Inc(c);
              Complex_Div(c, D);
              Complex_Log(c);
              Complex_Scale(c, 0.5);
            }
            
            void Complex_AcotH(inout Complex c) {
               Complex_Recip(c);
               Complex_AtanH(c);
            }
            
            void Complex_Flip(inout Complex c) {
              float r2 = c.im;
              float i2 = c.re;
              c.re = r2;
              c.im = i2;
            }
              
            void Complex_Sqr(inout Complex c) {
              float r2 = c.re * c.re - c.im * c.im;
              float i2 = 2.0 * c.re * c.im;
              c.re = r2;
              c.im = i2;
            }  
            
            void Complex_Add(inout Complex c, Complex zz) {
              c.re += zz.re;
              c.im += zz.im;
            }
            
            void Complex_Sub(inout Complex c, Complex zz) {
              c.re -= zz.re;
              c.im -= zz.im;
            }
            
            void Complex_Mul(inout Complex c, Complex zz) {
               if (zz.im == 0.0) {
                  Complex_Scale(c, zz.re);
               }
               else {
                 float  r2 = c.re * zz.re - c.im * zz.im;
                 float  i2 = c.re * zz.im + c.im * zz.re;
                 c.re = r2;
                 c.im = i2;
               }
            }
                
            void Complex_One(inout Complex c) {
              c.re = 1.0;
              c.im = 0.0;
            }
            
            void Complex_Conj(inout Complex c) {
              c.im = -c.im;
            }
                        
            float Complex_Radius(Complex c) {
               return sqrt(c.re*c.re + c.im*c.im);
            }
            
            void Complex_Sqrt(inout Complex c) {
              float Rad = Complex_Radius(c);
              float sb = (c.im < 0.0) ? -1.0 : 1.0;
              c.im = sb * sqrt(0.5 * (Rad - c.re));
              c.re = sqrt(0.5 * (Rad + c.re));
              if (c.per_fix < 0.0)
                Complex_Neg(c);
            }
            
            void Complex_ToP(Complex c, inout Complex dst) {
              Complex_Init(dst, Complex_Radius(c), Complex_Arg(c));
            }
              
            void Complex_UnP(Complex c, inout Complex dst) {
              Complex_Init(dst, c.re * cos(c.im), c.re * sin(c.im));
            }  
              
            void Complex_Pow(inout Complex c, float exp) {
                if (exp == 0.0) {
                  Complex_One(c);
                  return;
                }
                float ex = abs(exp);
                if (exp < 0.0) {
                  Complex_Recip(c);
                }
                if (ex == 0.5) {
                  Complex_Sqrt(c);
                  return;
                }
                if (ex == 1.0) {
                  return;
                }
                if (ex == 2.0) {
                  Complex_Sqr(c);
                  return;
                }
                // In general we need sin, cos etc
                Complex PF;
                Complex_ToP(c, PF);
                PF.re = pow(PF.re, ex);
                PF.im = PF.im * ex;
           
                Complex PFU;
                Complex_UnP(PF, PFU);
                Complex_Copy(c, PFU);
              }

              void Complex_AsinH(inout Complex c) {
                Complex D;
                Complex_Init(D, c.re, c.im);
                Complex_Sqr(D);
                Complex_Inc(D);
                Complex_Pow(D, 0.5);
                Complex_Add(c, D);
                Complex_Log(c);
              }
                
              void Complex_AsecH(inout Complex c) {
                Complex_Recip(c);
                Complex_AsinH(c);
              }
                
              void Complex_Exp(inout Complex c) {
                c.re = exp(c.re);
                Complex unp;
                Complex_UnP(c, unp);
                Complex_Copy(c, unp);
              }

              void Complex_AcosH(inout Complex c) {
                Complex D;
                Complex_Init(D, c.re, c.im);
                Complex_Sqr(D);
                Complex_Dec(D);
                Complex_Pow(D, 0.5);
                Complex_Add(c, D);
                Complex_Log(c);
              }
                
              void Complex_AcosecH(inout Complex c) {
                Complex_Recip(c);
                Complex_AcosH(c);
              }
                
              void Complex_SinH(inout Complex c) {
                float rr = 0.0;
                float ri = 0.0;
                float er = 1.0;
                c.re = exp(c.re);
                er /= c.re;
                rr = 0.5 * (c.re - er);
                ri = rr + er;
                c.re = cos(c.im) * rr;
                c.im = sin(c.im) * ri;
              }
              
              void Complex_CosH(inout Complex c) {
                float rr = 0.0;
                float ri = 0.0;
                float er = 1.0;
                c.re = exp(c.re);
                er /= c.re;
                rr = 0.5 * (c.re - er);
                ri = rr + er;
                c.re = cos(c.im) * ri;
                c.im = sin(c.im) * rr;
              }
            
              void Complex_Sin(inout Complex c) {
                Complex_Flip(c);
                Complex_SinH(c);
                Complex_Flip(c);
              }
            
              void Complex_Cos(inout Complex c) {
                Complex_Flip(c);
                Complex_CosH(c);
                Complex_Flip(c);
              }
              
              void Complex_Asin(inout Complex c) {
                Complex_Flip(c);
                Complex_AsinH(c);
                Complex_Flip(c);
              }
            
              void Complex_Acos(inout Complex c) {
                Complex_Flip(c);
                Complex_AsinH(c);
                Complex_Flip(c); 
                c.re = (M_PI/2.0) - (c.re);
                c.im = -(c.im); 
              }
            
              void Complex_Atan(inout Complex c) { 
                Complex_Flip(c);
                Complex_AtanH(c);
                Complex_Flip(c);
              }            
            `);
         this.registerFunction(FUNC_ACOSH,
            // ACOSH Function https://runebook.dev/de/docs/javascript/global_objects/math/acosh
            `
                float acosh(float val) {
                  return log(val + sqrt(val * val - 1.0));
                }`);
         this.registerFunction(FUNC_COSH,
             // COSH Function (Hyperbolic Cosine) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
             `
            float cosh(float val) {
              float tmp = exp(val);
              float cosH = (tmp + 1.0 / tmp) / 2.0;
              return cosH;
            }`);
        this.registerFunction(FUNC_HYPOT,
            // most simple form for now:
            `
            float hypot(float x, float y) {
              return sqrt(x * x + y * y);
			}`);

      this.registerFunction(LIB_FAST_NOISE_BASE, `
        int X_PRIME = 1619;
        int Y_PRIME = 31337;
        int Z_PRIME = 6971;
        int W_PRIME = 1013;
        
        #define NOISETYPE_VALUE 0
        #define NOISETYPE_VALUE_FRACTAL 1
        #define NOISETYPE_PERLIN 2
        #define NOISETYPE_PERLIN_FRACTAL 3
        #define NOISETYPE_SIMPLEX 4
        #define NOISETYPE_SIMPLEX_FRACTAL 5
        #define NOISETYPE_CELLULAR 6
        #define NOISETYPE_WHITE_NOISE 7
        #define NOISETYPE_CUBIC 8
        #define NOISETYPE_CUBIC_FRACTAL 9
        
        #define INTERP_LINEAR 0
        #define INTERP_HERMITE 1
        #define INTERP_QUINTIC 2
        
        #define FRACTALTYPE_FBM 0
        #define FRACTALTYPE_BILLOW 1
        #define FRACTALTYPE_RIGID_MULTI 2

        int fastFloor(float f) {
          return f >= 0.0 ? int(f) : int(f - 1.0);
        }
        
        int fastRound(float f) {
          return (f >= 0.0) ? int(f + 0.5) : int(f - 0.5);
        }

        float interpHermiteFunc(float t) {
          return t * t * (3.0 - 2.0 * t);
        }

        float interpQuinticFunc(float t) {
          return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
        }

        float cubicLerp(float a, float b, float c, float d, float t) {
          float p = (d - c) - (a - b);
          return t * t * t * p + t * t * ((a - b) - p) + t * (c - a) + b;
        }
        
        // bitwise operators implementation based on https://gist.github.com/EliCDavis/f35a9e4afb8e1c9ae94cce8f3c2c9b9a
/*
        int OR(int n1, int n2) {
          float v1 = float(n1);
          float v2 = float(n2);
          int byteVal = 1;
          int result = 0;
          for(int i = 0; i < 32; i++){
              bool keepGoing = v1>0.0 || v2 > 0.0;
              if(keepGoing){
                  bool addOn = mod(v1, 2.0) > 0.0 || mod(v2, 2.0) > 0.0;
                  if(addOn){
                      result += byteVal;
                  }
                  v1 = floor(v1 / 2.0);
                  v2 = floor(v2 / 2.0);
                  byteVal *= 2;
              } else {
                  return result;
              }
          }
          return result;
        }
*/
        int XOR(int n1, int n2) {
          float v1 = float(n1);
          float v2 = float(n2);
          int byteVal = 1;
          int result = 0;
          for(int i = 0; i < 32; i++){
              bool keepGoing = v1>0.0 || v2 > 0.0;
              if(keepGoing){
                  bool a = mod(v1, 2.0) > 0.0;
                  bool b = mod(v2, 2.0) > 0.0;
                  bool addOn = (a || b) && (a!=b);
                  if(addOn){
                      result += byteVal;
                  }
                  v1 = floor(v1 / 2.0);
                  v2 = floor(v2 / 2.0);
                  byteVal *= 2;
              } else {
                  return result;
              }
          }
          return result;
        }

        int AND(int n1, int n2){ 
          float v1 = float(n1);
          float v2 = float(n2);
          int byteVal = 1;
          int result = 0;
          for(int i = 0; i < 32; i++){
              bool keepGoing = v1>0.0 || v2 > 0.0;
              if(keepGoing){
                  bool addOn = mod(v1, 2.0) > 0.0 && mod(v2, 2.0) > 0.0;
                  if(addOn){
                      result += byteVal;
                  }
                  v1 = floor(v1 / 2.0);
                  v2 = floor(v2 / 2.0);
                  byteVal *= 2;
              } else {
                  return result;
              }
          }
          return result;
        }
        
/*        
        int AND_16(int n1, int n2) {
          float v1 = float(n1);
          float v2 = float(n2);
        
          int byte_val = 1;
          int result = 0;
        
          for (int i = 0; i < 16; i++){
              if (v1 == 0.0 || v2 == 0.0) {
                  return result;
              }
        
              int both_bytes_1 = int(min(
               mod(v1, 2.0),
               mod(v2, 2.0)
              ));
        
              result += both_bytes_1 * byte_val;
        
              v1 = floor(v1 / 2.0);
              v2 = floor(v2 / 2.0);
        
              byte_val *= 2;
          }
          return result;
        }
*/   
       int RSHIFT(int num, int shifts){
          return int(floor(float(num) / pow(2.0, float(shifts))));
       }
      
       int hash2D(int seed, int x, int y) {
          int hash = seed;
          hash = XOR(hash, X_PRIME * x);
          hash = XOR(hash, Y_PRIME * y);
          hash = hash * hash * hash * 60493;
          hash = XOR(RSHIFT(hash, 13), hash);
          return hash;
        }
        
        int hash3D(int seed, int x, int y, int z) {
          int hash = seed;
          hash = XOR(hash, X_PRIME * x);
          hash = XOR(hash, Y_PRIME * y);
          hash = XOR(hash, Z_PRIME * z);
          hash = hash * hash * hash * 60493;
          hash = XOR(RSHIFT(hash, 13), hash);
          return hash;
        }

        int hash4D(int seed, int x, int y, int z, int w) {
          int hash = seed;
          hash = XOR(hash, X_PRIME * x);
          hash = XOR(hash, Y_PRIME * y);
          hash = XOR(hash, Z_PRIME * z);
          hash = XOR(hash, W_PRIME * w);
          hash = hash * hash * hash * 60493;
          hash = XOR(RSHIFT(hash, 13),hash);
          return hash;
        }
       
        float valCoord2D(int seed, int x, int y) {
          int n = seed;
          n = XOR(n, X_PRIME * x);
          n = XOR(n, Y_PRIME * y);
          return float(n * n * n * 60493) / 2147483648.0;
        }

        float valCoord3D(int seed, int x, int y, int z) {
          int n = seed;
          n = XOR(n, X_PRIME * x);
          n = XOR(n, Y_PRIME * y);
          n = XOR(n, Z_PRIME * z);
          return float(n * n * n * 60493) / 2147483648.0;
        }
        
        float valCoord4D(int seed, int x, int y, int z, int w) {
          int n = seed;
          n = XOR(n, X_PRIME * x);
          n = XOR(n, Y_PRIME * y);
          n = XOR(n, Z_PRIME * z);
          n = XOR(n, W_PRIME * w);
          return float(n * n * n * 60493) / 2147483648.0;
        }
        
        float GRAD_3D_x[16];
        float GRAD_3D_y[16];
        float GRAD_3D_z[16];
        
        void initGRAD_3D() {
          GRAD_3D_x[0] = 1.0; GRAD_3D_x[1] = -1.0; GRAD_3D_x[2] = 1.0; GRAD_3D_x[3] = -1.0;
          GRAD_3D_x[4] = 1.0; GRAD_3D_x[5] = -1.0; GRAD_3D_x[6] = 1.0; GRAD_3D_x[7] = -1.0;
          GRAD_3D_x[8] = 0.0; GRAD_3D_x[9] = 0.0; GRAD_3D_x[10] = 0.0; GRAD_3D_x[11] = 0.0;
          GRAD_3D_x[12] = 1.0; GRAD_3D_x[13] = 0.0; GRAD_3D_x[14] = -1.0; GRAD_3D_x[15] = 0.0;
          
          GRAD_3D_y[0] = 1.0; GRAD_3D_y[1] = 1.0; GRAD_3D_y[2] = -1.0; GRAD_3D_y[3] = -1.0;
          GRAD_3D_y[4] = 0.0; GRAD_3D_y[5] = 0.0; GRAD_3D_y[6] = 0.0; GRAD_3D_y[7] = 0.0;
          GRAD_3D_y[8] = 1.0; GRAD_3D_y[9] = -1.0; GRAD_3D_y[10] = 1.0; GRAD_3D_y[11] = -1.0;
          GRAD_3D_y[12] = 1.0; GRAD_3D_y[13] = -1.0; GRAD_3D_y[14] = 1.0; GRAD_3D_y[15] = -1.0;
          
          GRAD_3D_z[0] = 0.0; GRAD_3D_z[1] = 0.0; GRAD_3D_z[2] = 0.0; GRAD_3D_z[3] = 0.0;
          GRAD_3D_z[4] = 1.0; GRAD_3D_z[5] = 1.0; GRAD_3D_z[6] = -1.0; GRAD_3D_z[7] = -1.0;
          GRAD_3D_z[8] = 1.0; GRAD_3D_z[9] = 1.0; GRAD_3D_z[10] = -1.0; GRAD_3D_z[11] = -1.0;
          GRAD_3D_z[12] = 0.0; GRAD_3D_z[13] = 1.0; GRAD_3D_z[14] = 0.0; GRAD_3D_z[15] = -1.0;
        }


        float gradCoord3D(int seed, int x, int y, int z, float xd, float yd, float zd) {
          int hash = seed;
          hash = XOR(hash, X_PRIME * x);
          hash = XOR(hash, Y_PRIME * y);
          hash = XOR(hash, Z_PRIME * z);
      
          hash = hash * hash * hash * 60493;
          hash = XOR(RSHIFT(hash, 13), hash);
      
          int idx = AND(hash, 15);
          for(int i=0;i<15;i++) {     
            if(i==idx) {
              return xd * GRAD_3D_x[i] + yd * GRAD_3D_y[i] + zd * GRAD_3D_z[i];
            }  
          }
          return xd * GRAD_3D_x[15] + yd * GRAD_3D_y[15] + zd * GRAD_3D_z[15];
      }

      float gradCoord4D(int seed, int x, int y, int z, int w, float xd, float yd, float zd, float wd) {
          int hash = seed;
          hash = XOR(hash, X_PRIME * x);
          hash = XOR(hash, Y_PRIME * y);
          hash = XOR(hash, Z_PRIME * z);
          hash = XOR(hash, W_PRIME * w);
      
          hash = hash * hash * hash * 60493;
          hash = XOR(RSHIFT(hash, 13), hash);
      
          hash = AND(hash, 31);
          float a = yd, b = zd, c = wd;            // X,Y,Z
          int sw = RSHIFT(hash, 3); // OR, DEPENDING ON HIGH ORDER 2 BITS:
          if(sw==1) {  // W,X,Y
            a = wd;
            b = xd;
            c = yd;
          }
          else if(sw==2) {  // Z,W,X
            a = zd;
            b = wd;
            c = xd;
          }
          else { // if(sw==3) // Y,Z,W     
            a = yd;
            b = zd;
            c = wd;   
          }
          return (AND(hash, 4) == 0 ? -a : a) + (AND(hash, 2) == 0 ? -b : b) + (AND(hash, 1) == 0 ? -c : c);
      }

      `);


      this.registerFunction(LIB_FAST_NOISE_VALUE_NOISE, `     
       
        float singleValue(int interp, int seed, float x, float y, float z) {
            int x0 = fastFloor(x);
            int y0 = fastFloor(y);
            int z0 = fastFloor(z);
            int x1 = x0 + 1;
            int y1 = y0 + 1;
            int z1 = z0 + 1;
        
            float xs, ys, zs;
            if(interp==INTERP_HERMITE) {
              xs = interpHermiteFunc(x - float(x0));
              ys = interpHermiteFunc(y - float(y0));
              zs = interpHermiteFunc(z - float(z0));
            }
            else if(interp==INTERP_QUINTIC) {  
              xs = interpQuinticFunc(x - float(x0));
              ys = interpQuinticFunc(y - float(y0));
              zs = interpQuinticFunc(z - float(z0));
            }
            else { // INTERP_LINEAR
              xs = x - float(x0);
              ys = y - float(y0);
              zs = z - float(z0);             
            }
        
            float xf00 = lerp(valCoord3D(seed, x0, y0, z0), valCoord3D(seed, x1, y0, z0), xs);
            float xf10 = lerp(valCoord3D(seed, x0, y1, z0), valCoord3D(seed, x1, y1, z0), xs);
            float xf01 = lerp(valCoord3D(seed, x0, y0, z1), valCoord3D(seed, x1, y0, z1), xs);
            float xf11 = lerp(valCoord3D(seed, x0, y1, z1), valCoord3D(seed, x1, y1, z1), xs);
        
            float yf0 = lerp(xf00, xf10, ys);
            float yf1 = lerp(xf01, xf11, ys);
        
            return lerp(yf0, yf1, zs);
        }       
       
       `);

      /*
      __device__ float singleValueFractalFBM(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = singleValue(n, seed, x, y, z);
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum += singleValue(n, ++seed, x, y, z) * amp;
    }

    return sum * n->m_fractalBounding;
}

__device__ float singleValueFractalBillow(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = fabsf(singleValue(n, seed, x, y, z)) * 2 - 1;
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum += (fabsf(singleValue(n, ++seed, x, y, z)) * 2 - 1) * amp;
    }

    return sum * n->m_fractalBounding;
}

__device__ float singleValueFractalRigidMulti(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = 1 - fabsf(singleValue(n, seed, x, y, z));
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum -= (1 - fabsf(singleValue(n, ++seed, x, y, z))) * amp;
    }

    return sum;
}

__device__ float getValue(FastNoise* n, float x, float y, float z) {
    return singleValue(n, n->m_seed, x * n->m_frequency, y * n->m_frequency, z * n->m_frequency);
}

__device__ float getValueFractal(FastNoise* n, float x, float y, float z) {
    x *= n->m_frequency;
    y *= n->m_frequency;
    z *= n->m_frequency;

    switch (n->m_fractalType) {
        case FBM:
            return singleValueFractalFBM(n, x, y, z);
        case Billow:
            return singleValueFractalBillow(n, x, y, z);
        case RigidMulti:
            return singleValueFractalRigidMulti(n, x, y, z);
        default:
            return 0;
    }
}
#endif // ADD_FEATURE_VALUE_NOISE

#ifdef ADD_FEATURE_PERLIN_NOISE
// Perlin Noise
__device__ float singlePerlin(FastNoise* n, int seed, float x, float y, float z) {
    int x0 = fastFloor(x);
    int y0 = fastFloor(y);
    int z0 = fastFloor(z);
    int x1 = x0 + 1;
    int y1 = y0 + 1;
    int z1 = z0 + 1;

    float xs, ys, zs;
    switch (n->m_interp) {
        default:
        case Linear:
            xs = x - x0;
            ys = y - y0;
            zs = z - z0;
            break;
        case Hermite:
            xs = interpHermiteFunc(x - x0);
            ys = interpHermiteFunc(y - y0);
            zs = interpHermiteFunc(z - z0);
            break;
        case Quintic:
            xs = interpQuinticFunc(x - x0);
            ys = interpQuinticFunc(y - y0);
            zs = interpQuinticFunc(z - z0);
            break;
    }

    float xd0 = x - x0;
    float yd0 = y - y0;
    float zd0 = z - z0;
    float xd1 = xd0 - 1;
    float yd1 = yd0 - 1;
    float zd1 = zd0 - 1;

    float xf00 = lerp(gradCoord3D(seed, x0, y0, z0, xd0, yd0, zd0), gradCoord3D(seed, x1, y0, z0, xd1, yd0, zd0), xs);
    float xf10 = lerp(gradCoord3D(seed, x0, y1, z0, xd0, yd1, zd0), gradCoord3D(seed, x1, y1, z0, xd1, yd1, zd0), xs);
    float xf01 = lerp(gradCoord3D(seed, x0, y0, z1, xd0, yd0, zd1), gradCoord3D(seed, x1, y0, z1, xd1, yd0, zd1), xs);
    float xf11 = lerp(gradCoord3D(seed, x0, y1, z1, xd0, yd1, zd1), gradCoord3D(seed, x1, y1, z1, xd1, yd1, zd1), xs);

    float yf0 = lerp(xf00, xf10, ys);
    float yf1 = lerp(xf01, xf11, ys);

    return lerp(yf0, yf1, zs);
}

__device__ float getPerlin(FastNoise* n, float x, float y, float z) {
    return singlePerlin(n, n->m_seed, x * n->m_frequency, y * n->m_frequency, z * n->m_frequency);
}

__device__ float singlePerlinFractalFBM(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = singlePerlin(n, seed, x, y, z);
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum += singlePerlin(n, ++seed, x, y, z) * amp;
    }

    return sum * n->m_fractalBounding;
}

__device__ float singlePerlinFractalBillow(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = fabsf(singlePerlin(n, seed, x, y, z)) * 2 - 1;
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum += (fabsf(singlePerlin(n, ++seed, x, y, z)) * 2 - 1) * amp;
    }

    return sum * n->m_fractalBounding;
}

__device__ float singlePerlinFractalRigidMulti(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = 1 - fabsf(singlePerlin(n, seed, x, y, z));
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum -= (1 - fabsf(singlePerlin(n, ++seed, x, y, z))) * amp;
    }

    return sum;
}

__device__ float getPerlinFractal(FastNoise* n, float x, float y, float z) {
    x *= n->m_frequency;
    y *= n->m_frequency;
    z *= n->m_frequency;

    switch (n->m_fractalType) {
        case FBM:
            return singlePerlinFractalFBM(n, x, y, z);
        case Billow:
            return singlePerlinFractalBillow(n, x, y, z);
        case RigidMulti:
            return singlePerlinFractalRigidMulti(n, x, y, z);
        default:
            return 0;
    }
}
#endif // ADD_FEATURE_PERLIN_NOISE

// Simplex Noise
#ifdef ADD_FEATURE_SIMPLEX_NOISE
__device__ __constant__ float F3 = (float) (1.0 / 3.0);
__device__ __constant__ float G3 = (float) (1.0 / 6.0);
__device__ __constant__ float G33 =(float) ((1.0 / 6.0) * 3 - 1);
#endif // ADD_FEATURE_SIMPLEX_NOISE

#ifdef ADD_FEATURE_SIMPLEX_NOISE
__device__ float singleSimplex(int seed, float x, float y, float z) {
    float t = (x + y + z) * F3;
    int i = fastFloor(x + t);
    int j = fastFloor(y + t);
    int k = fastFloor(z + t);

    t = (i + j + k) * G3;
    float x0 = x - (i - t);
    float y0 = y - (j - t);
    float z0 = z - (k - t);

    int i1, j1, k1;
    int i2, j2, k2;

    if (x0 >= y0) {
        if (y0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        } else if (x0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        } else // x0 < z0
        {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        }
    } else // x0 < y0
    {
        if (y0 < z0) {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        } else if (x0 < z0) {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        } else // x0 >= z0
        {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        }
    }

    float x1 = x0 - i1 + G3;
    float y1 = y0 - j1 + G3;
    float z1 = z0 - k1 + G3;
    float x2 = x0 - i2 + F3;
    float y2 = y0 - j2 + F3;
    float z2 = z0 - k2 + F3;
    float x3 = x0 + G33;
    float y3 = y0 + G33;
    float z3 = z0 + G33;

    float n0, n1, n2, n3;

    t = (float) 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t < 0) n0 = 0;
    else {
        t *= t;
        n0 = t * t * gradCoord3D(seed, i, j, k, x0, y0, z0);
    }

    t = (float) 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t < 0) n1 = 0;
    else {
        t *= t;
        n1 = t * t * gradCoord3D(seed, i + i1, j + j1, k + k1, x1, y1, z1);
    }

    t = (float) 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t < 0) n2 = 0;
    else {
        t *= t;
        n2 = t * t * gradCoord3D(seed, i + i2, j + j2, k + k2, x2, y2, z2);
    }

    t = (float) 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t < 0) n3 = 0;
    else {
        t *= t;
        n3 = t * t * gradCoord3D(seed, i + 1, j + 1, k + 1, x3, y3, z3);
    }

    return 32 * (n0 + n1 + n2 + n3);
}

__device__ float getSimplex(FastNoise* n, float x, float y, float z) {
    return singleSimplex(n->m_seed, x * n->m_frequency, y * n->m_frequency, z * n->m_frequency);
}

__device__ float singleSimplexFractalFBM(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = singleSimplex(seed, x, y, z);
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum += singleSimplex(++seed, x, y, z) * amp;
    }

    return sum * n->m_fractalBounding;
}

__device__ float singleSimplexFractalBillow(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = fabsf(singleSimplex(seed, x, y, z)) * 2 - 1;
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum += (fabsf(singleSimplex(++seed, x, y, z)) * 2 - 1) * amp;
    }

    return sum * n->m_fractalBounding;
}

__device__ float singleSimplexFractalRigidMulti(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = 1 - fabsf(singleSimplex(seed, x, y, z));
    float amp = 1;

    for (int i = 1; i < n->m_octaves; i++) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum -= (1 - fabsf(singleSimplex(++seed, x, y, z))) * amp;
    }

    return sum;
}

__device__ float getSimplexFractal(FastNoise* n, float x, float y, float z) {
    x *= n->m_frequency;
    y *= n->m_frequency;
    z *= n->m_frequency;

    switch (n->m_fractalType) {
        case FBM:
            return singleSimplexFractalFBM(n, x, y, z);
        case Billow:
            return singleSimplexFractalBillow(n, x, y, z);
        case RigidMulti:
            return singleSimplexFractalRigidMulti(n, x, y, z);
        default:
            return 0;
    }
}
#endif // ADD_FEATURE_SIMPLEX_NOISE

#ifdef ADD_FEATURE_SIMPLEX_NOISE
__device__ __constant__ float F2 = (float) (1.0 / 2.0);
__device__ __constant__ float G2 = (float) (1.0 / 4.0);
#endif

// Cubic Noise
#ifdef ADD_FEATURE_CUBIC_NOISE
__device__ __constant__ float CUBIC_3D_BOUNDING = 1 / (float) (1.5 * 1.5 * 1.5);

__device__ float singleCubic(FastNoise* n, int seed, float x, float y, float z) {
    int x1 = fastFloor(x);
    int y1 = fastFloor(y);
    int z1 = fastFloor(z);

    int x0 = x1 - 1;
    int y0 = y1 - 1;
    int z0 = z1 - 1;
    int x2 = x1 + 1;
    int y2 = y1 + 1;
    int z2 = z1 + 1;
    int x3 = x1 + 2;
    int y3 = y1 + 2;
    int z3 = z1 + 2;

    float xs = x - (float) x1;
    float ys = y - (float) y1;
    float zs = z - (float) z1;

    return cubicLerp(
        cubicLerp(
            cubicLerp(valCoord3D(seed, x0, y0, z0), valCoord3D(seed, x1, y0, z0), valCoord3D(seed, x2, y0, z0), valCoord3D(seed, x3, y0, z0), xs),
            cubicLerp(valCoord3D(seed, x0, y1, z0), valCoord3D(seed, x1, y1, z0), valCoord3D(seed, x2, y1, z0), valCoord3D(seed, x3, y1, z0), xs),
            cubicLerp(valCoord3D(seed, x0, y2, z0), valCoord3D(seed, x1, y2, z0), valCoord3D(seed, x2, y2, z0), valCoord3D(seed, x3, y2, z0), xs),
            cubicLerp(valCoord3D(seed, x0, y3, z0), valCoord3D(seed, x1, y3, z0), valCoord3D(seed, x2, y3, z0), valCoord3D(seed, x3, y3, z0), xs),
            ys),
        cubicLerp(
            cubicLerp(valCoord3D(seed, x0, y0, z1), valCoord3D(seed, x1, y0, z1), valCoord3D(seed, x2, y0, z1), valCoord3D(seed, x3, y0, z1), xs),
            cubicLerp(valCoord3D(seed, x0, y1, z1), valCoord3D(seed, x1, y1, z1), valCoord3D(seed, x2, y1, z1), valCoord3D(seed, x3, y1, z1), xs),
            cubicLerp(valCoord3D(seed, x0, y2, z1), valCoord3D(seed, x1, y2, z1), valCoord3D(seed, x2, y2, z1), valCoord3D(seed, x3, y2, z1), xs),
            cubicLerp(valCoord3D(seed, x0, y3, z1), valCoord3D(seed, x1, y3, z1), valCoord3D(seed, x2, y3, z1), valCoord3D(seed, x3, y3, z1), xs),
            ys),
        cubicLerp(
            cubicLerp(valCoord3D(seed, x0, y0, z2), valCoord3D(seed, x1, y0, z2), valCoord3D(seed, x2, y0, z2), valCoord3D(seed, x3, y0, z2), xs),
            cubicLerp(valCoord3D(seed, x0, y1, z2), valCoord3D(seed, x1, y1, z2), valCoord3D(seed, x2, y1, z2), valCoord3D(seed, x3, y1, z2), xs),
            cubicLerp(valCoord3D(seed, x0, y2, z2), valCoord3D(seed, x1, y2, z2), valCoord3D(seed, x2, y2, z2), valCoord3D(seed, x3, y2, z2), xs),
            cubicLerp(valCoord3D(seed, x0, y3, z2), valCoord3D(seed, x1, y3, z2), valCoord3D(seed, x2, y3, z2), valCoord3D(seed, x3, y3, z2), xs),
            ys),
        cubicLerp(
            cubicLerp(valCoord3D(seed, x0, y0, z3), valCoord3D(seed, x1, y0, z3), valCoord3D(seed, x2, y0, z3), valCoord3D(seed, x3, y0, z3), xs),
            cubicLerp(valCoord3D(seed, x0, y1, z3), valCoord3D(seed, x1, y1, z3), valCoord3D(seed, x2, y1, z3), valCoord3D(seed, x3, y1, z3), xs),
            cubicLerp(valCoord3D(seed, x0, y2, z3), valCoord3D(seed, x1, y2, z3), valCoord3D(seed, x2, y2, z3), valCoord3D(seed, x3, y2, z3), xs),
            cubicLerp(valCoord3D(seed, x0, y3, z3), valCoord3D(seed, x1, y3, z3), valCoord3D(seed, x2, y3, z3), valCoord3D(seed, x3, y3, z3), xs),
            ys),
        zs) * CUBIC_3D_BOUNDING;
}


__device__ float getCubic(FastNoise* n, float x, float y, float z) {
    return singleCubic(n, n->m_seed, x * n->m_frequency, y * n->m_frequency, z * n->m_frequency);
}

__device__ float singleCubicFractalFBM(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = singleCubic(n, seed, x, y, z);
    float amp = 1;
    int i = 0;

    while (++i < n->m_octaves) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum += singleCubic(n, ++seed, x, y, z) * amp;
    }

    return sum * n->m_fractalBounding;
}

__device__ float singleCubicFractalBillow(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = fabsf(singleCubic(n, seed, x, y, z)) * 2 - 1;
    float amp = 1;
    int i = 0;

    while (++i < n->m_octaves) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum += (fabsf(singleCubic(n, ++seed, x, y, z)) * 2 - 1) * amp;
    }

    return sum * n->m_fractalBounding;
}

__device__ float singleCubicFractalRigidMulti(FastNoise* n, float x, float y, float z) {
    int seed = n->m_seed;
    float sum = 1 - fabsf(singleCubic(n, seed, x, y, z));
    float amp = 1;
    int i = 0;

    while (++i < n->m_octaves) {
        x *= n->m_lacunarity;
        y *= n->m_lacunarity;
        z *= n->m_lacunarity;

        amp *= n->m_gain;
        sum -= (1 - fabsf(singleCubic(n, ++seed, x, y, z))) * amp;
    }

    return sum;
}

__device__ float getCubicFractal(FastNoise* n, float x, float y, float z) {
    x *= n->m_frequency;
    y *= n->m_frequency;
    z *= n->m_frequency;

    switch (n->m_fractalType) {
        case FBM:
            return singleCubicFractalFBM(n, x, y, z);
        case Billow:
            return singleCubicFractalBillow(n, x, y, z);
        case RigidMulti:
            return singleCubicFractalRigidMulti(n, x, y, z);
        default:
            return 0;
    }
}
#endif // ADD_FEATURE_CUBIC_NOISE

// Cellular Noise
#ifdef ADD_FEATURE_CELLULAR_NOISE
__device__ __constant__ float CELL_3D_x[] =  {
    0.1453787434f, -0.01242829687f, 0.2877979582f, -0.07732986802f, 0.1107205875f, 0.2755209141f, 0.294168941f, 0.4000921098f,
    -0.1697304074f, -0.1483224484f, 0.2623596946f, -0.2709003183f, -0.03516550699f, -0.1267712655f, 0.02952021915f, -0.2806854217f,
    -0.171159547f, 0.2113227183f, -0.1024352839f, -0.3304249877f, 0.2091111325f, 0.344678154f, 0.1984478035f, -0.2929008603f,
    -0.1617332831f, -0.3582060271f, -0.1852067326f, 0.3046301062f, -0.03816768434f, -0.4084952196f, -0.02687443361f, -0.03801098351f,
    0.2371120802f, 0.4447660503f, 0.01985147278f, 0.4274339143f, -0.2072988631f, -0.3791240978f, -0.2098721267f, 0.01582798878f,
    -0.1888129464f, 0.1612988974f, -0.08974491322f, 0.07041229526f, -0.1082925611f, 0.2474100658f, -0.1068836661f, 0.2396452163f,
    -0.3063886072f, 0.1593342891f, 0.2709690528f, -0.1519780427f, 0.1699773681f, -0.1986155616f, -0.1887482106f, 0.2659103394f,
    -0.08838976154f, -0.04201869311f, -0.3230334656f, 0.2612720941f, 0.385713046f, 0.07654967953f, 0.4317038818f, -0.2890436293f,
    -0.2201947582f, 0.4161322773f, 0.2204718095f, -0.1040307469f, -0.1432122615f, 0.3978380468f, -0.2599274663f, 0.4032618332f,
    -0.08953470255f, 0.118937202f, 0.02167047076f, -0.3411343612f, 0.3162964612f, 0.2355138889f, -0.02874541518f, -0.2461455173f,
    0.04208029445f, 0.2727458746f, -0.1347522818f, 0.3829624424f, -0.3547613644f, 0.2305790207f, -0.08323845599f, 0.2993663085f,
    -0.2154865723f, 0.01683355354f, 0.05240429123f, 0.00940104872f, 0.3465688735f, -0.3706867948f, 0.2741169781f, 0.06413433865f,
    -0.388187972f, 0.06419469312f, -0.1986120739f, -0.203203009f, -0.1389736354f, -0.06555641638f, -0.2529246486f, 0.1444476522f,
    -0.3643780054f, 0.4286142488f, 0.165872923f, 0.2219610524f, 0.04322940318f, -0.08481269795f, 0.1822082075f, -0.3269323334f,
    -0.4080485344f, 0.2676025294f, 0.3024892441f, 0.1448494052f, 0.4198402157f, -0.3008872161f, 0.3639310428f, 0.3295806598f,
    0.2776259487f, 0.4149000507f, 0.145016715f, 0.09299023471f, 0.1028907093f, 0.2683057049f, -0.4227307273f, -0.1781224702f,
    0.4390788626f, 0.2972583585f, -0.1707002821f, 0.3806686614f, -0.1751445661f, -0.2227237566f, 0.1369633021f, -0.3529503428f,
    -0.2590744185f, -0.3784019401f, -0.05635805671f, 0.3251428613f, -0.4190995804f, -0.3253150961f, 0.2857945863f, -0.2733604046f,
    0.219003657f, 0.3182767252f, -0.03222023115f, -0.3087780231f, -0.06487611647f, 0.3921171432f, -0.1606404506f, -0.03767771199f,
    0.1394866832f, -0.4345093872f, -0.1044637494f, 0.2658727501f, 0.2051461999f, -0.266085566f, 0.07849405464f, -0.2160686338f,
    -0.185779186f, 0.02492421743f, -0.120167831f, -0.02160084693f, 0.2597670064f, -0.1611553854f, -0.3278896792f, 0.2822734956f,
    0.03169341113f, 0.2202613604f, 0.2933396046f, -0.3194922995f, -0.3441586045f, 0.2703645948f, 0.2298568861f, 0.09326603877f,
    -0.1116165319f, 0.2172907365f, 0.1991339479f, -0.0541918155f, 0.08871336998f, 0.2787673278f, -0.322166438f, -0.4277366384f,
    0.240131882f, 0.1448607981f, -0.3837065682f, -0.4382627882f, -0.37728353f, 0.1259579313f, -0.1406285511f, -0.1580694418f,
    0.2477612106f, 0.2916132853f, 0.07365265219f, -0.26126526f, -0.3721862032f, -0.3691191571f, 0.2278441737f, 0.363398169f,
    -0.304231482f, -0.3199312232f, 0.2874852279f, -0.1451096801f, 0.3220090754f, -0.1247400865f, -0.2829555867f, 0.1069384374f,
    -0.1420661144f, -0.250548338f, 0.3265787872f, 0.07646097258f, 0.3451771584f, 0.298137964f, 0.2812250376f, 0.4390345476f,
    0.2148373234f, 0.2595421179f, 0.3182823114f, -0.4089859285f, -0.2826749061f, 0.3483864637f, -0.3226415069f, 0.4330734858f,
    -0.08717822568f, -0.2149678299f, -0.2687330705f, 0.2105665099f, 0.4361845915f, 0.05333333359f, -0.05986216652f, 0.3664988455f,
    -0.2341015558f, -0.04730947785f, -0.2391566239f, -0.1242081035f, 0.2614832715f, -0.2728794681f, 0.007892900508f, -0.01730330376f,
    0.2054835762f, -0.3231994983f, -0.2669545963f, -0.05554372779f, -0.2083935713f, 0.06989323478f, 0.3847566193f, -0.3026215288f,
    0.3450735512f, 0.1814473292f, -0.03855010448f, 0.3533670318f, -0.007945601311f, 0.4063099273f, -0.2016773589f, -0.07527055435f,
};

__device__ __constant__ float CELL_3D_y[] = {
    -0.4149781685f, -0.1457918398f, -0.02606483451f, 0.2377094325f, -0.3552302079f, 0.2640521179f, 0.1526064594f, -0.2034056362f,
    0.3970864695f, -0.3859694688f, -0.2354852944f, 0.3505271138f, 0.3885234328f, 0.1920044036f, 0.4409685861f, -0.266996757f,
    0.2141185563f, 0.3902405947f, 0.2128044156f, -0.1566986703f, 0.3133278055f, -0.1944240454f, -0.3214342325f, 0.2262915116f,
    0.006314769776f, -0.148303178f, -0.3454119342f, 0.1026310383f, -0.2551766358f, 0.1805950793f, -0.2749741471f, 0.3277859044f,
    0.2900386767f, 0.03946930643f, -0.01503183293f, 0.03345994256f, 0.2871414597f, 0.1281177671f, -0.1007087278f, 0.4263894424f,
    -0.3160996813f, -0.1974805082f, 0.229148752f, 0.4150230285f, -0.1586061639f, -0.3309414609f, -0.2701644537f, 0.06803600538f,
    0.2597428179f, -0.3114350249f, 0.1412648683f, 0.3623355133f, 0.3456012883f, 0.3836276443f, -0.2050154888f, 0.3015631259f,
    -0.4288819642f, 0.3099592485f, 0.201549922f, 0.2759854499f, 0.2193460345f, 0.3721732183f, -0.02577753072f, -0.3418179959f,
    0.383023377f, -0.1669634289f, 0.02654238946f, 0.3890079625f, 0.371614387f, -0.06206669342f, 0.2616724959f, -0.1124593585f,
    -0.3048244735f, -0.2875221847f, -0.03284630549f, 0.2500031105f, 0.3082064153f, -0.3439334267f, -0.3955933019f, 0.02020282325f,
    -0.4470439576f, 0.2288471896f, -0.02720848277f, 0.1231931484f, 0.1271702173f, 0.3063895591f, -0.1922245118f, -0.2619918095f,
    0.2706747713f, -0.2680655787f, 0.4335128183f, -0.4472890582f, 0.01141914583f, -0.2551104378f, 0.2139972417f, 0.1708718512f,
    -0.03973280434f, -0.2803682491f, -0.3391173584f, -0.3871641506f, -0.2775901578f, 0.342253257f, -0.2904227915f, 0.1069184044f,
    -0.2447099973f, -0.1358496089f, -0.3136808464f, -0.3658139958f, -0.3832730794f, -0.4404869674f, -0.3953259299f, 0.3036542563f,
    0.04227858267f, -0.01299671652f, -0.1009990293f, 0.425921681f, 0.08062320474f, -0.333040905f, -0.1291284382f, 0.0184175994f,
    -0.2974929052f, -0.144793182f, -0.0398992945f, -0.299732164f, -0.361266869f, -0.07076041213f, -0.07933161816f, 0.1806857196f,
    -0.02841848598f, 0.2382799621f, 0.2215845691f, 0.1471852559f, -0.274887877f, -0.2316778837f, 0.1341343041f, -0.2472893463f,
    -0.2985577559f, 0.2199816631f, 0.1485737441f, 0.09666046873f, 0.1406751354f, -0.3080335042f, -0.05796152095f, 0.1973770973f,
    0.2410037886f, -0.271342949f, -0.3331161506f, 0.1992794134f, -0.4311322747f, -0.06294284106f, -0.358928121f, -0.2290351443f,
    -0.3602213994f, 0.005751117145f, 0.4168128432f, 0.2551943237f, 0.1975390727f, 0.23483312f, -0.3300346342f, 0.05376451292f,
    0.2148499206f, -0.3229954284f, 0.4017266681f, -0.06885389554f, 0.3096300784f, -0.09823036005f, 0.1461670309f, 0.03754421121f,
    0.347405252f, -0.3460788041f, 0.3031973659f, 0.2453752201f, -0.1698856132f, -0.3574277231f, 0.3744156221f, -0.3170108894f,
    -0.2985018719f, -0.3460005203f, 0.3820341668f, -0.2103145071f, 0.2012117383f, 0.3505404674f, 0.3067213525f, 0.132066775f,
    -0.1612516055f, -0.2387819045f, -0.2206398454f, -0.09082753406f, 0.05445141085f, 0.348394558f, -0.270877371f, 0.4162931958f,
    -0.2927867412f, 0.3312535401f, -0.1666159848f, -0.2422237692f, 0.252790166f, -0.255281188f, -0.3358364886f, -0.2310190248f,
    -0.2698452035f, 0.316332536f, 0.1642275508f, 0.3277541114f, 0.0511344108f, -0.04333605335f, -0.3056190617f, 0.3491024667f,
    -0.3055376754f, 0.3156466809f, 0.1871229129f, -0.3026690852f, 0.2757120714f, 0.2852657134f, 0.3466716415f, -0.09790429955f,
    0.1850172527f, -0.07946825393f, -0.307355516f, -0.04647718411f, 0.07417482322f, 0.225442246f, -0.1420585388f, -0.118868561f,
    -0.3909896417f, 0.3939973956f, 0.322686276f, -0.1961317136f, -0.1105517485f, -0.313639498f, 0.1361029153f, 0.2550543014f,
    -0.182405731f, -0.4222150243f, -0.2577696514f, 0.4256953395f, -0.3650179274f, -0.3499628774f, -0.1672771315f, 0.2978486637f,
    -0.3252600376f, 0.1564282844f, 0.2599343665f, 0.3170813944f, -0.310922837f, -0.3156141536f, -0.1605309138f, -0.3001537679f,
    0.08611519592f, -0.2788782453f, 0.09795110726f, 0.2665752752f, 0.140359426f, -0.1491768253f, 0.008816271194f, -0.425643481f,
};

__device__ __constant__ float CELL_3D_z[] = {
    -0.0956981749f, -0.4255470325f, -0.3449535616f, 0.3741848704f, -0.2530858567f, -0.238463215f, 0.3044271714f, 0.03244149937f,
    -0.1265461359f, 0.1775613147f, 0.2796677792f, -0.07901746678f, 0.2243054374f, 0.3867342179f, 0.08470692262f, 0.2289725438f,
    0.3568720405f, -0.07453178509f, -0.3830421561f, 0.2622305365f, -0.2461670583f, -0.2142341261f, -0.2445373252f, 0.2559320961f,
    -0.4198838754f, -0.2284613961f, -0.2211087107f, 0.314908508f, -0.3686842991f, 0.05492788837f, 0.3551999201f, 0.3059600725f,
    -0.2493099024f, 0.05590469027f, -0.4493105419f, -0.1366772882f, -0.2776273824f, 0.2057929936f, -0.3851122467f, 0.1429738373f,
    -0.2587096108f, -0.3707885038f, -0.3767448739f, -0.1590534329f, 0.4069604477f, 0.1782302128f, -0.3436379634f, -0.3747549496f,
    0.2028785103f, -0.2830561951f, -0.3303331794f, 0.2193527988f, 0.2327390037f, -0.1260225743f, -0.353330953f, -0.2021172246f,
    -0.1036702021f, 0.3235115047f, -0.2398478873f, -0.2409749453f, 0.07491837764f, 0.241095919f, 0.1243675091f, -0.04598084447f,
    -0.08548310451f, -0.03817251927f, -0.391391981f, -0.2008741118f, -0.2095065525f, 0.2009293758f, -0.2578084893f, 0.1650235939f,
    0.3186935478f, 0.325092195f, -0.4482761547f, 0.1537068389f, -0.08640228117f, -0.1695376245f, 0.2125550295f, -0.3761704803f,
    0.02968078139f, -0.2752065618f, -0.4284874806f, -0.2016512234f, 0.2459107769f, 0.2354968222f, 0.3982726409f, -0.2103333191f,
    0.287751117f, -0.3610505186f, -0.1087217856f, 0.04841609928f, -0.2868093776f, 0.003156692623f, -0.2855959784f, 0.4113266307f,
    -0.2241236325f, 0.3460819069f, 0.2192091725f, 0.1063600375f, -0.3257760473f, -0.2847192729f, 0.2327739768f, 0.4125570634f,
    -0.09922543227f, -0.01829506817f, -0.2767498872f, 0.1393320198f, 0.2318037215f, -0.03574965489f, 0.1140946023f, 0.05838957105f,
    -0.184956522f, 0.36155217f, -0.3174892964f, -0.0104580805f, 0.1404780841f, -0.03241355801f, -0.2310412139f, -0.3058388149f,
    -0.1921504723f, -0.09691688386f, 0.4241205002f, -0.3225111565f, 0.247789732f, -0.3542668666f, -0.1323073187f, -0.3716517945f,
    -0.09435116353f, -0.2394997452f, 0.3525077196f, -0.1895464869f, 0.3102596268f, 0.3149912482f, -0.4071228836f, -0.129514612f,
    -0.2150435121f, -0.1044989934f, 0.4210102279f, -0.2957006485f, -0.08405978803f, -0.04225456877f, 0.3427271751f, -0.2980207554f,
    -0.3105713639f, 0.1660509868f, -0.300824678f, -0.2596995338f, 0.1114273361f, -0.2116183942f, -0.2187812825f, 0.3855169162f,
    0.2308332918f, 0.1169124335f, -0.1336202785f, 0.2582393035f, 0.3484154868f, 0.2766800993f, -0.2956616708f, -0.3910546287f,
    0.3490352499f, -0.3123343347f, 0.1633259825f, 0.4441762538f, 0.1978643903f, 0.4085091653f, 0.2713366126f, -0.3484423997f,
    -0.2842624114f, -0.1849713341f, 0.1565989581f, -0.200538455f, -0.2349334659f, 0.04060059933f, 0.0973588921f, 0.3054595587f,
    0.3177080142f, -0.1885958001f, -0.1299829458f, 0.39412061f, 0.3926114802f, 0.04370535101f, 0.06804996813f, 0.04582286686f,
    0.344723946f, 0.3528435224f, 0.08116235683f, -0.04664855374f, 0.2391488697f, 0.2554522098f, -0.3306796947f, -0.06491553533f,
    -0.2353514536f, 0.08793624968f, 0.411478311f, 0.2748965434f, 0.008634938242f, 0.03290232422f, 0.1944244981f, 0.1306597909f,
    0.1926830856f, -0.008816977938f, -0.304764754f, -0.2720669462f, 0.3101538769f, -0.4301882115f, -0.1703910946f, -0.2630430352f,
    -0.2982682484f, -0.2002316239f, 0.2466400438f, 0.324106687f, -0.0856480183f, 0.179547284f, 0.05684409612f, -0.01278335452f,
    0.3494474791f, 0.3589187731f, -0.08203022006f, 0.1818526372f, 0.3421885344f, -0.1740766085f, -0.2796816575f, -0.02859407492f,
    -0.2050050172f, -0.03247898316f, -0.1617284888f, -0.3459683451f, 0.004616608544f, -0.3182543336f, -0.4247264031f, -0.05590974511f,
    0.3382670703f, -0.1483114513f, -0.2808182972f, -0.07652336246f, 0.02980623099f, 0.07458404908f, 0.4176793787f, -0.3368779738f,
    -0.2334146693f, -0.2712420987f, -0.2523278991f, -0.3144428146f, -0.2497981362f, 0.3130537363f, -0.1693876312f, -0.1443188342f,
    0.2756962409f, -0.3029914042f, 0.4375151083f, 0.08105160988f, -0.4274764309f, -0.1231199324f, -0.4021797064f, -0.1251477955f,
};

#define MAX_CELL_POS 32000
#define MIN_CELL_POS -32000

__device__ float singleCellular(FastNoise* n, float x, float y, float z) {
    int xr = max(min(fastRound(x), MAX_CELL_POS), MIN_CELL_POS);
    int yr = max(min(fastRound(y), MAX_CELL_POS), MIN_CELL_POS);
    int zr = max(min(fastRound(z), MAX_CELL_POS), MIN_CELL_POS);

    float distance = 999999;
    int xc = 0, yc = 0, zc = 0;

    switch (n->m_cellularDistanceFunction) {
        case Euclidean:
            for (int xi = xr - 1; xi <= xr + 1; xi++) {
                for (int yi = yr - 1; yi <= yr + 1; yi++) {
                    for (int zi = zr - 1; zi <= zr + 1; zi++) {
                        int idx = hash3D(n->m_seed, xi, yi, zi) & 255;


                        float vecX = xi - x + CELL_3D_x[idx];
                        float vecY = yi - y + CELL_3D_y[idx];
                        float vecZ = zi - z + CELL_3D_z[idx];

                        float newDistance = vecX * vecX + vecY * vecY + vecZ * vecZ;

                        if (newDistance < distance) {
                            distance = newDistance;
                            xc = xi;
                            yc = yi;
                            zc = zi;
                        }
                    }
                }
            }
            break;
        case Manhattan:
            for (int xi = xr - 1; xi <= xr + 1; xi++) {
                for (int yi = yr - 1; yi <= yr + 1; yi++) {
                    for (int zi = zr - 1; zi <= zr + 1; zi++) {
                        int idx = hash3D(n->m_seed, xi, yi, zi) & 255;

                        float vecX = xi - x + CELL_3D_x[idx];
                        float vecY = yi - y + CELL_3D_y[idx];
                        float vecZ = zi - z + CELL_3D_z[idx];

                        float newDistance = fabsf(vecX) + fabsf(vecY) + fabsf(vecZ);

                        if (newDistance < distance) {
                            distance = newDistance;
                            xc = xi;
                            yc = yi;
                            zc = zi;
                        }
                    }
                }
            }
            break;
        case Natural:
            for (int xi = xr - 1; xi <= xr + 1; xi++) {
                for (int yi = yr - 1; yi <= yr + 1; yi++) {
                    for (int zi = zr - 1; zi <= zr + 1; zi++) {
                        int idx = hash3D(n->m_seed, xi, yi, zi) & 255;

                        float vecX = xi - x + CELL_3D_x[idx];
                        float vecY = yi - y + CELL_3D_y[idx];
                        float vecZ = zi - z + CELL_3D_z[idx];

                        float newDistance = (fabsf(vecX) + fabsf(vecY) + fabsf(vecZ)) + (vecX * vecX + vecY * vecY + vecZ * vecZ);

                        if (newDistance < distance) {
                            distance = newDistance;
                            xc = xi;
                            yc = yi;
                            zc = zi;
                        }
                    }
                }
            }
            break;
    }

    switch (n->m_cellularReturnType) {
        case CellValue:
            return valCoord3D(0, xc, yc, zc);
        case Distance:
            return distance - 1;
        default:
            return 0;
    }
}

__device__ float singleCellular2Edge(FastNoise* n, float x, float y, float z) {
    int xr = max(min(fastRound(x), MAX_CELL_POS), MIN_CELL_POS);
    int yr = max(min(fastRound(y), MAX_CELL_POS), MIN_CELL_POS);
    int zr = max(min(fastRound(z), MAX_CELL_POS), MIN_CELL_POS);

    float distance = 999999;
    float distance2 = 999999;

    switch (n->m_cellularDistanceFunction) {
        case Euclidean:
            for (int xi = xr - 1; xi <= xr + 1; xi++) {
                for (int yi = yr - 1; yi <= yr + 1; yi++) {
                    for (int zi = zr - 1; zi <= zr + 1; zi++) {
                       int idx = hash3D(n->m_seed, xi, yi, zi) & 255;
                        float vecX = xi - x + CELL_3D_x[idx];
                        float vecY = yi - y + CELL_3D_y[idx];
                        float vecZ = zi - z + CELL_3D_z[idx];

                        float newDistance = vecX * vecX + vecY * vecY + vecZ * vecZ;

                        distance2 = fmaxf(fminf(distance2, newDistance), distance);
                        distance = fminf(distance, newDistance);
                    }
                }
            }
            break;
        case Manhattan:
            for (int xi = xr - 1; xi <= xr + 1; xi++) {
                for (int yi = yr - 1; yi <= yr + 1; yi++) {
                    for (int zi = zr - 1; zi <= zr + 1; zi++) {
                        int idx = hash3D(n->m_seed, xi, yi, zi) & 255;

                        float vecX = xi - x + CELL_3D_x[idx];
                        float vecY = yi - y + CELL_3D_y[idx];
                        float vecZ = zi - z + CELL_3D_z[idx];

                        float newDistance = fabsf(vecX) + fabsf(vecY) + fabsf(vecZ);

                        distance2 = fmaxf(fminf(distance2, newDistance), distance);
                        distance = fminf(distance, newDistance);
                    }
                }
            }
            break;
        case Natural:
            for (int xi = xr - 1; xi <= xr + 1; xi++) {
                for (int yi = yr - 1; yi <= yr + 1; yi++) {
                    for (int zi = zr - 1; zi <= zr + 1; zi++) {
                        int idx = hash3D(n->m_seed, xi, yi, zi) & 255;

                        float vecX = xi - x + CELL_3D_x[idx];
                        float vecY = yi - y + CELL_3D_y[idx];
                        float vecZ = zi - z + CELL_3D_z[idx];

                        float newDistance = (fabsf(vecX) + fabsf(vecY) + fabsf(vecZ)) + (vecX * vecX + vecY * vecY + vecZ * vecZ);

                        distance2 = fmaxf(fminf(distance2, newDistance), distance);
                        distance = fminf(distance, newDistance);
                    }
                }
            }
            break;
        default:
            break;
    }

    switch (n->m_cellularReturnType) {
        case Distance2:
            return distance2 - 1;
        case Distance2Add:
            return distance2 + distance - 1;
        case Distance2Sub:
            return distance2 - distance - 1;
        case Distance2Mul:
            return distance2 * distance - 1;
        case Distance2Div:
            return distance / distance2 - 1;
        default:
            return 0;
    }
}

__device__ float getCellular(FastNoise* n, float x, float y, float z) {
    x *= n->m_frequency;
    y *= n->m_frequency;
    z *= n->m_frequency;

    switch (n->m_cellularReturnType) {
        case CellValue:
        case Distance:
            return singleCellular(n, x, y, z);
        default:
            return singleCellular2Edge(n, x, y, z);
    }
}
#endif // ADD_FEATURE_CELLULAR_NOISE

// MAIN FUNCTION
__device__ float getNoise(FastNoise* n, float x, float y, float z) {
    x *= n->m_frequency;
    y *= n->m_frequency;
    z *= n->m_frequency;

    switch (n->m_noiseType) {
        case Value:
#ifdef ADD_FEATURE_VALUE_NOISE
            return singleValue(n, n->m_seed, x, y, z);
#else
            return 0.f;
#endif
        case ValueFractal:
#ifdef ADD_FEATURE_VALUE_NOISE
            switch (n->m_fractalType) {
                case FBM:
                    return singleValueFractalFBM(n, x, y, z);
                case Billow:
                    return singleValueFractalBillow(n, x, y, z);
                case RigidMulti:
                    return singleValueFractalRigidMulti(n, x, y, z);
                default:
                    return 0;
            }
#else
            return 0.f;
#endif
        case Perlin:
#ifdef ADD_FEATURE_PERLIN_NOISE
            return singlePerlin(n, n->m_seed, x, y, z);
#else
            return 0.f;
#endif
        case PerlinFractal:
#ifdef ADD_FEATURE_PERLIN_NOISE
            switch (n->m_fractalType) {
                case FBM:
                    return singlePerlinFractalFBM(n, x, y, z);
                case Billow:
                    return singlePerlinFractalBillow(n, x, y, z);
                case RigidMulti:
                    return singlePerlinFractalRigidMulti(n, x, y, z);
                default:
                    return 0;
            }
#else
            return 0.f;
#endif
        case Simplex:
#ifdef ADD_FEATURE_SIMPLEX_NOISE
            return singleSimplex(n->m_seed, x, y, z);
#else
            return 0.f;
#endif
        case SimplexFractal:
#ifdef ADD_FEATURE_SIMPLEX_NOISE
            switch (n->m_fractalType) {
                case FBM:
                    return singleSimplexFractalFBM(n, x, y, z);
                case Billow:
                    return singleSimplexFractalBillow(n, x, y, z);
                case RigidMulti:
                    return singleSimplexFractalRigidMulti(n, x, y, z);
                default:
                    return 0;
            }
#else
            return 0.f;
#endif
        case Cellular:
#ifdef ADD_FEATURE_CELLULAR_NOISE
            switch (n->m_cellularReturnType) {
                case CellValue:
                case Distance:
                    return singleCellular(n, x, y, z);
                default:
                    return singleCellular2Edge(n, x, y, z);
            }
#else
            return 0.f;
#endif
        case WhiteNoise:
#ifdef ADD_FEATURE_WHITE_NOISE
            return getWhiteNoise(n, x, y, z);
#else
            return 0.f;
#endif
        case Cubic:
#ifdef ADD_FEATURE_CUBIC_NOISE
            return singleCubic(n, n->m_seed, x, y, z);
#else
            return 0.f;
#endif
        case CubicFractal:
#ifdef ADD_FEATURE_CUBIC_NOISE
            switch (n->m_fractalType) {
                case FBM:
                    return singleCubicFractalFBM(n, x, y, z);
                case Billow:
                    return singleCubicFractalBillow(n, x, y, z);
                case RigidMulti:
                    return singleCubicFractalRigidMulti(n, x, y, z);
                default:
                    return 0;
            }
#else
            return 0.f;
#endif
        default:
            return 0;
    }
}
       */

      this.registerFunction(FUNC_ERF,
        // Quick erf code taken from http://introcs.cs.princeton.edu/java/21function/ErrorFunction.java.html
        // Copyright (C) 2000-2010, Robert Sedgewick and Kevin Wayne.
        //fractional error in math formula less than 1.2 * 10 ^ -7.
        // although subject to catastrophic cancellation when z in very close to 0
        // from Chebyshev fitting formula for erf(z) from Numerical Recipes, 6.2
        `
            float erf(float z) {
              float t = 1.0 / (1.0 + 0.5 * abs(z));
              // use Horner's method
              float ans = 1.0 - t * exp(-z * z - 1.26551223 +
                  t * (1.00002368 +
                  t * (0.37409196 +
                      t * (0.09678418 +
                          t * (-0.18628806 +
                              t * (0.27886807 +
                                  t * (-1.13520398 +
                                      t * (1.48851587 +
                                          t * (-0.82215223 +
                                              t * (0.17087277))))))))));
              if (z >= 0.0)
                return ans;
              else
                return -ans;
            }`);

      this.registerFunction(FUNC_J1,
        // Bessel-Function from cern.jet.math.Bessel.j1
           `            
            float j1(float var0) {
                float var2;
                float var4;
                float var6;
                float var8;
                if ((var2 = abs(var0)) < 8.0) {
                  var4 = var0 * var0;
                  var6 = var0 * (7.2362614232E10 + var4 * (-7.895059235E9 + var4 * (2.423968531E8 + var4 * (-2972611.439 + var4 * (15704.4826 + var4 * -30.16036606)))));
                  var8 = 1.44725228442E11 + var4 * (2.300535178E9 + var4 * (1.858330474E7 + var4 * (99447.43394 + var4 * (376.9991397 + var4 * 1.0))));
                  return var6 / var8;
                } else {
                  float var10 = 8.0 / var2;
                  float var12 = var2 - 2.356194491;
                  var4 = var10 * var10;
                  var6 = 1.0 + var4 * (0.00183105 + var4 * (-3.516396496E-5 + var4 * (2.457520174E-6 + var4 * -2.40337019E-7)));
                  var8 = 0.04687499995 + var4 * (-2.002690873E-4 + var4 * (8.449199096E-6 + var4 * (-8.8228987E-7 + var4 * 1.05787412E-7)));
                  float var14 = sqrt(0.636619772 / var2) * (cos(var12) * var6 - var10 * sin(var12) * var8);
                  if (var0 < 0.0) {
                    var14 = -var14;
                  }
                  return var14;
                }
			      }`);

      this.registerFunction(FUNC_JACOBI_ELLIPTIC,
        `
         float jacobi_elliptic(float uu, float emmc) {
             float sn = 0.0;
             // Code is taken from IROIRO++ library,
             // released under CC share-alike license.
             // less accurate for faster rendering (still very precise)
             float CA = 0.0003; // (The accuracy is the square of CA.)
             float a, b, c = 0.0, d = 0.0;
             float em[13];
             float en[13];
             float dn, cn;
             int bo;
             int l = 0;
             // LOGICAL bo
             // main
             float emc = emmc;
             float u = uu;
             if (emc != 0.0) {
               bo = 0;
               if (emc < 0.0)
                 bo = 1;
               if (bo != 0) {
                 d = 1.0 - emc;
                 emc = -emc / d;
                 d = sqrt(d);
                 u = d * u;
               }
               a = 1.0;
               dn = 1.0;        
               // for(i=0; i<13; i++){ original
               for (int i = 0; i < 8; i++) {
                 l = i;
                 em[i] = a;
                 emc = sqrt(emc);
                 en[i] = emc;
                 c = 0.5 * (a + emc);
                 if (abs(a - emc) <= CA * a)
                   break;
                  emc = a * emc;
                  a = c;
                }
            
                u = c * u;
                sn = sin(u);
                cn = cos(u);
                if (sn != 0.0) {
                  a = cn / sn;
                  c = a * c;
                 /////////////////////////////////////////////////
                 // Original:
                 // 
                 // for (int ii = l; ii >= 0; --ii) {
                 //   b = em[ii];
                 //   a = c * a;
                 //   c = dn * c;
                 //   dn = (en[ii] + a) / (b + a);
                 //   a = c / b;
                 // }
                 if (l >= 7) {
                    b = em[6];
                    a = c * a;
                    c = dn * c;
                    dn = (en[6] + a) / (b + a);
                    a = c / b;
                  }                  
                  if (l >= 6) {
                    b = em[5];
                    a = c * a;
                    c = dn * c;
                    dn = (en[5] + a) / (b + a);
                    a = c / b;
                  }  
                  if (l >= 5) {
                    b = em[4];
                    a = c * a;
                    c = dn * c;
                    dn = (en[4] + a) / (b + a);
                    a = c / b;
                  }  
                  if (l >= 4) {
                    b = em[3];
                    a = c * a;
                    c = dn * c;
                    dn = (en[3] + a) / (b + a);
                    a = c / b;
                  }  
                  if (l >= 3) {
                    b = em[2];
                    a = c * a;
                    c = dn * c;
                    dn = (en[2] + a) / (b + a);
                    a = c / b;
                  }  
                  if (l >= 2) {
                    b = em[1];
                    a = c * a;
                    c = dn * c;
                    dn = (en[1] + a) / (b + a);
                    a = c / b;
                  }  
                  if (l >= 1) {
                    b = em[0];
                    a = c * a;
                    c = dn * c;
                    dn = (en[0] + a) / (b + a);
                    a = c / b;
                  }  
                  ////////////////////////////////////////////////
                  a = 1.0 / sqrt(c * c + 1.0);
                  if (sn < 0.0)
                    sn = -a;
                  else
                    sn = a;
                  cn = c * sn;
                }
                if (bo != 0) {
                  a = dn;
                  dn = cn;
                  cn = a;
                  sn = sn / d;
                }
              } else {
                // cn = 1.0/cosh(u);
                // dn = cn;
                sn = tanh(u);
              }
              return sn;
            }
        `)

      this.registerFunction(FUNC_LOG10,
            // COSH Function (Hyperbolic Cosine) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
            `            
            float log10(float val) {
		          return log(val) / 2.30258509299; // log(10)
			      }`);

        this.registerFunction(FUNC_MODULO,
            // https://stackoverflow.com/questions/33908644/get-accurate-integer-modulo-in-webgl-shader
            `int modulo(int a,int b) {
                     float m=float(a)-floor((float(a)+0.5)/float(b))*float(b);
                     return int(floor(m+0.5));
                   }`)

      this.registerFunction(FUNC_RINT,
        `float rint(float v) {
                   return v<0.0 ? float(int(v-0.5)) : float(int(v+0.5));
                 }`)

      this.registerFunction(FUNC_ROUND,
        `float round(float v) {
                   return v<0.0 ? float(int(v-0.5)) : float(int(v+0.5));
                 }`)

      this.registerFunction(FUNC_SAFEDIV,
          `float safediv(float q, float r) {
                   if (r < 1e-08)
                     return 1.0 / r;
                   return q / r;
                 }`)

        this.registerFunction(FUNC_SGN,
            `float sgn(float arg) {
                      if (arg > 0.0)
                        return 1.0;
                      else
                        return -1.0;
                    }`)

        this.registerFunction(FUNC_SINH,
            // SINH Function (Hyperbolic Sine) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
            `
           	float sinh(float val) {
				float tmp = exp(val);
				float sinH = (tmp - 1.0 / tmp) / 2.0;
				return sinH;
			}`);
        this.registerFunction(FUNC_SQRT1PM1,
            `
               float sqrt1pm1(in float x) {
                 if (-0.0625 < x && x < 0.0625)  {
                  // [4,4] Pade approximant to degree 8 truncated Taylor series of sqrt(x+1)-1 about 0
                  // computed with a Wolfram Alpha Open Code notebook
                  // accurate to machine precision within this range?
                  float num = 0.0;
                  float den = 0.0;
                  num += 1.0 / 32.0;
                  den += 1.0 / 256.0;
                  num *= x;
                  den *= x;
                  num += 5.0 / 16.0;
                  den += 5.0 / 32.0;
                  num *= x;
                  den *= x;
                  num += 3.0 / 4.0;
                  den += 15.0 / 16.0;
                  num *= x;
                  den *= x;
                  num += 1.0 / 2.0;
                  den += 7.0 / 4.0;
                  num *= x;
                  den *= x;
                  den += 1.0;
                  return num / den;
                }
                return sqrt(1.0 + x) - 1.0;
             }`)
        this.registerFunction(FUNC_TANH,
            // TANH Function (Hyperbolic Tangent) http://machinesdontcare.wordpress.com/2008/03/10/glsl-cosh-sinh-tanh/
            `
            float tanh(float val) {
				float tmp = exp(val);
				float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
				return tanH;
			}`);


        this.registerFunction(FUNC_TRUNC,
          `float trunc(float v) {
                     return v<0.0 ? ceil(v) : floor(v);
                   }`)
    }
}

VariationMathFunctions.init()