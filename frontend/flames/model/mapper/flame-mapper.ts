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

class VariationMapper {
    static mapFromBackend(source: SourceVariation): Variation {
        const res = new Variation();
        res.name = source.name;
        res.amount = Parameters.dNumber(source.amount);
        source.dParams.map(sd => {
          res.params.set(sd.name, Parameters.dNumber(sd.value))
        })
        source.iParams.map(id => {
            res.params.set(id.name, Parameters.iNumber(id.value))
        })
        return res;
    }
}

class XFormMapper {
    static mapFromBackend(source: SourceXForm): XForm {
        const res = new XForm();

        res.weight = Parameters.dNumber(source.weight);
        res.color = Parameters.dNumber(source.color);
        res.colorSymmetry = Parameters.dNumber(source.colorSymmetry);

        res.c00 = Parameters.dNumber(source.c00);
        res.c01 = Parameters.dNumber(source.c01);
        res.c10 = Parameters.dNumber(source.c10);
        res.c11 = Parameters.dNumber(source.c11);
        res.c20 = Parameters.dNumber(source.c20);
        res.c21 = Parameters.dNumber(source.c21);

        res.p00 = Parameters.dNumber(source.p00);
        res.p01 = Parameters.dNumber(source.p01);
        res.p10 = Parameters.dNumber(source.p10);
        res.p11 = Parameters.dNumber(source.p11);
        res.p20 = Parameters.dNumber(source.p20);
        res.p21 = Parameters.dNumber(source.p21);

        source.variations.map(svar => {
            res.variations.push(VariationMapper.mapFromBackend(svar))
        })
        return res;
    }
}

export class FlameMapper {
    public static mapFromBackend(source: SourceFlame): Flame {
        const res = new Flame();
        res.brightness = Parameters.dNumber(source.brightness);
        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapFromBackend(sxf))
        })
        source.finalXforms.map(sxf => {
            res.finalXforms.push(XFormMapper.mapFromBackend(sxf))
        })
        return res;
    }
}

