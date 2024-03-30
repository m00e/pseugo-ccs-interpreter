import { PGFunction, PGRegularFunction, PGMainFunction } from "./PGFunction.js";

/**
 * AST-class of the entire parsed program
 */
export class PGProgram {
    /**
     * 
     * @param functions List of regular functions of a PseuGo-program
     * @param mainFunc Main function of a PseuGo-program
     */
    constructor(readonly functions : PGRegularFunction[], readonly mainFunc : PGMainFunction) {}

    /**
     * Example output:
     * 
     * package main;
     * import "fmt";
     * func f() {
     * <func-body>
     * }
     * 
     * func main() {
     * <main-body>
     * }
     * @returns 
     */
    public toString(): string {
        const str = this.functions.length > 0 ? `${this.functions.join("\n")}\n${this.mainFunc.toString()}` : 
                                                    `${this.mainFunc.toString()}`;
        return str;
    }
}