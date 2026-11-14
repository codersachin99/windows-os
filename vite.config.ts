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
      "@windows-os/sdk": app("./packages/sdk/src/index.ts"),
      "@windows-os/filesystem": app("./packages/filesystem/src/index.ts"),
      "@windows-os/apps/contacts": app("./packages/apps/contacts/src/index.ts"),
      "@windows-os/apps/notepad": app("./packages/apps/notepad/src/index.ts"),
      "@windows-os/apps/calculator": app("./packages/apps/calculator/src/index.ts"),
      "@windows-os/apps/run": app("./packages/apps/run/src/index.ts"),
      "@windows-os/apps/sticky": app("./packages/apps/sticky/src/index.ts"),
      "@windows-os/apps/magnifier": app("./packages/apps/magnifier/src/index.ts"),
      "@windows-os/apps/about": app("./packages/apps/about/src/index.ts"),
      "@windows-os/apps/photo": app("./packages/apps/photo/src/index.ts"),
      "@windows-os/apps/taskmgr": app("./packages/apps/taskmgr/src/index.ts"),
      "@windows-os/apps/find": app("./packages/apps/find/src/index.ts"),
      "@windows-os/apps/search-dialog": app("./packages/apps/search-dialog/src/index.ts"),
      "@windows-os/apps/search-companion": app("./packages/apps/search-companion/src/index.ts"),
      "@windows-os/apps/explorer": app("./packages/apps/explorer/src/index.ts"),
      "@windows-os/apps/shared": app("./packages/apps/shared/src/index.ts")
    }
  },
  server: {
    host: "127.0.0.1", port: 1420, strictPort: true,
    fs: { allow: [app(".")] },
    proxy: { "/api": { target: "http://127.0.0.1:8099", changeOrigin: false } }
  },
  build: { outDir: app("./dist/web"), emptyOutDir: true },
  // Source migration packages contain both logic .test.ts and UI .test.tsx
  // regression cases. Do not silently exclude TSX component tests from CI.
  test: { include: ["../../packages/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"] }
});
