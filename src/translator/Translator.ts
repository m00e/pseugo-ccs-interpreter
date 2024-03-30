import { PGProgram } from "../ast/PGProgram.js";
import { PGBody } from "../ast/PGBody.js";
import { PGIfElse, PGSelect, PGIn, PGOut, PGDecl, PGMake, PGGo, PGPrint } from "../ast/PGAction.js";
import { PGFunction } from "../ast/PGFunction.js";
import { TranslationHelper, createSystemFromHelper } from "./TranslationUtils.js"
import translateDeclIn from "./components/TranslateIn.js";
import translateOut from "./components/TranslateOut.js";
import translateSelect from "./components/TranslateSelect.js";
import translateIfElse from "./components/TranslateIfElse.js";
import translateMake from "./components/TranslateMake.js";
import translateGo from "./components/TranslateGo.js";
import translatePrint from "./components/TranslatePrint.js";
import { CCS, CCSRangeDefinition, CCSEnvironment, CCSProcessDefinition, CCSProcess, CCSAction, CCSStop, CCSPrefix, CCSSequence } from "@pseuco/ccs-interpreter";

/**
 * Translates a parsed PseuGo-program into a CCS process.
 * @param pseugo Parsed PseuGo-program (as an AST)
 * @returns CCS process (as an AST)
 */
export const translatePseugoToCCS = (pseugo: PGProgram): CCS => {
    // Creates the TranslationHelper used for collecting all information about channels, processes etc.
    const helper = new TranslationHelper([], [], [], pseugo); 
    const rangeDefinitions : CCSRangeDefinition[] = []; // Needs to be defined, I don't really use it.
    
    // Translate the functions.
    helper.processes.push(translateFunction(pseugo.mainFunc, helper));
    pseugo.functions.forEach(f => {
        helper.processes.push(translateFunction(f, helper));
    });

    // Build the CCS-AST and return it.
    const environment = new CCSEnvironment(helper.processes, rangeDefinitions);
    const system = createSystemFromHelper(helper);
    const ccs = new CCS(environment, system);
    return ccs;
}

/**
 * Translates a PseuGo-Function into a ProcessDefinition
 * @param f 
 * @param helper {@link TranslationHelper}
 * @returns 
 */
export const translateFunction = (f: PGFunction, helper: TranslationHelper): CCSProcessDefinition => {
    // Collect the parameter names
    let paramNames : string[] = [];
    f.params.forEach(param => {
        paramNames.push(param.name);
    });

    // Translate the function-body, build and return the ProcessDefinition
    const process = translateBody(f.body, helper);
    return new CCSProcessDefinition(f.name, process, paramNames);
}

/**
 * Builds the body of a function/if-else or case.
 * The actions will be processed and translated from the front to the back,
 * but the actual process-building happens from the back to the front
 * due to the usage of CCSPrefix.
 * @param b 
 * @param helper 
 * @returns 
 */
export const translateBody = (b: PGBody, helper: TranslationHelper): CCSProcess => {
    let process : CCSProcess; // Final product that will be returned.
    let returnVal : CCSAction | CCSProcess | null = null; // Return value for each iteration.
    let returnValCollection : (CCSAction | CCSProcess)[] = []; // List of all translated actions.

    // Iterate through the body and translate each action.
    for(let i = 0; i < b.actions.length; i++) {
        let action = b.actions[i];

        if(action instanceof PGSelect) returnVal = translateSelect(action, helper);
        else if(action instanceof PGIfElse) returnVal = translateIfElse(action, helper);
        else if(action instanceof PGIn || action instanceof PGDecl) returnVal = translateDeclIn(action, helper);
        else if(action instanceof PGOut) returnVal = translateOut(action, helper);
        else if(action instanceof PGPrint) returnVal = translatePrint(action, helper);
        else if(action instanceof PGMake) returnVal = translateMake(action, helper);
        else if(action instanceof PGGo) returnVal = translateGo(action, helper);

        if(returnVal != null) returnValCollection.push(returnVal);
    }

    // Initialization of the process.
    /* 
    If the last element of returnValCollection is a process, then process is that last element.
    That only happens if the body ends with an if-else or a select (with at least one case).
    But if the last element is an action, process needs to be the stop process "0".
    Necessary for the concatenation below.
    */
    const returnValCollectionLast = returnValCollection[returnValCollection.length-1];
    if(returnValCollectionLast != null && returnValCollectionLast instanceof CCSProcess) {
        process = returnValCollectionLast;
        returnValCollection = returnValCollection.slice(0,-1); //Remove the last element that we assigned to process
    } else {
        process = new CCSStop();
    } 

    // Build the process from the back to the front.
    for(let i = returnValCollection.length-1; i >= 0; i--) {
        /*
        It needs to be checked if the element in returnValCollection is an action,
        otherwise TypeScript throws an error because returnValCollection can also have CCSProcesses.
        */
        const curr = returnValCollection[i];
        if(curr instanceof CCSAction) {
            process = new CCSPrefix(curr, process);
        }
    }
    return process;
}

export default translatePseugoToCCS;