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

export class RenderColor {
  constructor(public r: number, public g: number, public b: number) {
  }
}

export class RenderVariation {
    public name = ''
    public amount = 0.0
    private _params = new Map<string, number | boolean>()
    public get params() {
        return this._params
    }
}

export class RenderXForm {
    public c00 = 1.0
    public c01 = 0.0
    public c10 = 0.0
    public c11 = 1.0
    public c20 = 0.0
    public c21 = 0.0

    public p00 = 1.0
    public p01 = 0.0
    public p10 = 0.0
    public p11 = 1.0
    public p20 = 0.0
    public p21 = 0.0

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
    brightness = 1.0
    whiteLevel = 220
    contrast = 1.0
    sampleDensity = 100.0
    lowDensityBrightness = 0.25
    balanceRed = 0.0
    balanceGreen = 0.0
    balanceBlue = 0.0
    gamma = 3.0
    gammaThreshold = 0.025
    foregroundOpacity = 0.0
    vibrancy = 1.0
    saturation = 1.0
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