/**
 * downlevelArrowFunction()
 * ------------------------
 * Converts JavaScript arrow functions into equivalent function expressions.
 * Uses a character scanner to properly handle concise bodies, nested arrows,
 * IIFEs, rest parameters, object literals, and higher-order arrows.
 */
export function downlevelArrowFunction(code) {
  function scanBalanced(src, startIdx, open, close) {
    let depth = 0;
    for (let i = startIdx; i < src.length; i++) {
      if (src[i] === open) depth++;
      else if (src[i] === close) {
        depth--;
        if (depth === 0) return i + 1;
      }
    }
    return src.length;
  }

  function scanBackwardBalanced(src, closeIdx, open, close) {
    let depth = 0;
    for (let i = closeIdx; i >= 0; i--) {
      if (src[i] === close) depth++;
      else if (src[i] === open) {
        depth--;
        if (depth === 0) return i;
      }
    }
    return 0;
  }

  function normalizeParams(params) {
    params = params.trim();
    if (!params.startsWith("(")) return `(${params})`;
    return params;
  }

  function transformOnce(src) {
    for (let i = 0; i < src.length; i++) {
      if (src[i] === "=" && src[i + 1] === ">") {
        // ----- Capture parameters -----
        let paramEnd = i;
        let paramStart = paramEnd - 1;
        while (paramStart >= 0 && /\s/.test(src[paramStart])) paramStart--;

        let params;
        if (src[paramStart] === ")") {
          let openIdx = scanBackwardBalanced(src, paramStart, "(", ")");
          params = src.slice(openIdx, paramEnd).trim();
          paramStart = openIdx;
        } else {
          let identStart = paramStart;
          while (identStart >= 0 && /[a-zA-Z0-9_$]/.test(src[identStart])) identStart--;
          params = src.slice(identStart + 1, paramEnd).trim();
          paramStart = identStart + 1;
        }

        // ----- Capture body -----
        let bodyStart = i + 2;
        while (/\s/.test(src[bodyStart])) bodyStart++;

        let replacement;
        if (src[bodyStart] === "{") {
          // Block body
          let bodyEnd = scanBalanced(src, bodyStart, "{", "}");
          let bodyContent = src.slice(bodyStart + 1, bodyEnd - 1);
          replacement = `function${normalizeParams(params)} {${bodyContent}}`;
          return {
            changed: true,
            result: src.slice(0, paramStart) + replacement + src.slice(bodyEnd),
          };
        } else {
          // Concise body
          let exprEnd = bodyStart;
          let depth = 0;
          let inString = null;
          for (; exprEnd < src.length; exprEnd++) {
            let ch = src[exprEnd];
            if (inString) {
              if (ch === inString && src[exprEnd - 1] !== "\\") inString = null;
            } else if (ch === '"' || ch === "'" || ch === "`") {
              inString = ch;
            } else if (ch === "(" || ch === "{" || ch === "[") {
              depth++;
            } else if (ch === ")" || ch === "}" || ch === "]") {
              if (depth === 0) break;
              depth--;
            } else if ((ch === ";" || ch === ",") && depth === 0) {
              // <-- ADD support for comma at top level
              break;
            }
          }

          let expr = src.slice(bodyStart, exprEnd).trim();

          // Remove wrapping parentheses for object literal case
          if (expr.startsWith("(") && expr.endsWith(")")) {
            let inner = expr.slice(1, -1).trim();
            if (inner.startsWith("{") && inner.endsWith("}")) {
              expr = inner;
            }
          }

          replacement = `function${normalizeParams(params)} { return ${expr}; }`;
          return {
            changed: true,
            result: src.slice(0, paramStart) + replacement + src.slice(exprEnd),
          };
        }
      }
    }
    return { changed: false, result: src };
  }

  let changed = true;
  while (changed) {
    let res = transformOnce(code);
    changed = res.changed;
    code = res.result;
  }
  return code;
}
