import { PGSelect, PGCase, PGOut } from "../../index.js";
import { TranslationHelper } from "../TranslationUtils.js";
import { translateBody } from "../Translator.js";
import translateOut from "./TranslateOut.js";
import translateDeclIn from "./TranslateIn.js";
import { CCSProcess, CCSChoice, CCSPrefix } from "@pseuco/ccs-interpreter";

/**
 * Translates the select into a CCSProcess
 * @param action Select as an AST-object
 * @param helper {@link TranslationHelper}
 * @returns Select as a CCSProcess, if it has at least 1 case. null if 0 cases.
 */
export const translateSelect = (action: PGSelect, helper: TranslationHelper): CCSProcess | null => {
    // If the select doesn't have any cases, no process should be built and returned.
    if(action.cases.length == 0) {
        return null;
    }

    // Translate the first case. If there are multiple cases, concatenate them with a choice 
    // e.g. case1 + case2 + case3 + ...
    let process = translateCase(action.cases[0], helper);
    for(let i = 1; i < action.cases.length; i++) {
        process = new CCSChoice(process, translateCase(action.cases[i], helper));
    }

    return process;
}

/**
 * Translates a select-case into a CCSProcess
 * @param action Case as an AST-object
 * @param helper {@link TranslationHelper}
 * @returns 
 */
export const translateCase = (action: PGCase, helper: TranslationHelper): CCSProcess => {
    const caseProcess = translateBody(action.caseBody, helper);
    // Case-Conditions can only be inputs or outputs in PseuGo
    return new CCSPrefix(action.condition instanceof (PGOut) ? translateOut(action.condition, helper) : translateDeclIn(action.condition, helper), caseProcess);
}

export default translateSelect;