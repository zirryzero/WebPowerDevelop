import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 8000);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
  [".woff", "font/woff"],
  [".ttf", "font/ttf"],
]);

const safeJoin = (base, target) => {
  const targetPath = path.normalize(path.join(base, target));
  if (!targetPath.startsWith(path.normalize(base + path.sep))) return null;
  return targetPath;
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    const rel = pathname === "/" ? "/index.html" : pathname;
    const fullPath = safeJoin(root, rel);
    if (!fullPath) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const type = contentTypes.get(ext) || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(fullPath).pipe(res);
  } catch {
    res.writeHead(500);
    res.end("Server error");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`PowerDevelop dev server running: http://127.0.0.1:${port}`);
});

