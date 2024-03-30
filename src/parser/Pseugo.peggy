Prog 
= _ funcs:(FuncDef)+ _ {
    const funcList: PGRegularFunction[] = [];
    let main = new PGMainFunction(new PGBody([]));
    for(const f of funcs) {
        if(f instanceof PGMainFunction) {
            // PGProgram will be built as soon as main()-function was found
            main = f;
            return new PGProgram(funcList, main);
        } else {
            funcList.push(f);
        }
    }
    throw new Error(`There must be one main()-function!`);
}

FuncDef = "func" __o name:FuncName __ "(" __ params:FuncParamList __ ")" ___ "{" ___ b:Body ___ "}" ___
{
    if(name == "main") {
        if(params == null) {
             return new PGMainFunction(b);
        } else {
            throw new Error("main()-functions cannot have parameters!");
        }
    } else {
        if(name == "Main") {
            throw new Error(`'Main' is an illegal name for a function!`);
        } else {
            return new PGRegularFunction(name, params ? params : [], b);
        }
    }
}
FuncParamList = (v:FuncParamDef vs:(__ "," __ v2:FuncParamDef { return v2; })* __ { return [v, ...vs]; } )?

FuncParamDef 
= __ n:VariableName __o "chan" __o t:Type { return new PGFuncParameter(n, t, true); } 
/ __ n:VariableName __o t:Type __ { return new PGFuncParameter(n, t, false); } 

FuncName 
= first:[A-Z$] rest:[$A-Za-z0-9_$]* { return first + rest.join(''); }
/ main:"main" { return main; }
/ first:[a-z0-9_$] rest:[$A-Za-z0-9_$]* { throw new Error("Function names need to start with a capital letter! 'main' is an exception. ") }

VariableName
= first:[A-Za-z$] rest:[$A-Za-z0-9_$]* { return first + rest.join(''); }
/ first:[0-9_$] rest:[$A-Za-z0-9_$]* { throw new Error("Variable names must start with letters!"); }

// -------- Everything that can be in the body --------
Body 
= actions:Action* ___ ifOrSelect:IfOrSelect?
{
    const actionList: PGAction[] = [];
    for(const a of actions) {
        actionList.push(a);
    }
    if(ifOrSelect != null) {
        actionList.push(ifOrSelect)
    }
    return new PGBody(actionList);
}

Action 
= beta:Beta ";" ___ { return beta; }

IfOrSelect
= ifOrSelect:(IfElse / Select)
{
    return ifOrSelect;
}

IfElse 
= "if" __o exp:Exp ___ "{" ___ ifBody:Body ___ "}" ___ "else" ___ "{" ___ elseBody:Body ___ "}" ___ 
{ 
    return new PGIfElse(exp, ifBody, elseBody); 
}
  
Select
= "select" ___ "{" ___ cases:(Case)* ___ "}" ___ 
{
    const caseList: PGCase[] = [];
    for(const c of cases) {
        caseList.push(c);
    }
    return new PGSelect(caseList); 
}

Case = "case" __o cond:k __ ":" ___ caseBody:Body
{
    return new PGCase(cond, caseBody);
}

// One-Liners
Beta = beta:(Go / Print / Make / k) { return beta; }

Go = "go" __o n:FuncNameGo __ "(" __ params:(v:Exp vs:(__ "," __ v2:Exp { return v2; })* __ { return [v, ...vs]; } )? __ ")"
{
    return new PGGo(n, params ? params : []);
}
FuncNameGo 
= first:[A-Z$] rest:[$A-Za-z0-9_$]* { return first + rest.join(''); }
/ main:"main" { throw new Error("Calling the main() function is illegal!"); }
/ first:[a-z0-9_$] rest:[$A-Za-z0-9_$]* { throw new Error("Function names need to start with a capital letter! 'main' is an exception. ") }

Print = "fmt.Println" __ "(" __ v:(Value / Variable)? __ ")"{ return new PGPrint(v); }
Make = v:Variable __ ":=" __ "make" __ "(" __ "chan" __o t:Type __ ")" { return new PGMake(t, v); }

k = k:(In / Decl / Out) { return k; }
In = v:Variable __ "=" __ "<-" __ chan:Variable { return new PGIn(chan, v); }
Decl = v:Variable __ ":=" __ "<-" __ chan:Variable { return new PGDecl(chan, v); }
Out = chan:Variable __ "<-" __ exp:Exp { return new PGOut(chan, exp); }

// 1. Types, 2. Values, 3. Variable, 4. Expressions
// 1. Types
Type = t:("int" / "float" / "complex" / "string" / "bool" / "byte" / "rune") { return t; }

// 2. Values
Value = value:(BoolAsValue / NumberAsValue / StringAsValue) { return value; }

StringAsValue
= '"' string:(String) '"' { return new PGValueExpression(string ? string.join("") : ""); }
String 
= first:[A-Za-z0-9_$] rest:[$A-Za-z0-9_$]* { return first + rest.join(''); }

BoolAsValue 
= "true" { return new PGValueExpression(true); }
/ "false" { return new PGValueExpression(false); } 

NumberAsValue 
=  number:Number { return new PGValueExpression(number); }
Number 
= "0" { return 0; }
/ minus:("-")? first:[1-9] rest:[0-9]* "." decimal:[0-9]* { return parseFloat((minus ? minus : "") + first + rest.join("") + "." + decimal.join("")); }
/ minus:("-")? first:[1-9] rest:[0-9]* { return parseInt((minus ? minus : "") + first + rest.join("")); }

// 3. Variable
Variable
= first:[A-Za-z$] rest:[$A-Za-z0-9_$]*
{
    const name = first + rest.join('');
    if(name == "func" || name == "import" || name == "for" || name == "var" || name == "const" || name == "go" || name == "chan") {
         throw new Error(`Variables cannot be named '${name}'!`);
    }
    return new PGVariableExpression(name);
}
/ first:[0-9_$] rest:[$A-Za-z0-9_$]* { throw new Error("Variable names must start with letters!"); }

// 4. Expressions
Exp = exp:(BinaryExpression / Value / Variable) { return exp; }
ExpStop = exp:(Value / Variable) { return exp; }

BinaryExpression 
= l:ExpStop __ operator:("+" / "-" / "*" / "/" / "%") __ r:ExpStop { return new PGMathExpression(l, r, operator); }
/ l:ExpStop __ operator:("<=" / ">=" / "<" / ">") __ r:ExpStop { return new PGCompareExpression(l, r, operator); }
/ l:ExpStop __ operator:("||" / "&&") __ r:ExpStop { return new PGLogicalExpression(l, r, operator); }
/ l:ExpStop __ operator:("!=" / "==") __ r:ExpStop { return new PGEqualityExpression(l, r, operator); }
/ "!" __ exp:ExpStop { return new PGInvertExpression(exp); }

// Space/Tab/Newline rules
_ = [\n\r]* // Optional new-line
_o = [\n\r]+ // Obligatory new-line
__ = [" " \t]* // Optional space/tab
__o = [" " \t]+ // Obligatory space/tab
___ = [" " \t\n\r]* // Optional space/tab/new-line
___o = [" " \t\n\r]+ // Obligatory space/tab/new-line
