import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // In production, the server is at dist/index.cjs
  // so __dirname = dist, and public files are at dist/public
  const distPath = path.resolve(process.cwd(), "dist", "public");
  const fallback = path.resolve(__dirname, "public");
  const finalPath = fs.existsSync(distPath) ? distPath : fallback;

  if (!fs.existsSync(finalPath)) {
    throw new Error(
      `Could not find the build directory: ${finalPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(finalPath));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(finalPath, "index.html"));
  });
}
