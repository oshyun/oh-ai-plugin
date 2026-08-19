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

// TUI 배지 렌더는 렌더마다 호출되므로 디스크 I/O를 반복하지 않도록,
// 읽은 값은 캐시하고 writeState() 시점에만 갱신한다. server는 init에서 1회만
// 읽으므로 캐시와 무관하다.
let readCache: OhPluginState | undefined;

export function readState(): OhPluginState {
  if (readCache) {
    return readCache;
  }
  try {
    const raw = readFileSync(STATE_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { enabled?: unknown }).enabled === "boolean"
    ) {
      readCache = { enabled: (parsed as { enabled: boolean }).enabled };
      return readCache;
    }
  } catch {
    // 파일 없음 또는 손상 → 기본값
  }
  readCache = { ...DEFAULT_STATE };
  return readCache;
}

export function writeState(state: OhPluginState): void {
  readCache = { ...state };
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(
    STATE_FILE,
    JSON.stringify({ enabled: state.enabled }, null, 2) + "\n",
    "utf8",
  );
}
