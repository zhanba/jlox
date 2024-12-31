import { Token } from "./scanner";

export interface Visitor<R> {
  visitAssignExpr: (expr: Assign) => R;
  visitBinaryExpr: (expr: Binary) => R;
  visitCallExpr: (expr: Call) => R;
  visitGetExpr: (expr: Get) => R;
  visitGroupingExpr: (expr: Grouping) => R;
  visitLiteralExpr: (expr: Literal) => R;
  visitLogicalExpr: (expr: Logical) => R;
  visitSetExpr: (expr: Set) => R;
  visitSuperExpr: (expr: Super) => R;
  visitThisExpr: (expr: This) => R;
  visitUnaryExpr: (expr: Unary) => R;
  visitVariableExpr: (expr: Variable) => R;
}

export interface Expr {
  accept<R>(visitor: Visitor<R>): R;
}

export class Assign implements Expr {
  constructor(
    public name: Token,
    public value: Expr
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAssignExpr(this);
  }
}

export class Binary implements Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBinaryExpr(this);
  }
}

export class Call implements Expr {
  constructor(
    public callee: Expr,
    public paren: Token,
    public args: Expr[]
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCallExpr(this);
  }
}

export class Get implements Expr {
  constructor(
    public object: Expr,
    public name: Token
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGetExpr(this);
  }
}

export class Grouping implements Expr {
  constructor(public expression: Expr) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal implements Expr {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public value: any) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }
}

export class Logical implements Expr {
  constructor(
    public left: Expr,
    public operator: Token,
    public right: Expr
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }
}

export class Set implements Expr {
  constructor(
    public object: Expr,
    public name: Token,
    public value: Expr
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSetExpr(this);
  }
}

export class Super implements Expr {
  constructor(
    public keyword: Token,
    public method: Token
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSuperExpr(this);
  }
}

export class This implements Expr {
  constructor(public keyword: Token) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitThisExpr(this);
  }
}

export class Unary implements Expr {
  constructor(
    public operator: Token,
    public right: Expr
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable implements Expr {
  constructor(public name: Token) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariableExpr(this);
  }
}
