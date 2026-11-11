import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("./apps/web", import.meta.url));
const app = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root,
  plugins: [react()],
  publicDir: app("./apps/web/public"),
  resolve: {
    alias: {
      "@windows-os/contracts": app("./packages/contracts/src/index.ts"),
      "@windows-os/assets": app("./packages/assets/src/index.ts"),
      "@windows-os/engine": app("./packages/engine/src/index.ts"),
      "@windows-os/ui": app("./packages/ui/src/index.ts"),
      "@windows-os/sdk": app("./packages/sdk/src/index.ts")
    }
  },
  server: { host: "127.0.0.1", port: 1420, strictPort: true, fs: { allow: [app(".")] } },
  build: { outDir: app("./dist/web"), emptyOutDir: true },
  test: { include: ["../../packages/**/*.test.ts", "src/**/*.test.ts"] }
});
