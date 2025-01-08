import { readFileSync } from "fs";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { reporter } from "./reporter";
import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { AstPrinter } from "./astPrinter";
import { Interpreter } from "./interpreter";

export class Lox {
  main(args: string[]) {
    if (args.length > 1) {
      console.log("Usage: jlox [script]");
    } else if (args.length === 1) {
      this.runFile(args[0]);
    } else {
      this.runPrompt();
    }
  }

  protected runFile(path: string) {
    const source = readFileSync(path, "utf-8");

    this.run(source);

    if (reporter.hadError) {
      process.exit(1);
    }
  }

  protected async runPrompt() {
    const rl = createInterface({ input, output });

    while (true) {
      const answer = await rl.question("> ");
      if (answer === undefined || answer === null) {
        break;
      }
      this.run(answer);
      reporter.hadError = false;
    }

    rl.close();
  }

  run(source: string) {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();
    const stmts = new Parser(tokens).parse();
    if (reporter.hadError) {
      return;
    }

    if (!stmts) {
      return;
    }
    console.log(stmts);

    const interpreter = new Interpreter();

    interpreter.interpret(stmts);
  }
}

const source = `// this is a comment
var a = 111;
print a = 23;

var a = "global a";
var b = "global b";
var c = "global c";
{
  var a = "outer a";
  var b = "outer b";
  {
    var a = "inner a";
    print a;
    print b;
    print c;
  }
  print a;
  print b;
  print c;
}
print a;
print b;
print c;

`;

const lox = new Lox();
lox.run(source);
