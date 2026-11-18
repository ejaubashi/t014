import http from "node:http";
import { createReadStream } from "node:fs";
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
    ".mp4": "video/mp4",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xml": "application/xml",
    ".txt": "text/plain; charset=utf-8",
  };
function serveVideo(req, res, file, size) {
  const headers = {
    "Content-Type": types[".mp4"],
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
  let start = 0;
  let end = size - 1;
  let status = 200;
  if (range && (range[1] || range[2])) {
    if (range[1]) {
      start = Number(range[1]);
      if (range[2]) end = Math.min(end, Number(range[2]));
    } else {
      start = Math.max(0, size - Number(range[2]));
    }
    if (start > end) {
      res.writeHead(416, { ...headers, "Content-Range": `bytes */${size}` });
      res.end();
      return;
    }
    status = 206;
    headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  }
  headers["Content-Length"] = end - start + 1;
  res.writeHead(status, headers);
  if (req.method === "HEAD" || size === 0) {
    res.end();
    return;
  }
  const stream = createReadStream(file, { start, end });
  stream.on("error", (error) => res.destroy(error));
  res.on("close", () => stream.destroy());
  stream.pipe(res);
}
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
      if (extname(file) === ".mp4") {
        serveVideo(req, res, file, info.size);
        return;
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
