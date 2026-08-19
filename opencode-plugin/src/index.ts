import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin, PluginModule } from "@opencode-ai/plugin";
import { readState } from "./state.js";

// 빌드로 dist/ 에 함께 복사되는 SSOT 규칙 파일(opencode/AGENTS.md).
// 진입점이 dist/index.js 이므로 같은 디렉토리의 ./AGENTS.md 를 가리킨다.
const RULES_FILE = fileURLToPath(new URL("./AGENTS.md", import.meta.url));

// 규칙 파일이 이미 시스템 프롬프트에 들어갔는지 판별하는 헤더 마커.
const RULES_HEADER = "Coding & Workflow Style";

const server: Plugin = async () => {
  // 서버 init 시 1회 읽는다. 파일은 빌드 시점 상수라 매 요청마다 다시 읽을 필요가 없다.
  const rules = readFileSync(RULES_FILE, "utf8");
  // TUI에서 on/off한 상태(on/off 파일)를 init 시 1회 읽는다. off면 주입을 건너뛴다.
  const { enabled } = readState();

  return {
    "experimental.chat.system.transform": async (_input, output) => {
      // off 상태면 시스템 프롬프트에 규칙을 주입하지 않는다.
      if (!enabled) {
        return;
      }
      // 같은 규칙이 두 번 주입되지 않도록 헤더 존재 여부로 dedup.
      if (output.system.some((entry) => entry.includes(RULES_HEADER))) {
        return;
      }
      output.system.push(rules);
    },
  };
};

// id: 경로(file://) 기반으로 로드될 때 opencode가 요구하는 필수 필드.
// npm 스펙(@scope/pkg)으로 로드될 때는 선택이지만, 양쪽 모두 안전하게 지정한다.
const plugin: PluginModule = { id: "oh-plugin", server };
export default plugin;
