import path, { dirname } from "path";
import { fileURLToPath } from "url";
import bundle from "../../bundler/index.js";

/**
 * Resolve __filename and __dirname for ESM.
 * Node.js does not provide these globals in ES modules.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Execute bundler with explicit test configuration.
 *
 * entry:
 *   Source entry file used to build the dependency graph.
 *
 * outputDir:
 *   Destination directory for all emitted bundles and assets.
 *
 * outputFilename:
 *   Explicit output name to avoid relying on the default.
 *
 * uglified:
 *   Enables minification to simulate production output.
 */
await bundle({
  entry: path.join(__dirname, "src", "cdn.js"),
  outputDir: path.join(__dirname, "cdn"),
  outputFilename: "djs.prod.js",
  uglified: true
});