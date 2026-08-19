import { defineConfig } from "tsup";
import { cpSync, mkdirSync } from "node:fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  dts: true,
  clean: true,
  sourcemap: true,
  async onSuccess() {
    // 저장소 SSOT(opencode/AGENTS.md)를 dist/로 복사해 npm 패키지에 번들한다.
    // clean: true가 dist를 지운 뒤 실행되므로 산출물이 보존된다.
    mkdirSync("dist", { recursive: true });
    cpSync("../opencode/AGENTS.md", "dist/AGENTS.md");
  },
});
