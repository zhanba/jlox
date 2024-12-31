import { TokenType, type Token } from "./scanner";

export class Reporter {
  hadError = false;

  scanError(line: number, message: string) {
    this.report(line, "", message);
  }

  error(line: Token, message: string) {
    if (line.type === TokenType.EOF) {
      this.report(line.line, " at end", message);
    } else {
      this.report(line.line, ` at '${line.lexeme}'`, message);
    }
  }

  private report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error ${where}: ${message}`);
    this.hadError = true;
  }
}

export const reporter = new Reporter();
