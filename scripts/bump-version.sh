#!/usr/bin/env bash
# 플러그인 버전을 semver patch 자동 증가로 업데이트 (예: 1.0.0 -> 1.0.1)
# canonical source는 opencode-plugin/package.json 이다.
# 이 값을 3개 파일(_version 필드의 단일 출처로)에 동일하게 기록한다:
#   - .claude-plugin/plugin.json            (.version)
#   - opencode-plugin/package.json          (.version)
#   - opencode-plugin/package-lock.json     (루트 .version + .packages[""].version)
# 버전이 유효 semver(MAJOR.MINOR.PATCH)가 아니면 1.0.0으로 초기화한다.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACKAGE_JSON="$ROOT/opencode-plugin/package.json"
LOCK_JSON="$ROOT/opencode-plugin/package-lock.json"
PLUGIN_JSON="$ROOT/.claude-plugin/plugin.json"

# 유효 semver(MAJOR.MINOR.PATCH)면 patch를 1 올려 반환, 아니면 "1.0.0" 반환
bump() {
  local v="$1"
  if [[ "$v" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    echo "${BASH_REMATCH[1]}.${BASH_REMATCH[2]}.$(( ${BASH_REMATCH[3]} + 1 ))"
  else
    echo "1.0.0"
  fi
}

# canonical: package.json에서 현재 버전을 읽는다
current="$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$PACKAGE_JSON" | head -1)"
new="$(bump "$current")"
echo "package.json: $current -> $new"

if command -v jq &>/dev/null; then
  # plugin.json, package.json: .version
  for file in "$PLUGIN_JSON" "$PACKAGE_JSON"; do
    tmp="$(mktemp)"
    jq --arg v "$new" '.version = $v' "$file" > "$tmp"
    mv "$tmp" "$file"
  done
  # package-lock.json: 루트 .version + .packages[""].version
  tmp="$(mktemp)"
  jq --arg v "$new" '.version = $v | .packages[""].version = $v' "$LOCK_JSON" > "$tmp"
  mv "$tmp" "$LOCK_JSON"
else
  # sed fallback: 루트 version 교체 (lockfile은 루트+packages 두 지점이라 jq 권장)
  sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$new\"/" "$PLUGIN_JSON" "$PACKAGE_JSON"
fi
