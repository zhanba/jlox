# jlox

[lox](https://craftinginterpreters.com/appendix-i.html) language implementation in typescript

## Example

```lox
// comments
// print
print "hi" or 2; // "hi".
print nil or "yes"; // "yes".

// define variable
var x = 0;

// control flow
if (x < 1) {
  print "x is less than 1";
}

var temp;

for (var y = 1; x < 10000; y = temp + y) {
  print x;
  temp = x;
  x = y;
}

// function
fun sayHi(first, last) {
  print "Hi, " + first + " " + last + "!";
}

sayHi("Dear", "Reader");


fun fib(n) {
  if (n <= 1) return n;
  return fib(n - 2) + fib(n - 1);
}

for (var i = 0; i < 20; i = i + 1) {
  print fib(i);
}

// closure
fun makeCounter() {
  var i = 0;
  fun count() {
    i = i + 1;
    print i;
  }

  return count;
}

var counter = makeCounter();
counter(); // "1".
counter(); // "2".

// class
class A {
  add() {
    return this.a + this.b;
  }
}

var instance = A();
instance.a = 1;
instance.b = 2;
print instance.add(); // "3".

// inheritance
class B < A {
  add() {
    return super.add() * 2;
  }
}

var instance = B();
instance.a = 1;
instance.b = 2;
print instance.add(); // "6".
```
