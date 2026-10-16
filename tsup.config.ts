import { defineConfig } from "tsup";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// 규칙 SSOT는 skills/ 의 SKILL.md 들이다. opencode용 dist/AGENTS.md는 이를 결합해 생성한다.
// 순서가 곧 주입 순서다. 스킬을 추가하면 이 목록에도 추가한다.
const RULE_SKILL_FILES = [
  "skills/ohai-coding-style/SKILL.md",
  "skills/ohai-workflow-style/SKILL.md",
];

// src/index.ts 의 RULES_HEADER 를 포함해야 중복 주입 판별이 동작한다.
const RULES_TITLE = "# Coding & Workflow Style";

// SKILL.md 맨 앞의 frontmatter(--- ... ---) 블록을 떼어낸다.
function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  dts: true,
  clean: true,
  sourcemap: true,
  async onSuccess() {
    // clean: true가 dist를 지운 뒤 실행되므로 산출물이 보존된다.
    const skillBodies = RULE_SKILL_FILES.map((path) =>
      stripFrontmatter(readFileSync(path, "utf8")),
    );
    mkdirSync("dist", { recursive: true });
    writeFileSync(
      "dist/AGENTS.md",
      [RULES_TITLE, ...skillBodies].join("\n\n---\n\n") + "\n",
    );
  },
});
