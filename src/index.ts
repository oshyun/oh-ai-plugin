import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Plugin, PluginModule } from "@opencode-ai/plugin";
import { readState } from "./state";

// 빌드 시 skills/ 의 SKILL.md 들을 결합해 dist/ 에 생성하는 규칙 파일.
// 진입점이 dist/index.js 이므로 같은 디렉토리의 ./AGENTS.md 를 가리킨다.
//
// [설계 판단 근거: 전문 직접 주입 vs 스킬 지연 적재]
// opencode는 스킬과 플러그인이 분리되어 있어, @opencode-ai/plugin API로는 번들 내부의
// skills/ 를 opencode의 스킬 카탈로그에 등록할 수 없다. 모델에게 스킬 로드 지시문만 넣으면
// 스킬 경로를 참조하지 못하므로, 플러그인 단일 설치로 안정적인 동작을 보장하기 위해
// 시스템 프롬프트 변환 훅을 통해 AGENTS.md 전문을 직접 주입한다.
const RULES_FILE = fileURLToPath(new URL("./AGENTS.md", import.meta.url));

// 규칙 파일이 이미 시스템 프롬프트에 들어갔는지 판별하는 헤더 마커.
const RULES_HEADER = "Coding & Workflow Style";

const server: Plugin = async () => {
  // 규칙 파일은 빌드 시점 상수라 init 시 1회 읽는다(매 요청마다 다시 읽지 않는다).
  const rules = readFileSync(RULES_FILE, "utf8");

  return {
    "experimental.chat.system.transform": async (_input, output) => {
      // on/off는 TUI에서 수시로 바뀌는 런타임 상태이므로 매 호출 시점에 읽어
      // 토글을 즉시 반영한다. (캐시에 의존하면 미드세션 토글이 반영되지 않는다)
      if (!readState().enabled) {
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
const plugin: PluginModule = { id: "oh-ai-plugin", server };
export default plugin;
