

const MAX_MOD_WEIGHT_COUNT = 100
const NEXT_APPLIED_XFORM_TABLE_SIZE = 1024

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

    private _nextAppliedXFormTable: (number | undefined)[] = new Array<number | undefined>(NEXT_APPLIED_XFORM_TABLE_SIZE)
    public get nextAppliedXFormTable() {
        return this._nextAppliedXFormTable
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
                tp[i] = this.xforms[i].weight * this.xforms[k].modifiedWeights[i];
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