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