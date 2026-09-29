# oh-plugin

oshyun 개인 AI 에이전트 플러그인.
Claude Code, Copilot, opencode, Antigravity 등 에이전트 도구에 공통 적용된다.

규칙 본문은 [AGENTS.md](AGENTS.md)(oh-coding-style + oh-workflow-style 결합 단일 SSOT)이며,
엔진마다 이를 세션에 반영하는 방식이 다르다.

| 엔진 | 주입 방식 | 적용 시점 |
|------|-----------|-----------|
| Claude Code | SessionStart 훅이 스킬 로드를 지시 → 스킬이 규칙 적재 | 새 세션 자동 / 진행 세션은 `/oh-plugin:oh-apply` |
| Copilot | Claude Code와 동일한 훅, Copilot용 출력 형식 | 새 세션 자동 / 진행 세션은 `/oh-plugin:oh-apply` |
| opencode | 플러그인이 매 요청마다 시스템 프롬프트에 규칙 전문 직접 주입 | 새 세션 자동 / TUI 토글로 on/off |
| Antigravity | `plugin.json` + `AGENTS.md`를 AGY가 자동 로드 | 새 세션 자동 |

---

## Antigravity (AGY)

### 동작 방식

- `plugin.json`(플러그인 메타)과 루트 `AGENTS.md`(규칙 SSOT) 구조를 AGY가 읽어
  규칙과 스킬(`skills/`)을 자동으로 로드한다.
- 별도 훅이나 스킬 호출 없이 새 세션부터 규칙이 적용된다.
- 플러그인은 설치 후 기본 활성화되며, `agy plugin enable oh-plugin` / `disable`로 제어한다.

### 설치

**Git URL 설치 (권장):**
```bash
agy plugin install https://github.com/oshyun/oh-plugin.git
```

**로컬 심볼릭 링크:**
```bash
mkdir -p ~/.gemini/config/plugins
ln -s ~/repos/oh-plugin ~/.gemini/config/plugins/oh-plugin
```

심볼릭 링크로 설치한 경우 로컬 저장소에서 `git pull`만 하면 다음 세션부터 반영된다.

---

## Claude Code

### 동작 방식

- SessionStart 훅(`hooks/hooks.json` — 세션 시작·clear·compact 시점)이
  "코드/git 작업 전에 oh-coding-style·oh-workflow-style 스킬을 로드하라"는 지시문을 컨텍스트에 추가한다.
- 규칙 본문은 스킬 파일(`skills/oh-coding-style`, `skills/oh-workflow-style`)이 담고 있고,
  Claude가 지시문을 보고 작업 전에 스킬을 읽는 2단계 구조다.
- 따라서 규칙은 **새 세션부터 자동 적용**된다.
- 세션 도중 플러그인을 업데이트하면 reload가 스킬·훅 정의를 갱신하지만
  이미 진행 중인 세션의 컨텍스트는 그대로다. 이때 `/oh-plugin:oh-apply`를 실행하면
  최신 스킬을 현재 세션에 즉시 적재할 수 있다.
  적재된 스킬은 SessionStart 지시문보다 컨텍스트 뒤에 위치하므로 우선 적용된다.

### 설치

```
/plugin marketplace add oshyun/oh-plugin
/plugin install oh-plugin@oshyun
/oh-plugin:oh-apply
```

### 업데이트

`/plugin marketplace update oshyun`은 갱신 후 플러그인을 자동 reload한다.
진행 중인 세션에 새 규칙을 즉시 반영하려면 `/oh-plugin:oh-apply`를 실행한다.
세션을 새로 열면 훅 주입부터 최신 상태가 적용된다.

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

### 동작 방식

- Claude Code와 동일한 SessionStart 훅 구조를 쓴다.
  훅 스크립트(`hooks/session-start`)는 `COPILOT_CLI` 환경변수로 Copilot 여부를 감지해,
  Copilot이 요구하는 형식(`additionalContext`)으로 같은 지시문을 출력한다.
- 규칙 본문은 스킬이 담고 있으며, **새 세션부터 자동 적용**된다.
- 세션 도중 업데이트를 반영하려면 `/oh-plugin:oh-apply`를 실행한다.

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

### 동작 방식

- 플러그인 server(`src/index.ts`)가 `experimental.chat.system.transform` 훅으로
  **매 요청마다** 시스템 프롬프트에 규칙 전문을 직접 push한다.
  규칙 본문은 빌드 시점에 `content/AGENTS.md`가 `dist/AGENTS.md`로 번들된 것이다.
- 스킬 로드라는 2단계를 거치지 않고 규칙이 항상 시스템 프롬프트에 존재하므로
  `/oh-plugin:oh-apply`가 필요 없다.
- 이미 규칙이 주입돼 있으면 헤더 마커(`Coding & Workflow Style`)로 중복 주입을 막는다.
- TUI에서 규칙 주입을 즉시 on/off할 수 있다(아래 토글 참고).
  on/off 상태를 매 요청 시점에 읽으므로 토글이 즉시 반영된다.

### 설치

```bash
opencode plugin github:oshyun/oh-plugin --global
```

`--global`은 `~/.config/opencode/opencode.json`의 `plugin[]`에 추가하고 설치한다.
opencode를 다시 시작하면 새 세션부터 규칙이 적용된다.

### 업데이트

저장소가 업데이트된 경우, 동일한 명령어를 `--force`와 함께 실행하여 다시 설치한다.
설치만으로는 진행 세션에 반영되지 않으므로 opencode를 재시작해 새 세션을 연다.

```bash
opencode plugin github:oshyun/oh-plugin --global --force
```

### 삭제

`opencode.json`의 `plugin[]`에서 `github:oshyun/oh-plugin` 항목을 제거한다.

### TUI 규칙 주입 on/off 토글

플러그인은 server(주입) + tui(제어)로 구성된다. opencode TUI에서
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
plugin.json                         ← AGY 플러그인 메타 (version: semver 1.0.x)
.claude-plugin/plugin.json          ← Claude 플러그인 메타 (version: semver 1.0.x)
AGENTS.md                           ← 규칙 SSOT (coding + workflow 결합 단일 파일)
.agents/rules/oh-plugin-dev.md      ← oh-plugin 자체 개발용 가이드
package.json                        ← opencode 플러그인 설정
src/
  index.ts                          ← 시스템 프롬프트 훅으로 AGENTS.md 번들 주입 (server)
  tui.tsx                           ← TUI on/off 토글·상태바 배지 (소스 그대로 게시, 번들 제외)
  state.ts                          ← on/off 상태 파일 공유 (server·tui 공용)
dist/                               ← 빌드 산출물 (AGENTS.md 복사본 포함, git 추적)
skills/
  oh-coding-style/SKILL.md          ← 코드 작성 패턴·리뷰 기준
  oh-workflow-style/SKILL.md        ← git 워크플로우·에이전트 응답 스타일
  oh-apply/SKILL.md                 ← 현재 세션에 스킬 강제 적용
  simplify/SKILL.md                 ← 코드 변경 전 단순화 및 정제 검토
  code-review/SKILL.md              ← 머지 전 엣지 케이스 및 품질 최종 검토
hooks/                              ← SessionStart 등 훅
scripts/
  bump-version.sh                   ← semver patch 자동 증가 (여러 버전 필드 동기화)
```

### 확장 — 스킬/에이전트/훅 추가

- 스킬: `skills/<이름>/SKILL.md`
- 에이전트: `agents/<이름>.md`
- 훅: `hooks/hooks.json`

### 버전 bump

플러그인 수정 후 push 전에 semver patch를 자동 증가시킨다.
`bump-version.sh`는 `.claude-plugin/plugin.json`과 `package.json`의
버전 필드를 함께 올린다. (`1.0.0` → `1.0.1`)

```bash
bash scripts/bump-version.sh
```

> 버전이 바뀌지 않으면 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.

