---
name: oh-apply
description: oh-plugin 스킬을 현재 세션에 적용한다. 플러그인 업데이트 후, 또는 스킬을 명시적으로 재적용할 때 실행한다.
---

oh-workflow-style 스킬과 oh-coding-style 스킬을 순서대로 로드하라.
두 스킬 모두 로드 완료되면 아래 두 줄을 출력한다.

```
oh-plugin 스킬 재로드 완료
※ /reload-plugins는 플러그인 캐시만 갱신합니다. 시스템 프롬프트 주입은 세션 재시작 시 적용됩니다.
```
