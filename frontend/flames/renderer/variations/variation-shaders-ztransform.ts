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
    VariationShaderFunc3D,
    VariationTypes
} from './variation-shader-func';
import {VariationShaders} from 'Frontend/flames/renderer/variations/variation-shaders';
import {RenderVariation, RenderXForm} from 'Frontend/flames/model/render-flame';

/*
  be sure to import this class somewhere and call registerVars_ZTransforms()
 */
class FlattenFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          _vz = 0.0;
        }`;
    }

    get name(): string {
        return 'flatten';
    }

    get priority(): number {
        return 1;
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM, VariationTypes.VARTYPE_POST];
    }
}


class InflateZ_1Func extends VariationShaderFunc3D {
    /* inflateZ_1 by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float ang = atan2(_ty, _tx);
          float val1 = _ty * 2.0;
          _vz += amount * (sin(ang) - val1);
        }`;
    }

    get name(): string {
        return 'inflateZ_1';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class InflateZ_2Func extends VariationShaderFunc3D {
    /* inflateZ_2 by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float val1 = _ty * 2.0;
          float val2 = _tx * 2.0;
          float aval = (val1 + val2) * 0.333333;
          _vz += amount * (0.25 - aval);
        }`;
    }

    get name(): string {
        return 'inflateZ_2';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class InflateZ_3Func extends VariationShaderFunc3D {
    /* inflateZ_3 by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float ang = atan2(_ty, _tx);
          float val1 = 0.2 * (M_PI - ang) * cos(3.0 * ang + (_ty - _tx));
          _vz += amount * val1;
        }`;
    }

    get name(): string {
        return 'inflateZ_3';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class InflateZ_4Func extends VariationShaderFunc3D {
    /* inflateZ_4 by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float ang1 = atan2(_ty, _tx);
          float rndm = rand8(tex, rngState);
          float val1 = ((M_PI*0.5) - ang1);
          if (rndm < 0.5) {
            val1 = -val1;
          }
          _vz += amount * val1 * 0.25;
        }`;
    }

    get name(): string {
        return 'inflateZ_4';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class InflateZ_5Func extends VariationShaderFunc3D {
    /* inflateZ_5 by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = float(${variation.amount});
            float ang1 = atan2(_ty, _tx);
            float val1 = cos((M_PI*0.5) - ang1) / 2.0;
            _vz += amount * val1;
        }`;
    }

    get name(): string {
        return 'inflateZ_5';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class InflateZ_6Func extends VariationShaderFunc3D {
    /* inflateZ_6 by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = float(${variation.amount});
          float ang = atan2(_ty, _tx);
          float adf = _ty - _tx;
          float kik = ang * sin(adf);
          _vz += amount * (1.5 - acos(sin(ang) * kik * 0.5));
        }`;
    }

    get name(): string {
        return 'inflateZ_6';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class ZBlurFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
           _vz += amount * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0);
        }`;
    }

    get name(): string {
        return 'zblur';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}


class ZConeFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
           _vz += amount * sqrt(_tx * _tx + _ty * _ty);
        }`;
    }

    get name(): string {
        return 'zcone';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class ZScaleFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
           _vz += amount * _tz;
        }`;
    }

    get name(): string {
        return 'zscale';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

class ZTranslateFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
           float amount = float(${variation.amount});
          _vz += amount;
        }`;
    }

    get name(): string {
        return 'ztranslate';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_ZTRANSFORM];
    }
}

export function registerVars_ZTransforms() {
    VariationShaders.registerVar(new FlattenFunc())
    VariationShaders.registerVar(new InflateZ_1Func())
    VariationShaders.registerVar(new InflateZ_2Func())
    VariationShaders.registerVar(new InflateZ_3Func())
    VariationShaders.registerVar(new InflateZ_4Func())
    VariationShaders.registerVar(new InflateZ_5Func())
    VariationShaders.registerVar(new InflateZ_6Func())
    VariationShaders.registerVar(new ZBlurFunc())
    VariationShaders.registerVar(new ZConeFunc())
    VariationShaders.registerVar(new ZScaleFunc())
    VariationShaders.registerVar(new ZTranslateFunc())
}
