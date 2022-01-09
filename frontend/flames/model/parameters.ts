export interface FlameParameter {
    type: "number" | "dynamic";
    value: number;
}

class NumberParameter implements FlameParameter {
    type: "number" | "dynamic";

    constructor(public value: number) {
        this.type = "number";
    }
}

export class Parameters {
    public static number(value: number) {
        return new NumberParameter(value);
    }
}