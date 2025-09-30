import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import bundler from "../../index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolver = filePath => path.resolve(__dirname, filePath);

// Read configuration JSON
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Call bundler with resolved paths
bundler({
  entryFile: resolver(config.entryFile),
  outputDirectory: resolver(config.outputDirectory),
});
