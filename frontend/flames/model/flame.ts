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

import {FlameParameter, Parameters} from "Frontend/flames/model/parameters";

export const GRADIENT_SIZE = 256

export class Color {
    constructor(public r: number, public g: number, public b: number) {
       //
    }
}

export class Variation {
    public name = 'linear';
    public amount: FlameParameter = Parameters.dNumber(1.0);
    private _params = new Map<string, FlameParameter>();
    public get params() {
        return this._params
    }
}

export class XForm {
    public c00: FlameParameter = Parameters.dNumber(1.0);
    public c01: FlameParameter = Parameters.dNumber(0.0);
    public c10: FlameParameter = Parameters.dNumber(0.0);
    public c11: FlameParameter = Parameters.dNumber(1.0);
    public c20: FlameParameter = Parameters.dNumber(0.0);
    public c21: FlameParameter = Parameters.dNumber(0.0);

    public p00: FlameParameter = Parameters.dNumber(1.0);
    public p01: FlameParameter = Parameters.dNumber(0.0);
    public p10: FlameParameter = Parameters.dNumber(0.0);
    public p11: FlameParameter = Parameters.dNumber(1.0);
    public p20: FlameParameter = Parameters.dNumber(0.0);
    public p21: FlameParameter = Parameters.dNumber(0.0);

    public color: FlameParameter = Parameters.dNumber(0.5);
    public colorSymmetry: FlameParameter = Parameters.dNumber(0.0);
    public weight: FlameParameter = Parameters.dNumber(1.0);

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
    public weight = Parameters.dNumber(1.0)
    public density = Parameters.dNumber(1.0)

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
    public uid: string = '';
    public brightness = Parameters.dNumber(1.0)
    public whiteLevel = Parameters.dNumber(200.0)
    public contrast = Parameters.dNumber(1.0)
    public sampleDensity = Parameters.dNumber(100.0)
    public lowDensityBrightness = Parameters.dNumber(0.2)
    public balanceRed = Parameters.dNumber(0.0)
    public balanceGreen = Parameters.dNumber(0.0)
    public balanceBlue = Parameters.dNumber(0.0)
    public gamma = Parameters.dNumber(3.0)
    public gammaThreshold = Parameters.dNumber(0.05)
    public foregroundOpacity = Parameters.dNumber(0.0)
    public vibrancy = Parameters.dNumber(1.0)
    public saturation = Parameters.dNumber(1.0)
    public pixelsPerUnit = Parameters.dNumber(100.0)
    public width = Parameters.dNumber(512)
    public height = Parameters.dNumber(512)
    public camZoom = Parameters.dNumber(1.0)
    public centreX = Parameters.dNumber(0.0)
    public centreY = Parameters.dNumber(0.0)
    public camYaw = Parameters.dNumber(0.0)
    public camPitch = Parameters.dNumber(0.0)
    public camRoll = Parameters.dNumber(0.0)
    public camBank = Parameters.dNumber(0.0)
    public camDOF = Parameters.dNumber(0.0)
    public camDOFArea = Parameters.dNumber(0.0)
    public camPerspective = Parameters.dNumber(0.0)
    public diminishZ = Parameters.dNumber(0.0)
    public camPosX = Parameters.dNumber(0.0)
    public camPosY = Parameters.dNumber(0.0)
    public camPosZ = Parameters.dNumber(0.0)
    public newCamDOF = false
    public dimZDistance = Parameters.dNumber(0.0)
    public camZ = Parameters.dNumber(0.0)
    public focusX = Parameters.dNumber(0.0)
    public focusY = Parameters.dNumber(0.0)
    public focusZ = Parameters.dNumber(0.0)
    public camDOFExponent = Parameters.dNumber(0.0)

    private _layers = new Array<Layer>();

    public get layers() {
        return this._layers;
    }
}