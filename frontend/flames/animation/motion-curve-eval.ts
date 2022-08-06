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

import {FloatMotionCurveParameter, IntMotionCurveParameter} from "Frontend/flames/model/parameters";
import {InterpolatedPointsCache} from "Frontend/flames/animation/interpolation-cache";

const cache = new InterpolatedPointsCache()

export class MotionCurveEvaluator {
  private useBisection = false

  public evaluate(curve: FloatMotionCurveParameter | IntMotionCurveParameter, pTime: number): number {
    if (curve.size() === 0)
      return 0.0
    else if (curve.size() === 1)
      return curve.y[0]
    else if (pTime <= curve.xmin)
      return curve.y[0];
    else if (pTime >= curve.xmax)
      return curve.y[curve.size() - 1];
    let indl = -1, indr = -1
    const iPoints = cache.getInterpolatedPoints(curve.x, curve.y, curve.interpolation);
    const vSX = iPoints.vSX
    const vSY = iPoints.vSY
    const vSNum = vSX.length

    if (this.useBisection) {
      let low = 0
      let high = vSNum - 1
      while (low <= high) {
        let mid = (low + high) >>> 1
        let midVal = vSX[mid]
        if (midVal < pTime) {
          low = mid + 1
          indl = mid
        }
        else if (midVal > pTime) {
          indr = mid;
          high = mid - 1
        }
        else {
          return vSY[mid]
        }
      }
    }
    else {
      for (let i = 0; i < vSNum; i++) {
        if (Math.round(vSX[i]) <= pTime) {
          indl = i
        }
        else {
          indr = i
          break
        }
      }
    }
    if ((indl >= 0) && (indr >= 0)) {
      const xdist = vSX[indr] - vSX[indl]
      if (xdist < 0.00000001)
        return vSX[indl]
      else
        return vSY[indl] + (pTime - vSX[indl]) / xdist * (vSY[indr] - vSY[indl])
    }
    else if (indl >= 0) {
      return vSY[indl]
    }
    else if (indr >= 0) {
      return vSY[indr]
    }
    else {
      return 0.0
    }
  }

}

export const motionCurveEvaluator = new MotionCurveEvaluator()