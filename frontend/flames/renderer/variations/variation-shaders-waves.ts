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

import {
    VariationParam,
    VariationParamType,
    VariationShaderFunc2D,
    VariationShaderFunc3D,
    VariationTypes
} from './variation-shader-func';
import {VariationShaders} from 'Frontend/flames/renderer/variations/variation-shaders';
import {RenderVariation, RenderXForm} from 'Frontend/flames/model/render-flame';
import {M_PI} from 'Frontend/flames/renderer/mathlib';
import {
    FUNC_J1, FUNC_JACOBI_ELLIPTIC,
    FUNC_SAFEDIV,
    FUNC_SGN,
    FUNC_TANH, VariationMathFunctions
} from "Frontend/flames/renderer/variations/variation-math-functions";

// Local functions
const LIB_VIBRATION2 = 'lib_vibration2'

/*
  be sure to import this class somewhere and call registerVars_Waves()
 */
class PreWave3DWFFunc extends VariationShaderFunc3D {
    PARAM_AXIS = 'axis'
    PARAM_WAVELEN = 'wavelen'
    PARAM_PHASE = 'phase'
    PARAM_DAMPING = 'damping'
    PARAM_CENTRE_X = 'centre_x'
    PARAM_CENTRE_Y = 'centre_y'
    PARAM_CENTRE_Z = 'centre_z'

    // AXIS_XY = 0; not used explicitly
    AXIS_YZ = 1;
    AXIS_ZX = 2;
    AXIS_RADIAL = 3;

    get params(): VariationParam[] {
        return [{ name: this.PARAM_AXIS, type: VariationParamType.VP_NUMBER, initialValue:  this.AXIS_ZX },
            { name: this.PARAM_WAVELEN, type: VariationParamType.VP_NUMBER, initialValue:  0.50 },
            { name: this.PARAM_PHASE, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_DAMPING, type: VariationParamType.VP_NUMBER, initialValue: 0.01 },
            { name: this.PARAM_CENTRE_X, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CENTRE_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CENTRE_Z, type: VariationParamType.VP_NUMBER, initialValue:  0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          int axis = int(${variation.params.get(this.PARAM_AXIS)});
          float wavelen = float(${variation.params.get(this.PARAM_WAVELEN)});
          float phase = float(${variation.params.get(this.PARAM_PHASE)});
          float damping = float(${variation.params.get(this.PARAM_DAMPING)});
          float centre_x = float(${variation.params.get(this.PARAM_CENTRE_X)});
          float centre_y = float(${variation.params.get(this.PARAM_CENTRE_Y)});
          float centre_z = float(${variation.params.get(this.PARAM_CENTRE_Z)});     
          float r;
          if(axis==${this.AXIS_RADIAL}) {
            r = sqrt(sqr(_tx - centre_x) + sqr(_ty - centre_y) + sqr(_tz - centre_z));
          }
          else if(axis==${this.AXIS_YZ}) {
            r = sqrt(sqr(_ty - centre_y) + sqr(_tz - centre_z));
          }
          else if(axis==${this.AXIS_ZX}) {
            r = sqrt(sqr(_tz - centre_z) + sqr(_tx - centre_x));
          }
          else { // AXIS_XY   
            r = sqrt(sqr(_tx - centre_x) + sqr(_ty - centre_y));
          }
          float dl = r / wavelen;
          float amplitude = amount;
          if (abs(damping) > EPSILON) {
            float dmp = -dl * damping;
            amplitude *= exp(dmp);
          }
          float amp = amplitude * sin(2.0 * M_PI * dl + phase);
          if(axis==${this.AXIS_RADIAL}) {
            float dx = _tx - centre_x;
            float dy = _ty - centre_y;
            float dz = _tz - centre_z;
            float dr = sqrt(sqr(dx) + sqr(dy) + sqr(dz)) + EPSILON;
            _tx += dx * amp / dr;
            _ty += dy * amp / dr;
            _tz += dz * amp / dr;
          }
          else if(axis==${this.AXIS_YZ}) {
            _tx += amp;
          }
          else if(axis==${this.AXIS_ZX}) {
            _ty += amp;
          }
          else { // AXIS_XY:
            _tz += amp;
          }
        }`;
    }

    get name(): string {
        return 'pre_wave3D_wf';
    }

    get priority(): number {
        return -1
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_PRE];
    }
}

class PulseFunc extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 2.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          _vx += amount * (_tx + scalex * sin(_tx * freqx));
          _vy += amount * (_ty + scaley * sin(_ty * freqy));
        }`;
    }

    get name(): string {
        return 'pulse';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Vibration2Func extends VariationShaderFunc2D {
    PARAM_DIR = 'dir'
    PARAM_ANGLE = 'angle'
    PARAM_FREQ = 'freq'
    PARAM_AMP = 'amp'
    PARAM_PHASE = 'phase'
    PARAM_DIR2 = 'dir2'
    PARAM_ANGLE2 = 'angle2'
    PARAM_FREQ2 = 'freq2'
    PARAM_AMP2 = 'amp2'
    PARAM_PHASE2 = 'phase2'
    PARAM_DM = 'dm'
    PARAM_DMFREQ = 'dmfreq'
    PARAM_TM = 'tm'
    PARAM_TMFREQ = 'tmfreq'
    PARAM_FM = 'fm'
    PARAM_FMFREQ = 'fmfreq'
    PARAM_AM = 'am'
    PARAM_AMFREQ = 'amfreq'
    PARAM_D2M = 'd2m'
    PARAM_D2MFREQ = 'd2mfreq'
    PARAM_T2M = 't2m'
    PARAM_T2MFREQ = 't2mfreq'
    PARAM_F2M = 'f2m'
    PARAM_F2MFREQ = 'f2mfreq'
    PARAM_A2M = 'a2m'
    PARAM_A2MFREQ = 'a2mfreq'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_DIR, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_ANGLE, type: VariationParamType.VP_NUMBER, initialValue: 1.5708 },
            { name: this.PARAM_FREQ, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_AMP, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_PHASE, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_DIR2, type: VariationParamType.VP_NUMBER, initialValue: 1.5708 },
            { name: this.PARAM_ANGLE2, type: VariationParamType.VP_NUMBER, initialValue: 1.5708 },
            { name: this.PARAM_FREQ2, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_AMP2, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_PHASE2, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_DM, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_DMFREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_TM, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_TMFREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_FM, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_FMFREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_AM, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_AMFREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_D2M, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_D2MFREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_T2M, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_T2MFREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_F2M, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_F2MFREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_A2M, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_A2MFREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.10 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /*
        * vibration2 by FarDareisMai
        * https://www.deviantart.com/fardareismai/art/Apo-Plugins-Vibration-1-and-2-252001851 converted by Brad Stefanov
        */
        return `{
          float amount = float(${variation.amount});
          float dir = float(${variation.params.get(this.PARAM_DIR)});
          float angle = float(${variation.params.get(this.PARAM_ANGLE)});
          float freq = float(${variation.params.get(this.PARAM_FREQ)});
          float amp = float(${variation.params.get(this.PARAM_AMP)});
          float phase = float(${variation.params.get(this.PARAM_PHASE)});
          float dir2 = float(${variation.params.get(this.PARAM_DIR2)});
          float angle2 = float(${variation.params.get(this.PARAM_ANGLE2)});
          float freq2 = float(${variation.params.get(this.PARAM_FREQ2)});
          float amp2 = float(${variation.params.get(this.PARAM_AMP2)});
          float phase2 = float(${variation.params.get(this.PARAM_PHASE2)});
          float dm = float(${variation.params.get(this.PARAM_DM)}); 
          float dmfreq = float(${variation.params.get(this.PARAM_DMFREQ)});
          float tm = float(${variation.params.get(this.PARAM_TM)});
          float tmfreq = float(${variation.params.get(this.PARAM_TMFREQ)});
          float fm = float(${variation.params.get(this.PARAM_FM)});
          float fmfreq = float(${variation.params.get(this.PARAM_FMFREQ)});
          float am = float(${variation.params.get(this.PARAM_AM)});       
          float amfreq = float(${variation.params.get(this.PARAM_AMFREQ)});
          float d2m = float(${variation.params.get(this.PARAM_D2M)});
          float d2mfreq = float(${variation.params.get(this.PARAM_D2MFREQ)});
          float t2m = float(${variation.params.get(this.PARAM_T2M)});
          float t2mfreq = float(${variation.params.get(this.PARAM_T2MFREQ)});
          float f2m = float(${variation.params.get(this.PARAM_F2M)});     
          float f2mfreq = float(${variation.params.get(this.PARAM_F2MFREQ)});
          float a2m = float(${variation.params.get(this.PARAM_A2M)});
          float a2mfreq = float(${variation.params.get(this.PARAM_A2MFREQ)});
        
          float d_along_dir = _tx * cos(dir) + _ty * sin(dir);
          float dirL = dir + vib2_modulate(dm, dmfreq, d_along_dir);
          float angleL = angle + vib2_modulate(tm, tmfreq, d_along_dir);
          float freqL = vib2_modulate(fm, fmfreq, d_along_dir) / freq;
          float ampL = amp + amp * vib2_modulate(am, amfreq, d_along_dir);
        
          float total_angle = angleL + dirL;
          float cos_dir = cos(dirL);
          float sin_dir = sin(dirL);
          float cos_tot = cos(total_angle);
          float sin_tot = sin(total_angle);
          float scaled_freq = freq * (2.0*M_PI);
          float phase_shift = (2.0*M_PI) * phase / freq;
          d_along_dir = _tx * cos_dir + _ty * sin_dir;
          float local_amp = ampL * sin((d_along_dir * scaled_freq) + freqL + phase_shift);
        
          float x = _tx + local_amp * cos_tot;
          float y = _ty + local_amp * sin_tot;
        
          d_along_dir = _tx * cos(dir2) + _ty * sin(dir2);
          dirL = dir2 + vib2_modulate(d2m, d2mfreq, d_along_dir);
          angleL = angle2 + vib2_modulate(t2m, t2mfreq, d_along_dir);
          freqL = vib2_modulate(f2m, f2mfreq, d_along_dir) / freq2;
          ampL = amp2 + amp2 * vib2_modulate(a2m, a2mfreq, d_along_dir);
        
          total_angle = angleL + dirL;
          cos_dir = cos(dirL);
          sin_dir = sin(dirL);
          cos_tot = cos(total_angle);
          sin_tot = sin(total_angle);
          scaled_freq = freq2 * (2.0*M_PI);
          phase_shift = (2.0*M_PI) * phase2 / freq2;
          d_along_dir = _tx * cos_dir + _ty * sin_dir;
          local_amp = ampL * sin((d_along_dir * scaled_freq) + freqL + phase_shift);
        
          x += local_amp * cos_tot;
          y += local_amp * sin_tot;
        
          _vx += amount * x;
          _vy += amount * y;
        }`;
    }

    get name(): string {
        return 'vibration2';
    }

    get funcDependencies(): string[] {
        return [LIB_VIBRATION2];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RippleFunc extends VariationShaderFunc2D {
    PARAM_FREQUENCY = 'frequency'
    PARAM_VELOCITY = 'velocity'
    PARAM_AMPLITUDE = 'amplitude'
    PARAM_CENTERX = 'centerx'
    PARAM_CENTERY = 'centery'
    PARAM_PHASE = 'phase'
    PARAM_SCALE = 'scale'
    PARAM_FIXED_DIST_CALC = 'fixed_dist_calc'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FREQUENCY, type: VariationParamType.VP_NUMBER, initialValue:  2.0 },
            { name: this.PARAM_VELOCITY, type: VariationParamType.VP_NUMBER, initialValue:  1.0 },
            { name: this.PARAM_AMPLITUDE, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_CENTERX, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_CENTERY, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_PHASE, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue:  1.0 },
            { name: this.PARAM_FIXED_DIST_CALC, type: VariationParamType.VP_NUMBER, initialValue:  0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Ripple by Xyrus02, http://xyrus02.deviantart.com/art/Ripple-Plugin-for-Apophysis-154713493
        // align input x, y to given center and multiply with scale
        return `{
          float amount = float(${variation.amount});
          float frequency = float(${variation.params.get(this.PARAM_FREQUENCY)});
          float velocity = float(${variation.params.get(this.PARAM_VELOCITY)});
          float amplitude = float(${variation.params.get(this.PARAM_AMPLITUDE)});
          float centerx = float(${variation.params.get(this.PARAM_CENTERX)});
          float centery = float(${variation.params.get(this.PARAM_CENTERY)});
          float phase = float(${variation.params.get(this.PARAM_PHASE)});
          float scale = float(${variation.params.get(this.PARAM_SCALE)});
          int fixed_dist_calc = int(${variation.params.get(this.PARAM_FIXED_DIST_CALC)});
          float _f = frequency * 5.0;
          float a = amplitude * 0.01;
          float _p = phase * 2.0 * M_PI - M_PI;         
          float _s = (scale == 0.0) ? EPSILON : scale;
          float _is = 1.0 / _s;
          float _vxp = velocity * _p;
          float _pxa = _p * a;
          float _pixa = (M_PI - _p) * a;
          float x = (_tx * _s) - centerx, y = (_ty * _s) + centery;    
          float d = ( fixed_dist_calc != 0 )? sqrt(x * x + y * y) : sqrt(x * x * y * y);
          if (d < EPSILON)
            d = EPSILON;      
          float nx = x / d, ny = y / d;
          float wave = cos(_f * d - _vxp);
          float d1 = wave * _pxa + d, d2 = wave * _pixa + d;   
          float u1 = (centerx + nx * d1), v1 = (-centery + ny * d1);
          float u2 = (centerx + nx * d2), v2 = (-centery + ny * d2);   
          _vx = amount * (lerp(u1, u2, _p)) * _is;
          _vy = amount * (lerp(v1, v2, _p)) * _is;
        }`;
    }

    get name(): string {
        return 'ripple';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class RippledFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // rippled by Raykoid666, http://raykoid666.deviantart.com/art/plugin-pack-3-100510461?q=gallery%3ARaykoid666%2F11060240&qo=16
        return `{
          float amount = float(${variation.amount});
          float d = sqr(_tx) + sqr(_ty);
          _vx += amount / 2.0 * (tanh(d + EPSILON) * (2.0 * _tx));
          _vy += amount / 2.0 * (cos(d + EPSILON) * (2.0 * _ty));
        }`;
    }

    get name(): string {
        return 'rippled';
    }

    get funcDependencies(): string[] {
        return [FUNC_TANH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class SinusGridFunc extends VariationShaderFunc2D {
    PARAM_AMPX = 'ampx'
    PARAM_AMPY = 'ampy'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_AMPX, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_AMPY, type: VariationParamType.VP_NUMBER, initialValue: 0.6 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 1.2 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* SinusGrid, originally written by Georg K. (http://xyrus02.deviantart.com) */
        return `{
          float amount = float(${variation.amount});
          float ampx = float(${variation.params.get(this.PARAM_AMPX)});
          float ampy = float(${variation.params.get(this.PARAM_AMPY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          float _fx = freqx * 2.0 *M_PI;
          float _fy = freqy * 2.0 * M_PI;
          if (_fx == 0.0) _fx = EPSILON;
          if (_fy == 0.0) _fy = EPSILON;
          float x = _tx, y = _ty;
          float sx = -cos(x * _fx);
          float sy = -cos(y * _fy);
          float tx = lerp(_tx, sx, ampx), ty = lerp(_ty, sy, ampy), tz = _tz;
          _vx += amount * tx;
          _vy += amount * ty;
          _vz += amount * tz;
        }`;
    }

    get name(): string {
        return 'sinusgrid';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class WavesFunc extends VariationShaderFunc2D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          _vx += amount * (_tx + ${xform.c10.toWebGl()} * sin(_ty / (${xform.c20.toWebGl()} * ${xform.c20.toWebGl()} + EPSILON)));
          _vy += amount * (_ty + ${xform.c11.toWebGl()} * sin(_tx / (${xform.c21.toWebGl()} * ${xform.c21.toWebGl()} + EPSILON)));
        }`;
    }

    get name(): string {
        return 'waves';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves2Func extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue: 0.25 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue: 0.5 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 4 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves2 from Joel F */
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          _vx += amount * (_tx + scalex * sin(_ty * freqx));
          _vy += amount * (_ty + scaley * sin(_tx * freqy));
        }`;
    }

    get name(): string {
        return 'waves2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves22Func extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'
    PARAM_MODEX = 'modex'
    PARAM_MODEY = 'modey'
    PARAM_POWERX = 'powerx'
    PARAM_POWERY = 'powery'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_MODEX, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_MODEY, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_POWERX, type: VariationParamType.VP_NUMBER, initialValue:  2.00 },
            { name: this.PARAM_POWERY, type: VariationParamType.VP_NUMBER, initialValue:  2.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* weird waves22 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int modex = int(${variation.params.get(this.PARAM_MODEX)});
          int modey = int(${variation.params.get(this.PARAM_MODEY)});
          float powerx = float(${variation.params.get(this.PARAM_POWERX)});
          float powery = float(${variation.params.get(this.PARAM_POWERY)});
          float x0 = _tx;
          float y0 = _ty;
          float sinx;
          float siny;
          int px =  int(powerx);
          int py =  int(powery);  
          if (modex < 1) {
            sinx = sin(y0 * freqx);
          } else {
            sinx = 0.5 * (1.0 + sin(y0 * freqx));
          }
          float offsetx = pow(sinx, float(px)) * scalex;
          if (modey < 1) {
            siny = sin(x0 * freqy);
          } else {
            siny = 0.5 * (1.0 + sin(x0 * freqy));
          }
          float offsety = pow(siny, float(py)) * scaley; 
          _vx += amount * (x0 + offsetx);
          _vy += amount * (y0 + offsety);
        }`;
    }

    get name(): string {
        return 'waves22';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves23Func extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves23 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          float x0 = _tx;
          float y0 = _ty;
          float mx = y0 * freqx * (1.0 / (M_PI + M_PI));
          float fx = mx - floor(mx);
          if (fx > 0.5) fx = 0.5 - fx;
          float my = x0 * freqy * (1.0 / (M_PI + M_PI));
          float fy = my - floor(my);
          if (fy > 0.5) fy = 0.5 - fy;
          _vx += amount * (x0 + fx * scalex);
          _vy += amount * (y0 + fy * scaley);
        }`;
    }

    get name(): string {
        return 'waves23';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves2BFunc extends VariationShaderFunc2D {
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'
    PARAM_PWX = 'pwx'
    PARAM_PWY = 'pwy'
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEINFX = 'scaleinfx'
    PARAM_SCALEY = 'scaley'
    PARAM_SCALEINFY = 'scaleinfy'
    PARAM_UNITY = 'unity'
    PARAM_JACOK = 'jacok'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue:  1.50 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue:  2.50 },
            { name: this.PARAM_PWX, type: VariationParamType.VP_NUMBER, initialValue: 1.00 },
            { name: this.PARAM_PWY, type: VariationParamType.VP_NUMBER, initialValue: 1.50 },
            { name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_SCALEINFX, type: VariationParamType.VP_NUMBER, initialValue: 1.0 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.75 },
            { name: this.PARAM_SCALEINFY, type: VariationParamType.VP_NUMBER, initialValue:  1.50 },
            { name: this.PARAM_UNITY, type: VariationParamType.VP_NUMBER, initialValue:  1.50 },
            { name: this.PARAM_JACOK, type: VariationParamType.VP_NUMBER, initialValue:  0.25 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // Waves2B by dark-beam, http://dark-beam.deviantart.com/art/Waves2b-UPDATE-FIX-456744888
        return `{
          float amount = float(${variation.amount});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          float pwx = float(${variation.params.get(this.PARAM_PWX)});
          float pwy = float(${variation.params.get(this.PARAM_PWY)});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaleinfx = float(${variation.params.get(this.PARAM_SCALEINFX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float scaleinfy = float(${variation.params.get(this.PARAM_SCALEINFY)});
          float unity = float(${variation.params.get(this.PARAM_UNITY)});
          float jacok = float(${variation.params.get(this.PARAM_JACOK)});
          float _six = scalex - scaleinfx;
          float _siy = scaley - scaleinfy;
          float CsX = 1.0;
          float CsY = 1.0;
          float JCB_sn;
          CsX = safediv(unity, (unity + sqr(_tx)));
          CsX = CsX * _six + scaleinfx;
          CsY = safediv(unity, (unity + sqr(_ty)));
          CsY = CsY * _siy + scaleinfy;      
          if (pwx >= 0.0 && pwx < 1e-4) { 
            JCB_sn = jacobi_elliptic(_ty * freqx, jacok);
            _vx += amount * (_tx + CsX * JCB_sn);
          } else if (pwx < 0.0 && pwx > -1e-4) { 
            _vx += amount * (_tx + CsX * j1(_ty * freqx));
          } else { 
            _vx += amount * (_tx + CsX * sin(sgn(_ty) * pow(abs(_ty) + 1e-10, pwx) * freqx));
          }
          if (pwy >= 0.0 && pwy < 1e-4) { 
            JCB_sn = jacobi_elliptic(_tx * freqy, jacok);
            _vy += amount * (_ty + CsY * JCB_sn);
          } else if (pwy < 0.0 && pwy > -1e-4) { 
            _vy += amount * (_ty + CsY * j1(_tx * freqy));
          } else { 
            _vy += amount * (_ty + CsY * sin(sgn(_tx) * pow(abs(_tx) + 1e-10, pwy) * freqy));
          }
       }`;
    }

    get name(): string {
        return 'waves2b';
    }

    get funcDependencies(): string[] {
        return [FUNC_SAFEDIV, FUNC_SGN, FUNC_J1, FUNC_TANH, FUNC_JACOBI_ELLIPTIC];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves2RadialFunc extends VariationShaderFunc2D {
    PARAM_W2R_SCALEX = 'w2r_scalex'
    PARAM_W2R_SCALEY = 'w2r_scaley'
    PARAM_W2R_FREQX = 'w2r_freqx'
    PARAM_W2R_FREQY = 'w2r_freqy'
    PARAM_W2R_NULL = 'w2r_null'
    PARAM_W2R_DISTANCE = 'w2r_distance'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_W2R_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.10 },
            { name: this.PARAM_W2R_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.10 },
            { name: this.PARAM_W2R_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_W2R_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_W2R_NULL, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_W2R_DISTANCE, type: VariationParamType.VP_NUMBER, initialValue: 10.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // waves2_radial variation created by Tatyana Zabanova implemented into JWildfire by Brad Stefanov
        return `{
          float amount = float(${variation.amount});
          float w2r_scalex = float(${variation.params.get(this.PARAM_W2R_SCALEX)});
          float w2r_scaley = float(${variation.params.get(this.PARAM_W2R_SCALEY)});
          float w2r_freqx = float(${variation.params.get(this.PARAM_W2R_FREQX)});
          float w2r_freqy = float(${variation.params.get(this.PARAM_W2R_FREQY)});
          float w2r_null = float(${variation.params.get(this.PARAM_W2R_NULL)});
          float w2r_distance = float(${variation.params.get(this.PARAM_W2R_DISTANCE)});
          float x0 = _tx;
          float y0 = _ty;
          float dist = sqrt(sqr(x0) + sqr(y0));
          float factor = (dist < w2r_distance) ? (dist - w2r_null) / (w2r_distance - w2r_null) : 1.0;
          factor = (dist < w2r_null) ? 0.0 : factor;
          _vx += amount * (x0 + factor * sin(y0 * w2r_freqx) * w2r_scalex);
          _vy += amount * (y0 + factor * sin(x0 * w2r_freqy) * w2r_scaley);
        }`;
    }

    get name(): string {
        return 'waves2_radial';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves2WFFunc extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'
    PARAM_USE_COS_X = 'use_cos_x'
    PARAM_USE_COS_Y = 'use_cos_y'
    PARAM_DAMPX = 'dampx'
    PARAM_DAMPY = 'dampy'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.25 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.50 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2.0 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 4.0 },
            { name: this.PARAM_USE_COS_X, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_USE_COS_Y, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_DAMPX, type: VariationParamType.VP_NUMBER, initialValue:  0.00 },
            { name: this.PARAM_DAMPY, type: VariationParamType.VP_NUMBER, initialValue:  0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Modified version of waves2 from Joel F */
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int use_cos_x = int(${variation.params.get(this.PARAM_USE_COS_X)});
          int use_cos_y = int(${variation.params.get(this.PARAM_USE_COS_Y)});
          float dampx = float(${variation.params.get(this.PARAM_DAMPX)});
          float dampy = float(${variation.params.get(this.PARAM_DAMPY)});
          float _dampingX = abs(dampx) < EPSILON ? 1.0 : exp(dampx);
          float _dampingY = abs(dampy) < EPSILON ? 1.0 : exp(dampy);
          if (use_cos_x == 1) {
            _vx += amount * (_tx + _dampingX * scalex * cos(_ty * freqx)) * _dampingX;
          } else {
            _vx += amount * (_tx + _dampingX * scalex * sin(_ty * freqx)) * _dampingX;
          }
          if (use_cos_y == 1) {
            _vy += amount * (_ty + _dampingY * scaley * cos(_tx * freqy)) * _dampingY;
          } else {
            _vy += amount * (_ty + _dampingY * scaley * sin(_tx * freqy)) * _dampingY;
          }
        }`;
    }

    get name(): string {
        return 'waves2_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves2_3DFunc extends VariationShaderFunc3D {
    PARAM_FREQ = 'freq'
    PARAM_SCALE = 'scale'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FREQ, type: VariationParamType.VP_NUMBER, initialValue: 2.00 },
            { name: this.PARAM_SCALE, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves2_3D by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
        return `{
          float amount = float(${variation.amount});
          float freq = float(${variation.params.get(this.PARAM_FREQ)});
          float scale = float(${variation.params.get(this.PARAM_SCALE)});
          float avgxy = (_tx + _ty) / 2.0;
          _vx += amount * (_tx + scale * sin(_ty * freq));
          _vy += amount * (_ty + scale * sin(_tx * freq));
          _vz += amount * (_tz + scale * sin(avgxy * freq)); 
        }`;
    }

    get name(): string {
        return 'waves2_3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Waves3Func extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'
    PARAM_SX_FREQ = 'sx_freq'
    PARAM_SY_FREQ = 'sy_freq'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_SX_FREQ, type: VariationParamType.VP_NUMBER, initialValue: 0.00 },
            { name: this.PARAM_SY_FREQ, type: VariationParamType.VP_NUMBER, initialValue: 2.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves3 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          float sx_freq = float(${variation.params.get(this.PARAM_SX_FREQ)});
          float sy_freq = float(${variation.params.get(this.PARAM_SY_FREQ)});
          float x0 = _tx;
          float y0 = _ty;
          float scalexx = 0.5 * scalex * (1.0 + sin(y0 * sx_freq));
          float scaleyy = 0.5 * scaley * (1.0 + sin(x0 * sy_freq));
          _vx += amount * (x0 + sin(y0 * freqx) * scalexx);
          _vy += amount * (y0 + sin(x0 * freqy) * scaleyy);
        }`;
    }

    get name(): string {
        return 'waves3';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves3WFFunc extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'
    PARAM_USE_COS_X = 'use_cos_x'
    PARAM_USE_COS_Y = 'use_cos_y'
    PARAM_DAMPX = 'dampx'
    PARAM_DAMPY = 'dampy'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.25 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.50 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2.0 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 4.0 },
            { name: this.PARAM_USE_COS_X, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_USE_COS_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_DAMPX, type: VariationParamType.VP_NUMBER, initialValue:  0.00 },
            { name: this.PARAM_DAMPY, type: VariationParamType.VP_NUMBER, initialValue:  0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Modified version of waves2 from Joel F */
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int use_cos_x = int(${variation.params.get(this.PARAM_USE_COS_X)});
          int use_cos_y = int(${variation.params.get(this.PARAM_USE_COS_Y)});
          float dampx = float(${variation.params.get(this.PARAM_DAMPX)});
          float dampy = float(${variation.params.get(this.PARAM_DAMPY)});
          float _dampingX = abs(dampx) < EPSILON ? 1.0 : exp(dampx);
          float _dampingY = abs(dampy) < EPSILON ? 1.0 : exp(dampy);
          if (use_cos_x == 1) {
            _vx += amount * (_tx + _dampingX * scalex * cos(_ty * freqx) * cos(_ty * freqx)) * _dampingX;
          } else {
            _vx += amount * (_tx + _dampingX * scalex * sin(_ty * freqx) * sin(_ty * freqx)) * _dampingX;
          }
          if (use_cos_y == 1) {
            _vy += amount * (_ty + _dampingY * scaley * cos(_tx * freqy) * cos(_tx * freqy)) * _dampingY;
          } else {
            _vy += amount * (_ty + _dampingY * scaley * sin(_tx * freqy) * sin(_tx * freqy)) * _dampingY;
          }
        }`;
    }

    get name(): string {
        return 'waves3_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves4Func extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'
    PARAM_CONT = 'cont'
    PARAM_YFACT = 'yfact'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_CONT, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_YFACT, type: VariationParamType.VP_NUMBER, initialValue: 0.10 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves4 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int cont = int(${variation.params.get(this.PARAM_CONT)});
          float yfact = float(${variation.params.get(this.PARAM_YFACT)});
          float x0 = _tx;
          float y0 = _ty;
          float ax = floor(y0 * freqx / (2.0*M_PI));

          ax = sin(ax * 12.9898 + ax * 78.233 + 1.0 + y0 * 0.001 * yfact) * 43758.5453;
          ax = ax - float(int(ax));
          if (cont == 1) ax = (ax > 0.5) ? 1.0 : 0.0;
          
          _vx += amount * (x0 + sin(y0 * freqx) * ax * ax * scalex);
          _vy += amount * (y0 + sin(x0 * freqy) * scaley);
        }`;
    }

    get name(): string {
        return 'waves4';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves42Func extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'
    PARAM_CONT = 'cont'
    PARAM_YFACT = 'yfact'
    PARAM_FREQX2 = 'freqx2'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.05 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: 7.00 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: 13.00 },
            { name: this.PARAM_CONT, type: VariationParamType.VP_NUMBER, initialValue: 0 },
            { name: this.PARAM_YFACT, type: VariationParamType.VP_NUMBER, initialValue: 0.10 },
            { name: this.PARAM_FREQX2, type: VariationParamType.VP_NUMBER, initialValue: 1.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* waves42 from Tatyana Zabanova converted by Brad Stefanov https://www.deviantart.com/tatasz/art/Weird-Waves-Plugin-Pack-1-783560564*/
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int cont = int(${variation.params.get(this.PARAM_CONT)});
          float yfact = float(${variation.params.get(this.PARAM_YFACT)});
          float freqx2 = float(${variation.params.get(this.PARAM_FREQX2)});
          float x0 = _tx;
          float y0 = _ty;
          float ax = floor(y0 * freqx2);   
          ax = sin(ax * 12.9898 + ax * 78.233 + 1.0 + y0 * 0.001 * yfact) * 43758.5453;
          ax = ax - float(int(ax));
          if (cont == 1) {
            ax = (ax > 0.5) ? 1.0 : 0.0;
          }
          _vx += amount * (x0 + sin(y0 * freqx) * ax * ax * scalex);
          _vy += amount * (y0 + sin(x0 * freqy) * scaley);
        }`;
    }

    get name(): string {
        return 'waves42';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

class Waves4WFFunc extends VariationShaderFunc2D {
    PARAM_SCALEX = 'scalex'
    PARAM_SCALEY = 'scaley'
    PARAM_FREQX = 'freqx'
    PARAM_FREQY = 'freqy'
    PARAM_USE_COS_X = 'use_cos_x'
    PARAM_USE_COS_Y = 'use_cos_y'
    PARAM_DAMPX = 'dampx'
    PARAM_DAMPY = 'dampy'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SCALEX, type: VariationParamType.VP_NUMBER, initialValue:  0.25 },
            { name: this.PARAM_SCALEY, type: VariationParamType.VP_NUMBER, initialValue:  0.50 },
            { name: this.PARAM_FREQX, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 2.0 },
            { name: this.PARAM_FREQY, type: VariationParamType.VP_NUMBER, initialValue: M_PI / 4.0 },
            { name: this.PARAM_USE_COS_X, type: VariationParamType.VP_NUMBER, initialValue: 1 },
            { name: this.PARAM_USE_COS_Y, type: VariationParamType.VP_NUMBER, initialValue: 0.0 },
            { name: this.PARAM_DAMPX, type: VariationParamType.VP_NUMBER, initialValue:  0.00 },
            { name: this.PARAM_DAMPY, type: VariationParamType.VP_NUMBER, initialValue:  0.00 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Modified version of waves2 from Joel F */
        return `{
          float amount = float(${variation.amount});
          float scalex = float(${variation.params.get(this.PARAM_SCALEX)});
          float scaley = float(${variation.params.get(this.PARAM_SCALEY)});
          float freqx = float(${variation.params.get(this.PARAM_FREQX)});
          float freqy = float(${variation.params.get(this.PARAM_FREQY)});
          int use_cos_x = int(${variation.params.get(this.PARAM_USE_COS_X)});
          int use_cos_y = int(${variation.params.get(this.PARAM_USE_COS_Y)});
          float dampx = float(${variation.params.get(this.PARAM_DAMPX)});
          float dampy = float(${variation.params.get(this.PARAM_DAMPY)});
          float _dampingX = abs(dampx) < EPSILON ? 1.0 : exp(dampx);
          float _dampingY = abs(dampy) < EPSILON ? 1.0 : exp(dampy);
          if (use_cos_x == 1) {
            _vx += amount * (_tx + _dampingX * scalex * cos(_ty * freqx) * sin(_ty * freqx) * cos(_ty * freqx)) * _dampingX;
          } else {
            _vx += amount * (_tx + _dampingX * scalex * sin(_ty * freqx) * cos(_ty * freqx) * sin(_ty * freqx)) * _dampingX;
          }
          if (use_cos_y == 1) {
            _vy += amount * (_ty + _dampingY * scaley * cos(_tx * freqy) * sin(_tx * freqy) * cos(_tx * freqy)) * _dampingY;
          } else {
            _vy += amount * (_ty + _dampingY * scaley * sin(_tx * freqy) * cos(_tx * freqy) * sin(_tx * freqy)) * _dampingY;
          }
        }`;
    }

    get name(): string {
        return 'waves4_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_2D];
    }
}

export function registerVars_Waves() {
    VariationMathFunctions.registerFunction(LIB_VIBRATION2,
      `float vib2_modulate(float amp, float freq, float x) {
               return amp * cos(x * freq * M_PI * 2.0);
             }      
        `);

    VariationShaders.registerVar(new PreWave3DWFFunc())
    VariationShaders.registerVar(new PulseFunc())
    VariationShaders.registerVar(new Vibration2Func())
    VariationShaders.registerVar(new RippleFunc())
    VariationShaders.registerVar(new RippledFunc())
    VariationShaders.registerVar(new SinusGridFunc())
    VariationShaders.registerVar(new WavesFunc())
    VariationShaders.registerVar(new Waves2Func())
    VariationShaders.registerVar(new Waves22Func())
    VariationShaders.registerVar(new Waves23Func())
    VariationShaders.registerVar(new Waves2BFunc())
    VariationShaders.registerVar(new Waves2RadialFunc())
    VariationShaders.registerVar(new Waves2WFFunc())
    VariationShaders.registerVar(new Waves2_3DFunc())
    VariationShaders.registerVar(new Waves3Func())
    VariationShaders.registerVar(new Waves3WFFunc())
    VariationShaders.registerVar(new Waves4Func())
    VariationShaders.registerVar(new Waves42Func())
    VariationShaders.registerVar(new Waves4WFFunc())
}
