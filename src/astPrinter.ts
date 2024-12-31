import type {
  Assign,
  Binary,
  Call,
  Expr,
  Get,
  Grouping,
  Literal,
  Logical,
  Set,
  Super,
  This,
  Unary,
  Variable,
  Visitor,
} from "./expression";

export class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  visitCallExpr(expr: Call): string {
    return this.parenthesize("call", expr.callee, ...expr.args);
  }

  visitGetExpr(expr: Get): string {
    return this.parenthesize(`get ${expr.name} from `, expr.object);
  }

  visitLogicalExpr(expr: Logical): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  visitVariableExpr(expr: Variable): string {
    return expr.name.lexeme;
  }

  visitAssignExpr(expr: Assign): string {
    return this.parenthesize(`assign ${expr.name} with`, expr.value);
  }

  visitSetExpr(expr: Set): string {
    return this.parenthesize(`set ${expr.name} to`, expr.value);
  }

  visitSuperExpr(expr: Super): string {
    if (expr.method === null) return "super";
    return `super.${expr.method.lexeme}`;
  }

  visitThisExpr(expr: This): string {
    return `this:${expr.keyword.lexeme}`;
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    return `(${name} ${exprs.map((expr) => expr.accept(this)).join(" ")})`;
  }
}
