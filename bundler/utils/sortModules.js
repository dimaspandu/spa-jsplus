/**
 * sortModules(modules)
 * --------------------
 * Sort modules in dependency order (DFS traversal).
 * Ensures dependencies are defined before being required.
 */
export function sortModules(modules) {
  const moduleMap = new Map(modules.map(m => [m.filename, m]));
  const sorted = [];
  const visited = new Set();

  function visit(module) {
    if (visited.has(module.filename)) {
      return;
    }
    visited.add(module.filename);

    for (const dep of module.dependencyKeys) {
      if (!dep.startsWith("&/")) {
        continue; // only local modules
      }
      const depModule = moduleMap.get(dep);
      if (depModule && !depModule.separated) {
        visit(depModule);
      }
    }
    sorted.push(module);
  }

  for (const module of modules) {
    if (!module.separated) {
      visit(module);
    }
  }

  return sorted;
}