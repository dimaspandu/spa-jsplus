import {
  downlevelAsyncFunction,
  normalize
} from "../index.js";

function runTest(name, codeInput, expectedOutput) {
  const result = downlevelAsyncFunction(codeInput);
  const pass = normalize(result) === normalize(expectedOutput);
  console.log(`\n--- Test: ${name} ---`);
  console.log(pass ? "PASS" : "FAIL");
  if (!pass) {
    console.log("\n--- Output ---\n", JSON.stringify(result));
    console.log("\n--- Expected ---\n", JSON.stringify(expectedOutput));
  }
}

// 1. Async function declaration (no await in body)
runTest(
  "1. Async function declaration (no await in body)",
  `
  async function foo(a, b) {
    return a + b;
  }
  `,
  `
  function foo(a, b) { return Promise.resolve().then(function() {
    return a + b;
  }); }
  `
);

// 2. Async arrow function (concise)
runTest(
  "2. Async arrow function (concise)",
  `
  const f = async (x) => x * 2;
  `,
  `
  const f = function(x) { return Promise.resolve(x * 2); };
  `
);

// 3. Async function with await
runTest(
  "3. Async function with await",
  `
  async function fetchData() {
    const res = await fetch("url");
    return res.json();
  }
  `,
  `
  function fetchData() { return Promise.resolve().then(function() {
    return fetch("url");
  }).then(function(res) {
    return res.json();
  }); }
  `
);

// 4. Async arrow function with await
runTest(
  "4. Async arrow function with await",
  `
  const getData = async () => {
    const r = await fetch("/api");
    return r.text();
  };
  `,
  `
  const getData = function() { return Promise.resolve().then(function() {
    return fetch("/api");
  }).then(function(r) {
    return r.text();
  }); };
  `
);
