import { LoxCallable, LoxFunction } from "./function";
import { Interpreter } from "./interpreter";
import { Token } from "./scanner";
import { Function } from "./statement";

export class LoxInstance {
  private fields: Map<string, any>;

  constructor(private klass: LoxClass) {
    this.fields = new Map();
  }

  get(name: Token): any {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method) {
      return method.bind(this);
    }

    throw new Error(`Undefined property '${name}'.`);
  }

  set(name: string, value: any): void {
    this.fields.set(name, value);
  }

  toString(): string {
    return this.klass.toString() + " instance";
  }
}

export class LoxClass implements LoxCallable {
  name: string;
  superclass?: LoxClass;
  methods: Map<string, LoxFunction> = new Map();

  constructor(
    name: string,
    methods: Map<string, LoxFunction>,
    superclass?: LoxClass
  ) {
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }

  findMethod(name: string): LoxFunction | undefined {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    return this.superclass?.findMethod(name);
  }

  call(interpreter: Interpreter, args: any[]): any {
    const instance = new LoxInstance(this);
    const initializer = this.findMethod("init");
    if (initializer) {
      initializer.bind(instance).call(interpreter, args);
    }

    return instance;
  }

  arity(): number {
    const initializer = this.findMethod("init");
    if (initializer) {
      return initializer.arity();
    }

    return 0;
  }

  toString(): string {
    return this.name;
  }
}
