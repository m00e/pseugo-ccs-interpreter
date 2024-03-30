# pseugo-ccs-interpreter

Prerequisites:
-VS-Code: https://code.visualstudio.com/download 
(Note: I only tested the program in VS-Code. If you use it outside of VS-Code, it might not work due to unrelated TypeScript-issues.
Its probably also easier and more comfortable for you to test and check the program code)

-Node and npm
Installation:
1. Download the newest version: https://nodejs.org/en/download.
2. Downgrade it to v16.16.0 with: `npm install -g node@16.16.0` (needs to be run as an administrator).
or 
1. Download Node for your operating system https://nodejs.org/dist/v16.16.0/ (v16.16.0)
2. Extract the downloaded file and navigate into the extracted folder.
3. Execute the installation tool (e.g. install_tools.bat) as an administrator.

##################################################################################################################################################################################

Usage:
1. Open this project in VS-Code (you should be in the directory /go-ccs-interpreter/). 
Navigate to `/go-ccs-interpreter/` if you aren't there. 
2. Build the parser and download all dependencies with: `npm ci`.
You can open a new terminal by clicking on "Terminal" (in the top bar of the VS-Code window) and type `npm ci` in the Terminal window
3. Edit the file `test.go` in `/src/tests/` to test your go-program
Important: DO NOT RENAME OR MOVE THAT FILE! Only edit the file.

5. Execute the translation tool with: `ts-node --esm src\tests\program.ts`
Note: Depending on your operating system, \ might also be a /.
If the terminal says: "No such file or directory", you need to change the path of `test.go` in `/src/tests/program.ts` in line 4.

Note 2: Whenever you edited `test.go`, you need to save it.

##################################################################################################################################################################################

Important for parsing a PseuGo-program:

-Do not use 'stop'. The 'stop'-primitive is not included in the parser, because it doesn't exist in Go. 

-Functions parameters are not defined like that in the parser: func f(x,y,z) {}
but like that: func f(x int, y chan int, z bool). 
<variable-name> chan <type> - for a channel variable
<variable-name> <type> - for a non-channel variable

The parser accepts the following types:
"int", "float", "complex", "string", "bool", "byte", "rune"
Types will not be translated into VP-CCS.

-When using a channel, the channel name must be universially identical.

-Function names have to start with a capital letter. That is a restriction imposed on CCSProcesses by the CCS-AST.

-*Strings do not work. E.g. fmt.Println("Test") for example does not work properly. It also only allows the usage of the character A-Z, a-z and 0-9.
-*Passing channel variables works fine! But passing values does not work properly. Here is an example:
go F(1); with:
func F(x int) {
    fmt.Println(x);
}

*Note for the last two bullet points: 
The translation itself works, but you won't see any transitions because the CCS-Process is internally broken, what you don't see.
##################################################################################################################################################################################

How to construct the LTS of the process:
1. Copy your entire process with all process definitions, for example:

Main := 0
P[x] := fmtPrintln!x.0

Main | P[7+5]

2. Activate the LTS-tool on pseuco.com, if you haven't done it yet:
2.1 Visit https://pseuco.com/#/about
2.2 Click on the blue button "tool mode"
3. Go to https://pseuco.com/#/new/ccs -> "Create a new empty file"
4. Paste the (your) CCS-process in the box
5. Done!