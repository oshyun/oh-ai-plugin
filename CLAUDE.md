# CLAUDE.md

## 버전 관리

플러그인 수정 후 반드시 버전을 bump한다.

```bash
bash scripts/bump-version.sh
```

- `plugins/oh-dev-guide/.claude-plugin/plugin.json`의 `version` 필드를 현재 시각(`YYYY.MM.DD.HH.MM.SS`)으로 갱신한다.
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
대신 Skill을 on-demand로 로드해 덮어씌운다.

```
/reload-plugins 후, agent에게 아래를 요청:
"oh-dev-guide:workflow-style 스킬을 지금 로드해줘"
"oh-dev-guide:coding-style 스킬을 지금 로드해줘"
```

- Skill 호출분이 컨텍스트에 추가되면 SessionStart 주입분보다 나중에 위치하므로 우선 적용된다.
- 두 스킬 모두 변경했다면 둘 다 로드해야 한다.
