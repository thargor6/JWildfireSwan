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
  FloatMotionCurveParameter,
  IntMotionCurveParameter,
  MotionCurveInterpolation,
  Parameters
} from "Frontend/flames/model/parameters";
import {Layer, Variation, XForm} from "Frontend/flames/model/flame";
import {cloneDeep} from "lodash";
import {floatIsLess, floatsAreEqual} from "Frontend/components/utils";

export class FlameEditService {

  public randomizeColors(layer: Layer) {
    for (let idx = 0; idx < layer.xforms.length; idx++) {
      let xform = layer.xforms[idx]
      xform.color = Parameters.floatParam(Math.random())
    }
  }

  public randomizeColorSymmetry(layer: Layer) {
    for (let idx = 0; idx < layer.xforms.length; idx++) {
      let xform = layer.xforms[idx]
      xform.colorSymmetry = Parameters.floatParam(Math.random())
    }
  }

  public resetColors(layer: Layer) {
    for (let idx = 0; idx < layer.xforms.length; idx++) {
      let xform = layer.xforms[idx]
      xform.color = Parameters.floatParam(0)
      xform.colorSymmetry = Parameters.floatParam(0)
    }
  }

  public distributeColors(layer: Layer) {
    if (layer.xforms.length > 1) {
      for (let idx = 0; idx < layer.xforms.length; idx++) {
        let xform = layer.xforms[idx]
        xform.color = Parameters.floatParam(idx / (layer.xforms.length - 1))
      }
    }
  }

  addTransform(layer: Layer) {
    let xform = new XForm()
    xform.weight = Parameters.floatParam(0.5)
    xform.modifiedWeights.splice(0, xform.modifiedWeights.length)
    for (let i = 0; i <= layer.xforms.length; i++) {
      xform.modifiedWeights.push(1.0)
    }
    for (let i = 0; i < layer.xforms.length; i++) {
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
      if (idx >= 0) {
        // remove xform
        layer.xforms.splice(idx, 1)
        // adjust xaos
        for (let i = 0; i < layer.xforms.length; i++) {
          const xform_i = layer.xforms[i]
          for (let j = idx; j < layer.xforms.length; j++) {
            xform_i.modifiedWeights[j] = xform_i.modifiedWeights[j + 1]
          }
          xform_i.modifiedWeights.slice(layer.xforms.length - 1, 1)
        }
        return;
      }
    }
    {
      const idx = layer.finalXforms.indexOf(xform)
      if (idx >= 0) {
        // simply remove xform
        layer.finalXforms.splice(idx, 1)
        return
      }
    }
  }

  addLinkedTransform(layer: Layer, srcXform: XForm) {
    const idx = layer.xforms.indexOf(srcXform)
    if (idx >= 0) {
      {
        let newXform = new XForm()
        let variation = new Variation()
        variation.amount = Parameters.floatParam(1.0)
        variation.name = 'linear3D'
        newXform.variations.push(variation)
        newXform.weight = Parameters.floatParam(0.5)
        newXform.colorSymmetry = Parameters.floatParam(1.0)
        layer.xforms.push(newXform)
      }
      const fromId = idx
      const toId = layer.xforms.length - 1;
      for (let i = 0; i < layer.xforms.length; i++) {
        const currXform = layer.xforms[i]
        if (i == fromId) {
          const toXForm = layer.xforms[toId]
          for (let j = 0; j < layer.xforms.length; j++) {
            toXForm.modifiedWeights[j] = currXform.modifiedWeights[j];
            currXform.modifiedWeights[j] = (j == toId) ? 1 : 0;
          }
          //currXform.drawMode = DrawMode.HIDDEN
        } else {
          currXform.modifiedWeights[toId] = 0;
        }
      }
    }
  }

  duplicateTransform(layer: Layer, srcXform: XForm) {
    {
      const idx = layer.xforms.indexOf(srcXform)
      if (idx >= 0) {
        const newXform = cloneDeep(srcXform)
        layer.xforms.push(newXform)
        // copy xaos from values
        const fromId = idx
        const toId = layer.xforms.length - 1
        for (let i = 0; i < toId; i++) {
          const xformi = layer.xforms[i]
          xformi.modifiedWeights[toId] = xformi.modifiedWeights[fromId];
          if (i == fromId) {
            newXform.modifiedWeights[toId] = xformi.modifiedWeights[fromId];
          }
        }
        return
      }
    }

    {
      const idx = layer.finalXforms.indexOf(srcXform)
      if (idx >= 0) {
        const newXform = cloneDeep(srcXform)
        layer.finalXforms.push(newXform)
        return
      }
    }
  }

  createFloatMotionCurveFromPoint(x: number, y: number) {
    const pX = [x]
    const pY = [y]
    return Parameters.floatMotionCurveParam(y, 0, 320, -10, 10, MotionCurveInterpolation.SPLINE, 0, pX, pY, false)
  }

  motionCurveHasKeyFrame(x: number, curve: FloatMotionCurveParameter | IntMotionCurveParameter): boolean {
    for (let idx = 0; idx < curve.x.length; idx++) {
      if (floatsAreEqual(curve.x[idx], x)) {
        return true
      }
    }
    return false
  }

  addPointToFloatMotionCurve(x: number, y: number, curve: FloatMotionCurveParameter): FloatMotionCurveParameter {
    let haveKey = false
    let pX = [...curve.x]
    let pY = [...curve.y]
    let minIdx = -1
    for (let idx = 0; idx < pX.length; idx++) {
      if (floatsAreEqual(pX[idx], x)) {
        pY[idx] = y
        return Parameters.floatMotionCurveParam(y, curve.viewXMin, curve.viewXMax, curve.viewYMin, curve.viewYMax, curve.interpolation, curve.selectedIdx, pX, pY, curve.locked)
      } else if (floatIsLess(pX[idx], x) && minIdx < idx) {
        minIdx = idx
      }
    }
    let newX, newY
    if(minIdx<0) {
      newX = [...pX, x]
      newY = [...pY, y]
    }
    else {
      newX = [...pX.slice(0, minIdx+1), x, ...pX.slice(minIdx+1, pX.length)]
      newY = [...pY.slice(0, minIdx+1), y, ...pY.slice(minIdx+1, pY.length)]
    }
    return Parameters.floatMotionCurveParam(y, curve.viewXMin, curve.viewXMax, curve.viewYMin, curve.viewYMax, curve.interpolation, curve.selectedIdx, newX, newY, curve.locked)
  }

  removePointFromFloatMotionCurve(x: number, y:number, curve: FloatMotionCurveParameter): FloatMotionCurveParameter | number {
    for (let idx = 0; idx < curve.x.length; idx++) {
      if (floatsAreEqual(curve.x[idx], x)) {
        if(curve.x.length===1) {
          // last point in curve
          return y
        }
        let newX = [...curve.x.slice(0, idx), ...curve.x.slice(idx+1, curve.x.length)]
        let newY = [...curve.y.slice(0, idx), ...curve.y.slice(idx+1, curve.y.length)]
        return Parameters.floatMotionCurveParam(y, curve.viewXMin, curve.viewXMax, curve.viewYMin, curve.viewYMax, curve.interpolation, curve.selectedIdx, newX, newY, curve.locked)
      }
    }
    throw new Error(`The is no key frame at position ${x}`)
  }

  removePointFromIntMotionCurve(x: number, y:number, curve: IntMotionCurveParameter): IntMotionCurveParameter | number {
    for (let idx = 0; idx < curve.x.length; idx++) {
      if (floatsAreEqual(curve.x[idx], x)) {
        if(curve.x.length===1) {
          // last point in curve
          return Math.round(y)
        }
        let newX = [...curve.x.slice(0, idx), ...curve.x.slice(idx+1, curve.x.length)]
        let newY = [...curve.y.slice(0, idx), ...curve.y.slice(idx+1, curve.y.length)]
        return Parameters.intMotionCurveParam(y, curve.viewXMin, curve.viewXMax, curve.viewYMin, curve.viewYMax, curve.interpolation, curve.selectedIdx, newX, newY, curve.locked)
      }
    }
    throw new Error(`The is no key frame at position ${x}`)
  }

  createIntMotionCurveFromPoint(x: number, y: number) {
    const pX = [x]
    const pY = [y]
    return Parameters.intMotionCurveParam(y, 0, 320, -10, 10, MotionCurveInterpolation.SPLINE, 0, pX, pY, false)
  }

  addPointToIntMotionCurve(x: number, y: number, curve: IntMotionCurveParameter): IntMotionCurveParameter {
    let haveKey = false
    let pX = [...curve.x]
    let pY = [...curve.y]
    let minIdx = -1
    for (let idx = 0; idx < pX.length; idx++) {
      if (floatsAreEqual(pX[idx], x)) {
        pY[idx] = y
        return Parameters.intMotionCurveParam(y, curve.viewXMin, curve.viewXMax, curve.viewYMin, curve.viewYMax, curve.interpolation, curve.selectedIdx, pX, pY, curve.locked)
      } else if (floatIsLess(pX[idx], x) && minIdx < idx) {
        minIdx = idx
      }
    }
    let newX, newY
    if(minIdx<0) {
      newX = [...pX, x]
      newY = [...pY, y]
    }
    else {
      newX = [...pX.slice(0, minIdx+1), x, ...pX.slice(minIdx+1, pX.length)]
      newY = [...pY.slice(0, minIdx+1), y, ...pY.slice(minIdx+1, pY.length)]
    }
    return Parameters.intMotionCurveParam(y, curve.viewXMin, curve.viewXMax, curve.viewYMin, curve.viewYMax, curve.interpolation, curve.selectedIdx, newX, newY, curve.locked)
  }

}

export const flameEditService = new FlameEditService()