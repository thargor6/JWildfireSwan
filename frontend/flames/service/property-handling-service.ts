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
import {Flame, Layer, Variation, XForm} from "Frontend/flames/model/flame";
import {FloatMotionCurveParameter, IntMotionCurveParameter} from "Frontend/flames/model/parameters";
import {motionCurveEvaluator} from "Frontend/flames/animation/motion-curve-eval";
import {floatsAreEqual} from "Frontend/components/utils";

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

  private computeNumericValue(val: any): number | undefined {
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
    return undefined
  }

  getFlameValue(key: keyof Flame): number | undefined {
    if(editorStore.currFlame) {
      const val: any = this.getProperty(editorStore.currFlame, key)
      return this.computeNumericValue(val)
    }
    return undefined
  }

  getLayerValue(key: keyof Layer): number | undefined {
    if(editorStore.currLayer) {
      const val: any = this.getProperty(editorStore.currLayer, key)
      return this.computeNumericValue(val)
    }
    return undefined
  }

  getXformValue(key: keyof XForm): number | undefined {
    if(editorStore.currXform) {
      const val: any = this.getProperty(editorStore.currXform, key)
      return this.computeNumericValue(val)
    }
    return undefined
  }

  getVariationValue(src: Variation | undefined, key: string): number | undefined {
    if(src) {
      let val: any = this.getProperty(src, key as keyof Variation)
      if(!val) {
        val = src.params.get(key)
      }
      return this.computeNumericValue(val)
    }
    return undefined
  }

  getFlameBooleanValue(key: keyof Flame): boolean {
    const val: any = this.getProperty(editorStore.currFlame, key)
    if(val && val.type && val.value) {
      return true
    }
    return false
  }

  flamePropertyChange = (key: string, value: number, isImmediateValue: boolean, afterPropertyChange: ()=>void) => {
    if(editorStore.currFlame && !editorStore.refreshing) {
      const oldVal: any = this.getProperty(editorStore.currFlame, <keyof Flame>key)
      if (oldVal && oldVal.type) {
        if (!floatsAreEqual(oldVal.value, value)) {
          if(!isImmediateValue) {
            editorStore.undoManager.registerFlameAttributeChange(editorStore.currFlame, <keyof Flame>key, value)
          }
          oldVal.value = value
          oldVal.intermediateValue = value
          afterPropertyChange()
          // console.log('FLAME ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  layerPropertyChange = (key: string, value: number, isImmediateValue: boolean, afterPropertyChange: ()=>void) => {
    if(editorStore.currLayer && !editorStore.refreshing) {
      // @ts-ignore
      const oldVal: any = this.getProperty(editorStore.currLayer, key)
      if (oldVal && oldVal.type) {
        if (!floatsAreEqual(oldVal.value, value)) {
          if(!isImmediateValue) {
            editorStore.undoManager.registerLayerAttributeChange(editorStore.currFlame, editorStore.currLayer, <keyof Layer>key, value)
          }
          oldVal.value = value
          oldVal.intermediateValue = value
          afterPropertyChange()
          // console.log('LAYER ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  xformPropertyChange = (key: string, value: number, isImmediateValue: boolean, afterPropertyChange: ()=>void, onPropertyChange: (paramId: number, oldValue: number, newValue: number)=>void) => {
    if(editorStore.currXform && !editorStore.refreshing) {
      // @ts-ignore
      const oldVal: any = this.getProperty(editorStore.currXform, key)
      if(oldVal && oldVal.type) {
        if (!floatsAreEqual(oldVal.value, value)) {
          const oldValueNumber = oldVal.value
          if(!isImmediateValue) {
            editorStore.undoManager.registerXformAttributeChange(editorStore.currFlame, editorStore.currXform, <keyof XForm>key, value)
          }
          oldVal.value = value
          oldVal.intermediateValue = value
          // !!!just for testing now, do not use in production!!!
          if(key==='_xyC21_') {
            onPropertyChange(0, oldValueNumber, value)
          }
          else {
            afterPropertyChange()
          }
          // console.log('XFORM ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

  variationPropertyChange = (src: Variation | undefined, key: string, value: number, isImmediateValue: boolean, afterPropertyChange: ()=>void, onPropertyChange: (paramId: number, oldValue: number, newValue: number)=>void) => {
    if(src  && !editorStore.refreshing) {
      // @ts-ignore
      let oldVal: any = this.getProperty(src, key)
      let isAttrFromMap: boolean
      if(!oldVal) {
        oldVal = src.params.get(key)
        isAttrFromMap = true
      }
      else {
        isAttrFromMap = false
      }
      if(oldVal && oldVal.type) {
        if (!floatsAreEqual(oldVal.value, value)) {
          const oldValueNumber = oldVal.value
          if(!isImmediateValue) {
            if(isAttrFromMap) {
              editorStore.undoManager.registerVariationAttrMapAttributeChange(editorStore.currFlame, src, key, value)
            }
            else {
              editorStore.undoManager.registerVariationAttributeChange(editorStore.currFlame, src, <keyof Variation>key, value)
            }
          }
          oldVal.value = value
          oldVal.intermediateValue = value
          // !!!just for testing now, do not use in production!!!
          if(key==='_xyC21_') {
            onPropertyChange(0, oldValueNumber, value)
          }
          else {
            afterPropertyChange()
          }
          // console.log('VARIATION ATTRIBUTE CHANGED', key, value, oldVal)
        }
      }
    }
  }

}

export const propertyHandlingService = new PropertyHandlingService()