#!/usr/bin/env bash
# 플러그인 버전을 현재 YMD시분초로 업데이트
set -euo pipefail

PLUGIN_JSON="$(dirname "$0")/../plugins/oh-plugin/.claude-plugin/plugin.json"
NEW_VERSION="$(date +%Y.%m.%d.%H.%M.%S)"

# jq 있으면 사용, 없으면 sed fallback
if command -v jq &>/dev/null; then
  tmp="$(mktemp)"
  jq --arg v "$NEW_VERSION" '.version = $v' "$PLUGIN_JSON" > "$tmp"
  mv "$tmp" "$PLUGIN_JSON"
else
  sed -i "s/\"version\": \"[0-9]*\"/\"version\": \"$NEW_VERSION\"/" "$PLUGIN_JSON"
fi

echo "Bumped to $NEW_VERSION"
