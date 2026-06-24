# oh-plugin

oshyun 개인 AI 에이전트 플러그인.
Claude Code, Cursor 등 superpowers 플러그인 시스템을 지원하는 에이전트 도구에 공통 적용된다.

> 설치 후 새 세션을 열면 SessionStart 훅이 자동 적용된다.

---

## Claude Code

### 설치

```
/plugin marketplace add oshyun/oh-plugin
/plugin install oh-plugin@oshyun
/reload-plugins
```

### 업데이트

```
/plugin marketplace update oshyun
/reload-plugins
/oh-plugin:oh-reload
```

### 삭제

```
/plugin marketplace remove oshyun
/reload-plugins
```

---

## Copilot

### 설치

```
/plugin install oh-plugin@oshyun
/oh-plugin:oh-reload
```

### 업데이트

```
/plugin update oh-plugin
```

> 스킬은 호출 시 최신 파일을 읽는다. 현재 세션에 즉시 반영하려면 이후 `/oh-plugin:oh-reload`를 실행한다.

### 삭제

```
/plugin uninstall oh-plugin
```

---

## 스킬 수동 호출

```
/oh-plugin:oh-coding-style
/oh-plugin:oh-workflow-style
/oh-plugin:oh-reload
```

---

## For Developers

### 구성

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

### 확장 — 스킬/에이전트/훅 추가

- 스킬: `skills/<이름>/SKILL.md`
- 에이전트: `agents/<이름>.md`
- 훅: `hooks/hooks.json`

### 버전 bump 및 배포

플러그인 수정 후 push 전:

```bash
bash scripts/bump-version.sh
```

> 버전이 바뀌지 않으면 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.

