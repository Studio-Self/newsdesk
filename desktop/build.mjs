import { build } from "esbuild";

await build({
  entryPoints: ["desktop/main.ts", "desktop/preload.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outdir: "desktop/dist",
  outExtension: { ".js": ".mjs" },
  external: [
    "electron",
    // Keep npm packages external — electron-builder bundles node_modules
    "embedded-postgres",
    "postgres",
    "express",
    "drizzle-orm",
    "pino",
    "pino-http",
    "pino-pretty",
    "ws",
    "zod",
    "@anthropic-ai/sdk",
    "detect-port",
    "@radix-ui/*",
  ],
  banner: {
    js: [
      'import { createRequire as __createRequire } from "module";',
      "const require = __createRequire(import.meta.url);",
    ].join(" "),
  },
  define: {
    "process.env.FLAKE_ID": '"desktop"',
  },
});

console.log("Desktop build complete → desktop/dist/");
