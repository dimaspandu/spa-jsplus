/**
 * downlevelAsyncFunction()
 * ------------------------
 * Converts async function declarations and async arrow functions into
 * Promise-based functions and rewrites simple `await` usage into `.then()` chains.
 *
 * Limitations:
 * - This is a regex/line-based transformer for simple linear `await` patterns.
 * - It does NOT attempt to be a full JS-to-JS compiler; complex control flow,
 *   try/catch, loops, or deeply nested constructs may not transform correctly.
 *
 * Behavior:
 * - Removes `async` from the function and arrow definitions handled by the regexes below.
 * - Converts `await expr` usages of the forms:
 *     const v = await expr;
 *     return await expr;
 *     return expr;
 *   into Promise `.then()` chaining, preserving the evaluation order.
 */
export function downlevelAsyncFunction(code) {
  // Async function declarations
  code = code.replace(
    /async\s+function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g,
    (_, name, args, body) => {
      // `transformAwait` returns a string like:
      //   .then(function() { ... }).then(function(res) { ... })
      // We attach it to Promise.resolve()
      return `function ${name}(${args}) { return Promise.resolve()${transformAwait(body)}; }`;
    }
  );

  // Async arrow functions with block body assigned to const
  code = code.replace(
    /const\s+([a-zA-Z0-9_$]+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{([\s\S]*?)\};/g,
    (_, name, args, body) => {
      return `const ${name} = function(${args}) { return Promise.resolve()${transformAwait(body)}; };`;
    }
  );

  // Async arrow functions concise body
  code = code.replace(
    /const\s+([a-zA-Z0-9_$]+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*([^;\n]+);/g,
    (_, name, args, expr) => {
      // Simple concise expression: just wrap result with Promise.resolve(expr)
      // Trim trailing spaces/semicolons from expr
      expr = expr.trim().replace(/;$/, "");
      return `const ${name} = function(${args}) { return Promise.resolve(${expr}); };`;
    }
  );

  return code;
}

/**
 * transformAwait()
 * ----------------
 * Convert a function body (the inner text between { ... }) that may
 * contain linear `await` usage into a `.then()` chain string.
 *
 * Returns a string beginning with `.then(...` so it can be appended to
 * `Promise.resolve()` (e.g. `Promise.resolve()${transformAwait(body)}`).
 *
 * Supported patterns (line-based):
 *   const v = await expr;
 *   return await expr;
 *   return expr;
 *   plain statements (kept as-is)
 *
 * Each captured expression is sanitized (trimmed and stripped of trailing semicolon)
 * to prevent duplicate semicolons after transformation.
 */
function transformAwait(body) {
  // Normalize lines and remove empty lines
  const lines = body
    .split("\n")
    .map(l => l.replace(/\r/g, "").trim())
    .filter(Boolean);

  // Build chain: start with the first then block content (without leading dot)
  let current = "then(function() {\n";
  let result = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern: const <v> = await <expr>;
    // Use non-greedy capture for the expression and strip trailing semicolon
    let m1 = line.match(/^const\s+([a-zA-Z0-9_$]+)\s*=\s*await\s+(.+?)\s*;?$/);
    if (m1) {
      const v = m1[1];
      let expr = m1[2].trim().replace(/;$/, "");
      // return the awaited expression from this then, then open next then that receives the result
      current += `  return ${expr};\n`;
      current += `}).then(function(${v}) {\n`;
      continue;
    }

    // Pattern: return await <expr>;
    let m2 = line.match(/^return\s+await\s+(.+?)\s*;?$/);
    if (m2) {
      let expr = m2[1].trim().replace(/;$/, "");
      current += `  return ${expr};\n`;
      // finalize chain: prefix with '.' and close the function block/then parenthesis
      result += `.${current}})`;
      return result;
    }

    // Pattern: return <expr>;
    let m3 = line.match(/^return\s+(.+?)\s*;?$/);
    if (m3) {
      let expr = m3[1].trim().replace(/;$/, "");
      current += `  return ${expr};\n`;
      result += `.${current}})`;
      return result;
    }

    // Fallback: plain statement (keep as-is, ensure line ends with semicolon if it had one)
    current += `  ${line}\n`;
  }

  // If we reach here, there was no terminal return; close the chain anyway.
  result += `.${current}})`;
  return result;
}
