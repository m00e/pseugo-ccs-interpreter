import { CCSAction, CCSInput, CCSUnrestrictedValueSet } from "@pseuco/ccs-interpreter";
import { PGIn, PGDecl } from "../../index.js";
import { TranslationHelper, getChannelFromHelper } from "../TranslationUtils.js";

/**
 * Translates decl/in into a CCSActions. There is no difference between those to in CCS.
 * @param action Decl/In as an AST-Object
 * @param helper {@link TranslationHelper}
 * @returns Decl/In as a CCSAction
 */
export const translateDeclIn = (action: PGIn | PGDecl, helper: TranslationHelper): CCSAction => {
    // Get the channel used to receive a value and build CCSInput.
    const ch = getChannelFromHelper(action.chan.name, helper);
    if(ch == null) throw new Error(`Channel '${action.chan.name}' unknown!`);
    return new CCSInput(ch, action.variable.name, new CCSUnrestrictedValueSet());
}

export default translateDeclIn;