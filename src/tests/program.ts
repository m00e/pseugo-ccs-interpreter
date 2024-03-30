import translatePseugoToCCS from "../translator/Translator.js";
import parse from "../parser/Pseugo.js";
import { CCSSemanticContext, generateSatisfiedRuleApplications } from "@pseuco/ccs-interpreter";

const testPG = parse("src/tests/test.go");
const ccsAST = translatePseugoToCCS(testPG);
console.log("Your PseuGo-program translates to:")
console.log(ccsAST.toString());
console.log("----------------------------------")
const context = new CCSSemanticContext(ccsAST.environment);
let derivations = generateSatisfiedRuleApplications(ccsAST.system, context);
if(derivations.derivations.length > 0) {
    do {
        let step = derivations.derivations[0].getStep();
        console.log(`${step.source} -- ${step.action} -> ${step.target}`);
        derivations = generateSatisfiedRuleApplications(step.target, context);
    } while(derivations.derivations.length > 0);    
}
