import {
  downlevelArrowFunction,
  normalize
} from "../index.js";

/**
 * runTest()
 * ----------
 * Utility function to run a single test case.
 * - name: descriptive name of the test case
 * - codeInput: the original code snippet that contains arrow functions
 * - expectedOutput: the expected transformed output
 *
 * It runs downlevelArrowFunction, normalizes the result and expected output,
 * and prints whether the test passed or failed. If failed, it also prints
 * the actual and expected values for debugging.
 */
function runTest(name, codeInput, expectedOutput) {
  const result = downlevelArrowFunction(codeInput);
  const pass = normalize(result) === normalize(expectedOutput);
  console.log(`\n--- Test: ${name} ---`);
  console.log(pass ? "PASS" : "FAIL");
  if (!pass) {
    console.log("\n--- Output ---\n", JSON.stringify(result));
    console.log("\n--- Expected ---\n", JSON.stringify(expectedOutput));
  }
}

// -------------------------
// Test cases
// -------------------------

// 1. Test conversion of an arrow function with a concise body
runTest(
  "1. Arrow function with concise body",
  `
  const inc = (n) => n + 1;
  `,
  `
  const inc = function(n) { return n + 1; };
  `
);

// 2. Test conversion of an arrow function with a block body
runTest(
  "2. Arrow function with block body",
  `
  const sum = (a, b) => { return a + b; };
  `,
  `
  const sum = function(a, b) { return a + b; };
  `
);

// 3. Test conversion of a single-argument arrow function with a concise body
runTest(
  "3. Single-argument arrow with concise body",
  `
  const sq = x => x * x;
  `,
  `
  const sq = function(x) { return x * x; };
  `
);

// 4. Test conversion of a single-argument arrow function with a block body
runTest(
  "4. Single-argument arrow with block body",
  `
  const log = msg => { console.log(msg); };
  `,
  `
  const log = function(msg) { console.log(msg); };
  `
);

// 5. Test conversion of an inline arrow function inside another call
runTest(
  "5. Inline arrow function inside a call",
  `
  button.addEventListener("click", () => {});
  `,
  `
  button.addEventListener("click", function() {});
  `
);

// 6. Test conversion of an inline async arrow function inside another call
runTest(
  "6. Inline async arrow function inside a call",
  `
  button.addEventListener("click", async () => {});
  `,
  `
  button.addEventListener("click", async function() {});
  `
);

// 7. Test conversion of nested arrow functions
runTest(
  "7. Nested arrow functions",
  `
  const addThenDouble = (a, b) => (c => (a + b) * c);
  `,
  `
  const addThenDouble = function(a, b) { return (function(c) { return (a + b) * c; }); };
  `
);

// 8. Test conversion of an immediately invoked arrow function (IIFE)
runTest(
  "8. Immediately invoked arrow function (IIFE)",
  `
  (() => console.log("init"))();
  `,
  `
  (function() { return console.log("init"); })();
  `
);

// 9. Test conversion of an arrow function with no arguments
runTest(
  "9. Arrow function with no arguments",
  `
  const getTime = () => Date.now();
  `,
  `
  const getTime = function() { return Date.now(); };
  `
);

// 10. Test conversion of an async arrow function with a concise body
runTest(
  "10. Async arrow function with concise body",
  `
  const load = async () => fetch("/data");
  `,
  `
  const load = async function() { return fetch("/data"); };
  `
);

// 11. Test conversion of an arrow function with default parameters
runTest(
  "11. Arrow function with default parameters",
  `
  const greet = (name = "World") => "Hello " + name;
  `,
  `
  const greet = function(name = "World") { return "Hello " + name; };
  `
);

// 12. Test conversion of an arrow function with destructured parameters
runTest(
  "12. Arrow function with destructured parameters",
  `
  const extract = ({id, name}) => id + ":" + name;
  `,
  `
  const extract = function({id, name}) { return id + ":" + name; };
  `
);

// 13. Test conversion of an arrow function using spread/rest parameters
runTest(
  "13. Arrow function with rest parameters",
  `
  const sumAll = (...nums) => nums.reduce((a, b) => a + b, 0);
  `,
  `
  const sumAll = function(...nums) { return nums.reduce(function(a, b) { return a + b; }, 0); };
  `
);

// 14. Test conversion of an arrow function returning an object literal
runTest(
  "14. Arrow function returning object literal",
  `
  const makePoint = (x, y) => ({x, y});
  `,
  `
  const makePoint = function(x, y) { return {x, y}; };
  `
);

// 15. Test conversion of a higher-order function using arrows
runTest(
  "15. Higher-order arrow function",
  `
  const twice = f => x => f(f(x));
  `,
  `
  const twice = function(f) { return function(x) { return f(f(x)); }; };
  `
);
