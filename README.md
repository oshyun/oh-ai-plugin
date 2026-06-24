# oh-plugin

oshyun 개인 AI 에이전트 플러그인.
Claude Code, Cursor 등 superpowers 플러그인 시스템을 지원하는 에이전트 도구에 공통 적용된다.

## 구성

```
.claude-plugin/plugin.json          ← 플러그인 메타 (version: YYYY.MM.DD.HH.mm.ss)
skills/
  oh-coding-style/SKILL.md          ← 코드 작성 패턴·리뷰 기준
  oh-workflow-style/SKILL.md        ← git 워크플로우·에이전트 응답 스타일
  oh-reload/SKILL.md                ← 세션 내 스킬 즉시 재로드
hooks/                              ← SessionStart 등 훅
scripts/
  bump-version.sh                   ← 버전 현재 시각으로 업데이트
```

스킬 호출 예: `/oh-coding-style`, `/oh-workflow-style`, `/oh-reload`

## 설치 (각 머신에서 한 번)

### Claude Code

```
/plugin marketplace add oshyun/oh-plugin
/plugin install oh-plugin@oshyun
/reload-plugins
```

### Copilot

```
/plugin install oh-plugin@oshyun
/reload-plugins
```

> Copilot은 marketplace 등록 없이 바로 install 가능하다.

## 업데이트 (새 커밋 push 후)

```bash
bash scripts/bump-version.sh   # push 전 버전 bump
# push 후:
/plugin marketplace update oshyun
/reload-plugins
```

> `plugin.json`의 `version` 필드가 캐시 디렉토리 이름이 된다.
> 버전이 바뀌지 않으면 업데이트가 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.

## 이미 열린 세션에서 즉시 반영

```
/plugin marketplace update oshyun
/reload-plugins
/oh-reload
```

## 확장 — 스킬/에이전트/훅 추가

- 스킬: `skills/<이름>/SKILL.md`
- 에이전트: `agents/<이름>.md`
- 훅: `hooks/hooks.json`
