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

import {default as SourceXForm} from '../../../generated/org/jwildfire/swan/flames/model/XForm'
import {default as SourceFlame} from '../../../generated/org/jwildfire/swan/flames/model/Flame'
import {default as SourceVariation} from '../../../generated/org/jwildfire/swan/flames/model/Variation'
import {Flame, XForm, Variation} from "../flame";
import {Parameters} from "Frontend/flames/model/parameters";
import {RenderFlame, RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";

class VariationMapper {
    static mapFromBackend(source: SourceVariation): Variation {
        const res = new Variation()
        res.name = source.name
        res.amount = Parameters.dNumber(source.amount)
        source.dParams.map(sd => {
          res.params.set(sd.name, Parameters.dNumber(sd.value))
        })
        source.iParams.map(id => {
            res.params.set(id.name, Parameters.iNumber(id.value))
        })
        return res;
    }

    static mapForRendering(source: Variation): RenderVariation {
        const res = new RenderVariation()
        res.name = source.name
        res.amount = source.amount.value
        source.params.forEach((value, key) => {
            res.params.set(key, value.value)
        })
        return res;
    }
}

class XFormMapper {
    static mapFromBackend(source: SourceXForm): XForm {
        const res = new XForm()

        res.weight = Parameters.dNumber(source.weight);
        for(let i=0;i<source.modifiedWeights.length;i++) {
            if(i>=res.modifiedWeights.length) {
                res.modifiedWeights.push(source.modifiedWeights[i])
            }
            else {
                res.modifiedWeights[i] = source.modifiedWeights[i]
            }
        }

        res.color = Parameters.dNumber(source.color)
        res.colorSymmetry = Parameters.dNumber(source.colorSymmetry)

        res.c00 = Parameters.dNumber(source.c00)
        res.c01 = Parameters.dNumber(source.c01)
        res.c10 = Parameters.dNumber(source.c10)
        res.c11 = Parameters.dNumber(source.c11)
        res.c20 = Parameters.dNumber(source.c20)
        res.c21 = Parameters.dNumber(source.c21)

        res.p00 = Parameters.dNumber(source.p00)
        res.p01 = Parameters.dNumber(source.p01)
        res.p10 = Parameters.dNumber(source.p10)
        res.p11 = Parameters.dNumber(source.p11)
        res.p20 = Parameters.dNumber(source.p20)
        res.p21 = Parameters.dNumber(source.p21)

        source.variations.map(svar => {
            res.variations.push(VariationMapper.mapFromBackend(svar))
        })
        return res;
    }

    static mapForRendering(source: XForm): RenderXForm {
        const res = new RenderXForm()

        res.weight = source.weight.value
        for(let i=0;i<source.modifiedWeights.length;i++) {
            if(i>=res.modifiedWeights.length) {
                res.modifiedWeights.push(source.modifiedWeights[i])
            }
            else {
                res.modifiedWeights[i] = source.modifiedWeights[i]
            }
        }

        res.color = source.color.value
        res.colorSymmetry = source.colorSymmetry.value

        res.c00 = source.c00.value
        res.c01 = source.c01.value
        res.c10 = source.c10.value
        res.c11 = source.c11.value
        res.c20 = source.c20.value
        res.c21 = source.c21.value

        res.p00 = source.p00.value
        res.p01 = source.p01.value
        res.p10 = source.p10.value
        res.p11 = source.p11.value
        res.p20 = source.p20.value
        res.p21 = source.p21.value

        source.variations.map(svar => {
            res.variations.push(VariationMapper.mapForRendering(svar))
        })
        return res;
    }
}

export class FlameMapper {
    public static mapFromBackend(source: SourceFlame): Flame {
        const res = new Flame()
        res.brightness = Parameters.dNumber(source.brightness);
        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapFromBackend(sxf))
        })
        source.finalXforms.map(sxf => {
            res.finalXforms.push(XFormMapper.mapFromBackend(sxf))
        })
        return res
    }

    public static mapForRendering(source: Flame): RenderFlame {
        const res = new RenderFlame();
        res.brightness = source.brightness.value;
        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapForRendering(sxf))
        })
        source.finalXforms.map(sxf => {
            res.finalXforms.push(XFormMapper.mapForRendering(sxf))
        })
        return res
    }
}

