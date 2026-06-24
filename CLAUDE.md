# CLAUDE.md

## 버전 관리

플러그인 수정 후 반드시 버전을 bump한다.

```bash
bash scripts/bump-version.sh
```

- `plugins/oh-plugin/.claude-plugin/plugin.json`의 `version` 필드를 현재 시각(`YYYY.MM.DD.HH.MM.SS`)으로 갱신한다.
- **수동으로 version 필드를 편집하지 않는다.** 항상 스크립트를 사용한다.
- bump 후 `plugin.json`을 같은 커밋에 포함한다.

## 플러그인 업데이트 (push 후 세션 반영)

```
/plugin marketplace update oshyun
/reload-plugins
```

- `/plugin` 단독이나 축약 표현은 틀리다. 위 두 줄을 정확히 안내한다.

### 이미 열린 세션에서 즉시 반영하려면

SessionStart hook으로 주입된 규칙은 세션 재시작 없이 교체할 수 없다.
대신 `reload` 커맨드로 두 스킬을 한 번에 재로드한다.

```
/reload-plugins
/oh-reload
```

- `/oh-plugin:reload`가 workflow-style과 coding-style을 순서대로 로드한다.
- Skill 호출분이 컨텍스트에 추가되면 SessionStart 주입분보다 나중에 위치하므로 우선 적용된다.
