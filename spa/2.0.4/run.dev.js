import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Resolve __filename and __dirname in ESM context.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Track latest file change time in the dev root.
 */
function getLatestMtimeMs(dir) {
  let latest = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      latest = Math.max(latest, getLatestMtimeMs(fullPath));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!['.js', '.json', '.css', '.html'].includes(ext)) continue;

    const stat = fs.statSync(fullPath);
    if (stat.mtimeMs > latest) latest = stat.mtimeMs;
  }

  return latest;
}

/**
 * Create a basic static HTTP server.
 *
 * rootDir:
 *   Directory to be served as the web root.
 *
 * port:
 *   Local port to listen on.
 */
function createStaticServer(rootDir, port) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);

    if (urlPath === '/__dev/version') {
      const version = String(getLatestMtimeMs(rootDir));
      res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(version);
      return;
    }

    const filePath = path.join(
      rootDir,
      urlPath === '/' ? '/index.test.html' : urlPath
    );

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath);
      const typeMap = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.css': 'text/css'
      };

      let body = data;
      if (ext === '.html') {
        const html = data.toString();
        const inject = `\n<script>\n(function () {\n  let lastVersion = null;\n  async function checkReload() {\n    try {\n      const res = await fetch(\"/__dev/version\", { cache: \"no-store\" });\n      const version = await res.text();\n      if (lastVersion && version !== lastVersion) {\n        location.reload();\n        return;\n      }\n      lastVersion = version;\n    } catch (_) {}\n  }\n  window.addEventListener(\"focus\", checkReload);\n  checkReload();\n})();\n</script>\n`;
        if (html.includes('</body>')) {
          body = html.replace('</body>', `${inject}</body>`);
        } else {
          body = html + inject;
        }
      }

      res.writeHead(200, {
        'Content-Type': typeMap[ext] || 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });

      res.end(body);
    });
  });

  server.listen(port, () => {
    console.log(`✔ Server running at http://localhost:${port}`);
    console.log(`  Serving: ${rootDir}`);
  });
}

/**
 * Start the development server for bundled output.
 */
createStaticServer(path.join(__dirname, 'src'), 2020);
