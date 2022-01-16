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

const MAX_MOD_WEIGHT_COUNT = 100
const NEXT_APPLIED_XFORM_TABLE_SIZE = 1024

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

    private _nextAppliedXFormTable: (number | undefined)[] = new Array<number | undefined>(NEXT_APPLIED_XFORM_TABLE_SIZE)
    public get nextAppliedXFormTable() {
        return this._nextAppliedXFormTable
    }

    private _variations = new Array<Variation>();
    public get variations() {
        return this._variations
    }
}

export class Flame {
    public brightness = Parameters.dNumber(1.0);
    private _xforms = new Array<XForm>();
    private _finalXforms = new Array<XForm>();
    public get xforms() {
        return this._xforms;
    }

    public get finalXforms() {
        return this._finalXforms;
    }

    public refreshModWeightTables() {
       // init xforms
        for (let xForm of this.xforms) {
            //  xForm.initTransform();
          for(let variation of xForm.variations) {
            // var.getFunc().init(pFlameTransformationContext, this, xForm, var.getAmount());
          }
        }
        // init final xforms
        for (let xForm of this.finalXforms) {
            // xForm.initTransform();
            for (let variation of xForm.variations) {
                // var.getFunc().init(pFlameTransformationContext, this, xForm, var.getAmount());
            }
        }
        // refresh weights
        let tp: number[] = new Array<number>(MAX_MOD_WEIGHT_COUNT);
        const n = this.xforms.length
        for (let k = 0; k < n; k++) {
            const xform = this.xforms[k];
            let totValue = 0;
            for (let i = 0; i < n; i++) {
                // TODO eval weight.value
                tp[i] = this.xforms[i].weight.value * this.xforms[k].modifiedWeights[i];
                totValue = totValue + tp[i];
            }

            if (totValue > 0) {
                let loopValue = 0.0;
                for (let i = 0; i < xform.nextAppliedXFormTable.length; i++) {
                    let totalProb = 0.0;
                    let j = -1;
                    do {
                        j++;
                        totalProb = totalProb + tp[j];
                    }
                    while (!((totalProb > loopValue) || (j == n - 1)));
                    xform.nextAppliedXFormTable[i] = j;
                    loopValue = loopValue + totValue / xform.nextAppliedXFormTable.length;
                }
            }
            else {
                for (let i = 0; i < xform.nextAppliedXFormTable.length; i++) {
                    xform.nextAppliedXFormTable[i] = undefined;
                }
            }
        }
     }
}