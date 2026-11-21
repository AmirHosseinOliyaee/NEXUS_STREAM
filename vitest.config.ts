import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    pool: "threads",
    maxWorkers: 1,
    isolate: false,
    fileParallelism: false,
    include: ["src/__tests__/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
});
