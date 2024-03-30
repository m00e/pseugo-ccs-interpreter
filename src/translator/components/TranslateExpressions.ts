import { CCSExpression, CCSVariableExpression, CCSConstantExpression, CCSAndExpression, CCSOrExpression, CCSEqualityExpression, CCSAdditiveExpression, CCSMultiplicativeExpression, CCSComplementExpression, CCSRelationalExpression } from "@pseuco/ccs-interpreter";
import { PGExpression, PGVariableExpression, PGValueExpression, PGBinaryExpression } from "../../index.js";

/**
 * Translates a PseuGo-Expression into a CCSExpression
 * @param exp PseuGo-Expression
 * @returns CCSExpression
 */
export const translateExpression = (exp: PGExpression | PGVariableExpression | PGValueExpression | string): CCSExpression => {
    if(exp instanceof PGVariableExpression) {
        return new CCSVariableExpression(exp.name);
    } else if (exp instanceof PGValueExpression) {
        return new CCSConstantExpression(exp.value);
    } else if (exp instanceof PGBinaryExpression) {
        if(exp.operation == "&&") {
            return new CCSAndExpression(translateExpression(exp.l), translateExpression(exp.r));
        } else if(exp.operation == "||") {
            return new CCSOrExpression(translateExpression(exp.l), translateExpression(exp.r));
        } else if(exp.operation == ("==" || "!=")) {
            return new CCSEqualityExpression(translateExpression(exp.l), translateExpression(exp.r), exp.operation);
        } else if(exp.operation == ("+" || "-")) {
            return new CCSAdditiveExpression(translateExpression(exp.l), translateExpression(exp.r), exp.operation);
        } else if(exp.operation == ("*" || "/" || "%")) {
            return new CCSMultiplicativeExpression(translateExpression(exp.l), translateExpression(exp.r), exp.operation);
        } else if(exp.operation == (">=" || "<=" || ">" || "<")) {
            return new CCSRelationalExpression(translateExpression(exp.l), translateExpression(exp.r), exp.operation);
        }
    }
    return new CCSComplementExpression(translateExpression(exp));
}

export default translateExpression;