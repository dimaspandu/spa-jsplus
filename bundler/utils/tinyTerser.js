/**
 * tinyTerser - A very simple keyword obfuscator/minifier.
 * It replaces specific JavaScript keywords (`modules`, `module`, `require`, `exports`)
 * with shorter single-letter tokens. This is just a toy example and not a full minifier.
 */
export function tinyTerser(code) {
  // Map of target keywords to short alphabet tokens
  // Each keyword will always be replaced with the same fixed token.
  const replacements = {
    modules: "a",
    module: "b",
    require: "c",
    exports: "d"
  };

  // Replace all occurrences of the target keywords with their mapped tokens
  // The \b ensures that only full words are matched, not partial substrings.
  return code.replace(/\b(modules|module|require|exports)\b/g, (match) => {
    return replacements[match];
  });
}