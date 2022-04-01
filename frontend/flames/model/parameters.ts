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
import FlameParamCurveInterpolation
    from "Frontend/generated/org/jwildfire/swan/flames/model/flame/FlameParamCurveInterpolation";

export type FlameParameterType = 'scalar' | 'curve'
export type FlameParameterDataType = 'float' | 'int' | 'boolean'

export interface FlameParameter {
    type: FlameParameterType
    datatype: FlameParameterDataType
    value: number
}

class FloatScalarParameter implements FlameParameter {
    type: FlameParameterType = 'scalar'
    datatype: FlameParameterDataType = 'float'

    constructor(public value: number) {
        // EMPTY
    }
}

export enum MotionCurveInterpolation {
    SPLINE = 'SPLINE',
    BEZIER = 'BEZIER',
    LINEAR = 'LINEAR',
}

export class FloatMotionCurveParameter implements FlameParameter {
    type: FlameParameterType = 'curve'
    datatype: FlameParameterDataType = 'float'
    private _xmin
    private _xmax

    constructor(public value: number, public viewXMin: number, public viewXMax: number, public viewYMin: number,
      public viewYMax: number, public interpolation: MotionCurveInterpolation, public selectedIdx: number,
      private _x: Array<number>, private _y: Array<number>, public locked: boolean) {
      if(_x.length>0) {
        this._xmin = this._xmax = _x[0]
        for(let val of _x) {
          if(val<this._xmin) {
            this._xmin = val
          }
          else if(val>this._xmax) {
            this._xmax = val
          }
        }
      }
      else {
        this._xmin = this._xmax = 0
      }
    }

    public get x() {
        return this._x
    }

    public get xmin() {
        return this._xmin
    }

    public get xmax() {
        return this._xmax
    }

    public get y() {
        return this._y
    }

    public size() {
        return this._x.length
    }
}

class IntScalarParameter implements FlameParameter {
    type: FlameParameterType = 'scalar'
    datatype: FlameParameterDataType = 'int'

    constructor(public value: number) {
        // EMPTY
    }
}

class BooleanScalarParameter implements FlameParameter {
    type: FlameParameterType = 'scalar'
    datatype: FlameParameterDataType = 'boolean'

    constructor(public value: number) {
        // EMPTY
    }

    public isTrue() {
        return Math.abs(this.value - 1.0) < EPSILON
    }
}

export class Parameters {
    public static floatParam(value: number) {
        return new FloatScalarParameter(value);
    }
    public static intParam(value: number) {
        return new IntScalarParameter(value);
    }

    public static booleanParam(value: boolean) {
        return new BooleanScalarParameter(value ? 1 : 0);
    }

    public static motionCurveParam(value: number, viewXMin: number, viewXMax: number, viewYMin: number,
                             viewYMax: number, interpolation: MotionCurveInterpolation, selectedIdx: number,
                             x: Array<number>, y: Array<number>, locked: boolean) {
        return new FloatMotionCurveParameter(value, viewXMin, viewXMax, viewYMin, viewYMax, interpolation,
          selectedIdx, x, y, locked)
    }
}


export interface RenderParameter {
    toWebGl(): string
    equals(refValue: number): boolean
}

export class FloatValueRenderParameter implements RenderParameter {
    constructor(private _value: number) {
    }

    toWebGl(): string {
        return `float(${this._value})`
    }

    equals(refValue: number): boolean {
        return Math.abs(this._value -  refValue) < EPSILON
    }

}

export class IntValueRenderParameter implements RenderParameter {
    constructor(private _value: number) {
    }

    toWebGl(): string {
        return `int(${Math.round(this._value)})`
    }

    equals(refValue: number): boolean {
        return Math.abs(Math.round(this._value) - Math.round(refValue)) < EPSILON
    }
}

export class LerpValueRenderParameter implements RenderParameter {
    constructor(private _a: number, private _b: number) {
    }

    toWebGl(): string {
        return `lerp(float(${this._a}), float(${this._b}), lTime)`
    }

    equals(refValue: number): boolean {
        return false
    }
}

export class RenderParameters {
    public static floatParam(value: number): RenderParameter {
        return new FloatValueRenderParameter(value)
    }

    public static intParam(value: number): RenderParameter {
        return new IntValueRenderParameter(value)
    }

    public static lerpParam(a: number, b: number): RenderParameter {
        return new LerpValueRenderParameter(a, b)
    }
}