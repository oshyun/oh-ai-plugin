import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

// oh-plugin 상태(on/off)를 TUI와 server가 공유하기 위한 단일 파일 규약.
// opencode는 api.kv가 TUI 전용이라 server가 못 읽으므로, 공용 JSON 파일로 전달한다.
// server: init 시 readState().enabled 로 주입 여부 판단
// tui:    토글/표시 시 readState()/writeState() 사용

export type OhPluginState = {
  enabled: boolean;
};

export const DEFAULT_STATE: OhPluginState = { enabled: true };

// opencode가 사용하는 설정 디렉토리와 동일하게 XDG_CONFIG_HOME 반영.
function configRoot(): string {
  return process.env.XDG_CONFIG_HOME
    ? join(process.env.XDG_CONFIG_HOME, "opencode")
    : join(homedir(), ".config", "opencode");
}

export const STATE_FILE = join(configRoot(), "oh-plugin.json");

// 매번 파일에서 읽는다. on/off는 TUI에서 수시로 바뀌는 런타임 상태이므로,
// server가 매 시스템 프롬프트 구성 시점에 최신 값을 반영해야 해서 캐시하지 않는다.
// 상태 파일은 2바이트 수준의 작은 JSON이라 디스크 읽기 비용은 무시할 수 있다.
export function readState(): OhPluginState {
  try {
    const raw = readFileSync(STATE_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { enabled?: unknown }).enabled === "boolean"
    ) {
      return { enabled: (parsed as { enabled: boolean }).enabled };
    }
  } catch {
    // 파일 없음 또는 손상 → 기본값
  }
  return { ...DEFAULT_STATE };
}

export function writeState(state: OhPluginState): void {
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(
    STATE_FILE,
    JSON.stringify({ enabled: state.enabled }, null, 2) + "\n",
    "utf8",
  );
}
