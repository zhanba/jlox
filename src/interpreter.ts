import { Environment } from "./environment";
import {
  Binary,
  Expr,
  Grouping,
  Literal,
  Unary,
  Visitor as ExprVisitor,
  Assign,
  Call,
  Get,
  Logical,
  Set,
  Super,
  This,
  Variable,
} from "./expression";
import { TokenType } from "./scanner";
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

export class Interpreter implements ExprVisitor<any>, StmtVisitor<void> {
  private environment = new Environment();

  interpret(statements: Stmt[]) {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      console.error(error);
    }
  }

  execute(stmt: Stmt) {
    stmt.accept(this);
  }

  // statement

  visitExpressionStmt(stmt: Expression) {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Print) {
    const value = this.evaluate(stmt.expression);
    console.log(value);
  }

  visitVarStmt(stmt: Var) {
    let value = null;
    if (stmt.initializer !== null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  executeBlock(statements: Stmt[], environment: Environment) {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  visitClassStmt(stmt: Class): void {
    throw new Error("Method not implemented.");
  }
  visitFunctionStmt(stmt: Function): void {
    throw new Error("Method not implemented.");
  }
  visitIfStmt(stmt: If): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch !== null) {
      this.execute(stmt.elseBranch);
    }
  }
  visitReturnStmt(stmt: Return): void {
    throw new Error("Method not implemented.");
  }
  visitWhileStmt(stmt: While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  // expression

  visitLiteralExpr(expr: Literal): any {
    return expr.value;
  }

  visitGroupingExpr(expr: Grouping): any {
    return this.evaluate(expr.expression);
  }

  evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  visitUnaryExpr(expr: Unary): any {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right);
        return -right;
      case TokenType.BANG:
        return !this.isTruthy(right);
    }

    return null;
  }

  private checkNumberOperand(operator: any, operand: any) {
    if (typeof operand === "number") {
      return;
    }
    throw new Error(`Operand must be a number: ${operator}`);
  }

  private isTruthy(value: any) {
    if (value === null) {
      return false;
    }
    if (typeof value === "boolean") {
      return value;
    }
    return true;
  }

  visitBinaryExpr(expr: Binary): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return left - right;
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);
        return left / right;
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return left * right;
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        break;
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return left <= right;
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
    }

    return null;
  }

  private checkNumberOperands(operator: any, left: any, right: any) {
    if (typeof left === "number" && typeof right === "number") {
      return;
    }
    throw new Error(`Operands must be numbers: ${operator}`);
  }

  private isEqual(a: any, b: any) {
    return a === b;
  }

  visitVariableExpr(expr: Variable): any {
    return this.environment.get(expr.name);
  }

  visitAssignExpr(expr: Assign): any {
    const value = this.evaluate(expr.value);
    this.environment.assign(expr.name, value);
    return value;
  }

  visitCallExpr(expr: Call): any {
    throw new Error("Method not implemented.");
  }

  visitGetExpr(expr: Get): any {
    throw new Error("Method not implemented.");
  }

  visitLogicalExpr(expr: Logical): any {
    const left = this.evaluate(expr.left);
    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) {
        return left;
      }
    } else {
      if (!this.isTruthy(left)) {
        return left;
      }
    }
    return this.evaluate(expr.right);
  }

  visitSetExpr(expr: Set): any {
    throw new Error("Method not implemented.");
  }

  visitSuperExpr(expr: Super): any {
    throw new Error("Method not implemented.");
  }

  visitThisExpr(expr: This): any {
    throw new Error("Method not implemented.");
  }
}
