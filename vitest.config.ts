import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      AUTH_SECRET: "test-secret-test-secret-test-secret-32b",
      DATABASE_FILE: "./data/test.db",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      GROQ_API_KEY: "test-groq-key",
    },
    coverage: {
      provider: "v8",
      include: [
        "src/lib/auth/**/*.ts",
        "src/lib/db/**/*.ts",
        "src/lib/rate-limit.ts",
        "src/lib/emergency.ts",
        "src/lib/ai.ts",
        "src/lib/local/query-guard.ts",
        "src/lib/mail/**/*.ts",
        "src/lib/env.ts",
        "src/lib/logging.ts",
      ],
      reporter: ["text"],
    },
  },
});
