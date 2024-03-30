import { CCSChannel, CCSProcessDefinition, CCSProcessApplication, CCSProcess, CCSParallel, CCSRestriction, CCSVariableExpressionOrChannelName } from "@pseuco/ccs-interpreter";
import { PGProgram } from "../index.js";

/**
 * Contains all necessary components for a translation.
 */
export class TranslationHelper {

    /**
     * Creates a TranslationHelper
     * @param knownChannels Array of all created channels in a program.
     * @param processes All processes that exist inside a CCS-process. For every function 1 process each.
     * @param calledFunctions List of the actual called processes.
     * @param program 
     */
    constructor(readonly knownChannels : CCSChannel[], 
                readonly processes : CCSProcessDefinition[],
                readonly calledProcesses : CCSProcessApplication[], 
                readonly program : PGProgram) {
        knownChannels.push(new CCSChannel("fmtPrintln", null)); // Always a known channel, to translate PGPrint.
    }
}

/**
 * Creates the system of a CCS-AST with the information provided by the {@link TranslationHelper}, adds a restriction.
 * @param helper TranslationHelper
 * @returns System of a CCS-process
 */
export const createSystemFromHelper = (helper: TranslationHelper): CCSProcess => {
    let process : CCSProcess = new CCSProcessApplication("Main", []);
    
    // Iterate through calledFunctions-List to build the system.
    helper.calledProcesses.forEach(processApplication => {
        process = new CCSParallel(process, processApplication);
    });

    // Add the restriction, if there are channel names that need to be restricted.
    const restrictionList = createChannelRestrictionListFromHelper(helper);
    if(restrictionList.length > 0) {
        process = new CCSRestriction(process, createChannelRestrictionListFromHelper(helper));
    }
    return process;
}

/**
 * Returns a CCSChannel with the variable name {@link n} from the {@link TranslationHelper}. 
 * @param n Channel variable.
 * @param helper {@link TranslationHelper}
 * @returns CCSChannel with name {@link n}, if this channel doesn't exist, it returns null.
 */
export const getChannelFromHelper = (n: string, helper: TranslationHelper): CCSChannel | null => {
    for(let i = 0; i < helper.knownChannels.length; i++) {
        if(n == helper.knownChannels[i].name) {
            return helper.knownChannels[i];
        }
    }
    return null;
}

export const createChannelRestrictionListFromHelper = (helper: TranslationHelper): string[] => {
    const restrictedChannelNames: string[] = [];
    helper.knownChannels.forEach(ch => {
        // fmtPrintln should not be in the restriction!
        if(ch.name != "fmtPrintln") {
            restrictedChannelNames.push(ch.name);
        }
    })
    return restrictedChannelNames;
}

/**
 * 
 * @param funcName Function whose parameter names shall be returned
 * @param helper TranslationHelper
 * @returns List of parameters of a function
 */
export const getParametersOfFunction = (funcName: string, helper: TranslationHelper): CCSVariableExpressionOrChannelName[] => {
    const list : CCSVariableExpressionOrChannelName[] = []
    for(let i = 0; i < helper.processes.length; i++) {
        if(helper.processes[i].name == funcName) {
            for(let j = 0; j < helper.processes[i].params.length; j++) {
                list.push(new CCSVariableExpressionOrChannelName(helper.processes[i].params[j]));
            }
            return list;
        }
    }
    return [];
}