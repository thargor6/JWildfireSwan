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

import {Parameters} from "Frontend/flames/model/parameters";
import {Layer, Variation, XForm} from "Frontend/flames/model/flame";

export class FlameEditService {

  public randomizeColors(layer: Layer) {
    for(let idx=0;idx<layer.xforms.length; idx++) {
      let xform = layer.xforms[idx]
      xform.color = Parameters.floatParam(Math.random())
    }
  }

  public randomizeColorSymmetry(layer: Layer) {
    for(let idx=0;idx<layer.xforms.length; idx++) {
      let xform = layer.xforms[idx]
      xform.colorSymmetry = Parameters.floatParam(Math.random())
    }
  }

  public resetColors(layer: Layer) {
    for(let idx=0;idx<layer.xforms.length; idx++) {
      let xform = layer.xforms[idx]
      xform.color =  Parameters.floatParam(0)
      xform.colorSymmetry =  Parameters.floatParam(0)
    }
  }

  public distributeColors(layer: Layer) {
    if(layer.xforms.length>1) {
      for (let idx = 0; idx < layer.xforms.length; idx++) {
        let xform = layer.xforms[idx]
        xform.color = Parameters.floatParam( idx /  (layer.xforms.length - 1))
      }
    }
  }

  addTransform(layer: Layer) {
    let xform = new XForm()
    xform.weight = Parameters.floatParam(0.5)
    xform.modifiedWeights.splice(0, xform.modifiedWeights.length)
    for(let i=0;i<=layer.xforms.length;i++) {
      xform.modifiedWeights.push(1.0)
    }
    for(let i=0;i<layer.xforms.length;i++) {
      while (layer.xforms[i].modifiedWeights.length < layer.xforms.length + 1) {
        layer.xforms[i].modifiedWeights.push(1.0)
      }
    }
    let variation = new Variation()
    variation.amount = Parameters.floatParam(1.0)
    variation.name = 'linear3D'
    xform.variations.push(variation)
    layer.xforms.push(xform)
  }

  addFinalTransform(layer: Layer) {
    let xform = new XForm()
    let variation = new Variation()
    variation.amount = Parameters.floatParam(1.0)
    variation.name = 'linear3D'
    xform.variations.push(variation)
    layer.finalXforms.push(xform)
  }

  deleteTransform(layer: Layer, xform: XForm) {
    {
      const idx = layer.xforms.indexOf(xform)
      if(idx>=0) {
        // remove xform
        layer.xforms.splice(idx, 1)
        // adjust xaos
        for (let i = 0; i < layer.xforms.length; i++) {
          const xform_i = layer.xforms[i]
          for (let j = idx; j < layer.xforms.length; j++) {
            xform_i.modifiedWeights[j] = xform_i.modifiedWeights[j + 1]
          }
          xform_i.modifiedWeights.slice(layer.xforms.length-1, 1)
        }
        return;
      }
    }
    {
      const idx = layer.finalXforms.indexOf(xform)
      if(idx>=0) {
        // simply remove xform
        layer.finalXforms.splice(idx, 1)
        return
      }
    }
  }


}