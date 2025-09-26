import bundle from "../../bundler/index.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

bundle({
  entryFile: path.join(__dirname, "src", "cdn.js"),
  outputFile: path.join(__dirname, "cdn", "amd.prod.js")
});