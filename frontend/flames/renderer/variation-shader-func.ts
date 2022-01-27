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

import {FlameParameter} from '../model/parameters'
import {RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";

export enum VariationTypes {
    VARTYPE_BLUR,
    VARTYPE_2D,
    VARTYPE_ZTRANSFORM,
    VARTYPE_3D,
    VARTYPE_DC ,
    VARTYPE_BASE_SHAPE,
    VARTYPE_PRE,
    VARTYPE_POST,
    VARTYPE_CROP
}

export enum VariationParamType {
    VP_NUMBER,
    VP_BOOLEAN
}

export interface VariationParam {
    name: string;
    type: VariationParamType;
    initialValue: number;
}

export abstract class VariationShaderFunc {
    abstract getCode(xform: RenderXForm, variation: RenderVariation): string

    abstract get name(): string

    get funcDependencies(): string[] {
        return []
    }

    get params(): VariationParam[] {
        return []
    }

    abstract get variationTypes(): VariationTypes[]

    evalP(param: FlameParameter): number {
        return param.value
    }
}

export abstract class VariationShaderFunc2D extends VariationShaderFunc {

}

export abstract class VariationShaderFunc3D extends VariationShaderFunc {

}