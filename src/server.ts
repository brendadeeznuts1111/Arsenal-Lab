// src/server.ts - HTTP Server for Arsenal Lab
import { serve } from "bun";

const PORT = 3655;

console.log(`🚀 Starting Arsenal Lab server on port ${PORT}...`);
console.log(`🌐 Open http://localhost:${PORT} in your browser`);

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // Serve index.html for root path
    if (url.pathname === "/") {
      try {
        const html = await Bun.file("index.html").text();
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      } catch (error) {
        return new Response("Not Found", { status: 404 });
      }
    }

    // Serve TypeScript/JavaScript files
    if (url.pathname.startsWith("/src/") || url.pathname.startsWith("/components/")) {
      try {
        const filePath = "." + url.pathname;

        // Use Bun's build API to transpile TypeScript/TSX to JavaScript
        if (url.pathname.endsWith(".ts") || url.pathname.endsWith(".tsx")) {
          const result = await Bun.build({
            entrypoints: [filePath],
            target: "browser",
            minify: false,
            sourcemap: "inline",
          });

          if (result.outputs.length > 0) {
            const output = result.outputs[0];
            return new Response(await output.text(), {
              headers: { "Content-Type": "application/javascript" },
            });
          }
        }

        // For other files (CSS, JS), serve directly
        const file = await Bun.file(filePath);
        const content = await file.text();

        // Determine content type based on file extension
        let contentType = "application/javascript";
        if (url.pathname.endsWith(".css")) {
          contentType = "text/css";
        }

        return new Response(content, {
          headers: { "Content-Type": contentType },
        });
      } catch (error) {
        console.error(`Error serving ${url.pathname}:`, error);
        return new Response("File Not Found", { status: 404 });
      }
    }

    // Serve static assets from public directory
    if (url.pathname.startsWith("/")) {
      try {
        const file = await Bun.file("public" + url.pathname);
        return new Response(file);
      } catch (error) {
        // Try root directory for other assets
        try {
          const file = await Bun.file("." + url.pathname);
          return new Response(file);
        } catch (error) {
          return new Response("Asset Not Found", { status: 404 });
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🎯 Arsenal Lab is ready!`);
console.log(`📊 Run: bun run arsenal:ci for performance benchmarks`);
console.log(`📦 Run: bun publish when ready to release`);
