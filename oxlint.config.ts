import { defineConfig } from "oxlint";

export default defineConfig({
  // 仓库根目录保留了历史构建产物（_astro/、pagefind/、posts/ 等），
  // 它们不是源码，压缩后的生成代码不应参与 lint。
  ignorePatterns: [
    "dist/**",
    "_astro/**",
    "pagefind/**",
    "test-results/**",
    "playwright-report/**",
    ".scratch/**",
  ],
  categories: {
    correctness: "error",
    suspicious: "error",
    perf: "warn",
  },
  rules: {
    "no-underscore-dangle": [
      "error",
      {
        allow: ["_id", "_title", "_passwordPlaceholder", "_submitText", "_errorText"],
      },
    ],
  },
});
