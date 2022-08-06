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


import {editorStore} from "Frontend/stores/editor-store";
import {Flame, Variation} from "Frontend/flames/model/flame";
import {FloatMotionCurveParameter, IntMotionCurveParameter} from "Frontend/flames/model/parameters";
import {motionCurveEvaluator} from "Frontend/flames/animation/motion-curve-eval";

export class PropertyHandlingService {
  // https://www.nadershamma.dev/blog/2019/how-to-access-object-properties-dynamically-using-bracket-notation-in-typescript/
  // credit: Typescript documentation, src
  // https://www.typescriptlang.org/docs/handbook/advanced-types.html#index-types
  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName] // o[propertyName] is of type T[K]
  }

  setProperty<T, K extends keyof T>(o: T, propertyName: K, newValue: T[K])  {
    o[propertyName] = newValue
  }

  // datatype: ""
  // interpolation: "SPLINE"

  getFlameValue(key: keyof Flame): number | undefined {
    if(editorStore.currFlame) {
      const val: any = this.getProperty(editorStore.currFlame, key)
      if (val) {
        if(val.interpolation && val.interpolation === 'SPLINE' && val.datatype) {
          if(val.datatype==='float') {
            return motionCurveEvaluator.evaluate(val as FloatMotionCurveParameter, editorStore.currFlame.frame.value)
          }
          else if(val.datatype==='int') {
            return motionCurveEvaluator.evaluate(val as IntMotionCurveParameter, editorStore.currFlame.frame.value)
          }
          else {
            throw new Error(`Unknown datatype ${val.datatype}`)
          }
        }
        else if (val.type && val.value) {
          return val.value
        } else {
          return 0
        }
      }
    }
    return undefined
  }

  getLayerValue(key: string): number | undefined {
    if(editorStore.currLayer) {
      // @ts-ignore
      const val: any = this.getProperty(editorStore.currLayer, key)
      if(val) {
        if(val.type) {
          return val.value
        }
        else {
          return 0
        }
      }
    }
    return undefined
  }


  getXformValue(key: string): number | undefined {
    if(editorStore.currXform) {
      // @ts-ignore
      const val: any = this.getProperty(editorStore.currXform, key)
      if(val) {
        if(val.type) {
          return val.value
        }
        else {
          return 0
        }
      }
    }
    return undefined
  }

  getVariationValue(src: Variation | undefined, key: string): number | undefined {
    if(src) {
      // @ts-ignore
      let val: any = this.getProperty(src, key)
      if(!val) {
        val = src.params.get(key)
      }
      if(val) {
        if(val.type) {
          return val.value
        }
        else {
          return 0
        }
      }
    }
    return undefined
  }

  getFlameBooleanValue(key: string): boolean {
    // @ts-ignore
    const val: any = this.getProperty(editorStore.currFlame, key)
    if(val && val.type && val.value) {
      return true
    }
    return false
  }

}

export const propertyHandlingService = new PropertyHandlingService()