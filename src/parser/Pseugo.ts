import { parse as peggyParse } from "./go-parser.js";
import { PGProgram } from "../ast/PGProgram.js";
import * as fs from "fs";

// List of keywords in Go. Used for highlighting
export const keywords: string[] = ["func", "main", "select", "if", "then", "else", "case", "make", "chan", "go", "fmt.Println",
                        "int", "float", "complex", "string", "bool", "byte", "rune"];

/**
 * Prints parsing error messages.
 */
export class NonLocalizedParseError extends Error {
    constructor(message: string) {
        super(message)
    }
}

/**
 * Parses a PseuGo-program and returns the PseuGo-AST.
 * @param input A PseuGo program as a string.
 * @returns The parsed PseuGo program as an AST-Object.
 */
const parse = (path: string): PGProgram => {
    const file = fs.readFileSync(path, {encoding: 'utf-8'});
    const result: PGProgram = peggyParse(file);
    return result;
}

// TODO: Read in as string before releasing it on pseuco.com?

export default parse;
