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

import {Variation} from '../model/flame'
import {FlameParameter} from '../model/parameters'

export abstract class VariationShaderFunc {
    abstract getCode(variation: Variation): string

    abstract get name(): string

    get dependencies(): string[] {
        return []
    }

    evalP(param: FlameParameter): number {
        return param.value
    }
}

export abstract class VariationShaderFunc2D extends VariationShaderFunc {

}

export abstract class VariationShaderFunc3D extends VariationShaderFunc {

}