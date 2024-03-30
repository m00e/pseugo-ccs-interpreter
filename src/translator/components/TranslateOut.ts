import { CCSAction, CCSOutput } from "@pseuco/ccs-interpreter";
import { PGOut } from "../../index.js";
import { TranslationHelper, getChannelFromHelper } from "../TranslationUtils.js";
import translateExpression from "./TranslateExpressions.js";

/**
 * Translates an out into CCSAction.
 * @param action Out as an AST-object
 * @param helper {@link TranslationHelper}
 * @returns Out as a CCSAction
 */
export const translateOut = (action: PGOut, helper: TranslationHelper): CCSAction => {
    // Get the channel used to output a value and build CCSOutput.
    const ch = getChannelFromHelper(action.chan.name, helper);
    if(ch == null) throw new Error(`Channel '${action.chan.name}' unknown!`);
    return new CCSOutput(ch, translateExpression(action.exp));
}

export default translateOut;