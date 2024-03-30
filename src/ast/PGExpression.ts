import { PGType } from "./PGAction.js";

// Values in PseuGo can be numbers (1,2,3,0.55 etc.), booleans (true, false), strings (e.g. "hello") or channels.
export type PGValue = number | boolean | string;

/**
 * An expression in PseuGo can be a value, a variable, a vector (array) of expressions, the return value of a function f(e) or a string.
 */
export abstract class PGExpression {

    /**
     * Method to evaluate an expression.
     */
    public abstract evaluate(): PGValue;

    public abstract toString(): string;
}

export class PGValueExpression extends PGExpression {
    constructor(readonly value : PGValue) {
        super();
    }

    public evaluate(): PGValue {
        return this.value;
    }

    public toString(): string {
        if(typeof this.value == "string") {
            return `"${this.value}"`;
        }
        return this.value.toString();
    }
}

export class PGVariableExpression extends PGExpression {

    constructor(readonly name : string) {
        super();
    }

    public evaluate(): PGValue {
        return `` // TODO: Why does Felix throw an error?
    }

    public toString(): string {
        return this.name.toString();
    }
}

export class PGInvertExpression extends PGExpression {

    constructor(readonly exp: PGExpression) {
        super();
    }

    public evaluate(): PGValue {
        const evalExp = this.exp.evaluate();
        if(typeof evalExp === "boolean") {
            return !evalExp;
        } else {
            throw new Error("Only booleans are allowed to be inverted!");
        }
    }

    public toString(): string {
        return `!${this.exp.toString()}`;
    }
}

// Expressions with binary operators.
export abstract class PGBinaryExpression extends PGExpression {
    constructor(readonly l : PGExpression, readonly r : PGExpression, readonly operation : string) {
        super();
    }

    public toString() {
        return `${this.l.toString()} ${this.operation.toString()} ${this.r.toString()}`;
    }
}

// Contains +,-,*,/ operators between two numbers.
export class PGMathExpression extends PGBinaryExpression {
    constructor(readonly l : PGExpression, readonly r : PGExpression, readonly operator : "+" | "-" | "*" | "/" | "%") {
        super(l, r, operator);
    }

    public evaluate(): PGValue {
        const l = this.l.evaluate();
        const r = this.r.evaluate();
        if(typeof l === "number" && typeof r === "number") {
            switch(this.operator) {
                case "+":
                    return l+r;
                case "-":
                    return l-r;
                case "*":
                    return l*r;
                case "/":
                    return l/r;
                case "%":
                    return l%r;
            }
        } else {
            throw new Error("Only numbers are allowed with math operators!");
        }
    }
}

// Contains <=, <, >, >= operators between two numbers.
export class PGCompareExpression extends PGBinaryExpression {
    constructor(readonly l : PGExpression, readonly r : PGExpression, readonly operation : "<=" | "<" | ">" | ">=") {
        super(l, r, operation);
    }

    public evaluate(): PGValue {
        const l = this.l.evaluate();
        const r = this.r.evaluate();
        if (typeof l === "number" && typeof r === "number") {
            switch (this.operation) {
                case "<=":
                    return l <= r;
                case "<":
                    return l < r;
                case ">":
                    return l > r;
                case ">=":
                    return l >= r;
            }
        } else {
            throw new Error("Only numbers are allowed with <=, <, > or >=!");
        }
    }
}

// Contains ||,&& operators 
export class PGLogicalExpression extends PGBinaryExpression {
    constructor(readonly l : PGExpression, readonly r : PGExpression, readonly operation : "&&" | "||") {
        super(l, r, operation);
    }

    public evaluate(): PGValue {
        const l = this.l.evaluate();
        const r = this.r.evaluate();
        if (typeof l === "boolean" && typeof r === "boolean") {
            switch (this.operation) {
                case "&&":
                    return l && r;
                case "||":
                    return l || r;
            }
        } else {
            throw new Error("Only boolean expressions are allowed with && or ||!");
        }
        
    }
}

// Contains ==, != 
export class PGEqualityExpression extends PGBinaryExpression {
    constructor(readonly l : PGExpression, readonly r : PGExpression, readonly operation : "==" | "!=") {
        super(l, r, operation);
    }

    public evaluate(): PGValue {
        const l = this.l.evaluate();
        const r = this.r.evaluate();
        switch (this.operation) {
            case "==":
                return l === r;
            case "!=":
                return l !== r;
        }
    }
}