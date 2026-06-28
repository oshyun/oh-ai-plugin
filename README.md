# oh-plugin

oshyun 개인 AI 에이전트 플러그인.
Claude Code, Cursor 등 superpowers 플러그인 시스템을 지원하는 에이전트 도구에 공통 적용된다.

> 설치 후 새 세션을 열면 SessionStart 훅이 규칙을 시스템 프롬프트에 자동 주입한다.
> `/oh-plugin:oh-apply`는 현재 세션에 스킬을 즉시 강제 적용한다. 새 세션이 더 효과적이다.

---

## Claude Code

### 설치

```
/plugin marketplace add oshyun/oh-plugin
/plugin install oh-plugin@oshyun
/oh-plugin:oh-apply
```

### 업데이트

```
/plugin marketplace update oshyun
/oh-plugin:oh-apply
```

### 삭제

```
/plugin marketplace remove oshyun
```

---

## Copilot

### 설치

```
/plugin install oh-plugin@oshyun
/oh-plugin:oh-apply
```

### 업데이트

```
/plugin update oh-plugin
/oh-plugin:oh-apply
```

### 삭제

```
/plugin uninstall oh-plugin
```

---

## 스킬 수동 호출

```
/oh-plugin:oh-coding-style
/oh-plugin:oh-workflow-style
/oh-plugin:oh-apply
```

---

## For Developers

### 구성

```
.claude-plugin/plugin.json          ← 플러그인 메타 (version: YYYY.MM.DD.HH.mm.ss)
skills/
  oh-coding-style/SKILL.md          ← 코드 작성 패턴·리뷰 기준
  oh-workflow-style/SKILL.md        ← git 워크플로우·에이전트 응답 스타일
  oh-apply/SKILL.md                ← 현재 세션에 스킬 강제 적용
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

