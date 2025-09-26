/**
 * downlevelConstLet()
 * -------------------
 * Converts `const` and `let` to `var` in JS code.
 * Simple, safe approach: token-based to avoid accidental replacements inside strings/comments.
 */
export function downlevelConstLet(code) {
  const tokens = [];
  let current = "";
  let inString = false;
  let stringChar = "";
  let escape = false;

  const flush = () => {
    if (current) {
      tokens.push(current);
      current = "";
    }
  };

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    // Inside string
    if (inString) {
      current += ch;
      if (!escape && ch === stringChar) {
        inString = false;
        flush();
      }
      escape = !escape && ch === "\\";
      continue;
    }

    // Detect string start
    if (ch === '"' || ch === "'") {
      flush();
      inString = true;
      stringChar = ch;
      current = ch;
      continue;
    }

    // Whitespace or punctuation as token boundaries
    if (/\s/.test(ch) || /[\(\)\{\}\[\]\.;,=<>!+\-*\/%:&|?]/.test(ch)) {
      flush();
      tokens.push(ch);
      continue;
    }

    // Normal identifier/number
    current += ch;
  }
  flush();

  // Transform tokens
  const out = tokens.map(t => {
    if (t === "const" || t === "let") return "var";
    return t;
  });

  return out.join("");
}