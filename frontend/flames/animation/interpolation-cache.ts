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

import {MotionCurveInterpolation} from "Frontend/flames/model/parameters";
import {InterpolatedPoints} from "Frontend/flames/animation/interpolation";

export class InterpolatedPointsKey {
  private _x: number[] = []
  private _y: number[] = []
  private _interpolation: MotionCurveInterpolation
  private _hashCode = 0

  constructor(pX: number[], pY: number[], pInterpolation: MotionCurveInterpolation) {
    this._x = pX
    this._y = pY
    this._interpolation = pInterpolation
    this._hashCode = this.calcHashCode()
  }

  public get hashCode() {
    return this._hashCode
  }

  private hashStr(value: string) {
    let hash = 0;
    if (value.length === 0) return hash;
    for (let i = 0; i < value.length; i++) {
      let chr   = value.charCodeAt(i)
      hash  = ((hash << 5) - hash) + chr
      hash |= 0 // Convert to 32bit integer
    }
    return hash
  }

  private hashArray(array: number[]) {
    let result = 1
    for (let element of array)
      result = 31 * result + element
    return result
  }

  private calcHashCode() {
    const prime = 31;
    let result = 1;
    result = prime * result + ((this._interpolation == null) ? 0 : this.hashStr(this._interpolation))
    result = prime * result + this.hashArray(this._x)
    result = prime * result + this.hashArray(this._y)
    return result
  }


  private arrayEquals(array: number[], other: number[]) {
    if (array.length != other.length)
      return false
    for (let i = 0, l= array.length; i < l; i++) {
      if(!(array[i] === other[i])) {
        return false
      }
    }
    return true
  }

  public equals(other: InterpolatedPointsKey) {
    if (this === other)
      return true
    if (this._interpolation !== other._interpolation)
      return false
    if (!this.arrayEquals(this._x, other._x))
      return false
    if (!this.arrayEquals(this._y, other._y))
      return false
    return true
  }

}

export class InterpolatedPointsCache {
  private _interpolatedPointCache = new Map<InterpolatedPointsKey, InterpolatedPoints>();

  public getInterpolatedPoints(pX: number[], pY: number[], pInterpolation: MotionCurveInterpolation) {
    const key = new InterpolatedPointsKey(pX, pY, pInterpolation)
    let res = this._interpolatedPointCache.get(key);
    if (res == null) {
      res = new InterpolatedPoints(pX, pY, pInterpolation)
      this._interpolatedPointCache.set(key, res)
    }
    return res
  }
}