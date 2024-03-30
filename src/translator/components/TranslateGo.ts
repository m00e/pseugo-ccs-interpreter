import { CCSVariableExpressionOrChannelName, CCSProcessApplication } from "@pseuco/ccs-interpreter";
import { PGGo } from "../../index.js";
import { TranslationHelper } from "../TranslationUtils.js";

/**
 * Build the CCSProcessApplication that will be saved in the helper to build the "system" later on.
 * @param action Go as an AST-object
 * @param helper {@link TranslationHelper}
 * @returns null
 */
export const translateGo = (action: PGGo, helper: TranslationHelper): null => {
    for(let i = 0; i < helper.program.functions.length; i++) {
        const curr = helper.program.functions[i];
        if(action.funcName == curr.name) { // Function exists
            // Check if the amount of passed parameters in go-call is equal to the amount of parameters expected by the function.
            if(action.params.length != helper.program.functions[i].params.length) {
                throw new Error(`You gave ${action.params.length} parameter(s), but the function '${action.funcName}' has ${helper.program.functions[i].params.length} expected parameter(s).`)
            }

            // Construct the list of parameters for the CCSProcessApplication.
            let params : CCSVariableExpressionOrChannelName[] = [];
            for(let i = 0; i < action.params.length; i++) {
                const currActionParam = action.params[i];
                params.push(new CCSVariableExpressionOrChannelName(currActionParam.toString()));
            }

            // Add the ProcessApplication to the calledProcesses-list in the TranslationHelper.
            helper.calledProcesses.push(new CCSProcessApplication(curr.name, params));
            return null;
        }
    }
    
    // The called function doesn't exist or the program doesn't have any functions in the first place.
    throw new Error(`Function '${action.funcName}' not found! \nMaybe it was declared after the main()-function or the function name has a typo!`)
}

export default translateGo;