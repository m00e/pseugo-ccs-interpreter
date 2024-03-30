import peggy from "peggy";
import tspegjs from "ts-pegjs";

import { readFileSync, writeFileSync, mkdirSync } from "fs";

// Reads the parser file
const grammar = readFileSync("./src/parser/Pseugo.peggy", "utf8");

// Generate the parser
const parser = peggy.generate(grammar, {
    output: "source",
    format: "commonjs",
    plugins: [tspegjs],
    allowedStartRules: ["Prog"],
    tspegjs: {
        customHeader: `import {PGType, PGAction, PGIfElse, PGSelect, PGCase, PGIn, PGDecl, PGOut, PGMake, PGGo, PGPrint} from "../ast/PGAction.js";
        import {PGBody} from "../ast/PGBody.js";
        import {PGValue, PGExpression, PGValueExpression, PGVariableExpression, PGInvertExpression, PGBinaryExpression, PGMathExpression, PGCompareExpression, PGLogicalExpression, PGEqualityExpression} from "../ast/PGExpression.js";
        import {PGFunction, PGRegularFunction, PGMainFunction, PGFuncParameter} from "../ast/PGFunction.js";
        import {PGProgram} from "../ast/PGProgram.js";`
    }
});

writeFileSync("./src/parser/go-parser.ts", parser, "utf8");

console.log("Parser successfully generated.")