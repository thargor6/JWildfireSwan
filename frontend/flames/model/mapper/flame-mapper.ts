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
import {Flame, XForm} from "../flame";
import {Parameters} from "Frontend/flames/model/parameters";

class XFormMapper {
    static mapFromBackend(source: SourceXForm): XForm {
        const res = new XForm();
        res.c00 = Parameters.number(source.c00);
        res.c01 = Parameters.number(source.c01);
        res.c10 = Parameters.number(source.c10);
        res.c11 = Parameters.number(source.c11);
        res.c20 = Parameters.number(source.c20);
        res.c21 = Parameters.number(source.c21);
        return res;
    }
}

export class FlameMapper {
    public static mapFromBackend(source: SourceFlame): Flame {
        const res = new Flame();
        res.brightness = Parameters.number(source.brightness);
        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapFromBackend(sxf))
        })
        return res;
    }
}

