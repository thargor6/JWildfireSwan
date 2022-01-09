import {Flame, XForm} from "./flame";
import {Parameters} from "Frontend/flames/model/parameters";

export class FlameFactory {
    public static createSierpinsky(): Flame {
        const res = new Flame()
        {
            const xform = new XForm()
            xform.weight = Parameters.number(0.28)
            xform.color = Parameters.number(0.16642585045050873)
            xform.symmetry = Parameters.number(0.30579038532543024)
            xform.c00 = Parameters.number(1.0882422490651094)
            xform.c01 = Parameters.number(0.20060811857054575)
            xform.c10 = Parameters.number(-0.20060811857054575)
            xform.c11 = Parameters.number(1.0882422490651094)
            xform.c20 = Parameters.number(-0.9908451668873571)
            xform.c21 = Parameters.number(-0.0548148486370485)
            res.xforms.push(xform)
        }
        {
            const xform = new XForm()
            xform.weight = Parameters.number(1.16)
            xform.color = Parameters.number(0.007327686320157012)
            xform.symmetry = Parameters.number(0.023130003925706633)
            xform.c00 = Parameters.number(1.6330328215218384)
            xform.c01 = Parameters.number(-0.5954514360066321)
            xform.c10 = Parameters.number(0.5954514360066321)
            xform.c11 = Parameters.number(1.6330328215218384)
            xform.c20 = Parameters.number(0.3401899456645815)
            xform.c21 = Parameters.number(-0.20320989909136572)
            res.xforms.push(xform)
        }
        {
            const xform = new XForm()
            xform.weight = Parameters.number(0.26)
            xform.color = Parameters.number(0.5680920578181441)
            xform.symmetry = Parameters.number(0.9779777461903779)
            xform.c00 = Parameters.number(0.6628027856798102)
            xform.c01 = Parameters.number(0.10180761736225492)
            xform.c10 = Parameters.number(-0.10180761736225492)
            xform.c11 = Parameters.number(0.6628027856798102)
            xform.c20 = Parameters.number(0.5)
            xform.c21 = Parameters.number(0.5)
            res.xforms.push(xform)
        }

        return res
    }
}
