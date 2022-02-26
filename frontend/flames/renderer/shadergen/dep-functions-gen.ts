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

import {VariationMathFunctions} from "Frontend/flames/renderer/variations/variation-math-functions";
import {RenderFlame, RenderXForm} from "Frontend/flames/model/render-flame";
import {VariationShaders} from "Frontend/flames/renderer/variations/variation-shaders";

export class DepFunctionsPartShaderGenerator {

  addDepFunction(func: string) {
    return VariationMathFunctions.getCode(func);
  }

  addDepFunctions(xforms: Array<RenderXForm>) {
    let functions = new Array<string>()
    xforms.forEach(xform => {
      xform.variations.forEach(variation => {
        VariationShaders.getVariationDepFunctions(variation).forEach(func => {
          if (functions.indexOf(func) < 0) {
            functions.push(func)
          }
        })
      })
    })
    return functions.map(func => this.addDepFunction(func)).join('')
  }


}