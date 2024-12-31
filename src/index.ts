import { readFileSync } from "fs";
import { createInterface } from "readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { reporter } from "./reporter";
import { Scanner } from "./scanner";
import { Parser } from "./parser";
import { AstPrinter } from "./astPrinter";

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
    const expr = new Parser(tokens).parse();
    if (reporter.hadError) {
      return;
    }

    if (!expr) {
      return;
    }
    console.log(expr);

    const printer = new AstPrinter();

    console.log(printer.print(expr));
  }
}

const source = `// this is a comment

2 +  1 / 4
`;

const lox = new Lox();
lox.run(source);
