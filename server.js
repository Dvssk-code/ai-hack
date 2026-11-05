// Мини-сервер для локального прогона AI-Hack: node server.js → http://localhost:8123
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const PORT = 8123;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png"
};
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, path.normalize(p).replace(/^([.][.][\/\\])+/, ""));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end("no"); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found: " + p); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log("AI-Hack: http://localhost:" + PORT));
