import { TranslationHelper } from "../TranslationUtils.js";
import { PGIfElse } from "../../index.js";
import { translateBody } from "../Translator.js";
import translateExpression from "./TranslateExpressions.js";
import { CCSProcess, CCSChoice, CCSCondition, CCSComplementExpression } from "@pseuco/ccs-interpreter";

/**
 * Translates if-else into a CCSChoice
 * @param action If-Else as an AST-object
 * @param helper {@link TranslationHelper}
 * @returns If-Else as a CCSProcess
 */
export const translateIfElse = (action: PGIfElse, helper: TranslationHelper): CCSProcess => {
    // Build the if and else bodies and combine them into a choice.
    // (process looks like that: <if-condition>.<if-body> + <else-condition>.<else-body>)
    const ifProcess = translateBody(action.ifBody, helper);
    const elseProcess = translateBody(action.elseBody, helper);

    const exp = translateExpression(action.exp);
    if(typeof exp.evaluate() != 'boolean') {
        throw new Error(`The expression '${exp.toString()}' doesn't evaluate to a boolean!`);
    }
    return new CCSChoice(new CCSCondition(exp, ifProcess), 
                        new CCSCondition(new CCSComplementExpression(exp), elseProcess));
}

export default translateIfElse;