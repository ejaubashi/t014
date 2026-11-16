import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const args = process.argv.slice(2),
  port = Number(args[args.indexOf("--port") + 1] || 3021),
  base = args.includes("--base") ? args[args.indexOf("--base") + 1] : "/";
const root = resolve("dist"),
  types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xml": "application/xml",
    ".txt": "text/plain; charset=utf-8",
  };
http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let path = decodeURIComponent(url.pathname);
      if (!path.startsWith(base)) throw Error("not found");
      const absolute = resolve(root, path.slice(base.length));
      if (absolute !== root && !absolute.startsWith(root + sep))
        throw Error("not found");
      let file = absolute;
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!url.pathname.endsWith("/")) {
          res.writeHead(308, { Location: url.pathname + "/" + url.search });
          res.end();
          return;
        }
        file = resolve(file, "index.html");
      }
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(body);
    } catch {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(await readFile(resolve(root, "404.html")));
    }
  })
  .listen(port, "0.0.0.0", () =>
    console.log(`Static production server: http://127.0.0.1:${port}${base}`),
  );
