import {
  Assign,
  Binary,
  Call,
  Expr,
  Visitor as ExprVisitor,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  Super,
  This,
  Unary,
  Variable,
} from "./expression";
import type { Interpreter } from "./interpreter";
import { reporter } from "./reporter";
import { Token } from "./scanner";
import {
  Block,
  Class,
  Expression,
  Function,
  If,
  Print,
  Return,
  Stmt,
  Visitor as StmtVisitor,
  Var,
  While,
} from "./statement";

export class Stack<T> {
  private stack: T[] = [];

  push(value: T): void {
    this.stack.push(value);
  }

  pop(): T | undefined {
    return this.stack.pop();
  }

  peek(): T {
    return this.stack[this.stack.length - 1];
  }

  isEmpty(): boolean {
    return this.stack.length === 0;
  }

  get length(): number {
    return this.stack.length;
  }

  get(index: number): T {
    return this.stack[index];
  }
}

enum FunctionType {
  NONE,
  FUNCTION,
  INITIALIZER,
  METHOD,
}

export enum ClassType {
  NONE,
  CLASS,
  SUBCLASS,
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private scopes = new Stack<Map<string, boolean>>();
  private currentFunction = FunctionType.NONE;
  private currentClass = ClassType.NONE;

  constructor(private interpreter: Interpreter) {}

  visitAssignExpr(expr: Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  visitBinaryExpr(expr: Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitCallExpr(expr: Call): void {
    this.resolve(expr.callee);
    for (const arg of expr.args) {
      this.resolve(arg);
    }
  }

  visitGetExpr(expr: Get): void {
    this.resolve(expr.object);
  }

  visitGroupingExpr(expr: Grouping): void {
    this.resolve(expr.expression);
  }

  visitLiteralExpr(expr: Literal): void {}

  visitLogicalExpr(expr: Logical): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  visitSetExpr(expr: Set): void {
    this.resolve(expr.value);
    this.resolve(expr.object);
  }

  visitSuperExpr(expr: Super): void {
    // Implementation for visiting a super expression
  }

  visitThisExpr(expr: This): void {
    if (this.currentClass === ClassType.NONE) {
      reporter.error(expr.keyword, "Cannot use 'this' outside of a class.");
      return;
    }
    this.resolveLocal(expr, expr.keyword);
  }

  visitUnaryExpr(expr: Unary): void {
    this.resolve(expr.right);
  }

  visitVariableExpr(expr: Variable): void {
    if (!this.scopes.isEmpty()) {
      const scope = this.scopes.peek();
      if (scope.get(expr.name.lexeme) === false) {
        reporter.error(
          expr.name,
          "Cannot read local variable in its own initializer."
        );
      }
    }
    this.resolveLocal(expr, expr.name);
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes.get(i).has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }

  visitBlockStmt(stmt: Block): void {
    this.beginScope();
    this.resolveStmts(stmt.statements);
    this.endScope();
  }

  private beginScope(): void {
    this.scopes.push(new Map());
  }

  resolveStmts(statements: Stmt[]): void {
    for (const statement of statements) {
      this.resolve(statement);
    }
  }

  private resolve(stmt: Stmt | Expr): void {
    stmt.accept(this);
  }

  private endScope(): void {
    this.scopes.pop();
  }

  visitClassStmt(stmt: Class): void {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.CLASS;
    this.declare(stmt.name);
    this.define(stmt.name);

    this.beginScope();
    this.scopes.peek().set("this", true);

    for (const method of stmt.methods) {
      const declaration =
        method.name.lexeme === "init"
          ? FunctionType.INITIALIZER
          : FunctionType.METHOD;
      this.resolveFunction(method, declaration);
    }

    this.endScope();
    this.currentClass = enclosingClass;
  }

  visitExpressionStmt(stmt: Expression): void {
    this.resolve(stmt.expression);
  }

  visitFunctionStmt(stmt: Function): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  private resolveFunction(stmt: Function, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (const param of stmt.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveStmts(stmt.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  visitIfStmt(stmt: If): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch) {
      this.resolve(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Print): void {
    this.resolve(stmt.expression);
  }

  visitReturnStmt(stmt: Return): void {
    if (stmt.value) {
      if (this.currentFunction === FunctionType.NONE) {
        reporter.error(stmt.keyword, "Cannot return from top-level code.");
      }

      if (this.currentFunction === FunctionType.INITIALIZER) {
        reporter.error(
          stmt.keyword,
          "Cannot return a value from an initializer."
        );
      }
      this.resolve(stmt.value);
    }
  }

  visitVarStmt(stmt: Var): void {
    this.declare(stmt.name);
    if (stmt.initializer) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  private declare(name: Token): void {
    if (this.scopes.isEmpty()) return;
    const scope = this.scopes.peek();
    if (scope.has(name.lexeme)) {
      reporter.error(
        name,
        "Variable with this name already declared in this scope."
      );
    }
    scope.set(name.lexeme, false);
  }

  private define(name: Token): void {
    if (this.scopes.isEmpty()) return;
    const scope = this.scopes.peek();
    scope.set(name.lexeme, true);
  }

  visitWhileStmt(stmt: While): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }
}
