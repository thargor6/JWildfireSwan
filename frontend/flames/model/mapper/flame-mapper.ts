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

import {default as SourceColor} from '../../../generated/org/jwildfire/swan/flames/model/flame/Color'
import {default as SourceXForm} from '../../../generated/org/jwildfire/swan/flames/model/flame/XForm'
import {default as SourceLayer} from '../../../generated/org/jwildfire/swan/flames/model/flame/Layer'
import {default as SourceFlame} from '../../../generated/org/jwildfire/swan/flames/model/flame/Flame'
import {default as SourceVariation} from '../../../generated/org/jwildfire/swan/flames/model/flame/Variation'
import {Flame, Layer, XForm, Variation, Color} from "../flame";
import {FlameParameter, Parameters, RenderParameter, RenderParameters} from "Frontend/flames/model/parameters";
import {RenderColor, RenderLayer, RenderFlame, RenderVariation, RenderXForm} from "Frontend/flames/model/render-flame";
import IParam from "Frontend/generated/org/jwildfire/swan/flames/model/flame/IParam";
import DParam from "Frontend/generated/org/jwildfire/swan/flames/model/flame/DParam";

class ParamMapper {
    static mapForRendering(source: FlameParameter): RenderParameter {
        if(source.datatype==='int') {
            return RenderParameters.intParam(source.value)
        }
        else {
            return RenderParameters.floatParam(source.value)
        }
    }
}

class VariationMapper {
    static mapFromBackend(source: SourceVariation): Variation {
        const res = new Variation()
        res.name = source.name
        res.amount = Parameters.floatParam(source.amount)
        source.dParams.map(sd => {
          res.params.set(sd.name, Parameters.floatParam(sd.value))
        })
        source.iParams.map(id => {
            res.params.set(id.name, Parameters.intParam(id.value))
        })
        return res;
    }

    static mapToBackend(source: Variation): SourceVariation {
        const res: SourceVariation = {
            name: source.name,
            amount: source.amount.value,
            iParams: new Array<IParam>(),
            dParams: new Array<DParam>()
        }
        source.params.forEach((value, key) => {
              res.dParams.push({
                  name: key,
                  value: value.value
              })
        })
        return res;
    }

    static mapForRendering(source: Variation): RenderVariation {
        const res = new RenderVariation()
        res.name = source.name
        res.amount = ParamMapper.mapForRendering(source.amount)
        source.params.forEach((value, key) => {
            res.params.set(key, value.value)
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

        res.c00 = Parameters.floatParam(source.c00)
        res.c01 = Parameters.floatParam(source.c01)
        res.c10 = Parameters.floatParam(source.c10)
        res.c11 = Parameters.floatParam(source.c11)
        res.c20 = Parameters.floatParam(source.c20)
        res.c21 = Parameters.floatParam(source.c21)

        res.p00 = Parameters.floatParam(source.p00)
        res.p01 = Parameters.floatParam(source.p01)
        res.p10 = Parameters.floatParam(source.p10)
        res.p11 = Parameters.floatParam(source.p11)
        res.p20 = Parameters.floatParam(source.p20)
        res.p21 = Parameters.floatParam(source.p21)

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

            c00: source.c00.value,
            c01: source.c01.value,
            c10: source.c10.value,
            c11: source.c11.value,
            c20: source.c20.value,
            c21: source.c21.value,

            p00: source.p00.value,
            p01: source.p01.value,
            p10: source.p10.value,
            p11: source.p11.value,
            p20: source.p20.value,
            p21: source.p21.value,
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

    static mapForRendering(source: XForm): RenderXForm {
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

        res.c00 = ParamMapper.mapForRendering(source.c00)
        res.c01 = ParamMapper.mapForRendering(source.c01)
        res.c10 = ParamMapper.mapForRendering(source.c10)
        res.c11 = ParamMapper.mapForRendering(source.c11)
        res.c20 = ParamMapper.mapForRendering(source.c20)
        res.c21 = ParamMapper.mapForRendering(source.c21)

        res.p00 = ParamMapper.mapForRendering(source.p00)
        res.p01 = ParamMapper.mapForRendering(source.p01)
        res.p10 = ParamMapper.mapForRendering(source.p10)
        res.p11 = ParamMapper.mapForRendering(source.p11)
        res.p20 = ParamMapper.mapForRendering(source.p20)
        res.p21 = ParamMapper.mapForRendering(source.p21)

        source.variations.map(svar => {
            res.variations.push(VariationMapper.mapForRendering(svar))
        })
        return res;
    }
}

class ColorMapper {
    static mapForRendering(color: Color): RenderColor {
        return new RenderColor(color.r, color.g, color.b);
    }
}

export class LayerMapper {
    public static mapFromBackend(source: SourceLayer): Layer {
        const res = new Layer()
        res.weight = Parameters.floatParam(source.weight)
        res.density = Parameters.floatParam(source.density)
        res.gradient = []
        const whitelevel = 265.0
        source.gradient.forEach(color => res.gradient.push(
          new Color(color.r / whitelevel, color.g / whitelevel, color.b / whitelevel)))

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
          // TODO whitelevel
          { r: color.r * 200.0,
              g: color.g * 200.0,
              b: color.b * 200.0}))

        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapToBackend(sxf))
        })
        source.finalXforms.map(sxf => {
            res.finalXforms.push(XFormMapper.mapToBackend(sxf))
        })
        return res
    }

    public static mapForRendering(source: Layer): RenderLayer {
        const res = new RenderLayer();
        res.weight = source.weight.value
        res.density = source.density.value
        source.gradient.map(color => {
            res.gradient.push(ColorMapper.mapForRendering(color))
        })
        source.xforms.map(sxf => {
            res.xforms.push(XFormMapper.mapForRendering(sxf))
        })
        source.finalXforms.map(sxf => {
            res.finalXforms.push(XFormMapper.mapForRendering(sxf))
        })
        return res
    }
}

export class FlameMapper {
    public static mapFromBackend(source: SourceFlame): Flame {
        const res = new Flame()
        res.uid = source.uid
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
        res.camZoom = Parameters.floatParam(source.camZoom)
        res.centreX = Parameters.floatParam(source.centreX)
        res.centreY = Parameters.floatParam(source.centreY)
        res.camYaw = Parameters.floatParam(source.camYaw)
        res.camPitch = Parameters.floatParam(source.camPitch)
        res.camRoll = Parameters.floatParam(source.camRoll)
        res.camBank = Parameters.floatParam(source.camBank)
        res.camDOF = Parameters.floatParam(source.camDOF)
        res.camDOFArea = Parameters.floatParam(source.camDOFArea)
        res.camPerspective = Parameters.floatParam(source.camPerspective)
        res.diminishZ = Parameters.floatParam(source.diminishZ)
        res.camPosX = Parameters.floatParam(source.camPosX)
        res.camPosY = Parameters.floatParam(source.camPosY)
        res.camPosZ = Parameters.floatParam(source.camPosZ)
        res.newCamDOF = source.newCamDOF
        res.dimZDistance = Parameters.floatParam(source.dimZDistance)
        res.camZ = Parameters.floatParam(source.camZ)
        res.focusX = Parameters.floatParam(source.focusX)
        res.focusY = Parameters.floatParam(source.focusY)
        res.focusZ = Parameters.floatParam(source.focusZ)
        res.camDOFExponent = Parameters.floatParam(source.camDOFExponent)

        source.layers.map(layer => {
            res.layers.push(LayerMapper.mapFromBackend(layer))
        })
        return res
    }

    public static mapToBackend(source: Flame): SourceFlame {
        const res: SourceFlame = {
          uid: source.uid,
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
          camZoom: source.camZoom.value,
          centreX: source.centreX.value,
          centreY: source.centreY.value,
          camYaw: source.camYaw.value,
          camPitch: source.camPitch.value,
          camRoll:source.camRoll.value,
          camBank: source.camBank.value,
          camDOF: source.camDOF.value,
          camDOFArea: source.camDOFArea.value,
          camPerspective: source.camPerspective.value,
          diminishZ: source.diminishZ.value,
          camPosX: source.camPosX.value,
          camPosY: source.camPosY.value,
          camPosZ: source.camPosZ.value,
          newCamDOF: source.newCamDOF,
          dimZDistance: source.dimZDistance.value,
          camZ: source.camZ.value,
          focusX: source.focusX.value,
          focusY: source.focusY.value,
          focusZ: source.focusZ.value,
          camDOFExponent: source.camDOFExponent.value,
          layers: new Array<SourceLayer>()
        }

        source.layers.map(layer => {
            res.layers.push(LayerMapper.mapToBackend(layer))
        })
        return res
    }

    public static mapForRendering(source: Flame): RenderFlame {
        const res = new RenderFlame();
        res.brightness = source.brightness.value
        res.whiteLevel = source.whiteLevel.value
        res.contrast = source.contrast.value
        res.sampleDensity = source.sampleDensity.value
        res.lowDensityBrightness = source.lowDensityBrightness.value
        res.balanceRed = source.balanceRed.value
        res.balanceGreen = source.balanceGreen.value
        res.balanceBlue = source.balanceBlue.value
        res.gamma = source.gamma.value
        res.gammaThreshold = source.gammaThreshold.value
        res.foregroundOpacity = source.foregroundOpacity.value
        res.vibrancy = source.vibrancy.value
        res.saturation = source.saturation.value
        res.pixelsPerUnit = source.pixelsPerUnit.value
        res.width = source.width.value
        res.height = source.height.value
        res.camZoom = source.camZoom.value
        res.centreX = source.centreX.value
        res.centreY = source.centreY.value
        res.camYaw = source.camYaw.value
        res.camPitch = source.camPitch.value
        res.camRoll = source.camRoll.value
        res.camBank = source.camBank.value
        res.camDOF = source.camDOF.value
        res.camDOFArea = source.camDOFArea.value
        res.camPerspective = source.camPerspective.value
        res.diminishZ = source.diminishZ.value
        res.camPosX = source.camPosX.value
        res.camPosY = source.camPosY.value
        res.camPosZ = source.camPosZ.value
        res.newCamDOF = source.newCamDOF
        res.dimZDistance = source.dimZDistance.value
        res.camZ = source.camZ.value
        res.focusX = source.focusX.value
        res.focusY = source.focusY.value
        res.focusZ = source.focusZ.value
        res.camDOFExponent = source.camDOFExponent.value
        source.layers.map(layer => {
            res.layers.push(LayerMapper.mapForRendering(layer))
        })
        return res
    }
}

