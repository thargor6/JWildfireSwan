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

import {FlameParameter, FlameResource, Parameters} from "Frontend/flames/model/parameters";

export const GRADIENT_SIZE = 256

export class Color {
    constructor(public r: number, public g: number, public b: number) {
       //
    }
}

export class Variation {
    public name = 'linear'
    public amount: FlameParameter = Parameters.floatParam(1.0)

    private _params = new Map<string, FlameParameter>()
    public get params() {
        return this._params
    }

    private _resources = new Map<string, FlameResource>()
    public get resources() {
        return this._resources
    }
}

export class XForm {
    public xyC00: FlameParameter = Parameters.floatParam(1.0);
    public xyC01: FlameParameter = Parameters.floatParam(0.0);
    public xyC10: FlameParameter = Parameters.floatParam(0.0);
    public xyC11: FlameParameter = Parameters.floatParam(1.0);
    public xyC20: FlameParameter = Parameters.floatParam(0.0);
    public xyC21: FlameParameter = Parameters.floatParam(0.0);
    public xyCRotate: FlameParameter = Parameters.floatParam(0.0);
    public xyCScale: FlameParameter = Parameters.floatParam(0.0);

    public yzC00: FlameParameter = Parameters.floatParam(1.0);
    public yzC01: FlameParameter = Parameters.floatParam(0.0);
    public yzC10: FlameParameter = Parameters.floatParam(0.0);
    public yzC11: FlameParameter = Parameters.floatParam(1.0);
    public yzC20: FlameParameter = Parameters.floatParam(0.0);
    public yzC21: FlameParameter = Parameters.floatParam(0.0);
    public yzCRotate: FlameParameter = Parameters.floatParam(0.0);
    public yzCScale: FlameParameter = Parameters.floatParam(0.0);

    public zxC00: FlameParameter = Parameters.floatParam(1.0);
    public zxC01: FlameParameter = Parameters.floatParam(0.0);
    public zxC10: FlameParameter = Parameters.floatParam(0.0);
    public zxC11: FlameParameter = Parameters.floatParam(1.0);
    public zxC20: FlameParameter = Parameters.floatParam(0.0);
    public zxC21: FlameParameter = Parameters.floatParam(0.0);
    public zxCRotate: FlameParameter = Parameters.floatParam(0.0);
    public zxCScale: FlameParameter = Parameters.floatParam(0.0);

    public xyP00: FlameParameter = Parameters.floatParam(1.0);
    public xyP01: FlameParameter = Parameters.floatParam(0.0);
    public xyP10: FlameParameter = Parameters.floatParam(0.0);
    public xyP11: FlameParameter = Parameters.floatParam(1.0);
    public xyP20: FlameParameter = Parameters.floatParam(0.0);
    public xyP21: FlameParameter = Parameters.floatParam(0.0);
    public xyPRotate: FlameParameter = Parameters.floatParam(0.0);
    public xyPScale: FlameParameter = Parameters.floatParam(0.0);

    public yzP00: FlameParameter = Parameters.floatParam(1.0);
    public yzP01: FlameParameter = Parameters.floatParam(0.0);
    public yzP10: FlameParameter = Parameters.floatParam(0.0);
    public yzP11: FlameParameter = Parameters.floatParam(1.0);
    public yzP20: FlameParameter = Parameters.floatParam(0.0);
    public yzP21: FlameParameter = Parameters.floatParam(0.0);
    public yzPRotate: FlameParameter = Parameters.floatParam(0.0);
    public yzPScale: FlameParameter = Parameters.floatParam(0.0);

    public zxP00: FlameParameter = Parameters.floatParam(1.0);
    public zxP01: FlameParameter = Parameters.floatParam(0.0);
    public zxP10: FlameParameter = Parameters.floatParam(0.0);
    public zxP11: FlameParameter = Parameters.floatParam(1.0);
    public zxP20: FlameParameter = Parameters.floatParam(0.0);
    public zxP21: FlameParameter = Parameters.floatParam(0.0);
    public zxPRotate: FlameParameter = Parameters.floatParam(0.0);
    public zxPScale: FlameParameter = Parameters.floatParam(0.0);

    public color: FlameParameter = Parameters.floatParam(0.5);
    public colorSymmetry: FlameParameter = Parameters.floatParam(0.0);
    public weight: FlameParameter = Parameters.floatParam(1.0);

    private _modifiedWeights: number[] = [];
    public get modifiedWeights() {
        return this._modifiedWeights
    }

    private _variations = new Array<Variation>();
    public get variations() {
        return this._variations
    }
}

export class Layer {
    public weight = Parameters.floatParam(1.0)
    public density = Parameters.floatParam(1.0)

    public gradient = new Array<Color>(GRADIENT_SIZE);

    private _xforms = new Array<XForm>();
    private _finalXforms = new Array<XForm>();
    public get xforms() {
        return this._xforms;
    }

    public get finalXforms() {
        return this._finalXforms;
    }
}

export class Flame {
    public resolutionProfile: string = ''
    public qualityProfile: string = ''
    public name: string = ''
    public bgImageFilename: string = ''
    public lastFilename: string = ''
    public brightness = Parameters.floatParam(1.0)
    public whiteLevel = Parameters.floatParam(200.0)
    public contrast = Parameters.floatParam(1.0)
    public sampleDensity = Parameters.floatParam(100.0)
    public lowDensityBrightness = Parameters.floatParam(0.2)
    public balanceRed = Parameters.floatParam(0.0)
    public balanceGreen = Parameters.floatParam(0.0)
    public balanceBlue = Parameters.floatParam(0.0)
    public gamma = Parameters.floatParam(3.0)
    public gammaThreshold = Parameters.floatParam(0.05)
    public foregroundOpacity = Parameters.floatParam(0.0)
    public vibrancy = Parameters.floatParam(1.0)
    public saturation = Parameters.floatParam(1.0)
    public pixelsPerUnit = Parameters.floatParam(100.0)
    public width = Parameters.floatParam(512)
    public height = Parameters.floatParam(512)
    public camZoom = Parameters.floatParam(1.0)
    public centreX = Parameters.floatParam(0.0)
    public centreY = Parameters.floatParam(0.0)
    public camYaw = Parameters.floatParam(0.0)
    public camPitch = Parameters.floatParam(0.0)
    public camRoll = Parameters.floatParam(0.0)
    public camBank = Parameters.floatParam(0.0)
    public camDOF = Parameters.floatParam(0.0)
    public camDOFArea = Parameters.floatParam(0.0)
    public camPerspective = Parameters.floatParam(0.0)
    public diminishZ = Parameters.floatParam(0.0)
    public camPosX = Parameters.floatParam(0.0)
    public camPosY = Parameters.floatParam(0.0)
    public camPosZ = Parameters.floatParam(0.0)
    public newCamDOF = false
    public bgTransparency = Parameters.booleanParam(true)
    public dimZDistance = Parameters.floatParam(0.0)
    public camZ = Parameters.floatParam(0.0)
    public focusX = Parameters.floatParam(0.0)
    public focusY = Parameters.floatParam(0.0)
    public focusZ = Parameters.floatParam(0.0)
    public camDOFExponent = Parameters.floatParam(0.0)
    public motionBlurLength = Parameters.intParam(0)
    public motionBlurTimeStep = Parameters.floatParam(0.05)
    public motionBlurDecay = Parameters.floatParam(0.03)
    public frame = Parameters.intParam(1);
    public frameCount = Parameters.intParam(100);
    public fps = Parameters.intParam(25);

    private _layers = new Array<Layer>();

    public get layers() {
        return this._layers;
    }
}