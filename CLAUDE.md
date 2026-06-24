# CLAUDE.md

@AGENTS.md

## 플러그인 업데이트 (push 후 세션 반영)

```
/plugin marketplace update oshyun
/reload-plugins
/oh-plugin:oh-reload
```

- `/oh-plugin:oh-reload`가 oh-workflow-style과 oh-coding-style을 순서대로 로드한다.
- Skill 호출분이 컨텍스트에 추가되면 SessionStart 주입분보다 나중에 위치하므로 우선 적용된다.
