import { Expr, Variable } from "./expression";
import { Token } from "./scanner";

export interface Visitor<R> {
  visitBlockStmt(stmt: Block): R;
  visitClassStmt(stmt: Class): R;
  visitExpressionStmt(stmt: Expression): R;
  visitFunctionStmt(stmt: Function): R;
  visitIfStmt(stmt: If): R;
  visitPrintStmt(stmt: Print): R;
  visitReturnStmt(stmt: Return): R;
  visitVarStmt(stmt: Var): R;
  visitWhileStmt(stmt: While): R;
}

export interface Stmt {
  accept<R>(visitor: Visitor<R>): R;
}

export class Block implements Stmt {
  constructor(public statements: Stmt[]) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBlockStmt(this);
  }
}

export class Class implements Stmt {
  constructor(
    public name: Token,
    public superclass: Variable | null,
    public methods: Function[]
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitClassStmt(this);
  }
}

export class Expression implements Stmt {
  constructor(public expression: Expr) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }
}

export class Function implements Stmt {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Stmt[]
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFunctionStmt(this);
  }
}

export class If implements Stmt {
  constructor(
    public condition: Expr,
    public thenBranch: Stmt,
    public elseBranch: Stmt | null
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitIfStmt(this);
  }
}

export class Print implements Stmt {
  constructor(public expression: Expr) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitPrintStmt(this);
  }
}

export class Return implements Stmt {
  constructor(
    public keyword: Token,
    public value: Expr | null
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitReturnStmt(this);
  }
}

export class Var implements Stmt {
  constructor(
    public name: Token,
    public initializer: Expr | null
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVarStmt(this);
  }
}

export class While implements Stmt {
  constructor(
    public condition: Expr,
    public body: Stmt
  ) {}

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitWhileStmt(this);
  }
}
