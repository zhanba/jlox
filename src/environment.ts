import { reporter } from "./reporter";
import { Token } from "./scanner";

export class Environment {
  private values = new Map<string, any>();

  constructor(private enclosing: Environment | null = null) {}

  define(name: string, value: any) {
    this.values.set(name, value);
  }

  get(name: Token): any {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }

    reporter.error(name, `Undefined variable '${name.lexeme}'.`);
  }

  assign(name: Token, value: any) {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing !== null) {
      this.enclosing.assign(name, value);
      return;
    }

    reporter.error(name, `Undefined variable '${name.lexeme}'.`);
  }
}
