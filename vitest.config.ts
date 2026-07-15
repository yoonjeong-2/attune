import path from "node:path"

import { defineConfig } from "vitest/config"

// 순수 로직 유닛 테스트용. 프론트 `@` alias만 재사용(플러그인은 불필요 — .test.ts는 JSX/CSS 없음).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "server/**/*.test.ts"],
  },
})
