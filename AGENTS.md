# oh-ai-plugin 개발 가이드

## 스킬 로드

코드 작업(작성·수정·리뷰·리팩토링) 전 oh-ai-plugin:ohai-coding-style 스킬을 로드한다.
git 작업(브랜치·커밋·머지·push)·첫 편집 전 oh-ai-plugin:ohai-workflow-style 스킬을 로드한다.

## 버전 관리

플러그인 수정 후 반드시 버전을 bump한다.

```bash
bash scripts/bump-version.sh
```

- `.claude-plugin/plugin.json`의 `version` 필드를 현재 시각(`YYYY.MM.DD.HH.mm.ss`)으로 갱신한다.
- **수동으로 version 필드를 편집하지 않는다.** 항상 스크립트를 사용한다.
- bump 후 `plugin.json`을 같은 커밋에 포함한다.

> 버전이 바뀌지 않으면 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.

## 플러그인 업데이트 (push 후 세션 반영)

**Claude Code:**

```
/plugin marketplace update oshyun
/oh-ai-plugin:ohai-apply
```

`/plugin marketplace update oshyun`은 갱신 후 플러그인을 자동 reload하므로 별도 reload 명령이 필요 없다.

**Copilot:**

```
/plugin update oh-ai-plugin
/oh-ai-plugin:ohai-apply
```

**opencode:**

```
/plugin update oh-ai-plugin
```

- `/oh-ai-plugin:ohai-apply`는 ohai-workflow-style과 ohai-coding-style을 현재 세션에 즉시 강제 적용한다.
- Skill 호출분이 컨텍스트에 추가되면 SessionStart 주입분보다 나중에 위치하므로 우선 적용된다.
- opencode는 `instructions` 필드로 항상 주입되므로 별도 적용 명령이 불필요하다.
