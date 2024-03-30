import { CCSAction, CCSOutput } from "@pseuco/ccs-interpreter";
import { PGPrint } from "../../index.js";
import { TranslationHelper, getChannelFromHelper} from "../TranslationUtils.js";
import translateExpression from "./TranslateExpressions.js";

/**
 * Translates a print into CCSOutput
 * @param action Print as an AST-object
 * @param helper {@link TranslationHelper} 
 * @returns Print as a CCSAction
 */
export const translatePrint = (action: PGPrint, helper: TranslationHelper): CCSAction => {
    // Get the channel "fmtPrintln" used to print a string/value and build CCSOutput.
    const ch = getChannelFromHelper("fmtPrintln", helper);
    if(ch == null) throw new Error(`Channel 'println' unknown!`);
    return new CCSOutput(ch, translateExpression(action.arg));
}

export default translatePrint;