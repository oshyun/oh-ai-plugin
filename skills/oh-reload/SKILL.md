---
name: oh-reload
description: oh-plugin 스킬을 현재 세션에 즉시 재로드한다. 플러그인 업데이트 후 실행한다.
---

oh-workflow-style 스킬과 oh-coding-style 스킬을 순서대로 로드하라.
두 스킬 모두 로드 완료되면 아래를 출력한다.

1. `oh-plugin 스킬 재로드 완료`
2. 현재 실행 중인 CLI를 감지해 해당하는 업데이트 안내를 출력한다.
   - **Copilot CLI**인 경우:
     ```
     ※ 세션을 재시작하면 더 효과적입니다. 업데이트 후 반영하려면:
       /plugin update oh-plugin
     ```
   - **Claude Code**인 경우:
     ```
     ※ 세션을 재시작하면 더 효과적입니다. 업데이트 후 반영하려면:
       /plugin marketplace update oshyun
       /reload-plugins
     ```
