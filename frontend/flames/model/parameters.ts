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

export interface FlameParameter {
    type: "number" | "dynamic";
    value: number;
}

class NumberParameter implements FlameParameter {
    type: "number" | "dynamic";

    constructor(public value: number) {
        this.type = "number";
    }
}

export class Parameters {
    public static dNumber(value: number) {
        return new NumberParameter(value);
    }
    public static iNumber(value: number) {
        return new NumberParameter(value);
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
        return `lerp(float(${this._a}), float(${this._b}), time * 0.1)`
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