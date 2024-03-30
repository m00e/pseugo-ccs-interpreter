import { PGBody } from "./PGBody.js";
import { PGVariableExpression, PGExpression, PGValueExpression } from "./PGExpression.js";

/**
 * Valid types in PseuGo: numbers, booleans, strings. 
 */
export type PGType = number | boolean | string | null;

export abstract class PGAction {
    constructor() {}

    public abstract toString(): string;
}

/**
 * If-Else AST-object.
 */
export class PGIfElse extends PGAction {
    /**
     * 
     * @param exp Condition
     * @param ifBody If-body
     * @param elseBody Else-body
     */
    constructor(readonly exp : PGExpression, readonly ifBody : PGBody, readonly elseBody : PGBody) {
        super();
    }

    /**
     * Example output:
     * if exp {
     * <if-body>
     * } else {
     * <else-body>
     * }
     * @returns 
     */
    public toString(): string {
        return `if ${this.exp.toString()} {\n${this.ifBody.toString()}\n} else {\n${this.elseBody.toString()}\n}`;
    }
}

/**
 * Select AST-object
 */
export class PGSelect extends PGAction {
    /**
     * 
     * @param cases Array of cases.
     */
    constructor(readonly cases : PGCase[]) {
        super();
    }

    /**
     * Example output:
     * select {
     * <cases>
     * }
     * @returns 
     */
    public toString(): string {
        const casesList = `${this.cases.join("\n")}`
        return 'select {\n' + `${casesList}` + '\n}';
    }
}

/**
 * Case AST-object
 */
export class PGCase extends PGAction {
    constructor(readonly condition : PGIn | PGDecl | PGOut, readonly caseBody : PGBody) {
        super();
    }

    /**
     * Example output:
     * case <condition>:
     * action1;
     * action2;
     * ...
     * @returns 
     */
    public toString(): string {
        const actions = `${this.caseBody.actions.join("\n")}`;
        return 'case ' + this.condition.toString().replace(";", ": \n") + actions;
    }
}

/**
 * Input AST-object
 */
export class PGIn extends PGAction {
    /**
     * 
     * @param chan Channel from which a value is received.
     * @param variable Variable in which we safe the received value.
     */
    constructor(readonly chan : PGVariableExpression, readonly variable : PGVariableExpression) {
        super();
    }

    /**
     * Example output: x =<- c;
     * @returns 
     */
    public toString(): string {
        return `${this.variable.toString()} =<- ${this.chan.toString()};`;
    }
}

/**
 * Decl AST-Object
 */
export class PGDecl extends PGAction {
    /**
     * 
     * @param chan Channel from which a value is received.
     * @param variable Variable in which we safe the received value.
     */
    constructor(readonly chan : PGVariableExpression, readonly variable : PGVariableExpression) {
        super();
    }

    /**
     * Example output: x :=<- c;
     * @returns 
     */
    public toString(): string {
        return `${this.variable.toString()} :=<- ${this.chan.toString()};`;
    }
}

/**
 * Out AST-Object
 */
export class PGOut extends PGAction {
    /**
     * 
     * @param chan Channel through which a value is sent.
     * @param exp Expression that will be evaluated and sent.
     */
    constructor(readonly chan : PGVariableExpression, readonly exp : PGExpression) {
        super();
    }

    /**
     * Example output: c <- 5;
     * @returns 
     */
    public toString(): string {
        return `${this.chan.toString()} <- ${this.exp.toString()};`;
    }
}

/**
 * Make AST-Object
 */
export class PGMake extends PGAction {
    /**
     * 
     * @param type Type of variable that is allowed through a channel. 
     * It will not be translated, because channels in CCS allow multiple types of values to pass through. 
     * @param variable 
     */
    constructor(readonly type : PGType, readonly variable : PGVariableExpression) {
        super();
    }

    public toString(): string {
        return `${this.variable.toString()} := make(chan ${this.type?.toString()});`;
    }
}

/**
 * Go AST-Object
 */
export class PGGo extends PGAction {
    /**
     * 
     * @param funcName Name of the called function.
     * @param params List of passed parameters.
     */
    constructor(readonly funcName : string, readonly params : PGVariableExpression[]) {
        super();
    }
    
    /**
     * Example output: go f(x, 2);
     * @returns 
     */
    public toString(): string {
        let paramsAsString : string[] = [];
        this.params.forEach(element => {
            paramsAsString.push(element.toString());
        });
        const params = paramsAsString.length > 0 ? paramsAsString.join(", ") : "";
        return `go ${this.funcName}(${params.toString()});`;
    }
}

/**
 * Print AST-Object
 */
export class PGPrint extends PGAction {

    /**
     * 
     * @param arg String/variable that will be printed out.
     */
    constructor(readonly arg: PGVariableExpression | PGValueExpression | string) {
        super();
    }

    /**
     * Example output:
     * fmt.Println(x); or
     * fmt.Println(5); or
     * fmt.Println("Hello");
     * @returns 
     */
    public toString(): string {
        if(this.arg instanceof PGVariableExpression) {
            return `fmt.Println(${this.arg.toString()});`;
        } else if(this.arg instanceof String) {
            return `fmt.Println("${this.arg}");`
        }
        return `fmt.Println(${this.arg.toString()});`;
    }
}