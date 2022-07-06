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

import {VariationParam, VariationParamType, VariationShaderFunc3D, VariationTypes} from './variation-shader-func';
import {VariationShaders} from 'Frontend/flames/renderer/variations/variation-shaders';
import {RenderVariation, RenderXForm} from 'Frontend/flames/model/render-flame';
import {
    FUNC_COSH,
    FUNC_ERF,
    FUNC_HYPOT,
    FUNC_MODULO,
    FUNC_ROUND,
    FUNC_SGN,
    FUNC_SINH,
    LIB_FAST_NOISE_BASE,
    LIB_FAST_NOISE_VALUE_NOISE
} from 'Frontend/flames/renderer/variations/variation-math-functions';

/*
  be sure to import this class somewhere and call registerVars_3D_PartQ()
 */
class QuaternionFunc extends VariationShaderFunc3D {
    PARAM_COSQPOW = 'cosqpow'
    PARAM_COSQX1 = 'cosqx1'
    PARAM_COSQX2 = 'cosqx2'
    PARAM_COSQY1 = 'cosqy1'
    PARAM_COSQY2 = 'cosqy2'
    PARAM_COSQZ1 = 'cosqz1'
    PARAM_COSQZ2 = 'cosqz2'

    PARAM_COSHQPOW = 'coshqpow'
    PARAM_COSHQX1 = 'coshqx1'
    PARAM_COSHQX2 = 'coshqx2'
    PARAM_COSHQY1 = 'coshqy1'
    PARAM_COSHQY2 = 'coshqy2'
    PARAM_COSHQZ1 = 'coshqz1'
    PARAM_COSHQZ2 = 'coshqz2'

    PARAM_COTQPOW = 'cotqpow'
    PARAM_COTQX1 = 'cotqx1'
    PARAM_COTQX2 = 'cotqx2'
    PARAM_COTQY1 = 'cotqy1'
    PARAM_COTQY2 = 'cotqy2'
    PARAM_COTQZ1 = 'cotqz1'
    PARAM_COTQZ2 = 'cotqz2'

    PARAM_COTHQPOW = 'cothqpow'
    PARAM_COTHQX1 = 'cothqx1'
    PARAM_COTHQX2 = 'cothqx2'
    PARAM_COTHQY1 = 'cothqy1'
    PARAM_COTHQY2 = 'cothqy2'
    PARAM_COTHQZ1 = 'cothqz1'
    PARAM_COTHQZ2 = 'cothqz2'

    PARAM_CSCQPOW = 'cscqpow'
    PARAM_CSCQX1 = 'cscqx1'
    PARAM_CSCQX2 = 'cscqx2'
    PARAM_CSCQY1 = 'cscqy1'
    PARAM_CSCQY2 = 'cscqy2'
    PARAM_CSCQZ1 = 'cscqz1'
    PARAM_CSCQZ2 = 'cscqz2'

    PARAM_CSCHQPOW = 'cschqpow'
    PARAM_CSCHQX1 = 'cschqx1'
    PARAM_CSCHQX2 = 'cschqx2'
    PARAM_CSCHQY1 = 'cschqy1'
    PARAM_CSCHQY2 = 'cschqy2'
    PARAM_CSCHQZ1 = 'cschqz1'
    PARAM_CSCHQZ2 = 'cschqz2'

    PARAM_ESTIQPOW = 'estiqpow'
    PARAM_ESTIQX1 = 'estiqx1'
    PARAM_ESTIQY1 = 'estiqy1'
    PARAM_ESTIQY2 = 'estiqy2'
    PARAM_ESTIQZ1 = 'estiqz1'
    PARAM_ESTIQZ2 = 'estiqz2'

    PARAM_LOGQPOW = 'logqpow'
    PARAM_LOGQBASE = 'logqbase'

    PARAM_SECQPOW = 'secqpow'
    PARAM_SECQX1 = 'secqx1'
    PARAM_SECQX2 = 'secqx2'
    PARAM_SECQY1 = 'secqy1'
    PARAM_SECQY2 = 'secqy2'
    PARAM_SECQZ1 = 'secqz1'
    PARAM_SECQZ2 = 'secqz2'

    PARAM_SECHQPOW = 'sechqpow'
    PARAM_SECHQX1 = 'sechqx1'
    PARAM_SECHQX2 = 'sechqx2'
    PARAM_SECHQY1 = 'sechqy1'
    PARAM_SECHQY2 = 'sechqy2'
    PARAM_SECHQZ1 = 'sechqz1'
    PARAM_SECHQZ2 = 'sechqz2'

    PARAM_SINQPOW = 'sinqpow'
    PARAM_SINQX1 = 'sinqx1'
    PARAM_SINQX2 = 'sinqx2'
    PARAM_SINQY1 = 'sinqy1'
    PARAM_SINQY2 = 'sinqy2'
    PARAM_SINQZ1 = 'sinqz1'
    PARAM_SINQZ2 = 'sinqz2'

    PARAM_SINHQPOW = 'sinhqpow'
    PARAM_SINHQX1 = 'sinhqx1'
    PARAM_SINHQX2 = 'sinhqx2'
    PARAM_SINHQY1 = 'sinhqy1'
    PARAM_SINHQY2 = 'sinhqy2'
    PARAM_SINHQZ1 = 'sinhqz1'
    PARAM_SINHQZ2 = 'sinhqz2'

    PARAM_TANQPOW = 'tanqpow'
    PARAM_TANQX1 = 'tanqx1'
    PARAM_TANQX2 = 'tanqx2'
    PARAM_TANQY1 = 'tanqy1'
    PARAM_TANQY2 = 'tanqy2'
    PARAM_TANQZ1 = 'tanqz1'
    PARAM_TANQZ2 = 'tanqz2'

    PARAM_TANHQPOW = 'tanhqpow'
    PARAM_TANHQX1 = 'tanhqx1'
    PARAM_TANHQX2 = 'tanhqx2'
    PARAM_TANHQY1 = 'tanhqy1'
    PARAM_TANHQY2 = 'tanhqy2'
    PARAM_TANHQZ1 = 'tanhqz1'
    PARAM_TANHQZ2 = 'tanhqz2'

    M_E = 2.7182818284590452354;

    get params(): VariationParam[] {
        return [{ name: this.PARAM_COSQPOW, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_COSHQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_COSHQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSHQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSHQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSHQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSHQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COSHQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_COTQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_COTQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_COTHQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_COTHQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTHQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTHQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTHQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTHQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_COTHQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_CSCQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_CSCQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_CSCHQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_CSCHQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCHQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCHQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCHQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCHQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_CSCHQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_ESTIQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_ESTIQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_ESTIQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_ESTIQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_ESTIQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_ESTIQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_LOGQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_LOGQBASE, type: VariationParamType.VP_FLOAT, initialValue: this.M_E },

            { name: this.PARAM_SECQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_SECQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_SECHQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_SECHQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECHQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECHQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECHQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECHQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SECHQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_SINQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_SINQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_SINHQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_SINHQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINHQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINHQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINHQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINHQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SINHQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_TANQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_TANQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },

            { name: this.PARAM_TANHQPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_TANHQX1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANHQX2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANHQY1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANHQY2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANHQZ1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_TANHQZ2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /*
         * Quaternion vars by zephyrtronium
         * http://zephyrtronium.deviantart.com/art
         * /Quaternion-Apo-Plugin-Pack-165451482
         */
        /* Variables and combination by Brad Stefanov */
        return `{
          float amount = ${variation.amount.toWebGl()};
          
          float cosqpow = ${variation.params.get(this.PARAM_COSQPOW)!.toWebGl()};
          float cosqx1 = ${variation.params.get(this.PARAM_COSQX1)!.toWebGl()};
          float cosqx2 = ${variation.params.get(this.PARAM_COSQX2)!.toWebGl()};
          float cosqy1 = ${variation.params.get(this.PARAM_COSQY1)!.toWebGl()};
          float cosqy2 = ${variation.params.get(this.PARAM_COSQY2)!.toWebGl()};
          float cosqz1 = ${variation.params.get(this.PARAM_COSQZ1)!.toWebGl()};
          float cosqz2 = ${variation.params.get(this.PARAM_COSQZ2)!.toWebGl()};

          float coshqpow = ${variation.params.get(this.PARAM_COSHQPOW)!.toWebGl()};
          float coshqx1 = ${variation.params.get(this.PARAM_COSHQX1)!.toWebGl()};
          float coshqx2 = ${variation.params.get(this.PARAM_COSHQX2)!.toWebGl()};
          float coshqy1 = ${variation.params.get(this.PARAM_COSHQY1)!.toWebGl()};
          float coshqy2 = ${variation.params.get(this.PARAM_COSHQY2)!.toWebGl()};
          float coshqz1 = ${variation.params.get(this.PARAM_COSHQZ1)!.toWebGl()};
          float coshqz2 = ${variation.params.get(this.PARAM_COSHQZ2)!.toWebGl()};
          
          float cotqpow = ${variation.params.get(this.PARAM_COTQPOW)!.toWebGl()};
          float cotqx1 = ${variation.params.get(this.PARAM_COTQX1)!.toWebGl()};
          float cotqx2 = ${variation.params.get(this.PARAM_COTQX2)!.toWebGl()};
          float cotqy1 = ${variation.params.get(this.PARAM_COTQY1)!.toWebGl()};
          float cotqy2 = ${variation.params.get(this.PARAM_COTQY2)!.toWebGl()};
          float cotqz1 = ${variation.params.get(this.PARAM_COTQZ1)!.toWebGl()};
          float cotqz2 = ${variation.params.get(this.PARAM_COTQZ2)!.toWebGl()};

          float cothqpow = ${variation.params.get(this.PARAM_COTHQPOW)!.toWebGl()};
          float cothqx1 = ${variation.params.get(this.PARAM_COTHQX1)!.toWebGl()};
          float cothqx2 = ${variation.params.get(this.PARAM_COTHQX2)!.toWebGl()};
          float cothqy1 = ${variation.params.get(this.PARAM_COTHQY1)!.toWebGl()};
          float cothqy2 = ${variation.params.get(this.PARAM_COTHQY2)!.toWebGl()};
          float cothqz1 = ${variation.params.get(this.PARAM_COTHQZ1)!.toWebGl()};
          float cothqz2 = ${variation.params.get(this.PARAM_COTHQZ2)!.toWebGl()};
          
          float cscqpow = ${variation.params.get(this.PARAM_CSCQPOW)!.toWebGl()};
          float cscqx1 = ${variation.params.get(this.PARAM_CSCQX1)!.toWebGl()};
          float cscqx2 = ${variation.params.get(this.PARAM_CSCQX2)!.toWebGl()};
          float cscqy1 = ${variation.params.get(this.PARAM_CSCQY1)!.toWebGl()};
          float cscqy2 = ${variation.params.get(this.PARAM_CSCQY2)!.toWebGl()};
          float cscqz1 = ${variation.params.get(this.PARAM_CSCQZ1)!.toWebGl()};
          float cscqz2 = ${variation.params.get(this.PARAM_CSCQZ2)!.toWebGl()};
          
          float cschqpow = ${variation.params.get(this.PARAM_CSCHQPOW)!.toWebGl()};
          float cschqx1 = ${variation.params.get(this.PARAM_CSCHQX1)!.toWebGl()};
          float cschqx2 = ${variation.params.get(this.PARAM_CSCHQX2)!.toWebGl()};
          float cschqy1 = ${variation.params.get(this.PARAM_CSCHQY1)!.toWebGl()};
          float cschqy2 = ${variation.params.get(this.PARAM_CSCHQY2)!.toWebGl()};
          float cschqz1 = ${variation.params.get(this.PARAM_CSCHQZ1)!.toWebGl()};
          float cschqz2 = ${variation.params.get(this.PARAM_CSCHQZ2)!.toWebGl()};
          
          float estiqpow = ${variation.params.get(this.PARAM_ESTIQPOW)!.toWebGl()};
          float estiqx1 = ${variation.params.get(this.PARAM_ESTIQX1)!.toWebGl()};
          float estiqy1 = ${variation.params.get(this.PARAM_ESTIQY1)!.toWebGl()};
          float estiqy2 = ${variation.params.get(this.PARAM_ESTIQY2)!.toWebGl()};
          float estiqz1 = ${variation.params.get(this.PARAM_ESTIQZ1)!.toWebGl()};
          float estiqz2 = ${variation.params.get(this.PARAM_ESTIQZ2)!.toWebGl()};                    
                    
          float logqpow = ${variation.params.get(this.PARAM_LOGQPOW)!.toWebGl()};
          float logqbase = ${variation.params.get(this.PARAM_LOGQBASE)!.toWebGl()};
          
          float secqpow = ${variation.params.get(this.PARAM_SECQPOW)!.toWebGl()};
          float secqx1 = ${variation.params.get(this.PARAM_SECQX1)!.toWebGl()};
          float secqx2 = ${variation.params.get(this.PARAM_SECQX2)!.toWebGl()};
          float secqy1 = ${variation.params.get(this.PARAM_SECQY1)!.toWebGl()};
          float secqy2 = ${variation.params.get(this.PARAM_SECQY2)!.toWebGl()};
          float secqz1 = ${variation.params.get(this.PARAM_SECQZ1)!.toWebGl()};
          float secqz2 = ${variation.params.get(this.PARAM_SECQZ2)!.toWebGl()};
          
          float sechqpow = ${variation.params.get(this.PARAM_SECHQPOW)!.toWebGl()};
          float sechqx1 = ${variation.params.get(this.PARAM_SECHQX1)!.toWebGl()};
          float sechqx2 = ${variation.params.get(this.PARAM_SECHQX2)!.toWebGl()};
          float sechqy1 = ${variation.params.get(this.PARAM_SECHQY1)!.toWebGl()};
          float sechqy2 = ${variation.params.get(this.PARAM_SECHQY2)!.toWebGl()};
          float sechqz1 = ${variation.params.get(this.PARAM_SECHQZ1)!.toWebGl()};
          float sechqz2 = ${variation.params.get(this.PARAM_SECHQZ2)!.toWebGl()};
         
          float sinqpow = ${variation.params.get(this.PARAM_SINQPOW)!.toWebGl()};
          float sinqx1 = ${variation.params.get(this.PARAM_SINQX1)!.toWebGl()};
          float sinqx2 = ${variation.params.get(this.PARAM_SINQX2)!.toWebGl()};
          float sinqy1 = ${variation.params.get(this.PARAM_SINQY1)!.toWebGl()};
          float sinqy2 = ${variation.params.get(this.PARAM_SINQY2)!.toWebGl()};
          float sinqz1 = ${variation.params.get(this.PARAM_SINQZ1)!.toWebGl()};
          float sinqz2 = ${variation.params.get(this.PARAM_SINQZ2)!.toWebGl()};

          float sinhqpow = ${variation.params.get(this.PARAM_SINHQPOW)!.toWebGl()};
          float sinhqx1 = ${variation.params.get(this.PARAM_SINHQX1)!.toWebGl()};
          float sinhqx2 = ${variation.params.get(this.PARAM_SINHQX2)!.toWebGl()};
          float sinhqy1 = ${variation.params.get(this.PARAM_SINHQY1)!.toWebGl()};
          float sinhqy2 = ${variation.params.get(this.PARAM_SINHQY2)!.toWebGl()};
          float sinhqz1 = ${variation.params.get(this.PARAM_SINHQZ1)!.toWebGl()};
          float sinhqz2 = ${variation.params.get(this.PARAM_SINHQZ2)!.toWebGl()};

          float tanqpow = ${variation.params.get(this.PARAM_TANQPOW)!.toWebGl()};
          float tanqx1 = ${variation.params.get(this.PARAM_TANQX1)!.toWebGl()};
          float tanqx2 = ${variation.params.get(this.PARAM_TANQX2)!.toWebGl()};
          float tanqy1 = ${variation.params.get(this.PARAM_TANQY1)!.toWebGl()};
          float tanqy2 = ${variation.params.get(this.PARAM_TANQY2)!.toWebGl()};
          float tanqz1 = ${variation.params.get(this.PARAM_TANQZ1)!.toWebGl()};
          float tanqz2 = ${variation.params.get(this.PARAM_TANQZ2)!.toWebGl()};

          float tanhqpow = ${variation.params.get(this.PARAM_TANHQPOW)!.toWebGl()};
          float tanhqx1 = ${variation.params.get(this.PARAM_TANHQX1)!.toWebGl()};
          float tanhqx2 = ${variation.params.get(this.PARAM_TANHQX2)!.toWebGl()};
          float tanhqy1 = ${variation.params.get(this.PARAM_TANHQY1)!.toWebGl()};
          float tanhqy2 = ${variation.params.get(this.PARAM_TANHQY2)!.toWebGl()};
          float tanhqz1 = ${variation.params.get(this.PARAM_TANHQZ1)!.toWebGl()};
          float tanhqz2 = ${variation.params.get(this.PARAM_TANHQZ2)!.toWebGl()};

          float x = 0.0, y = 0.0, z = 0.0;
          if (cosqpow != 0.0) {
            float cosqabs_v = hypot(_ty, _tz) * cosqz1;
            float cosqs = sin(_tx * cosqx1);
            float cosqc = cos(_tx * cosqx2);
            float cosqsh = sinh(cosqabs_v * cosqy1);
            float cosqch = cosh(cosqabs_v * cosqy2);
            float cosqC = amount * cosqs * cosqsh / cosqabs_v * cosqz2;
            x += cosqpow * amount * cosqc * cosqch;
            y += cosqpow * cosqC * _ty;
            z += cosqpow * cosqC * _tz;
          }
          if (coshqpow != 0.0) {
            float coshqabs_v = hypot(_ty, _tz) * coshqz1;
            float coshqs = sin(coshqabs_v * coshqy1);
            float coshqc = cos(coshqabs_v * coshqy2);
            float coshqsh = sinh(_tx * coshqx1);
            float coshqch = cosh(_tx * coshqx2);
            float coshqC = amount * coshqsh * coshqs / coshqabs_v * coshqz2;
            x += coshqpow * amount * coshqch * coshqc;
            y += coshqpow * coshqC * _ty;
            z += coshqpow * coshqC * _tz;
          }
          if (cotqpow != 0.0) {
            float cotqabs_v = hypot(_ty, _tz) * cotqz1;
            float cotqs = sin(_tx * cotqx1);
            float cotqc = cos(_tx * cotqx2);
            float cotqsh = sinh(cotqabs_v * cotqy1);
            float cotqch = cosh(cotqabs_v * cotqy2);
            float cotqsysz = sqr(_ty) + sqr(_tz);
            float cotqni = amount / (sqr(_tx) + cotqsysz);
            float cotqC = cotqc * cotqsh / cotqabs_v * cotqz2;
            float cotqB = -cotqs * cotqsh / cotqabs_v;
            float cotqstcv = cotqs * cotqch;
            float cotqnstcv = -cotqstcv;
            float cotqctcv = cotqc * cotqch;
            x += cotqpow * (cotqstcv * cotqctcv + cotqC * cotqB * cotqsysz) * cotqni;
            y -= cotqpow * (cotqnstcv * cotqB * _ty + cotqC * _ty * cotqctcv) * cotqni;
            z -= cotqpow * (cotqnstcv * cotqB * _tz + cotqC * _tz * cotqctcv) * cotqni;
          }
          if (cothqpow != 0.0) {
            float cothqabs_v = hypot(_ty, _tz) * cothqz1;
            float cothqs = sin(cothqabs_v * cothqy1);
            float cothqc = cos(cothqabs_v * cothqy2);
            float cothqsh = sinh(_tx * cothqx1);
            float cothqch = cosh(_tx * cothqx2);
            float cothqsysz = sqr(_ty) + sqr(_tz);
            float cothqni = amount / (sqr(_tx) + cothqsysz);
            float cothqC = cothqch * cothqs / cothqabs_v * cothqz2;
            float cothqB = cothqsh * cothqs / cothqabs_v;
            float cothqstcv = cothqsh * cothqc;
            float cothqnstcv = -cothqstcv;
            float cothqctcv = cothqch * cothqc;
            x += cothqpow * (cothqstcv * cothqctcv + cothqC * cothqB * cothqsysz) * cothqni;
            y += cothqpow * (cothqnstcv * cothqB * _ty + cothqC * _ty * cothqctcv) * cothqni;
            z += cothqpow * (cothqnstcv * cothqB * _tz + cothqC * _tz * cothqctcv) * cothqni;
          }
          if (cscqpow != 0.0) {
            float cscqabs_v = hypot(_ty, _tz) * cscqz1;
            float cscqs = sin(_tx * cscqx1);
            float cscqc = cos(_tx * cscqx2);
            float cscqsh = sinh(cscqabs_v * cscqy1);
            float cscqch = cosh(cscqabs_v * cscqy2);
            float cscqni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
            float cscqC = cscqni * cscqc * cscqsh / cscqabs_v * cscqz2;
            x += cscqpow * cscqs * cscqch * cscqni;
            y -= cscqpow * cscqC * _ty;
            z -= cscqpow * cscqC * _tz;
          }
          if (cschqpow != 0.0) {
            float cschqabs_v = hypot(_ty, _tz) * cschqz1;
            float cschqs = sin(cschqabs_v * cschqy1);
            float cschqc = cos(cschqabs_v * cschqy2);
            float cschqsh = sinh(_tx * cschqx1);
            float cschqch = cosh(_tx * cschqx2);
            float cschqni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
            float cschqC = cschqni * cschqch * cschqs / cschqabs_v * cschqz2;
            x += cschqpow * cschqsh * cschqc * cschqni;
            y -= cschqpow * cschqC * _ty;
            z -= cschqpow * cschqC * _tz;
          }
          if (estiqpow != 0.0) {
            float estiqe = exp(_tx * estiqx1);
            float estiqabs_v = hypot(_ty, _tz) * estiqz1;
            float estiqs = sin(estiqabs_v * estiqy1);
            float estiqc = cos(estiqabs_v * estiqy2);
            float estiqa = estiqe * estiqs / estiqabs_v * estiqz2;
            x += estiqpow * amount * estiqe * estiqc;
            y += estiqpow * amount * estiqa * _ty;
            z += estiqpow * amount * estiqa * _tz;
          }
          if (logqpow != 0.0) {
            float denom = 0.5 * amount / log(logqbase);
            float logqabs_v = hypot(_ty, _tz);
            float logqC = amount * atan2(logqabs_v, _tx) / logqabs_v;
            x += logqpow * log(sqr(_tx) + sqr(logqabs_v)) * denom;
            y += logqpow * logqC * _ty;
            z += logqpow * logqC * _tz;
          }
          if (secqpow != 0.0) {
            float secqabs_v = hypot(_ty, _tz) * secqz1;
            float secqs = sin(-_tx * secqx1);
            float secqc = cos(-_tx * secqx2);
            float secqsh = sinh(secqabs_v * secqy1);
            float secqch = cosh(secqabs_v * secqy2);
            float secqni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
            float secqC = secqni * secqs * secqsh / secqabs_v * secqz2;
            x += secqpow * secqc * secqch * secqni;
            y -= secqpow * secqC * _ty;
            z -= secqpow * secqC * _tz;
          }
          if (sechqpow != 0.0) {
            float sechqabs_v = hypot(_ty, _tz) * sechqz1;
            float sechqs = sin(sechqabs_v * sechqy1);
            float sechqc = cos(sechqabs_v * sechqy2);
            float sechqsh = sinh(_tx * sechqx1);
            float sechqch = cosh(_tx * sechqx2);
            float sechqni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
            float sechqC = sechqni * sechqsh * sechqs / sechqabs_v * sechqz2;
            x += sechqpow * sechqch * sechqc * sechqni;
            y -= sechqpow * sechqC * _ty;
            z -= sechqpow * sechqC * _tz;
          }
          if (tanqpow != 0.0) {
            float tanqabs_v = hypot(_ty, _tz) * tanqz1;
            float tanqs = sin(_tx * tanqx1);
            float tanqc = cos(_tx * tanqx2);
            float tanqsh = sinh(tanqabs_v * tanqy1);
            float tanqch = cosh(tanqabs_v * tanqy2);
            float tanqsysz = sqr(_ty) + sqr(_tz);
            float tanqni = amount / (sqr(_tx) + tanqsysz);
            float tanqC = tanqc * tanqsh / tanqabs_v * tanqz2;
            float tanqB = -tanqs * tanqsh / tanqabs_v;
            float tanqstcv = tanqs * tanqch;
            float tanqnstcv = -tanqstcv;
            float tanqctcv = tanqc * tanqch;
            x += tanqpow * (tanqstcv * tanqctcv + tanqC * tanqB * tanqsysz) * tanqni;
            y += tanqpow * (tanqnstcv * tanqB * _ty + tanqC * _ty * tanqctcv) * tanqni;
            z += tanqpow * (tanqnstcv * tanqB * _tz + tanqC * _tz * tanqctcv) * tanqni;
          }
          if (tanhqpow != 0.0) {
            float tanhqabs_v = hypot(_ty, _tz) * tanhqz1;
            float tanhqs = sin(tanhqabs_v * tanhqy1);
            float tanhqc = cos(tanhqabs_v * tanhqy2);
            float tanhqsh = sinh(_tx * tanhqx1);
            float tanhqch = cosh(_tx * tanhqx2);
            float tanhqsysz = sqr(_ty) + sqr(_tz);
            float tanhqni = amount / (sqr(_tx) + tanhqsysz);
            float tanhqC = tanhqch * tanhqs / tanhqabs_v * tanhqz2;
            float tanhqB = tanhqsh * tanhqs / tanhqabs_v;
            float tanhqstcv = tanhqsh * tanhqc;
            float tanhqnstcv = -tanhqstcv;
            float tanhqctcv = tanhqc * tanhqch;
            x += tanhqpow * (tanhqstcv * tanhqctcv + tanhqC * tanhqB * tanhqsysz) * tanhqni;
            y += tanhqpow * (tanhqnstcv * tanhqB * _ty + tanhqC * _ty * tanhqctcv) * tanhqni;
            z += tanhqpow * (tanhqnstcv * tanhqB * _tz + tanhqC * _tz * tanhqctcv) * tanhqni;
          }
          if (sinqpow != 0.0) {
            float sinqabs_v = hypot(_ty, _tz) * sinqz1;
            float sinqs = sin(_tx * sinqx1);
            float sinqc = cos(_tx * sinqx2);
            float sinqsh = sinh(sinqabs_v * sinqy1);
            float sinqch = cosh(sinqabs_v * sinqy2);
            float sinqC = amount * sinqc * sinqsh / sinqabs_v * sinqz2;
            x += sinqpow * amount * sinqs * sinqch;
            y += sinqpow * sinqC * _ty;
            z += sinqpow * sinqC * _tz;
          }
          if (sinhqpow != 0.0) {
            float sinhqabs_v = hypot(_ty, _tz) * sinhqz1;
            float sinhqs = sin(sinhqabs_v * sinhqy1);
            float sinhqc = cos(sinhqabs_v * sinhqy2);
            float sinhqsh = sinh(_tx * sinhqx1);
            float sinhqch = cosh(_tx * sinhqx2);
            float sinhqC = amount * sinhqch * sinhqs / sinhqabs_v * sinhqz2;
            x += sinhqpow * amount * sinhqsh * sinhqc;
            y += sinhqpow * sinhqC * _ty;
            z += sinhqpow * sinhqC * _tz;
          }
          _vx += x;
          _vy += y;
          _vz += z;
        }`;
    }

    get name(): string {
        return 'quaternion';
    }

    get funcDependencies(): string[] {
        return [FUNC_HYPOT, FUNC_COSH, FUNC_SINH];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class SeaShell3DFunc extends VariationShaderFunc3D {
    PARAM_FINAL_RADIUS = 'final_radius'
    PARAM_HEIGHT = 'height'
    PARAM_INNER_RADIUS = 'inner_radius'
    PARAM_N_SPIRALS = 'nSpirals'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_FINAL_RADIUS, type: VariationParamType.VP_FLOAT, initialValue: 0.25 },
            { name: this.PARAM_HEIGHT, type: VariationParamType.VP_FLOAT, initialValue: 3.5 },
            { name: this.PARAM_INNER_RADIUS, type: VariationParamType.VP_FLOAT, initialValue: 0.4 },
            { name: this.PARAM_N_SPIRALS, type: VariationParamType.VP_INT, initialValue: 3 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /**
         * Sea Shell
         * Reference
         * http://paulbourke.net/geometry/shell/
         * parameters
         * n: number of Spirals
         * a: final Shell Radius
         * b: height
         * c: inner shell radius
         */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float final_radius = ${variation.params.get(this.PARAM_FINAL_RADIUS)!.toWebGl()};
          float height = ${variation.params.get(this.PARAM_HEIGHT)!.toWebGl()};
          float inner_radius = ${variation.params.get(this.PARAM_INNER_RADIUS)!.toWebGl()};
          int nSpirals = ${variation.params.get(this.PARAM_N_SPIRALS)!.toWebGl()};    
          float t;
          float s;
          t = (2.0*M_PI) * rand8(tex, rngState);
          s = (2.0*M_PI) * rand8(tex, rngState);
          float x = final_radius * (1.0 - t / (2.0*M_PI)) * cos(float(nSpirals) * t) * (1.0 + cos(s)) + inner_radius * cos(float(nSpirals) * t);
          float y = final_radius * (1.0 - t / (2.0*M_PI)) * sin(float(nSpirals) * t) * (1.0 + cos(s)) + inner_radius * sin(float(nSpirals) * t);
          float z = height * t / (2.0*M_PI) + final_radius * (1.0 - t / (2.0*M_PI)) * sin(s);
          _vx += x * amount;
          _vy += y * amount;
          _vz += z * amount;
        }`;
    }

    get name(): string {
        return 'seashell3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class SecqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Secq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
           float amount = ${variation.amount.toWebGl()};
           float abs_v = hypot(_ty, _tz);
           float s = sin(-_tx);
           float c = cos(-_tx);
           float sh = sinh(abs_v);
           float ch = cosh(abs_v);
           float ni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
           float C = ni * s * sh / abs_v;
           _vx += c * ch * ni;
           _vy -= C * _ty;
           _vz -= C * _tz;
        }`;
    }

    get name(): string {
        return 'secq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }
}

class SechqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* Sechq by zephyrtronium http://zephyrtronium.deviantart.com/art/Quaternion-Apo-Plugin-Pack-165451482 */
        return `{
           float amount = ${variation.amount.toWebGl()};
           float abs_v = hypot(_ty, _tz);
           float s = sin(abs_v);
           float c = cos(abs_v);
           float sh = sinh(_tx);
           float ch = cosh(_tx);
           float ni = amount / (sqr(_tx) + sqr(_ty) + sqr(_tz));
           float C = ni * sh * s / abs_v;
           _vx += ch * c * ni;
           _vy -= C * _ty;
           _vz -= C * _tz;
        }`;
    }

    get name(): string {
        return 'sechq';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }
}

class Scry3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* scry_3D by Larry Berlin, http://aporev.deviantart.com/art/New-3D-Plugins-136484533?q=gallery%3Aaporev%2F8229210&qo=22 */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float inv = 1.0 / (amount + EPSILON);
          float t = sqr(_tx) + sqr(_ty) + sqr(_tz);
          float r = 1.0 / (sqrt(t) * (t + inv));
          float Footzee, kikr;
          kikr = atan2(_ty, _tx);
          Footzee = _tz;
          _vx += _tx * r;
          _vy += _ty * r;
          if (Footzee != 0.0) {
            _vz += Footzee * r;
          } else {
            Footzee = kikr;
            _vz += Footzee * r;
          }
        }`;
    }

    get name(): string {
        return 'scry_3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Sinusoidal3DFunc extends VariationShaderFunc3D {

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // sinusoidal3d by gossamer_light
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * sin(_tx);
          _vy += amount * sin(_ty);
          _vz += amount * (atan2(_tx * _tx, _ty * _ty) * cos(_tz));
        }`;
    }

    get name(): string {
        return 'sinusoidal3d';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Spherical3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float lr = amount / (_tx * _tx + _ty * _ty + _tz * _tz + EPSILON);
          _vx += _tx * lr;
          _vy += _ty * lr;
          _vz += _tz * lr;
        }`;
    }

    get name(): string {
        return 'spherical3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Sph3DFunc extends VariationShaderFunc3D {
    PARAM_X = 'x'
    PARAM_Y = 'y'
    PARAM_Z = 'z'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_X, type: VariationParamType.VP_FLOAT, initialValue: 0.75 },
            { name: this.PARAM_Y, type: VariationParamType.VP_FLOAT, initialValue: 1.0},
            { name: this.PARAM_Z, type: VariationParamType.VP_FLOAT, initialValue: 0.5}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* sph3D by xyrus02, http://xyrus-02.deviantart.com/art/sph3D-Plugin-for-Apophysis-476688377 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = ${variation.params.get(this.PARAM_X)!.toWebGl()};
            float y = ${variation.params.get(this.PARAM_Y)!.toWebGl()};
            float z = ${variation.params.get(this.PARAM_Z)!.toWebGl()};
            float tx = _tx;
            float ty = _ty;
            float tz = _tz;
        
            float xx = x * tx;
            float yy = y * ty;
            float zz = x * tz;
        
            float r = amount / (xx * xx + yy * yy + zz * zz + EPSILON);
        
            _vx += tx * r;
            _vy += ty * r;
            _vz += tz * r;
        }`;
    }

    get name(): string {
        return 'sph3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Spherical3DWFFunc extends VariationShaderFunc3D {
    PARAM_INVERT = 'invert'
    PARAM_EXPONENT = 'exponent'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_INVERT, type: VariationParamType.VP_INT, initialValue: 0 },
            { name: this.PARAM_EXPONENT, type: VariationParamType.VP_FLOAT, initialValue: 2.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          int invert = ${variation.params.get(this.PARAM_INVERT)!.toWebGl()};
          float exponent = ${variation.params.get(this.PARAM_EXPONENT)!.toWebGl()};
          
          bool _regularForm = abs(exponent - 2.0) < EPSILON;
          float r;
          if (_regularForm) {
              r = amount / (_tx * _tx + _ty * _ty + _tz * _tz + EPSILON);
            } else {
              r = amount / pow(_tx * _tx + _ty * _ty + _tz * _tz + EPSILON, exponent / 2.0);
            }
            if (invert == 0) {
              _vx += _tx * r;
              _vy += _ty * r;
              _vz += _tz * r;
            } else {
              _vx -= _tx * r;
              _vy -= _ty * r;
              _vz -= _tz * r;
            }
        }`;
    }

    get name(): string {
        return 'spherical3D_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Spirograph3DFunc extends VariationShaderFunc3D {
    PARAM_A = 'a'
    PARAM_B = 'b'
    PARAM_C = 'c'
    PARAM_TMIN = 'tmin'
    PARAM_TMAX = 'tmax'
    PARAM_WIDTH = 'width'
    PARAM_MODE = 'mode'
    PARAM_DIRECT_COLOR = 'direct_color'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_A, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_B, type: VariationParamType.VP_FLOAT, initialValue: -0.3 },
            { name: this.PARAM_C, type: VariationParamType.VP_FLOAT, initialValue: 0.4 },
            { name: this.PARAM_TMIN, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_TMAX, type: VariationParamType.VP_FLOAT, initialValue: 1000.0 },
            { name: this.PARAM_WIDTH, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_MODE, type: VariationParamType.VP_INT, initialValue: 0 },
            { name: this.PARAM_DIRECT_COLOR, type: VariationParamType.VP_INT, initialValue: 0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // based on 'affine3D' of Flamelet
        return `{
          float amount = ${variation.amount.toWebGl()};
          float a = ${variation.params.get(this.PARAM_A)!.toWebGl()};
          float b = ${variation.params.get(this.PARAM_B)!.toWebGl()};
          float c = ${variation.params.get(this.PARAM_C)!.toWebGl()};
          float tmin = ${variation.params.get(this.PARAM_TMIN)!.toWebGl()};
          float tmax = ${variation.params.get(this.PARAM_TMAX)!.toWebGl()};
          float width = ${variation.params.get(this.PARAM_WIDTH)!.toWebGl()};
          int mode = ${variation.params.get(this.PARAM_MODE)!.toWebGl()};
          int direct_color = ${variation.params.get(this.PARAM_DIRECT_COLOR)!.toWebGl()};
          float t = (tmax - tmin) * rand8(tex, rngState) + tmin;
          float w1, w2, w3;
          if(mode==0) {
            w1 = w2 = w3 = width * rand8(tex, rngState) - width / 2.0;
          }
          else if(mode==1) {
            w1 = width * rand8(tex, rngState) - width / 2.0;
            w2 = w1 * sin(36.0 * t + (2.0 * M_PI) / 3.0);
            w3 = w1 * sin(36.0 * t + 2.0 * (2.0 * M_PI) / 3.0);
            w1 = w1 * sin(36.0 * t);
          }
          else if(mode==2) {
            w1 = width * rand8(tex, rngState) - width / 2.0;
            w2 = width * rand8(tex, rngState) - width / 2.0;
            w3 = width * rand8(tex, rngState) - width / 2.0;
          }
          else if(mode==3) {
            w1 = width * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0) / 2.0;
            w2 = width * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0) / 2.0;
            w3 = width * (rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) + rand8(tex, rngState) - 2.0) / 2.0;
          }
          else if(mode==4) {
            w1 = (rand8(tex, rngState) < 0.5) ? width : -width;
            w2 = w3 = 0.0;
          }
          else {
            w1 = w2 = w3 = 0.0;
          }
          float x1 = (a + b) * cos(t) - c * cos((a + b) / b * t);
          float y1 = (a + b) * sin(t) - c * sin((a + b) / b * t);
          float z1 = c * sin((a + b) / b * t);
          _vx += amount * (x1 + w1);
          _vy += amount * (y1 + w2);
          _vz += amount * (z1 + w3);
          if (direct_color != 0) {
            _color = mod(t / (2.0*M_PI), 1.0);
          }
        }`;
    }

    get name(): string {
        return 'spirograph3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_DC];
    }
}

class Splits3DFunc extends VariationShaderFunc3D {
    PARAM_XPOW = 'x'
    PARAM_YPOW = 'y'
    PARAM_ZPOW = 'z'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_XPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.10 },
            { name: this.PARAM_YPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.30},
            { name: this.PARAM_ZPOW, type: VariationParamType.VP_FLOAT, initialValue: 0.20}
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* splits3D by TyrantWave, http://tyrantwave.deviantart.com/art/Splits3D-Plugin-107262795 */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float x = ${variation.params.get(this.PARAM_XPOW)!.toWebGl()};
            float y = ${variation.params.get(this.PARAM_YPOW)!.toWebGl()};
            float z = ${variation.params.get(this.PARAM_ZPOW)!.toWebGl()};
            if (_tx >= 0.0) {
              _vx += amount * (_tx + x);
            } else {
              _vx += amount * (_tx - x);
            }
        
            if (_ty >= 0.0) {
              _vy += amount * (_ty + y);
            } else {
              _vy += amount * (_ty - y);
            }
        
            if (_tz >= 0.0) {
              _vz += amount * (_tz + z);
            } else {
              _vz += amount * (_tz - z);
            }
        }`;
    }

    get name(): string {
        return 'splits3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Square3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * (rand8(tex, rngState) - 0.5);
          _vy += amount * (rand8(tex, rngState) - 0.5);    
          _vz += amount * (rand8(tex, rngState) - 0.5);    
        }`;
    }

    get name(): string {
        return 'square3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_BASE_SHAPE];
    }
}

class SuperShape3DFunc extends VariationShaderFunc3D {
    PARAM_RHO = 'rho'
    PARAM_PHI = 'phi'
    PARAM_M1 = 'm1'
    PARAM_M2 = 'm2'
    PARAM_A1 = 'a1'
    PARAM_A2 = 'a2'
    PARAM_B1 = 'b1'
    PARAM_B2 = 'b2'
    PARAM_N1_1 = 'n1_1'
    PARAM_N1_2 = 'n1_2'
    PARAM_N2_1 = 'n2_1'
    PARAM_N2_2 = 'n2_2'
    PARAM_N3_1 = 'n3_1'
    PARAM_N3_2 = 'n3_2'
    PARAM_SPIRAL = 'spiral'
    PARAM_TOROIDMAP = 'toroidmap'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_RHO, type: VariationParamType.VP_FLOAT, initialValue: 9.9 },
            { name: this.PARAM_PHI, type: VariationParamType.VP_FLOAT, initialValue: 2.5 },
            { name: this.PARAM_M1, type: VariationParamType.VP_FLOAT, initialValue: 6.0 },
            { name: this.PARAM_M2, type: VariationParamType.VP_FLOAT, initialValue: 3.0 },
            { name: this.PARAM_A1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_A2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_B1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_B2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N1_1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N1_2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N2_1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N2_2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N3_1, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_N3_2, type: VariationParamType.VP_FLOAT, initialValue: 1.0 },
            { name: this.PARAM_SPIRAL, type: VariationParamType.VP_FLOAT, initialValue: 0.0 },
            { name: this.PARAM_TOROIDMAP, type: VariationParamType.VP_INT, initialValue: 0 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // SuperShape3d by David Young, http://fractal-resources.deviantart.com/gallery/24660058#/d1o8z8x
        return `{
          float amount = ${variation.amount.toWebGl()};
          float rho = ${variation.params.get(this.PARAM_RHO)!.toWebGl()};
          float phi = ${variation.params.get(this.PARAM_PHI)!.toWebGl()};
          float m1 = ${variation.params.get(this.PARAM_M1)!.toWebGl()};
          float m2 = ${variation.params.get(this.PARAM_M2)!.toWebGl()};
          float a1 = ${variation.params.get(this.PARAM_A1)!.toWebGl()};
          float a2 = ${variation.params.get(this.PARAM_A2)!.toWebGl()};
          float b1 = ${variation.params.get(this.PARAM_B1)!.toWebGl()};
          float b2 = ${variation.params.get(this.PARAM_B2)!.toWebGl()};
          float n1_1 = ${variation.params.get(this.PARAM_N1_1)!.toWebGl()};
          float n1_2 = ${variation.params.get(this.PARAM_N1_2)!.toWebGl()};
          float n2_1 = ${variation.params.get(this.PARAM_N2_1)!.toWebGl()};
          float n2_2 = ${variation.params.get(this.PARAM_N2_2)!.toWebGl()};
          float n3_1 = ${variation.params.get(this.PARAM_N3_1)!.toWebGl()};
          float n3_2 = ${variation.params.get(this.PARAM_N3_2)!.toWebGl()};
          float spiral = ${variation.params.get(this.PARAM_SPIRAL)!.toWebGl()};
          int toroidmap = ${variation.params.get(this.PARAM_TOROIDMAP)!.toWebGl()};
          
          float n1n_1, n1n_2, m4_1, m4_2;
          float an2_1, an2_2, bn3_1, bn3_2;
          float rho_pi, phi_pi;  
          n1n_1 = (-1.0 / n1_1);
          n1n_2 = (-1.0 / n1_2);
          an2_1 = pow(abs(1.0 / a1), n2_1);
          an2_2 = pow(abs(1.0 / a2), n2_2);
          bn3_1 = pow(abs(1.0 / b1), n3_1);
          bn3_2 = pow(abs(1.0 / b2), n3_2);
          m4_1 = m1 / 4.0;
          m4_2 = m2 / 4.0;
          rho_pi = rho * (2.0 / M_PI);
          phi_pi = phi * (2.0 / M_PI); 
          float rho1 = rand8(tex, rngState) * rho_pi;
          float phi1 = rand8(tex, rngState) * phi_pi;
          if (rand8(tex, rngState) < 0.5) {
            phi1 = (-phi1);
          }
          float sinr = sin(rho1);
          float cosr = cos(rho1);
          float sinp = sin(phi1);
          float cosp = cos(phi1);
        
          float msinr, mcosr;
          {
            float a = m4_1 * rho1;
            msinr = sin(a);
            mcosr = cos(a);
          }
          float msinp, mcosp;
          {
            float a = m4_2 * phi1;
            msinp = sin(a);
            mcosp = cos(a);
          }
          float pr1 = an2_1 * pow(abs(mcosr), n2_1) + bn3_1 * pow(abs(msinr), n3_1);
          float pr2 = an2_2 * pow(abs(mcosp), n2_2) + bn3_2 * pow(abs(msinp), n3_2);
          float r1 = pow(pr1, n1n_1) + spiral * rho1;
          float r2 = pow(pr2, n1n_2);
        
          if (toroidmap == 1) {
            _vx += amount * cosr * (r1 + r2 * cosp);
            _vy += amount * sinr * (r1 + r2 * cosp);
            _vz += amount * r2 * sinp;
          } else {
            _vx += amount * r1 * cosr * r2 * cosp;
            _vy += amount * r1 * sinr * r2 * cosp;
            _vz += amount * r2 * sinp;
          }

        }`;
    }

    get name(): string {
        return 'superShape3d';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class SVFFunc extends VariationShaderFunc3D {
    PARAM_N = 'n'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_FLOAT, initialValue: 2.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* svn (single value function) by gossamer light */
        return `{
            float amount = ${variation.amount.toWebGl()};
            float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
            float cn = cos(n * _ty);
            float sx = sin(_tx);
            float cx = cos(_tx);
            float sy = sin(_ty);
            float cy = cos(_ty);
            _vx += amount * (cy * (cn * cx));
            _vy += amount * (cy * (cn * sx));
            _vz += amount * (sy * cn);
        }`;
    }

    get name(): string {
        return 'svf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Swirl3DWFFunc extends VariationShaderFunc3D {
    PARAM_N = 'n'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_N, type: VariationParamType.VP_FLOAT, initialValue: 0.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
            float amount = ${variation.amount.toWebGl()};
            float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
            float rad = _r;
            float ang = atan2(_ty, _tx);
            _vx += amount * (rad * cos(ang));
            _vy += amount * (rad * sin(ang));
            _vz += amount * (sin(6.0 * cos(rad) - n * ang));
            _color = abs(sin(6.0 * cos(rad) - n * ang));
        }`;
    }

    get name(): string {
        return 'swirl3D_wf';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D, VariationTypes.VARTYPE_DC];
    }
}

class Tangent3DFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          _vx += amount * sin(_tx) / cos(_ty);
          _vy += amount * tan(_ty);
          _vz += amount * tan(_tx);
        }`;
    }

    get name(): string {
        return 'tangent3D';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class TanqFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        return `{
          float amount = ${variation.amount.toWebGl()};
          float abs_v = hypot(_ty, _tz);
          float s = sin(_tx);
          float sysz = sqr(_ty) + sqr(_tz);
          float ni = amount / (sqr(_tx) + sysz);
          float c = cos(_tx);
          float sh = sinh(abs_v);
          float ch = cosh(abs_v);
          float C = c * sh / abs_v;
          float B = -s * sh / abs_v;
          float stcv = s * ch;
          float nstcv = -stcv;
          float ctcv = c * ch;
          _vx += (stcv * ctcv + C * B * sysz) * ni;
          _vy += (nstcv * B * _ty + C * _ty * ctcv) * ni;
          _vz += (nstcv * B * _tz + C * _tz * ctcv) * ni;
        }`;
    }

    get name(): string {
        return 'tanq';
    }

    get funcDependencies(): string[] {
        return [FUNC_SINH, FUNC_COSH, FUNC_HYPOT];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class TaurusFunc extends VariationShaderFunc3D {
    PARAM_R = 'r'
    PARAM_N = 'n'
    PARAM_INV = 'inv'
    PARAM_SOR = 'sor'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_R, type: VariationParamType.VP_FLOAT, initialValue: 3.00 },
            { name: this.PARAM_N, type: VariationParamType.VP_FLOAT, initialValue: 5.00 },
            { name: this.PARAM_INV, type: VariationParamType.VP_FLOAT, initialValue: 1.50 },
            { name: this.PARAM_SOR, type: VariationParamType.VP_FLOAT, initialValue: 1.00 }
        ]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* taurus by gossamer light */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float r = ${variation.params.get(this.PARAM_R)!.toWebGl()};
          float n = ${variation.params.get(this.PARAM_N)!.toWebGl()};
          float inv = ${variation.params.get(this.PARAM_INV)!.toWebGl()};
          float sor = ${variation.params.get(this.PARAM_SOR)!.toWebGl()};
          float sx = sin(_tx);
          float cx = cos(_tx);
          float sy = sin(_ty);
          float cy = cos(_ty);
          float ir = (inv * r) + ((1.0 - inv) * (r * cos(n * _tx)));
          _vx += amount * (cx * (ir + sy));
          _vy += amount * (sx * (ir + sy));
          _vz += amount * (sor * cy) + ((1.0 - sor) * _ty);
        }`;
    }

    get name(): string {
        return 'taurus';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class Tile_LogFunc extends VariationShaderFunc3D {
    PARAM_SPREAD = 'spread'

    get params(): VariationParam[] {
        return [{ name: this.PARAM_SPREAD, type: VariationParamType.VP_FLOAT, initialValue: 1.0 }]
    }

    getCode(xform: RenderXForm, variation: RenderVariation): string {
        // tile_log by Zy0rg implemented into JWildfire by Brad Stefanov
        return `{
          float amount = ${variation.amount.toWebGl()};
          float spread = ${variation.params.get(this.PARAM_SPREAD)!.toWebGl()};
           float x = -spread;
           if (rand8(tex, rngState) < 0.5)
              x = spread;   
            _vx += amount * (_tx + round(x * log(rand8(tex, rngState))));
            _vy += amount * _ty;
            _vz += amount * _tz;
        }`;
    }

    get name(): string {
        return 'tile_log';
    }

    get funcDependencies(): string[] {
        return [FUNC_ROUND];
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

class WhitneyUmbrellaFunc extends VariationShaderFunc3D {
    getCode(xform: RenderXForm, variation: RenderVariation): string {
        /* whitney_umbrella by Don Town */
        return `{
          float amount = ${variation.amount.toWebGl()};
          float u = _tx;
          float v = _ty;
          _vx += amount * u * v;
          _vy += amount * u;
          _vz += amount * v * v;
        }`;
    }

    get name(): string {
        return 'whitney_umbrella';
    }

    get variationTypes(): VariationTypes[] {
        return [VariationTypes.VARTYPE_3D];
    }
}

export function registerVars_3D_PartQ() {
    VariationShaders.registerVar(new QuaternionFunc())
    VariationShaders.registerVar(new SeaShell3DFunc())
    VariationShaders.registerVar(new SecqFunc())
    VariationShaders.registerVar(new SechqFunc())
    VariationShaders.registerVar(new Scry3DFunc())
    VariationShaders.registerVar(new Sinusoidal3DFunc())
    VariationShaders.registerVar(new Spherical3DFunc())
    VariationShaders.registerVar(new Sph3DFunc())
    VariationShaders.registerVar(new Spherical3DWFFunc())
    VariationShaders.registerVar(new Spirograph3DFunc())
    VariationShaders.registerVar(new Splits3DFunc())
    VariationShaders.registerVar(new Square3DFunc())
    VariationShaders.registerVar(new SuperShape3DFunc())
    VariationShaders.registerVar(new SVFFunc())
    VariationShaders.registerVar(new Swirl3DWFFunc())
    VariationShaders.registerVar(new Tangent3DFunc())
    VariationShaders.registerVar(new TanqFunc())
    VariationShaders.registerVar(new TaurusFunc())
    VariationShaders.registerVar(new Tile_LogFunc())
    VariationShaders.registerVar(new WhitneyUmbrellaFunc())
}
