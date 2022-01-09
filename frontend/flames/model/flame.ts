import {FlameParameter, Parameters} from "Frontend/flames/model/parameters";


export class XForm {
    public c00: FlameParameter = Parameters.number(1.0);
    public c01: FlameParameter = Parameters.number(0.0);
    public c10: FlameParameter = Parameters.number(0.0);
    public c11: FlameParameter = Parameters.number(1.0);
    public c20: FlameParameter = Parameters.number(0.0);
    public c21: FlameParameter = Parameters.number(0.0);
    public color: FlameParameter = Parameters.number(0.5);
    public symmetry: FlameParameter = Parameters.number(0.0);
    public weight: FlameParameter = Parameters.number(1.0);
}

export class Flame {
    public brightness = Parameters.number(1.0);
    private _xforms = new Array<XForm>();
    public get xforms() {
        return this._xforms;
    }
}