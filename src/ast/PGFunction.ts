import { PGBody } from "./PGBody.js";
import { PGType } from "./PGAction.js";

export abstract class PGFunction {
    /**
     * 
     * @param name Name of the function (= "main" for main-function; ≠ "main" for regular function)
     * @param body Function body 
     * @param params List of parameters
     */
    constructor(readonly name: string, readonly params: PGFuncParameter[], readonly body: PGBody) {}

    public abstract toString(): string;
}

/**
 * AST-Class for the Main-Function of a PseuGo-Program.
 * The name is always "main" and the parameter-list is always empty.
 */
export class PGMainFunction extends PGFunction {
    /**
     * 
     * @param body List of actions
     */
    constructor(readonly body: PGBody) {
        super("Main", [], body);
    }

    /**
     * Example output:
     * func main() {
     * <main-body>
     * }
     * @returns 
     */
    public toString(): string {
        return `func main() {\n${this.body.toString()}\n}\n`
    }
}

/**
 * AST-Class for a regular function of a PseuGo-Program.
 */
export class PGRegularFunction extends PGFunction {
    /**
     * 
     * @param name Function name
     * @param params Parameter list
     * @param body List of actions
     */
    constructor(readonly name: string, readonly params: PGFuncParameter[], readonly body: PGBody) {
        super(name, params, body);
    }

    /**
     * Example output:
     * func f(c chan int, x int) {
     * <func-body>
     * }
     * @returns 
     */
    public toString(): string {
        const paramList = this.params.length > 0 ? `${this.params.join(", ")}` : "";
        return `func ${this.name.toString()}(${paramList}) {\n${this.body.toString()}\n}\n`; 
    }
}

/**
 * AST-class of a function parameter
 */
export class PGFuncParameter {
    /**
     * 
     * @param name name of the parameter
     * @param type e.g. int, string, bool etc.
     * @param chan true if the parameter is a channel, false if not
     */
    constructor(readonly name: string, readonly type: string, readonly chan : boolean) {}

    /**
     * Example output:
     * c chan int
     * x int
     * @returns 
     */
    public toString(): string {
        if(this.chan == true) {
            return `${this.name} chan ${this.type}`;
        }
        return `${this.name} ${this.type}`;
    }
}