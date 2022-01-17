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

export class RenderFlame {
    public brightness = 1.0;

    private _xforms = new Array<RenderXForm>();
    public get xforms() {
        return this._xforms;
    }

    private _finalXforms = new Array<RenderXForm>();
    public get finalXforms() {
        return this._finalXforms;
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