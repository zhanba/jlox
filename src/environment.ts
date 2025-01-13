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

  getAt(distance: number, name: string): any {
    return this.ancestor(distance).values.get(name);
  }

  private ancestor(distance: number): Environment {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      environment = environment.enclosing!;
    }
    return environment;
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

  assignAt(distance: number, name: Token, value: any) {
    this.ancestor(distance).values.set(name.lexeme, value);
  }
}
