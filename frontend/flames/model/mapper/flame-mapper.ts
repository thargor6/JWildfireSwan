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

import {default as SourceFlameParam} from '../../../generated/org/jwildfire/swan/flames/model/flame/FlameParam'
import {
    default as SourceFlameParamCurveInterpolation
} from '../../../generated/org/jwildfire/swan/flames/model/flame/FlameParamCurveInterpolation'
import {
    default as SourceFlameResource
} from '../../../generated/org/jwildfire/swan/flames/model/flame/VariationResource'
import VariationResourceType, {
    default as SourceVariationResourceType
} from '../../../generated/org/jwildfire/swan/flames/model/flame/VariationResourceType'
import {default as SourceXForm} from '../../../generated/org/jwildfire/swan/flames/model/flame/XForm'
import {default as SourceLayer} from '../../../generated/org/jwildfire/swan/flames/model/flame/Layer'
import {default as SourceFlame} from '../../../generated/org/jwildfire/swan/flames/model/flame/Flame'
import {default as SourceVariation} from '../../../generated/org/jwildfire/swan/flames/model/flame/Variation'
import {Color, DenoiserType, Flame, Layer, Variation, XForm} from "../flame";
import {
    FlameParameter,
    FlameResource,
    FlameResourceType,
    FloatMotionCurveParameter, IntMotionCurveParameter,
    MotionCurveInterpolation,
    Parameters,
    RenderParameter,
    RenderParameters,
    RenderResource
} from "Frontend/flames/model/parameters";
import {
    RenderColor,
    RenderFlame,
    RenderLayer,
    RenderMappingContext,
    RenderVariation,
    RenderXForm
} from "Frontend/flames/model/render-flame";
import FlameParamType from "Frontend/generated/org/jwildfire/swan/flames/model/flame/FlameParamType";
import FlameParamDataType from "Frontend/generated/org/jwildfire/swan/flames/model/flame/FlameParamDataType";
import VariationParam from "Frontend/generated/org/jwildfire/swan/flames/model/flame/VariationParam";
import VariationResource from "Frontend/generated/org/jwildfire/swan/flames/model/flame/VariationResource";
import {motionCurveEvaluator, MotionCurveEvaluator} from "Frontend/flames/animation/motion-curve-eval";
import {EPSILON} from "Frontend/flames/renderer/mathlib";

class ResourceMapper {
    public static mapFromBackend(source: SourceFlameResource): FlameResource {
        function mapResourceTypeFromBackend(resourceType: SourceVariationResourceType): FlameResourceType {
            switch(resourceType) {
                case SourceVariationResourceType.HREF: return 'href'
                case SourceVariationResourceType.FLAME_FILENAME: return 'flame_filename'
                case SourceVariationResourceType.FONT_NAME: return 'font_name'
                case SourceVariationResourceType.IMAGE_FILE: return 'image_file'
                case SourceVariationResourceType.IMAGE_FILENAME: return 'image_filename'
                case SourceVariationResourceType.FONT_NAME: return 'font_name'
                case SourceVariationResourceType.JAVA_CODE: return 'java_code'
                case SourceVariationResourceType.OBJ_MESH: return 'obj_mesh'
                case SourceVariationResourceType.SVG_FILE: return 'svg_file'
                case SourceVariationResourceType.BYTEARRAY:
                default:
                    return 'bytearray'
            }
        }
        return {
          name: source.name,
          type: mapResourceTypeFromBackend(source.resourceType),
          stringValue: source.stringValue
      }
    }

    public static mapToBackend(source: FlameResource): SourceFlameResource {

        function mapResourceTypeToBackend(type: FlameResourceType): VariationResourceType {
            switch(type) {
                case 'href': return VariationResourceType.HREF
                case 'image_filename': return VariationResourceType.IMAGE_FILENAME
                case 'image_file': return VariationResourceType.IMAGE_FILE
                case 'svg_file': return VariationResourceType.SVG_FILE
                case 'font_name': return VariationResourceType.FONT_NAME
                case 'java_code': return VariationResourceType.JAVA_CODE
                case 'obj_mesh': return VariationResourceType.OBJ_MESH
                case 'flame_filename': return VariationResourceType.FLAME_FILENAME
                case 'bytearray':
                default: return VariationResourceType.BYTEARRAY
            }
        }
        return {
            name: source.name,
            resourceType: mapResourceTypeToBackend(source.type),
            stringValue: source.stringValue
        }
    }

    public static mapForRendering(ctx: RenderMappingContext, source: FlameResource): RenderResource {
      return new RenderResource(source.stringValue)
    }
}

class ParamMapper {

    static mapForRendering(ctx: RenderMappingContext, source: FlameParameter): RenderParameter {
        if(source.datatype==='int') {
            if(source.type==='curve') {
                if((source as any).intermediateValue && (typeof (source as any).intermediateValue)==='number') {
                    const intermediateValue = (source as any).intermediateValue as number
                    (source as any).intermediateValue = undefined
                    return RenderParameters.intParam(Math.round(intermediateValue))
                }
                const val = motionCurveEvaluator.evaluate(source as IntMotionCurveParameter, ctx.frame)
                const mbLength = ctx.motionBlurTimeLength
                if(mbLength>EPSILON) {
                    const nextVal = motionCurveEvaluator.evaluate(source as IntMotionCurveParameter, ctx.frame + mbLength)
                    return RenderParameters.intLerpParam(val, nextVal)
                }
                else {
                    return RenderParameters.intParam(Math.round(val))
                }
            }
            else {
                return RenderParameters.intParam(Math.round(source.value))
            }
        }
        else {
            if(source.type==='curve') {
                if((source as any).intermediateValue && (typeof (source as any).intermediateValue)==='number') {
                    const intermediateValue = (source as any).intermediateValue as number
                    (source as any).intermediateValue = undefined
                    return RenderParameters.floatParam(intermediateValue)
                }
                const val = motionCurveEvaluator.evaluate(source as FloatMotionCurveParameter, ctx.frame)
                const mbLength = ctx.motionBlurTimeLength
                if(mbLength>EPSILON) {
                    const nextVal = motionCurveEvaluator.evaluate(source as FloatMotionCurveParameter, ctx.frame + mbLength)
                    return RenderParameters.floatLerpParam(val, nextVal)
                }
                else {
                    return RenderParameters.floatParam(val)
                }
            }
            else {
                return RenderParameters.floatParam(source.value)
            }
        }
    }

    static mapNumberParamForRendering(ctx: RenderMappingContext, source: FlameParameter): number {
        if((source as any).intermediateValue && (typeof (source as any).intermediateValue)==='number') {
            const intermediateValue = (source as any).intermediateValue as number
            (source as any).intermediateValue = undefined
            return intermediateValue
        }
        if(source.datatype==='int') {
            if(source.type==='curve') {
                const val = motionCurveEvaluator.evaluate(source as IntMotionCurveParameter, ctx.frame)
                return Math.round(val)
            }
            else {
                return Math.round(source.value)
            }
        }
        else {
            if(source.type==='curve') {
                return motionCurveEvaluator.evaluate(source as FloatMotionCurveParameter, ctx.frame)
            }
            else {
                return source.value
            }
        }
    }

    private static mapInterpolationFromBackend(source: SourceFlameParamCurveInterpolation): MotionCurveInterpolation {
        if(source===SourceFlameParamCurveInterpolation.LINEAR) {
            return MotionCurveInterpolation.LINEAR
        }
        else if(source===SourceFlameParamCurveInterpolation.BEZIER) {
            return MotionCurveInterpolation.BEZIER
        }
        else {
            return MotionCurveInterpolation.SPLINE
        }
    }

    public static mapFromBackend(source: SourceFlameParam): FlameParameter {
      if(source.paramType === FlameParamType.CURVE && source.curve) {
          if(source.dataType === FlameParamDataType.INT) {
              return Parameters.intMotionCurveParam(source.intScalar ? source.intScalar! : 0,
                source.curve.viewXMin, source.curve.viewXMax, source.curve.viewYMin, source.curve.viewYMax,
                ParamMapper.mapInterpolationFromBackend(source.curve.interpolation),
                source.curve.selectedIdx, source.curve.x ? source.curve.x : [],
                source.curve.y ? source.curve.y : [], source.curve.locked)
          }
          else {
              return Parameters.floatMotionCurveParam(source.floatScalar ? source.floatScalar! : 0.0,
                source.curve.viewXMin, source.curve.viewXMax, source.curve.viewYMin, source.curve.viewYMax,
                ParamMapper.mapInterpolationFromBackend(source.curve.interpolation),
                source.curve.selectedIdx, source.curve.x ? source.curve.x : [],
                source.curve.y ? source.curve.y : [], source.curve.locked)
          }
      }
      else { // FlameParamType.SCALAR
         if(source.dataType === FlameParamDataType.INT) {
           return Parameters.intParam(source.intScalar ? source.intScalar : 0)
         }
         else { // FlameParamDataType.FLOAT
           return Parameters.floatParam(source.floatScalar? source.floatScalar : 0.0)
         }
      }
    }

    private static mapInterpolationToBackend(source: MotionCurveInterpolation): SourceFlameParamCurveInterpolation {
        if(source===MotionCurveInterpolation.LINEAR) {
            return SourceFlameParamCurveInterpolation.LINEAR
        }
        else if(source===MotionCurveInterpolation.BEZIER) {
            return SourceFlameParamCurveInterpolation.BEZIER
        }
        else {
            return SourceFlameParamCurveInterpolation.SPLINE
        }
    }

    public static mapToBackend(source: FlameParameter): SourceFlameParam {
      if(source.type === 'curve') {
          const sourceCurve = source as FloatMotionCurveParameter
          const curve = {
              viewXMin: sourceCurve.viewXMin,
              viewXMax: sourceCurve.viewXMax,
              viewYMin: sourceCurve.viewYMin,
              viewYMax: sourceCurve.viewYMax,
              interpolation: ParamMapper.mapInterpolationToBackend(sourceCurve.interpolation),
              selectedIdx: sourceCurve.selectedIdx,
              x: sourceCurve.x,
              y: sourceCurve.y,
              locked: sourceCurve.locked
          }
          if(source.datatype === 'int') {
              return {
                  paramType: FlameParamType.CURVE,
                  dataType: FlameParamDataType.INT,
                  intScalar: source.value,
                  curve: curve
              }
          }
          else { // 'float'
              return {
                  paramType: FlameParamType.CURVE,
                  dataType: FlameParamDataType.FLOAT,
                  floatScalar: source.value,
                  curve: curve
              }
          }
      }
      else { // 'scalar'
          if(source.datatype === 'int') {
              return {
                  paramType: FlameParamType.SCALAR,
                  dataType: FlameParamDataType.INT,
                  intScalar: source.value
              }
          }
          else { // 'float'
              return {
                  paramType: FlameParamType.SCALAR,
                  dataType: FlameParamDataType.FLOAT,
                  floatScalar: source.value
              }
          }
      }
    }
}

class VariationMapper {
    static mapFromBackend(source: SourceVariation): Variation {
        const res = new Variation()
        res.name = source.name
        res.amount = ParamMapper.mapFromBackend(source.amount)
        source.params.map(sd => {
          res.params.set(sd.name, ParamMapper.mapFromBackend(sd.value))
        })
        source.resources.map(sr => {
          res.resources.set(sr.name, ResourceMapper.mapFromBackend(sr))
        })
        return res;
    }

    static mapToBackend(source: Variation): SourceVariation {
        const res: SourceVariation = {
            name: source.name,
            amount: ParamMapper.mapToBackend(source.amount),
            params: new Array<VariationParam>(),
            resources: new Array<VariationResource>()
        }
        source.params.forEach((value, key) => {
            res.params.push({
                name: key,
                value: ParamMapper.mapToBackend(value)
            })
        })
        source.resources.forEach((value, key) => {
            res.resources.push(ResourceMapper.mapToBackend(value))
        })
        return res;
    }

    static mapForRendering(ctx: RenderMappingContext, source: Variation): RenderVariation {
        const res = new RenderVariation()
        res.name = source.name
        res.amount = ParamMapper.mapForRendering(ctx, source.amount)
        source.params.forEach((value, key) => {
          res.params.set(key, ParamMapper.mapForRendering(ctx, value))
        })
        source.resources.forEach((value, key) => {
            res.resources.set(key, ResourceMapper.mapForRendering(ctx, value))
        })
        return res;
    }
}

class XFormMapper {
    static mapFromBackend(source: SourceXForm): XForm {
        const res = new XForm()

        res.weight = Parameters.floatParam(source.weight);
        for(let i=0;i<source.modifiedWeights.length;i++) {
            if(i>=res.modifiedWeights.length) {
                res.modifiedWeights.push(source.modifiedWeights[i])
            }
            else {
                res.modifiedWeights[i] = source.modifiedWeights[i]
            }
        }

        res.color = Parameters.floatParam(source.color)
        res.colorSymmetry = Parameters.floatParam(source.colorSymmetry)

        res.xyC00 = ParamMapper.mapFromBackend(source.xyC00)
        res.xyC01 = ParamMapper.mapFromBackend(source.xyC01)
        res.xyC10 = ParamMapper.mapFromBackend(source.xyC10)
        res.xyC11 = ParamMapper.mapFromBackend(source.xyC11)
        res.xyC20 = ParamMapper.mapFromBackend(source.xyC20)
        res.xyC21 = ParamMapper.mapFromBackend(source.xyC21)
        res.xyCRotate = ParamMapper.mapFromBackend(source.xyRotate)
        res.xyCScale = ParamMapper.mapFromBackend(source.xyScale)

        res.yzC00 = ParamMapper.mapFromBackend(source.yzC00)
        res.yzC01 = ParamMapper.mapFromBackend(source.yzC01)
        res.yzC10 = ParamMapper.mapFromBackend(source.yzC10)
        res.yzC11 = ParamMapper.mapFromBackend(source.yzC11)
        res.yzC20 = ParamMapper.mapFromBackend(source.yzC20)
        res.yzC21 = ParamMapper.mapFromBackend(source.yzC21)
        res.yzCRotate = ParamMapper.mapFromBackend(source.yzRotate)
        res.yzCScale = ParamMapper.mapFromBackend(source.yzScale)

        res.zxC00 = ParamMapper.mapFromBackend(source.zxC00)
        res.zxC01 = ParamMapper.mapFromBackend(source.zxC01)
        res.zxC10 = ParamMapper.mapFromBackend(source.zxC10)
        res.zxC11 = ParamMapper.mapFromBackend(source.zxC11)
        res.zxC20 = ParamMapper.mapFromBackend(source.zxC20)
        res.zxC21 = ParamMapper.mapFromBackend(source.zxC21)
        res.zxCRotate = ParamMapper.mapFromBackend(source.zxRotate)
        res.zxCScale = ParamMapper.mapFromBackend(source.zxScale)

        res.xyP00 = ParamMapper.mapFromBackend(source.xyP00)
        res.xyP01 = ParamMapper.mapFromBackend(source.xyP01)
        res.xyP10 = ParamMapper.mapFromBackend(source.xyP10)
        res.xyP11 = ParamMapper.mapFromBackend(source.xyP11)
        res.xyP20 = ParamMapper.mapFromBackend(source.xyP20)
        res.xyP21 = ParamMapper.mapFromBackend(source.xyP21)
        res.xyPRotate = ParamMapper.mapFromBackend(source.xyPRotate)
        res.xyPScale = ParamMapper.mapFromBackend(source.xyPScale)

        res.yzP00 = ParamMapper.mapFromBackend(source.yzP00)
        res.yzP01 = ParamMapper.mapFromBackend(source.yzP01)
        res.yzP10 = ParamMapper.mapFromBackend(source.yzP10)
        res.yzP11 = ParamMapper.mapFromBackend(source.yzP11)
        res.yzP20 = ParamMapper.mapFromBackend(source.yzP20)
        res.yzP21 = ParamMapper.mapFromBackend(source.yzP21)
        res.yzPRotate = ParamMapper.mapFromBackend(source.yzPRotate)
        res.yzPScale = ParamMapper.mapFromBackend(source.yzPScale)

        res.zxP00 = ParamMapper.mapFromBackend(source.zxP00)
        res.zxP01 = ParamMapper.mapFromBackend(source.zxP01)
        res.zxP10 = ParamMapper.mapFromBackend(source.zxP10)
        res.zxP11 = ParamMapper.mapFromBackend(source.zxP11)
        res.zxP20 = ParamMapper.mapFromBackend(source.zxP20)
        res.zxP21 = ParamMapper.mapFromBackend(source.zxP21)
        res.zxPRotate = ParamMapper.mapFromBackend(source.zxPRotate)
        res.zxPScale = ParamMapper.mapFromBackend(source.zxPScale)

        source.variations.map(svar => {
            res.variations.push(VariationMapper.mapFromBackend(svar))
        })
        return res;
    }

    static mapToBackend(source: XForm): SourceXForm {
        const res: SourceXForm = {
            weight: source.weight.value,
            color: source.color.value,
            colorSymmetry: source.colorSymmetry.value,

            xyC00:ParamMapper.mapToBackend(source.xyC00),
            xyC01:ParamMapper.mapToBackend(source.xyC01),
            xyC10:ParamMapper.mapToBackend(source.xyC10),
            xyC11:ParamMapper.mapToBackend(source.xyC11),
            xyC20:ParamMapper.mapToBackend(source.xyC20),
            xyC21:ParamMapper.mapToBackend(source.xyC21),
            xyRotate:ParamMapper.mapToBackend(source.xyCRotate),
            xyScale:ParamMapper.mapToBackend(source.xyCScale),

            yzC00:ParamMapper.mapToBackend(source.yzC00),
            yzC01:ParamMapper.mapToBackend(source.yzC01),
            yzC10:ParamMapper.mapToBackend(source.yzC10),
            yzC11:ParamMapper.mapToBackend(source.yzC11),
            yzC20:ParamMapper.mapToBackend(source.yzC20),
            yzC21:ParamMapper.mapToBackend(source.yzC21),
            yzRotate:ParamMapper.mapToBackend(source.yzCRotate),
            yzScale:ParamMapper.mapToBackend(source.yzCScale),

            zxC00:ParamMapper.mapToBackend(source.zxC00),
            zxC01:ParamMapper.mapToBackend(source.zxC01),
            zxC10:ParamMapper.mapToBackend(source.zxC10),
            zxC11:ParamMapper.mapToBackend(source.zxC11),
            zxC20:ParamMapper.mapToBackend(source.zxC20),
            zxC21:ParamMapper.mapToBackend(source.zxC21),
            zxRotate:ParamMapper.mapToBackend(source.zxCRotate),
            zxScale:ParamMapper.mapToBackend(source.zxCScale),

            xyP00:ParamMapper.mapToBackend(source.xyP00),
            xyP01:ParamMapper.mapToBackend(source.xyP01),
            xyP10:ParamMapper.mapToBackend(source.xyP10),
            xyP11:ParamMapper.mapToBackend(source.xyP11),
            xyP20:ParamMapper.mapToBackend(source.xyP20),
            xyP21:ParamMapper.mapToBackend(source.xyP21),
            xyPRotate:ParamMapper.mapToBackend(source.xyPRotate),
            xyPScale:ParamMapper.mapToBackend(source.xyPScale),

            yzP00:ParamMapper.mapToBackend(source.yzP00),
            yzP01:ParamMapper.mapToBackend(source.yzP01),
            yzP10:ParamMapper.mapToBackend(source.yzP10),
            yzP11:ParamMapper.mapToBackend(source.yzP11),
            yzP20:ParamMapper.mapToBackend(source.yzP20),
            yzP21:ParamMapper.mapToBackend(source.yzP21),
            yzPRotate:ParamMapper.mapToBackend(source.yzPRotate),
            yzPScale:ParamMapper.mapToBackend(source.yzPScale),

            zxP00:ParamMapper.mapToBackend(source.zxP00),
            zxP01:ParamMapper.mapToBackend(source.zxP01),
            zxP10:ParamMapper.mapToBackend(source.zxP10),
            zxP11:ParamMapper.mapToBackend(source.zxP11),
            zxP20:ParamMapper.mapToBackend(source.zxP20),
            zxP21:ParamMapper.mapToBackend(source.zxP21),
            zxPRotate:ParamMapper.mapToBackend(source.zxPRotate),
            zxPScale:ParamMapper.mapToBackend(source.zxPScale),

            modifiedWeights: new Array<number>(),
            variations: new Array<SourceVariation>()
        }
        for(let i=0;i<source.modifiedWeights.length;i++) {
            if(i>=res.modifiedWeights.length) {
                res.modifiedWeights.push(source.modifiedWeights[i])
            }
            else {
                res.modifiedWeights[i] = source.modifiedWeights[i]
            }
        }

        source.variations.map(svar => {
            res.variations.push(VariationMapper.mapToBackend(svar))
        })
        return res;
    }

    static mapForRendering(ctx: RenderMappingContext, source: XForm): RenderXForm {
        const res = new RenderXForm()

        res.weight = source.weight.value
        for(let i=0;i<source.modifiedWeights.length;i++) {
            if(i>=res.modifiedWeights.length) {
                res.modifiedWeights.push(source.modifiedWeights[i])
            }
            else {
                res.modifiedWeights[i] = source.modifiedWeights[i]
            }
        }

        res.color = source.color.value
        res.colorSymmetry = source.colorSymmetry.value

        res.xyC00 = ParamMapper.mapForRendering(ctx, source.xyC00)
        res.xyC01 = ParamMapper.mapForRendering(ctx, source.xyC01)
        res.xyC10 = ParamMapper.mapForRendering(ctx, source.xyC10)
        res.xyC11 = ParamMapper.mapForRendering(ctx, source.xyC11)
        res.xyC20 = ParamMapper.mapForRendering(ctx, source.xyC20)
        res.xyC21 = ParamMapper.mapForRendering(ctx, source.xyC21)
        res.xyCRotate = ParamMapper.mapForRendering(ctx, source.xyCRotate)
        res.xyCScale = ParamMapper.mapForRendering(ctx, source.xyCScale)

        res.yzC00 = ParamMapper.mapForRendering(ctx, source.yzC00)
        res.yzC01 = ParamMapper.mapForRendering(ctx, source.yzC01)
        res.yzC10 = ParamMapper.mapForRendering(ctx, source.yzC10)
        res.yzC11 = ParamMapper.mapForRendering(ctx, source.yzC11)
        res.yzC20 = ParamMapper.mapForRendering(ctx, source.yzC20)
        res.yzC21 = ParamMapper.mapForRendering(ctx, source.yzC21)
        res.yzCRotate = ParamMapper.mapForRendering(ctx, source.yzCRotate)
        res.yzCScale = ParamMapper.mapForRendering(ctx, source.yzCScale)

        res.zxC00 = ParamMapper.mapForRendering(ctx, source.zxC00)
        res.zxC01 = ParamMapper.mapForRendering(ctx, source.zxC01)
        res.zxC10 = ParamMapper.mapForRendering(ctx, source.zxC10)
        res.zxC11 = ParamMapper.mapForRendering(ctx, source.zxC11)
        res.zxC20 = ParamMapper.mapForRendering(ctx, source.zxC20)
        res.zxC21 = ParamMapper.mapForRendering(ctx, source.zxC21)
        res.zxCRotate = ParamMapper.mapForRendering(ctx, source.zxCRotate)
        res.zxCScale = ParamMapper.mapForRendering(ctx, source.zxCScale)

        res.xyP00 = ParamMapper.mapForRendering(ctx, source.xyP00)
        res.xyP01 = ParamMapper.mapForRendering(ctx, source.xyP01)
        res.xyP10 = ParamMapper.mapForRendering(ctx, source.xyP10)
        res.xyP11 = ParamMapper.mapForRendering(ctx, source.xyP11)
        res.xyP20 = ParamMapper.mapForRendering(ctx, source.xyP20)
        res.xyP21 = ParamMapper.mapForRendering(ctx, source.xyP21)
        res.xyPRotate = ParamMapper.mapForRendering(ctx, source.xyPRotate)
        res.xyPScale = ParamMapper.mapForRendering(ctx, source.xyPScale)

        res.yzP00 = ParamMapper.mapForRendering(ctx, source.yzP00)
        res.yzP01 = ParamMapper.mapForRendering(ctx, source.yzP01)
        res.yzP10 = ParamMapper.mapForRendering(ctx, source.yzP10)
        res.yzP11 = ParamMapper.mapForRendering(ctx, source.yzP11)
        res.yzP20 = ParamMapper.mapForRendering(ctx, source.yzP20)
        res.yzP21 = ParamMapper.mapForRendering(ctx, source.yzP21)
        res.yzPRotate = ParamMapper.mapForRendering(ctx, source.yzPRotate)
        res.yzPScale = ParamMapper.mapForRendering(ctx, source.yzPScale)

        res.zxP00 = ParamMapper.mapForRendering(ctx, source.zxP00)
        res.zxP01 = ParamMapper.mapForRendering(ctx, source.zxP01)
        res.zxP10 = ParamMapper.mapForRendering(ctx, source.zxP10)
        res.zxP11 = ParamMapper.mapForRendering(ctx, source.zxP11)
        res.zxP20 = ParamMapper.mapForRendering(ctx, source.zxP20)
        res.zxP21 = ParamMapper.mapForRendering(ctx, source.zxP21)
        res.zxPRotate = ParamMapper.mapForRendering(ctx, source.zxPRotate)
        res.zxPScale = ParamMapper.mapForRendering(ctx, source.zxPScale)

        source.variations.map(svar => {
            res.variations.push(VariationMapper.mapForRendering(ctx, svar))
        })
        return res;
    }
}

class ColorMapper {
    static mapForRendering(_ctx: RenderMappingContext, color: Color): RenderColor {
        return new RenderColor(color.r, color.g, color.b);
    }
}

const COLOR_SCL = 255.0

export class LayerMapper {
    public static mapFromBackend(source: SourceLayer): Layer {
        const res = new Layer()
        res.weight = Parameters.floatParam(source.weight)
        res.density = Parameters.floatParam(source.density)
        res.gradient = []

        source.gradient.forEach(color => res.gradient.push(
          new Color(color.r / COLOR_SCL, color.g / COLOR_SCL, color.b / COLOR_SCL)))

        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapFromBackend(sxf))
        })
        source.finalXforms.map(sxf => {
            res.finalXforms.push(XFormMapper.mapFromBackend(sxf))
        })
        return res
    }

    public static mapToBackend(source: Layer): SourceLayer {
        const res: SourceLayer = {
            weight: source.weight.value,
            density: source.density.value,
            gradient: new Array<Color>(),
            xforms: new Array<SourceXForm>(),
            finalXforms: new Array<SourceXForm>()
        }

        res.gradient = []
        source.gradient.forEach(color => res.gradient.push(
          { r: color.r * COLOR_SCL,
              g: color.g * COLOR_SCL,
              b: color.b * COLOR_SCL}))

        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapToBackend(sxf))
        })
        source.finalXforms.map(sxf => {
            res.finalXforms.push(XFormMapper.mapToBackend(sxf))
        })
        return res
    }

    public static mapForRendering(ctx: RenderMappingContext, source: Layer): RenderLayer {
        const res = new RenderLayer();
        res.weight = source.weight.value
        res.density = source.density.value
        source.gradient.map(color => {
            res.gradient.push(ColorMapper.mapForRendering(ctx, color))
        })
        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapForRendering(ctx, sxf))
        })
        source.finalXforms.map(sxf => {
            res.finalXforms.push(XFormMapper.mapForRendering(ctx, sxf))
        })
        return res
    }
}

export class FlameMapper {
    public static mapFromBackend(source: SourceFlame): Flame {
        const res = new Flame()
        res.resolutionProfile = source.resolutionProfile?? ''
        res.qualityProfile = source.qualityProfile?? ''
        res.name = source.name?? ''
        res.bgImageFilename = source.bgImageFilename?? ''
        res.lastFilename = source.lastFilename?? ''
        res.brightness = Parameters.floatParam(source.brightness)
        res.whiteLevel = Parameters.floatParam(source.whiteLevel)
        res.contrast = Parameters.floatParam(source.contrast)
        res.sampleDensity = Parameters.floatParam(source.sampleDensity)
        res.lowDensityBrightness = Parameters.floatParam(source.lowDensityBrightness)
        res.balanceRed = Parameters.floatParam(source.balanceRed)
        res.balanceGreen = Parameters.floatParam(source.balanceGreen)
        res.balanceBlue = Parameters.floatParam(source.balanceBlue)
        res.gamma = Parameters.floatParam(source.gamma)
        res.gammaThreshold = Parameters.floatParam(source.gammaThreshold)
        res.foregroundOpacity = Parameters.floatParam(source.foregroundOpacity)
        res.vibrancy = Parameters.floatParam(source.vibrancy)
        res.saturation = Parameters.floatParam(source.saturation)
        res.pixelsPerUnit = Parameters.floatParam(source.pixelsPerUnit)
        res.width = Parameters.floatParam(source.width)
        res.height = Parameters.floatParam(source.height)
        res.camZoom = ParamMapper.mapFromBackend(source.camZoom)
        res.centreX = ParamMapper.mapFromBackend(source.centreX)
        res.centreY = ParamMapper.mapFromBackend(source.centreY)
        res.camYaw = ParamMapper.mapFromBackend(source.camYaw)
        res.camPitch = ParamMapper.mapFromBackend(source.camPitch)
        res.camRoll = ParamMapper.mapFromBackend(source.camRoll)
        res.camBank = ParamMapper.mapFromBackend(source.camBank)
        res.camDOF = Parameters.floatParam(source.camDOF)
        res.camDOFArea = Parameters.floatParam(source.camDOFArea)
        res.camPerspective = Parameters.floatParam(source.camPerspective)
        res.diminishZ = Parameters.floatParam(source.diminishZ)
        res.camPosX = Parameters.floatParam(source.camPosX)
        res.camPosY = Parameters.floatParam(source.camPosY)
        res.camPosZ = Parameters.floatParam(source.camPosZ)
        res.newCamDOF = source.newCamDOF
        res.bgTransparency = Parameters.booleanParam(source.bgTransparency)
        res.dimZDistance = Parameters.floatParam(source.dimZDistance)
        res.camZ = Parameters.floatParam(source.camZ)
        res.focusX = Parameters.floatParam(source.focusX)
        res.focusY = Parameters.floatParam(source.focusY)
        res.focusZ = Parameters.floatParam(source.focusZ)
        res.camDOFExponent = Parameters.floatParam(source.camDOFExponent)
        res.frame = Parameters.intParam(source.frame)
        res.frameCount = Parameters.intParam(source.frameCount)
        res.fps = Parameters.intParam(source.fps)
        res.motionBlurLength = Parameters.intParam(source.motionBlurLength)
        res.motionBlurTimeStep = Parameters.floatParam(source.motionBlurTimeStep)
        res.motionBlurDecay = Parameters.floatParam(source.motionBlurDecay)
        source.layers.map(layer => {
            res.layers.push(LayerMapper.mapFromBackend(layer))
        })
        return res
    }

    public static mapToBackend(source: Flame): SourceFlame {
        const res: SourceFlame = {
          resolutionProfile: source.resolutionProfile,
          qualityProfile: source.qualityProfile,
          name: source.name,
          bgImageFilename: source.bgImageFilename,
          lastFilename: source.lastFilename,
          brightness: source.brightness.value,
          whiteLevel: source.whiteLevel.value,
          contrast: source.contrast.value,
          sampleDensity: source.sampleDensity.value,
          lowDensityBrightness: source.lowDensityBrightness.value,
          balanceRed: source.balanceRed.value,
          balanceGreen: source.balanceGreen.value,
          balanceBlue: source.balanceBlue.value,
          gamma: source.gamma.value,
          gammaThreshold: source.gammaThreshold.value,
          foregroundOpacity: source.foregroundOpacity.value,
          vibrancy: source.vibrancy.value,
          saturation: source.saturation.value,
          pixelsPerUnit: source.pixelsPerUnit.value,
          width: source.width.value,
          height: source.height.value,
          camZoom: ParamMapper.mapToBackend(source.camZoom),
          centreX: ParamMapper.mapToBackend(source.centreX),
          centreY: ParamMapper.mapToBackend(source.centreY),
          camYaw: ParamMapper.mapToBackend(source.camYaw),
          camPitch: ParamMapper.mapToBackend(source.camPitch),
          camRoll: ParamMapper.mapToBackend(source.camRoll),
          camBank: ParamMapper.mapToBackend(source.camBank),
          camDOF: source.camDOF.value,
          camDOFArea: source.camDOFArea.value,
          camPerspective: source.camPerspective.value,
          diminishZ: source.diminishZ.value,
          camPosX: source.camPosX.value,
          camPosY: source.camPosY.value,
          camPosZ: source.camPosZ.value,
          newCamDOF: source.newCamDOF,
          bgTransparency: source.bgTransparency.isTrue(),
          dimZDistance: source.dimZDistance.value,
          camZ: source.camZ.value,
          focusX: source.focusX.value,
          focusY: source.focusY.value,
          focusZ: source.focusZ.value,
          camDOFExponent: source.camDOFExponent.value,
          frame: source.frame.value,
          frameCount: source.frameCount.value,
          fps: source.fps.value,
          motionBlurLength: source.motionBlurLength.value,
          motionBlurTimeStep: source.motionBlurTimeStep.value,
          motionBlurDecay: source.motionBlurDecay.value,
          layers: new Array<SourceLayer>()
        }

        source.layers.map(layer => {
            res.layers.push(LayerMapper.mapToBackend(layer))
        })
        return res
    }

    public static mapForRendering(ctx: RenderMappingContext, source: Flame): RenderFlame {
        const res = new RenderFlame();
        res.brightness = ParamMapper.mapNumberParamForRendering(ctx, source.brightness)
        res.whiteLevel = ParamMapper.mapNumberParamForRendering(ctx, source.whiteLevel)
        res.contrast = ParamMapper.mapNumberParamForRendering(ctx, source.contrast)
        res.sampleDensity = source.sampleDensity.value
        res.lowDensityBrightness = ParamMapper.mapNumberParamForRendering(ctx, source.lowDensityBrightness)
        res.balanceRed = ParamMapper.mapNumberParamForRendering(ctx, source.balanceRed)
        res.balanceGreen = ParamMapper.mapNumberParamForRendering(ctx, source.balanceGreen)
        res.balanceBlue = ParamMapper.mapNumberParamForRendering(ctx, source.balanceBlue)
        res.gamma = ParamMapper.mapNumberParamForRendering(ctx, source.gamma)
        res.gammaThreshold = ParamMapper.mapNumberParamForRendering(ctx, source.gammaThreshold)
        res.foregroundOpacity = ParamMapper.mapNumberParamForRendering(ctx, source.foregroundOpacity)
        res.vibrancy = ParamMapper.mapNumberParamForRendering(ctx, source.vibrancy)
        res.saturation = ParamMapper.mapNumberParamForRendering(ctx, source.saturation)
        res.pixelsPerUnit = source.pixelsPerUnit.value
        res.width = source.width.value
        res.height = source.height.value
        res.camZoom = ParamMapper.mapNumberParamForRendering(ctx, source.camZoom)
        res.centreX = ParamMapper.mapNumberParamForRendering(ctx, source.centreX)
        res.centreY = ParamMapper.mapNumberParamForRendering(ctx, source.centreY)
        res.camYaw =  ParamMapper.mapNumberParamForRendering(ctx, source.camYaw)
        res.camPitch = ParamMapper.mapNumberParamForRendering(ctx, source.camPitch)
        res.camRoll = ParamMapper.mapNumberParamForRendering(ctx, source.camRoll)
        res.camBank = ParamMapper.mapNumberParamForRendering(ctx, source.camBank)
        res.camDOF = ParamMapper.mapNumberParamForRendering(ctx, source.camDOF)
        res.camDOFArea = ParamMapper.mapNumberParamForRendering(ctx, source.camDOFArea)
        res.camPerspective = ParamMapper.mapNumberParamForRendering(ctx, source.camPerspective)
        res.diminishZ = ParamMapper.mapNumberParamForRendering(ctx, source.diminishZ)
        res.camPosX = ParamMapper.mapNumberParamForRendering(ctx, source.camPosX)
        res.camPosY = ParamMapper.mapNumberParamForRendering(ctx, source.camPosY)
        res.camPosZ = ParamMapper.mapNumberParamForRendering(ctx, source.camPosZ)
        res.newCamDOF = source.newCamDOF
        res.bgTransparency = source.bgTransparency.isTrue()
        res.dimZDistance = ParamMapper.mapNumberParamForRendering(ctx, source.dimZDistance)
        res.camZ = ParamMapper.mapNumberParamForRendering(ctx, source.camZ)
        res.focusX = ParamMapper.mapNumberParamForRendering(ctx, source.focusX)
        res.focusY = ParamMapper.mapNumberParamForRendering(ctx, source.focusY)
        res.focusZ = ParamMapper.mapNumberParamForRendering(ctx, source.focusZ)
        res.camDOFExponent = ParamMapper.mapNumberParamForRendering(ctx, source.camDOFExponent)
        res.frame = source.frame.value
        res.frameCount = source.frameCount.value
        res.fps = source.fps.value
        res.motionBlurLength = source.motionBlurLength.value
        res.motionBlurTimeStep = source.motionBlurTimeStep.value
        res.motionBlurDecay = source.motionBlurDecay.value

        res.dnType = source.dnType
        res.dnSplitter  = source.dnSplitter.value
        res.dnSigma = source.dnSigma.value
        res.dnKSigma = source.dnKSigma.value
        res.dnThreshold = source.dnThreshold.value
        res.dnMix = source.dnMix.value
        res.dnGamma = source.dnGamma.value

        source.layers.map(layer => {
            res.layers.push(LayerMapper.mapForRendering(ctx, layer))
        })
        // currently, the renderer requires at least one layer, so just create an empty layer when there is not any
        if(res.layers.length==0) {
            const layer = new RenderLayer()
            layer.density = 1
            layer.weight = 1
            res.layers.push(layer)
        }
        return res
    }
}

