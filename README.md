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

### 먼저 알아둘 개념

에이전트 도구마다 규칙을 모델에게 전달하는 통로가 세 가지 있다.

- **시스템 프롬프트**: 세션 내내 모델에게 항상 보이는 기본 지침. 여기 들어간 규칙은 별도 동작 없이 항상 적용된다.
- **훅(hook)**: 엔진이 특정 시점(세션 시작 등)에 외부 스크립트를 실행하고, 그 출력을 모델 컨텍스트에 추가하는 장치.
- **스킬(skill)**: 마크다운으로 된 지침 파일. 모델이 필요할 때 읽어서 적용한다. 규칙 전문을 한 번에 다 넣지 않고 필요한 시점에 로드해 컨텍스트를 절약한다.

oh-plugin의 규칙 본문(348줄)은 [content/AGENTS.md](content/AGENTS.md) 한 파일(SSOT)에 있고,
엔진별로 "이 파일을 어떤 통로로 언제 모델 앞에 두느냐"만 다르다. 아래 섹션은 서로 독립적이라
쓰는 엔진 것만 읽으면 된다.

---

## Antigravity (AGY)

### 동작 방식

- AGY는 훅이나 플러그인 코드가 규칙을 주입하는 방식이 아니라,
  플러그인 디렉토리의 표준 파일을 직접 읽는다.
- 설치되면 AGY가 `plugin.json`(이름·버전 메타)을 확인하고,
  루트 `AGENTS.md`(규칙 SSOT)와 `skills/`를 자동으로 로드한다.
- 그래서 별도 훅이나 스킬 호출 없이 새 세션부터 규칙이 적용되며,
  심볼릭 링크 설치라면 파일이 바뀌는 대로 다음 세션에 반영된다.
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

새 세션을 열면 아래 흐름으로 규칙이 적용된다.

1. **세션 시작** → Claude Code가 `hooks/hooks.json`을 읽고 SessionStart 훅을 실행한다.
   세션 시작 외에 `/clear`, 컴팩트 직후에도 다시 실행된다(`matcher: startup|clear|compact`).
2. **훅 스크립트 실행** → `hooks/run-hook.cmd`가 실행돼 `hooks/session-start` bash 스크립트를 호출한다.
   (run-hook.cmd는 Windows cmd와 Unix bash를 겸용하는 wrapper라 OS를 가리지 않는다.)
3. **지시문 출력** → 스크립트는 JSON 한 줄을 출력한다:

   ```
   {"hookSpecificOutput": {"hookEventName": "SessionStart",
    "additionalContext": "[oh-plugin] 이 세션에 oh-plugin이 활성화되어 있습니다.
     코드 작업 전에 oh-plugin:oh-coding-style 스킬을, git 작업 전에
     oh-plugin:oh-workflow-style 스킬을 로드해야 합니다."}}
   ```

4. **컨텍스트 추가** → Claude Code가 `additionalContext` 값을 모델 컨텍스트에 넣는다.
   규칙 전문이 아니라 "어떤 스킬을 언제 읽어라"는 지시문이라는 점이 핵심이다.
5. **스킬 로드** → 모델이 실제로 코드·git 작업을 시작하려는 시점에
   `skills/oh-coding-style/SKILL.md`(150줄), `skills/oh-workflow-style/SKILL.md`(209줄)를 읽는다.
   이때 규칙 본문이 처음으로 컨텍스트에 적재된다.

즉 "훅이 지시문을 심고, 스킬이 본문을 실어 나르는" 2단계 구조다.
규칙 전문을 세션 시작 때 한꺼번에 넣지 않기 때문에, 규칙이 필요 없는 대화에서는 컨텍스트를 소모하지 않는다.

**세션 도중 업데이트를 반영하는 법:**

- `/plugin marketplace update oshyun`이 reload를 해도 갱신되는 건 디스크의 플러그인 파일뿐이다.
  이미 진행 중인 세션의 컨텍스트는 세션이 열렸을 때의 그대로다.
- `/oh-plugin:oh-apply`를 실행하면 모델이 최신 스킬 두 개를 즉시 읽어 현재 세션에 적재한다.
  스킬이 나중에 읽혀 컨텍스트 뒤쪽에 놓이므로 이전 지시문보다 우선 적용된다.
- 세션을 새로 열면 훅이 다시 실행되므로, 새 세션이면 별도 명령 없이 최신 규칙이 적용된다.

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

Claude Code와 같은 훅·스킬 2단계 구조를 쓰되, 훅 출력 형식만 다르다.

1. 세션 시작 시 `hooks/session-start` 스크립트가 실행되는 것까지 Claude Code와 동일하다.
2. 스크립트는 `COPILOT_CLI` 환경변수가 설정돼 있는지로 Copilot 실행 여부를 판별한다.
3. Copilot이면 Claude Code용 형식(`hookSpecificOutput`) 대신,
   Copilot이 요구하는 단순 형식으로 같은 지시문을 출력한다:

   ```
   {"additionalContext": "[oh-plugin] 이 세션에 oh-plugin이 활성화되어 있습니다. ..."}
   ```

4. 이후 흐름은 동일하다 — 모델이 코드·git 작업 전에 두 스킬을 읽고, 규칙이 적용된다.

세션 도중 업데이트를 반영하려면 Claude Code와 마찬가지로 `/oh-plugin:oh-apply`를 실행한다.

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

Claude Code·Copilot의 "훅 → 스킬" 2단계와 달리, opencode는 플러그인이 규칙 전문을 직접 밀어넣는다.

1. **플러그인 로드** → opencode가 시작될 때 설치된 플러그인(`dist/index.js`)을 읽어 들인다.
2. **규칙 사전 적재** → 플러그인 초기화 시점에 `dist/AGENTS.md`(348줄)를 한 번 읽어 메모리에 보관한다.
   이 파일은 빌드 때 `content/AGENTS.md`(SSOT)에서 복사된 것이므로 소스와 항상 같다.
3. **매 요청 주입** → 사용자가 메시지를 보낼 때마다 `experimental.chat.system.transform` 훅이 실행되고,
   플러그인이 그 시점에 시스템 프롬프트 배열 끝에 규칙 전문을 push한다.
4. **중복 방지** → 시스템 프롬프트에 이미 규칙이 있으면(헤더 마커 `Coding & Workflow Style` 검사) 다시 넣지 않는다.

규칙이 시스템 프롬프트에 항상 존재하므로 모델이 스킬을 읽는 단계가 없고,
`/oh-plugin:oh-apply`도 필요 없다. 새 세션, 진행 세션 구분 없이 항상 적용돼 있다.

**TUI 토글과의 연동:**

- `tui.tsx`가 명령 팔레트의 토글 결과를 `~/.config/opencode/oh-plugin.json`에 저장한다.
- server는 3번 단계마다(즉 매 요청마다) 이 파일을 다시 읽는다.
  그래서 토글을 누르는 즉시 다음 요청부터 주입 on/off가 바뀐다.
- 규칙 파일 자체는 빌드 시점에 고정이므로 init에서 1회만 읽고,
  바뀌는 상태(on/off)만 매번 읽는다 — 읽기 비용과 즉시성을 나눈 설계다.

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

