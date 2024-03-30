import { CCSChannel } from "@pseuco/ccs-interpreter";
import { PGMake } from "../../index.js";
import { TranslationHelper } from "../TranslationUtils.js";

/**
 * Creates a new channel, if it doesn't exist already.
 * @param action Make as an AST-object
 * @param helper {@link TranslationHelper}
 * @returns null
 */
export const translateMake = (action: PGMake, helper: TranslationHelper): null => {
    for(let i = 0; i < helper.knownChannels.length; i++) {
        if(helper.knownChannels[i].name == action.variable.name) {
            // Same channel name should not be put into the list of known channels again.
            return null;
        }
    }

    // Add the created channel to the list of known channels.
    helper.knownChannels.push(new CCSChannel(action.variable.name, null));
    return null;
}

export default translateMake;