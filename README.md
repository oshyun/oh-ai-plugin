# ai-plugins

oshyun 개인 Claude Code 플러그인 카탈로그(마켓플레이스).

이 레포 하나가 **마켓플레이스 + 플러그인**을 함께 담는다.
원격(GitHub/사내 GHE)에 push해 두면 어느 머신에서든 끌어다 쓴다.

## 구성

```
.claude-plugin/marketplace.json     ← 카탈로그 (name: oshyun)
plugins/
  oh-plugin/                         ← 확장형 개인 플러그인
    .claude-plugin/plugin.json      ← version: YYYY.MM.DD.HH.mm.ss
    skills/
      coding-style/SKILL.md         ← 코드 작성 패턴·리뷰 기준 (글쓰기 스타일 포함)
      workflow-style/SKILL.md       ← git 워크플로우·문서 동기화·에이전트 응답 스타일
scripts/
  bump-version.sh                   ← 버전 현재 시각으로 업데이트
```

플러그인 이름이 스킬 네임스페이스가 된다 → 스킬 호출 예: `oh-plugin:workflow-style`.

## 설치 (각 머신에서 한 번)

원격에 push한 뒤:

```
/plugin marketplace add oshyun/ai-plugins              # GitHub 단축형
# 또는
/plugin marketplace add https://<host>/oshyun/ai-plugins.git
/plugin install oh-plugin@oshyun
```

업데이트(새 커밋 push 후):

```bash
./scripts/bump-version.sh           # plugin.json version 갱신 (push 전)
# push 후:
/plugin marketplace update oshyun   # GitHub fetch + 캐시 업데이트
/reload-plugins                      # 현재 세션에 반영
```

> `plugin.json`의 `version` 필드(YYYY.MM.DD.HH.mm.ss)가 캐시 디렉토리 이름이 된다.
> 버전이 바뀌지 않으면 `marketplace update`가 캐시를 교체하지 않으므로 push 전에 반드시 bump한다.

## 로컬에서 테스트 (push 전)

```
/plugin marketplace add /home1/irteam/users/sh/repos/ai-plugins
/plugin install oh-plugin@oshyun
/reload-plugins
```

## 검증

```
claude plugin validate ./plugins/oh-plugin
```

## 확장 — 스킬/커맨드/에이전트 추가

`oh-plugin` 플러그인은 확장형이다. 새 컴포넌트는 플러그인 루트에 추가한다.

- 스킬: `plugins/oh-plugin/skills/<이름>/SKILL.md`
- 커맨드: `plugins/oh-plugin/commands/<이름>.md`
- 에이전트: `plugins/oh-plugin/agents/<이름>.md`
- 훅: `plugins/oh-plugin/hooks/hooks.json`

별도 성격의 묶음이면 `plugins/`에 새 플러그인 디렉토리를 만들고 `marketplace.json`의 `plugins` 배열에 한 줄 추가한다.
