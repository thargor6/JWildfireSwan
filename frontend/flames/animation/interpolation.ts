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

import {EPSILON} from "Frontend/flames/renderer/mathlib";
import {MotionCurveInterpolation} from "Frontend/flames/model/parameters";

abstract class Interpolation {
  protected _src: number[] = []
  protected _snum = 0
  protected _dest: number[] = []
  protected _dnum = 0
  protected _subdiv = 0

  public get dest() {
    return this._dest
  }

  public get dnum() {
    return this._dnum
  }

  public set src(value: number[]) {
    this._src = value
  }

  public set snum(value: number) {
    this._snum = value
  }

  public set subdiv(value: number) {
    this._subdiv = value
 }

  public static calcSubDivPRV(x: number[], count: number) {
    let xdist, xdistmax: number
    xdist = xdistmax = x[1] - x[0]
    for (let i = 1; i < (count - 1); i++) {
      xdist = x[i + 1] - x[i]
      if (xdist > xdistmax)
        xdistmax = xdist
    }
    let subdiv = Math.round(1.6 * xdistmax + 0.5)
    if (subdiv < 3)
      subdiv = 3
    return subdiv
  }

  public abstract interpolate(): void
}

class LinearInterpolation extends Interpolation {
  interpolate() {
    if (this._snum < 2)
      throw new Error(`Illegal argument ${this._snum}`)
    this._dnum = this._snum * (this._subdiv + 5);
    this._dest = new Array<number>(this._dnum)
    let curr = 0
    for (let i = 0; i < (this._snum - 1); i++) {
      let x0 = this._src[i]
      let x1 = this._src[i + 1]
      let dx = (x1 - x0) / (this._subdiv - 1)
      for (let j = 0; j < this._subdiv; j++) {
        this._dest[curr++] = x0
        x0 += dx
      }
    }
    this._dnum = curr
  }
}

class SplineInterpolation extends Interpolation {
  public interpolate() {
    if (this._snum < 3)
      throw new Error(`Illegal argument ${this._snum}`)
    let du = 1.0 / this._subdiv
    this._dnum = this._snum * (this._subdiv + 5)
    this._dest = new Array<number>(this._dnum)

    let j = 0
    let i = 0
    do {
      let  u = 0.0
      do {
        if (i == 0) {
          this._dest[j] = this.evalSpline(u, this._src[i], this._src[i], this._src[i + 1], this._src[i + 2])
        }
        else if (i == (this._snum - 2)) {
          this._dest[j] = this.evalSpline(u, this._src[i - 1], this._src[i], this._src[i + 1], this._src[i + 1])
        }
        else {
          this.dest[j] = this.evalSpline(u, this._src[i - 1], this._src[i], this._src[i + 1], this._src[i + 2])
        }
        u += du
        j++
        if (j >= this.dnum)
          throw new Error('Illegal state')
      }
      while (u < (1.0 + EPSILON))
      i++
    }
    while (i < (this._snum - 1))
    this._dnum = j
  }

  private evalSpline(u: number, xa: number, xb: number, xc: number, xd: number) {
    let c, B = 0.5
    if ((u < (0.0 - EPSILON)) || (u > (1.0 + EPSILON)))
      throw new Error("evalCatmullRom")
    c = u * u * u * (-B * xa + (2.0 - B) * xb + (B - 2.0) * xc + B * xd)
    c = c + u * u * (2 * B * xa + (B - 3.0) * xb + (3.0 - 2.0 * B) * xc - B * xd)
    c = c + u * (-B * xa + B * xc)
    c = c + (xb)
    return (c)
  }
}

class BezierInterpolation extends Interpolation {
  interpolate() {
    if (this._snum < 3)
      throw new Error(`Illegal argument ${this._snum}`)
    let du = 1.0 / this._subdiv
    this._dnum = this._snum * (this._subdiv + 5)
    this._dest = new Array<number>(this._dnum)
    let j = 0
    let i = 1
    let xm1, xm2, xm3
    do {
      let u = 0.0
      do {
        if (i == 1)
          xm1 = this._src[i - 1]
        else
          xm1 = 0.5 * (this._src[i - 1] + this._src[i])
        if (i == (this._snum - 2))
          xm3 = this._src[i + 1]
        else
          xm3 = 0.5 * (this._src[i] + this._src[i + 1])
        xm2 = this._src[i]
        this._dest[j] = this.evalBezier(u, xm1, xm2, xm3)
        u += du
        j++
        if (j >= this._dnum)
          throw new Error('Illegal state')
      }
      while (u < (1.0 + EPSILON))
      i++
    }
    while (i < (this._snum - 1))
    this._dnum = j
  }

  private evalBezier(u: number, xa: number, xb: number, xc: number) {
    let c, h
    if ((u < (0.0 - EPSILON)) || (u > (1.0 + EPSILON)))
      throw new Error('evalBezier')
    /* c= u*u*(     xa-2.0*xb+xc)
       c+=  u*(-2.0*xa+2.0*xb   )
       c+=    (     xa          )*/
    h = u * u
    c = xa - xb - xb + xc
    c *= h
    h = -xa - xa + xb + xb
    h *= u
    c += h
    c += xa
    return c
  }
}

export class InterpolatedPoints {
  private _vSX: number[] = []
  private _vSY: number[] = []
  private _vSNum = 0

  constructor(pX: number[], pY: number[], pInterpolation: MotionCurveInterpolation) {
    const size = pX.length
    const subdiv = Interpolation.calcSubDivPRV(pX, size)
    let interpolationX: Interpolation, interpolationY: Interpolation
    if (size > 2) {
      switch (pInterpolation) {
        case MotionCurveInterpolation.SPLINE:
          interpolationX = new SplineInterpolation()
          interpolationY = new SplineInterpolation()
          break;
        case MotionCurveInterpolation.BEZIER:
          interpolationX = new BezierInterpolation()
          interpolationY = new BezierInterpolation()
          break;
        default:
          interpolationX = new LinearInterpolation()
          interpolationY = new LinearInterpolation()
          break;
    }
    }
    else {
      interpolationX = new LinearInterpolation()
      interpolationY = new LinearInterpolation()
    }
    interpolationX.src = pX
    interpolationX.snum = size
    interpolationX.subdiv = subdiv
    interpolationX.interpolate()
    interpolationY.src = pY
    interpolationY.snum = size
    interpolationY.subdiv = subdiv
    interpolationY.interpolate()
    if (interpolationX.dnum !== interpolationY.dnum)
      throw new Error('Interpolation error')
    this._vSNum = interpolationX.dnum
    this._vSX = interpolationX.dest
    this._vSY = interpolationY.dest
  }

  public get vSX() {
    return this._vSX
  }

  public get vSY() {
    return this._vSY
  }

  public get vSNum() {
    return this._vSNum
  }
}
