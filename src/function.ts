import { LoxInstance } from "./class";
import { Environment } from "./environment";
import type { Interpreter } from "./interpreter";
import { Function } from "./statement";

export interface LoxCallable {
  arity(): number;
  call(interpreter: Interpreter, args: any[]): any;
}

export namespace LoxCallable {
  export function isCallable(value: any): value is LoxCallable {
    return (
      typeof value.arity === "function" && typeof value.call === "function"
    );
  }
}

export class LoxFunction implements LoxCallable {
  constructor(
    private declaration: Function,
    private closure: Environment,
    private isInitializer: boolean
  ) {}

  bind(instance: LoxInstance): LoxFunction {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    return new LoxFunction(this.declaration, environment, this.isInitializer);
  }

  call(interpreter: Interpreter, args: any[]): any {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      if (this.isInitializer) return this.closure.getAt(0, "this");
      return returnValue;
    }

    if (this.isInitializer) return this.closure.getAt(0, "this");
    return null;
  }

  arity(): number {
    return this.declaration.params.length;
  }

  toString(): string {
    return `<fn ${this.declaration.name.lexeme}>`;
  }
}

export class BuiltinClock implements LoxCallable {
  arity(): number {
    return 0;
  }

  call(): number {
    return Date.now() / 1000;
  }

  toString(): string {
    return "<native fn>";
  }
}
