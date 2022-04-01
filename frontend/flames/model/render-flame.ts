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

import {RenderParameter, RenderParameters} from "Frontend/flames/model/parameters";

export class RenderMappingContext {
   constructor(private _frame: number, private _motionBlurLength: number,
               private _motionBlurTimeStep: number) {
     // EMPTY
   }

   public get frame() {
       return this._frame
   }

   public get motionBlurTimeLength() {
       return this._motionBlurLength * this._motionBlurTimeStep
   }

}

export class RenderColor {
  constructor(public r: number, public g: number, public b: number) {
  }
}

export class RenderVariation {
    public name = ''
    public amount = RenderParameters.floatParam(1.0)
    private _params = new Map<string, RenderParameter>()
    public get params() {
        return this._params
    }
}

export class RenderXForm {
    public xyC00 = RenderParameters.floatParam(1.0)
    public xyC01 = RenderParameters.floatParam(0.0)
    public xyC10 = RenderParameters.floatParam(0.0)
    public xyC11 = RenderParameters.floatParam(1.0)
    public xyC20 = RenderParameters.floatParam(0.0)
    public xyC21 = RenderParameters.floatParam(0.0)

    public yzC00 = RenderParameters.floatParam(1.0)
    public yzC01 = RenderParameters.floatParam(0.0)
    public yzC10 = RenderParameters.floatParam(0.0)
    public yzC11 = RenderParameters.floatParam(1.0)
    public yzC20 = RenderParameters.floatParam(0.0)
    public yzC21 = RenderParameters.floatParam(0.0)

    public zxC00 = RenderParameters.floatParam(1.0)
    public zxC01 = RenderParameters.floatParam(0.0)
    public zxC10 = RenderParameters.floatParam(0.0)
    public zxC11 = RenderParameters.floatParam(1.0)
    public zxC20 = RenderParameters.floatParam(0.0)
    public zxC21 = RenderParameters.floatParam(0.0)

    public xyP00 = RenderParameters.floatParam(1.0)
    public xyP01 = RenderParameters.floatParam(0.0)
    public xyP10 = RenderParameters.floatParam(0.0)
    public xyP11 = RenderParameters.floatParam(1.0)
    public xyP20 = RenderParameters.floatParam(0.0)
    public xyP21 = RenderParameters.floatParam(0.0)

    public yzP00 = RenderParameters.floatParam(1.0)
    public yzP01 = RenderParameters.floatParam(0.0)
    public yzP10 = RenderParameters.floatParam(0.0)
    public yzP11 = RenderParameters.floatParam(1.0)
    public yzP20 = RenderParameters.floatParam(0.0)
    public yzP21 = RenderParameters.floatParam(0.0)

    public zxP00 = RenderParameters.floatParam(1.0)
    public zxP01 = RenderParameters.floatParam(0.0)
    public zxP10 = RenderParameters.floatParam(0.0)
    public zxP11 = RenderParameters.floatParam(1.0)
    public zxP20 = RenderParameters.floatParam(0.0)
    public zxP21 = RenderParameters.floatParam(0.0)

    public color = 0.0
    public colorSymmetry = 0.0
    public c1 = 0.0
    public c2 = 0.0
    public weight = 0.0

    private _modifiedWeights: number[] = [];
    public get modifiedWeights() {
        return this._modifiedWeights
    }

    private _variations = new Array<RenderVariation>();
    public get variations() {
        return this._variations
    }
}

export class RenderLayer {
    weight = 1.0
    density = 1.0
    private _gradient = new Array<RenderColor>()
    private _xforms = new Array<RenderXForm>()
    private _finalXforms = new Array<RenderXForm>();

    public get xforms() {
        return this._xforms
    }

    public get gradient() {
        return this._gradient
    }

    public get finalXforms() {
        return this._finalXforms
    }

    public get hasModifiedWeights() {
        for(let i=0;i<this.xforms.length;i++) {
            const xForm = this.xforms[i]
            for(let j=0;j<this.xforms.length;j++) {
                if(xForm.modifiedWeights[j]!=1) {
                    return true
                }
            }
        }
        return false
    }
}

export class RenderFlame {
    public motionBlurLength = 12
    public motionBlurTimeStep = 0.05
    public motionBlurDecay = 0.03
    public frame = 1
    public frameCount = 100
    public fps = 25
    public brightness = 1.0
    public whiteLevel = 220
    public contrast = 1.0
    public sampleDensity = 100.0
    public lowDensityBrightness = 0.25
    public balanceRed = 0.0
    public balanceGreen = 0.0
    public balanceBlue = 0.0
    public gamma = 3.0
    public gammaThreshold = 0.025
    public foregroundOpacity = 0.0
    public vibrancy = 1.0
    public saturation = 1.0
    public width = 512
    public height = 512
    public pixelsPerUnit = 100
    public camZoom = 1.0
    public centreX = 0.0
    public centreY = 0.0
    public camYaw = 0.0
    public camPitch = 0.0
    public camRoll = 0.0
    public camBank = 0.0
    public camDOF = 0.0
    public camDOFArea = 0.0
    public camPerspective = 0.0
    public diminishZ = 0.0
    public camPosX = 0.0
    public camPosY = 0.0
    public camPosZ = 0.0
    public newCamDOF = false
    public bgTransparency = true
    public dimZDistance = 0.0
    public camZ = 0.0
    public focusX = 0.0
    public focusY = 0.0
    public focusZ = 0.0
    public camDOFExponent = 0.0

    private _layers = new Array<RenderLayer>()

    public get layers() {
        return this._layers
    }
}