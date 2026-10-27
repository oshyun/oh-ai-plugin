# oh-ai-plugin 개발 가이드

## 스킬 로드

코드 작업(작성·수정·리뷰·리팩토링) 전 oh-ai-plugin:ohai-coding-style 스킬을 로드한다.
git 작업(브랜치·커밋·머지·push)·첫 편집 전 oh-ai-plugin:ohai-workflow-style 스킬을 로드한다.

## 규칙 수정

규칙 SSOT는 `skills/ohai-coding-style/SKILL.md`, `skills/ohai-workflow-style/SKILL.md`다.
SKILL.md를 수정하면 빌드해서 opencode용 `dist/AGENTS.md`를 다시 생성하고 같은 커밋에 포함한다.

```bash
npm ci && npm run build:dist
```

## 버전 관리

플러그인 수정 후 반드시 버전을 bump한다.

```bash
bash scripts/bump-version.sh
```

- `package.json`의 semver patch를 1 올리고(예: `1.0.22` -> `1.0.23`), 같은 값을 아래 4개 파일에 기록한다.
  - `plugin.json`, `.claude-plugin/plugin.json`, `package.json`, `package-lock.json`
- **수동으로 version 필드를 편집하지 않는다.** 항상 스크립트를 사용한다.
- bump 후 위 4개 파일을 같은 커밋에 포함한다.

> 버전이 바뀌지 않으면 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.

## 플러그인 업데이트 (push 후 세션 반영)

플러그인 업데이트 후 변경된 규칙은 **새 세션을 시작하거나 세션을 재시작**하면 자동 반영된다.

**Claude Code:**

```
/plugin marketplace update oshyun
```
- `/plugin marketplace update oshyun`은 갱신 후 플러그인을 자동 reload한다. 새 세션부터 최신 규칙이 적용된다.

**Copilot:**

```
/plugin update oh-ai-plugin
```
- 업데이트 후 새 세션을 시작한다.

**opencode:**

```
/plugin update oh-ai-plugin
```
- opencode는 플러그인이 매 요청마다 시스템 프롬프트에 규칙을 직접 주입하므로 별도 적용 명령이 불필요하다.

**Antigravity (AGY):**

```bash
git -C ~/.gemini/config/plugins/oh-ai-plugin pull
```
- pull 후 새 세션을 시작하면 최신 스킬이 자동 로드된다.
