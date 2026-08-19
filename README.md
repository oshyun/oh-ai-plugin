# oh-plugin

oshyun 개인 AI 에이전트 플러그인.
Claude Code, Cursor, opencode 등 에이전트 도구에 공통 적용된다.

> Claude Code / Copilot: 설치 후 새 세션을 열면 SessionStart 훅이 규칙을 시스템 프롬프트에 자동 주입한다. `/oh-plugin:oh-apply`는 현재 세션에 스킬을 즉시 강제 적용한다. 새 세션이 더 효과적다.
>
> opencode: npm 플러그인(`@oshyun/oh-plugin`)이 시스템 프롬프트 훅으로 규칙을 주입한다. 설치·업데이트·삭제를 npm으로 관리한다.

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

## opencode

opencode는 npm 플러그인(`@oshyun/oh-plugin`)으로 규칙을 시스템 프롬프트에 주입한다.
[opencode/AGENTS.md](opencode/AGENTS.md)가 oh-coding-style + oh-workflow-style을 결합한 단일
SSOT이고, 플러그인이 이를 빌드 타임에 번들해 훅으로 주입한다.

### 설치

```bash
opencode plugin @oshyun/oh-plugin@latest --global
```

`--global`은 `~/.config/opencode/opencode.json`의 `plugin[]`에 추가하고 npm에서 설치한다.
opencode를 다시 시작하면 새 세션부터 규칙이 적용된다.

### 업데이트

버전을 올린 뒤 npm에 배포되면, `--force`로 최신 버전을 다시 설치한다.

```bash
opencode plugin @oshyun/oh-plugin@latest --global --force
```

### 삭제

`opencode.json`의 `plugin[]`에서 `@oshyun/oh-plugin` 항목을 제거한다.

### TUI 규칙 주입 on/off 토글

`@oshyun/oh-plugin`은 server(주입) + tui(제어)로 구성된다. opencode TUI에서
플러그인의 on/off를 즉시 토글할 수 있다.

- **명령 팔레트**: `oh-plugin: 규칙 주입 켜기/끄기 토글` 실행
- **상태바 배지**: 사이드바 하단에 `[oh-plugin ON]` / `[oh-plugin OFF]` 표시

on/off 상태는 `~/.config/opencode/oh-plugin.json`(`{ "enabled": boolean }`)에 저장되며,
server가 매 시스템 프롬프트 구성 시점에 이 값을 읽어 **토글 즉시 반영**한다.

- **on** → 시스템 프롬프트에 규칙 주입
- **off** → 시스템 프롬프트에 규칙 주입 안 함 (기본값: on)

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
.claude-plugin/plugin.json          ← Claude 플러그인 메타 (version: semver 1.0.x)
opencode/
  AGENTS.md                         ← 규칙 SSOT (coding + workflow 결합 단일 파일)
opencode-plugin/                    ← opencode npm 플러그인 (@oshyun/oh-plugin)
  src/index.ts                      ← 시스템 프롬프트 훅으로 AGENTS.md 번들 주입 (server)
  src/tui.tsx                       ← TUI on/off 토글·상태바 배지 (소스 그대로 게시, 번들 제외)
  src/state.ts                      ← on/off 상태 파일 공유 (server·tui 공용)
  dist/                             ← 빌드 산출물 (AGENTS.md 복사본 포함, git 제외)
skills/
  oh-coding-style/SKILL.md          ← 코드 작성 패턴·리뷰 기준
  oh-workflow-style/SKILL.md        ← git 워크플로우·에이전트 응답 스타일
  oh-apply/SKILL.md                ← 현재 세션에 스킬 강제 적용
hooks/                              ← SessionStart 등 훅
scripts/
  bump-version.sh                   ← semver patch 자동 증가 (두 버전 필드 동기화)
```

### 확장 — 스킬/에이전트/훅 추가

- 스킬: `skills/<이름>/SKILL.md`
- 에이전트: `agents/<이름>.md`
- 훅: `hooks/hooks.json`

### 버전 bump 및 배포

플러그인 수정 후 push 전에 semver patch를 자동 증가시킨다.
`bump-version.sh`는 `.claude-plugin/plugin.json`과 `opencode-plugin/package.json`의
버전 필드를 함께 올린다. (`1.0.0` → `1.0.1`)

```bash
bash scripts/bump-version.sh
```

> 버전이 바뀌지 않으면 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.

opencode npm 플러그인을 배포할 때는 버전 bump 후 빌드·publish한다.

```bash
cd opencode-plugin
npm run build
npm publish --access public
```

