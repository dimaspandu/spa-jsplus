import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Resolve current file and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 4500;

// MIME type mapping
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain"
};

// Path to SPA entry point
const testHtmlPath = path.join(__dirname, "test.html");

/**
 * Adjust the <script type="module" src="./spa.js"></script> tag
 * based on the request URL, so relative paths are correct
 * for nested routes like /search/something
 */
function adjustSpaScript(htmlContent, reqUrl) {
  // Count folder depth in the request URL
  const segments = reqUrl.split("/").filter(Boolean);
  let relativePrefix = "";
  if (segments.length > 0) {
    relativePrefix = "../".repeat(segments.length);
  }

  // Always re-insert type="module" to be safe
  return htmlContent.replace(
    /<script[^>]*src=["']\.\/spa\.js["'][^>]*><\/script>/i,
    `<script type="module" src="${relativePrefix}spa.js"></script>`
  );
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Map root to /test.html
  let filePath = req.url === "/" ? "/test.html" : req.url;

  // Serve SPA entry point
  if (filePath === "/test.html" || filePath === "/") {
    fs.readFile(testHtmlPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Error reading test.html");
      } else {
        // Adjust SPA script path dynamically
        const html = adjustSpaScript(data, filePath);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      }
    });
    return;
  }

  // Resolve absolute path for other files
  const absPath = path.join(__dirname, filePath);

  fs.readFile(absPath, (err, data) => {
    if (err) {
      // Fallback to test.html for SPA routes (e.g., /search/...)
      fs.readFile(testHtmlPath, "utf8", (fbErr, fbData) => {
        if (fbErr) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not found");
        } else {
          const html = adjustSpaScript(fbData, filePath);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html);
        }
      });
    } else {
      // Serve static file with correct MIME type
      const ext = path.extname(absPath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

// Start server
server.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
